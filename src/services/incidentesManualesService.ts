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

    const resData = (data as any)?.data ?? data;
    const coincidenciasRaw = resData?.coincidencias ?? (Array.isArray(resData) ? resData : []);

    const coincidencias: DuplicadoItem[] = (
      Array.isArray(coincidenciasRaw) ? coincidenciasRaw : []
    ).map((item: any, idx: number) => ({
      id: item?.id || item?.incidente_id || item?.aviso_id || `dup-${idx}`,
      codigo:
        item?.codigo ||
        item?.codigoSeguimiento ||
        item?.codigo_seguimiento ||
        item?.codigoIncidente ||
        item?.codigo_incidente ||
        'S/C',
      tipoAfectacion:
        item?.tipoAfectacion || item?.tipo_afectacion || item?.tipo || 'No especificado',
      direccion: item?.direccion || item?.ubicacion || 'Sin dirección',
      estado: item?.estado || item?.estadoIncidente || 'REPORTADO',
      distanciaMetros: Number(
        item?.distanciaMetros ?? item?.distancia_metros ?? item?.distancia ?? 0
      ),
      creadoEn:
        item?.creadoEn || item?.creado_en || item?.createdAt || new Date().toISOString(),
      origen: item?.origen === 'aviso' ? 'aviso' : 'incidente',
    }));

    return {
      hayDuplicados: Boolean(resData?.hayDuplicados ?? (coincidencias.length > 0)),
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
      const rawData = data as any;
      const innerData = rawData?.data ?? rawData;
      const incidente = innerData?.incidente ?? (innerData?.codigo ? innerData : null);
      const aviso = innerData?.aviso ?? (innerData?.codigoSeguimiento ? innerData : null);

      const codigoIncidente =
        incidente?.codigo ||
        incidente?.codigoIncidente ||
        incidente?.id ||
        innerData?.codigo ||
        'INC-REGISTRADO';

      const codigoAviso =
        aviso?.codigoSeguimiento ||
        aviso?.codigo ||
        incidente?.codigoSeguimiento ||
        innerData?.codigoSeguimiento ||
        codigoIncidente;

      return {
        tipo: 'EXITO',
        datos: {
          codigoIncidente,
          codigoAviso,
          tipoAfectacion:
            incidente?.tipoAfectacion || innerData?.tipoAfectacion || payload.tipoAfectacion,
          direccion: incidente?.direccion || innerData?.direccion || payload.direccion,
          estado: incidente?.estado || innerData?.estado || 'REPORTADO',
          prioridad: incidente?.prioridad || innerData?.prioridad || payload.prioridad || 'MEDIA',
          creadoEn: incidente?.creadoEn || innerData?.creadoEn || new Date().toISOString(),
        },
        mensaje:
          rawData?.mensaje ||
          rawData?.message ||
          innerData?.mensaje ||
          innerData?.message ||
          'Incidente ingresado y verificado exitosamente.',
      };
    }

    if (response.status === 409) {
      const errPayload = (error || data) as any;
      const rawCoincidencias =
        errPayload?.coincidencias ||
        errPayload?.data?.coincidencias ||
        (Array.isArray(errPayload?.data) ? errPayload.data : null) ||
        errPayload?.details?.coincidencias ||
        errPayload?.detalles?.coincidencias ||
        [];

      let coincidenciasNormalizadas: DuplicadoItem[] = (
        Array.isArray(rawCoincidencias) ? rawCoincidencias : []
      ).map((item: any, idx: number) => ({
        id: item?.id || item?.incidente_id || item?.aviso_id || `dup-${idx}`,
        codigo:
          item?.codigo ||
          item?.codigoSeguimiento ||
          item?.codigo_seguimiento ||
          item?.codigoIncidente ||
          item?.codigo_incidente ||
          'S/C',
        tipoAfectacion:
          item?.tipoAfectacion || item?.tipo_afectacion || item?.tipo || 'No especificado',
        direccion: item?.direccion || item?.ubicacion || 'Sin dirección',
        estado: item?.estado || item?.estadoIncidente || 'REPORTADO',
        distanciaMetros: Number(
          item?.distanciaMetros ?? item?.distancia_metros ?? item?.distancia ?? 0
        ),
        creadoEn:
          item?.creadoEn || item?.creado_en || item?.createdAt || new Date().toISOString(),
        origen: item?.origen === 'aviso' ? 'aviso' : 'incidente',
      }));

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
          errPayload?.message ||
          errPayload?.mensaje ||
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
      const errObj = (error || data) as any;
      let errorList: string[] = [];
      if (Array.isArray(errObj?.errors)) {
        errorList = errObj.errors.map((e: any) =>
          typeof e === 'string' ? e : e?.mensaje || e?.message || JSON.stringify(e)
        );
      }
      return {
        tipo: 'ERROR_VALIDACION',
        errores: errorList,
        mensaje:
          errObj?.message ||
          errObj?.mensaje ||
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
