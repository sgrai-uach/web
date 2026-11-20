import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import { DetalleEventoPrevencionClient } from '../DetalleEventoPrevencionClient';
import {
  obtenerEventoPrevencion,
  asignarRecursosPrevencion,
  PrevencionServiceError,
} from '@/services/prevencionService';
import { patrullasService } from '@/services/patrullasService';
import { getRecursos } from '@/services/recursosService';
import { usePrevencionSocket } from '@/hooks/usePrevencionSocket';
import type { DetalleEventoPrevencionResponse } from '@/types/evento-prevencion';
import type { PatrullaVerificadoraDTO } from '@/types/patrullas';
import type { RecursoItem } from '@/types/recurso';

// Mock del mapa interactivo
vi.mock('@/components/maps/LocationPickerMap', () => ({
  default: ({ latitud, longitud }: { latitud: number; longitud: number }) => (
    <div data-testid="mock-location-picker">
      Coords: {latitud}, {longitud}
    </div>
  ),
}));

// Mock del hook de permisos RBAC (misiones:asignar)
let mockPuedeAsignar = true;
vi.mock('@/hooks/usePuedeAsignarMision', () => ({
  usePuedeAsignarMision: () => mockPuedeAsignar,
}));

// Mock del hook de WebSockets
vi.mock('@/hooks/usePrevencionSocket', () => ({
  usePrevencionSocket: vi.fn(),
}));

// Mock de servicios
vi.mock('@/services/prevencionService', () => {
  class MockPrevencionServiceError extends Error {
    public statusCode?: number;
    public tipoConflicto?: string;

    constructor(message: string, options?: { statusCode?: number; tipoConflicto?: string }) {
      super(message);
      this.name = 'PrevencionServiceError';
      this.statusCode = options?.statusCode;
      this.tipoConflicto = options?.tipoConflicto;
    }
  }

  return {
    obtenerEventoPrevencion: vi.fn(),
    asignarRecursosPrevencion: vi.fn(),
    PrevencionServiceError: MockPrevencionServiceError,
  };
});

vi.mock('@/services/patrullasService', () => ({
  DEFAULT_ENCARGADO_ID: '00000000-0000-4000-8000-000000000003',
  patrullasService: {
    listar: vi.fn(),
  },
}));

vi.mock('@/services/recursosService', () => ({
  getRecursos: vi.fn(),
}));

const mockToast = {
  showSuccess: vi.fn(),
  showError: vi.fn(),
  showWarning: vi.fn(),
  showInfo: vi.fn(),
};

vi.mock('@/components/ui/Toast', () => ({
  useToast: () => mockToast,
}));

