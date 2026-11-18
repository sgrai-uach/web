import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OperativoRecuperacionDrawer } from '../OperativoRecuperacionDrawer';
import { ModalEditarOperativoRecuperacion } from '../ModalEditarOperativoRecuperacion';
import {
  obtenerDetalleOperativoRecuperacion,
  editarOperativoRecuperacion,
  RecuperacionServiceError,
} from '@/services/recuperacionService';
import { getRecursos } from '@/services/recursosService';
import { patrullasService } from '@/services/patrullasService';
import { usePuedeEditarRecuperacion } from '@/hooks/usePuedeEditarRecuperacion';
import type { OperativoRecuperacionDetalle } from '@/types/recuperacion';

vi.mock('@/services/recuperacionService', async () => {
  const actual = await vi.importActual<typeof import('@/services/recuperacionService')>(
    '@/services/recuperacionService'
  );
  return {
    ...actual,
    obtenerDetalleOperativoRecuperacion: vi.fn(),
    editarOperativoRecuperacion: vi.fn(),
  };
});

vi.mock('@/services/recursosService', () => ({
  getRecursos: vi.fn(),
}));

vi.mock('@/services/patrullasService', () => ({
  patrullasService: {
    listar: vi.fn(),
  },
}));

vi.mock('@/hooks/useRecuperacionSocket', () => ({
  useRecuperacionSocket: vi.fn(() => ({ conectado: true, ultimoEvento: null })),
}));

vi.mock('@/hooks/usePuedeEditarRecuperacion', () => ({
  usePuedeEditarRecuperacion: vi.fn(() => true),
}));

const mockOperativoBase: OperativoRecuperacionDetalle = {
  id: 'e4f8b9a1-0000-4000-8000-000000000001',
  codigo: 'REC-2026-0001',
  nombre: 'Entrega de techumbre Collico',
  descripcion: 'Entrega inicial de planchas de zinc',
  sector: 'Collico',
  direccionTexto: 'Av. Balmaceda 1200',
  prioridad: 'ALTA',
  contactoNombre: 'Juan Pérez',
  contactoTelefono: '+56912345678',
  latitud: -39.8142,
  longitud: -73.2459,
  estado: 'EN_EJECUCION',
  familiasAfectadas: 6,
  delegacion: { id: '30000000-0000-4000-8000-000000000001', codigo: 'NORTE', nombre: 'Delegación Norte' },
  creadoPor: { id: 'u1', nombre: 'Encargado Operaciones' },
  mision: {
    id: '60000000-0000-4000-8000-000000000001',
    codigo: 'MIS-2026-0010',
    titulo: 'Entrega de techumbre Collico',
    estado: 'DESPACHADA',
    tipoMision: 'RECUPERACION',
  },
  patrulla: {
    id: '50000000-0000-4000-8000-000000000001',
    nombre: 'Patrulla Alfa',
    estado: 'EN_RECUPERACION',
  },
  recursos: [
    {
      recursoId: '80000000-0000-4000-8000-000000000001',
      nombre: 'Kit Techumbre',
      cantidadAsignada: 5,
    },
  ],
  cantidadInsumosAsignados: 5,
  totalTiposInsumos: 1,
  historial: [],
  creadoEn: '2026-11-18T00:00:00.000Z',
  actualizadoEn: '2026-11-18T01:00:00.000Z',
  fechaEstimadaFin: '2026-11-20T18:00:00.000Z',
  actualizadoPorId: null,
  fechaCierre: null,
  observacionesCierre: null,
};

