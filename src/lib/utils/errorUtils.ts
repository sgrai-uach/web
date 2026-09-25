import type { ApiErrorResponse } from '@/types/common';

const NOMBRES_CAMPOS: Record<string, string> = {
  rut: 'RUT',
  email: 'Correo Electrónico',
  telefono: 'Teléfono',
  nombres: 'Nombres',
  apellidos: 'Apellidos',
  rol_id: 'Rol',
  delegacion_id: 'Delegación',
  fecha_ingreso: 'Fecha de Ingreso',
  fecha_salida: 'Fecha de Salida',
  especialidad: 'Especialidad',
  cargo: 'Cargo',
};

/**
 * Normaliza y formatea mensajes de error provenientes de la API o excepciones JS.
 */
export function formatApiError(errorData: ApiErrorResponse | null, fallbackMessage: string): string {
  if (errorData?.detalles && Array.isArray(errorData.detalles) && errorData.detalles.length > 0) {
    const lista = errorData.detalles
      .map((item) => {
        const label = NOMBRES_CAMPOS[item.campo] || item.campo;
        return `${label}: ${item.mensaje}`;
      })
      .join(' | ');
    return `Error en los datos ingresados: ${lista}`;
  }

  return errorData?.error || fallbackMessage;
}

/**
 * Extrae de forma segura el mensaje de un error capturado en bloques catch (err: unknown).
 */
export function getErrorMessage(err: unknown, defaultMessage = 'Ha ocurrido un error inesperado'): string {
  if (err instanceof Error) {
    return err.message;
  }
  if (typeof err === 'string') {
    return err;
  }
  return defaultMessage;
}
