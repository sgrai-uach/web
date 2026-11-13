import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEncargadoKanbanSocket } from '../useEncargadoKanbanSocket';
import { getSocket } from '@/lib/socket/client';

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

  it('debe procesar reclasificación de tipología en terreno emitiendo string amigable en ultimoEvento', () => {
    const socket = getSocket();
    const onIncidenteActualizado = vi.fn();

    const { result } = renderHook(() =>
      useEncargadoKanbanSocket({
        onIncidenteActualizado,
      })
    );

    const payloadReclasificado = {
      evento: 'incidente:actualizado' as const,
      datos: {
        id: '50000000-0000-4000-8000-000000000001',
        codigo: 'INC-2026-001',
        nuevoEstado: 'VERIFICANDO' as const,
        prioridad: 'ALTA' as const,
        tipoIncidenteId: '40000000-0000-4000-8000-000000000001',
        tipoAfectacion: 'Inundación',
        justificacion: 'Tras evaluación presencial se constata desborde de cauce con ingreso de agua.',
        actualizadoEn: '2026-11-10T03:30:00.000Z',
      },
      emitidoEn: '2026-11-10T03:30:00.000Z',
    };

    act(() => {
      (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger(
        'incidente:actualizado',
        payloadReclasificado
      );
    });

    expect(onIncidenteActualizado).toHaveBeenCalledWith(payloadReclasificado);
    expect(result.current.ultimoEvento).toContain('Tipología reclasificada: INC-2026-001 a Inundación (Prioridad: Alta)');
  });

  it('debe limpiar listeners y emitir salir al desmontar', () => {
    const socket = getSocket();

    const { unmount } = renderHook(() => useEncargadoKanbanSocket());

    unmount();

    expect(socket.off).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(socket.off).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(socket.off).toHaveBeenCalledWith('incidente:creado', expect.any(Function));
    expect(socket.off).toHaveBeenCalledWith('incidente:actualizado', expect.any(Function));
    expect(socket.emit).toHaveBeenCalledWith('leave', 'encargado');
    expect(socket.emit).toHaveBeenCalledWith('salir', 'sala:encargados');
    expect(socket.emit).toHaveBeenCalledWith('leave', 'mapa');
    expect(socket.emit).toHaveBeenCalledWith('salir', 'mapa');
  });

  it('debe deduplicar eventos incidente:actualizado repetidos por múltiples salas', () => {
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
        id: 'inc-dup-1',
        codigo: 'INC-948888-846',
        nuevoEstado: 'VERIFICANDO' as const,
        prioridad: 'MEDIA' as const,
        actualizadoEn: '2026-11-13T12:00:00Z',
      },
      emitidoEn: '2026-11-13T12:00:00Z',
    };

    act(() => {
      const trigger = (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger;
      trigger('incidente:actualizado', payload);
      trigger('incidente:actualizado', payload);
      trigger('incidente:actualizado', payload);
    });

    expect(onIncidenteActualizado).toHaveBeenCalledTimes(1);
  });

  it('debe marcar esSintetico: true al sintetizar actualización desde mision:actualizada en EN_CURSO', () => {
    const socket = getSocket();
    const onIncidenteActualizado = vi.fn();

    renderHook(() =>
      useEncargadoKanbanSocket({
        onIncidenteActualizado,
      })
    );

    act(() => {
      const trigger = (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger;
      trigger('mision:actualizada', {
        incidenteId: 'inc-mision-1',
        estado: 'EN_CURSO',
        tipoMision: 'VERIFICACION',
        codigo: 'MIS-001',
      });
      trigger('mision:actualizada', {
        incidenteId: 'inc-mision-1',
        estado: 'EN_CURSO',
        tipoMision: 'VERIFICACION',
        codigo: 'MIS-001',
      });
    });

    expect(onIncidenteActualizado).toHaveBeenCalledTimes(1);
    expect(onIncidenteActualizado).toHaveBeenCalledWith(
      expect.objectContaining({
        esSintetico: true,
        datos: expect.objectContaining({
          id: 'inc-mision-1',
          nuevoEstado: 'VERIFICANDO',
        }),
      })
    );
  });

  it('debe reflejar en ultimoEvento cuando la tipología fue confirmada sin cambios', () => {
    const socket = getSocket();
    const onIncidenteActualizado = vi.fn();

    const { result } = renderHook(() =>
      useEncargadoKanbanSocket({
        onIncidenteActualizado,
      })
    );

    act(() => {
      const trigger = (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger;
      trigger('incidente:actualizado', {
        evento: 'incidente:actualizado',
        datos: {
          id: 'inc-rat-1',
          codigo: 'INC-948888-846',
          nuevoEstado: 'VERIFICANDO',
          prioridad: 'MEDIA',
          tipoAnterior: 'Deslizamiento',
          tipoAfectacion: 'Deslizamiento',
          justificacion: 'Tipología constatada y ratificada en terreno sin variaciones.',
          actualizadoEn: '2026-11-13T15:21:38Z',
        },
      });
    });

    expect(result.current.ultimoEvento).toContain('Tipología confirmada sin cambios: INC-948888-846 (Deslizamiento');
  });
});
