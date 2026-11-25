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
 * Mensaje institucional para respuestas 401 (sesión ausente o expirada).
 */
const MENSAJE_SESION_EXPIRADA =
  'Su sesión ha expirado o no está autenticado. Inicie sesión nuevamente.';

/**
 * Mensaje institucional por defecto cuando la API deniega el acceso.
 */
const MENSAJE_ACCESO_DENEGADO =
  'Acceso denegado. Se requiere perfil de Administrador o el permiso eventos_atp:crear.';

/**
 * Extrae el mensaje del cuerpo de error de la API cuando existe.
 * Devuelve `null` si la respuesta no trae un mensaje utilizable.
 */
function extraerMensajeApi(error: unknown): string | null {
  if (typeof error !== 'object' || error === null) {
    return null;
  }

  const candidato = error as { message?: unknown; error?: unknown };

  if (typeof candidato.message === 'string' && candidato.message.trim()) {
    return candidato.message.trim();
  }

  if (typeof candidato.error === 'string' && candidato.error.trim()) {
    return candidato.error.trim();
  }

  return null;
}

/**
 * Determina si el mensaje devuelto por la API es un texto genérico que no
 * aporta información específica (permisos de gestión de roles o un simple
 * "Acceso denegado."), en cuyo caso se usa el mensaje institucional.
 */
function esMensajeGenericoDePermisos(mensaje: string | null): boolean {
  if (!mensaje) {
    return true;
  }

  if (/permisos? de gesti[oó]n de roles|gesti[oó]n de roles para acceder/i.test(mensaje)) {
    return true;
  }

  return /^acceso denegado\.?$/i.test(mensaje.trim());
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
      const mensajeServidor = extraerMensajeApi(error);
      const apiErr = formatApiError({
        ...(typeof error === 'object' && error !== null ? error : {}),
        status: statusCode,
      });

      let mensaje: string;

      if (statusCode === 401) {
        mensaje = MENSAJE_SESION_EXPIRADA;
      } else if (statusCode === 403) {
        mensaje =
          mensajeServidor && !esMensajeGenericoDePermisos(mensajeServidor)
            ? mensajeServidor
            : MENSAJE_ACCESO_DENEGADO;
      } else if (statusCode === 409) {
        mensaje =
          mensajeServidor ||
          'Ya existe un Evento ATP registrado con el código ingresado.';
      } else {
        mensaje =
          mensajeServidor ||
          `Error HTTP ${statusCode}: No fue posible crear el Evento ATP`;
      }

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
