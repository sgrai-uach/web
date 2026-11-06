/**
 * Utilidades para formatear estados operativos, de recursos y de patrullas
 * en denominaciones legibles para el usuario final institucional, eliminando
 * el uso de valores crudos de enums en mayúsculas o variables de código.
 */

export const MAPA_ESTADOS_LEGIBLES: Record<string, string> = {
  // Recursos y Vehículos
  DISPONIBLE: 'Disponible',
  ASIGNADO: 'Asignado',
  EN_USO: 'En uso',
  EN_MANTENCION: 'En mantención',
  NO_DISPONIBLE: 'No disponible',
  BAJA_DEFINITIVA: 'Dado de baja',

  // Patrullas Verificadoras y Cuadrillas
  EN_VERIFICACION: 'En verificación',
  EN_MISION: 'En misión',
  EN_PREVENCION: 'En prevención',
  EN_RECUPERACION: 'En recuperación',
  DESACTIVADA: 'Desactivada',
  INACTIVA: 'Inactiva',
  DESPACHADA: 'Despachada',
  PLANIFICADA: 'Planificada',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',

  // Personal y Funcionarios
  disponible: 'Disponible',
  en_patrulla: 'En patrulla',
  en_mision: 'En misión',
  licencia: 'Licencia médica',
  descanso: 'En descanso',
  inactivo: 'Inactivo',
  activo: 'Activo',
};

/**
 * Retorna la representación en lenguaje natural institucional de cualquier
 * estado operativo, de patrulla, vehículo o funcionario.
 */
export function formatearEstado(
  estado?: string | null,
  fallback = 'No especificado'
): string {
  if (!estado || typeof estado !== 'string' || estado.trim() === '') {
    return fallback;
  }

  const limpio = estado.trim();
  if (MAPA_ESTADOS_LEGIBLES[limpio]) {
    return MAPA_ESTADOS_LEGIBLES[limpio];
  }

  const enMayusculas = limpio.toUpperCase();
  if (MAPA_ESTADOS_LEGIBLES[enMayusculas]) {
    return MAPA_ESTADOS_LEGIBLES[enMayusculas];
  }

  const enMinusculas = limpio.toLowerCase();
  if (MAPA_ESTADOS_LEGIBLES[enMinusculas]) {
    return MAPA_ESTADOS_LEGIBLES[enMinusculas];
  }

  // Fallback: convertir formato SNAKE_CASE a oración capitalizada
  return limpio
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/^./, (c) => c.toUpperCase());
}

