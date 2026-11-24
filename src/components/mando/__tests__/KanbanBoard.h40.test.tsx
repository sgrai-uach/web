import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act, fireEvent, within } from '@testing-library/react';
import { KanbanBoard } from '../KanbanBoard';
import { ToastProvider } from '@/components/ui/Toast';
import * as incidentesService from '@/services/incidentesService';
import { cuadrillasService } from '@/services/cuadrillasService';
import { getSocket } from '@/lib/socket/client';

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/socket/client', () => {
  const listeners: Record<string, ((...args: unknown[]) => void)[]> = {};

  const mockSocket = {
    connected: true,
    connect: vi.fn(),
    emit: vi.fn(),
    on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(handler);
      return mockSocket;
    }),
    off: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter((h) => h !== handler);
      }
      return mockSocket;
    }),
    _trigger: (event: string, payload?: unknown) => {
      if (listeners[event]) {
        listeners[event].forEach((cb) => cb(payload));
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

const mockRefrescarKpis = vi.fn();

vi.mock('@/hooks/useIncidentesKpis', () => ({
  useIncidentesKpis: () => ({
    kpis: null,
    cargando: false,
    delegacionId: '',
    setDelegacionId: vi.fn(),
    delegaciones: [],
    refrescarKpis: mockRefrescarKpis,
    conectado: true,
  }),
}));

vi.mock('@/hooks/usePrevencionSocket', () => ({
  usePrevencionSocket: vi.fn(),
}));

vi.mock('@/hooks/useRecuperacionSocket', () => ({
  useRecuperacionSocket: vi.fn(),
}));

vi.mock('@/hooks/useCatalogos', () => ({
  useCatalogos: () => ({
    nombresDelegaciones: ['Norte', 'Sur', 'Costa', 'Calle Calle'],
    cargando: false,
  }),
}));

vi.mock('@/services/catalogosService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/catalogosService')>();
  return {
    ...actual,
    catalogosService: {
      ...actual.catalogosService,
      resolverDelegacionId: vi.fn().mockReturnValue(undefined),
      getCatalogos: vi.fn().mockResolvedValue({
        roles: [],
        delegaciones: [],
        especialidades: [],
        cargos: [],
      }),
    },
  };
});

vi.mock('@/services/cuadrillasService', () => ({
  cuadrillasService: {
    obtenerCuadrillas: vi.fn(),
  },
}));

vi.mock('@/hooks/usePuedeAsignarMision', () => ({
  usePuedeAsignarMision: () => true,
}));

vi.mock('../MapaOperativoMando', () => ({
  MapaOperativoMando: () => <div data-testid="mapa-operativo-mock" />,
}));

vi.mock('../IncidenteDetalleDrawer', () => ({
  IncidenteDetalleDrawer: ({ incidenteId }: { incidenteId: string | null }) =>
    incidenteId ? (
      <div data-testid="incidente-drawer-mock" data-incidente-id={incidenteId} />
    ) : null,
}));

vi.mock('@/components/admin/cuadrillas/CuadrillaDetalleDrawer', () => ({
  default: () => null,
}));

