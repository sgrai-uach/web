import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useEncargadoKanbanSocket,
  type NotificacionTrazabilidadPayload,
} from '../useEncargadoKanbanSocket';
import { getSocket } from '@/lib/socket/client';
import {
  clearTrazabilidadCache,
  getTrazabilidadEstado,
} from '@/lib/socket/trazabilidadStore';

vi.mock('@/lib/socket/client', () => {
  const listeners: Record<string, ((...args: unknown[]) => void)[]> = {};

  const mockSocket = {
    connected: false,
    connect: vi.fn(),
    emit: vi.fn(),
    on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(handler);
      return mockSocket;
    }),
    off: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter((h) => h !== handler);
      }
      return mockSocket;
    }),
    // Helper para tests
    _trigger: (event: string, payload?: unknown) => {
      if (listeners[event]) {
        listeners[event].forEach((cb) => cb(payload));
      }
    },
    _clear: () => {
      Object.keys(listeners).forEach((k) => delete listeners[k]);
    },
  };

  return {
    getSocket: () => mockSocket,
  };
});

describe('useEncargadoKanbanSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearTrazabilidadCache();
    const socket = getSocket() as unknown as { _clear: () => void; connected: boolean };
    socket._clear();
    socket.connected = false;
  });

  it('debe conectar el socket y unirse a sala:encargados al montar', () => {
    const socket = getSocket();

    renderHook(() => useEncargadoKanbanSocket());

    expect(socket.connect).toHaveBeenCalled();
    expect(socket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith('incidente:creado', expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith('incidente:actualizado', expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith('notificacion:trazabilidad_actualizada', expect.any(Function));

    // Simular evento connect
    act(() => {
      (socket as unknown as { _trigger: (ev: string) => void })._trigger('connect');
    });

    expect(socket.emit).toHaveBeenCalledWith('join', 'encargado');
    expect(socket.emit).toHaveBeenCalledWith('unirse', 'sala:encargados');
    expect(socket.emit).toHaveBeenCalledWith('join', 'mapa');
    expect(socket.emit).toHaveBeenCalledWith('unirse', 'mapa');
  });

  it('debe escuchar incidente:creado e invocar el callback onIncidenteCreado', () => {
    const socket = getSocket();
    const onIncidenteCreado = vi.fn();

    renderHook(() =>
      useEncargadoKanbanSocket({
        onIncidenteCreado,
      })
    );

    const payload = {
      evento: 'incidente:creado' as const,
      datos: {
        id: 'inc-123',
        codigo: 'INC-12345678',
        tipoAfectacion: 'Inundación',
        direccion: 'Calle Principal 100',
        latitud: -39.81,
        longitud: -73.24,
        estado: 'REPORTADO' as const,
        prioridad: 'ALTA' as const,
        creadoEn: '2026-09-22T10:00:00Z',
      },
      emitidoEn: '2026-09-22T10:00:00Z',
    };

    act(() => {
      (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger(
        'incidente:creado',
        payload
      );
    });

    expect(onIncidenteCreado).toHaveBeenCalledWith(payload);
  });

  it('debe escuchar incidente:actualizado e invocar el callback onIncidenteActualizado', () => {
    const socket = getSocket();
    const onIncidenteActualizado = vi.fn();

    renderHook(() =>
      useEncargadoKanbanSocket({
        onIncidenteActualizado,
      })
    );

    const payload = {
      evento: 'incidente:actualizado' as const,
      datos: {
        id: 'inc-123',
        codigo: 'INC-12345678',
        nuevoEstado: 'EN_ATENCION' as const,
        prioridad: 'CRITICA' as const,
        actualizadoEn: '2026-09-22T10:30:00Z',
      },
      emitidoEn: '2026-09-22T10:30:00Z',
    };

    act(() => {
      (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger(
        'incidente:actualizado',
        payload
      );
    });

    expect(onIncidenteActualizado).toHaveBeenCalledWith(payload);
  });

  it('debe escuchar notificacion:trazabilidad_actualizada e invocar el callback onNotificacionTrazabilidadActualizada', () => {
    const socket = getSocket();
    const onNotificacionTrazabilidadActualizada = vi.fn();

    const { result } = renderHook(() =>
      useEncargadoKanbanSocket({
        onNotificacionTrazabilidadActualizada,
      })
    );

    const payload: NotificacionTrazabilidadPayload = {
      notificacionId: 'notif-987',
      misionId: 'mis-100',
      patrullaId: 'pat-001',
      estado: 'RECIBIDA',
      intentosEnvio: 1,
      creadaAt: '2026-11-10T15:00:00Z',
      enviadaAt: '2026-11-10T15:00:02Z',
      recibidaAt: '2026-11-10T15:00:05Z',
      leidaAt: null,
      actualizadoEn: '2026-11-10T15:00:05Z',
    };

    act(() => {
      (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger(
        'notificacion:trazabilidad_actualizada',
        payload
      );
    });

    expect(onNotificacionTrazabilidadActualizada).toHaveBeenCalledWith(payload);
    expect(result.current.ultimoEvento).toBe('Trazabilidad misión: RECIBIDA');
    expect(getTrazabilidadEstado('mis-100')).toBe('RECIBIDA');
  });

  it('debe limpiar listeners y emitir salir al desmontar', () => {
    const socket = getSocket();

    const { unmount } = renderHook(() => useEncargadoKanbanSocket());

    unmount();

    expect(socket.off).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(socket.off).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(socket.off).toHaveBeenCalledWith('incidente:creado', expect.any(Function));
    expect(socket.off).toHaveBeenCalledWith('incidente:actualizado', expect.any(Function));
    expect(socket.off).toHaveBeenCalledWith('notificacion:trazabilidad_actualizada', expect.any(Function));
    expect(socket.emit).toHaveBeenCalledWith('leave', 'encargado');
    expect(socket.emit).toHaveBeenCalledWith('salir', 'sala:encargados');
    expect(socket.emit).toHaveBeenCalledWith('leave', 'mapa');
    expect(socket.emit).toHaveBeenCalledWith('salir', 'mapa');
  });

  it('BUG-H35-WEB-07: ignora payloads malformados o con estado inválido en notificacion:trazabilidad_actualizada', () => {
    const socket = getSocket();
    const onNotificacionTrazabilidadActualizada = vi.fn();

    const { result } = renderHook(() =>
      useEncargadoKanbanSocket({
        onNotificacionTrazabilidadActualizada,
      })
    );

    const trigger = (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger;

    act(() => {
      trigger('notificacion:trazabilidad_actualizada', null);
      trigger('notificacion:trazabilidad_actualizada', { misionId: '', estado: 'RECIBIDA' });
      trigger('notificacion:trazabilidad_actualizada', {
        misionId: 'mis-invalido',
        estado: 'OTRO_ESTADO',
      });
    });

    expect(onNotificacionTrazabilidadActualizada).not.toHaveBeenCalled();
    expect(result.current.ultimoEvento).toBeNull();
    expect(getTrazabilidadEstado('mis-invalido')).toBeUndefined();
  });
});
