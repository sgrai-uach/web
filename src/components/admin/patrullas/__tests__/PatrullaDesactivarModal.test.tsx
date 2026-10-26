import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PatrullaDesactivarModal from '../PatrullaDesactivarModal';
import { patrullasService } from '@/services/patrullasService';
import type { PatrullaVerificadoraDTO } from '@/types/patrullas';

vi.mock('@/services/patrullasService', () => ({
  DEFAULT_ENCARGADO_ID: '00000000-0000-4000-8000-000000000003',
  patrullasService: {
    desactivar: vi.fn(),
  },
}));

describe('PatrullaDesactivarModal (HU-85: Desactivar Patrulla Verificadora)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPatrullaDisponible: PatrullaVerificadoraDTO = {
    id: 'f1000000-0000-4000-8000-000000000001',
    codigo: 'PV-COSTA-01',
    nombre: 'Patrulla Rápida Costa 01',
    estado: 'DISPONIBLE',
    delegacion: {
      id: '30000000-0000-4000-8000-000000000003',
      nombre: 'Costa',
      codigo: 'DEL_COSTA',
    },
    vehiculo: {
      id: 'v1000000-0000-4000-8000-000000000001',
      nombre: 'Camioneta 4x4 Navara (CD-FG-23)',
      estado: 'EN_USO',
    },
    lider: {
      id: '00000000-0000-4000-8000-000000000003',
      nombre: 'Encargado de Operaciones',
      email: 'encargado@valdivia.cl',
    },
    integrantes: [
      {
        id: 'p1',
        nombre: 'Juan Brigadista',
      },
      {
        id: 'p2',
        nombre: 'Pedro Evaluador',
      },
    ],
    misionActiva: null,
  };

  const mockPatrullaEnVerificacion: PatrullaVerificadoraDTO = {
    ...mockPatrullaDisponible,
    estado: 'EN_VERIFICACION',
    misionActiva: {
      id: 'm1',
      codigo: 'MIS-2026-0001',
      titulo: 'Triaje preliminar',
      tipoMision: 'VERIFICACION',
      estado: 'EN_CURSO',
      prioridad: 'ALTA',
    },
  };

  it('no renderiza nada si isOpen es false o patrulla es null', () => {
    const { container: c1 } = render(
      <PatrullaDesactivarModal
        isOpen={false}
        patrulla={mockPatrullaDisponible}
        onClose={vi.fn()}
        onPatrullaDesactivada={vi.fn()}
      />
    );
    expect(c1.firstChild).toBeNull();

    const { container: c2 } = render(
      <PatrullaDesactivarModal
        isOpen={true}
        patrulla={null}
        onClose={vi.fn()}
        onPatrullaDesactivada={vi.fn()}
      />
    );
    expect(c2.firstChild).toBeNull();
  });

  it('renderiza la advertencia de baja lógica, los recursos a liberar y la nota de auditoría SENAPRED', () => {
    render(
      <PatrullaDesactivarModal
        isOpen={true}
        patrulla={mockPatrullaDisponible}
        onClose={vi.fn()}
        onPatrullaDesactivada={vi.fn()}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Desactivar Patrulla Verificadora')).toBeInTheDocument();
    expect(screen.getByText(/Baja Lógica de Unidad Operativa:/i)).toBeInTheDocument();

    // Datos de la patrulla
    expect(screen.getByText('Patrulla Rápida Costa 01')).toBeInTheDocument();
    expect(screen.getByText(/Camioneta 4x4 Navara/i)).toBeInTheDocument();
    expect(screen.getByText(/2 funcionarios quedarán liberados/i)).toBeInTheDocument();

    // Nota de auditoría SENAPRED
    expect(screen.getByText(/Auditoría Inmutable:/i)).toBeInTheDocument();
    expect(screen.getByText(/SENAPRED/i)).toBeInTheDocument();
  });

  it('bloquea y deshabilita el botón de confirmación si la patrulla se encuentra en verificación o misión activa', () => {
    render(
      <PatrullaDesactivarModal
        isOpen={true}
        patrulla={mockPatrullaEnVerificacion}
        onClose={vi.fn()}
        onPatrullaDesactivada={vi.fn()}
      />
    );

    expect(screen.getByTestId('bloqueo-operativo-alerta')).toBeInTheDocument();
    expect(screen.getByText(/Acción Bloqueada por Estado Operativo:/i)).toBeInTheDocument();

    const btnConfirmar = screen.getByTestId('btn-confirmar-desactivar-patrulla');
    expect(btnConfirmar).toBeDisabled();
  });

  it('ejecuta la desactivación exitosamente (200 OK) e invoca los callbacks correspondientes', async () => {
    const mockOnDesactivada = vi.fn();
    const mockOnClose = vi.fn();

    vi.mocked(patrullasService.desactivar).mockResolvedValueOnce({
      exito: true,
      mensaje: 'Patrulla verificadora desactivada exitosamente.',
      data: {
        id: mockPatrullaDisponible.id,
        codigo: 'PV-COSTA-01',
        nombre: mockPatrullaDisponible.nombre,
        estado: 'NO_DISPONIBLE',
        activo: false,
        eliminadoEn: '2026-10-26T12:00:00.000Z',
        eliminadoPorId: 'admin-1',
      },
    });

    render(
      <PatrullaDesactivarModal
        isOpen={true}
        patrulla={mockPatrullaDisponible}
        usuarioActivoId="admin-1"
        onClose={mockOnClose}
        onPatrullaDesactivada={mockOnDesactivada}
      />
    );

    const btnConfirmar = screen.getByTestId('btn-confirmar-desactivar-patrulla');
    expect(btnConfirmar).not.toBeDisabled();

    fireEvent.click(btnConfirmar);

    await waitFor(() => {
      expect(patrullasService.desactivar).toHaveBeenCalledWith(
        mockPatrullaDisponible.id,
        'admin-1'
      );
      expect(mockOnDesactivada).toHaveBeenCalledWith(mockPatrullaDisponible);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('despliega mensaje de advertencia si la API rechaza con 409 Conflict', async () => {
    const mensajeConflicto =
      'La patrulla tiene despachos en curso y no puede darse de baja.';

    vi.mocked(patrullasService.desactivar).mockResolvedValueOnce({
      exito: false,
      esConflicto: true,
      codigoError: 409,
      mensaje: mensajeConflicto,
    });

    render(
      <PatrullaDesactivarModal
        isOpen={true}
        patrulla={mockPatrullaDisponible}
        onClose={vi.fn()}
        onPatrullaDesactivada={vi.fn()}
      />
    );

    const btnConfirmar = screen.getByTestId('btn-confirmar-desactivar-patrulla');
    fireEvent.click(btnConfirmar);

    await waitFor(() => {
      expect(screen.getByText('Conflicto Operativo (HTTP 409)')).toBeInTheDocument();
      expect(screen.getByText(mensajeConflicto)).toBeInTheDocument();
    });
  });

  it('despliega mensaje de error si la API retorna 403 Forbidden', async () => {
    vi.mocked(patrullasService.desactivar).mockResolvedValueOnce({
      exito: false,
      esForbidden: true,
      codigoError: 403,
      mensaje: 'No cuenta con el permiso requerido (recursos:eliminar) para desactivar patrullas.',
    });

    render(
      <PatrullaDesactivarModal
        isOpen={true}
        patrulla={mockPatrullaDisponible}
        onClose={vi.fn()}
        onPatrullaDesactivada={vi.fn()}
      />
    );

    const btnConfirmar = screen.getByTestId('btn-confirmar-desactivar-patrulla');
    fireEvent.click(btnConfirmar);

    await waitFor(() => {
      expect(
        screen.getByText(/No cuenta con el permiso requerido \(recursos:eliminar\)/i)
      ).toBeInTheDocument();
    });
  });

  it('permite cancelar y cerrar el modal con el botón Cancelar', () => {
    const mockOnClose = vi.fn();
    render(
      <PatrullaDesactivarModal
        isOpen={true}
        patrulla={mockPatrullaDisponible}
        onClose={mockOnClose}
        onPatrullaDesactivada={vi.fn()}
      />
    );

    const btnCancelar = screen.getByTestId('btn-cancelar-desactivar-patrulla');
    fireEvent.click(btnCancelar);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
