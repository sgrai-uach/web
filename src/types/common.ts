/**
 * Tipos comunes para respuestas de API y errores en sgrai-web.
 */

export interface ApiResponse<T> {
  data: T;
  error?: string;
  detalles?: ApiErrorDetalle[];
}

export interface ApiErrorDetalle {
  campo: string;
  mensaje: string;
}

export interface ApiErrorResponse {
  error?: string;
  detalles?: ApiErrorDetalle[];
}

export interface NotificationState {
  tipo: 'exito' | 'error';
  mensaje: string;
}
