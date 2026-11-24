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

let socketCallbacks: Pick<
  UseEncargadoKanbanSocketOptions,
  'onIncidenteCreado' | 'onIncidenteActualizado' | 'onMisionRechazada'
> = {};

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

  it('debe mover automáticamente a NO_ABORDABLE con motivo y fechaCierre al recibir dictamen NO_ABORDABLE (H39)', async () => {
    const mockIncidenteVerificando: incidentesService.IncidenteResumen = {
      id: 'inc-h39-noab',
      codigo: 'INC-2026-390',
      codigoSeguimiento: '20260390',
      tipoAfectacion: 'Derrumbe',
      descripcion: 'Posible deslizamiento en quebrada',
      direccion: 'Parcela privada s/n',
      latitud: -39.84,
      longitud: -73.26,
      estado: 'VERIFICANDO',
      prioridad: 'MEDIA',
      requiereAsistenciaSocial: false,
      fuenteOrigen: 'LLAMADA_TELEFONICA',
      informanteNombre: 'Rosa',
      delegacionNombre: 'Sur',
      totalMisiones: 1,
      tieneMisionEnCurso: true,
      creadoEn: '2026-11-15T09:00:00Z',
      actualizadoEn: '2026-11-15T09:00:00Z',
    };

    vi.mocked(incidentesService.listarIncidentes).mockImplementation(async (query) => {
      if (query.estado === 'VERIFICANDO') {
        return {
          exito: true,
          incidentes: [mockIncidenteVerificando],
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
      expect(result.current.columnas.VERIFICANDO.length).toBe(1);
    });

    act(() => {
      socketCallbacks.onIncidenteActualizado?.({
        evento: 'incidente:actualizado',
        datos: {
          id: 'inc-h39-noab',
          codigo: 'INC-2026-390',
          nuevoEstado: 'NO_ABORDABLE',
          prioridad: 'MEDIA',
          dictamen: 'NO_ABORDABLE',
          motivoNoAbordable: 'Faja fiscal concesionada externa sin afectación municipal.',
          fechaCierre: '2026-11-15T10:45:00Z',
          verificado: true,
          actualizadoEn: '2026-11-15T10:45:00Z',
        },
        emitidoEn: '2026-11-15T10:45:00Z',
      });
    });

    expect(result.current.columnas.VERIFICANDO.length).toBe(0);
    expect(result.current.columnas.NO_ABORDABLE.length).toBe(1);
    const tarjetaNoAbordable = result.current.columnas.NO_ABORDABLE[0];
    expect(tarjetaNoAbordable.estado).toBe('NO_ABORDABLE');
    expect(tarjetaNoAbordable.dictamenTerreno).toBe('NO_ABORDABLE');
    expect(tarjetaNoAbordable.motivoNoAbordable).toBe(
      'Faja fiscal concesionada externa sin afectación municipal.'
    );
    expect(tarjetaNoAbordable.fechaCierre).toBe('2026-11-15T10:45:00Z');
    expect(tarjetaNoAbordable.tieneMisionEnCurso).toBe(false);
    expect(result.current.paginacionColumna.VERIFICANDO?.total).toBe(0);
    expect(result.current.paginacionColumna.NO_ABORDABLE?.total).toBe(1);
  });

  it('debe mantener en VERIFICANDO al tope con verificado: true y FIBE al recibir dictamen REQUIERE_CUADRILLA (H39)', async () => {
    const mockIncSinVerificar: incidentesService.IncidenteResumen = {
      id: 'inc-sin-verif',
      codigo: 'INC-2026-391',
      codigoSeguimiento: '20260391',
      tipoAfectacion: 'Anegamiento',
      descripcion: 'Agua en patio',
      direccion: 'Calle A 123',
      latitud: -39.81,
      longitud: -73.24,
      estado: 'VERIFICANDO',
      prioridad: 'BAJA',
      requiereAsistenciaSocial: false,
      fuenteOrigen: 'WEB',
      informanteNombre: null,
      delegacionNombre: 'Norte',
      totalMisiones: 1,
      verificado: false,
      creadoEn: '2026-11-15T12:00:00Z',
      actualizadoEn: '2026-11-15T12:00:00Z',
    };

    const mockIncACerrar: incidentesService.IncidenteResumen = {
      ...mockIncSinVerificar,
      id: 'inc-cierre-cuadrilla',
      codigo: 'INC-2026-392',
      codigoSeguimiento: '20260392',
      creadoEn: '2026-11-15T08:00:00Z',
    };

    vi.mocked(incidentesService.listarIncidentes).mockImplementation(async (query) => {
      if (query.estado === 'VERIFICANDO') {
        return {
          exito: true,
          incidentes: [mockIncSinVerificar, mockIncACerrar],
          paginacion: {
            total: 2,
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
      expect(result.current.columnas.VERIFICANDO.length).toBe(2);
    });

    act(() => {
      socketCallbacks.onIncidenteActualizado?.({
        evento: 'incidente:actualizado',
        datos: {
          id: 'inc-cierre-cuadrilla',
          codigo: 'INC-2026-392',
          nuevoEstado: 'VERIFICANDO',
          prioridad: 'ALTA',
          verificado: true,
          requiereAsistenciaSocial: true,
          dictamen: 'REQUIERE_CUADRILLA',
          actualizadoEn: '2026-11-15T12:30:00Z',
        },
        emitidoEn: '2026-11-15T12:30:00Z',
      });
    });

    expect(result.current.columnas.VERIFICANDO.length).toBe(2);
    const primero = result.current.columnas.VERIFICANDO[0];
    expect(primero.id).toBe('inc-cierre-cuadrilla');
    expect(primero.verificado).toBe(true);
    expect(primero.prioridad).toBe('ALTA');
    expect(primero.requiereAsistenciaSocial).toBe(true);
    expect(primero.dictamenTerreno).toBe('REQUIERE_CUADRILLA');
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

    const onMisionRechazadaCallback = vi.fn();

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

  it('debe exponer el mensaje de error cuando listarIncidentes falla con error 500 en lugar de mostrar el tablero vacío silenciosamente', async () => {
    vi.mocked(incidentesService.listarIncidentes).mockResolvedValue({
      exito: false,
      incidentes: [],
      codigoError: 500,
      mensaje: 'Error interno del servidor al listar incidentes',
    });

    const { result } = renderHook(() => useIncidentesKanban());

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    expect(result.current.esForbidden).toBe(false);
    expect(result.current.error).toBe('Error interno del servidor al listar incidentes');
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

    const onMisionRechazadaCallback = vi.fn();

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

  it('HU-68: mantiene el incidente en EN_ATENCION al recibir REPORTE_CUADRILLA y marca faenasCuadrillaCompletadas', async () => {
    let socketOptions: UseEncargadoKanbanSocketOptions | undefined;
    vi.mocked(useEncargadoKanbanSocket).mockImplementation((opts) => {
      socketOptions = opts;
      return { conectado: true, ultimoEvento: null };
    });

    const mockEnAtencion: incidentesService.IncidenteResumen = {
      id: 'inc-h68-1',
      codigo: 'INC-2026-0068',
      codigoSeguimiento: '68686868',
      tipoAfectacion: 'Anegamiento',
      descripcion: 'Anegamiento de pasaje',
      direccion: 'Pasaje Los Robles 120',
      latitud: -39.81,
      longitud: -73.24,
      estado: 'EN_ATENCION',
      prioridad: 'ALTA',
      requiereAsistenciaSocial: false,
      fuenteOrigen: 'WEB',
      informanteNombre: 'Laura',
      delegacionNombre: 'Norte',
      totalMisiones: 2,
      verificado: true,
      tieneMisionEnCurso: true,
      creadoEn: '2026-11-18T10:00:00Z',
      actualizadoEn: '2026-11-18T10:00:00Z',
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

    const onReporteTerrenoRecibido = vi.fn();
    const { result } = renderHook(() =>
      useIncidentesKanban({ onReporteTerrenoRecibido })
    );

    await waitFor(() => {
      expect(result.current.columnas.EN_ATENCION.length).toBe(1);
    });

    act(() => {
      socketOptions?.onIncidenteActualizado?.({
        evento: 'incidente:actualizado',
        emitidoEn: '2026-11-18T18:00:00Z',
        datos: {
          id: 'inc-h68-1',
          codigo: 'INC-2026-0068',
          nuevoEstado: 'EN_ATENCION',
          prioridad: 'ALTA',
          requiereAsistenciaSocial: true,
          reporteTerreno: {
            id: 'rep-cuad-1',
            misionId: 'mis-cuad-1',
            tipoReporte: 'REPORTE_CUADRILLA',
            etiquetaReporte: 'Informe Técnico Final de Cuadrilla (Cierre de Misión)',
            estadoTerreno: 'CONTROLADO',
            horasHombre: 5,
            materialesConsumidos: [{ recursoId: 'rec-1', nombre: 'Sacos', cantidad: 15, unidad: 'sacos' }],
            versionReporte: 1,
            esRectificacion: false,
            prioridadSugerida: null,
            prioridadAsignada: null,
            justificacionPrioridad: null,
            resumenTecnico: 'Despeje de sumidero y contención con sacos.',
            accionesRealizadas: null,
            danosEstimados: null,
            observaciones: null,
            personasAfectadas: 0,
            requiereApoyoAdicional: false,
            evaluacion: {},
            evaluador: { id: 'u-del', nombre: 'Delegado' },
            creadoEn: '2026-11-18T18:00:00Z',
          },
          actualizadoEn: '2026-11-18T18:00:00Z',
        },
      });
    });

    expect(result.current.columnas.EN_ATENCION.length).toBe(1);
    expect(result.current.columnas.RESUELTO.length).toBe(0);
    expect(result.current.columnas.EN_ATENCION[0].faenasCuadrillaCompletadas).toBe(true);
    expect(result.current.columnas.EN_ATENCION[0].estadoTerrenoFinal).toBe('CONTROLADO');
    expect(result.current.columnas.EN_ATENCION[0].horasHombreRegistradas).toBe(5);
    expect(result.current.columnas.EN_ATENCION[0].tieneMisionEnCurso).toBe(false);
    expect(result.current.columnas.EN_ATENCION[0].requiereAsistenciaSocial).toBe(true);
    expect(onReporteTerrenoRecibido).toHaveBeenCalledTimes(1);

    // Respaldo ante llegada posterior de mision:actualizada COMPLETADA con el mismo reporteId: no duplica totalReportesTerreno
    const reportesTrasIncidente = result.current.columnas.EN_ATENCION[0].totalReportesTerreno;
    act(() => {
      socketOptions?.onMisionActualizada?.({
        id: 'mis-cuad-1',
        misionId: 'mis-cuad-1',
        codigo: 'MIS-2026-0068',
        tipoMision: 'ATENCION_CUADRILLA',
        estado: 'COMPLETADA',
        incidenteId: 'inc-h68-1',
        incidenteCodigo: 'INC-2026-0068',
        reporteTerreno: {
          id: 'rep-cuad-1',
          misionId: 'mis-cuad-1',
          tipoReporte: 'REPORTE_CUADRILLA',
          estadoTerreno: 'CONTROLADO',
          horasHombre: 5,
          versionReporte: 1,
          esRectificacion: false,
          prioridadSugerida: null,
          prioridadAsignada: null,
          justificacionPrioridad: null,
          resumenTecnico: 'Despeje de sumidero y contención con sacos.',
          accionesRealizadas: null,
          danosEstimados: null,
          observaciones: null,
          personasAfectadas: 0,
          requiereApoyoAdicional: false,
          evaluacion: {},
          evaluador: { id: 'u-del', nombre: 'Delegado' },
          creadoEn: '2026-11-18T18:00:00Z',
        },
      });
    });

    expect(result.current.columnas.EN_ATENCION[0].totalReportesTerreno).toBe(reportesTrasIncidente);
  });

  it('HU-68: ordena arriba en EN_ATENCION los incidentes con faenasCuadrillaCompletadas y actualiza por mision:actualizada', async () => {
    let socketOptions: UseEncargadoKanbanSocketOptions | undefined;
    vi.mocked(useEncargadoKanbanSocket).mockImplementation((opts) => {
      socketOptions = opts;
      return { conectado: true, ultimoEvento: null };
    });

    const incActivo: incidentesService.IncidenteResumen = {
      id: 'inc-activo',
      codigo: 'INC-2026-0005',
      codigoSeguimiento: '10000005',
      tipoAfectacion: 'Caída de árbol',
      descripcion: null,
      direccion: 'Collico 230',
      latitud: -39.8,
      longitud: -73.22,
      estado: 'EN_ATENCION',
      prioridad: 'CRITICA',
      requiereAsistenciaSocial: false,
      fuenteOrigen: 'LLAMADA_TELEFONICA',
      informanteNombre: 'Pedro',
      delegacionNombre: 'Calle Calle',
      totalMisiones: 1,
      totalReportesTerreno: 0,
      faenasCuadrillaCompletadas: false,
      verificado: false,
      creadoEn: '2026-11-19T12:00:00Z',
      actualizadoEn: '2026-11-19T12:00:00Z',
    };

    const incCerradoDespues: incidentesService.IncidenteResumen = {
      ...incActivo,
      id: 'inc-0004',
      codigo: 'INC-2026-0004',
      codigoSeguimiento: '10000004',
      tipoAfectacion: 'Anegamiento de calzada',
      faenasCuadrillaCompletadas: true,
      estadoTerrenoFinal: 'CRITICO',
      totalReportesTerreno: 1,
      creadoEn: '2026-11-18T10:00:00Z',
    };

    vi.mocked(incidentesService.listarIncidentes).mockImplementation(async (query) => {
      if (query.estado === 'EN_ATENCION') {
        return {
          exito: true,
          incidentes: [incActivo, incCerradoDespues],
          paginacion: {
            total: 2,
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
      expect(result.current.columnas.EN_ATENCION).toHaveLength(2);
    });

    // El incidente con faenas completadas queda primero en EN_ATENCION
    expect(result.current.columnas.EN_ATENCION[0].codigo).toBe('INC-2026-0004');
    expect(result.current.columnas.EN_ATENCION[1].codigo).toBe('INC-2026-0005');

    // Si el segundo incidente recibe respaldo mision:actualizada COMPLETADA
    act(() => {
      socketOptions?.onMisionActualizada?.({
        id: 'mis-0005',
        misionId: 'mis-0005',
        codigo: 'MIS-2026-0005',
        tipoMision: 'ATENCION_CUADRILLA',
        estado: 'COMPLETADA',
        incidenteId: 'inc-activo',
        incidenteCodigo: 'INC-2026-0005',
        reporteTerreno: {
          id: 'rep-0005',
          misionId: 'mis-0005',
          tipoReporte: 'REPORTE_CUADRILLA',
          estadoTerreno: 'CRITICO',
          horasHombre: 3,
          versionReporte: 1,
          esRectificacion: false,
          prioridadSugerida: null,
          prioridadAsignada: null,
          justificacionPrioridad: null,
          resumenTecnico: 'Árbol trozado y calzada liberada.',
          accionesRealizadas: null,
          danosEstimados: null,
          observaciones: null,
          personasAfectadas: 0,
          requiereApoyoAdicional: false,
          evaluacion: {},
          evaluador: { id: 'u-del', nombre: 'Delegado' },
          creadoEn: '2026-11-19T18:00:00Z',
        },
      });
    });

    const actualizado = result.current.columnas.EN_ATENCION.find((i) => i.id === 'inc-activo');
    expect(actualizado?.faenasCuadrillaCompletadas).toBe(true);
    expect(actualizado?.estadoTerrenoFinal).toBe('CRITICO');
    expect(actualizado?.horasHombreRegistradas).toBe(3);
    expect(actualizado?.totalReportesTerreno).toBe(1);
  });

  it('HU-40: transiciona el incidente de VERIFICANDO a EN_ATENCION con tieneMisionEnCurso: true y limpia faenas previas ante aceptación', async () => {
    let socketOptions: UseEncargadoKanbanSocketOptions | undefined;
    vi.mocked(useEncargadoKanbanSocket).mockImplementation((opts) => {
      socketOptions = opts;
      return { conectado: true, ultimoEvento: null };
    });

    const incVerificando: incidentesService.IncidenteResumen = {
      id: '30000000-0000-4000-8000-000000000001',
      codigo: 'INC-2026-0001',
      codigoSeguimiento: '20260001',
      tipoAfectacion: 'Inundación',
      descripcion: 'Anegamiento en vía pública',
      direccion: 'Av. Picarte 1200',
      latitud: -39.82,
      longitud: -73.24,
      estado: 'VERIFICANDO',
      prioridad: 'ALTA',
      requiereAsistenciaSocial: false,
      fuenteOrigen: 'WEB',
      informanteNombre: 'María',
      delegacionNombre: 'Norte',
      totalMisiones: 2,
      verificado: true,
      tieneMisionDespachada: true,
      tieneMisionEnCurso: false,
      faenasCuadrillaCompletadas: false,
      creadoEn: '2026-11-22T12:00:00Z',
    };

    vi.mocked(incidentesService.listarIncidentes).mockImplementation(async (query) => {
      if (query.estado === 'VERIFICANDO') {
        return {
          exito: true,
          incidentes: [incVerificando],
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
      expect(result.current.columnas.VERIFICANDO).toHaveLength(1);
    });

    act(() => {
      socketOptions?.onIncidenteActualizado?.({
        evento: 'incidente:actualizado',
        esSintetico: true,
        datos: {
          id: '30000000-0000-4000-8000-000000000001',
          codigo: 'INC-2026-0001',
          nuevoEstado: 'EN_ATENCION',
          prioridad: 'ALTA',
          actualizadoEn: '2026-11-22T14:00:00.000Z',
        },
        emitidoEn: '2026-11-22T14:00:00.000Z',
      });
    });

    expect(result.current.columnas.VERIFICANDO).toHaveLength(0);
    expect(result.current.columnas.EN_ATENCION).toHaveLength(1);
    const movido = result.current.columnas.EN_ATENCION[0];
    expect(movido.estado).toBe('EN_ATENCION');
    expect(movido.tieneMisionEnCurso).toBe(true);
    expect(movido.tieneMisionDespachada).toBe(false);
    expect(movido.faenasCuadrillaCompletadas).toBe(false);
  });

  it('HU-44: marca apoyoSolicitado y detalleApoyoRequerido ante mision:apoyo_solicitado, prioriza arriba en EN_ATENCION e invoca callback', async () => {
    let socketOptions: UseEncargadoKanbanSocketOptions | undefined;
    vi.mocked(useEncargadoKanbanSocket).mockImplementation((opts) => {
      socketOptions = opts;
      return { conectado: true, ultimoEvento: null };
    });

    const incPrimeroNormal: incidentesService.IncidenteResumen = {
      id: 'inc-normal-atencion',
      codigo: 'INC-2026-0011',
      codigoSeguimiento: '11110011',
      tipoAfectacion: 'Inundación',
      descripcion: null,
      direccion: 'Av. Francia 400',
      latitud: -39.82,
      longitud: -73.23,
      estado: 'EN_ATENCION',
      prioridad: 'MEDIA',
      requiereAsistenciaSocial: false,
      fuenteOrigen: 'WEB',
      informanteNombre: 'Ana',
      delegacionNombre: 'Sur',
      totalMisiones: 1,
      faenasCuadrillaCompletadas: true,
      apoyoSolicitado: false,
      creadoEn: '2026-11-23T12:00:00Z',
      actualizadoEn: '2026-11-23T12:00:00Z',
    };

    const incConApoyoDespues: incidentesService.IncidenteResumen = {
      ...incPrimeroNormal,
      id: 'inc-apoyo-44',
      codigo: 'INC-2026-0010',
      codigoSeguimiento: '10100010',
      tipoAfectacion: 'Deslizamiento',
      faenasCuadrillaCompletadas: false,
      apoyoSolicitado: false,
      creadoEn: '2026-11-23T10:00:00Z',
    };

    vi.mocked(incidentesService.listarIncidentes).mockImplementation(async (query) => {
      if (query.estado === 'EN_ATENCION') {
        return {
          exito: true,
          incidentes: [incPrimeroNormal, incConApoyoDespues],
          paginacion: {
            total: 2,
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

    const onMisionApoyoSolicitado = vi.fn();
    const { result } = renderHook(() =>
      useIncidentesKanban({ onMisionApoyoSolicitado })
    );

    await waitFor(() => {
      expect(result.current.columnas.EN_ATENCION).toHaveLength(2);
    });

    // Antes del evento, el incidente con faenas completadas está arriba
    expect(result.current.columnas.EN_ATENCION[0].id).toBe('inc-normal-atencion');

    const payloadApoyo = {
      reporteId: 'rep-apoyo-44',
      misionId: 'mis-apoyo-44',
      misionCodigo: 'MIS-2026-0042',
      incidenteId: 'inc-apoyo-44',
      incidenteCodigo: 'INC-2026-0010',
      cuadrillaId: 'cuad-1',
      cuadrillaNombre: 'Cuadrilla Norte 1',
      evaluadorId: 'usr-1',
      evaluadorNombre: 'Juan Pérez',
      requiereApoyoAdicional: true,
      detalleApoyoRequerido: 'Se solicita motoniveladora y cuadrilla adicional de despeje',
      prioridadAlerta: 'ALTA',
      solicitadoEn: '2026-11-23T20:15:00.000Z',
    };

    act(() => {
      socketOptions?.onMisionApoyoSolicitado?.(payloadApoyo);
    });

    expect(onMisionApoyoSolicitado).toHaveBeenCalledWith(payloadApoyo);
    // Tras el evento, el incidente con apoyoSolicitado sube al primer lugar en EN_ATENCION
    expect(result.current.columnas.EN_ATENCION[0].id).toBe('inc-apoyo-44');
    expect(result.current.columnas.EN_ATENCION[0].apoyoSolicitado).toBe(true);
    expect(result.current.columnas.EN_ATENCION[0].detalleApoyoRequerido).toBe(
      'Se solicita motoniveladora y cuadrilla adicional de despeje'
    );
  });
});
