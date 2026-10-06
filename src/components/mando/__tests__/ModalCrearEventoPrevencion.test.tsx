import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ModalCrearEventoPrevencion } from '../ModalCrearEventoPrevencion';
import {
  crearEventoPrevencion,
  PrevencionServiceError,
} from '@/services/prevencionService';
import { getCatalogos } from '@/services/catalogosService';
import { getRecursos } from '@/services/recursosService';
import { getPuntosCriticos } from '@/services/puntosCriticosService';
import type { EventoPrevencionDTO } from '@/types/evento-prevencion';
import type { PuntoCriticoItem } from '@/types/puntoCritico';

// Mocks de dependencias
vi.mock('@/services/prevencionService', () => ({
  crearEventoPrevencion: vi.fn(),
  PrevencionServiceError: class extends Error {
    public statusCode?: number;
    public tipoConflicto?: string;
    public fieldErrors?: Record<string, string>;
    constructor(message: string, options?: { statusCode?: number; tipoConflicto?: string; fieldErrors?: Record<string, string> }) {
      super(message);
      this.name = 'PrevencionServiceError';
      this.statusCode = options?.statusCode;
      this.tipoConflicto = options?.tipoConflicto;
      this.fieldErrors = options?.fieldErrors;
    }
  },
}));

vi.mock('@/services/catalogosService', () => ({
  getCatalogos: vi.fn(),
}));

vi.mock('@/services/recursosService', () => ({
  getRecursos: vi.fn(),
}));

vi.mock('@/services/puntosCriticosService', () => ({
  getPuntosCriticos: vi.fn(),
}));

const mockToast = {
  showSuccess: vi.fn(),
  showError: vi.fn(),
  showInfo: vi.fn(),
  showWarning: vi.fn(),
};

vi.mock('@/components/ui/Toast', () => ({
  useToast: () => mockToast,
}));

vi.mock('@/components/maps/LocationPickerMap', () => ({
  default: ({ latitud, longitud, onChange }: { latitud?: number; longitud?: number; onChange?: (c: { latitud: number; longitud: number }) => void }) => (
    <div data-testid="mock-location-picker">
      <span>Mock Leaflet Map: {latitud}, {longitud}</span>
      <button
        type="button"
        onClick={() => onChange?.({ latitud: -39.82, longitud: -73.23 })}
      >
        Mover Marcador Mock
      </button>
    </div>
  ),
}));

