import type { EstadoTrazabilidadNotificacion } from '@/services/incidentesService';

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

function esEstadoValido(valor: unknown): valor is EstadoTrazabilidadNotificacion {
  return (
    valor === 'PENDIENTE_ENVIO' ||
    valor === 'ENVIADA' ||
    valor === 'RECIBIDA' ||
    valor === 'LEIDA'
  );
}

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
        if (esEstadoValido(estado)) {
          misionEstadoCache.set(misionId, estado);
        }
      }
    }

    if (parsed.incidentes && typeof parsed.incidentes === 'object') {
      for (const [incidenteId, estado] of Object.entries(parsed.incidentes)) {
        if (esEstadoValido(estado)) {
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

/**
 * Registra en memoria y localStorage el último estado de trazabilidad conocido
 * para una misión operativa (y opcionalmente su incidente asociado).
 */
export function setTrazabilidadEstado(
  misionId: string,
  estado: EstadoTrazabilidadNotificacion,
  incidenteId?: string
): void {
  ensureHydrated();
  misionEstadoCache.set(misionId, estado);

  const resolvedIncidenteId = incidenteId || misionIncidenteMap.get(misionId);
  if (incidenteId) {
    misionIncidenteMap.set(misionId, incidenteId);
  }
  if (resolvedIncidenteId) {
    incidenteEstadoCache.set(resolvedIncidenteId, estado);
  }

  persistCache();
  notifyListeners();
}

/**
 * Registra la relación entre una misión y su incidente padre para reflejar
 * eventos de trazabilidad directamente sobre la tarjeta del tablero Kanban.
 */
export function vincularMisionIncidente(misionId: string, incidenteId: string): void {
  if (!misionId || !incidenteId) return;
  ensureHydrated();

  const previo = misionIncidenteMap.get(misionId);
  misionIncidenteMap.set(misionId, incidenteId);

  const estadoMision = misionEstadoCache.get(misionId);
  let huboCambio = previo !== incidenteId;

  if (estadoMision && incidenteEstadoCache.get(incidenteId) !== estadoMision) {
    incidenteEstadoCache.set(incidenteId, estadoMision);
    huboCambio = true;
  }

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
