import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEventosPrevencion } from '../useEventosPrevencion';
import * as prevencionService from '@/services/prevencionService';
import type { ListarEventosPrevencionResponse } from '@/types/evento-prevencion';

vi.mock('@/services/prevencionService', () => ({
  listarEventosPrevencion: vi.fn(),
  PrevencionServiceError: class PrevencionServiceError extends Error {
    statusCode?: number;
    constructor(message: string, options?: { statusCode?: number }) {
      super(message);
      this.statusCode = options?.statusCode;
    }
  },
}));

vi.mock('@/hooks/usePrevencionSocket', () => ({
  usePrevencionSocket: vi.fn(),
}));

describe('useEventosPrevencion (HU-76)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockRespuesta: ListarEventosPrevencionResponse = {
    message: 'Eventos listados',
    data: [
      {
        id: 'ev-1',
        codigo: 'PREV-2026-0001',
        nombre: 'Limpieza de sumideros',
        descripcion: 'Limpieza preventiva',
        sector: 'Collico',
        direccionTexto: 'Av. Balmaceda',
        prioridad: 'ALTA',
        estado: 'EN_CURSO',
        latitud: -39.81,
        longitud: -73.24,
        ubicacionGeoJson: null,
        delegacion: { id: 'del-1', codigo: 'CALLE', nombre: 'Calle Calle' },
        puntoCritico: null,
        patrulla: { id: 'pat-1', nombre: 'Patrulla 1', estado: 'EN_PREVENCION' },
        cuadrilla: null,
        mision: null,
        creadoEn: '2026-11-19T00:00:00Z',
        actualizadoEn: '2026-11-19T00:00:00Z',
      },
    ],
    meta: {
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };

  it('debe cargar eventos automáticamente al montar', async () => {
    vi.mocked(prevencionService.listarEventosPrevencion).mockResolvedValueOnce(mockRespuesta);

    const { result } = renderHook(() => useEventosPrevencion());

    expect(result.current.cargando).toBe(true);

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    expect(result.current.eventos).toHaveLength(1);
    expect(result.current.eventos[0].codigo).toBe('PREV-2026-0001');
    expect(result.current.meta.total).toBe(1);
    expect(result.current.error).toBeNull();
    expect(result.current.esForbidden).toBe(false);
  });

  it('debe actualizar filtros de delegación y estado reiniciando a la página 1', async () => {
    vi.mocked(prevencionService.listarEventosPrevencion).mockResolvedValue(mockRespuesta);

    const { result } = renderHook(() => useEventosPrevencion());

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    await act(async () => {
      result.current.cambiarDelegacion('del-1');
      result.current.cambiarEstado('EN_CURSO');
    });

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    expect(result.current.filtros.delegacionId).toBe('del-1');
    expect(result.current.filtros.estado).toBe('EN_CURSO');
    expect(result.current.filtros.pagina).toBe(1);
    expect(result.current.hayFiltrosActivos).toBe(true);
  });

  it('debe cambiar de página con cambiarPagina', async () => {
    vi.mocked(prevencionService.listarEventosPrevencion).mockResolvedValue(mockRespuesta);

    const { result } = renderHook(() => useEventosPrevencion());

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    await act(async () => {
      result.current.cambiarPagina(2);
    });

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    expect(result.current.filtros.pagina).toBe(2);
  });

  it('debe limpiar filtros con limpiarFiltros', async () => {
    vi.mocked(prevencionService.listarEventosPrevencion).mockResolvedValue(mockRespuesta);

    const { result } = renderHook(() =>
      useEventosPrevencion({
        initialFiltros: { busqueda: 'sumidero', delegacionId: 'del-1', estado: 'EN_CURSO', pagina: 2 },
      })
    );

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    await act(async () => {
      result.current.limpiarFiltros();
    });

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    expect(result.current.filtros.busqueda).toBe('');
    expect(result.current.filtros.delegacionId).toBeUndefined();
    expect(result.current.filtros.estado).toBeUndefined();
    expect(result.current.filtros.pagina).toBe(1);
  });

  it('debe capturar error 403 Forbidden y activar esForbidden', async () => {
    const error403 = new prevencionService.PrevencionServiceError(
      'Acceso denegado',
      { statusCode: 403 }
    );
    vi.mocked(prevencionService.listarEventosPrevencion).mockRejectedValueOnce(error403);

    const { result } = renderHook(() => useEventosPrevencion());

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    expect(result.current.esForbidden).toBe(true);
    expect(result.current.error).toBe('No posee permisos suficientes para consultar eventos preventivos.');
  });

  it('debe aplicar debounce en la busqueda textual sin disparar requests en cada pulsacion', async () => {
    vi.mocked(prevencionService.listarEventosPrevencion).mockResolvedValue(mockRespuesta);

    const { result } = renderHook(() => useEventosPrevencion());

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });
    expect(prevencionService.listarEventosPrevencion).toHaveBeenCalledTimes(1);

    // Escribir varias veces rápido
    await act(async () => {
      result.current.cambiarBusqueda('A');
      result.current.cambiarBusqueda('An');
      result.current.cambiarBusqueda('Ang');
      result.current.cambiarBusqueda('Angachilla');
    });

    // Inmediatamente aún no se debe haber disparado la llamada
    expect(prevencionService.listarEventosPrevencion).toHaveBeenCalledTimes(1);

    // Esperar a que pase el debounce (300ms)
    await waitFor(
      () => {
        expect(prevencionService.listarEventosPrevencion).toHaveBeenCalledTimes(2);
      },
      { timeout: 1000 }
    );

    expect(prevencionService.listarEventosPrevencion).toHaveBeenLastCalledWith(
      expect.objectContaining({ busqueda: 'Angachilla' })
    );
  });

  it('debe descartar respuestas fuera de orden para evitar race conditions mediante requestIdRef', async () => {
    let resolverLento: (val: ListarEventosPrevencionResponse) => void;
    const promesaLenta = new Promise<ListarEventosPrevencionResponse>((resolve) => {
      resolverLento = resolve;
    });

    const respuestaRapida: ListarEventosPrevencionResponse = {
      message: 'Respuesta Rapida',
      data: [
        {
          ...mockRespuesta.data[0],
          id: 'ev-rapido',
          codigo: 'PREV-RAPIDO-01',
        },
      ],
      meta: mockRespuesta.meta,
    };

    const respuestaLenta: ListarEventosPrevencionResponse = {
      message: 'Respuesta Lenta',
      data: [
        {
          ...mockRespuesta.data[0],
          id: 'ev-lento',
          codigo: 'PREV-LENTO-01',
        },
      ],
      meta: mockRespuesta.meta,
    };

    // Montar primero con respuesta inmediata
    vi.mocked(prevencionService.listarEventosPrevencion).mockResolvedValueOnce(mockRespuesta);
    const { result } = renderHook(() => useEventosPrevencion());
    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    // Simular que cambiarDelegacion('del-1') es lenta
    vi.mocked(prevencionService.listarEventosPrevencion).mockReturnValueOnce(promesaLenta);
    await act(async () => {
      result.current.cambiarDelegacion('del-1');
    });

    // Y cambiarDelegacion('del-2') es rápida y resuelve antes
    vi.mocked(prevencionService.listarEventosPrevencion).mockResolvedValueOnce(respuestaRapida);
    await act(async () => {
      result.current.cambiarDelegacion('del-2');
    });

    await waitFor(() => {
      expect(result.current.eventos[0]?.codigo).toBe('PREV-RAPIDO-01');
    });

    // Luego resuelve la llamada de del-1
    await act(async () => {
      resolverLento!(respuestaLenta);
    });

    // La respuesta lenta no debe sobreescribir la respuesta rápida
    expect(result.current.eventos[0]?.codigo).toBe('PREV-RAPIDO-01');
  });
});
