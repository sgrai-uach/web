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

  it('BUG-H35-WEB-05: impide retroceso de estado ante eventos tardíos y evita notificaciones duplicadas', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeTrazabilidad(listener);

    setTrazabilidadEstado('mis-mono', 'PENDIENTE_ENVIO', 'inc-mono');
    setTrazabilidadEstado('mis-mono', 'ENVIADA');
    setTrazabilidadEstado('mis-mono', 'RECIBIDA');
    setTrazabilidadEstado('mis-mono', 'LEIDA');
    expect(listener).toHaveBeenCalledTimes(4);

    // Eventos fuera de orden o repetidos no deben degradar ni disparar renders extra
    setTrazabilidadEstado('mis-mono', 'RECIBIDA', 'inc-mono');
    setTrazabilidadEstado('mis-mono', 'ENVIADA');
    setTrazabilidadEstado('mis-mono', 'PENDIENTE_ENVIO');
    setTrazabilidadEstado('mis-mono', 'LEIDA');

    expect(getTrazabilidadEstado('mis-mono')).toBe('LEIDA');
    expect(getTrazabilidadPorIncidente('inc-mono')).toBe('LEIDA');
    expect(listener).toHaveBeenCalledTimes(4);

    // Vincular otra misión con estado inferior no debe degradar incidente ya en LEIDA
    setTrazabilidadEstado('mis-mono-anterior', 'ENVIADA');
    listener.mockClear();
    vincularMisionIncidente('mis-mono-anterior', 'inc-mono');
    expect(getTrazabilidadPorIncidente('inc-mono')).toBe('LEIDA');
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  it('BUG-H35-WEB-07: rechaza misionId vacío o estados fuera de dominio sin corromper la caché', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeTrazabilidad(listener);

    setTrazabilidadEstado('', 'RECIBIDA', 'inc-bad');
    setTrazabilidadEstado('   ', 'LEIDA');
    setTrazabilidadEstado('mis-bad', 'ESTADO_DESCONOCIDO' as never, 'inc-bad');

    expect(getTrazabilidadEstado('mis-bad')).toBeUndefined();
    expect(getTrazabilidadPorIncidente('inc-bad')).toBeUndefined();
    expect(listener).not.toHaveBeenCalled();

    unsubscribe();
  });
});

