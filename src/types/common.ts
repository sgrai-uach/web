/**
 * Tipos y contratos transversales para el frontend de SGRAI.
 * Conforme a docs/architecture/ARCHITECTURE.md.
 */

export interface ApiResponse<T> {
  message?: string;
  data: T;
}

export interface ApiFieldError {
  campo?: string;
  mensaje: string;
}

export interface ApiErrorResponse {
  message: string;
  errors?: ApiFieldError[];
  statusCode?: number;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationState {
  type: NotificationType;
  title?: string;
  message: string;
  details?: string[];
}

export interface FiltrosParams {
  q?: string;
  estado?: string;
  pagina?: number;
  limite?: number;
  [key: string]: unknown;
}