describe('DetalleEventoPrevencionClient (HU-33)', () => {
  const mockDetalleEvento: DetalleEventoPrevencionResponse = {
    id: 'prev-1234',
    codigo: 'PREV-2026-0001',
    nombre: 'Limpieza preventiva de colectores en Angachilla',
    descripcion: 'Despeje preventivo de rejillas y refuerzo de bordes antes del frente de lluvia.',
    sector: 'Humedal Angachilla',
    direccionTexto: 'Pasaje Los Robles s/n',
    prioridad: 'ALTA',
    estado: 'PLANIFICADA',
    latitud: -39.8456,
    longitud: -73.2389,
    ubicacionGeoJson: { type: 'Point', coordinates: [-73.2389, -39.8456] },
    puntoCritico: {
      id: 'pc-1',
      codigo: 'PC-VAL-001',
      nombre: 'Colector Humedal Angachilla',
      descripcion: 'Zona baja propensa a anegamiento por lluvias intensas.',
      tipoRiesgo: 'Inundación',
      prioridad: 'ALTA',
      latitud: -39.8456,
      longitud: -73.2389,
      ubicacionGeoJson: { type: 'Point', coordinates: [-73.2389, -39.8456] },
    },
    delegacion: {
      id: 'del-1',
      codigo: 'DEL-SUR',
      nombre: 'Delegación Sur',
    },
    misiones: [
      {
        id: 'mis-10',
        codigo: 'MIS-2026-0045',
        titulo: 'Inspección preliminar de alcantarillas',
        estado: 'DESPACHADA',
        tipoMision: 'PREVENCION',
        fechaInicio: null,
        fechaCierre: null,
        creadoEn: '2026-11-18T10:00:00.000Z',
        patrulla: {
          id: 'pat-previa',
          nombre: 'Patrulla Verificadora Alfa',
          estado: 'EN_PREVENCION',
        },
        cuadrilla: null,
      },
    ],
    recursosAsignados: [
      {
        id: 'epr-1',
        recursoId: 'rec-sacos-prev',
        nombre: 'Sacos de Arena 25kg (Previos)',
        esIndividual: false,
        cantidadAsignada: 15,
        misionId: 'mis-10',
        creadoEn: '2026-11-18T10:00:00.000Z',
      },
    ],
    recursos: [
      {
        id: 'epr-1',
        recursoId: 'rec-sacos-prev',
        nombre: 'Sacos de Arena 25kg (Previos)',
        esIndividual: false,
        cantidadAsignada: 15,
        misionId: 'mis-10',
        creadoEn: '2026-11-18T10:00:00.000Z',
      },
    ],
    fechaEstimadaFin: '2026-11-26T20:00:00.000Z',
    creadoPorId: 'enc-1',
    actualizadoPorId: null,
    creadoEn: '2026-11-18T09:00:00.000Z',
    actualizadoEn: '2026-11-18T10:00:00.000Z',
  };

  const mockPatrullas = [
    {
      id: 'pat-disponible-1',
      nombre: 'Patrulla Centro-Sur',
      estado: 'DISPONIBLE' as const,
      delegacion: { id: 'del-1', nombre: 'Delegación Sur', codigo: 'SUR' },
    },
    {
      id: 'pat-ocupada-2',
      nombre: 'Patrulla Costa-1',
      estado: 'EN_PREVENCION' as const,
      delegacion: { id: 'del-2', nombre: 'Delegación Costa', codigo: 'COSTA' },
    },
  ];

  const mockInventario = [
    {
      id: 'rec-sacos',
      nombre: 'Sacos de Arena 25kg',
      esIndividual: false,
      cantidadInventario: 50,
      cantidadEnUso: 10,
      estado: 'DISPONIBLE' as const,
    },
    {
      id: 'rec-motobomba',
      nombre: 'Motobomba de Achique 3"',
      esIndividual: true,
      cantidadInventario: 1,
      cantidadEnUso: 0,
      estado: 'DISPONIBLE' as const,
    },
    {
      id: 'rec-taller',
      nombre: 'Generador Diésel Taller',
      esIndividual: true,
      cantidadInventario: 1,
      cantidadEnUso: 0,
      estado: 'EN_MANTENCION' as const,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockPuedeAsignar = true;

    vi.mocked(obtenerEventoPrevencion).mockResolvedValue(mockDetalleEvento);
    vi.mocked(patrullasService.listar).mockResolvedValue({
      exito: true,
      mensaje: 'OK',
      data: mockPatrullas as unknown as PatrullaVerificadoraDTO[],
      meta: { total: 2, page: 1, limit: 100, totalPages: 1, hasNext: false, hasPrev: false },
    });
    vi.mocked(getRecursos).mockResolvedValue({
      data: mockInventario as unknown as RecursoItem[],
      meta: { total: 3, pagina: 1, limite: 100, totalPaginas: 1 },
    });
  });

  it('1. debe renderizar la ficha del evento preventivo, punto crítico PostGIS e historial de misiones', async () => {
    render(<DetalleEventoPrevencionClient id="prev-1234" />);

    expect(screen.getByText(/cargando información consolidada del evento de prevención/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('PREV-2026-0001')).toBeInTheDocument();
      expect(screen.getByText('Limpieza preventiva de colectores en Angachilla')).toBeInTheDocument();
      expect(screen.getByText('PC-VAL-001')).toBeInTheDocument();
      expect(screen.getByText('Colector Humedal Angachilla')).toBeInTheDocument();
      expect(screen.getByText('Humedal Angachilla')).toBeInTheDocument();
      expect(screen.getByText('Delegación Sur')).toBeInTheDocument();
    });

    expect(screen.getByText('MIS-2026-0045')).toBeInTheDocument();
    expect(screen.getByText(/Patrulla Verificadora Alfa \(En prevención\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Sacos de Arena 25kg \(Previos\)/i)).toBeInTheDocument();
  });

  it('2. debe mostrar aviso fallback de coordenadas libres cuando puntoCritico es null (regla §3.4)', async () => {
    vi.mocked(obtenerEventoPrevencion).mockResolvedValueOnce({
      ...mockDetalleEvento,
      puntoCritico: null,
    });

    render(<DetalleEventoPrevencionClient id="prev-1234" />);

    await waitFor(() => {
      expect(screen.getByText(/Evento con coordenadas libres/i)).toBeInTheDocument();
    });
  });

  it('3. debe mostrar pantalla de error cuando falla la carga (ej. 404 Not Found)', async () => {
    vi.mocked(obtenerEventoPrevencion).mockRejectedValueOnce(
      new PrevencionServiceError('El evento de prevención especificado no fue encontrado.', {
        statusCode: 404,
      })
    );

    render(<DetalleEventoPrevencionClient id="prev-inexistente" />);

    await waitFor(() => {
      expect(screen.getByText(/No se pudo cargar el evento de prevención/i)).toBeInTheDocument();
      expect(screen.getByText(/no fue encontrado/i)).toBeInTheDocument();
    });
  });

  it('4. debe listar únicamente patrullas DISPONIBLE en el selector', async () => {
    render(<DetalleEventoPrevencionClient id="prev-1234" />);

    await waitFor(() => {
      expect(screen.getByText('PREV-2026-0001')).toBeInTheDocument();
    });

    expect(screen.getByRole('option', { name: /Patrulla Centro-Sur/i })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Patrulla Costa-1/i })).not.toBeInTheDocument();
  });

  it('5. regla §3.6: fija cantidad en 1 para activos individuales y valida stock para insumos a granel', async () => {
    render(<DetalleEventoPrevencionClient id="prev-1234" />);

    await waitFor(() => {
      expect(screen.getByText('PREV-2026-0001')).toBeInTheDocument();
    });

    const selectorPatrulla = screen.getByLabelText(/Patrulla Verificadora Disponible/i);
    fireEvent.change(selectorPatrulla, { target: { value: 'pat-disponible-1' } });

    const buscadorInsumo = screen.getAllByLabelText(/Buscar o seleccionar insumo del inventario/i)[0];
    fireEvent.focus(buscadorInsumo);
    fireEvent.click(within(screen.getByRole('listbox')).getByText('Motobomba de Achique 3"'));

    const inputCantidad = screen.getByRole('spinbutton');
    expect(inputCantidad).toHaveValue(1);
    expect(inputCantidad).toBeDisabled();
    expect(screen.getByText('1 Activo')).toBeInTheDocument();

    // Limpiar selección actual y cambiar a insumo a granel (disponible: 50 - 10 = 40)
    fireEvent.click(screen.getByLabelText(/Quitar selección de insumo/i));
    fireEvent.focus(buscadorInsumo);
    fireEvent.click(within(screen.getByRole('listbox')).getByText('Sacos de Arena 25kg'));

    expect(inputCantidad).not.toBeDisabled();
    expect(screen.getByText('40 disponibles')).toBeInTheDocument();

    fireEvent.change(inputCantidad, { target: { value: '55' } });
    expect(screen.getByText(/Supera el stock disponible en bodega \(máx\. 40\)/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Confirmar y Despachar Misión Preventiva/i })
    ).toBeDisabled();
  });

  it('6. debe permitir agregar y eliminar filas y bloquear insumos duplicados', async () => {
    render(<DetalleEventoPrevencionClient id="prev-1234" />);

    await waitFor(() => {
      expect(screen.getByText('PREV-2026-0001')).toBeInTheDocument();
    });

    const selectorPatrulla = screen.getByLabelText(/Patrulla Verificadora Disponible/i);
    fireEvent.change(selectorPatrulla, { target: { value: 'pat-disponible-1' } });

    fireEvent.click(screen.getByRole('button', { name: /Agregar Otro Insumo/i }));
    const buscadores = screen.getAllByLabelText(/Buscar o seleccionar insumo del inventario/i);
    expect(buscadores).toHaveLength(2);

    // Seleccionar el mismo recurso en ambas filas
    fireEvent.focus(buscadores[0]);
    fireEvent.click(within(screen.getByRole('listbox')).getByText('Sacos de Arena 25kg'));

    fireEvent.focus(buscadores[1]);
    fireEvent.click(within(screen.getByRole('listbox')).getByText('Sacos de Arena 25kg'));

    expect(
      screen.getByText(/No puedes agregar el mismo insumo más de una vez en el despacho/i)
    ).toBeInTheDocument();

    const btnsEliminar = screen.getAllByLabelText(/Eliminar insumo/i);
    fireEvent.click(btnsEliminar[1]);
    expect(screen.getAllByRole('spinbutton')).toHaveLength(1);
  });

  it('7. debe confirmar la asignación preventiva, transicionar la patrulla a EN_PREVENCION y recargar catálogos', async () => {
    vi.mocked(asignarRecursosPrevencion).mockResolvedValueOnce({
      message: 'Patrulla y recursos logísticos asignados exitosamente al evento de prevención.',
      data: {
        evento: {
          id: 'prev-1234',
          codigo: 'PREV-2026-0001',
          nombre: 'Limpieza preventiva de colectores en Angachilla',
          estado: 'PLANIFICADA',
        },
        mision: {
          id: 'mis-200',
          codigo: 'MIS-2026-0099',
          titulo: 'Limpieza preventiva de colectores en Angachilla',
          estado: 'DESPACHADA',
          tipoMision: 'PREVENCION',
        },
        patrulla: {
          id: 'pat-disponible-1',
          nombre: 'Patrulla Centro-Sur',
          estado: 'EN_PREVENCION',
        },
        recursos: [
          {
            recursoId: 'rec-sacos',
            nombre: 'Sacos de Arena 25kg',
            esIndividual: false,
            cantidadAsignada: 10,
            cantidadEnUso: 20,
            estadoRecurso: 'DISPONIBLE',
          },
        ],
        asignadoEn: '2026-11-19T21:30:00.000Z',
      },
    });

    render(<DetalleEventoPrevencionClient id="prev-1234" />);

    await waitFor(() => {
      expect(screen.getByText('PREV-2026-0001')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Patrulla Verificadora Disponible/i), {
      target: { value: 'pat-disponible-1' },
    });

    const buscadorInsumo = screen.getAllByLabelText(/Buscar o seleccionar insumo del inventario/i)[0];
    fireEvent.focus(buscadorInsumo);
    fireEvent.click(within(screen.getByRole('listbox')).getByText('Sacos de Arena 25kg'));

    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '10' } });

    const btnSubmit = screen.getByRole('button', {
      name: /Confirmar y Despachar Misión Preventiva/i,
    });
    expect(btnSubmit).toBeEnabled();

    fireEvent.click(btnSubmit);

    await waitFor(() => {
      expect(asignarRecursosPrevencion).toHaveBeenCalledWith('prev-1234', {
        patrullaId: 'pat-disponible-1',
        recursos: [{ recursoId: 'rec-sacos', cantidad: 10 }],
      });
      expect(mockToast.showSuccess).toHaveBeenCalledWith(
        expect.stringContaining('MIS-2026-0099')
      );
      expect(obtenerEventoPrevencion).toHaveBeenCalledTimes(2);
      expect(patrullasService.listar).toHaveBeenCalledTimes(2);
      expect(getRecursos).toHaveBeenCalledTimes(2);
    });
  });

  it('8. debe mostrar banner de conflicto específico ante 409 (STOCK_INSUFICIENTE, PATRULLA_OCUPADA, ACTIVO_NO_DISPONIBLE)', async () => {
    vi.mocked(asignarRecursosPrevencion)
      .mockRejectedValueOnce(
        new PrevencionServiceError('Stock insuficiente', {
          statusCode: 409,
          tipoConflicto: 'STOCK_INSUFICIENTE',
        })
      )
      .mockRejectedValueOnce(
        new PrevencionServiceError('Patrulla ocupada', {
          statusCode: 409,
          tipoConflicto: 'PATRULLA_OCUPADA',
        })
      )
      .mockRejectedValueOnce(
        new PrevencionServiceError('Activo en mantención', {
          statusCode: 409,
          tipoConflicto: 'ACTIVO_NO_DISPONIBLE',
        })
      );

    render(<DetalleEventoPrevencionClient id="prev-1234" />);

    await waitFor(() => {
      expect(screen.getByText('PREV-2026-0001')).toBeInTheDocument();
    });

    const seleccionarYEnviar = () => {
      fireEvent.change(screen.getByLabelText(/Patrulla Verificadora Disponible/i), {
        target: { value: 'pat-disponible-1' },
      });
      const buscador = screen.getAllByLabelText(/Buscar o seleccionar insumo del inventario/i)[0];
      fireEvent.focus(buscador);
      fireEvent.click(within(screen.getByRole('listbox')).getByText('Sacos de Arena 25kg'));
      fireEvent.click(
        screen.getByRole('button', { name: /Confirmar y Despachar Misión Preventiva/i })
      );
    };

    seleccionarYEnviar();
    await waitFor(() => {
      expect(screen.getByText(/El stock en bodega cambió concurrentemente/i)).toBeInTheDocument();
    });

    seleccionarYEnviar();
    await waitFor(() => {
      expect(
        screen.getByText(/La patrulla verificadora seleccionada ya no se encuentra disponible/i)
      ).toBeInTheDocument();
    });

    seleccionarYEnviar();
    await waitFor(() => {
      expect(
        screen.getByText(/El activo individual seleccionado no está disponible/i)
      ).toBeInTheDocument();
    });
  });

  it('9. debe mostrar error 403 si el servidor rechaza por falta del permiso misiones:asignar', async () => {
    vi.mocked(asignarRecursosPrevencion).mockRejectedValueOnce(
      new PrevencionServiceError('Forbidden', { statusCode: 403 })
    );

    render(<DetalleEventoPrevencionClient id="prev-1234" />);

    await waitFor(() => {
      expect(screen.getByText('PREV-2026-0001')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Patrulla Verificadora Disponible/i), {
      target: { value: 'pat-disponible-1' },
    });
    const buscador = screen.getAllByLabelText(/Buscar o seleccionar insumo del inventario/i)[0];
    fireEvent.focus(buscador);
    fireEvent.click(within(screen.getByRole('listbox')).getByText('Sacos de Arena 25kg'));
    fireEvent.click(
      screen.getByRole('button', { name: /Confirmar y Despachar Misión Preventiva/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText(/No cuentas con el permiso institucional requerido \(misiones:asignar\)/i)
      ).toBeInTheDocument();
    });
  });

  it('10. debe bloquear el formulario si el evento está COMPLETADA o CANCELADA', async () => {
    vi.mocked(obtenerEventoPrevencion).mockResolvedValueOnce({
      ...mockDetalleEvento,
      estado: 'COMPLETADA',
    });

    render(<DetalleEventoPrevencionClient id="prev-1234" />);

    await waitFor(() => {
      expect(screen.getByText('PREV-2026-0001')).toBeInTheDocument();
    });

    expect(screen.getByText(/Este evento de prevención se encuentra en estado/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Confirmar y Despachar Misión Preventiva/i })
    ).not.toBeInTheDocument();
  });

  it('11. debe advertir falta de permisos si el usuario carece de misiones:asignar', async () => {
    mockPuedeAsignar = false;

    render(<DetalleEventoPrevencionClient id="prev-1234" />);

    await waitFor(() => {
      expect(screen.getByText('PREV-2026-0001')).toBeInTheDocument();
    });

    expect(screen.getByText(/Se requiere el permiso institucional/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Confirmar y Despachar Misión Preventiva/i })
    ).not.toBeInTheDocument();
  });

  it('12. debe refrescar ficha y catálogos al recibir eventos WebSocket de prevención, recurso y patrulla', async () => {
    render(<DetalleEventoPrevencionClient id="prev-1234" />);

    await waitFor(() => {
      expect(screen.getByText('PREV-2026-0001')).toBeInTheDocument();
    });

    const socketCalls = vi.mocked(usePrevencionSocket).mock.calls;
    const socketOptions = socketCalls[socketCalls.length - 1]?.[0];
    expect(socketOptions?.eventoId).toBe('prev-1234');

    await act(async () => {
      socketOptions?.onPrevencionActualizada?.({ id: 'prev-1234' });
      socketOptions?.onPatrullaActualizada?.({ id: 'pat-disponible-1', estado: 'EN_PREVENCION' });
    });

    await waitFor(() => {
      expect(obtenerEventoPrevencion).toHaveBeenCalledTimes(2);
      expect(patrullasService.listar.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
  });
});
