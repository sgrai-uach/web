import type {
  EstadoMision,
  MisionActualizadaPayload,
  MisionBitacoraHito,
  MisionHitoRegistradoPayload,
} from '@/types/misiones';

export interface ConfigHitoMision {
  codigo: string;
  etiqueta: string;
  esLlegadaTerreno: boolean;
  esRechazo: boolean;
  esReporteTerreno: boolean;
}

const HITO_ETIQUETAS: Record<string, Omit<ConfigHitoMision, 'codigo'>> = {
  LLEGADA_TERRENO: {
    etiqueta: 'Llegada a Terreno',
    esLlegadaTerreno: true,
    esRechazo: false,
    esReporteTerreno: false,
  },
  MISION_RECHAZADA: {
    etiqueta: 'Misión Rechazada en Terreno',
    esLlegadaTerreno: false,
    esRechazo: true,
    esReporteTerreno: false,
  },
  RECHAZO_MISION: {
    etiqueta: 'Misión Rechazada en Terreno',
    esLlegadaTerreno: false,
    esRechazo: true,
    esReporteTerreno: false,
  },
  REPORTE_TERRENO: {
    etiqueta: 'Reporte Técnico Emitido',
    esLlegadaTerreno: false,
    esRechazo: false,
    esReporteTerreno: true,
  },
  MISION_ACEPTADA: {
    etiqueta: 'Misión Aceptada por Unidad',
    esLlegadaTerreno: false,
    esRechazo: false,
    esReporteTerreno: false,
  },
  CUADRILLA_DESPACHADA: {
    etiqueta: 'Cuadrilla Despachada',
    esLlegadaTerreno: false,
    esRechazo: false,
    esReporteTerreno: false,
  },
  PATRULLA_DESPACHADA: {
    etiqueta: 'Patrulla Verificadora Despachada',
    esLlegadaTerreno: false,
    esRechazo: false,
    esReporteTerreno: false,
  },
};

const ESTADOS_VALIDOS: ReadonlySet<string> = new Set([
  'PLANIFICADA',
  'DESPACHADA',
  'EN_CURSO',
  'EN_PROCESO',
  'COMPLETADA',
  'CANCELADA',
  'RECHAZADA',
]);

export interface BadgeEstadoMisionInfo {
  estado: EstadoMision;
  label: string;
  bg: string;
  color: string;
}

const BADGE_ESTADO_MAP: Record<EstadoMision, Omit<BadgeEstadoMisionInfo, 'estado'>> = {
  PLANIFICADA: {
    label: 'Planificada',
    bg: 'var(--color-bg-light, #ECEFF3)',
    color: 'var(--color-text-dark, #2B2B2B)',
  },
  DESPACHADA: {
    label: 'Despachada',
    bg: 'var(--color-info-bg, #E0F2F1)',
    color: 'var(--color-primary-teal, #1B6F7D)',
  },
  EN_CURSO: {
    label: 'En Trabajos de Terreno',
    bg: 'var(--color-warning-bg, #FFF3E0)',
    color: 'var(--color-warning, #E65100)',
  },
  EN_PROCESO: {
    label: 'En Trabajos de Terreno',
    bg: 'var(--color-warning-bg, #FFF3E0)',
    color: 'var(--color-warning, #E65100)',
  },
  COMPLETADA: {
    label: 'Completada',
    bg: 'var(--color-success-bg, #E8F5E9)',
    color: 'var(--color-success, #2E7D32)',
  },
  CANCELADA: {
    label: 'Cancelada',
    bg: 'var(--color-bg-light, #ECEFF3)',
    color: 'var(--color-text-muted, #5F676E)',
  },
  RECHAZADA: {
    label: 'Rechazada',
    bg: 'var(--color-danger-bg, #FFEBEE)',
    color: 'var(--color-danger, #D32F2F)',
  },
};

/**
 * Formatea una marca ISO 8601 a fecha y hora exacta en zona horaria Chile Continental (America/Santiago).
 */
