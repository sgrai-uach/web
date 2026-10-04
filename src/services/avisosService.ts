import apiClient from '@/lib/api/client';
import { formatApiError } from '@/lib/utils/errorUtils';
import { catalogosService } from '@/services/catalogosService';
import type {
  AvisoDetalleResponse,
  AvisosPaginadosResponse,
  DescartarAvisoInput,
  DescartarAvisoSuccessResponse,
  FiltrosAvisosState,
  TipoIncidenteOpcion,
  VerificarAvisoInput,
  VerificarAvisoSuccessResponse,
} from '@/types/avisos';
import { CATALOGO_TIPOS_INCIDENTE_DEFAULT, normalizarListaTiposIncidentes } from '@/types/avisos';
import type { ApiErrorResponse } from '@/types/common';
import type { components } from '@/types/api-generated';

/* =========================================================================
   Tipos y Constantes para Reporte Ciudadano (H1)
   ========================================================================= */

export const TIPOS_AFECTACION_DEFAULT = [
  'Inundación o anegamiento de vivienda/vía pública',
  'Caída de árbol o ramas de gran tamaño',
  'Colapso o daño estructural en vivienda/edificación',
  'Deslizamiento de tierra o remoción en masa',
  'Incendio estructural o de interfase forestal',
  'Corte o peligro en tendido eléctrico / poste caído',
  'Derrame de sustancias o peligro ambiental',
  'Otro incidente de emergencia',
];

export type CrearAvisoPayload = components['schemas']['CrearAvisoIncidenteInput'];

export interface ResultadoAviso {
  exito: boolean;
  esDuplicado: boolean;
  codigoSeguimiento?: string;
  mensaje: string;
  errores?: string[];
}

/* =========================================================================
   Clase de Error para el Servicio de Avisos
   ========================================================================= */

export class AvisosServiceError extends Error {
  public apiError: ApiErrorResponse;
  public status: number;

  constructor(status: number, message: string, apiError?: ApiErrorResponse) {
    super(message);
    this.name = 'AvisosServiceError';
    this.status = status;
    this.apiError = apiError || { message, statusCode: status };
  }

  get isConflict(): boolean {
    return this.status === 409;
  }
}

export { AvisosServiceError as ApiError };

/* =========================================================================
   Operaciones de Reporte Ciudadano (H1)
   ========================================================================= */

/**
 * Consulta la lista de tipos de afectación disponibles desde la API.
 * Si la API falla o no responde, utiliza la lista institucional por defecto.
 */
export async function obtenerTiposAfectacion(): Promise<string[]> {
  try {
    const { data, error } = await apiClient.GET('/api/incidentes/tipos');
    if (error || !data?.data || !Array.isArray(data.data) || data.data.length === 0) {
      return TIPOS_AFECTACION_DEFAULT;
    }
    return data.data;
  } catch {
    return TIPOS_AFECTACION_DEFAULT;
  }
}

/**
 * Envía el reporte de incidente al endpoint de recepción de avisos.
 * Maneja tanto reportes nuevos (HTTP 201) como reportes duplicados (HTTP 200 - modelo SAESA).
 */
export async function enviarAvisoIncidente(payload: CrearAvisoPayload): Promise<ResultadoAviso> {
  try {
    const { data, error, response } = await apiClient.POST('/api/incidentes/avisos', {
      body: payload,
    });

    if (error || !response.ok) {
      const errObj = error as { message?: string; errors?: string[] } | undefined;
      return {
        exito: false,
        esDuplicado: false,
        mensaje: errObj?.message || 'No fue posible registrar el reporte. Por favor intenta nuevamente.',
        errores: errObj?.errors,
      };
    }

    if (data?.data) {
      return {
        exito: true,
        esDuplicado: Boolean(data.data.esDuplicado),
        codigoSeguimiento: data.data.codigoSeguimiento,
        mensaje: data.message || 'Reporte procesado exitosamente.',
      };
    }

    return {
      exito: false,
      esDuplicado: false,
      mensaje: 'Respuesta inesperada del servidor.',
    };
  } catch {
    return {
      exito: false,
      esDuplicado: false,
      mensaje: 'Error de conexión con el servidor. Verifica tu conexión e intenta nuevamente.',
    };
  }
}

/* =========================================================================
   Operaciones de Call Center / Recepción de Avisos (H52)
   ========================================================================= */

/**
 * Obtiene la lista paginada de avisos para la bandeja del Call Center.
 */
