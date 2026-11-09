import apiClient from '@/lib/api/client';
import { formatApiError } from '@/lib/utils/errorUtils';
import type { ApiErrorResponse } from '@/types/common';
import type { CrearEventoAtpInput, EventoAtpDetalle } from '@/types/eventoAtp';

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
