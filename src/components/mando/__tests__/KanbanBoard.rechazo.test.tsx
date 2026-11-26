import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { KanbanBoard } from '../KanbanBoard';
import { cuadrillasService } from '@/services/cuadrillasService';
import type { CuadrillaItem } from '@/types/cuadrilla';
import type {
  MisionRechazadaPayload,
  CuadrillaActualizadaPayload,
} from '@/hooks/useEncargadoKanbanSocket';

const showInfoMock = vi.fn();
const showWarningMock = vi.fn();

let capturedKanbanOpts: {
  onMisionRechazada?: (p: MisionRechazadaPayload) => void;
  onCuadrillaActualizada?: (p: CuadrillaActualizadaPayload) => void;
} = {};

let capturedCuadrillasMapa: CuadrillaItem[] = [];

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({
    showInfo: showInfoMock,
    showWarning: showWarningMock,
  }),
  useOptionalToast: () => ({
    showInfo: showInfoMock,
    showWarning: showWarningMock,
  }),
}));

vi.mock('@/hooks/useIncidentesKanban', () => ({
  useIncidentesKanban: vi.fn((opts) => {
    capturedKanbanOpts = opts || {};
    return {
      userId: 'u-encargado',
      setUserId: vi.fn(),
      columnas: {
        REPORTADO: [],
        VERIFICANDO: [],
        EN_ATENCION: [],
        RESUELTO: [],
        NO_ABORDABLE: [],
      },
      paginacionColumna: {
        REPORTADO: null,
        VERIFICANDO: null,
        EN_ATENCION: null,
        RESUELTO: null,
        NO_ABORDABLE: null,
      },
      cargando: false,
      cargandoColumna: {
        REPORTADO: false,
        VERIFICANDO: false,
        EN_ATENCION: false,
        RESUELTO: false,
        NO_ABORDABLE: false,
      },
      error: null,
      esForbidden: false,
      filtros: {
        busqueda: '',
        delegacion: 'TODAS',
        estado: 'TODOS',
        prioridad: '',
        tipoAfectacion: '',
        fuenteOrigen: '',
      },
      setFiltros: vi.fn(),
      estadosVisibles: ['REPORTADO', 'VERIFICANDO', 'EN_ATENCION', 'RESUELTO', 'NO_ABORDABLE'],
      limpiarFiltros: vi.fn(),
      cargarMas: vi.fn(),
      recargar: vi.fn(),
      moverIncidenteAEstado: vi.fn(),
      marcarIncidenteMisionDespachada: vi.fn(),
      conectado: true,
      ultimoEvento: null,
      totalIncidentesVisibles: 0,
      incidenteSeleccionadoId: null,
      setIncidenteSeleccionadoId: vi.fn(),
      trazabilidadPorIncidente: {},
    };
  }),
}));

vi.mock('@/hooks/useIncidentesKpis', () => ({
  useIncidentesKpis: () => ({
    kpis: null,
    cargando: false,
    delegacionId: '',
    setDelegacionId: vi.fn(),
    delegaciones: [],
    refrescarKpis: vi.fn(),
    conectado: true,
  }),
}));

vi.mock('@/hooks/usePrevencionSocket', () => ({
  usePrevencionSocket: vi.fn(),
}));

vi.mock('@/hooks/useRecuperacionSocket', () => ({
  useRecuperacionSocket: vi.fn(),
}));

vi.mock('@/hooks/usePuedeAsignarMision', () => ({
  usePuedeAsignarMision: () => true,
}));

vi.mock('@/hooks/usePuedeCrearEventoAtp', () => ({
  usePuedeCrearEventoAtp: () => false,
}));

vi.mock('@/services/cuadrillasService', () => ({
  cuadrillasService: {
    obtenerCuadrillas: vi.fn(),
  },
}));

vi.mock('@/services/recuperacionService', () => ({
  listarEventosRecuperacion: vi.fn().mockResolvedValue({ data: [] }),
}));

