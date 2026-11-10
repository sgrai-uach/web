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

  // Estados de Incidentes
  REPORTADO: 'Reportado',
  VERIFICANDO: 'En verificación',
  EN_ATENCION: 'En atención',
  RESUELTO: 'Resuelto',
  NO_ABORDABLE: 'No abordable',

  // Prioridades
  CRITICA: 'Crítica',
  ALTA: 'Alta',
  MEDIA: 'Media',
  BAJA: 'Baja',

  // Patrullas Verificadoras, Cuadrillas y Misiones
  EN_VERIFICACION: 'En verificación',
  EN_MISION: 'En misión',
  EN_PREVENCION: 'En prevención',
  EN_RECUPERACION: 'En recuperación',
  DESACTIVADA: 'Desactivada',
  INACTIVA: 'Inactiva',
  DESPACHADA: 'Despachada',
  EN_CURSO: 'En curso',
  PLANIFICADA: 'Planificada',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
  RECHAZADA: 'Rechazada',

  // Hitos de Bitácora Operativa
  TIPOLOGIA_RECLASIFICADA: 'Tipología reclasificada en terreno',
  MISION_DESPACHADA: 'Misión despachada',
  MISION_ACEPTADA: 'Misión aceptada',
  EN_RUTA: 'En ruta al sitio',
  LLEGADA_A_SITIO: 'Llegada al lugar',
  EVALUACION_INICIADA: 'Evaluación iniciada',
  EVALUACION_FINALIZADA: 'Evaluación finalizada',
  MISION_COMPLETADA: 'Misión completada',
  MISION_RECHAZADA: 'Misión rechazada',
  MISION_CANCELADA: 'Misión cancelada',

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

  // Si ya es un texto natural con espacios y formato mixto, preservarlo
  if (limpio.includes(' ') && limpio !== enMayusculas && !limpio.includes('_')) {
    return limpio;
  }

  // Fallback: convertir formato SNAKE_CASE a oración capitalizada
  return limpio
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/^./, (c) => c.toUpperCase());
}

/**
 * Retorna la denominación amigable institucional de la prioridad de un incidente o misión.
 */
export function formatearPrioridad(
  prioridad?: string | null,
  fallback = 'Media'
): string {
  if (!prioridad || typeof prioridad !== 'string' || prioridad.trim() === '') {
    return fallback;
  }

  const limpio = prioridad.trim().toUpperCase();
  const mapaPrioridades: Record<string, string> = {
    CRITICA: 'Crítica',
    ALTA: 'Alta',
    MEDIA: 'Media',
    BAJA: 'Baja',
  };

  return mapaPrioridades[limpio] || formatearEstado(prioridad, fallback);
}

/**
 * Retorna la denominación amigable de un hito cronológico de la bitácora operativa.
 */
export function formatearHitoBitacora(
  hito?: string | null,
  fallback = 'Evento registrado'
): string {
  if (!hito || typeof hito !== 'string' || hito.trim() === '') {
    return fallback;
  }

  const limpio = hito.trim();
  if (MAPA_ESTADOS_LEGIBLES[limpio]) {
    return MAPA_ESTADOS_LEGIBLES[limpio];
  }

  const enMayusculas = limpio.toUpperCase();
  if (MAPA_ESTADOS_LEGIBLES[enMayusculas]) {
    return MAPA_ESTADOS_LEGIBLES[enMayusculas];
  }

  return formatearEstado(hito, fallback);
}

