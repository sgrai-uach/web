/**
 * Re-export para retrocompatibilidad hacia la capa de servicios estandarizada.
 * Usar @/services/seguridadService en código nuevo.
 */
export * from '@/services/seguridadService';
export { SeguridadServiceError as ApiError } from '@/services/seguridadService';