export async function listarAvisos(
  params: Partial<FiltrosAvisosState> = {}
): Promise<AvisosPaginadosResponse> {
  const queryObj: Record<string, unknown> = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
  };

  if (params.estado && params.estado !== 'TODOS') {
    queryObj.estado = params.estado;
  } else if (!params.estado) {
    queryObj.estado = 'NO_VERIFICADO';
  }

  if (params.delegacion && params.delegacion !== 'TODAS') {
    queryObj.delegacion = params.delegacion;
    const delId = catalogosService.resolverDelegacionId(params.delegacion);
    if (delId) {
      queryObj.delegacionId = delId;
    }
  }

  const { data, error, response } = await apiClient.GET('/api/incidentes/avisos', {
    params: {
      query: queryObj as unknown as {
        page?: number;
        limit?: number;
        estado?: 'PENDIENTE_VERIFICACION' | 'NO_VERIFICADO' | 'VERIFICADO' | 'DESCARTADO';
      },
    },
  });

  if (error || !data) {
    const formatted = formatApiError({
      ...(typeof error === 'object' && error !== null ? error : {}),
      status: response.status,
      message: 'Error al cargar los avisos pendientes',
    });
    throw new AvisosServiceError(response.status, formatted.message, formatted);
  }

  return data;
}

/**
 * Obtiene el detalle completo de un aviso por su ID.
 */
export async function obtenerDetalleAviso(
  id: string
): Promise<AvisoDetalleResponse> {
  const { data, error, response } = await apiClient.GET('/api/incidentes/avisos/{id}', {
    params: {
      path: { id },
    },
  });

  if (error || !data) {
    const defaultMsg =
      response.status === 404
        ? 'El aviso solicitado no existe o fue eliminado'
        : 'Error al obtener el detalle del aviso';
    const formatted = formatApiError({
      ...(typeof error === 'object' && error !== null ? error : {}),
      status: response.status,
      message: defaultMsg,
    });
    throw new AvisosServiceError(response.status, formatted.message, formatted);
  }

  return data;
}

/**
 * Verifica un aviso preliminar y lo promueve a Incidente formal.
 */
export async function verificarAviso(
  id: string,
  body: VerificarAvisoInput,
  operadorId: string
): Promise<VerificarAvisoSuccessResponse> {
  const { data, error, response } = await apiClient.POST(
    '/api/incidentes/avisos/{id}/verificar',
    {
      params: {
        path: { id },
        header: {
          'x-user-id': operadorId,
        },
      },
      body,
    }
  );

  if (error || response.status !== 201) {
    let msg = 'Error al verificar y promover el aviso a incidente';
    if (response.status === 409) {
      msg = 'Este aviso ya fue atendido o procesado por otro operador';
    } else if (response.status === 401) {
      msg = 'No autorizado: Se requiere una sesión válida de operador';
    }
    const formatted = formatApiError({
      ...(typeof error === 'object' && error !== null ? error : {}),
      status: response.status,
      message: msg,
    });
    throw new AvisosServiceError(response.status, formatted.message, formatted);
  }

  return (
    (data as unknown as VerificarAvisoSuccessResponse) || {
      mensaje: 'Aviso verificado exitosamente',
      avisoId: id,
      incidenteId: '',
      folio: 'INC-GENERADO',
      estado: 'Reportado',
    }
  );
}

/**
 * Descarta un aviso preliminar con justificación obligatoria.
 */
export async function descartarAviso(
  id: string,
  body: DescartarAvisoInput,
  operadorId: string
): Promise<DescartarAvisoSuccessResponse> {
  if (!body.motivoDescarte || body.motivoDescarte.trim().length < 5) {
    throw new AvisosServiceError(
      400,
      'El motivo de descarte es obligatorio y debe tener al menos 5 caracteres'
    );
  }

  const { data, error, response } = await apiClient.POST(
    '/api/incidentes/avisos/{id}/descartar',
    {
      params: {
        path: { id },
        header: {
          'x-user-id': operadorId,
        },
      },
      body,
    }
  );

  if (error || response.status !== 200) {
    let msg = 'Error al descartar el aviso';
    if (response.status === 409) {
      msg = 'Este aviso ya fue procesado o descartado por otro operador';
    } else if (response.status === 401) {
      msg = 'No autorizado: Se requiere una sesión válida de operador';
    }
    const formatted = formatApiError({
      ...(typeof error === 'object' && error !== null ? error : {}),
      status: response.status,
      message: msg,
    });
    throw new AvisosServiceError(response.status, formatted.message, formatted);
  }

  return (
    (data as unknown as DescartarAvisoSuccessResponse) || {
      mensaje: 'Aviso descartado exitosamente',
      avisoId: id,
      estado: 'DESCARTADO',
      motivoDescarte: body.motivoDescarte,
    }
  );
}

/**
 * Consulta catálogo de tipos de incidentes habilitados.
 * Retorna opciones normalizadas con UUIDs canónicos garantizados.
 */
export async function obtenerTiposIncidentes(): Promise<TipoIncidenteOpcion[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const res = await fetch(`${baseUrl}/api/incidentes/tipos`);
    if (!res.ok) {
      throw new Error('Error al consultar tipos de incidentes');
    }
    const json = await res.json();
    const lista = Array.isArray(json.data) ? json.data : [];
    return normalizarListaTiposIncidentes(lista);
  } catch {
    return CATALOGO_TIPOS_INCIDENTE_DEFAULT;
  }
}
