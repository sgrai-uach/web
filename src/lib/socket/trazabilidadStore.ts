import type { EstadoTrazabilidadNotificacion } from '@/services/incidentesService';

const STORAGE_KEY = 'sgrai_trazabilidad_notificaciones';
const memoryCache = new Map<string, EstadoTrazabilidadNotificacion>();
let hydratedFromStorage = false;

function esEstadoValido(valor: unknown): valor is EstadoTrazabilidadNotificacion {
  return (
    valor === 'PENDIENTE_ENVIO' ||
    valor === 'ENVIADA' ||
    valor === 'RECIBIDA' ||
    valor === 'LEIDA'
  );
}

function ensureHydrated(): void {
  if (hydratedFromStorage || typeof window === 'undefined') return;
  hydratedFromStorage = true;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (parsed && typeof parsed === 'object') {
      for (const [misionId, estado] of Object.entries(parsed)) {
        if (esEstadoValido(estado)) {
          memoryCache.set(misionId, estado);
        }
      }
    }
  } catch {
    // Ignorar errores de acceso a sessionStorage en entornos restringidos
  }
}

function persistCache(): void {
  if (typeof window === 'undefined') return;
  try {
    const obj: Record<string, EstadoTrazabilidadNotificacion> = {};
    memoryCache.forEach((estado, misionId) => {
      obj[misionId] = estado;
    });
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch {
    // Ignorar errores de cuota o acceso a sessionStorage
  }
}

/**
 * Registra en memoria y sessionStorage el último estado de trazabilidad conocido
 * para una misión operativa, permitiendo conservar el indicador al reabrir el drawer
 * o recargar la vista cuando el endpoint de detalle aún no retorna el campo.
 */
export function setTrazabilidadEstado(
  misionId: string,
  estado: EstadoTrazabilidadNotificacion
): void {
  ensureHydrated();
  memoryCache.set(misionId, estado);
  persistCache();
}

/**
 * Recupera el último estado de trazabilidad conocido para una misión operativa.
 */
export function getTrazabilidadEstado(
  misionId: string
): EstadoTrazabilidadNotificacion | undefined {
  ensureHydrated();
  return memoryCache.get(misionId);
}

/**
 * Limpia el caché en memoria y sessionStorage (útil en pruebas unitarias).
 */
export function clearTrazabilidadCache(): void {
  memoryCache.clear();
  hydratedFromStorage = false;
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignorar errores de acceso a sessionStorage
    }
  }
}

