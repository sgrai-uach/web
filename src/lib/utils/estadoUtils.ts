/**
 * Utilidades para formatear estados operativos, de recursos y de patrullas
 * en denominaciones legibles para el usuario final institucional, eliminando
 * el uso de valores crudos de enums en mayúsculas o variables de código.
 */

import type { MaterialConsumidoDetalle } from '@/types/misiones';

export const MAPA_ESTADOS_LEGIBLES: Record<string, string> = {
  // Recursos y Vehículos
  DISPONIBLE: 'Disponible',
  ASIGNADO: 'Asignado',
  EN_USO: 'En uso',
  EN_MANTENCION: 'En mantención',
  BAJO_STOCK: 'Bajo stock',
  NO_DISPONIBLE: 'No disponible',
  BAJA_DEFINITIVA: 'Dado de baja',

  // Estados Finales de Terreno (H68)
  CONTROLADO: 'Controlado',
  ESTABLE: 'Estable',
  FINALIZADO: 'Finalizado',
  REQUIERE_SEGUIMIENTO: 'Requiere seguimiento',
  CRITICO: 'Crítico',
  INACCESIBLE: 'Inaccesible',

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
  REPORTE_VERIFICACION_CIERRE: 'Informe técnico de verificación y cierre registrado',
  CIERRE_VERIFICACION: 'Cierre de verificación en terreno',
  INCIDENTE_NO_ABORDABLE: 'Incidente declarado no abordable en terreno',
  VERIFICACION_COMPLETADA: 'Verificación completada',
  CUADRILLA_DESPACHADA: 'Cuadrilla despachada',
  PATRULLA_LIBERADA: 'Patrulla verificadora liberada',
  REPORTE_CUADRILLA: 'Informe técnico final de cuadrilla',
  CIERRE_CUADRILLA: 'Cierre técnico de cuadrilla registrado',
  CUADRILLA_LIBERADA: 'Cuadrilla liberada y disponible',
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

/**
 * Formatea el nombre de una patrulla verificadora evitando duplicar el prefijo
 * "Patrulla" cuando el nombre registrado ya lo incluye (ej. "Patrulla Lenteja").
 */
export function formatearNombrePatrulla(
  nombre?: string | null,
  fallback = 'Patrulla Verificadora'
): string {
  if (!nombre || typeof nombre !== 'string') return fallback;
  const limpio = nombre.trim();
  if (!limpio) return fallback;
  return /^patrulla\b/i.test(limpio) ? limpio : `Patrulla ${limpio}`;
}

/**
 * Formatea el dictamen operativo del informe de verificación y cierre (HU-39 / HU-86).
 */
export function formatearDictamenTerreno(
  dictamen?: string | null,
  fallback = 'No especificado'
): string {
  if (!dictamen || typeof dictamen !== 'string' || dictamen.trim() === '') {
    return fallback;
  }
  const limpio = dictamen.trim().toUpperCase();
  const mapaDictamen: Record<string, string> = {
    REQUIERE_CUADRILLA: 'Requiere Cuadrilla',
    NO_ABORDABLE: 'No Abordable',
  };
  return mapaDictamen[limpio] || formatearEstado(dictamen, fallback);
}

/**
 * Determina si un reporte de terreno corresponde al informe técnico de verificación y cierre (HU-39).
 */
export function esReporteVerificacionCierre(
  reporte?: {
    tipoReporte?: string | null;
    dictamen?: string | null;
    etiquetaReporte?: string | null;
  } | null
): boolean {
  if (!reporte) return false;
  if (typeof reporte.tipoReporte === 'string' && reporte.tipoReporte.trim().toUpperCase() === 'VERIFICACION_CIERRE') {
    return true;
  }
  if (typeof reporte.dictamen === 'string') {
    const dictNorm = reporte.dictamen.trim().toUpperCase();
    if (dictNorm === 'REQUIERE_CUADRILLA' || dictNorm === 'NO_ABORDABLE') {
      return true;
    }
  }
  return false;
}

/**
 * Determina si un reporte de terreno corresponde al informe técnico final de cierre de cuadrilla (HU-68).
 */
export function esReporteCierreCuadrilla(
  reporte?: {
    tipoReporte?: string | null;
    dictamen?: string | null;
    etiquetaReporte?: string | null;
    horasHombre?: number | null;
    materialesConsumidos?: unknown;
  } | null
): boolean {
  if (!reporte) return false;
  if (
    typeof reporte.tipoReporte === 'string' &&
    reporte.tipoReporte.trim().toUpperCase() === 'REPORTE_CUADRILLA'
  ) {
    return true;
  }
  if (esReporteVerificacionCierre(reporte)) {
    return false;
  }
  if (
    typeof reporte.etiquetaReporte === 'string' &&
    /informe\s+t[eé]cnico\s+final\s+de\s+cuadrilla/i.test(reporte.etiquetaReporte)
  ) {
    return true;
  }
  if (typeof reporte.horasHombre === 'number' || Array.isArray(reporte.materialesConsumidos)) {
    return true;
  }
  return false;
}

/**
 * Retorna peso jerárquico para ordenar cronológicamente/semánticamente reportes de terreno:
 * REPORTE_CUADRILLA (2) > VERIFICACION_CIERRE (1) > Evaluación inicial / rectificación (0).
 */
export function obtenerPesoOrdenReporte(
  reporte?: {
    tipoReporte?: string | null;
    dictamen?: string | null;
    etiquetaReporte?: string | null;
    horasHombre?: number | null;
    materialesConsumidos?: unknown;
  } | null
): number {
  if (esReporteCierreCuadrilla(reporte)) return 2;
  if (esReporteVerificacionCierre(reporte)) return 1;
  return 0;
}

/**
 * Formatea el estado final del terreno constatado por la cuadrilla al cierre de la misión (HU-68).
 */
export function formatearEstadoTerreno(
  estado?: string | null,
  fallback = 'No especificado'
): string {
  return formatearEstado(estado, fallback);
}

/**
 * Formatea la cantidad de horas hombre invertidas en faenas de cuadrilla (HU-68).
 */
export function formatearHorasHombre(horas?: number | null): string {
  if (horas === null || horas === undefined || Number.isNaN(Number(horas))) {
    return 'No registrado';
  }
  const num = Number(horas);
  if (num === 1) return '1 hora hombre';
  const textoNumero = Number.isInteger(num)
    ? String(num)
    : num.toLocaleString('es-CL', { maximumFractionDigits: 2 });
  return `${textoNumero} horas hombre`;
}

/**
 * Normaliza la lista de materiales consumidos aceptando tanto camelCase como snake_case desde API o WebSocket.
 */
export function normalizarMaterialesConsumidos(raw: unknown): MaterialConsumidoDetalle[] {
  if (!Array.isArray(raw)) return [];
  const resultado: MaterialConsumidoDetalle[] = [];

  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const obj = item as Record<string, unknown>;
    const recursoIdRaw = obj.recursoId ?? obj.recurso_id;
    const cantidadRaw = obj.cantidad;
    const cantidadNum = typeof cantidadRaw === 'number' ? cantidadRaw : Number(cantidadRaw);

    if (typeof recursoIdRaw !== 'string' || !recursoIdRaw.trim()) continue;
    if (!Number.isFinite(cantidadNum) || cantidadNum <= 0) continue;

    const nombreRaw = obj.nombre ?? obj.recursoNombre ?? obj.nombre_recurso;
    const unidadRaw = obj.unidad;
    const obsRaw = obj.observacion;

    resultado.push({
      recursoId: recursoIdRaw.trim(),
      nombre: typeof nombreRaw === 'string' && nombreRaw.trim() ? nombreRaw.trim() : null,
      cantidad: cantidadNum,
      unidad: typeof unidadRaw === 'string' && unidadRaw.trim() ? unidadRaw.trim() : null,
      observacion: typeof obsRaw === 'string' && obsRaw.trim() ? obsRaw.trim() : null,
    });
  }

  return resultado;
}

