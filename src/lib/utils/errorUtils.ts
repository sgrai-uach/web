import type { ApiErrorResponse, ApiFieldError } from '@/types/common';

/**
 * Obtiene de forma segura un mensaje legible a partir de un error desconocido.
 * Útil para bloques catch (err: unknown).
 */
export function getErrorMessage(err: unknown): string {
  if (typeof err === 'string') {
    return err;
  }
  if (err instanceof Error) {
    return err.message;
  }
  if (
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof (err as { message: unknown }).message === 'string'
  ) {
    return (err as { message: string }).message;
  }
  return 'Ocurrió un error inesperado.';
}

/**
 * Traduce mensajes técnicos o de backend (ej. UUIDs internos) a texto claro y comprensible para el usuario.
 */
export function toUserFriendlyErrorMessage(err: unknown): string {
  const rawMsg = getErrorMessage(err);

  // Sanitizar si expone UUID interno de usuario o recurso no encontrado
  const hasUuid = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/.test(rawMsg);
  if (hasUuid && (/no existe|no encontrado|not found/i.test(rawMsg))) {
    return 'El usuario o recurso solicitado no fue encontrado en el sistema.';
  }

  if (/Failed to fetch|NetworkError|ERR_CONNECTION_REFUSED/i.test(rawMsg)) {
    return 'No se pudo conectar con el servidor del sistema. Compruebe la conexión de red.';
  }

  return rawMsg;
}

/**
 * Normaliza cualquier error de red, respuesta de API o excepción a un objeto ApiErrorResponse tipado.
 */
export function formatApiError(err: unknown): ApiErrorResponse {
  if (typeof err === 'object' && err !== null) {
    const candidate = err as Record<string, unknown>;

    const message =
      typeof candidate.message === 'string'
        ? candidate.message
        : getErrorMessage(err);

    let errors: ApiFieldError[] | undefined;
    if (Array.isArray(candidate.errors)) {
      errors = candidate.errors
        .filter((item): item is { campo?: string; mensaje: string } => {
          return (
            typeof item === 'object' &&
            item !== null &&
            'mensaje' in item &&
            typeof (item as { mensaje: unknown }).mensaje === 'string'
          );
        })
        .map((item) => ({
          campo: typeof item.campo === 'string' ? item.campo : undefined,
          mensaje: item.mensaje,
        }));
    }

    const statusCode =
      typeof candidate.status === 'number'
        ? candidate.status
        : typeof candidate.statusCode === 'number'
        ? candidate.statusCode
        : undefined;

    return {
      message,
      errors,
      statusCode,
    };
  }

  return {
    message: getErrorMessage(err),
  };
}
