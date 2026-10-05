import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ModalCrearEventoRecuperacion } from '../ModalCrearEventoRecuperacion';
import { crearEventoRecuperacion, RecuperacionServiceError } from '@/services/recuperacionService';
import { getRecursos } from '@/services/recursosService';
import { getCatalogos } from '@/services/catalogosService';
import type { EventoRecuperacionResponse } from '@/types/recuperacion';

vi.mock('@/components/maps/LocationPickerMap', () => ({
  default: ({ latitud, longitud, onChange }: { latitud: number; longitud: number; onChange?: (c: { latitud: number; longitud: number }) => void }) => (
    <div data-testid="mock-location-picker">
      <span>
        Coords: {latitud}, {longitud}
      </span>
      <button
        type="button"
        onClick={() => onChange && onChange({ latitud: -39.82, longitud: -73.25 })}
      >
        Mover Marcador
      </button>
    </div>
  ),
}));

vi.mock('@/services/catalogosService', () => ({
  getCatalogos: vi.fn().mockResolvedValue({
    delegaciones: [{ id: 'del-1', codigo: 'DEL-SUR', nombre: 'Delegación Sur' }],
    roles: [],
    especialidades: [],
    cargos: [],
  }),
}));

vi.mock('@/services/recursosService', () => ({
  getRecursos: vi.fn().mockResolvedValue({
    data: [
      {
        id: 'rec-1',
        nombre: 'Frazadas de Lana',
        cantidadDisponible: 20,
        cantidadInventario: 30,
        cantidadEnUso: 10,
      },
      {
        id: 'rec-2',
        nombre: 'Planchas de Zinc',
        cantidadDisponible: 5,
        cantidadInventario: 10,
        cantidadEnUso: 5,
      },
    ],
    meta: { total: 2, pagina: 1, limite: 100, totalPaginas: 1 },
  }),
}));

vi.mock('@/services/recuperacionService', () => {
  class MockRecuperacionServiceError extends Error {
    public statusCode?: number;
    public tipoConflicto?: string;
    public fieldErrors?: Record<string, string>;

    constructor(message: string, options?: { statusCode?: number; tipoConflicto?: string; fieldErrors?: Record<string, string> }) {
      super(message);
      this.name = 'RecuperacionServiceError';
      this.statusCode = options?.statusCode;
      this.tipoConflicto = options?.tipoConflicto;
      this.fieldErrors = options?.fieldErrors;
    }
  }

  return {
    crearEventoRecuperacion: vi.fn(),
    RecuperacionServiceError: MockRecuperacionServiceError,
  };
});

const mockToast = {
  showSuccess: vi.fn(),
  showError: vi.fn(),
  showWarning: vi.fn(),
  showInfo: vi.fn(),
};

vi.mock('@/components/ui/Toast', () => ({
  useToast: () => mockToast,
}));

