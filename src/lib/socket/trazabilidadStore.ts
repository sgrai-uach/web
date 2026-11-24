import type { EstadoTrazabilidadNotificacion } from '@/services/incidentesService';
import {
  esEstadoTrazabilidadValido,
  resolverSiguienteEstadoTrazabilidad,
  type TipoUnidadTrazabilidad,
} from './trazabilidadConfig';

const STORAGE_KEY = 'sgrai_trazabilidad_notificaciones_v2';

interface PersistedTrazabilidadPayload {
  misiones: Record<string, EstadoTrazabilidadNotificacion>;
  incidentes: Record<string, EstadoTrazabilidadNotificacion>;
  misionIncidente: Record<string, string>;
  incidenteMisionActiva?: Record<string, string>;
  misionTipoUnidad?: Record<string, TipoUnidadTrazabilidad>;
}

const misionEstadoCache = new Map<string, EstadoTrazabilidadNotificacion>();
const incidenteEstadoCache = new Map<string, EstadoTrazabilidadNotificacion>();
const misionIncidenteMap = new Map<string, string>();
const incidenteMisionActivaMap = new Map<string, string>();
const misionTipoUnidadMap = new Map<string, TipoUnidadTrazabilidad>();
const listeners = new Set<() => void>();

let hydratedFromStorage = false;

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function ensureHydrated(): void {
  if (hydratedFromStorage) return;
  const storage = getStorage();
  if (!storage) return;
  hydratedFromStorage = true;

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<PersistedTrazabilidadPayload> | null;
    if (!parsed || typeof parsed !== 'object') return;

    if (parsed.misiones && typeof parsed.misiones === 'object') {
      for (const [misionId, estado] of Object.entries(parsed.misiones)) {
        if (esEstadoTrazabilidadValido(estado)) {
          misionEstadoCache.set(misionId, estado);
        }
      }
    }

    if (parsed.incidentes && typeof parsed.incidentes === 'object') {
      for (const [incidenteId, estado] of Object.entries(parsed.incidentes)) {
        if (esEstadoTrazabilidadValido(estado)) {
          incidenteEstadoCache.set(incidenteId, estado);
        }
      }
    }

    if (parsed.misionIncidente && typeof parsed.misionIncidente === 'object') {
      for (const [misionId, incidenteId] of Object.entries(parsed.misionIncidente)) {
        if (typeof incidenteId === 'string' && incidenteId) {
          misionIncidenteMap.set(misionId, incidenteId);
        }
      }
    }

    if (parsed.incidenteMisionActiva && typeof parsed.incidenteMisionActiva === 'object') {
      for (const [incidenteId, misionId] of Object.entries(parsed.incidenteMisionActiva)) {
        if (typeof misionId === 'string' && misionId) {
          incidenteMisionActivaMap.set(incidenteId, misionId);
        }
      }
    }

    if (parsed.misionTipoUnidad && typeof parsed.misionTipoUnidad === 'object') {
      for (const [misionId, tipo] of Object.entries(parsed.misionTipoUnidad)) {
        if (tipo === 'PATRULLA' || tipo === 'CUADRILLA') {
          misionTipoUnidadMap.set(misionId, tipo);
        }
      }
    }
  } catch {
    // Ignorar errores de acceso o parseo de localStorage
  }
}

function persistCache(): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    const payload: PersistedTrazabilidadPayload = {
      misiones: Object.fromEntries(misionEstadoCache.entries()),
      incidentes: Object.fromEntries(incidenteEstadoCache.entries()),
      misionIncidente: Object.fromEntries(misionIncidenteMap.entries()),
      incidenteMisionActiva: Object.fromEntries(incidenteMisionActivaMap.entries()),
      misionTipoUnidad: Object.fromEntries(misionTipoUnidadMap.entries()),
    };
    storage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignorar errores de cuota o acceso restringido a localStorage
  }
}

function notifyListeners(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Proteger suscripción ante errores de un consumidor
    }
  });
}

