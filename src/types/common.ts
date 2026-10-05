/**
 * Tipos y contratos transversales para el frontend de SGRAI.
 * Conforme a docs/architecture/architecture.md.
 */

export interface ApiResponse<T> {
  message?: string;
  error?: string;
  data: T;
  detalles?: ApiErrorDetalle[];
}

export interface ApiFieldError {
  campo?: string;
  mensaje: string;
}

export type ApiErrorDetalle = ApiFieldError;

export interface ApiErrorResponse {
  message: string;
  error?: string;
  errors?: ApiFieldError[];
  detalles?: ApiErrorDetalle[];
  statusCode?: number;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'exito';

export interface NotificationState {
  type?: NotificationType;
  tipo?: 'exito' | 'error';
  title?: string;
  message?: string;
  mensaje?: string;
  details?: string[];
}

export interface FiltrosParams {
  q?: string;
  estado?: string;
  pagina?: number;
  limite?: number;
  [key: string]: unknown;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

