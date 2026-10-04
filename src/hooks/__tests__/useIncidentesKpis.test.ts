import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useIncidentesKpis } from '../useIncidentesKpis';
import { obtenerKpisIncidentes, obtenerDelegaciones } from '@/services/incidentesService';
import { getSocket } from '@/lib/socket/client';

// Mock del servicio de incidentes
vi.mock('@/services/incidentesService', () => {
  return {
    DEFAULT_ENCARGADO_ID: '00000000-0000-4000-8000-000000000003',
    obtenerKpisIncidentes: vi.fn(),
    obtenerDelegaciones: vi.fn(),
  };
});

// Mock del cliente Socket.io
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

describe('useIncidentesKpis', () => {
  const mockDatosKpis = {
    fecha: '2026-10-03',
    zonaHoraria: 'America/Santiago',
    delegacionId: null,
    total: 25,
    contadores: {
      reportado: 5,
      verificando: 2,
      enAtencion: 8,
      noAbordables: 1,
      resueltos: 9,
    },
    actualizadoEn: '2026-10-03T18:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const socket = getSocket() as unknown as { _clear: () => void; connected: boolean };
    socket._clear();
    socket.connected = false;

    vi.mocked(obtenerKpisIncidentes).mockResolvedValue({
      exito: true,
      datos: mockDatosKpis,
      mensaje: 'KPIs obtenidos exitosamente',
    });

    vi.mocked(obtenerDelegaciones).mockResolvedValue([
      { id: 'del-1', codigo: 'NORTE', nombre: 'Delegación Norte' },
    ]);
  });

  it('debe consultar los KPIs del día al montar y guardar los datos en el estado', async () => {
    const { result } = renderHook(() => useIncidentesKpis());

    expect(result.current.cargando).toBe(true);

    await waitFor(() => {
      expect(obtenerKpisIncidentes).toHaveBeenCalledWith(
        { fecha: undefined, delegacionId: undefined },
        '00000000-0000-4000-8000-000000000003'
      );
    });

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
      expect(result.current.kpis).toEqual(mockDatosKpis);
      expect(result.current.error).toBeNull();
    });
  });

  it('debe conectar el socket y suscribirse con join y unirse de forma defensiva', () => {
    const socket = getSocket();

    renderHook(() => useIncidentesKpis());

    expect(socket.connect).toHaveBeenCalled();
    expect(socket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith('incidente:creado', expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith('incidente:actualizado', expect.any(Function));

    // Simular evento de conexión
    const socketHelper = socket as unknown as { _trigger: (ev: string) => void };
    act(() => {
      socketHelper._trigger('connect');
    });

    expect(socket.emit).toHaveBeenCalledWith('join', 'sala:encargados');
    expect(socket.emit).toHaveBeenCalledWith('unirse', 'sala:encargados');
  });

  it('debe refrescar los KPIs al recibir el evento incidente:creado vía WebSockets', async () => {
    renderHook(() => useIncidentesKpis());

    await waitFor(() => {
      expect(obtenerKpisIncidentes).toHaveBeenCalledTimes(1);
    });

    const socket = getSocket() as unknown as { _trigger: (ev: string, data?: unknown) => void };
    await act(async () => {
      socket._trigger('incidente:creado', { id: 'inc-123' });
    });

    await waitFor(() => {
      expect(obtenerKpisIncidentes).toHaveBeenCalledTimes(2);
    });
  });

  it('debe refrescar los KPIs al recibir el evento incidente:actualizado vía WebSockets', async () => {
    renderHook(() => useIncidentesKpis());

    await waitFor(() => {
      expect(obtenerKpisIncidentes).toHaveBeenCalledTimes(1);
    });

    const socket = getSocket() as unknown as { _trigger: (ev: string, data?: unknown) => void };
    await act(async () => {
      socket._trigger('incidente:actualizado', { id: 'inc-123', nuevoEstado: 'EN_ATENCION' });
    });

    await waitFor(() => {
      expect(obtenerKpisIncidentes).toHaveBeenCalledTimes(2);
    });
  });

  it('debe consultar con delegacionId cuando se actualiza el selector de delegación', async () => {
    const { result } = renderHook(() => useIncidentesKpis());

    await waitFor(() => {
      expect(obtenerKpisIncidentes).toHaveBeenCalledTimes(1);
    });

    act(() => {
      result.current.setDelegacionId('del-sur');
    });

    await waitFor(() => {
      expect(obtenerKpisIncidentes).toHaveBeenLastCalledWith(
        { fecha: undefined, delegacionId: 'del-sur' },
        '00000000-0000-4000-8000-000000000003'
      );
    });
  });

  it('debe emitir leave y salir al desmontar el hook', () => {
    const socket = getSocket();
    const { unmount } = renderHook(() => useIncidentesKpis());

    unmount();

    expect(socket.emit).toHaveBeenCalledWith('leave', 'sala:encargados');
    expect(socket.emit).toHaveBeenCalledWith('salir', 'sala:encargados');
  });
});