describe('ModalCrearEventoRecuperacion (HU-29)', () => {
  const onClose = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockEventoCreado: EventoRecuperacionResponse = {
    id: 'rec-100',
    codigo: 'REC-2026-0001',
    nombre: 'Operativo Las Ánimas',
    descripcion: 'Afectación por viento',
    sector: 'Las Ánimas',
    direccionTexto: 'Calle Los Robles 123',
    prioridad: 'ALTA',
    contactoNombre: null,
    contactoTelefono: null,
    latitud: -39.8142,
    longitud: -73.2459,
    estado: 'PLANIFICADA',
    familiasAfectadas: 4,
    delegacion: null,
    mision: {
      id: 'mis-1',
      codigo: 'MIS-2026-0001',
      titulo: 'Operativo Las Ánimas',
      estado: 'DESPACHADA',
      tipoMision: 'RECUPERACION',
    },
    patrulla: {
      id: 'f1000000-0000-4000-8000-000000000002',
      nombre: 'Patrulla Rápida Centro-Sur',
      estado: 'EN_RECUPERACION',
    },
    recursos: [
      {
        recursoId: 'rec-1',
        nombre: 'Frazadas de Lana',
        cantidadAsignada: 5,
      },
    ],
    creadoPorId: 'encargado-1',
    creadoEn: '2026-10-04T22:30:00.000Z',
    actualizadoEn: '2026-10-04T22:30:00.000Z',
  };

  it('no debe renderizar nada si isOpen es falso', () => {
    render(<ModalCrearEventoRecuperacion isOpen={false} onClose={onClose} />);
    expect(screen.queryByText('Nuevo Evento de Recuperación')).not.toBeInTheDocument();
  });

  it('debe renderizar el formulario completo con inputs, mapa y selector de recursos al estar abierto', async () => {
    render(<ModalCrearEventoRecuperacion isOpen={true} onClose={onClose} onSuccess={onSuccess} />);

    expect(screen.getByText('Nuevo Evento de Recuperación')).toBeInTheDocument();
    expect(screen.getByLabelText(/Título \/ Nombre del Evento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sector \/ Población Afectada/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Prioridad Operativa/i)).toBeInTheDocument();
    expect(screen.getByTestId('mock-location-picker')).toBeInTheDocument();

    await waitFor(() => {
      expect(getRecursos).toHaveBeenCalled();
      expect(getCatalogos).toHaveBeenCalled();
    });
  });

  it('debe mostrar errores de validación si se envía el formulario vacío', async () => {
    render(<ModalCrearEventoRecuperacion isOpen={true} onClose={onClose} onSuccess={onSuccess} />);

    const submitBtn = screen.getByRole('button', { name: /Crear y Despachar Patrulla/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/El título del evento debe tener al menos 3 caracteres/i)).toBeInTheDocument();
      expect(screen.getByText(/El sector territorial es obligatorio/i)).toBeInTheDocument();
      expect(crearEventoRecuperacion).not.toHaveBeenCalled();
    });
  });

  it('debe validar que la cantidad no supere el stock disponible del recurso en bodega', async () => {
    render(<ModalCrearEventoRecuperacion isOpen={true} onClose={onClose} onSuccess={onSuccess} />);

    await waitFor(() => {
      expect(getRecursos).toHaveBeenCalled();
    });

    // Llenar campos requeridos
    fireEvent.change(screen.getByLabelText(/Título \/ Nombre del Evento/i), {
      target: { value: 'Entrega en Collico' },
    });
    fireEvent.change(screen.getByLabelText(/Sector \/ Población Afectada/i), {
      target: { value: 'Collico' },
    });

    // Seleccionar recurso 1 (disponible: 20)
    const selectRecurso = screen.getByLabelText(/Seleccionar insumo para fila 1/i);
    fireEvent.change(selectRecurso, { target: { value: 'rec-1' } });

    // Ingresar cantidad que excede el stock (ej: 50)
    const inputCantidad = screen.getByLabelText(/Cantidad a entregar para fila 1/i);
    fireEvent.change(inputCantidad, { target: { value: '50' } });

    const submitBtn = screen.getByRole('button', { name: /Crear y Despachar Patrulla/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Excede el stock disponible en bodega \(máx\. 20\)/i)).toBeInTheDocument();
      expect(crearEventoRecuperacion).not.toHaveBeenCalled();
    });
  });

  it('debe despachar el evento exitosamente al ingresar datos válidos', async () => {
    vi.mocked(crearEventoRecuperacion).mockResolvedValueOnce(mockEventoCreado);

    render(<ModalCrearEventoRecuperacion isOpen={true} onClose={onClose} onSuccess={onSuccess} />);

    await waitFor(() => {
      expect(getRecursos).toHaveBeenCalled();
    });

    fireEvent.change(screen.getByLabelText(/Título \/ Nombre del Evento/i), {
      target: { value: 'Operativo Las Ánimas' },
    });
    fireEvent.change(screen.getByLabelText(/Sector \/ Población Afectada/i), {
      target: { value: 'Las Ánimas' },
    });

    // Seleccionar recurso 1 con cantidad válida
    const selectRecurso = screen.getByLabelText(/Seleccionar insumo para fila 1/i);
    fireEvent.change(selectRecurso, { target: { value: 'rec-1' } });

    const inputCantidad = screen.getByLabelText(/Cantidad a entregar para fila 1/i);
    fireEvent.change(inputCantidad, { target: { value: '5' } });

    const submitBtn = screen.getByRole('button', { name: /Crear y Despachar Patrulla/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(crearEventoRecuperacion).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: 'Operativo Las Ánimas',
          sector: 'Las Ánimas',
          recursos: [{ recursoId: 'rec-1', cantidad: 5 }],
        }),
        undefined
      );
      expect(mockToast.showSuccess).toHaveBeenCalledWith(
        expect.stringContaining('REC-2026-0001'),
        expect.any(String)
      );
      expect(onSuccess).toHaveBeenCalledWith(mockEventoCreado);
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('debe mostrar banner de conflicto cuando la patrulla ya está ocupada (409 Conflict)', async () => {
    vi.mocked(crearEventoRecuperacion).mockRejectedValueOnce(
      new RecuperacionServiceError(
        'La patrulla "Patrulla Rápida Costa-1" no está disponible para asignación.',
        { statusCode: 409, tipoConflicto: 'PATRULLA_OCUPADA' }
      )
    );

    render(<ModalCrearEventoRecuperacion isOpen={true} onClose={onClose} onSuccess={onSuccess} />);

    await waitFor(() => {
      expect(getRecursos).toHaveBeenCalled();
    });

    fireEvent.change(screen.getByLabelText(/Título \/ Nombre del Evento/i), {
      target: { value: 'Operativo Prueba Conflicto' },
    });
    fireEvent.change(screen.getByLabelText(/Sector \/ Población Afectada/i), {
      target: { value: 'Niebla' },
    });

    const selectRecurso = screen.getByLabelText(/Seleccionar insumo para fila 1/i);
    fireEvent.change(selectRecurso, { target: { value: 'rec-1' } });

    const submitBtn = screen.getByRole('button', { name: /Crear y Despachar Patrulla/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/La patrulla seleccionada acaba de ser asignada a otra tarea o no se encuentra disponible/i)
      ).toBeInTheDocument();
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  it('debe mostrar banner de conflicto cuando el stock en bodega es insuficiente (409 Conflict)', async () => {
    vi.mocked(crearEventoRecuperacion).mockRejectedValueOnce(
      new RecuperacionServiceError(
        'Stock insuficiente en bodega para el recurso solicitado.',
        { statusCode: 409, tipoConflicto: 'STOCK_INSUFICIENTE' }
      )
    );

    render(<ModalCrearEventoRecuperacion isOpen={true} onClose={onClose} onSuccess={onSuccess} />);

    await waitFor(() => {
      expect(getRecursos).toHaveBeenCalled();
    });

    fireEvent.change(screen.getByLabelText(/Título \/ Nombre del Evento/i), {
      target: { value: 'Operativo Prueba Stock' },
    });
    fireEvent.change(screen.getByLabelText(/Sector \/ Población Afectada/i), {
      target: { value: 'Niebla' },
    });

    const selectRecurso = screen.getByLabelText(/Seleccionar insumo para fila 1/i);
    fireEvent.change(selectRecurso, { target: { value: 'rec-1' } });

    const submitBtn = screen.getByRole('button', { name: /Crear y Despachar Patrulla/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Stock insuficiente en bodega para uno o más de los insumos requeridos/i)
      ).toBeInTheDocument();
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
