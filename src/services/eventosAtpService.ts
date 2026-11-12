import apiClient from '@/lib/api/client';
import { formatApiError } from '@/lib/utils/errorUtils';
import type { ApiErrorResponse } from '@/types/common';
import type {
  CrearEventoAtpInput,
  EventoAtpDetalle,
  EventoAtpDetalleCompleto,
  EventoAtpResumen,
  ListarEventosAtpQuery,
  ListarEventosAtpResponse,
  ResultadoVinculacion,
  VincularEntidadesInputParcial,
} from '@/types/eventoAtp';

/**
 * Error de dominio para las operaciones del módulo de Eventos ATP (H61).
 * Conserva el detalle de campos devuelto por la API para desplegarlo en el formulario.
 */
export class EventoAtpServiceError extends Error {
  public apiError: ApiErrorResponse;
  public statusCode?: number;

  constructor(
    apiError: Partial<ApiErrorResponse> & {
      message: string;
      statusCode?: number;
    }
  ) {
    super(apiError.message);
    this.name = 'EventoAtpServiceError';
    this.apiError = {
      message: apiError.message,
      statusCode: apiError.statusCode,
      error: apiError.error,
      errors: apiError.errors,
      detalles: apiError.detalles,
    };
    this.statusCode = apiError.statusCode;
  }
}

/**
 * Registra un nuevo Evento de Alerta Temprana Preventiva a través de
 * `POST /api/eventos-atp` (H61).
 *
 * El token JWT de sesión es inyectado automáticamente por el cliente tipado.
 */
export async function crearEventoAtp(
  payload: CrearEventoAtpInput
): Promise<EventoAtpDetalle> {
  try {
    const { data, error, response } = await apiClient.POST('/api/eventos-atp', {
      body: payload,
    });

    if (response?.status === 201 && data) {
      return data.data;
    }

    if (error || (response && response.status >= 400)) {
      const statusCode = response?.status ?? 500;
      const apiErr = formatApiError({
        ...(typeof error === 'object' && error !== null ? error : {}),
        status: statusCode,
      });

      const mensaje =
        statusCode === 403
          ? 'Acceso denegado. Se requiere perfil de Administrador o el permiso eventos_atp:crear.'
          : statusCode === 409
            ? apiErr.message ||
              'Ya existe un Evento ATP registrado con el código ingresado.'
            : apiErr.message ||
              `Error HTTP ${statusCode}: No fue posible crear el Evento ATP`;

      throw new EventoAtpServiceError({
        message: mensaje,
        statusCode,
        errors: apiErr.errors,
        detalles: apiErr.detalles,
      });
    }

    throw new EventoAtpServiceError({
      message: `Error HTTP ${response?.status ?? 500}: No fue posible crear el Evento ATP`,
      statusCode: response?.status ?? 500,
    });
  } catch (err: unknown) {
    if (err instanceof EventoAtpServiceError) {
      throw err;
    }

    const formatted = formatApiError(err);
    throw new EventoAtpServiceError(formatted);
  }
}

/* ==========================================================================
   H60 - Catálogo, detalle y vinculación de entidades a Eventos ATP
   ========================================================================== */

export interface ResultadoListadoEventosAtp {
  exito: boolean;
  eventos: EventoAtpResumen[];
  meta?: ListarEventosAtpResponse['meta'];
  mensaje: string;
  codigoError?: number;
}

export interface ResultadoDetalleEventoAtp {
  exito: boolean;
  datos?: EventoAtpDetalleCompleto;
  mensaje: string;
  codigoError?: number;
}

function construirMensajeError(
  statusCode: number,
  apiError: ApiErrorResponse,
  accion: string
): string {
  if (statusCode === 401) {
    return 'Sesión no válida o no autenticada.';
  }

  if (statusCode === 403) {
    return 'Acceso denegado. Se requiere el permiso eventos_atp:vincular.';
  }

  if (statusCode === 404) {
    return apiError.message || 'El Evento ATP indicado no existe.';
  }

  if (statusCode === 409) {
    return (
      apiError.message ||
      'El Evento ATP no está ACTIVO y no admite nuevas vinculaciones.'
    );
  }

  return (
    apiError.message ||
    `Error HTTP ${statusCode}: No fue posible ${accion}.`
  );
}

/**
 * Lista Eventos ATP con filtros y paginación (H60).
 */
