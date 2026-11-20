import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePrevencionSocket } from '../usePrevencionSocket';
import { getSocket } from '@/lib/socket/client';
import type { EventoPrevencionDTO } from '@/types/evento-prevencion';

vi.mock('@/lib/socket/client', () => {
  const listeners: Record<string, ((...args: unknown[]) => void)[]> = {};

  const mockSocket = {
    connected: false,
    connect: vi.fn(() => {
      mockSocket.connected = true;
    }),
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

describe('usePrevencionSocket (HU-30)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const socket = getSocket() as unknown as { _clear: () => void; connected: boolean };
    socket._clear();
    socket.connected = false;
  });

  const mockEvento: EventoPrevencionDTO = {
    id: 'prev-123',
    codigo: 'PREV-2026-0001',
    nombre: 'Limpieza y monitoreo de sumideros en Angachilla',
    descripcion: 'Monitoreo preventivo del caudal e inspección de alcantarillas por frente de mal tiempo.',
    sector: 'Humedal Angachilla',
    direccionTexto: 'Av. Simpson con Los Robles',
    prioridad: 'ALTA',
    estado: 'PLANIFICADA',
    latitud: -39.8456,
    longitud: -73.2389,
    puntoCritico: {
      id: 'pc-1',
      codigo: 'PC-ANG-01',
      nombre: 'Sector Humedal Angachilla',
    },
    delegacion: {
      id: 'del-1',
      codigo: 'DEL_NORTE',
      nombre: 'Delegación Municipal Norte',
    },
    mision: {
      id: 'mis-123',
      codigo: 'MIS-2026-0006',
      titulo: 'Limpieza de sumideros',
      estado: 'DESPACHADA',
      tipoMision: 'PREVENCION',
    },
    patrulla: {
      id: 'pat-123',
      nombre: 'Patrulla Rápida Centro-Sur',
      estado: 'EN_PREVENCION',
    },
    recursos: [
      {
        recursoId: 'rec-1',
        nombre: 'Sacos de Arena 25kg',
        cantidadAsignada: 5,
      },
    ],
    creadoPorId: 'encargado-1',
    creadoEn: '2026-10-05T06:45:50.867Z',
    actualizadoEn: '2026-10-05T06:45:50.867Z',
  };

  it('debe conectar al socket y unirse a las salas operativas', () => {
    const socket = getSocket();

    renderHook(() => usePrevencionSocket());

    expect(socket.connect).toHaveBeenCalled();
    expect(socket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith('prevencion:creada', expect.any(Function));

    act(() => {
      (socket as unknown as { _trigger: (ev: string) => void })._trigger('connect');
    });

    expect(socket.emit).toHaveBeenCalledWith('unirse', 'encargado');
    expect(socket.emit).toHaveBeenCalledWith('unirse', 'sala:encargados');
    expect(socket.emit).toHaveBeenCalledWith('unirse', 'mapa');
  });

  it('debe invocar onEventoCreado al recibir evento WebSocket prevencion:creada', () => {
    const socket = getSocket();
    const onEventoCreado = vi.fn();

    const { result } = renderHook(() =>
      usePrevencionSocket({
        onEventoCreado,
      })
    );

    act(() => {
      (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger(
        'prevencion:creada',
        mockEvento
      );
    });

    expect(onEventoCreado).toHaveBeenCalledWith(mockEvento);
    expect(result.current.ultimoEvento).toContain('PREV-2026-0001');
    expect(result.current.ultimoEvento).toContain('Humedal Angachilla');
  });

  it('debe limpiar listeners y abandonar salas operativas al desmontar el hook', () => {
    const socket = getSocket();

    const { unmount } = renderHook(() => usePrevencionSocket());

    unmount();

    expect(socket.off).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(socket.off).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(socket.off).toHaveBeenCalledWith('prevencion:creada', expect.any(Function));
    expect(socket.off).toHaveBeenCalledWith('prevencion:actualizada', expect.any(Function));
    expect(socket.off).toHaveBeenCalledWith('recurso:actualizado', expect.any(Function));
    expect(socket.off).toHaveBeenCalledWith('patrulla:actualizada', expect.any(Function));
    expect(socket.emit).toHaveBeenCalledWith('salir', 'encargado');
    expect(socket.emit).toHaveBeenCalledWith('salir', 'sala:encargados');
    expect(socket.emit).toHaveBeenCalledWith('salir', 'mapa');
  });

  it('debe escuchar el evento prevencion:actualizada y disparar onEventoActualizado (H77)', () => {
    const socket = getSocket();
    const onEventoActualizado = vi.fn();

    const { result } = renderHook(() =>
      usePrevencionSocket({
        onEventoActualizado,
      })
    );

    act(() => {
      (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger(
        'prevencion:actualizada',
        mockEvento
      );
    });

    expect(onEventoActualizado).toHaveBeenCalledWith(mockEvento);
    expect(result.current.ultimoEvento).toContain('Prevención actualizada: PREV-2026-0001');
  });

  it('debe filtrar prevencion:actualizada por eventoId y escuchar recurso:actualizado y patrulla:actualizada (HU-33)', () => {
    const socket = getSocket();
    const onPrevencionActualizada = vi.fn();
    const onRecursoActualizado = vi.fn();
    const onPatrullaActualizada = vi.fn();

    renderHook(() =>
      usePrevencionSocket({
        eventoId: 'prev-123',
        onPrevencionActualizada,
        onRecursoActualizado,
        onPatrullaActualizada,
      })
    );

    const payloadOtroEvento = {
      id: 'prev-otro',
      codigo: 'PREV-2026-9999',
      evento: { id: 'prev-otro', codigo: 'PREV-2026-9999' },
    };

    const payloadObjetivo = {
      id: 'prev-123',
      codigo: 'PREV-2026-0001',
      nombre: 'Operativo Angachilla',
      evento: { id: 'prev-123', codigo: 'PREV-2026-0001', nombre: 'Operativo Angachilla', estado: 'PLANIFICADA' },
      mision: { id: 'mis-1', codigo: 'MIS-2026-0010', estado: 'DESPACHADA', tipoMision: 'PREVENCION' },
      patrulla: { id: 'pat-1', nombre: 'Patrulla Alfa', estado: 'EN_PREVENCION' },
      recursos: [{ recursoId: 'rec-1', nombre: 'Sacos', cantidadAsignada: 5 }],
      asignadoEn: '2026-11-19T21:00:00.000Z',
    };

    act(() => {
      (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger(
        'prevencion:actualizada',
        payloadOtroEvento
      );
    });
    expect(onPrevencionActualizada).not.toHaveBeenCalled();

    act(() => {
      (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger(
        'prevencion:actualizada',
        payloadObjetivo
      );
      (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger(
        'recurso:actualizado',
        { id: 'rec-1', cantidad_en_uso: 15, estado: 'DISPONIBLE' }
      );
      (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger(
        'patrulla:actualizada',
        { id: 'pat-1', estado: 'EN_PREVENCION', misionActivaId: 'mis-1' }
      );
    });

    expect(onPrevencionActualizada).toHaveBeenCalledWith(payloadObjetivo);
    expect(onRecursoActualizado).toHaveBeenCalledWith({
      id: 'rec-1',
      cantidad_en_uso: 15,
      estado: 'DISPONIBLE',
    });
    expect(onPatrullaActualizada).toHaveBeenCalledWith({
      id: 'pat-1',
      estado: 'EN_PREVENCION',
      misionActivaId: 'mis-1',
    });
  });
});
