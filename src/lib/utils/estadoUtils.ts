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
  PRIORIDAD_ASIGNADA: 'Prioridad evaluada y asignada en terreno',
  PRIORIDAD_RECTIFICADA: 'Reporte de evaluación y prioridad rectificados en terreno',
  MISION_DESPACHADA: 'Misión despachada',
  MISION_ACEPTADA: 'Misión aceptada',
  EN_RUTA: 'En ruta al sitio',
  LLEGADA_A_SITIO: 'Llegada al lugar',
  EVALUACION_INICIADA: 'Evaluación iniciada',
  EVALUACION_FINALIZADA: 'Evaluación finalizada',
  MISION_COMPLETADA: 'Misión completada',
  MISION_RECHAZADA: 'Misión rechazada',
  MISION_CANCELADA: 'Misión cancelada',

  // Nivel de compromiso de vivienda (HU-38)
  SIN_DANO: 'Sin daño habitacional',
  LEVE: 'Daño leve',
  MODERADO: 'Daño moderado',
  GRAVE_INHABITABLE: 'Grave / Inhabitable',

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
 * Retorna la denominación legible del nivel de compromiso de vivienda constatado en terreno (HU-38).
 */
export function formatearCompromisoVivienda(
  nivel?: string | null,
  fallback = 'No especificado'
): string {
  if (!nivel || typeof nivel !== 'string' || nivel.trim() === '') {
    return fallback;
  }

  const limpio = nivel.trim().toUpperCase();
  const mapaCompromiso: Record<string, string> = {
    SIN_DANO: 'Sin daño habitacional',
    LEVE: 'Daño leve (Habitable)',
    LEVE_HABITABLE: 'Daño leve (Habitable)',
    MODERADO: 'Daño moderado (Parcial)',
    MODERADO_PARCIAL: 'Daño moderado (Parcial)',
    GRAVE_INHABITABLE: 'Grave / Inhabitable',
    DESTRUCCION_TOTAL: 'Destrucción total',
  };

  return mapaCompromiso[limpio] || formatearEstado(nivel, fallback);
}

/**
 * Retorna la variante semántica de Chip para un nivel de compromiso habitacional.
 */
