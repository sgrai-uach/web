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

const MAPA_TIPOS_MISION: Record<string, string> = {
  VERIFICACION: 'Verificación',
  ATENCION_CUADRILLA: 'Atención de Cuadrilla',
  PREVENCION: 'Prevención',
  RECUPERACION: 'Recuperación',
  ASISTENCIA_SOCIAL: 'Asistencia Social',
};

const MAPA_PRIORIDADES: Record<string, string> = {
  CRITICA: 'Crítica',
  ALTA: 'Alta',
  MEDIA: 'Media',
  BAJA: 'Baja',
};

const MAPA_TIPOLOGIAS: Record<string, string> = {
  INUNDACION: 'Inundación',
  ANEGAMIENTO: 'Anegamiento',
  CAIDA_ARBOL: 'Caída de Árbol',
  CORTE_ENERGIA: 'Corte de Energía',
  INCENDIO: 'Incendio',
  INCENDIO_ESTRUCTURAL: 'Incendio Estructural',
  INCENDIO_FORESTAL: 'Incendio Forestal',
  SOCAVON: 'Socavón',
  DESLIZAMIENTO: 'Deslizamiento',
  DERRUMBE: 'Derrumbe',
  OBSTRUCCION_VIA: 'Obstrucción de Vía',
  DESBORDE_RIO: 'Desborde de Río',
  DERRAME_SUSTANCIAS: 'Derrame de Sustancias',
  OTRO: 'Otro',
};

export function formatearTipoMision(tipo?: string | null, fallback = 'No especificado'): string {
  if (!tipo || typeof tipo !== 'string' || tipo.trim() === '') return fallback;
  const key = tipo.trim().toUpperCase();
  if (MAPA_TIPOS_MISION[key]) return MAPA_TIPOS_MISION[key];
  return key.toLowerCase().replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
}

export function formatearPrioridad(prioridad?: string | null, fallback = 'No especificada'): string {
  if (!prioridad || typeof prioridad !== 'string' || prioridad.trim() === '') return fallback;
  const key = prioridad.trim().toUpperCase();
  if (MAPA_PRIORIDADES[key]) return MAPA_PRIORIDADES[key];
  return key.toLowerCase().replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
}

export function formatearTipologia(tipologia?: string | null, fallback = 'No especificada'): string {
  if (!tipologia || typeof tipologia !== 'string' || tipologia.trim() === '') return fallback;
  const limpio = tipologia.trim();
  const key = limpio.toUpperCase();
  if (MAPA_TIPOLOGIAS[key]) return MAPA_TIPOLOGIAS[key];
  if (/^[A-Z0-9_]+$/.test(limpio)) {
    return limpio.toLowerCase().replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
  }
  return limpio;
}

export function formatearTipoRecurso(esIndividual?: boolean, tipo?: string | null): string {
  if (typeof esIndividual === 'boolean') {
    return esIndividual ? 'Individual' : 'Granel';
  }
  if (!tipo || typeof tipo !== 'string') return 'No especificado';
  const key = tipo.trim().toUpperCase();
  if (key === 'INDIVIDUAL' || key === 'ACTIVO_INDIVIDUAL') return 'Individual';
  if (key === 'GRUPAL' || key === 'GRANEL' || key === 'INSUMO') return 'Granel';
  return formatearEstado(tipo);
}

const ENUM_REEMPLAZOS: Record<string, string> = {
  ...MAPA_ESTADOS_LEGIBLES,
  ...MAPA_TIPOS_MISION,
  ...MAPA_PRIORIDADES,
  INDIVIDUAL: 'Individual',
  GRUPAL: 'Granel',
};

export function humanizarTextoConEnums(texto: string): string {
  return texto.replace(/\b[A-Z][A-Z0-9_]{2,}\b/g, (token) => ENUM_REEMPLAZOS[token] ?? token);
}

