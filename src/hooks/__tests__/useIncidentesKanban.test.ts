import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useIncidentesKanban } from '../useIncidentesKanban';
import * as incidentesService from '@/services/incidentesService';

vi.mock('@/services/incidentesService', () => ({
  listarIncidentes: vi.fn(),
  ESTADOS_KANBAN: ['REPORTADO', 'VERIFICANDO', 'EN_ATENCION', 'RESUELTO', 'NO_ABORDABLE'],
  DEFAULT_ENCARGADO_ID: '00000000-0000-4000-8000-000000000003',
}));

vi.mock('../useEncargadoKanbanSocket', () => ({
  useEncargadoKanbanSocket: vi.fn(() => ({
    conectado: true,
    ultimoEvento: null,
  })),
}));

describe('useIncidentesKanban - HU-20 y BUG-04', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe mover de columna e incrementar totalMisiones y actualizar paginacionColumna dinámicamente', async () => {
    const mockReportado: incidentesService.IncidenteResumen = {
      id: 'inc-100',
      codigo: 'INC-2026-100',
      codigoSeguimiento: '10001000',
      tipoAfectacion: 'Inundación',
      descripcion: 'Agua entrando al domicilio',
      direccion: 'Sector Isla Teja',
      latitud: -39.81,
      longitud: -73.25,
      estado: 'REPORTADO',
      prioridad: 'ALTA',
      requiereAsistenciaSocial: false,
      fuenteOrigen: 'WEB',
      informanteNombre: 'Juan',
      delegacionNombre: 'Isla Teja',
      totalMisiones: 0,
      creadoEn: '2026-10-01T10:00:00Z',
      actualizadoEn: '2026-10-01T10:00:00Z',
    };

    vi.mocked(incidentesService.listarIncidentes).mockImplementation(async (query) => {
      if (query.estado === 'REPORTADO') {
        return {
          exito: true,
          incidentes: [mockReportado],
          paginacion: {
            total: 1,
            pagina: 1,
            limite: 10,
            totalPaginas: 1,
            tieneSiguiente: false,
            tieneAnterior: false,
          },
          mensaje: 'OK',
        };
      }
      return {
        exito: true,
        incidentes: [],
        paginacion: {
          total: 0,
          pagina: 1,
          limite: 10,
          totalPaginas: 0,
          tieneSiguiente: false,
          tieneAnterior: false,
        },
        mensaje: 'OK',
      };
    });

    const { result } = renderHook(() => useIncidentesKanban());

    // Esperar a que cargue
    await waitFor(() => {
      expect(result.current.columnas.REPORTADO.length).toBe(1);
    });

    expect(result.current.columnas.REPORTADO.length).toBe(1);
    expect(result.current.columnas.VERIFICANDO.length).toBe(0);
    expect(result.current.paginacionColumna.REPORTADO?.total).toBe(1);
    expect(result.current.paginacionColumna.VERIFICANDO?.total).toBe(0);

    // Mover a VERIFICANDO por despacho de patrulla
    act(() => {
      result.current.moverIncidenteAEstado('inc-100', 'VERIFICANDO');
    });

    // 1. Debe haber salido de REPORTADO y entrado a VERIFICANDO
    expect(result.current.columnas.REPORTADO.length).toBe(0);
    expect(result.current.columnas.VERIFICANDO.length).toBe(1);

    // 2. totalMisiones debe incrementarse (BUG-H20-WEB-04)
    const incidenteMovido = result.current.columnas.VERIFICANDO[0];
    expect(incidenteMovido.estado).toBe('VERIFICANDO');
    expect(incidenteMovido.totalMisiones).toBe(1);

    // 3. paginacionColumna debe actualizarse dinámicamente para ambas columnas (BUG-H20-WEB-04)
    expect(result.current.paginacionColumna.REPORTADO?.total).toBe(0);
    expect(result.current.paginacionColumna.VERIFICANDO?.total).toBe(1);
  });
});