vi.mock('../MapaOperativoMando', () => ({
  MapaOperativoMando: ({ cuadrillas }: { cuadrillas?: CuadrillaItem[] }) => {
    capturedCuadrillasMapa = cuadrillas || [];
    return <div data-testid="mapa-operativo-mock" />;
  },
}));

vi.mock('../KanbanHeader', () => ({
  KanbanHeader: () => <div data-testid="kanban-header-mock" />,
}));
vi.mock('../KanbanFiltros', () => ({
  KanbanFiltros: () => null,
}));
vi.mock('../IncidentesKpiCards', () => ({
  IncidentesKpiCards: () => null,
}));
vi.mock('../KanbanViewSwitcher', () => ({
  KanbanViewSwitcher: ({
    onCambiarVista,
  }: {
    onCambiarVista: (v: 'kanban' | 'mapa') => void;
  }) => (
    <button type="button" onClick={() => onCambiarVista('mapa')}>
      Ir a Mapa
    </button>
  ),
}));

describe('KanbanBoard — Reacción a rechazo de cuadrilla y liberación en mapa (BUG-H41-WEB-03 / WEB-06)', () => {
  const cuadrillaInicial: CuadrillaItem = {
    id: 'cuad-1',
    nombre: 'Cuadrilla Vías 1',
    estado: 'EN_MISION',
    delegacion: { id: 'del-1', nombre: 'Norte' },
    delegado: { id: 'u-del', nombre: 'Juan', email: 'juan@valdivia.cl' },
    recursos: [],
    trabajadores: [],
    creadoEn: '2026-11-01T10:00:00Z',
    misionActiva: {
      id: 'mis-1',
      codigo: 'MIS-2026-0001',
      titulo: 'Despeje',
      tipoMision: 'ATENCION_CUADRILLA',
      estado: 'DESPACHADA',
      fechaDespacho: '2026-11-01T10:00:00Z',
      tiempoTranscurridoMinutos: 5,
      incidente: null,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    capturedCuadrillasMapa = [];
    vi.mocked(cuadrillasService.obtenerCuadrillas).mockResolvedValue({
      cuadrillas: [cuadrillaInicial],
      paginacion: { total: 1, pagina: 1, limite: 100, paginasTotales: 1 },
    } as never);
  });

  it('despliega Toast de advertencia ante mision:rechazada y limpia misionActiva cuando cuadrilla:actualizada pasa a DISPONIBLE', async () => {
    render(<KanbanBoard />);

    await waitFor(() => {
      expect(cuadrillasService.obtenerCuadrillas).toHaveBeenCalledTimes(1);
    });

    act(() => {
      capturedKanbanOpts.onMisionRechazada?.({
        misionId: 'mis-1',
        codigo: 'MIS-2026-0001',
        tipoMision: 'ATENCION_CUADRILLA',
        motivo: 'Falla hidráulica en camión tolva',
        cuadrillaId: 'cuad-1',
        cuadrillaNombre: 'Cuadrilla Vías 1',
        incidenteId: 'inc-1',
        incidenteCodigo: 'INC-2026-0001',
        rechazadoEn: '2026-11-16T23:15:00Z',
      });
    });

    expect(showWarningMock).toHaveBeenCalledWith(
      expect.stringContaining('La cuadrilla Cuadrilla Vías 1 rechazó la misión asignada'),
      'Misión Rechazada por Cuadrilla',
      expect.objectContaining({
        icon: 'rechazo',
        codeBadge: 'MIS-2026-0001',
      })
    );

    act(() => {
      capturedKanbanOpts.onCuadrillaActualizada?.({
        id: 'cuad-1',
        nombre: 'Cuadrilla Vías 1',
        estado: 'DISPONIBLE',
        delegacionId: 'del-1',
      });
    });

    // Cambiar a vista Mapa para inspeccionar el estado de cuadrillasOperativas propagado
    act(() => {
      screen.getByRole('button', { name: /Ir a Mapa/i }).click();
    });

    expect(capturedCuadrillasMapa).toHaveLength(1);
    expect(capturedCuadrillasMapa[0].estado).toBe('DISPONIBLE');
    expect(capturedCuadrillasMapa[0].misionActiva).toBeUndefined();
  });
});
