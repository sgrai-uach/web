import type { EstadoTrazabilidadNotificacion } from '@/services/incidentesService';
import {
  esEstadoTrazabilidadValido,
  resolverSiguienteEstadoTrazabilidad,
} from './trazabilidadConfig';

const STORAGE_KEY = 'sgrai_trazabilidad_notificaciones_v2';

interface PersistedTrazabilidadPayload {
  misiones: Record<string, EstadoTrazabilidadNotificacion>;
  incidentes: Record<string, EstadoTrazabilidadNotificacion>;
  misionIncidente: Record<string, string>;
}

const misionEstadoCache = new Map<string, EstadoTrazabilidadNotificacion>();
const incidenteEstadoCache = new Map<string, EstadoTrazabilidadNotificacion>();
const misionIncidenteMap = new Map<string, string>();
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

function sincronizarIncidenteDesdeMision(misionId: string, incidenteId?: string): boolean {
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
  const siguienteIncidente = resolverSiguienteEstadoTrazabilidad(
    incidenteEstadoCache.get(resolvedIncidenteId),
    estadoMision
  );
  if (siguienteIncidente) {
    incidenteEstadoCache.set(resolvedIncidenteId, siguienteIncidente);
    huboCambio = true;
  }

  return huboCambio;
}

/**
 * Registra en memoria y localStorage el último estado de trazabilidad conocido
 * para una misión operativa (y opcionalmente su incidente asociado), garantizando
 * progresión monotónica e idempotencia.
 */
export function setTrazabilidadEstado(
  misionId: string,
  estado: EstadoTrazabilidadNotificacion,
  incidenteId?: string
): void {
  if (typeof misionId !== 'string' || !misionId.trim()) return;
  if (!esEstadoTrazabilidadValido(estado)) return;

  ensureHydrated();
  let huboCambio = false;

  const siguienteMision = resolverSiguienteEstadoTrazabilidad(
    misionEstadoCache.get(misionId),
    estado
  );
  if (siguienteMision) {
    misionEstadoCache.set(misionId, siguienteMision);
    huboCambio = true;
  }

  if (sincronizarIncidenteDesdeMision(misionId, incidenteId)) {
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
