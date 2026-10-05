import type { ApiErrorResponse, ApiFieldError } from '@/types/common';

export const NOMBRES_CAMPOS: Record<string, string> = {
  rut: 'RUT',
  email: 'Correo Electrónico',
  telefono: 'Teléfono',
  nombres: 'Nombres',
  apellidos: 'Apellidos',
  rol_id: 'Rol',
  delegacion_id: 'Delegación Territorial',
  delegacionId: 'Delegación Territorial',
  fecha_ingreso: 'Fecha de Ingreso',
  fecha_salida: 'Fecha de Salida',
  especialidad: 'Especialidad',
  cargo: 'Cargo',
  nombre: 'Nombre del Sector / Punto Crítico',
  descripcion: 'Descripción Operativa',
  tipo_riesgo: 'Tipo de Amenaza / Riesgo',
  tipoRiesgo: 'Tipo de Amenaza / Riesgo',
  prioridad: 'Prioridad Operativa',
  nivel_prioridad: 'Prioridad Operativa',
  latitud: 'Coordenada Latitud',
  lat: 'Coordenada Latitud',
  longitud: 'Coordenada Longitud',
  lng: 'Coordenada Longitud',
  radio_afectacion_metros: 'Radio de Afectación',
  radioMetros: 'Radio de Afectación',
  activo: 'Estado Operativo',
};

/**
 * Traduce el identificador técnico de un campo a su nombre legible oficial en la interfaz.
 */
export function traducirNombreCampo(campo?: string): string {
  if (!campo) return '';
  return NOMBRES_CAMPOS[campo] || NOMBRES_CAMPOS[campo.toLowerCase()] || campo;
}

/**
 * Obtiene de forma segura un mensaje legible a partir de un error desconocido.
 * Útil para bloques catch (err: unknown).
 */
export function getErrorMessage(
  err: unknown,
  defaultMessage = 'Ha ocurrido un error inesperado.'
): string {
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
  return defaultMessage;
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

  if (/perfil de Administrador.*roles|gestión de roles/i.test(rawMsg)) {
    return 'Acceso denegado. Se requieren permisos de gestión de roles para acceder.';
  }

  return rawMsg;
}

/**
 * Normaliza y formatea mensajes de error provenientes de la API o excepciones JS.
 * Soporta ambas firmas:
 * 1) formatApiError(err: unknown): ApiErrorResponse
 * 2) formatApiError(errorData: unknown, fallbackMessage: string): string
 */
export function formatApiError(err: unknown): ApiErrorResponse;
export function formatApiError(errorData: unknown, fallbackMessage: string): string;
export function formatApiError(
  err: unknown,
  fallbackMessage?: string
): ApiErrorResponse | string {
  if (typeof fallbackMessage === 'string') {
    if (typeof err === 'object' && err !== null) {
      const candidate = err as Record<string, unknown>;
      const detalles = candidate.detalles || candidate.errors || candidate.issues;
      if (Array.isArray(detalles) && detalles.length > 0) {
        const lista = detalles
          .map((item) => {
            const campo =
              (item as { campo?: string }).campo ||
              (item as { field?: string }).field ||
              (Array.isArray((item as { path?: unknown }).path)
                ? (item as { path: unknown[] }).path.join('.')
                : '');
            const label = traducirNombreCampo(campo);
            const mensaje =
              (item as { mensaje?: string }).mensaje ||
              (item as { message?: string }).message ||
              '';
            return label ? `${label}: ${mensaje}` : mensaje;
          })
          .filter(Boolean)
          .join(' | ');
        return `Error en los datos ingresados: ${lista}`;
      }
      if (typeof candidate.error === 'string' && candidate.error) {
        return candidate.error;
      }
      if (typeof candidate.message === 'string' && candidate.message) {
        return candidate.message;
      }
    }
    return fallbackMessage;
  }

  if (typeof err === 'object' && err !== null) {
    const candidate = err as Record<string, unknown>;

    let message =
      typeof candidate.message === 'string'
        ? candidate.message
        : typeof candidate.error === 'string'
        ? candidate.error
        : getErrorMessage(err);

    if (
      message.includes('Se requiere el perfil de Administrador o permisos de gestión de roles para acceder') ||
      message.includes('Se requiere el perfil de Administrador o permisos de gestión de roles') ||
      /perfil de Administrador.*roles/i.test(message)
    ) {
      message = 'Acceso denegado. Se requieren permisos de gestión de roles para acceder.';
    }

    let errors: ApiFieldError[] | undefined;
    const rawErrors = candidate.errors || candidate.detalles || candidate.issues;
    if (Array.isArray(rawErrors)) {
      errors = rawErrors
        .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
        .map((item) => {
          const campo =
            typeof item.campo === 'string'
              ? item.campo
              : typeof item.field === 'string'
              ? item.field
              : Array.isArray(item.path)
              ? item.path.join('.')
              : undefined;

          const mensaje =
            typeof item.mensaje === 'string'
              ? item.mensaje
              : typeof item.message === 'string'
              ? item.message
              : '';

          return {
            campo,
            mensaje,
          };
        })
        .filter((item) => item.mensaje.length > 0 || !!item.campo);
    }

    const statusCode =
      typeof candidate.status === 'number'
        ? candidate.status
        : typeof candidate.statusCode === 'number'
        ? candidate.statusCode
        : undefined;

    return {
      message,
      error: typeof candidate.error === 'string' ? candidate.error : message,
      errors,
      detalles: errors,
      statusCode,
    };
  }

  const msg = getErrorMessage(err);
  return {
    message: msg,
    error: msg,
  };
}