function sincronizarIncidenteDesdeMision(
  misionId: string,
  incidenteId?: string,
  reemplazarMisionActiva: boolean = false
): boolean {
  const resolvedIncidenteId =
    (typeof incidenteId === 'string' && incidenteId.trim() ? incidenteId.trim() : undefined) ||
    misionIncidenteMap.get(misionId);

  if (!resolvedIncidenteId) return false;

  let huboCambio = false;
  if (incidenteId && misionIncidenteMap.get(misionId) !== resolvedIncidenteId) {
    misionIncidenteMap.set(misionId, resolvedIncidenteId);
    huboCambio = true;
  }

  const estadoMision = misionEstadoCache.get(misionId);
  const misionActivaActual = incidenteMisionActivaMap.get(resolvedIncidenteId);

  if (reemplazarMisionActiva && misionActivaActual !== misionId) {
    incidenteMisionActivaMap.set(resolvedIncidenteId, misionId);
    if (estadoMision && incidenteEstadoCache.get(resolvedIncidenteId) !== estadoMision) {
      incidenteEstadoCache.set(resolvedIncidenteId, estadoMision);
    }
    return true;
  }

  if (!misionActivaActual) {
    incidenteMisionActivaMap.set(resolvedIncidenteId, misionId);
  }

  const esMisionActiva =
    !misionActivaActual || misionActivaActual === misionId;
  if (esMisionActiva) {
    const siguienteIncidente = resolverSiguienteEstadoTrazabilidad(
      incidenteEstadoCache.get(resolvedIncidenteId),
      estadoMision
    );
    if (siguienteIncidente) {
      incidenteEstadoCache.set(resolvedIncidenteId, siguienteIncidente);
      huboCambio = true;
    }
  }

  return huboCambio;
}

export interface SetTrazabilidadOpciones {
  tipoUnidad?: TipoUnidadTrazabilidad;
  reemplazarMisionActiva?: boolean;
}

/**
 * Registra en memoria y localStorage el último estado de trazabilidad conocido
 * para una misión operativa (y opcionalmente su incidente asociado), garantizando
 * progresión monotónica por misión y soporte multi-misión (patrulla -> cuadrilla).
 */
export function setTrazabilidadEstado(
  misionId: string,
  estado: EstadoTrazabilidadNotificacion,
  incidenteId?: string,
  opciones?: SetTrazabilidadOpciones
): void {
  if (typeof misionId !== 'string' || !misionId.trim()) return;
  if (!esEstadoTrazabilidadValido(estado)) return;

  ensureHydrated();
  let huboCambio = false;

  if (
    opciones?.tipoUnidad &&
    misionTipoUnidadMap.get(misionId) !== opciones.tipoUnidad
  ) {
    misionTipoUnidadMap.set(misionId, opciones.tipoUnidad);
    huboCambio = true;
  }

  const siguienteMision = resolverSiguienteEstadoTrazabilidad(
    misionEstadoCache.get(misionId),
    estado
  );
  if (siguienteMision) {
    misionEstadoCache.set(misionId, siguienteMision);
    huboCambio = true;
  }

  if (
    sincronizarIncidenteDesdeMision(
      misionId,
      incidenteId,
      Boolean(opciones?.reemplazarMisionActiva)
    )
  ) {
    huboCambio = true;
  }

  if (huboCambio) {
    persistCache();
    notifyListeners();
  }
}

/**
 * Registra la relación entre una misión y su incidente padre para reflejar
 * eventos de trazabilidad directamente sobre la tarjeta del tablero Kanban.
 */
export function vincularMisionIncidente(misionId: string, incidenteId: string): void {
  if (typeof misionId !== 'string' || !misionId.trim()) return;
  if (typeof incidenteId !== 'string' || !incidenteId.trim()) return;
  ensureHydrated();

  if (sincronizarIncidenteDesdeMision(misionId, incidenteId)) {
    persistCache();
    notifyListeners();
  }
}

/**
 * Elimina la trazabilidad en caché asociada a una misión rechazada o cancelada.
 * Si era la misión activa del incidente (o se pasa `incidenteId` sin otra misión
 * activa distinta), limpia también la proyección del incidente para evitar mostrar
 * estados obsoletos como "Leída por la cuadrilla".
 */
