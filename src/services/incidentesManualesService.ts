import apiClient from '@/lib/api/client';
import type { components } from '@/types/api-generated';
import {
  TIPOS_AFECTACION_FALLBACK,
  DEFAULT_CALLCENTER_OPERADOR_ID,
  type DuplicadoItem,
  type IncidenteCreadoExito,
} from '@/types/incidente-manual';

export type CrearIncidenteManualPayload = components['schemas']['CrearIncidenteManualInput'];
export type VerificarDuplicadoPayload = components['schemas']['VerificarDuplicadoInput'];

type GenericRecord = Record<string, unknown>;

export type ResultadoCreacionManual =
  | {
      tipo: 'EXITO';
      datos: IncidenteCreadoExito;
      mensaje: string;
    }
  | {
      tipo: 'DUPLICADO';
      coincidencias: DuplicadoItem[];
      mensaje: string;
    }
  | {
      tipo: 'ERROR_VALIDACION';
      errores: string[];
      mensaje: string;
    }
  | {
      tipo: 'NO_AUTORIZADO';
      mensaje: string;
    }
  | {
      tipo: 'ERROR_CONEXION';
      mensaje: string;
    };

/**
 * Obtiene el catálogo dinámico de tipos de afectación desde sgrai-api.
 * Si la API falla, retorna el listado institucional por defecto de Valdivia.
 */
export async function obtenerTiposAfectacion(): Promise<string[]> {
  try {
    const { data, error } = await apiClient.GET('/api/incidentes/tipos');
    if (error || !data?.data || !Array.isArray(data.data) || data.data.length === 0) {
      return TIPOS_AFECTACION_FALLBACK;
    }
    return data.data;
  } catch {
    return TIPOS_AFECTACION_FALLBACK;
  }
}

/**
 * Consulta a la API para verificar si existen incidentes o reportes duplicados
 * dentro de un radio geográfico y ventana de tiempo reciente.
 */
export async function verificarDuplicado(
  payload: VerificarDuplicadoPayload,
  operadorId: string = DEFAULT_CALLCENTER_OPERADOR_ID
): Promise<{ hayDuplicados: boolean; coincidencias: DuplicadoItem[] }> {
  try {
    const { data, error, response } = await apiClient.POST('/api/incidentes/verificar-duplicado', {
      params: {
        header: {
          'x-user-id': operadorId,
        },
      },
      body: payload,
    });

    if (error || !response.ok || !data) {
      return { hayDuplicados: false, coincidencias: [] };
    }

    const resData = (data as GenericRecord)?.data ?? data;
    const coincidenciasRaw =
      (resData as GenericRecord)?.coincidencias ?? (Array.isArray(resData) ? resData : []);

    const coincidencias: DuplicadoItem[] = (
      Array.isArray(coincidenciasRaw) ? coincidenciasRaw : []
    ).map((rawItem: unknown, idx: number) => {
      const item = rawItem as GenericRecord;
      return {
        id: (item?.id as string) || (item?.incidente_id as string) || (item?.aviso_id as string) || `dup-${idx}`,
        codigo:
          (item?.codigo as string) ||
          (item?.codigoSeguimiento as string) ||
          (item?.codigo_seguimiento as string) ||
          (item?.codigoIncidente as string) ||
          (item?.codigo_incidente as string) ||
          'S/C',
        tipoAfectacion:
          (item?.tipoAfectacion as string) ||
          (item?.tipo_afectacion as string) ||
          (item?.tipo as string) ||
          'No especificado',
        direccion: (item?.direccion as string) || (item?.ubicacion as string) || 'Sin dirección',
        estado: (item?.estado as string) || (item?.estadoIncidente as string) || 'REPORTADO',
        distanciaMetros: Number(
          item?.distanciaMetros ?? item?.distancia_metros ?? item?.distancia ?? 0
        ),
        creadoEn:
          (item?.creadoEn as string) ||
          (item?.creado_en as string) ||
          (item?.createdAt as string) ||
          new Date().toISOString(),
        origen: item?.origen === 'aviso' ? 'aviso' : 'incidente',
      };
    });

    return {
      hayDuplicados: Boolean(
        (resData as GenericRecord)?.hayDuplicados ?? (coincidencias.length > 0)
      ),
      coincidencias,
    };
  } catch {
    return { hayDuplicados: false, coincidencias: [] };
  }
}

/**
 * Envía el formulario de ingreso manual para creación y autoverificación implícita
 * de un incidente municipal (promovido a SIN_ATENDER).
 */
