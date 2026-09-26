import apiClient from '@/lib/api/client';
import { formatApiError } from '@/lib/utils/errorUtils';
import type {
  AvisoDetalleResponse,
  AvisosPaginadosResponse,
  DescartarAvisoInput,
  DescartarAvisoSuccessResponse,
  FiltrosAvisosState,
  TipoIncidenteDTO,
  VerificarAvisoInput,
  VerificarAvisoSuccessResponse,
} from '@/types/avisos';
import type { ApiErrorResponse } from '@/types/common';

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

/**
 * Obtiene la lista paginada de avisos para la bandeja del Call Center.
 */
export async function listarAvisos(
  params: Partial<FiltrosAvisosState> = {}
): Promise<AvisosPaginadosResponse> {
  const { data, error, response } = await apiClient.GET('/api/incidentes/avisos', {
    params: {
      query: {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        estado: params.estado ?? 'NO_VERIFICADO',
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
 */
export async function obtenerTiposIncidentes(): Promise<TipoIncidenteDTO[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const res = await fetch(`${baseUrl}/api/incidentes/tipos`);
    if (!res.ok) {
      throw new Error('Error al consultar tipos de incidentes');
    }
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}
