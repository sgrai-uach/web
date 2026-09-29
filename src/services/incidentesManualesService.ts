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

    return {
      hayDuplicados: Boolean(data.hayDuplicados),
      coincidencias: (data.coincidencias || []) as DuplicadoItem[],
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

    if (response.status === 201 && data) {
      const incidente = data.incidente;
      const aviso = data.aviso;
      return {
        tipo: 'EXITO',
        datos: {
          codigoIncidente: incidente.codigo,
          codigoAviso: aviso.codigoSeguimiento,
          tipoAfectacion: incidente.tipoAfectacion,
          direccion: incidente.direccion,
          estado: incidente.estado,
          prioridad: incidente.prioridad,
          creadoEn: incidente.creadoEn,
        },
        mensaje: data.mensaje || 'Incidente ingresado y verificado exitosamente.',
      };
    }

    if (response.status === 409) {
      const errObj = error as
        | {
            message?: string;
            requiereConfirmacion?: boolean;
            data?: { coincidencias?: DuplicadoItem[] };
          }
        | undefined;
      return {
        tipo: 'DUPLICADO',
        coincidencias: (errObj?.data?.coincidencias || []) as DuplicadoItem[],
        mensaje:
          errObj?.message ||
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
      const errObj = error as { message?: string; errors?: unknown } | undefined;
      let errorList: string[] = [];
      if (Array.isArray(errObj?.errors)) {
        errorList = errObj.errors.map((e) =>
          typeof e === 'string' ? e : e?.mensaje || JSON.stringify(e)
        );
      }
      return {
        tipo: 'ERROR_VALIDACION',
        errores: errorList,
        mensaje: errObj?.message || 'Los datos proporcionados no cumplen con las validaciones requeridas.',
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