/**
 * Formatea una cantidad material acompañada de su unidad o unidad genérica.
 */
export function formatearCantidadMaterial(cantidad: number, unidad?: string | null): string {
  const unidadLimpia = unidad?.trim();
  if (unidadLimpia) {
    return `${cantidad} ${unidadLimpia}`;
  }
  return `${cantidad} ${cantidad === 1 ? 'unidad' : 'unidades'}`;
}

export interface ReporteComparativaPersonasInput {
  id?: string;
  misionId?: string;
  tipoReporte?: string | null;
  dictamen?: string | null;
  etiquetaReporte?: string | null;
  personasAfectadas?: number | null;
  personasAfectadasPrevias?: number | null;
  personasAfectadasModificadas?: boolean;
  versionReporte?: number | null;
  creadoEn?: string;
  detallesEvaluacion?: { nucleoFamiliarTotal?: number } | null;
  evaluacion?: { nucleoFamiliarTotal?: number } | null;
}

export interface ComparativaPersonasAfectadas {
  personasPrevias: number | null;
  fueModificado: boolean;
}

/**
 * Compara la cantidad de personas afectadas del informe de cierre frente al reporte previo
 * de asignación de prioridad en la misma misión (HU-39).
 */
export function calcularComparativaPersonasAfectadas(
  reporteActual: ReporteComparativaPersonasInput,
  listaReportes: ReporteComparativaPersonasInput[] = []
): ComparativaPersonasAfectadas {
  const actualVal =
    typeof reporteActual.personasAfectadas === 'number'
      ? reporteActual.personasAfectadas
      : null;

  if (typeof reporteActual.personasAfectadasPrevias === 'number') {
    const prevVal = reporteActual.personasAfectadasPrevias;
    return {
      personasPrevias: prevVal,
      fueModificado:
        actualVal !== null
          ? actualVal !== prevVal
          : Boolean(reporteActual.personasAfectadasModificadas),
    };
  }

  const reportesPrioridadPrevios = listaReportes
    .filter((r) => {
      if (r.id && reporteActual.id && r.id === reporteActual.id) return false;
      if (r.misionId && reporteActual.misionId && r.misionId !== reporteActual.misionId) {
        return false;
      }
      return !esReporteVerificacionCierre(r) && !esReporteCierreCuadrilla(r);
    })
    .sort((a, b) => {
      const verA = Number(a.versionReporte ?? 0);
      const verB = Number(b.versionReporte ?? 0);
      if (verA !== verB) return verB - verA;
      const tA = a.creadoEn ? new Date(a.creadoEn).getTime() : 0;
      const tB = b.creadoEn ? new Date(b.creadoEn).getTime() : 0;
      return tB - tA;
    });

  const previo = reportesPrioridadPrevios[0];
  if (!previo) {
    return {
      personasPrevias: null,
      fueModificado: Boolean(reporteActual.personasAfectadasModificadas),
    };
  }

  const prevNucleo =
    typeof previo.detallesEvaluacion?.nucleoFamiliarTotal === 'number'
      ? previo.detallesEvaluacion.nucleoFamiliarTotal
      : typeof previo.evaluacion?.nucleoFamiliarTotal === 'number'
        ? previo.evaluacion.nucleoFamiliarTotal
        : typeof previo.personasAfectadas === 'number'
          ? previo.personasAfectadas
          : null;

  if (prevNucleo === null) {
    return {
      personasPrevias: null,
      fueModificado: Boolean(reporteActual.personasAfectadasModificadas),
    };
  }

  return {
    personasPrevias: prevNucleo,
    fueModificado:
      actualVal !== null
        ? actualVal !== prevNucleo
        : Boolean(reporteActual.personasAfectadasModificadas),
  };
}

