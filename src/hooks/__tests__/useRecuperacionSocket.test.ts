import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRecuperacionSocket } from '../useRecuperacionSocket';
import { getSocket } from '@/lib/socket/client';
import type { EventoRecuperacionResponse } from '@/types/recuperacion';

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

describe('useRecuperacionSocket (HU-29)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const socket = getSocket() as unknown as { _clear: () => void; connected: boolean };
    socket._clear();
    socket.connected = false;
  });

  const mockEvento: EventoRecuperacionResponse = {
    id: 'rec-123',
    codigo: 'REC-2026-0001',
    nombre: 'Entrega de frazadas en Collico',
    descripcion: null,
    sector: 'Collico',
    direccionTexto: 'Pasaje Los Cipreses 450',
    prioridad: 'ALTA',
    contactoNombre: null,
    contactoTelefono: null,
    latitud: -39.8142,
    longitud: -73.2459,
    estado: 'PLANIFICADA',
    familiasAfectadas: 2,
    delegacion: null,
    mision: {
      id: 'mis-123',
      codigo: 'MIS-2026-0001',
      titulo: 'Entrega de frazadas',
      estado: 'DESPACHADA',
      tipoMision: 'RECUPERACION',
    },
    patrulla: {
      id: 'pat-123',
      nombre: 'Patrulla Rápida Centro-Sur',
      estado: 'EN_RECUPERACION',
    },
    recursos: [
      {
        recursoId: 'rec-1',
        nombre: 'Frazadas de Lana',
        cantidadAsignada: 10,
      },
    ],
    creadoPorId: 'encargado-1',
    creadoEn: '2026-10-04T22:30:00.000Z',
    actualizadoEn: '2026-10-04T22:30:00.000Z',
  };

  it('debe conectar al socket y unirse a las salas operativas', () => {
    const socket = getSocket();

    renderHook(() => useRecuperacionSocket());

    expect(socket.connect).toHaveBeenCalled();
    expect(socket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith('recuperacion:creada', expect.any(Function));

    act(() => {
      (socket as unknown as { _trigger: (ev: string) => void })._trigger('connect');
    });

    expect(socket.emit).toHaveBeenCalledWith('unirse', 'encargado');
    expect(socket.emit).toHaveBeenCalledWith('unirse', 'sala:encargados');
    expect(socket.emit).toHaveBeenCalledWith('unirse', 'mapa');
  });

  it('debe invocar onRecuperacionCreada al recibir evento WebSocket recuperacion:creada', () => {
    const socket = getSocket();
    const onRecuperacionCreada = vi.fn();

    const { result } = renderHook(() =>
      useRecuperacionSocket({
        onRecuperacionCreada,
      })
    );

    act(() => {
      (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger(
        'recuperacion:creada',
        mockEvento
      );
    });

    expect(onRecuperacionCreada).toHaveBeenCalledWith(mockEvento);
    expect(result.current.ultimoEvento).toContain('REC-2026-0001');
    expect(result.current.ultimoEvento).toContain('Collico');
  });

  it('debe invocar onRecuperacionActualizada cuando payload contiene evento.id coincidente (BUG-H32-WEB-02)', () => {
    const socket = getSocket();
    const onRecuperacionActualizada = vi.fn();

    const payloadBackend = {
      evento: {
        id: 'rec-123',
        codigo: 'REC-2026-0001',
        nombre: 'Entrega en Collico',
        estado: 'EN_EJECUCION',
      },
      mision: { id: 'mis-1', codigo: 'MIS-2026-0002' },
      patrulla: { id: 'pat-1', nombre: 'Patrulla Beta' },
      recursos: [{ recursoId: 'rec-1', cantidadAsignada: 5 }],
      asignadoEn: '2026-10-04T22:35:00.000Z',
    };

    const { result } = renderHook(() =>
      useRecuperacionSocket({
        eventoId: 'rec-123',
        onRecuperacionActualizada,
      })
    );

    act(() => {
      (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger(
        'recuperacion:actualizada',
        payloadBackend
      );
    });

    expect(onRecuperacionActualizada).toHaveBeenCalledWith(payloadBackend);
    expect(result.current.ultimoEvento).toContain('REC-2026-0001');
  });

  it('no debe invocar onRecuperacionActualizada si eventoId no coincide', () => {
    const socket = getSocket();
    const onRecuperacionActualizada = vi.fn();

    const payloadOtroEvento = {
      evento: {
        id: 'rec-999',
        codigo: 'REC-2026-0999',
        nombre: 'Otro evento',
      },
    };

    renderHook(() =>
      useRecuperacionSocket({
        eventoId: 'rec-123',
        onRecuperacionActualizada,
      })
    );

    act(() => {
      (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger(
        'recuperacion:actualizada',
        payloadOtroEvento
      );
    });

    expect(onRecuperacionActualizada).not.toHaveBeenCalled();
  });

  it('debe invocar onRecursoActualizado al recibir evento recurso:actualizado (HU-32)', () => {
    const socket = getSocket();
    const onRecursoActualizado = vi.fn();

    renderHook(() =>
      useRecuperacionSocket({
        onRecursoActualizado,
      })
    );

    const payloadRecurso = { id: 'rec-1', cantidadDisponible: 15, stock: 15 };

    act(() => {
      (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger(
        'recurso:actualizado',
        payloadRecurso
      );
    });

    expect(onRecursoActualizado).toHaveBeenCalledWith(payloadRecurso);
  });

  it('debe invocar onPatrullaActualizada al recibir evento patrulla:actualizada (HU-32)', () => {
    const socket = getSocket();
    const onPatrullaActualizada = vi.fn();

    renderHook(() =>
      useRecuperacionSocket({
        onPatrullaActualizada,
      })
    );

    const payloadPatrulla = { id: 'pat-1', estado: 'EN_RECUPERACION' };

    act(() => {
      (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger(
        'patrulla:actualizada',
        payloadPatrulla
      );
    });

    expect(onPatrullaActualizada).toHaveBeenCalledWith(payloadPatrulla);
  });

  it('debe limpiar listeners y abandonar salas operativas al desmontar el hook', () => {
    const socket = getSocket();

    const { unmount } = renderHook(() => useRecuperacionSocket());

    unmount();

    expect(socket.off).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(socket.off).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(socket.off).toHaveBeenCalledWith('recuperacion:creada', expect.any(Function));
    expect(socket.off).toHaveBeenCalledWith('recuperacion:actualizada', expect.any(Function));
    expect(socket.off).toHaveBeenCalledWith('recurso:actualizado', expect.any(Function));
    expect(socket.off).toHaveBeenCalledWith('patrulla:actualizada', expect.any(Function));
    expect(socket.emit).toHaveBeenCalledWith('salir', 'encargado');
    expect(socket.emit).toHaveBeenCalledWith('salir', 'sala:encargados');
    expect(socket.emit).toHaveBeenCalledWith('salir', 'mapa');
  });

  it('BUG-INT-30: si el socket ya está conectado al montar, emite salas y difiere setConectado(true) mediante microtask', async () => {
    const socket = getSocket() as unknown as {
      connected: boolean;
      emit: ReturnType<typeof vi.fn>;
    };
    socket.connected = true;

    const { result } = renderHook(() => useRecuperacionSocket());

    expect(socket.emit).toHaveBeenCalledWith('unirse', 'sala:encargados');
    expect(socket.emit).toHaveBeenCalledWith('unirse', 'mapa');

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.conectado).toBe(true);
  });
});