describe('HU-74: OperativoRecuperacionDrawer y ModalEditarOperativoRecuperacion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePuedeEditarRecuperacion).mockReturnValue(true);
    vi.mocked(getRecursos).mockResolvedValue({
      data: [
        {
          id: '80000000-0000-4000-8000-000000000001',
          nombre: 'Kit Techumbre',
          cantidadDisponible: 20,
        } as never,
      ],
      meta: { total: 1, pagina: 1, limite: 100, totalPaginas: 1 },
    });
    vi.mocked(patrullasService.listar).mockResolvedValue({
      exito: true,
      data: [
        {
          id: '50000000-0000-4000-8000-000000000002',
          nombre: 'Patrulla Beta',
          estado: 'DISPONIBLE',
        } as never,
      ],
      meta: { total: 1, page: 1, limit: 100, totalPages: 1, hasNext: false, hasPrev: false },
    });
  });

  it('debe mostrar el botón Editar Planificación habilitado en operativos en curso cuando tiene permiso', async () => {
    vi.mocked(obtenerDetalleOperativoRecuperacion).mockResolvedValueOnce(mockOperativoBase);

    render(
      <OperativoRecuperacionDrawer
        operativoId={mockOperativoBase.id}
        onCerrar={vi.fn()}
      />
    );

    const botonEditar = await screen.findByRole('button', { name: /editar planificación/i });
    expect(botonEditar).toBeEnabled();
  });

  it('debe inhabilitar el botón Editar Planificación cuando el operativo está COMPLETADA', async () => {
    vi.mocked(obtenerDetalleOperativoRecuperacion).mockResolvedValueOnce({
      ...mockOperativoBase,
      estado: 'COMPLETADA',
    });

    render(
      <OperativoRecuperacionDrawer
        operativoId={mockOperativoBase.id}
        onCerrar={vi.fn()}
      />
    );

    const botonEditar = await screen.findByRole('button', { name: /editar planificación/i });
    expect(botonEditar).toBeDisabled();
  });

  it('debe inhabilitar el botón Editar Planificación cuando el operativo está CANCELADA', async () => {
    vi.mocked(obtenerDetalleOperativoRecuperacion).mockResolvedValueOnce({
      ...mockOperativoBase,
      estado: 'CANCELADA',
    });

    render(
      <OperativoRecuperacionDrawer
        operativoId={mockOperativoBase.id}
        onCerrar={vi.fn()}
      />
    );

    const botonEditar = await screen.findByRole('button', { name: /editar planificación/i });
    expect(botonEditar).toBeDisabled();
  });

  it('debe ocultar el botón Editar Planificación si el usuario no posee permiso recuperacion:editar', async () => {
    vi.mocked(usePuedeEditarRecuperacion).mockReturnValue(false);
    vi.mocked(obtenerDetalleOperativoRecuperacion).mockResolvedValueOnce(mockOperativoBase);

    render(
      <OperativoRecuperacionDrawer
        operativoId={mockOperativoBase.id}
        onCerrar={vi.fn()}
      />
    );

    await screen.findByText('Entrega de techumbre Collico');
    expect(screen.queryByRole('button', { name: /editar planificación/i })).not.toBeInTheDocument();
  });

  it('debe precargar datos, omitir recursos si no cambian y enviar solo descripción y patrullaId modificados', async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    vi.mocked(editarOperativoRecuperacion).mockResolvedValueOnce({
      message: 'Planificación actualizada.',
      data: {
        ...mockOperativoBase,
        mision: mockOperativoBase.mision!,
        patrulla: {
          id: '50000000-0000-4000-8000-000000000002',
          nombre: 'Patrulla Beta',
          estado: 'EN_RECUPERACION',
        },
        descripcion: 'Ampliación de entrega en Collico Alto',
        creadoPorId: 'u1',
      },
    });

    render(
      <ModalEditarOperativoRecuperacion
        isOpen={true}
        operativo={mockOperativoBase}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    const textarea = await screen.findByLabelText(/descripción de tareas/i);
    expect(textarea).toHaveValue('Entrega inicial de planchas de zinc');

    fireEvent.change(textarea, {
      target: { value: 'Ampliación de entrega en Collico Alto' },
    });

    const selectPatrulla = screen.getByLabelText(/patrulla verificadora asignada/i);
    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: /patrulla beta/i })
      ).toBeInTheDocument();
    });
    fireEvent.change(selectPatrulla, {
      target: { value: '50000000-0000-4000-8000-000000000002' },
    });

    fireEvent.click(screen.getByRole('button', { name: /guardar planificación/i }));

    await waitFor(() => {
      expect(editarOperativoRecuperacion).toHaveBeenCalledWith(
        mockOperativoBase.id,
        {
          descripcion: 'Ampliación de entrega en Collico Alto',
          patrullaId: '50000000-0000-4000-8000-000000000002',
        },
        undefined
      );
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('debe mantener el modal abierto y mostrar el mensaje de error si la API retorna 409 Conflict', async () => {
    const onClose = vi.fn();
    vi.mocked(editarOperativoRecuperacion).mockRejectedValueOnce(
      new RecuperacionServiceError('Stock insuficiente en bodega para Kit Techumbre.', {
        statusCode: 409,
        tipoConflicto: 'STOCK_INSUFICIENTE',
      })
    );

    render(
      <ModalEditarOperativoRecuperacion
        isOpen={true}
        operativo={mockOperativoBase}
        onClose={onClose}
        onSuccess={vi.fn()}
      />
    );

    const inputCantidad = await screen.findByLabelText(/cantidad fila 1/i);
    fireEvent.change(inputCantidad, { target: { value: '500' } });

    fireEvent.click(screen.getByRole('button', { name: /guardar planificación/i }));

    expect(
      await screen.findByText('Stock insuficiente en bodega para Kit Techumbre.')
    ).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
