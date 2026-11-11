import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  clearTrazabilidadCache,
  getIncidentePorMision,
  getSnapshotTrazabilidadIncidentes,
  getSnapshotTrazabilidadMisiones,
  getTrazabilidadEstado,
  getTrazabilidadPorIncidente,
  setTrazabilidadEstado,
  subscribeTrazabilidad,
  vincularMisionIncidente,
} from '../trazabilidadStore';

describe('trazabilidadStore', () => {
  beforeEach(() => {
    clearTrazabilidadCache();
  });

  it('guarda y recupera estados por misionId e incidenteId en memoria y localStorage', () => {
    setTrazabilidadEstado('mis-1', 'PENDIENTE_ENVIO', 'inc-1');

    expect(getTrazabilidadEstado('mis-1')).toBe('PENDIENTE_ENVIO');
    expect(getTrazabilidadPorIncidente('inc-1')).toBe('PENDIENTE_ENVIO');
    expect(getIncidentePorMision('mis-1')).toBe('inc-1');

    const raw = window.localStorage.getItem('sgrai_trazabilidad_notificaciones_v2');
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!).incidentes['inc-1']).toBe('PENDIENTE_ENVIO');
  });

  it('propaga actualizaciones por misionId hacia incidenteId vinculado aunque el vínculo sea previo o posterior', () => {
    // Evento llega antes de conocer el incidente padre
    setTrazabilidadEstado('mis-2', 'RECIBIDA');
    expect(getTrazabilidadPorIncidente('inc-2')).toBeUndefined();

    // Se vincula al cargar detalle de misión o incidente -> propaga al instante
    vincularMisionIncidente('mis-2', 'inc-2');
    expect(getTrazabilidadPorIncidente('inc-2')).toBe('RECIBIDA');

    // Nueva transición sin pasar incidenteId -> actualiza ambos snapshots
    setTrazabilidadEstado('mis-2', 'LEIDA');
    expect(getSnapshotTrazabilidadMisiones()['mis-2']).toBe('LEIDA');
    expect(getSnapshotTrazabilidadIncidentes()['inc-2']).toBe('LEIDA');
  });

  it('notifica a los suscriptores cuando cambia la trazabilidad y permite desuscribirse', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeTrazabilidad(listener);

    setTrazabilidadEstado('mis-3', 'ENVIADA', 'inc-3');
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    setTrazabilidadEstado('mis-3', 'LEIDA');
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