export function limpiarTrazabilidadMision(misionId: string, incidenteId?: string): void {
  if (typeof misionId !== 'string' || !misionId.trim()) return;
  ensureHydrated();

  const resolvedIncidenteId =
    (typeof incidenteId === 'string' && incidenteId.trim() ? incidenteId.trim() : undefined) ||
    misionIncidenteMap.get(misionId);

  let huboCambio = false;

  if (misionEstadoCache.delete(misionId)) huboCambio = true;
  if (misionTipoUnidadMap.delete(misionId)) huboCambio = true;
  if (misionIncidenteMap.delete(misionId)) huboCambio = true;

  if (resolvedIncidenteId) {
    const misionActivaActual = incidenteMisionActivaMap.get(resolvedIncidenteId);
    if (!misionActivaActual || misionActivaActual === misionId) {
      if (incidenteMisionActivaMap.delete(resolvedIncidenteId)) huboCambio = true;
      if (incidenteEstadoCache.delete(resolvedIncidenteId)) huboCambio = true;
    }
  }

  if (huboCambio) {
    persistCache();
    notifyListeners();
  }
}

/**
 * Limpia la proyección de trazabilidad activa de un incidente cuando no quedan
 * misiones activas (PLANIFICADA, DESPACHADA o EN_CURSO).
 */
export function limpiarTrazabilidadIncidente(incidenteId: string): void {
  if (typeof incidenteId !== 'string' || !incidenteId.trim()) return;
  ensureHydrated();

  let huboCambio = false;
  if (incidenteEstadoCache.delete(incidenteId)) huboCambio = true;
  if (incidenteMisionActivaMap.delete(incidenteId)) huboCambio = true;

  if (huboCambio) {
    persistCache();
    notifyListeners();
  }
}

/**
 * Recupera el último estado de trazabilidad conocido para una misión operativa.
 */
export function getTrazabilidadEstado(
  misionId: string
): EstadoTrazabilidadNotificacion | undefined {
  ensureHydrated();
  return misionEstadoCache.get(misionId);
}

/**
 * Recupera el último estado de trazabilidad conocido para un incidente en el Kanban.
 */
export function getTrazabilidadPorIncidente(
  incidenteId: string
): EstadoTrazabilidadNotificacion | undefined {
  ensureHydrated();
  return incidenteEstadoCache.get(incidenteId);
}

/**
 * Devuelve el incidenteId vinculado en caché para una misión dada, si existe.
 */
export function getIncidentePorMision(misionId: string): string | undefined {
  ensureHydrated();
  return misionIncidenteMap.get(misionId);
}

export function getMisionActivaPorIncidente(incidenteId: string): string | undefined {
  ensureHydrated();
  return incidenteMisionActivaMap.get(incidenteId);
}

export function getTipoUnidadPorMision(
  misionId: string
): TipoUnidadTrazabilidad | undefined {
  ensureHydrated();
  return misionTipoUnidadMap.get(misionId);
}

export function getTipoUnidadPorIncidente(
  incidenteId: string
): TipoUnidadTrazabilidad | undefined {
  ensureHydrated();
  const misionActiva = incidenteMisionActivaMap.get(incidenteId);
  if (!misionActiva) return undefined;
  return misionTipoUnidadMap.get(misionActiva);
}

/**
 * Retorna una instantánea con todos los estados conocidos indexados por incidenteId.
 */
export function getSnapshotTrazabilidadIncidentes(): Record<
  string,
  EstadoTrazabilidadNotificacion
> {
  ensureHydrated();
  return Object.fromEntries(incidenteEstadoCache.entries());
}

/**
 * Retorna una instantánea con todos los estados conocidos indexados por misionId.
 */
export function getSnapshotTrazabilidadMisiones(): Record<
  string,
  EstadoTrazabilidadNotificacion
> {
  ensureHydrated();
  return Object.fromEntries(misionEstadoCache.entries());
}

/**
 * Suscribe un callback a los cambios del caché de trazabilidad y retorna un desuscriptor.
 */
export function subscribeTrazabilidad(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Limpia el caché en memoria y localStorage (útil en pruebas unitarias).
 */
export function clearTrazabilidadCache(): void {
  misionEstadoCache.clear();
  incidenteEstadoCache.clear();
  misionIncidenteMap.clear();
  incidenteMisionActivaMap.clear();
  misionTipoUnidadMap.clear();
  hydratedFromStorage = false;
  const storage = getStorage();
  if (storage) {
    try {
      storage.removeItem(STORAGE_KEY);
    } catch {
      // Ignorar errores de acceso
    }
  }
  notifyListeners();
}