/**
 * Reemplaza valores crudos de enums (estados, dictámenes, prioridades) y redundancias
 * dentro de descripciones de la bitácora operativa por lenguaje natural institucional.
 */
export function limpiarDescripcionBitacora(desc?: string | null): string {
  if (!desc || typeof desc !== 'string') return '';

  const mapaPrioridades: Record<string, string> = {
    BAJA: 'Baja',
    MEDIA: 'Media',
    ALTA: 'Alta',
    CRITICA: 'Crítica',
  };

  return desc
    // Estados entre paréntesis
    .replace(/\(EN_CURSO\)/gi, '(En curso)')
    .replace(/\(DESPACHADA\)/gi, '(Despachada)')
    .replace(/\(PLANIFICADA\)/gi, '(Planificada)')
    .replace(/\(COMPLETADA\)/gi, '(Completada)')
    .replace(/\(RECHAZADA\)/gi, '(Rechazada)')
    .replace(/\(CANCELADA\)/gi, '(Cancelada)')
    .replace(/\(EN_VERIFICACION\)/gi, '(En verificación)')
    .replace(/\(VERIFICANDO\)/gi, '(En verificación)')
    .replace(/\(REPORTADO\)/gi, '(Reportado)')
    .replace(/\(EN_ATENCION\)/gi, '(En atención)')
    .replace(/\(RESUELTO\)/gi, '(Resuelto)')
    .replace(/\(NO_ABORDABLE\)/gi, '(No abordable)')
    // Dictámenes operativos y estados de terreno final
    .replace(/\bNO_ABORDABLE\b/g, 'No Abordable')
    .replace(/\bREQUIERE_CUADRILLA\b/g, 'Requiere Cuadrilla')
    .replace(/\bREQUIERE_SEGUIMIENTO\b/g, 'Requiere seguimiento')
    .replace(/\bINACCESIBLE\b/g, 'Inaccesible')
    .replace(/\bCONTROLADO\b/g, 'Controlado')
    .replace(/\bESTABLE\b/g, 'Estable')
    .replace(/\bFINALIZADO\b/g, 'Finalizado')
    .replace(/\bCRITICO\b/g, 'Crítico')
    .replace(/\bDISPONIBLE\b/g, 'Disponible')
    // Prioridades exactas en mayúsculas dentro de frases técnicas
    .replace(
      /\b(a|Sugerida:|Prioridad:|Prioridad sugerida:|Prioridad asignada:)\s+(BAJA|MEDIA|ALTA|CRITICA)\b/g,
      (_match, prefijo: string, prio: string) => `${prefijo} ${mapaPrioridades[prio] || prio}`
    )
    // Evitar redundancias "a la patrulla Patrulla X" / "cuadrilla Cuadrilla X"
    .replace(/\bpatrulla\s+Patrulla\b/gi, 'Patrulla')
    .replace(/\bcuadrilla\s+Cuadrilla\b/gi, 'Cuadrilla');
}



