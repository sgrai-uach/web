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

const toastMock = {
  showSuccess: vi.fn(),
  showError: vi.fn(),
  showInfo: vi.fn(),
  showWarning: vi.fn(),
};

vi.mock('@/components/ui/Toast', () => ({
  useToast: () => toastMock,
  useOptionalToast: () => toastMock,
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

  it('HU-40: mueve el incidente a EN_ATENCION, emite Toast sin duplicados e invoca onMisionAceptada al aceptar misión de cuadrilla', async () => {
    const mockReportado: incidentesService.IncidenteResumen = {
      id: 'inc-400',
      codigo: 'INC-2026-400',
      codigoSeguimiento: '40004000',
      tipoAfectacion: 'Inundación',
      descripcion: 'Anegamiento en calzada',
      direccion: 'Av. Alemania 500',
      latitud: -39.81,
      longitud: -73.24,
      estado: 'REPORTADO',
      prioridad: 'ALTA',
      requiereAsistenciaSocial: false,
      fuenteOrigen: 'WEB',
      informanteNombre: 'Luis',
      delegacionNombre: 'Norte',
      totalMisiones: 1,
      tieneMisionDespachada: true,
      creadoEn: '2026-11-22T10:00:00Z',
      actualizadoEn: '2026-11-22T10:00:00Z',
    };

    vi.mocked(incidentesService.listarIncidentes).mockImplementation(async (query) => {
      if (query.estado === 'REPORTADO') {
        return {
          exito: true,
          incidentes: [mockReportado],
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

    const onMisionAceptada = vi.fn();
    const { result } = renderHook(() =>
      useIncidentesKanban({ onMisionAceptada })
    );

    await waitFor(() => {
      expect(result.current.columnas.REPORTADO.length).toBe(1);
    });

    const calls = vi.mocked(useEncargadoKanbanSocket).mock.calls;
    const socketOptions = calls[calls.length - 1]?.[0] as UseEncargadoKanbanSocketOptions;
    expect(socketOptions?.onMisionActualizada).toBeDefined();

    const payloadAceptacion = {
      misionId: 'mis-400',
      codigo: 'MIS-2026-0400',
      estado: 'EN_CURSO',
      tipoMision: 'ATENCION_CUADRILLA',
      cuadrillaId: 'cuad-400',
      incidenteId: 'inc-400',
      hito: {
        id: 'hito-400',
        hito: 'MISION_ACEPTADA',
        descripcion: 'Misión Aceptada por Cuadrilla',
      },
    };

    act(() => {
      socketOptions.onMisionActualizada?.(payloadAceptacion);
      socketOptions.onMisionHitoRegistrado?.({
        misionId: 'mis-400',
        codigoMision: 'MIS-2026-0400',
        hito: 'MISION_ACEPTADA',
        descripcion: 'Misión Aceptada por Cuadrilla',
        registradoEn: '2026-11-22T15:00:00Z',
        nuevoEstadoMision: 'EN_CURSO',
      });
    });

    expect(result.current.columnas.REPORTADO.length).toBe(0);
    expect(result.current.columnas.EN_ATENCION.length).toBe(1);
    expect(result.current.columnas.EN_ATENCION[0].tieneMisionDespachada).toBe(false);
    expect(result.current.paginacionColumna.REPORTADO?.total).toBe(0);
    expect(result.current.paginacionColumna.EN_ATENCION?.total).toBe(1);
    expect(toastMock.showInfo).toHaveBeenCalledTimes(1);
    expect(toastMock.showInfo).toHaveBeenCalledWith(
      expect.stringContaining('MIS-2026-0400'),
      'Asignación Aceptada por Cuadrilla'
    );
    expect(onMisionAceptada).toHaveBeenCalledWith(payloadAceptacion);
  });
});
