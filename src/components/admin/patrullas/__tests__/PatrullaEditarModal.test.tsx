import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PatrullaEditarModal from '../PatrullaEditarModal';
import { patrullasService } from '@/services/patrullasService';
import type { PatrullaVerificadoraDTO } from '@/types/patrullas';

vi.mock('@/context/SimulatedSessionContext', () => ({
  useSimulatedSession: () => ({
    usuarioActivo: {
      id: '00000000-0000-4000-8000-000000000001',
      nombre: 'Administrador General',
      rol: 'Administrador',
    },
    hasPermission: () => true,
    isMounted: true,
  }),
}));

vi.mock('@/services/catalogosService', () => ({
  catalogosService: {
    getCatalogos: vi.fn().mockResolvedValue({
      roles: [],
      delegaciones: [
        { id: '30000000-0000-4000-8000-000000000001', nombre: 'Norte', codigo: 'DEL_NORTE' },
        { id: '30000000-0000-4000-8000-000000000003', nombre: 'Costa', codigo: 'DEL_COSTA' },
      ],
      especialidades: [],
      cargos: [],
    }),
  },
}));

vi.mock('@/services/recursosService', () => ({
  getRecursos: vi.fn().mockResolvedValue({
    data: [
      {
        id: 'e1000000-0000-4000-8000-000000000002',
        nombre: 'Camioneta 4x4 Navara',
        esIndividual: true,
        estado: 'DISPONIBLE',
        detalles: { patente: 'CD-FG-23' },
      },
    ],
    meta: { total: 1, page: 1, limit: 100, totalPages: 1 },
  }),
}));

vi.mock('@/services/empleadosService', () => ({
  empleadosService: {
    getEmpleadosPaginado: vi.fn().mockResolvedValue({
      data: [
        {
          usuario_id: 'c1000000-0000-4000-8000-000000000001',
          personal_id: 'b1000000-0000-4000-8000-000000000001',
          nombres: 'Carlos',
          apellidos: 'Muñoz',
          rut: '12.345.678-9',
          rol_codigo: 'PATRULLA_VERIFICADORA',
          usuario_activo: true,
        },
      ],
      meta: { total: 1, page: 1, limit: 100, totalPages: 1 },
    }),
  },
}));

vi.mock('@/services/patrullasService', () => ({
  DEFAULT_ENCARGADO_ID: '00000000-0000-4000-8000-000000000003',
  patrullasService: {
    editar: vi.fn(),
  },
}));

