/**
 * Re-export para retrocompatibilidad hacia la capa de servicios estandarizada.
 * Usar @/services/avisosService en código nuevo.
 */
export * from '@/services/avisosService';
export { AvisosServiceError as ApiError } from '@/services/avisosService';
