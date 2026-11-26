import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOperativosRecuperacion } from '../useOperativosRecuperacion';
import * as recuperacionService from '@/services/recuperacionService';
import type { ListarOperativosRecuperacionApiResponse } from '@/types/recuperacion';

vi.mock('@/hooks/useRecuperacionSocket', () => ({
  useRecuperacionSocket: vi.fn(() => ({ conectado: true, ultimoEvento: null })),
}));

const mockResponse: ListarOperativosRecuperacionApiResponse = {
  data: [
    {
      id: 'op-1',
      codigo: 'REC-2026-0001',
      nombre: 'Operativo 1',
      descripcion: null,
      sector: 'Collico',
      direccionTexto: null,
      prioridad: 'ALTA',
      estado: 'EN_EJECUCION',
      familiasAfectadas: 3,
      delegacion: null,
      cantidadInsumosAsignados: 10,
      totalTiposInsumos: 1,
      recursosResumen: [],
      creadoEn: '2026-11-24T12:00:00.000Z',
      actualizadoEn: '2026-11-24T12:00:00.000Z',
      fechaCierre: null,
    },
  ],
  meta: {
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
};

describe('useOperativosRecuperacion (HU-73)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, '', '/gestion/centro-incidentes?vista=recuperacion');
  });

  it('debe inicializar filtros y paginación desde URLSearchParams y sincronizar cambios', async () => {
    window.history.replaceState(
      null,
      '',
      '/gestion/centro-incidentes?vista=recuperacion&page=2&limit=25&estado=EN_EJECUCION&prioridad=ALTA'
    );

    const spy = vi
      .spyOn(recuperacionService, 'listarOperativosRecuperacion')
      .mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useOperativosRecuperacion({ enabled: true }));

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 25,
          estado: 'EN_EJECUCION',
          prioridad: 'ALTA',
        })
      );
    });

    act(() => {
      result.current.setFiltros((prev) => ({ ...prev, estado: 'COMPLETADA' }));
    });

    await waitFor(() => {
      expect(result.current.page).toBe(1);
      expect(window.location.search).toContain('estado=COMPLETADA');
      expect(window.location.search).not.toContain('page=2');
    });
  });

  it('debe alternar ordenamiento con toggleOrden y recargar cuando cambia refreshSignal', async () => {
    const spy = vi
      .spyOn(recuperacionService, 'listarOperativosRecuperacion')
      .mockResolvedValue(mockResponse);

    const { result, rerender } = renderHook(
      ({ signal }) => useOperativosRecuperacion({ enabled: true, refreshSignal: signal }),
      { initialProps: { signal: 0 } }
    );

    await waitFor(() => {
      expect(spy).toHaveBeenCalledTimes(1);
    });

    act(() => {
      result.current.toggleOrden('codigo');
    });

    await waitFor(() => {
      expect(spy).toHaveBeenLastCalledWith(
        expect.objectContaining({ ordenarPor: 'codigo', orden: 'asc' })
      );
    });

    rerender({ signal: 1 });

    await waitFor(() => {
      expect(spy).toHaveBeenCalledTimes(3);
    });
  });

  it('debe marcar esForbidden en true ante error 403', async () => {
    vi.spyOn(recuperacionService, 'listarOperativosRecuperacion').mockRejectedValue(
      new recuperacionService.RecuperacionServiceError('Sin permiso', { statusCode: 403 })
    );

    const { result } = renderHook(() => useOperativosRecuperacion({ enabled: true }));

    await waitFor(() => {
      expect(result.current.esForbidden).toBe(true);
    });
  });
});