describe('PatrullaEditarModal (HU-84: Modal de Edición)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPatrulla: PatrullaVerificadoraDTO = {
    id: 'f1000000-0000-4000-8000-000000000001',
    codigo: 'PV-COSTA-01',
    nombre: 'Patrulla Costa 01',
    estado: 'DISPONIBLE',
    delegacion: {
      id: '30000000-0000-4000-8000-000000000003',
      nombre: 'Costa',
      codigo: 'DEL_COSTA',
    },
    vehiculo: {
      id: 'e1000000-0000-4000-8000-000000000005',
      nombre: 'Camioneta Toyota Hilux',
      estado: 'ASIGNADO',
      detalles: { patente: 'AB-CD-12' },
    },
    lider: {
      id: 'c1000000-0000-4000-8000-000000000001',
      nombre: 'Carlos Muñoz',
      email: 'carlos@valdivia.cl',
    },
    integrantes: [
      {
        id: 'b1000000-0000-4000-8000-000000000001',
        usuarioId: 'c1000000-0000-4000-8000-000000000001',
        nombre: 'Carlos Muñoz',
        cargo: 'Evaluador',
        rolEnPatrulla: 'LIDER',
      },
    ],
    misionActiva: null,
  };

  it('1. no se renderiza si isOpen es false o patrulla es null', () => {
    const { container } = render(
      <PatrullaEditarModal isOpen={false} patrulla={null} onClose={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('2. precarga los datos actuales de la patrulla y muestra el código táctico de solo lectura', async () => {
    render(
      <PatrullaEditarModal isOpen={true} patrulla={mockPatrulla} onClose={vi.fn()} />
    );

    expect(
      screen.getByRole('heading', { name: /Editar Patrulla Verificadora: PV-COSTA-01/i })
    ).toBeInTheDocument();

    const inputCodigo = screen.getByDisplayValue('PV-COSTA-01');
    expect(inputCodigo).toBeDisabled();

    const inputNombre = screen.getByDisplayValue('Patrulla Costa 01');
    expect(inputNombre).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: /Camioneta Toyota Hilux/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('combobox', { name: /Vehículo de Evaluación/i })
      ).toHaveValue('e1000000-0000-4000-8000-000000000005');
    });
  });

  it('3. muestra aviso de bloqueo y deshabilita el botón de guardado si la patrulla está EN_VERIFICACION', async () => {
    const patrullaEnVerificacion: PatrullaVerificadoraDTO = {
      ...mockPatrulla,
      estado: 'EN_VERIFICACION',
      misionActiva: {
        id: 'mis-1',
        codigo: 'MIS-001',
        titulo: 'Verificar daño',
        tipoMision: 'VERIFICACION',
        estado: 'EN_CURSO',
        prioridad: 'ALTA',
      },
    };

    render(
      <PatrullaEditarModal isOpen={true} patrulla={patrullaEnVerificacion} onClose={vi.fn()} />
    );

    expect(screen.getByTestId('bloqueo-aviso-edicion')).toHaveTextContent(
      /No es posible editar la patrulla mientras se encuentre en verificación o en misión activa/i
    );

    const btnGuardar = screen.getByTestId('btn-guardar-cambios-patrulla');
    expect(btnGuardar).toBeDisabled();
  });

  it('4. permite abrir el modal de confirmación y guardar cambios exitosamente (200 OK)', async () => {
    const onPatrullaActualizada = vi.fn();
    vi.mocked(patrullasService.editar).mockResolvedValueOnce({
      exito: true,
      mensaje: 'Patrulla modificada exitosamente.',
      data: { ...mockPatrulla, nombre: 'Patrulla Costa Actualizada' },
    });

    render(
      <PatrullaEditarModal
        isOpen={true}
        patrulla={mockPatrulla}
        onClose={vi.fn()}
        onPatrullaActualizada={onPatrullaActualizada}
      />
    );

    const inputNombre = screen.getByDisplayValue('Patrulla Costa 01');
    fireEvent.change(inputNombre, { target: { value: 'Patrulla Costa Actualizada' } });

    const btnGuardar = screen.getByTestId('btn-guardar-cambios-patrulla');
    fireEvent.click(btnGuardar);

    // Debe desplegar el modal de confirmación
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Confirmar Modificación de Patrulla/i })
      ).toBeInTheDocument();
    });

    const btnConfirmar = screen.getByTestId('btn-confirmar-guardar-edicion');
    fireEvent.click(btnConfirmar);

    await waitFor(() => {
      expect(patrullasService.editar).toHaveBeenCalledWith(
        mockPatrulla.id,
        expect.objectContaining({
          nombre: 'Patrulla Costa Actualizada',
          delegacionId: '30000000-0000-4000-8000-000000000003',
        }),
        expect.any(String)
      );
      expect(onPatrullaActualizada).toHaveBeenCalledTimes(1);
    });
  });

  it('5. despliega mensaje de conflicto cuando el backend responde 409 Conflict', async () => {
    vi.mocked(patrullasService.editar).mockResolvedValueOnce({
      exito: false,
      esConflicto: true,
      codigoError: 409,
      mensaje: 'La patrulla se encuentra en verificación o el vehículo ya está asignado.',
    });

    render(
      <PatrullaEditarModal isOpen={true} patrulla={mockPatrulla} onClose={vi.fn()} />
    );

    const btnGuardar = screen.getByTestId('btn-guardar-cambios-patrulla');
    fireEvent.click(btnGuardar);

    await waitFor(() => {
      expect(screen.getByTestId('btn-confirmar-guardar-edicion')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('btn-confirmar-guardar-edicion'));

    await waitFor(() => {
      expect(
        screen.getByText(/Bloqueo Operativo: Conflicto al Modificar/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/La patrulla se encuentra en verificación o el vehículo ya está asignado/i)
      ).toBeInTheDocument();
    });
  });
});