export function formatearFechaHoraChile(isoString: string): { fecha: string; hora: string } {
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) {
    return { fecha: isoString, hora: '' };
  }

  const fecha = new Intl.DateTimeFormat('es-CL', {
    timeZone: 'America/Santiago',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsed);

  const hora = new Intl.DateTimeFormat('es-CL', {
    timeZone: 'America/Santiago',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(parsed);

  return { fecha, hora };
}

/**
 * Normaliza un código de estado de misión recibido por API o WebSocket.
 */
export function normalizarEstadoMision(estado?: string | null): EstadoMision {
  const upper = typeof estado === 'string' ? estado.trim().toUpperCase() : '';
  if (upper === 'EN_TERRENO' || upper === 'EN_RUTA') {
    return 'EN_CURSO';
  }
  if (ESTADOS_VALIDOS.has(upper)) {
    return upper as EstadoMision;
  }
  return 'DESPACHADA';
}

/**
 * Retorna la metadata visual (etiqueta institucional y colores) para un estado de misión.
 */
export function obtenerBadgeEstadoMision(estado?: string | null): BadgeEstadoMisionInfo {
  const normalizado = normalizarEstadoMision(estado);
  const config = BADGE_ESTADO_MAP[normalizado];
  return {
    estado: normalizado,
    ...config,
  };
}

/**
 * Resuelve la configuración visual y etiqueta legible para un código o título de hito operativo.
 */
export function obtenerConfigHito(hitoValor: string): ConfigHitoMision {
  const limpio = (hitoValor || '').trim();
  const clave = limpio.toUpperCase();

  if (HITO_ETIQUETAS[clave]) {
    return {
      codigo: clave,
      ...HITO_ETIQUETAS[clave],
    };
  }

  const esLlegada = clave === 'LLEGADA_TERRENO' || limpio.toLowerCase() === 'llegada a terreno';
  if (esLlegada) {
    return {
      codigo: 'LLEGADA_TERRENO',
      ...HITO_ETIQUETAS.LLEGADA_TERRENO,
    };
  }

  return {
    codigo: clave || 'EVENTO',
    etiqueta: limpio || 'Evento Operativo',
    esLlegadaTerreno: false,
    esRechazo: false,
    esReporteTerreno: false,
  };
}

/**
 * Normaliza el payload WebSocket `mision:hito_registrado` soportando tanto el contrato
 * plano emitido por sgrai-api como la variante anidada.
 */
export function normalizarPayloadHitoMision(raw: unknown): MisionHitoRegistradoPayload | null {
  if (!raw || typeof raw !== 'object') return null;
  const p = raw as Record<string, unknown>;

  const misionId = typeof p.misionId === 'string' ? p.misionId.trim() : '';
  if (!misionId) return null;

  const hitoRaw = p.hito;
  if (hitoRaw && typeof hitoRaw === 'object') {
    const nested = hitoRaw as Record<string, unknown>;
    const codigo = typeof nested.hito === 'string' ? nested.hito.trim() : '';
    if (!codigo) return null;

    const registradoEn =
      typeof nested.creado_en === 'string'
        ? nested.creado_en
        : typeof p.registradoEn === 'string'
          ? p.registradoEn
          : new Date().toISOString();

    const regId = typeof nested.registrado_por_id === 'string' ? nested.registrado_por_id : null;
    const regObj =
      p.registradoPor && typeof p.registradoPor === 'object'
        ? (p.registradoPor as Record<string, unknown>)
        : null;

    return {
      misionId,
      codigoMision: typeof p.codigoMision === 'string' ? p.codigoMision : undefined,
      hitoId: typeof nested.id === 'string' ? nested.id : undefined,
      hito: codigo,
      descripcion: typeof nested.descripcion === 'string' ? nested.descripcion : '',
      latitud: typeof nested.latitud === 'number' ? nested.latitud : null,
      longitud: typeof nested.longitud === 'number' ? nested.longitud : null,
      registradoPor: regObj
        ? {
            id: typeof regObj.id === 'string' ? regObj.id : regId || '',
            nombre: typeof regObj.nombre === 'string' ? regObj.nombre : '',
          }
        : regId
          ? { id: regId, nombre: '' }
          : null,
      registradoEn,
      nuevoEstadoMision:
        typeof p.nuevoEstadoMision === 'string' ? p.nuevoEstadoMision : undefined,
    };
  }

  const codigo = typeof hitoRaw === 'string' ? hitoRaw.trim() : '';
  if (!codigo) return null;

  const regObj =
    p.registradoPor && typeof p.registradoPor === 'object'
      ? (p.registradoPor as Record<string, unknown>)
      : null;

  return {
    misionId,
    codigoMision: typeof p.codigoMision === 'string' ? p.codigoMision : undefined,
    hitoId: typeof p.hitoId === 'string' ? p.hitoId : undefined,
    hito: codigo,
    descripcion: typeof p.descripcion === 'string' ? p.descripcion : '',
    latitud: typeof p.latitud === 'number' ? p.latitud : null,
    longitud: typeof p.longitud === 'number' ? p.longitud : null,
    registradoPor: regObj
      ? {
          id: typeof regObj.id === 'string' ? regObj.id : '',
          nombre: typeof regObj.nombre === 'string' ? regObj.nombre : '',
        }
      : null,
    registradoEn:
      typeof p.registradoEn === 'string' ? p.registradoEn : new Date().toISOString(),
    nuevoEstadoMision:
      typeof p.nuevoEstadoMision === 'string' ? p.nuevoEstadoMision : undefined,
  };
}

/**
 * Normaliza el payload WebSocket `mision:actualizada`.
 */
export function normalizarPayloadMisionActualizada(raw: unknown): MisionActualizadaPayload | null {
  if (!raw || typeof raw !== 'object') return null;
  const p = raw as Record<string, unknown>;
  const misionId = typeof p.misionId === 'string' ? p.misionId.trim() : '';
  const estado = typeof p.estado === 'string' ? p.estado.trim() : '';
  if (!misionId || !estado) return null;

  return {
    misionId,
    codigo: typeof p.codigo === 'string' ? p.codigo : undefined,
    estado,
    cuadrillaId: typeof p.cuadrillaId === 'string' ? p.cuadrillaId : null,
    actualizadoEn: typeof p.actualizadoEn === 'string' ? p.actualizadoEn : undefined,
  };
}

/**
 * Convierte un payload `mision:hito_registrado` en una entrada de bitácora lista para UI.
 */
export function convertirPayloadABitacoraHito(
  payload: MisionHitoRegistradoPayload
): MisionBitacoraHito {
  const { fecha, hora } = formatearFechaHoraChile(payload.registradoEn);
  const config = obtenerConfigHito(payload.hito);

  return {
    id: payload.hitoId,
    hito: config.etiqueta,
    codigoHito: config.codigo,
    fecha,
    hora,
    timestamp: payload.registradoEn,
    descripcion: payload.descripcion,
    latitud: payload.latitud ?? null,
    longitud: payload.longitud ?? null,
    registradoPorId: payload.registradoPor?.id ?? null,
    registradoPorNombre: payload.registradoPor?.nombre || null,
  };
}

/**
 * Combina hitos provenientes de la API REST con hitos recibidos vía Socket.io,
 * evitando duplicados y manteniendo orden cronológico ascendente.
 */
export function combinarBitacoraConTiempoReal(
  baseBitacora: MisionBitacoraHito[],
  hitosTiempoReal: MisionBitacoraHito[]
): MisionBitacoraHito[] {
  if (hitosTiempoReal.length === 0) return baseBitacora;

  const resultado: MisionBitacoraHito[] = [...baseBitacora];

  for (const nuevo of hitosTiempoReal) {
    const configNuevo = obtenerConfigHito(nuevo.codigoHito || nuevo.hito);
    const yaExiste = resultado.some((existente) => {
      if (nuevo.id && existente.id && nuevo.id === existente.id) return true;
      const configExistente = obtenerConfigHito(existente.codigoHito || existente.hito);
      if (configExistente.codigo === configNuevo.codigo) {
        if (configNuevo.esLlegadaTerreno) return true;
        if (existente.timestamp === nuevo.timestamp) return true;
      }
      return false;
    });

    if (!yaExiste) {
      resultado.push(nuevo);
    }
  }

  return resultado.sort((a, b) => {
    const tA = new Date(a.timestamp).getTime();
    const tB = new Date(b.timestamp).getTime();
    if (Number.isNaN(tA) || Number.isNaN(tB)) return 0;
    return tA - tB;
  });
}
