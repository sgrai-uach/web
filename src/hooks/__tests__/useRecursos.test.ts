import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRecursos } from '../useRecursos';
import { getRecursos } from '@/services/recursosService';
import { getSocket } from '@/lib/socket/client';
import type { RecursoItem } from '@/types/recurso';

vi.mock('@/services/recursosService', () => ({
  getRecursos: vi.fn(),
  RecursoServiceError: class extends Error {
    apiError = { statusCode: 500, message: 'Error' };
  },
}));

vi.mock('@/lib/socket/client', () => {
  const listeners: Record<string, ((data: unknown) => void)[]> = {};
  const mockSocket = {
    connected: false,
    connect: vi.fn(() => {
      mockSocket.connected = true;
    }),
    emit: vi.fn(),
    on: vi.fn((event: string, cb: (data: unknown) => void) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(cb);
    }),
    off: vi.fn((event: string, cb: (data: unknown) => void) => {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter((c) => c !== cb);
    }),
    _trigger: (event: string, data: unknown) => {
      if (listeners[event]) {
        listeners[event].forEach((cb) => cb(data));
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

describe('useRecursos hook (H68 reactividad de stock)', () => {
  const recursoSacos: RecursoItem = {
    id: 'rec-sacos-1',
    nombre: 'Sacos de arena',
    tipo: 'Material o Insumo',
    esIndividual: false,
    estado: 'DISPONIBLE',
    cantidadInventario: 40,
    cantidadEnUso: 10,
    cantidadDisponible: 30,
    cantidadMinima: 20,
    latitud: -39.81,
    longitud: -73.24,
    descripcion: 'Sacos para contención',
    detalles: {},
    delegacion: { id: 'del-1', codigo: 'NORTE', nombre: 'Norte' },
    creadoPorId: 'u-1',
    creadoEn: '2026-10-01T00:00:00Z',
    actualizadoEn: '2026-10-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const socket = getSocket() as unknown as { _clear: () => void; connected: boolean };
    socket._clear();
    socket.connected = false;
  });

  it('se une a salas encargado y supervisor, actualiza stock/estado a BAJO_STOCK y recarga si hay filtro de estado', async () => {
    vi.mocked(getRecursos).mockResolvedValue({
      data: [recursoSacos],
      meta: { total: 1, pagina: 1, limite: 10, totalPaginas: 1 },
    });

    const socket = getSocket() as unknown as {
      emit: ReturnType<typeof vi.fn>;
      _trigger: (ev: string, data: unknown) => void;
    };

    const filtros = { pagina: 1, limite: 10, estado: 'DISPONIBLE' as const };
    const { result, unmount } = renderHook(() => useRecursos(filtros));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    act(() => {
      socket._trigger('connect', undefined);
    });

    expect(socket.emit).toHaveBeenCalledWith('join', 'encargado');
    expect(socket.emit).toHaveBeenCalledWith('join', 'supervisor');

    act(() => {
      socket._trigger('recurso:actualizado', {
        datos: {
          id: 'rec-sacos-1',
          estado: 'BAJO_STOCK',
          cantidad_inventario: 15,
          cantidad_en_uso: 0,
        },
      });
    });

    expect(result.current.recursos[0].estado).toBe('BAJO_STOCK');
    expect(result.current.recursos[0].cantidadInventario).toBe(15);
    expect(result.current.recursos[0].cantidadDisponible).toBe(15);
    await waitFor(() => {
      expect(getRecursos).toHaveBeenCalledTimes(2);
    });

    unmount();
    expect(socket.emit).toHaveBeenCalledWith('leave', 'encargado');
    expect(socket.emit).toHaveBeenCalledWith('leave', 'supervisor');
  });
});
