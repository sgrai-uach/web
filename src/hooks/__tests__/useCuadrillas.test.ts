import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCuadrillas } from '../useCuadrillas';
import { cuadrillasService } from '@/services/cuadrillasService';
import { getSocket } from '@/lib/socket/client';
import type { CuadrillaItem, FiltrosCuadrillasState } from '@/types/cuadrilla';

vi.mock('@/services/cuadrillasService', () => ({
  cuadrillasService: {
    obtenerCuadrillas: vi.fn(),
  },
}));

vi.mock('@/lib/socket/client', () => {
  const listeners: Record<string, ((data: unknown) => void)[]> = {};
  const mockSocket = {
    connected: true,
    connect: vi.fn(),
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

describe('useCuadrillas hook (H80)', () => {
  const mockCuadrilla1: CuadrillaItem = {
    id: 'cuadrilla-1',
    nombre: 'Cuadrilla Vías y Calles',
    estado: 'DISPONIBLE',
    delegacion: { id: 'del-1', nombre: 'Norte' },
    delegado: { id: 'u-1', nombre: 'Carlos Delegado', email: 'carlos@valdivia.cl', rut: '15.111.222-3' },
    recursos: [],
    trabajadores: [],
    totalRecursos: 0,
    totalTrabajadores: 0,
    creadoEn: '2026-10-24T12:00:00.000Z',
  };

  const mockCuadrilla2: CuadrillaItem = {
    id: 'cuadrilla-2',
    nombre: 'Cuadrilla Costa',
    estado: 'EN_MISION',
    delegacion: { id: 'del-2', nombre: 'Costa' },
    delegado: { id: 'u-2', nombre: 'Matías Oyarzún', email: 'matias@valdivia.cl', rut: '18.123.789-4' },
    recursos: [],
    trabajadores: [],
    totalRecursos: 0,
    totalTrabajadores: 0,
    creadoEn: '2026-10-25T08:00:00.000Z',
  };

  const respuestaMock = {
    cuadrillas: [mockCuadrilla1],
    meta: {
      total: 1,
      pagina: 1,
      limite: 10,
      paginasTotales: 1,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getSocket() as unknown as { _clear: () => void })._clear();
  });

  it('caso 1: debe llamar a cuadrillasService.obtenerCuadrillas al montar y cargar el estado', async () => {
    vi.mocked(cuadrillasService.obtenerCuadrillas).mockResolvedValue(respuestaMock);

    const initialFilters: FiltrosCuadrillasState = { pagina: 1, limite: 10 };
    const { result } = renderHook(() => useCuadrillas(initialFilters));

    expect(result.current.cargando).toBe(true);

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    expect(cuadrillasService.obtenerCuadrillas).toHaveBeenCalledWith(
      expect.objectContaining({ pagina: 1, limite: 10 })
    );
    expect(result.current.cuadrillas).toHaveLength(1);
    expect(result.current.cuadrillas[0].id).toBe('cuadrilla-1');
    expect(result.current.meta.total).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it('caso 2: re-dispara fetch cuando cambia filtros.delegacionId', async () => {
    vi.mocked(cuadrillasService.obtenerCuadrillas).mockResolvedValue(respuestaMock);

    let filters: FiltrosCuadrillasState = { pagina: 1, limite: 10 };
    const { result, rerender } = renderHook(() => useCuadrillas(filters));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    expect(cuadrillasService.obtenerCuadrillas).toHaveBeenCalledTimes(1);

    // Cambiar filtro delegacionId
    filters = { pagina: 1, limite: 10, delegacionId: 'del-2' };
    rerender();

    await waitFor(() => {
      expect(cuadrillasService.obtenerCuadrillas).toHaveBeenCalledTimes(2);
    });

    expect(cuadrillasService.obtenerCuadrillas).toHaveBeenLastCalledWith(
      expect.objectContaining({ delegacionId: 'del-2' })
    );
  });

  it('caso 3: actualizarCuadrillaEnLista actualiza el elemento existente sin duplicar', async () => {
    vi.mocked(cuadrillasService.obtenerCuadrillas).mockResolvedValue({
      cuadrillas: [mockCuadrilla1, mockCuadrilla2],
      meta: { total: 2, pagina: 1, limite: 10, paginasTotales: 1 },
    });

    const { result } = renderHook(() => useCuadrillas({ pagina: 1, limite: 10 }));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    expect(result.current.cuadrillas).toHaveLength(2);

    // Actualizar cuadrilla-1 cambiando su estado a NO_DISPONIBLE
    const cuadrillaEditada: CuadrillaItem = {
      ...mockCuadrilla1,
      nombre: 'Cuadrilla Vías y Calles Modificada',
      estado: 'NO_DISPONIBLE',
    };

    act(() => {
      result.current.actualizarCuadrillaEnLista(cuadrillaEditada);
    });

    expect(result.current.cuadrillas).toHaveLength(2);
    expect(result.current.cuadrillas[0].nombre).toBe('Cuadrilla Vías y Calles Modificada');
    expect(result.current.cuadrillas[0].estado).toBe('NO_DISPONIBLE');
  });

  it('caso 4: si obtenerCuadrillas lanza error, error queda con mensaje y cargando=false', async () => {
    vi.mocked(cuadrillasService.obtenerCuadrillas).mockRejectedValue(
      new Error('Fallo de conexión con el servidor')
    );

    const { result } = renderHook(() => useCuadrillas({ pagina: 1, limite: 10 }));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    expect(result.current.error).toBe('Fallo de conexión con el servidor');
    expect(result.current.cuadrillas).toEqual([]);
  });
});

