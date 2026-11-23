import {
  combinarBitacoraConTiempoReal,
  convertirPayloadABitacoraHito,
  normalizarEstadoMision,
} from '@/lib/utils/misionHitos';
import type {
  EstadoMision,
  MisionActualizadaPayload,
  MisionBitacoraHito,
  MisionHitoRegistradoPayload,
} from '@/types/misiones';

const misionEstadoCache = new Map<string, EstadoMision>();
const misionHitosCache = new Map<string, MisionBitacoraHito[]>();
const listeners = new Set<() => void>();

function notifyListeners(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Proteger suscripción ante errores de un consumidor
    }
  });
}

export function registrarHitoMisionTiempoReal(payload: MisionHitoRegistradoPayload): void {
  const misionId = payload.misionId?.trim();
  if (!misionId) return;

  const hitoBitacora = convertirPayloadABitacoraHito(payload);
  const actuales = misionHitosCache.get(misionId) ?? [];
  const combinados = combinarBitacoraConTiempoReal(actuales, [hitoBitacora]);
  misionHitosCache.set(misionId, combinados);

  if (payload.nuevoEstadoMision) {
    misionEstadoCache.set(misionId, normalizarEstadoMision(payload.nuevoEstadoMision));
  }

  notifyListeners();
}

export function actualizarEstadoMisionTiempoReal(payload: MisionActualizadaPayload): void {
  const misionId = payload.misionId?.trim();
  if (!misionId || !payload.estado) return;

  misionEstadoCache.set(misionId, normalizarEstadoMision(payload.estado));

  if (payload.hito && payload.hito.hito) {
    const hitoPayload: MisionHitoRegistradoPayload = {
      misionId,
      codigoMision: payload.codigo,
      hitoId: payload.hito.hitoId || payload.hito.id,
      hito: payload.hito.hito,
      descripcion: payload.hito.descripcion || '',
      latitud: payload.hito.latitud ?? null,
      longitud: payload.hito.longitud ?? null,
      registradoPor: payload.hito.registradoPor
        ? payload.hito.registradoPor
        : payload.hito.registradoPorId || payload.hito.registradoPorNombre
          ? {
              id: payload.hito.registradoPorId || '',
              nombre: payload.hito.registradoPorNombre || '',
            }
          : null,
      registradoEn:
        payload.hito.creadoEn ||
        payload.hito.registradoEn ||
        payload.actualizadoEn ||
        new Date().toISOString(),
      nuevoEstadoMision: payload.estado,
    };

    const hitoBitacora = convertirPayloadABitacoraHito(hitoPayload);
    const actuales = misionHitosCache.get(misionId) ?? [];
    misionHitosCache.set(misionId, combinarBitacoraConTiempoReal(actuales, [hitoBitacora]));
  }

  notifyListeners();
}

export function getHitosTiempoRealMision(misionId?: string | null): MisionBitacoraHito[] {
  if (!misionId) return [];
  return misionHitosCache.get(misionId) ?? [];
}

export function getEstadoTiempoRealMision(misionId?: string | null): EstadoMision | undefined {
  if (!misionId) return undefined;
  return misionEstadoCache.get(misionId);
}

export function getSnapshotEstadosMisiones(): Record<string, EstadoMision> {
  return Object.fromEntries(misionEstadoCache.entries());
}

export function subscribeMisionesRealtime(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function clearMisionesRealtimeStore(): void {
  misionEstadoCache.clear();
  misionHitosCache.clear();
  notifyListeners();
}
