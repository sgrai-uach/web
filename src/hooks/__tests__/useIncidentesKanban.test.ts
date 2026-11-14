import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useIncidentesKanban } from '../useIncidentesKanban';
import { useEncargadoKanbanSocket, type UseEncargadoKanbanSocketOptions } from '../useEncargadoKanbanSocket';
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

  it('debe revertir el incidente a REPORTADO, limpiar tieneMisionDespachada y actualizar contadores ante mision:rechazada (HU-69)', async () => {
    const mockVerificando: incidentesService.IncidenteResumen = {
      id: 'inc-200',
      codigo: 'INC-2026-200',
      codigoSeguimiento: '20002000',
      tipoAfectacion: 'Derrumbe',
      descripcion: 'Deslizamiento de tierra',
      direccion: 'Av. Picarte 1200',
      latitud: -39.82,
      longitud: -73.23,
      estado: 'VERIFICANDO',
      prioridad: 'CRITICA',
      requiereAsistenciaSocial: false,
      fuenteOrigen: 'WEB',
      informanteNombre: 'María',
      delegacionNombre: 'Sur',
      totalMisiones: 1,
      tieneMisionDespachada: true,
      creadoEn: '2026-10-01T11:00:00Z',
      actualizadoEn: '2026-10-01T11:00:00Z',
    };

    vi.mocked(incidentesService.listarIncidentes).mockImplementation(async (query) => {
      if (query.estado === 'VERIFICANDO') {
        return {
          exito: true,
          incidentes: [mockVerificando],
          paginacion: {
            total: 1,
            pagina: 1,
            limite: 20,
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
          limite: 20,
          totalPaginas: 0,
          tieneSiguiente: false,
          tieneAnterior: false,
        },
        mensaje: 'OK',
      };
    });

    const onMisionRechazadaCallback = vi.fn();
    const { result } = renderHook(() =>
      useIncidentesKanban({ onMisionRechazada: onMisionRechazadaCallback })
    );

    await waitFor(() => {
      expect(result.current.columnas.VERIFICANDO.length).toBe(1);
    });

    const calls = vi.mocked(useEncargadoKanbanSocket).mock.calls;
    const socketOptions = calls[calls.length - 1]?.[0] as UseEncargadoKanbanSocketOptions;
    expect(socketOptions?.onMisionRechazada).toBeDefined();

    const payloadRechazo = {
      misionId: 'mis-200',
      codigo: 'MIS-2026-200',
      tipoMision: 'VERIFICACION',
      motivo: 'Patrulla con falla mecánica',
      justificacionRechazo: 'Patrulla con falla mecánica',
      incidenteId: 'inc-200',
      incidenteCodigo: 'INC-2026-200',
      rechazadoEn: '2026-10-01T12:00:00Z',
    };

    await act(async () => {
      socketOptions.onMisionRechazada?.(payloadRechazo);
    });

    expect(result.current.columnas.VERIFICANDO.length).toBe(0);
    expect(result.current.columnas.REPORTADO.length).toBe(1);

    const incidenteRevertido = result.current.columnas.REPORTADO[0];
    expect(incidenteRevertido.id).toBe('inc-200');
    expect(incidenteRevertido.estado).toBe('REPORTADO');
    expect(incidenteRevertido.tieneMisionDespachada).toBe(false);

    expect(result.current.paginacionColumna.VERIFICANDO?.total).toBe(0);
    expect(result.current.paginacionColumna.REPORTADO?.total).toBe(1);
    expect(onMisionRechazadaCallback).toHaveBeenCalledWith(payloadRechazo);
  });

  it('debe preservar tieneMisionDespachada tras invocar recargar() (BUG-H69-WEB-03)', async () => {
    const mockReportado: incidentesService.IncidenteResumen = {
      id: 'inc-300',
      codigo: 'INC-2026-300',
      codigoSeguimiento: '30003000',
      tipoAfectacion: 'Árbol caído',
      descripcion: 'Obstrucción de vía',
      direccion: 'Sector Costanera',
      latitud: -39.81,
      longitud: -73.24,
      estado: 'REPORTADO',
      prioridad: 'ALTA',
      requiereAsistenciaSocial: false,
      fuenteOrigen: 'WEB',
      informanteNombre: 'Carlos',
      delegacionNombre: 'Costa',
      totalMisiones: 0,
      creadoEn: '2026-10-01T09:00:00Z',
      actualizadoEn: '2026-10-01T09:00:00Z',
    };

    vi.mocked(incidentesService.listarIncidentes).mockImplementation(async (query) => {
      if (query.estado === 'REPORTADO') {
        return {
          exito: true,
          incidentes: [{ ...mockReportado }],
          paginacion: {
            total: 1,
            pagina: 1,
            limite: 20,
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
          limite: 20,
          totalPaginas: 0,
          tieneSiguiente: false,
          tieneAnterior: false,
        },
        mensaje: 'OK',
      };
    });

    const { result } = renderHook(() => useIncidentesKanban());

    await waitFor(() => {
      expect(result.current.columnas.REPORTADO.length).toBe(1);
    });

    act(() => {
      result.current.marcarIncidenteMisionDespachada('inc-300', true);
    });

    expect(result.current.columnas.REPORTADO[0].tieneMisionDespachada).toBe(true);

    await act(async () => {
      await result.current.recargar();
    });

    expect(result.current.columnas.REPORTADO[0].tieneMisionDespachada).toBe(true);
  });
});
