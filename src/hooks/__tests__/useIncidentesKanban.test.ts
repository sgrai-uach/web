import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useIncidentesKanban } from '../useIncidentesKanban';
import * as incidentesService from '@/services/incidentesService';

vi.mock('@/services/incidentesService', () => ({
  listarIncidentes: vi.fn(),
  ESTADOS_KANBAN: ['REPORTADO', 'VERIFICANDO', 'EN_ATENCION', 'RESUELTO', 'NO_ABORDABLE'],
  DEFAULT_ENCARGADO_ID: '00000000-0000-4000-8000-000000000003',
}));

let socketCallbacks: {
  onIncidenteCreado?: (p: any) => void;
  onIncidenteActualizado?: (p: any) => void;
  onMisionRechazada?: (p: any) => void;
} = {};

vi.mock('../useEncargadoKanbanSocket', () => ({
  useEncargadoKanbanSocket: vi.fn((opts) => {
    socketCallbacks = opts || {};
    return {
      conectado: true,
      ultimoEvento: null,
    };
  }),
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

  it('debe actualizar inmediatamente tipología y prioridad con justificación ante evento incidente:actualizado (H37)', async () => {
    const mockIncidente: incidentesService.IncidenteResumen = {
      id: '50000000-0000-4000-8000-000000000001',
      codigo: 'INC-2026-001',
      codigoSeguimiento: '20260001',
      tipoAfectacion: 'Anegamiento menor',
      descripcion: 'Agua acumulada en frontis',
      direccion: 'Av. Alemania 450',
      latitud: -39.82,
      longitud: -73.23,
      estado: 'VERIFICANDO',
      prioridad: 'BAJA',
      requiereAsistenciaSocial: false,
      fuenteOrigen: 'CHATBOT',
      informanteNombre: 'Carlos',
      delegacionNombre: 'Isla Teja',
      totalMisiones: 1,
      creadoEn: '2026-11-10T02:00:00Z',
      actualizadoEn: '2026-11-10T02:00:00Z',
    };

    vi.mocked(incidentesService.listarIncidentes).mockImplementation(async (query) => {
      if (query.estado === 'VERIFICANDO') {
        return {
          exito: true,
          incidentes: [mockIncidente],
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

    await waitFor(() => {
      expect(result.current.columnas.VERIFICANDO.length).toBe(1);
    });

    // Simular recepción de reclasificación presencial en terreno desde la patrulla
    act(() => {
      socketCallbacks.onIncidenteActualizado?.({
        evento: 'incidente:actualizado',
        datos: {
          id: '50000000-0000-4000-8000-000000000001',
          codigo: 'INC-2026-001',
          nuevoEstado: 'VERIFICANDO',
          prioridad: 'ALTA',
          tipoIncidenteId: '40000000-0000-4000-8000-000000000001',
          tipoAfectacion: 'Inundación',
          justificacion: 'Tras evaluación presencial se constata desborde de cauce con ingreso de agua a viviendas.',
          actualizadoEn: '2026-11-10T03:30:00.000Z',
        },
        emitidoEn: '2026-11-10T03:30:00.000Z',
      });
    });

    // Validar que la tarjeta se actualizó de inmediato en memoria
    const tarjetaActualizada = result.current.columnas.VERIFICANDO[0];
    expect(tarjetaActualizada.tipoAfectacion).toBe('Inundación');
    expect(tarjetaActualizada.prioridad).toBe('ALTA');
    expect(tarjetaActualizada.reclasificadoEnTerreno).toBe(true);
    expect(tarjetaActualizada.justificacionReclasificacion).toBe(
      'Tras evaluación presencial se constata desborde de cauce con ingreso de agua a viviendas.'
    );
    expect(tarjetaActualizada.cambioPrioridadMotivo).toBe(
      'Tras evaluación presencial se constata desborde de cauce con ingreso de agua a viviendas.'
    );
  });

  it('debe marcar tieneMisionDespachada a true al despachar patrulla manteniéndose en REPORTADO (H69)', async () => {
    const mockReportado: incidentesService.IncidenteResumen = {
      id: 'inc-h69-1',
      codigo: 'INC-2026-691',
      codigoSeguimiento: '20260691',
      tipoAfectacion: 'Derrumbe',
      descripcion: 'Caída de tierra',
      direccion: 'Camino a Niebla km 5',
      latitud: -39.85,
      longitud: -73.35,
      estado: 'REPORTADO',
      prioridad: 'MEDIA',
      requiereAsistenciaSocial: false,
      fuenteOrigen: 'WEB',
      informanteNombre: null,
      delegacionNombre: 'Costa',
      totalMisiones: 0,
      tieneMisionDespachada: false,
      creadoEn: '2026-11-10T02:00:00Z',
      actualizadoEn: '2026-11-10T02:00:00Z',
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

    await waitFor(() => {
      expect(result.current.columnas.REPORTADO.length).toBe(1);
    });

    // Marcar misión despachada
    act(() => {
      result.current.marcarIncidenteMisionDespachada('inc-h69-1', true);
    });

    // Debe permanecer en REPORTADO pero con tieneMisionDespachada en true
    expect(result.current.columnas.REPORTADO.length).toBe(1);
    expect(result.current.columnas.REPORTADO[0].tieneMisionDespachada).toBe(true);
    expect(result.current.columnas.VERIFICANDO.length).toBe(0);
  });

  it('debe manejar mision:rechazada manteniendo el incidente en REPORTADO y reseteando tieneMisionDespachada (H69)', async () => {
    const mockReportadoDespachado: incidentesService.IncidenteResumen = {
      id: 'inc-h69-2',
      codigo: 'INC-2026-692',
      codigoSeguimiento: '20260692',
      tipoAfectacion: 'Inundación',
      descripcion: 'Agua acumulada',
      direccion: 'Simpson 230',
      latitud: -39.83,
      longitud: -73.22,
      estado: 'REPORTADO',
      prioridad: 'ALTA',
      requiereAsistenciaSocial: false,
      fuenteOrigen: 'WEB',
      informanteNombre: null,
      delegacionNombre: 'Sur',
      totalMisiones: 1,
      tieneMisionDespachada: true,
      creadoEn: '2026-11-10T02:00:00Z',
      actualizadoEn: '2026-11-10T02:00:00Z',
    };

    vi.mocked(incidentesService.listarIncidentes).mockImplementation(async (query) => {
      if (query.estado === 'REPORTADO') {
        return {
          exito: true,
          incidentes: [mockReportadoDespachado],
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

    const mockOnMisionRechazada = vi.fn();
    const { result } = renderHook(() =>
      useIncidentesKanban({ onMisionRechazada: mockOnMisionRechazada })
    );

    await waitFor(() => {
      expect(result.current.columnas.REPORTADO.length).toBe(1);
    });

    // Simular recepción de evento de rechazo de patrulla
    act(() => {
      socketCallbacks.onMisionRechazada?.({
        misionId: 'mis-rechazada-1',
        codigo: 'MIS-2026-0099',
        tipoMision: 'VERIFICACION',
        motivo: 'Patrulla sin vehículo operativo disponible en este momento',
        incidenteId: 'inc-h69-2',
        incidenteCodigo: 'INC-2026-692',
        rechazadoEn: '2026-11-10T04:00:00Z',
      });
    });

    expect(mockOnMisionRechazada).toHaveBeenCalledTimes(1);
    const incidentePostRechazo = result.current.columnas.REPORTADO[0];
    expect(incidentePostRechazo.estado).toBe('REPORTADO');
    expect(incidentePostRechazo.tieneMisionDespachada).toBe(false);
  });

  it('debe reclasificar automáticamente a la columna VERIFICANDO si un incidente recibido en REPORTADO tiene tieneMisionEnCurso: true', async () => {
    const mockIncidenteEnCurso: incidentesService.IncidenteResumen = {
      id: 'inc-en-curso-1',
      codigo: 'INC-592395-562',
      codigoSeguimiento: '592395562',
      tipoAfectacion: 'Anegamiento',
      descripcion: 'Agua en patio',
      direccion: 'Arauco 642, Villa Coltauco',
      latitud: -39.82,
      longitud: -73.24,
      estado: 'REPORTADO',
      prioridad: 'MEDIA',
      requiereAsistenciaSocial: false,
      fuenteOrigen: 'WEB',
      informanteNombre: 'Vecino',
      delegacionNombre: 'Valdivia',
      totalMisiones: 1,
      tieneMisionDespachada: false,
      tieneMisionEnCurso: true,
      creadoEn: '2026-11-10T10:00:00Z',
      actualizadoEn: '2026-11-10T10:00:00Z',
    };

    vi.mocked(incidentesService.listarIncidentes).mockImplementation(async (query) => {
      if (query.estado === 'REPORTADO') {
        return {
          exito: true,
          incidentes: [mockIncidenteEnCurso],
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

    await waitFor(() => {
      // Debe haber sido extraído de REPORTADO y colocado en VERIFICANDO
      expect(result.current.columnas.REPORTADO.length).toBe(0);
      expect(result.current.columnas.VERIFICANDO.length).toBe(1);
    });

    const incVerificando = result.current.columnas.VERIFICANDO[0];
    expect(incVerificando.codigo).toBe('INC-592395-562');
    expect(incVerificando.estado).toBe('VERIFICANDO');
  });
});
