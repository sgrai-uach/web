import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DetalleEventoRecuperacionClient } from '../DetalleEventoRecuperacionClient';
import {
  obtenerEventoRecuperacion,
  asignarRecursosRecuperacion,
  RecuperacionServiceError,
} from '@/services/recuperacionService';
import { patrullasService } from '@/services/patrullasService';
import { getRecursos } from '@/services/recursosService';
import type { DetalleEventoRecuperacionResponse } from '@/types/recuperacion';

// Mock del mapa interactivo
vi.mock('@/components/maps/LocationPickerMap', () => ({
  default: ({ latitud, longitud }: { latitud: number; longitud: number }) => (
    <div data-testid="mock-location-picker">
      Coords: {latitud}, {longitud}
    </div>
  ),
}));

// Mock del hook de permisos
let mockPuedeAsignar = true;
vi.mock('@/hooks/usePuedeAsignarMision', () => ({
  usePuedeAsignarMision: () => mockPuedeAsignar,
}));

// Mock del hook de sockets
vi.mock('@/hooks/useRecuperacionSocket', () => ({
  useRecuperacionSocket: vi.fn(),
}));

// Mock de servicios
vi.mock('@/services/recuperacionService', () => {
  class MockRecuperacionServiceError extends Error {
    public statusCode?: number;
    public tipoConflicto?: string;

    constructor(message: string, options?: { statusCode?: number; tipoConflicto?: string }) {
      super(message);
      this.name = 'RecuperacionServiceError';
      this.statusCode = options?.statusCode;
      this.tipoConflicto = options?.tipoConflicto;
    }
  }

  return {
    obtenerEventoRecuperacion: vi.fn(),
    asignarRecursosRecuperacion: vi.fn(),
    RecuperacionServiceError: MockRecuperacionServiceError,
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

describe('DetalleEventoRecuperacionClient (HU-32)', () => {
  const mockDetalleEvento: DetalleEventoRecuperacionResponse = {
    id: 'rec-1234',
    codigo: 'REC-2026-0001',
    nombre: 'Operativo Afectación Collico',
    descripcion: 'Afectación por desborde fluvial e ingreso de agua a viviendas.',
    sector: 'Collico',
    direccionTexto: 'Pasaje Los Cipreses 450',
    prioridad: 'ALTA',
    contactoNombre: 'Sra. María González',
    contactoTelefono: '+56987654321',
    latitud: -39.8142,
    longitud: -73.2459,
    estado: 'PLANIFICADA',
    familiasAfectadas: 6,
    delegacion: {
      id: 'del-1',
      codigo: 'DEL-SUR',
      nombre: 'Delegación Sur',
    },
    misiones: [
      {
        id: 'mis-10',
        codigo: 'MIS-2026-0001',
        titulo: 'Entrega inicial de frazadas',
        estado: 'DESPACHADA',
        tipoMision: 'RECUPERACION',
        creadoEn: '2026-10-04T22:30:00.000Z',
        patrulla: {
          id: 'pat-1',
          nombre: 'Patrulla Rápida Costa-1',
          estado: 'EN_RECUPERACION',
        },
        recursos: [
          {
            recursoId: 'rec-frazadas',
            nombre: 'Frazadas de Lana',
            cantidadAsignada: 12,
          },
        ],
      },
    ],
    recursos: [
      {
        recursoId: 'rec-frazadas',
        nombre: 'Frazadas de Lana',
        cantidadAsignada: 12,
      },
    ],
    creadoEn: '2026-10-04T22:00:00.000Z',
    actualizadoEn: '2026-10-04T22:30:00.000Z',
  };

  const mockPatrullas = [
    {
      id: 'pat-disponible-1',
      nombre: 'Patrulla Centro-Sur',
      estado: 'DISPONIBLE' as const,
      delegacionNombre: 'Delegación Sur',
    },
    {
      id: 'pat-ocupada-2',
      nombre: 'Patrulla Costa-1',
      estado: 'EN_VERIFICACION' as const,
      delegacionNombre: 'Delegación Costa',
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
      id: 'rec-bomba',
      nombre: 'Motobomba de Achique 3"',
      esIndividual: true,
      cantidadInventario: 1,
      cantidadEnUso: 0,
      estado: 'DISPONIBLE' as const,
    },
    {
      id: 'rec-motosierra-taller',
      nombre: 'Motosierra Stihl',
      esIndividual: true,
      cantidadInventario: 1,
      cantidadEnUso: 0,
      estado: 'EN_MANTENCION' as const,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockPuedeAsignar = true;

    vi.mocked(obtenerEventoRecuperacion).mockResolvedValue(mockDetalleEvento);
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

  it('1. debe renderizar la información consolidada del evento y el historial de misiones', async () => {
    render(<DetalleEventoRecuperacionClient id="rec-1234" />);

    expect(screen.getByText(/cargando información consolidada/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('REC-2026-0001')).toBeInTheDocument();
      expect(screen.getByText('Operativo Afectación Collico')).toBeInTheDocument();
      expect(screen.getByText('Collico')).toBeInTheDocument();
      expect(screen.getByText('Delegación Sur')).toBeInTheDocument();
      expect(screen.getByText('6 familias')).toBeInTheDocument();
      expect(screen.getByText('Prioridad ALTA')).toBeInTheDocument();
    });

    // Historial previo
    expect(screen.getByText('MIS-2026-0001')).toBeInTheDocument();
    expect(screen.getByText(/Entrega inicial de frazadas/i)).toBeInTheDocument();
    expect(screen.getByText(/Patrulla Rápida Costa-1/i)).toBeInTheDocument();
    expect(screen.getByText(/Frazadas de Lana/i)).toBeInTheDocument();
  });

  it('2. debe listar únicamente patrullas disponibles en el selector', async () => {
    render(<DetalleEventoRecuperacionClient id="rec-1234" />);

    await waitFor(() => {
      expect(screen.getByText('REC-2026-0001')).toBeInTheDocument();
    });

    const selectorPatrulla = screen.getByLabelText(/Patrulla Verificadora Disponible/i);
    expect(selectorPatrulla).toBeInTheDocument();

    // Patrulla disponible debe estar
    expect(screen.getByRole('option', { name: /Patrulla Centro-Sur/i })).toBeInTheDocument();
    // Patrulla ocupada no debe aparecer
    expect(screen.queryByRole('option', { name: /Patrulla Costa-1/i })).not.toBeInTheDocument();
  });

  it('3. regla §3.6: fija la cantidad en 1 para activos individuales y valida stock para insumos a granel', async () => {
    render(<DetalleEventoRecuperacionClient id="rec-1234" />);

    await waitFor(() => {
      expect(screen.getByText('REC-2026-0001')).toBeInTheDocument();
    });

    // Seleccionar Patrulla disponible
    const selectorPatrulla = screen.getByLabelText(/Patrulla Verificadora Disponible/i);
    fireEvent.change(selectorPatrulla, { target: { value: 'pat-disponible-1' } });

    // Seleccionar Motobomba (activo individual)
    const selectorInsumo = screen.getAllByRole('combobox')[1];
    fireEvent.change(selectorInsumo, { target: { value: 'rec-bomba' } });

    // La cantidad debe estar bloqueada y fijada en 1
    const inputCantidad = screen.getByRole('spinbutton');
    expect(inputCantidad).toHaveValue(1);
    expect(inputCantidad).toBeDisabled();
    expect(screen.getByText('1 Activo')).toBeInTheDocument();

    // Cambiar a insumo a granel (Sacos de Arena)
    fireEvent.change(selectorInsumo, { target: { value: 'rec-sacos' } });
    expect(inputCantidad).not.toBeDisabled();
    expect(screen.getByText('40 disponibles')).toBeInTheDocument();

    // Intentar ingresar una cantidad superior al stock visible (40)
    fireEvent.change(inputCantidad, { target: { value: '55' } });
    expect(
      screen.getAllByText(/supera el stock disponible en bodega/i).length
    ).toBeGreaterThan(0);
  });

  it('4. permite agregar y eliminar filas dinámicas de insumos', async () => {
    render(<DetalleEventoRecuperacionClient id="rec-1234" />);

    await waitFor(() => {
      expect(screen.getByText('REC-2026-0001')).toBeInTheDocument();
    });

    const btnAgregar = screen.getByRole('button', { name: /Agregar Otro Insumo/i });
    expect(screen.getAllByRole('spinbutton')).toHaveLength(1);

    fireEvent.click(btnAgregar);
    expect(screen.getAllByRole('spinbutton')).toHaveLength(2);

    const btnsEliminar = screen.getAllByLabelText(/Eliminar insumo/i);
    fireEvent.click(btnsEliminar[1]);
    expect(screen.getAllByRole('spinbutton')).toHaveLength(1);
  });

  it('5. debe despachar exitosamente la misión con patrulla y recursos asignados', async () => {
    vi.mocked(asignarRecursosRecuperacion).mockResolvedValueOnce({
      message: 'Misión despachada exitosamente',
      data: {
        mision: {
          id: 'mis-200',
          codigo: 'MIS-2026-0002',
          titulo: 'Despacho Operativo',
          estado: 'DESPACHADA',
          tipoMision: 'RECUPERACION',
        },
        patrulla: {
          id: 'pat-disponible-1',
          nombre: 'Patrulla Centro-Sur',
          estado: 'EN_RECUPERACION',
        },
        recursos: [
          {
            recursoId: 'rec-sacos',
            nombre: 'Sacos de Arena 25kg',
            cantidadAsignada: 10,
          },
        ],
      },
    });

    render(<DetalleEventoRecuperacionClient id="rec-1234" />);

    await waitFor(() => {
      expect(screen.getByText('REC-2026-0001')).toBeInTheDocument();
    });

    // 1. Elegir patrulla
    const selectorPatrulla = screen.getByLabelText(/Patrulla Verificadora Disponible/i);
    fireEvent.change(selectorPatrulla, { target: { value: 'pat-disponible-1' } });

    // 2. Elegir recurso y cantidad
    const selectorInsumo = screen.getAllByRole('combobox')[1];
    fireEvent.change(selectorInsumo, { target: { value: 'rec-sacos' } });

    const inputCantidad = screen.getByRole('spinbutton');
    fireEvent.change(inputCantidad, { target: { value: '10' } });

    // 3. Confirmar despacho
    const btnSubmit = screen.getByRole('button', { name: /Confirmar y Despachar Misión/i });
    expect(btnSubmit).toBeEnabled();

    fireEvent.click(btnSubmit);

    await waitFor(() => {
      expect(asignarRecursosRecuperacion).toHaveBeenCalledWith(
        'rec-1234',
        {
          patrullaId: 'pat-disponible-1',
          recursos: [{ recursoId: 'rec-sacos', cantidad: 10 }],
        },
        expect.any(String)
      );
      expect(mockToast.showSuccess).toHaveBeenCalledWith(
        expect.stringContaining('MIS-2026-0002')
      );
    });
  });

  it('6. debe mostrar banner de conflicto ante error 409 de concurrencia de stock', async () => {
    vi.mocked(asignarRecursosRecuperacion).mockRejectedValueOnce(
      new RecuperacionServiceError('Stock insuficiente en bodega por cambio concurrente', {
        statusCode: 409,
        tipoConflicto: 'STOCK_INSUFICIENTE',
      })
    );

    render(<DetalleEventoRecuperacionClient id="rec-1234" />);

    await waitFor(() => {
      expect(screen.getByText('REC-2026-0001')).toBeInTheDocument();
    });

    const selectorPatrulla = screen.getByLabelText(/Patrulla Verificadora Disponible/i);
    fireEvent.change(selectorPatrulla, { target: { value: 'pat-disponible-1' } });

    const selectorInsumo = screen.getAllByRole('combobox')[1];
    fireEvent.change(selectorInsumo, { target: { value: 'rec-sacos' } });

    const btnSubmit = screen.getByRole('button', { name: /Confirmar y Despachar Misión/i });
    fireEvent.click(btnSubmit);

    await waitFor(() => {
      expect(
        screen.getByText(/El stock en bodega cambió concurrentemente/i)
      ).toBeInTheDocument();
      expect(mockToast.showError).toHaveBeenCalledWith(
        expect.stringContaining('Stock insuficiente en bodega')
      );
    });
  });

  it('7. debe bloquear el formulario y mostrar advertencia si el evento está COMPLETADA', async () => {
    vi.mocked(obtenerEventoRecuperacion).mockResolvedValueOnce({
      ...mockDetalleEvento,
      estado: 'COMPLETADA',
    });

    render(<DetalleEventoRecuperacionClient id="rec-1234" />);

    await waitFor(() => {
      expect(screen.getByText('REC-2026-0001')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Este evento de recuperación se encuentra en estado/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Confirmar y Despachar Misión/i })).not.toBeInTheDocument();
  });

  it('8. debe advertir falta de permisos si el usuario carece de misiones:asignar', async () => {
    mockPuedeAsignar = false;

    render(<DetalleEventoRecuperacionClient id="rec-1234" />);

    await waitFor(() => {
      expect(screen.getByText('REC-2026-0001')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Se requiere el permiso institucional/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Confirmar y Despachar Misión/i })).not.toBeInTheDocument();
  });
});