export function obtenerVarianteCompromisoVivienda(
  nivel?: string | null
): 'neutral' | 'teal' | 'warning' | 'danger' {
  if (!nivel || typeof nivel !== 'string') return 'neutral';
  const limpio = nivel.trim().toUpperCase();
  if (limpio === 'DESTRUCCION_TOTAL' || limpio === 'GRAVE_INHABITABLE') return 'danger';
  if (limpio === 'MODERADO_PARCIAL' || limpio === 'MODERADO') return 'warning';
  if (limpio === 'LEVE_HABITABLE' || limpio === 'LEVE') return 'teal';
  return 'neutral';
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

/**
 * Retorna la denominación amigable del tipo táctico de misión.
 */
export function formatearTipoMision(
  tipo?: string | null,
  fallback = 'Misión operativa'
): string {
  if (!tipo || typeof tipo !== 'string' || tipo.trim() === '') {
    return fallback;
  }

  const limpio = tipo.trim().toUpperCase();
  const mapaTipos: Record<string, string> = {
    VERIFICACION: 'Verificación en terreno',
    ATENCION_CUADRILLA: 'Atención de cuadrilla',
    PREVENCION: 'Operación preventiva',
    RECUPERACION: 'Recuperación de infraestructura',
    ASISTENCIA_SOCIAL: 'Asistencia social (FIBE)',
    EVALUACION_INICIAL: 'Evaluación inicial',
  };

  return mapaTipos[limpio] || formatearEstado(tipo, fallback);
}

export interface ChipEstadoMision {
  label: string;
  color: string;
  bg: string;
  borderColor: string;
}

/**
 * Retorna la configuración de estilos institucionales y texto legible
 * para chips/badges de estado de misiones en tarjetas y vistas de detalle.
 */
export function obtenerChipEstadoMision(estado?: string | null): ChipEstadoMision {
  const limpio = (estado || '').trim().toUpperCase();

  switch (limpio) {
    case 'EN_CURSO':
      return {
        label: 'En curso',
        color: 'var(--color-warning, #E65100)',
        bg: 'var(--color-warning-bg, #FFF3E0)',
        borderColor: 'var(--color-warning, #E65100)',
      };
    case 'DESPACHADA':
      return {
        label: 'Despachada',
        color: 'var(--color-primary-teal, #1B6F7D)',
        bg: 'var(--color-info-bg, #E0F2F1)',
        borderColor: 'var(--color-primary-teal, #1B6F7D)',
      };
    case 'COMPLETADA':
      return {
        label: 'Completada',
        color: 'var(--color-success, #2E7D32)',
        bg: 'var(--color-success-bg, #E8F5E9)',
        borderColor: 'var(--color-success, #2E7D32)',
      };
    case 'RECHAZADA':
      return {
        label: 'Rechazada',
        color: 'var(--color-danger, #D32F2F)',
        bg: 'var(--color-danger-bg, #FFEBEE)',
        borderColor: 'var(--color-danger, #D32F2F)',
      };
    case 'PLANIFICADA':
      return {
        label: 'Planificada',
        color: 'var(--color-charcoal, #3B3F45)',
        bg: 'var(--color-bg-light, #ECEFF3)',
        borderColor: '#CBD5E1',
      };
    case 'CANCELADA':
      return {
        label: 'Cancelada',
        color: 'var(--color-text-muted, #5F676E)',
        bg: 'var(--color-bg-light, #ECEFF3)',
        borderColor: '#CBD5E1',
      };
    default:
      return {
        label: formatearEstado(estado, 'Desconocido'),
        color: 'var(--color-charcoal, #3B3F45)',
        bg: 'var(--color-bg-light, #ECEFF3)',
        borderColor: '#CBD5E1',
      };
  }
}

export const MAPA_FUENTES_ORIGEN: Record<string, string> = {
  WEB: 'Portal Web',
  CHATBOT: 'Chatbot Municipal',
  LLAMADA_TELEFONICA: 'Central Telefónica',
  LLAMADA: 'Central Telefónica',
  FUNCIONARIO_TERRENO: 'Funcionario en Terreno',
  TERRENO: 'Funcionario en Terreno',
  SENAPRED: 'SENAPRED',
};

/**
 * Convierte un valor de enum de fuente u origen del reporte (ej. 'LLAMADA_TELEFONICA')
 * en un texto amigable para el usuario final (ej. 'Central Telefónica').
 */
export function formatearFuenteOrigen(
  fuente?: string | null,
  fallback = 'No especificado'
): string {
  if (!fuente || typeof fuente !== 'string') {
    return fallback;
  }
  const limpio = fuente.trim().toUpperCase();
  if (!limpio) {
    return fallback;
  }
  if (MAPA_FUENTES_ORIGEN[limpio]) {
    return MAPA_FUENTES_ORIGEN[limpio];
  }
  return formatearEstado(fuente, fallback);
}

/**
 * Determina si una justificación o descripción indica explícitamente que la
 * tipología fue ratificada sin modificaciones en terreno.
 */
export function esJustificacionSinCambios(texto?: string | null): boolean {
  if (!texto || typeof texto !== 'string') return false;
  return /sin variaciones|sin cambios|sin modificaciones|ratificada en terreno/i.test(texto);
}

/**
 * Determina si la tipología fue efectivamente modificada entre el valor previo
 * y el constatado en terreno. Retorna false si ambos coinciden (ignorando
 * mayúsculas y espacios) o si alguno no está definido.
 */
export function fueTipologiaModificada(
  tipoAnterior?: string | null,
  tipoNuevo?: string | null
): boolean {
  if (!tipoAnterior || !tipoNuevo) return false;
  const ant = tipoAnterior.trim().toLowerCase();
  const nue = tipoNuevo.trim().toLowerCase();
  if (!ant || !nue) return false;
  return ant !== nue;
}

/**
 * Evalúa si un hito de bitácora de tipo TIPOLOGIA_RECLASIFICADA corresponde
 * en realidad a una ratificación sin cambios de tipología.
 */
export function esHitoTipologiaSinCambios(hito: {
  hito?: string | null;
  descripcion?: string | null;
  metadatos?: Record<string, unknown> | null;
}): boolean {
  if (hito.hito !== 'TIPOLOGIA_RECLASIFICADA') return false;
  const meta = hito.metadatos;
  if (meta && typeof meta === 'object') {
    const ant = typeof meta.tipoAnterior === 'string' ? meta.tipoAnterior.trim() : '';
    const nue = typeof meta.tipoNuevo === 'string' ? meta.tipoNuevo.trim() : '';
    if (ant && nue) {
      return !fueTipologiaModificada(ant, nue);
    }
  }
  return esJustificacionSinCambios(hito.descripcion);
}