export async function crearIncidenteManual(
  payload: CrearIncidenteManualPayload,
  operadorId: string = DEFAULT_CALLCENTER_OPERADOR_ID
): Promise<ResultadoCreacionManual> {
  try {
    const { data, error, response } = await apiClient.POST('/api/incidentes/manual', {
      params: {
        header: {
          'x-user-id': operadorId,
        },
      },
      body: payload,
    });

    // Manejar 201 Created (o 200 OK) sin asumir estructura rígida del body
    if ((response.status === 201 || response.status === 200 || response.ok) && !error) {
      const rawData = data as GenericRecord;
      const innerData = (rawData?.data as GenericRecord) ?? rawData;
      const incidente = (innerData?.incidente as GenericRecord) ?? (innerData?.codigo ? innerData : null);
      const aviso = (innerData?.aviso as GenericRecord) ?? (innerData?.codigoSeguimiento ? innerData : null);

      const codigoIncidente =
        (incidente?.codigo as string) ||
        (incidente?.codigoIncidente as string) ||
        (incidente?.id as string) ||
        (innerData?.codigo as string) ||
        'INC-REGISTRADO';

      const codigoAviso =
        (aviso?.codigoSeguimiento as string) ||
        (aviso?.codigo as string) ||
        (incidente?.codigoSeguimiento as string) ||
        (innerData?.codigoSeguimiento as string) ||
        codigoIncidente;

      return {
        tipo: 'EXITO',
        datos: {
          codigoIncidente,
          codigoAviso,
          tipoAfectacion:
            (incidente?.tipoAfectacion as string) || (innerData?.tipoAfectacion as string) || payload.tipoAfectacion,
          direccion: (incidente?.direccion as string) || (innerData?.direccion as string) || payload.direccion,
          estado: (incidente?.estado as string) || (innerData?.estado as string) || 'REPORTADO',
          prioridad: (incidente?.prioridad as string) || (innerData?.prioridad as string) || payload.prioridad || 'MEDIA',
          creadoEn: (incidente?.creadoEn as string) || (innerData?.creadoEn as string) || new Date().toISOString(),
        },
        mensaje:
          (rawData?.mensaje as string) ||
          (rawData?.message as string) ||
          (innerData?.mensaje as string) ||
          (innerData?.message as string) ||
          'Incidente ingresado y verificado exitosamente.',
      };
    }

    if (response.status === 409) {
      const errPayload = (error || data) as GenericRecord;
      const rawCoincidencias =
        errPayload?.coincidencias ||
        (errPayload?.data as GenericRecord)?.coincidencias ||
        (Array.isArray(errPayload?.data) ? errPayload.data : null) ||
        (errPayload?.details as GenericRecord)?.coincidencias ||
        (errPayload?.detalles as GenericRecord)?.coincidencias ||
        [];

      let coincidenciasNormalizadas: DuplicadoItem[] = (
        Array.isArray(rawCoincidencias) ? rawCoincidencias : []
      ).map((rawItem: unknown, idx: number) => {
        const item = rawItem as GenericRecord;
        return {
          id: (item?.id as string) || (item?.incidente_id as string) || (item?.aviso_id as string) || `dup-${idx}`,
          codigo:
            (item?.codigo as string) ||
            (item?.codigoSeguimiento as string) ||
            (item?.codigo_seguimiento as string) ||
            (item?.codigoIncidente as string) ||
            (item?.codigo_incidente as string) ||
            'S/C',
          tipoAfectacion:
            (item?.tipoAfectacion as string) ||
            (item?.tipo_afectacion as string) ||
            (item?.tipo as string) ||
            'No especificado',
          direccion: (item?.direccion as string) || (item?.ubicacion as string) || 'Sin dirección',
          estado: (item?.estado as string) || (item?.estadoIncidente as string) || 'REPORTADO',
          distanciaMetros: Number(
            item?.distanciaMetros ?? item?.distancia_metros ?? item?.distancia ?? 0
          ),
          creadoEn:
            (item?.creadoEn as string) ||
            (item?.creado_en as string) ||
            (item?.createdAt as string) ||
            new Date().toISOString(),
          origen: item?.origen === 'aviso' ? 'aviso' : 'incidente',
        };
      });

      // Si el 409 no adjuntó coincidencias en el cuerpo, consultamos defensivamente al endpoint de verificación
      if (coincidenciasNormalizadas.length === 0 && (payload.latitud || payload.direccion)) {
        try {
          const resVerif = await verificarDuplicado(
            {
              tipoAfectacion: payload.tipoAfectacion,
              direccion: payload.direccion,
              latitud: payload.latitud,
              longitud: payload.longitud,
              radioMetros: 300,
              horasVentana: 24,
            },
            operadorId
          );
          if (resVerif.coincidencias && resVerif.coincidencias.length > 0) {
            coincidenciasNormalizadas = resVerif.coincidencias;
          }
        } catch {
          // Ignorar fallo de verificación secundaria
        }
      }

      return {
        tipo: 'DUPLICADO',
        coincidencias: coincidenciasNormalizadas,
        mensaje:
          (errPayload?.message as string) ||
          (errPayload?.mensaje as string) ||
          'Se detectaron incidentes similares reportados recientemente en la misma zona.',
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        tipo: 'NO_AUTORIZADO',
        mensaje: 'No posees permisos de Call Center para ingresar incidentes manuales.',
      };
    }

    if (response.status === 400) {
      const errObj = (error || data) as GenericRecord;
      let errorList: string[] = [];
      if (Array.isArray(errObj?.errors)) {
        errorList = errObj.errors.map((e: unknown) => {
          if (typeof e === 'string') return e;
          const rec = e as GenericRecord;
          return (rec?.mensaje as string) || (rec?.message as string) || JSON.stringify(e);
        });
      }
      return {
        tipo: 'ERROR_VALIDACION',
        errores: errorList,
        mensaje:
          (errObj?.message as string) ||
          (errObj?.mensaje as string) ||
          'Los datos proporcionados no cumplen con las validaciones requeridas.',
      };
    }

    return {
      tipo: 'ERROR_CONEXION',
      mensaje: 'Respuesta inesperada del servidor. Intenta nuevamente.',
    };
  } catch {
    return {
      tipo: 'ERROR_CONEXION',
      mensaje: 'Error de conexión con sgrai-api. Verifica la conectividad del servidor.',
    };
  }
}