describe('ModalCrearEventoPrevencion (HU-30)', () => {
  const onClose = vi.fn();
  const onSuccess = vi.fn();

  const mockPuntosCriticos: PuntoCriticoItem[] = [
    {
      id: 'pc-1',
      codigo: 'PC-ANG-01',
      nombre: 'Sector Humedal Angachilla - Pasaje Los Robles',
      descripcion: 'Zona baja con riesgo recurrente de anegamiento',
      tipoRiesgo: 'Inundación',
      prioridad: 'ALTA',
      activo: true,
      estadoTexto: 'Activo',
      latitud: -39.8456,
      longitud: -73.2389,
      delegacion: {
        id: 'del-sur-id',
        codigo: 'DEL_SUR',
        nombre: 'Delegación Municipal Sur',
      },
      creadoEn: '2026-06-15T12:00:00.000Z',
    },
  ];

  const mockCatalogos = {
    delegaciones: [
      { id: 'del-norte-id', codigo: 'DEL_NORTE', nombre: 'Delegación Norte' },
      { id: 'del-sur-id', codigo: 'DEL_SUR', nombre: 'Delegación Sur' },
    ],
    roles: [],
    especialidades: [],
    cargos: [],
  };

  const mockRecursos = {
    data: [
      {
        id: 'rec-1',
        codigo: 'REC-001',
        nombre: 'Sacos de Arena 25kg',
        tipo: 'INSUMO',
        cantidadTotal: 50,
        cantidadDisponible: 20,
        cantidadEnUso: 30,
        estado: 'DISPONIBLE' as const,
        unidadMedida: 'unidades',
      },
    ],
    meta: { total: 1, pagina: 1, limite: 100, totalPaginas: 1 },
  };

  const mockEventoCreado: EventoPrevencionDTO = {
    id: 'prev-1',
    codigo: 'PREV-2026-0001',
    nombre: 'Limpieza y monitoreo de sumideros en Angachilla',
    descripcion: 'Monitoreo preventivo del caudal e inspección de alcantarillas por frente de mal tiempo.',
    sector: 'Humedal Angachilla',
    direccionTexto: 'Av. Simpson con Los Robles',
    prioridad: 'ALTA',
    estado: 'PLANIFICADA',
    latitud: -39.8456,
    longitud: -73.2389,
    puntoCritico: {
      id: 'pc-1',
      codigo: 'PC-ANG-01',
      nombre: 'Sector Humedal Angachilla - Pasaje Los Robles',
    },
    delegacion: {
      id: 'del-sur-id',
      codigo: 'DEL_SUR',
      nombre: 'Delegación Municipal Sur',
    },
    mision: {
      id: 'mis-1',
      codigo: 'MIS-2026-0006',
      titulo: 'Limpieza y monitoreo',
      estado: 'DESPACHADA',
      tipoMision: 'PREVENCION',
    },
    patrulla: {
      id: 'f1000000-0000-4000-8000-000000000002',
      nombre: 'Patrulla Rápida Centro-Sur',
      estado: 'EN_PREVENCION',
    },
    recursos: [],
    creadoPorId: 'encargado-1',
    creadoEn: '2026-10-05T06:45:50.867Z',
    actualizadoEn: '2026-10-05T06:45:50.867Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCatalogos).mockResolvedValue(mockCatalogos);
    vi.mocked(getRecursos).mockResolvedValue(mockRecursos);
    vi.mocked(getPuntosCriticos).mockResolvedValue({
      data: mockPuntosCriticos,
      meta: { total: 1, pagina: 1, limite: 100, totalPaginas: 1 },
    });
  });

  it('no debe renderizar nada si isOpen es falso', () => {
    render(<ModalCrearEventoPrevencion isOpen={false} onClose={onClose} />);
    expect(screen.queryByText('Nuevo Evento de Prevención')).not.toBeInTheDocument();
  });

  it('debe renderizar el formulario completo con inputs, mapa y opciones al estar abierto', async () => {
    render(<ModalCrearEventoPrevencion isOpen={true} onClose={onClose} onSuccess={onSuccess} />);

    expect(screen.getByText('Nuevo Evento de Prevención')).toBeInTheDocument();
    expect(screen.getByLabelText(/Título \/ Nombre de la Labor Preventiva/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Instrucciones Tácticas y Detalle de Mitigación/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Prioridad Operativa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Delegación Territorial Municipal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Punto Crítico Preexistente/i)).toBeInTheDocument();
    expect(screen.getByTestId('mock-location-picker')).toBeInTheDocument();

    await waitFor(() => {
      expect(getCatalogos).toHaveBeenCalled();
      expect(getRecursos).toHaveBeenCalled();
      expect(getPuntosCriticos).toHaveBeenCalled();
    });
  });

  it('debe mostrar errores de validación si se envía el formulario vacío', async () => {
    render(<ModalCrearEventoPrevencion isOpen={true} onClose={onClose} onSuccess={onSuccess} />);

    const submitBtn = screen.getByRole('button', { name: /Crear y Despachar Patrulla/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/El título de la labor preventiva debe tener al menos 3 caracteres/i)).toBeInTheDocument();
      expect(screen.getByText(/Las instrucciones tácticas son obligatorias/i)).toBeInTheDocument();
      expect(crearEventoPrevencion).not.toHaveBeenCalled();
    });
  });

  it('debe autocompletar coordenadas y delegación al seleccionar un Punto Crítico del catálogo', async () => {
    render(<ModalCrearEventoPrevencion isOpen={true} onClose={onClose} onSuccess={onSuccess} />);

    await waitFor(() => {
      expect(getPuntosCriticos).toHaveBeenCalled();
    });

    const selectPuntoCritico = screen.getByLabelText(/Punto Crítico Preexistente/i);
    fireEvent.change(selectPuntoCritico, { target: { value: 'pc-1' } });

    await waitFor(() => {
      expect(screen.getByText(/Punto Crítico Vinculado: PC-ANG-01/i)).toBeInTheDocument();
      expect(screen.getByText(/Mock Leaflet Map: -39.8456, -73.2389/i)).toBeInTheDocument();
      const selectDelegacion = screen.getByLabelText(/Delegación Territorial Municipal/i) as HTMLSelectElement;
      expect(selectDelegacion.value).toBe('del-sur-id');
    });
  });

  it('debe despachar el evento exitosamente sin recursos (recursos opcionales)', async () => {
    vi.mocked(crearEventoPrevencion).mockResolvedValueOnce(mockEventoCreado);

    render(<ModalCrearEventoPrevencion isOpen={true} onClose={onClose} onSuccess={onSuccess} />);

    await waitFor(() => {
      expect(getCatalogos).toHaveBeenCalled();
    });

    fireEvent.change(screen.getByLabelText(/Título \/ Nombre de la Labor Preventiva/i), {
      target: { value: 'Limpieza y monitoreo de sumideros en Angachilla' },
    });
    fireEvent.change(screen.getByLabelText(/Instrucciones Tácticas y Detalle de Mitigación/i), {
      target: { value: 'Monitoreo preventivo del caudal e inspección de alcantarillas por frente de mal tiempo.' },
    });
    fireEvent.change(screen.getByLabelText(/Sector \/ Barrio de Referencia/i), {
      target: { value: 'Humedal Angachilla' },
    });

    const submitBtn = screen.getByRole('button', { name: /Crear y Despachar Patrulla/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(crearEventoPrevencion).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: 'Limpieza y monitoreo de sumideros en Angachilla',
          descripcion: 'Monitoreo preventivo del caudal e inspección de alcantarillas por frente de mal tiempo.',
          sector: 'Humedal Angachilla',
        }),
        undefined
      );
      expect(mockToast.showSuccess).toHaveBeenCalledWith(
        expect.stringContaining('PREV-2026-0001'),
        expect.any(String)
      );
      expect(onSuccess).toHaveBeenCalledWith(mockEventoCreado);
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('debe validar que la cantidad no supere el stock si se agregan recursos opcionales', async () => {
    render(<ModalCrearEventoPrevencion isOpen={true} onClose={onClose} onSuccess={onSuccess} />);

    await waitFor(() => {
      expect(getRecursos).toHaveBeenCalled();
    });

    fireEvent.change(screen.getByLabelText(/Título \/ Nombre de la Labor Preventiva/i), {
      target: { value: 'Despeje preventivo' },
    });
    fireEvent.change(screen.getByLabelText(/Instrucciones Tácticas y Detalle de Mitigación/i), {
      target: { value: 'Despejar ramas y talud' },
    });

    // Agregar fila de recurso
    const btnAgregarRecurso = screen.getByRole('button', { name: /Agregar Insumo/i });
    fireEvent.click(btnAgregarRecurso);

    // Seleccionar recurso 1 (disponible: 20)
    const selectRecurso = screen.getByRole('combobox', { name: '' });
    fireEvent.change(selectRecurso, { target: { value: 'rec-1' } });

    // Ingresar cantidad que excede el stock (ej: 50)
    const inputCantidad = screen.getByRole('spinbutton');
    fireEvent.change(inputCantidad, { target: { value: '50' } });

    const submitBtn = screen.getByRole('button', { name: /Crear y Despachar Patrulla/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Excede el stock disponible en bodega \(máx\. 20\)/i)).toBeInTheDocument();
      expect(crearEventoPrevencion).not.toHaveBeenCalled();
    });
  });

  it('debe mostrar banner de conflicto cuando la patrulla ya está ocupada (409 Conflict)', async () => {
    vi.mocked(crearEventoPrevencion).mockRejectedValueOnce(
      new PrevencionServiceError(
        'La patrulla "Patrulla Rápida Costa-1" no está disponible para asignación.',
        { statusCode: 409, tipoConflicto: 'PATRULLA_OCUPADA' }
      )
    );

    render(<ModalCrearEventoPrevencion isOpen={true} onClose={onClose} onSuccess={onSuccess} />);

    await waitFor(() => {
      expect(getCatalogos).toHaveBeenCalled();
    });

    fireEvent.change(screen.getByLabelText(/Título \/ Nombre de la Labor Preventiva/i), {
      target: { value: 'Prueba patrulla ocupada' },
    });
    fireEvent.change(screen.getByLabelText(/Instrucciones Tácticas y Detalle de Mitigación/i), {
      target: { value: 'Inspección de emergencia' },
    });

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
    vi.mocked(crearEventoPrevencion).mockRejectedValueOnce(
      new PrevencionServiceError(
        'Stock insuficiente en bodega para uno o más de los insumos requeridos.',
        { statusCode: 409, tipoConflicto: 'STOCK_INSUFICIENTE' }
      )
    );

    render(<ModalCrearEventoPrevencion isOpen={true} onClose={onClose} onSuccess={onSuccess} />);

    await waitFor(() => {
      expect(getCatalogos).toHaveBeenCalled();
    });

    fireEvent.change(screen.getByLabelText(/Título \/ Nombre de la Labor Preventiva/i), {
      target: { value: 'Prueba stock insuficiente' },
    });
    fireEvent.change(screen.getByLabelText(/Instrucciones Tácticas y Detalle de Mitigación/i), {
      target: { value: 'Inspección con sacos de arena' },
    });

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