export async function listarEventosAtp(
  query: ListarEventosAtpQuery = {}
): Promise<ResultadoListadoEventosAtp> {
  try {
    const { data, error, response } = await apiClient.GET('/api/eventos-atp', {
      params: { query },
    });

    if (response?.status === 200 && data) {
      return {
        exito: true,
        eventos: data.data,
        meta: data.meta,
        mensaje: data.message || 'Listado de Eventos ATP obtenido exitosamente.',
      };
    }

    const statusCode = response?.status ?? 500;
    const apiError = formatApiError({
      ...(typeof error === 'object' && error !== null ? error : {}),
      status: statusCode,
    });

    return {
      exito: false,
      eventos: [],
      codigoError: statusCode,
      mensaje: construirMensajeError(statusCode, apiError, 'listar los Eventos ATP'),
    };
  } catch (err: unknown) {
    const apiError = formatApiError(err);
    return {
      exito: false,
      eventos: [],
      codigoError: apiError.statusCode,
      mensaje:
        apiError.message || 'No fue posible conectar con el servicio de Eventos ATP.',
    };
  }
}

/**
 * Obtiene el detalle de un Evento ATP con sus entidades vinculadas (H60).
 */
export async function obtenerEventoAtp(
  id: string
): Promise<ResultadoDetalleEventoAtp> {
  try {
    const { data, error, response } = await apiClient.GET(
      '/api/eventos-atp/{id}',
      { params: { path: { id } } }
    );

    if (response?.status === 200 && data) {
      return {
        exito: true,
        datos: data.data,
        mensaje: data.message || 'Evento ATP obtenido exitosamente.',
      };
    }

    const statusCode = response?.status ?? 500;
    const apiError = formatApiError({
      ...(typeof error === 'object' && error !== null ? error : {}),
      status: statusCode,
    });

    return {
      exito: false,
      codigoError: statusCode,
      mensaje: construirMensajeError(statusCode, apiError, 'obtener el Evento ATP'),
    };
  } catch (err: unknown) {
    const apiError = formatApiError(err);
    return {
      exito: false,
      codigoError: apiError.statusCode,
      mensaje:
        apiError.message || 'No fue posible conectar con el servicio de Eventos ATP.',
    };
  }
}

/**
 * Vincula entidades en lote a un Evento ATP ACTIVO (H60).
 */
export async function vincularEntidadesEventoAtp(
  eventoAtpId: string,
  input: VincularEntidadesInputParcial
): Promise<ResultadoVinculacion> {
  try {
    const { data, error, response } = await apiClient.POST(
      '/api/eventos-atp/{id}/vinculos',
      {
        params: { path: { id: eventoAtpId } },
        body: input as never,
      }
    );

    if (response?.status === 200 && data) {
      return data.data;
    }

    const statusCode = response?.status ?? 500;
    const apiError = formatApiError({
      ...(typeof error === 'object' && error !== null ? error : {}),
      status: statusCode,
    });

    throw new EventoAtpServiceError({
      message: construirMensajeError(
        statusCode,
        apiError,
        'vincular las entidades al Evento ATP'
      ),
      statusCode,
      errors: apiError.errors,
      detalles: apiError.detalles,
    });
  } catch (err: unknown) {
    if (err instanceof EventoAtpServiceError) throw err;
    const formatted = formatApiError(err);
    throw new EventoAtpServiceError(formatted);
  }
}

/**
 * Desvincula entidades de un Evento ATP sin eliminar los registros (H60).
 */
export async function desvincularEntidadesEventoAtp(
  eventoAtpId: string,
  input: VincularEntidadesInputParcial
): Promise<ResultadoVinculacion> {
  try {
    const { data, error, response } = await apiClient.DELETE(
      '/api/eventos-atp/{id}/vinculos',
      {
        params: { path: { id: eventoAtpId } },
        body: input as never,
      }
    );

    if (response?.status === 200 && data) {
      return data.data;
    }

    const statusCode = response?.status ?? 500;
    const apiError = formatApiError({
      ...(typeof error === 'object' && error !== null ? error : {}),
      status: statusCode,
    });

    throw new EventoAtpServiceError({
      message: construirMensajeError(
        statusCode,
        apiError,
        'desvincular las entidades del Evento ATP'
      ),
      statusCode,
      errors: apiError.errors,
      detalles: apiError.detalles,
    });
  } catch (err: unknown) {
    if (err instanceof EventoAtpServiceError) throw err;
    const formatted = formatApiError(err);
    throw new EventoAtpServiceError(formatted);
  }
}