describe('KanbanBoard - HU-40 Aceptación de Misión por Cuadrilla', () => {
  const incidenteInicial: incidentesService.IncidenteResumen = {
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
    creadoEn: '2026-11-22T12:00:00.000Z',
    actualizadoEn: '2026-11-22T13:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const socket = getSocket() as unknown as { _clear: () => void; connected: boolean };
    socket._clear();
    socket.connected = true;

    vi.mocked(cuadrillasService.obtenerCuadrillas).mockResolvedValue({
      cuadrillas: [
        {
          id: '50000000-0000-4000-8000-000000000001',
          nombre: 'Cuadrilla Vías y Canales 1',
          estado: 'DISPONIBLE',
        } as never,
      ],
      meta: { total: 1, pagina: 1, limite: 100, totalPaginas: 1 },
    } as never);

    vi.spyOn(incidentesService, 'listarIncidentes').mockImplementation(async (query) => {
      if (query.estado === 'VERIFICANDO') {
        return {
          exito: true,
          incidentes: [incidenteInicial],
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
  });

  it('muestra Toast rico de Asignación Aceptada por Cuadrilla, mueve tarjeta a EN_ATENCION, deduplica incidente:actualizado y abre drawer desde acción Ver incidente', async () => {
    render(
      <ToastProvider>
        <KanbanBoard />
      </ToastProvider>
    );

    const colVerificando = document.getElementById('kanban-col-VERIFICANDO');
    const colAtencion = document.getElementById('kanban-col-EN_ATENCION');
    expect(colVerificando).not.toBeNull();
    expect(colAtencion).not.toBeNull();

    await waitFor(() => {
      expect(within(colVerificando!).getByText('INC-2026-0001')).toBeDefined();
    });

    const socket = getSocket() as unknown as {
      _trigger: (ev: string, p: unknown) => void;
    };

    act(() => {
      socket._trigger('mision:actualizada', {
        misionId: '70000000-0000-4000-8000-000000000001',
        codigo: 'MIS-2026-0005',
        estado: 'EN_CURSO',
        tipoMision: 'ATENCION_CUADRILLA',
        cuadrillaId: '50000000-0000-4000-8000-000000000001',
        cuadrillaNombre: 'Cuadrilla Vías y Canales 1',
        patrullaId: null,
        patrullaNombre: null,
        incidenteId: '30000000-0000-4000-8000-000000000001',
        incidenteCodigo: 'INC-2026-0001',
        prioridad: 'ALTA',
        fechaInicio: '2026-11-22T14:00:00.000Z',
        hito: {
          id: '80000000-0000-4000-8000-000000000010',
          hito: 'MISION_ACEPTADA',
          descripcion: 'Asignación Aceptada por Cuadrilla',
          registradoPorId: 'd0000000-0000-4000-8000-000000000001',
          creadoEn: '2026-11-22T14:00:00.000Z',
        },
        actualizadoEn: '2026-11-22T14:00:00.000Z',
      });
    });

    // 1. La tarjeta pasa inmediatamente a la columna EN_ATENCION
    await waitFor(() => {
      expect(within(colAtencion!).getByText('INC-2026-0001')).toBeDefined();
    });
    expect(within(colVerificando!).queryByText('INC-2026-0001')).toBeNull();

    // 2. Se despliega el Toast enriquecido con título, badges, detalles y acción
    expect(screen.getByText('Asignación Aceptada por Cuadrilla')).toBeDefined();
    const alertToast = screen.getByRole('alert');
    expect(within(alertToast).getByText('INC-2026-0001')).toBeDefined();
    expect(within(alertToast).getByText('Alta')).toBeDefined();
    expect(within(alertToast).getByText('Cuadrilla Vías y Canales 1')).toBeDefined();
    expect(within(alertToast).getByText('MIS-2026-0005')).toBeDefined();
    expect(within(alertToast).getByText('En Atención')).toBeDefined();

    // 3. Emitir incidente:actualizado subsiguiente de la misma transacción no debe disparar toast genérico
    act(() => {
      socket._trigger('incidente:actualizado', {
        evento: 'incidente:actualizado',
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

    expect(screen.queryByText('Actualización de Incidente')).toBeNull();
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(mockRefrescarKpis).toHaveBeenCalledWith(false);

    // 4. Hacer clic en "Ver incidente" abre el drawer del incidente
    const btnVerIncidente = within(alertToast).getByRole('button', { name: /Ver incidente/i });
    fireEvent.click(btnVerIncidente);

    await waitFor(() => {
      const drawer = screen.getByTestId('incidente-drawer-mock');
      expect(drawer.getAttribute('data-incidente-id')).toBe(
        '30000000-0000-4000-8000-000000000001'
      );
    });
  });

  it('integra el ciclo completo de cuadrilla: aceptación HU-40 a EN_ATENCION seguido de cierre técnico HU-68 manteniendo EN_ATENCION y mostrando toast de cierre', async () => {
    render(
      <ToastProvider>
        <KanbanBoard />
      </ToastProvider>
    );

    const colVerificando = document.getElementById('kanban-col-VERIFICANDO');
    const colAtencion = document.getElementById('kanban-col-EN_ATENCION');
    expect(colVerificando).not.toBeNull();
    expect(colAtencion).not.toBeNull();

    await waitFor(() => {
      expect(within(colVerificando!).getByText('INC-2026-0001')).toBeDefined();
    });

    const socket = getSocket() as unknown as {
      _trigger: (ev: string, p: unknown) => void;
    };

    // Fase 1 (HU-40): Delegado de cuadrilla acepta la asignación -> pasa a EN_ATENCION
    act(() => {
      socket._trigger('mision:actualizada', {
        misionId: '70000000-0000-4000-8000-000000000001',
        codigo: 'MIS-2026-0005',
        estado: 'EN_CURSO',
        tipoMision: 'ATENCION_CUADRILLA',
        cuadrillaId: '50000000-0000-4000-8000-000000000001',
        cuadrillaNombre: 'Cuadrilla Vías y Canales 1',
        incidenteId: '30000000-0000-4000-8000-000000000001',
        incidenteCodigo: 'INC-2026-0001',
        prioridad: 'ALTA',
        fechaInicio: '2026-11-22T14:00:00.000Z',
        hito: {
          id: '80000000-0000-4000-8000-000000000010',
          hito: 'MISION_ACEPTADA',
          descripcion: 'Asignación Aceptada por Cuadrilla',
          creadoEn: '2026-11-22T14:00:00.000Z',
        },
      });
      socket._trigger('cuadrilla:actualizada', {
        id: '50000000-0000-4000-8000-000000000001',
        nombre: 'Cuadrilla Vías y Canales 1',
        estado: 'EN_MISION',
      });
    });

    await waitFor(() => {
      expect(within(colAtencion!).getByText('INC-2026-0001')).toBeDefined();
    });
    expect(screen.getByText('Asignación Aceptada por Cuadrilla')).toBeDefined();

    // Fase 2 (HU-68): Cuadrilla finaliza trabajos técnicos y emite cierre con reporte e insumos
    act(() => {
      socket._trigger('mision:actualizada', {
        id: '70000000-0000-4000-8000-000000000001',
        misionId: '70000000-0000-4000-8000-000000000001',
        codigo: 'MIS-2026-0005',
        estado: 'COMPLETADA',
        tipoMision: 'ATENCION_CUADRILLA',
        incidenteId: '30000000-0000-4000-8000-000000000001',
        incidenteCodigo: 'INC-2026-0001',
        fechaCierre: '2026-11-22T18:30:00.000Z',
        hito: 'MISION_COMPLETADA',
        reporteTerreno: {
          id: 'rep-cierre-h68-40',
          misionId: '70000000-0000-4000-8000-000000000001',
          tipoReporte: 'REPORTE_CUADRILLA',
          estadoTerreno: 'CONTROLADO',
          horasHombre: 4.5,
          materialesConsumidos: [
            { recursoId: 'rec-1', nombre: 'Sacos de arena', cantidad: 20, unidad: 'sacos' },
          ],
          versionReporte: 1,
          esRectificacion: false,
          etiquetaReporte: 'Informe Técnico Final de Cuadrilla (Cierre de Misión)',
          prioridadSugerida: null,
          prioridadAsignada: null,
          justificacionPrioridad: null,
          resumenTecnico: 'Despeje y drenaje completado.',
          accionesRealizadas: null,
          danosEstimados: null,
          observaciones: null,
          personasAfectadas: 0,
          requiereApoyoAdicional: false,
          evaluacion: {},
          evaluador: { id: 'u-del', nombre: 'Delegado' },
          creadoEn: '2026-11-22T18:30:00.000Z',
        },
      });
      socket._trigger('cuadrilla:actualizada', {
        id: '50000000-0000-4000-8000-000000000001',
        nombre: 'Cuadrilla Vías y Canales 1',
        estado: 'DISPONIBLE',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Informe Final de Cuadrilla Recibido')).toBeDefined();
    });
    expect(within(colAtencion!).getByText('INC-2026-0001')).toBeDefined();
    expect(within(colAtencion!).getByText('Faenas finalizadas')).toBeDefined();
  });
});
