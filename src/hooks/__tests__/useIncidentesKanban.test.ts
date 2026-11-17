import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useIncidentesKanban } from '../useIncidentesKanban';
import * as incidentesService from '@/services/incidentesService';
import * as misionesService from '@/services/misionesService';
import { useEncargadoKanbanSocket, type UseEncargadoKanbanSocketOptions } from '../useEncargadoKanbanSocket';
import {
  clearTrazabilidadCache,
  getIncidentePorMision,
  setTrazabilidadEstado,
} from '@/lib/socket/trazabilidadStore';

vi.mock('@/services/incidentesService', () => ({
  listarIncidentes: vi.fn(),
  ESTADOS_KANBAN: ['REPORTADO', 'VERIFICANDO', 'EN_ATENCION', 'RESUELTO', 'NO_ABORDABLE'],
  DEFAULT_ENCARGADO_ID: '00000000-0000-4000-8000-000000000003',
}));

vi.mock('@/services/misionesService', () => ({
  obtenerDetalleMision: vi.fn(),
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
    clearTrazabilidadCache();
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

  it('BUG-H35-WEB-07: resuelve el vínculo misión-incidente vía obtenerDetalleMision solo si la misión no estaba vinculada', async () => {
    let socketOptions: UseEncargadoKanbanSocketOptions | undefined;
    vi.mocked(useEncargadoKanbanSocket).mockImplementation((opts) => {
      socketOptions = opts;
      return { conectado: true, ultimoEvento: null };
    });

    vi.mocked(incidentesService.listarIncidentes).mockResolvedValue({
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
    });

    vi.mocked(misionesService.obtenerDetalleMision).mockResolvedValue({
      exito: true,
      datos: {
        id: 'mis-nueva-99',
        codigo: 'MIS-2026-0099',
        titulo: 'Verificación en terreno',
        descripcion: null,
        tipoMision: 'VERIFICACION',
        estado: 'DESPACHADA',
        prioridad: 'ALTA',
        justificacionRechazo: null,
        fechaInicio: null,
        fechaCierre: null,
        creadoEn: '2026-11-12T10:00:00Z',
        actualizadoEn: '2026-11-12T10:00:00Z',
        creadoPor: null,
        encargado: null,
        incidente: {
          id: 'inc-resuelto-99',
          codigo: 'INC-2026-0099',
          tipoAfectacion: 'Inundación',
          direccion: 'Av. España 123',
          estado: 'VERIFICANDO',
          prioridad: 'ALTA',
        },
        prevencion: null,
        cuadrilla: null,
        patrulla: null,
        bitacoraTiempos: [],
        reportesTerreno: [],
      },
      mensaje: 'OK',
    });

    const { result } = renderHook(() => useIncidentesKanban());

    await waitFor(() => {
      expect(socketOptions?.onNotificacionTrazabilidadActualizada).toBeDefined();
    });

    act(() => {
      setTrazabilidadEstado('mis-nueva-99', 'RECIBIDA');
      socketOptions?.onNotificacionTrazabilidadActualizada?.({
        notificacionId: 'notif-99',
        misionId: 'mis-nueva-99',
        patrullaId: 'pat-1',
        estado: 'RECIBIDA',
      });
    });

    await waitFor(() => {
      expect(misionesService.obtenerDetalleMision).toHaveBeenCalledWith(
        'mis-nueva-99',
        '00000000-0000-4000-8000-000000000003'
      );
      expect(getIncidentePorMision('mis-nueva-99')).toBe('inc-resuelto-99');
      expect(result.current.trazabilidadPorIncidente['inc-resuelto-99']).toBe('RECIBIDA');
    });

    // Segunda notificación para la misma misión ya vinculada no debe consultar nuevamente la API
    vi.mocked(misionesService.obtenerDetalleMision).mockClear();
    act(() => {
      setTrazabilidadEstado('mis-nueva-99', 'LEIDA');
      socketOptions?.onNotificacionTrazabilidadActualizada?.({
        notificacionId: 'notif-99',
        misionId: 'mis-nueva-99',
        patrullaId: 'pat-1',
        estado: 'LEIDA',
      });
    });

    expect(misionesService.obtenerDetalleMision).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(result.current.trazabilidadPorIncidente['inc-resuelto-99']).toBe('LEIDA');
    });
  });

  it('HU-41: revierte incidente verificado desde EN_ATENCION hacia VERIFICANDO ante mision:rechazada de cuadrilla', async () => {
    let socketOptions: UseEncargadoKanbanSocketOptions | undefined;
    vi.mocked(useEncargadoKanbanSocket).mockImplementation((opts) => {
      socketOptions = opts;
      return { conectado: true, ultimoEvento: null };
    });

    const mockEnAtencion: incidentesService.IncidenteResumen = {
      id: 'inc-cuad-1',
      codigo: 'INC-2026-0001',
      codigoSeguimiento: '10001000',
      tipoAfectacion: 'Inundación',
      descripcion: 'Aniego en calzada',
      direccion: 'Av. Picarte 500',
      latitud: -39.814,
      longitud: -73.245,
      estado: 'EN_ATENCION',
      prioridad: 'ALTA',
      requiereAsistenciaSocial: false,
      fuenteOrigen: 'WEB',
      informanteNombre: 'Juan',
      delegacionNombre: 'Norte',
      totalMisiones: 2,
      verificado: true,
      creadoEn: '2026-11-16T20:00:00Z',
      actualizadoEn: '2026-11-16T20:00:00Z',
    };

    vi.mocked(incidentesService.listarIncidentes).mockImplementation(async (query) => {
      if (query.estado === 'EN_ATENCION') {
        return {
          exito: true,
          incidentes: [mockEnAtencion],
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
      expect(result.current.columnas.EN_ATENCION.length).toBe(1);
    });

    const payloadRechazo = {
      misionId: 'mis-cuad-1',
      codigo: 'MIS-2026-0005',
      tipoMision: 'ATENCION_CUADRILLA',
      motivo: 'Camión tolva presenta falla hidráulica en ruta de salida desde base.',
      justificacionRechazo: 'Camión tolva presenta falla hidráulica en ruta de salida desde base.',
      cuadrillaId: 'cuad-1',
      cuadrillaNombre: 'Cuadrilla Vías y Canales 1',
      incidenteId: 'inc-cuad-1',
      incidenteCodigo: 'INC-2026-0001',
      rechazadoEn: '2026-11-16T23:15:00.000Z',
    };

    act(() => {
      socketOptions?.onMisionRechazada?.(payloadRechazo);
    });

    expect(result.current.columnas.EN_ATENCION.length).toBe(0);
    expect(result.current.columnas.VERIFICANDO.length).toBe(1);
    expect(result.current.columnas.VERIFICANDO[0].estado).toBe('VERIFICANDO');
    expect(result.current.columnas.VERIFICANDO[0].verificado).toBe(true);
    expect(result.current.paginacionColumna.EN_ATENCION?.total).toBe(0);
    expect(result.current.paginacionColumna.VERIFICANDO?.total).toBe(1);
    expect(onMisionRechazadaCallback).toHaveBeenCalledWith(payloadRechazo);
  });

  it('HU-41: revierte incidente sin verificación previa desde EN_ATENCION hacia REPORTADO ante mision:rechazada de cuadrilla', async () => {
    let socketOptions: UseEncargadoKanbanSocketOptions | undefined;
    vi.mocked(useEncargadoKanbanSocket).mockImplementation((opts) => {
      socketOptions = opts;
      return { conectado: true, ultimoEvento: null };
    });

    const mockDirecto: incidentesService.IncidenteResumen = {
      id: 'inc-cuad-2',
      codigo: 'INC-2026-0002',
      codigoSeguimiento: '20002000',
      tipoAfectacion: 'Árbol caído',
      descripcion: 'Obstrucción de vía',
      direccion: 'Sector Costanera',
      latitud: -39.81,
      longitud: -73.24,
      estado: 'EN_ATENCION',
      prioridad: 'MEDIA',
      requiereAsistenciaSocial: false,
      fuenteOrigen: 'WEB',
      informanteNombre: 'Pedro',
      delegacionNombre: 'Costa',
      totalMisiones: 1,
      verificado: false,
      creadoEn: '2026-11-16T20:00:00Z',
      actualizadoEn: '2026-11-16T20:00:00Z',
    };

    vi.mocked(incidentesService.listarIncidentes).mockImplementation(async (query) => {
      if (query.estado === 'EN_ATENCION') {
        return {
          exito: true,
          incidentes: [mockDirecto],
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
      expect(result.current.columnas.EN_ATENCION.length).toBe(1);
    });

    act(() => {
      socketOptions?.onMisionRechazada?.({
        misionId: 'mis-cuad-2',
        codigo: 'MIS-2026-0006',
        tipoMision: 'ATENCION_CUADRILLA',
        motivo: 'Motosierra con avería en ruta',
        cuadrillaId: 'cuad-2',
        cuadrillaNombre: 'Cuadrilla Poda 2',
        incidenteId: 'inc-cuad-2',
        incidenteCodigo: 'INC-2026-0002',
      });
    });

    expect(result.current.columnas.EN_ATENCION.length).toBe(0);
    expect(result.current.columnas.REPORTADO.length).toBe(1);
    expect(result.current.columnas.REPORTADO[0].estado).toBe('REPORTADO');
    expect(result.current.paginacionColumna.EN_ATENCION?.total).toBe(0);
    expect(result.current.paginacionColumna.REPORTADO?.total).toBe(1);
  });
});
