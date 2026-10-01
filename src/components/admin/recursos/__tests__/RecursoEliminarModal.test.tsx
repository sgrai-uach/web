import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RecursoEliminarModal from '../RecursoEliminarModal';
import * as recursosService from '@/services/recursosService';
import type { RecursoItem } from '@/types/recurso';

const mockRecurso: RecursoItem = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  nombre: 'Retroexcavadora CAT 420F',
  tipo: 'Vehículo o Maquinaria',
  esIndividual: true,
  estado: 'DISPONIBLE',
  cantidadInventario: 1,
  cantidadDisponible: 1,
  cantidadEnUso: 0,
  cantidadMinima: 0,
  latitud: -39.8142,
  longitud: -73.2459,
  descripcion: 'Maquinaria pesada para remoción de escombros',
  detalles: {
    patente: 'ABCD12',
    marca: 'Caterpillar',
  },
  delegacion: {
    id: '30000000-0000-4000-8000-000000000001',
    codigo: 'DEL_NORTE',
    nombre: 'Delegación Municipal Norte',
  },
  creadoPorId: '00000000-0000-4000-8000-000000000001',
  creadoEn: '2026-09-01T10:00:00Z',
  actualizadoEn: '2026-09-01T10:00:00Z',
};

describe('RecursoEliminarModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('no debe renderizar nada si isOpen es false', () => {
    const { container } = render(
      <RecursoEliminarModal
        isOpen={false}
        recurso={mockRecurso}
        usuarioActivoId="admin-uuid"
        onCerrar={vi.fn()}
        onEliminacionExitosa={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('no debe renderizar nada si recurso es null', () => {
    const { container } = render(
      <RecursoEliminarModal
        isOpen={true}
        recurso={null}
        usuarioActivoId="admin-uuid"
        onCerrar={vi.fn()}
        onEliminacionExitosa={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('debe renderizar la información del recurso y la advertencia de auditoría SENAPRED', () => {
    render(
      <RecursoEliminarModal
        isOpen={true}
        recurso={mockRecurso}
        usuarioActivoId="admin-uuid"
        onCerrar={vi.fn()}
        onEliminacionExitosa={vi.fn()}
      />
    );

    expect(screen.getByText('Confirmar Baja de Recurso')).toBeDefined();
    expect(screen.getByText('Retroexcavadora CAT 420F')).toBeDefined();
    expect(screen.getByText(/Delegación Municipal Norte/)).toBeDefined();
    expect(screen.getByText(/El recurso se retirará del inventario activo/)).toBeDefined();
    expect(screen.getByText(/auditoría SENAPRED/)).toBeDefined();
  });

  it('debe invocar onCerrar al hacer clic en el botón Cancelar', () => {
    const mockOnCerrar = vi.fn();
    render(
      <RecursoEliminarModal
        isOpen={true}
        recurso={mockRecurso}
        usuarioActivoId="admin-uuid"
        onCerrar={mockOnCerrar}
        onEliminacionExitosa={vi.fn()}
      />
    );

    const botonCancelar = screen.getByRole('button', { name: 'Cancelar' });
    fireEvent.click(botonCancelar);
    expect(mockOnCerrar).toHaveBeenCalledTimes(1);
  });

  it('debe procesar la baja exitosa y llamar a onEliminacionExitosa', async () => {
    const mockOnEliminacionExitosa = vi.fn();
    const mockOnCerrar = vi.fn();
    vi.spyOn(recursosService, 'eliminarRecurso').mockResolvedValueOnce({
      message: 'Recurso eliminado exitosamente.',
      id: mockRecurso.id,
      nombre: mockRecurso.nombre,
      eliminadoEn: '2026-09-30T20:00:00Z',
      eliminadoPorId: 'admin-uuid',
    });

    render(
      <RecursoEliminarModal
        isOpen={true}
        recurso={mockRecurso}
        usuarioActivoId="admin-uuid"
        onCerrar={mockOnCerrar}
        onEliminacionExitosa={mockOnEliminacionExitosa}
      />
    );

    const botonConfirmar = screen.getByRole('button', { name: /Sí, Dar de Baja Recurso/i });
    fireEvent.click(botonConfirmar);

    await waitFor(() => {
      expect(mockOnEliminacionExitosa).toHaveBeenCalledWith(mockRecurso);
      expect(mockOnCerrar).toHaveBeenCalledTimes(1);
    });
  });

  it('debe mantener el modal abierto y desplegar advertencia ante error 409 Conflict', async () => {
    const mockOnEliminacionExitosa = vi.fn();
    const mockOnCerrar = vi.fn();

    const error409 = new recursosService.RecursoServiceError({
      message: 'El recurso "Retroexcavadora CAT 420F" está actualmente asignado a una misión activa en terreno.',
      statusCode: 409,
    });
    vi.spyOn(recursosService, 'eliminarRecurso').mockRejectedValueOnce(error409);

    render(
      <RecursoEliminarModal
        isOpen={true}
        recurso={mockRecurso}
        usuarioActivoId="admin-uuid"
        onCerrar={mockOnCerrar}
        onEliminacionExitosa={mockOnEliminacionExitosa}
      />
    );

    const botonConfirmar = screen.getByRole('button', { name: /Sí, Dar de Baja Recurso/i });
    fireEvent.click(botonConfirmar);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined();
      expect(screen.getByText(/Bloqueo Operativo \(Recurso en uso\):/)).toBeDefined();
      expect(screen.getByText(/misión activa en terreno/)).toBeDefined();
    });

    // No debe haber cerrado el modal
    expect(mockOnCerrar).not.toHaveBeenCalled();
    expect(mockOnEliminacionExitosa).not.toHaveBeenCalled();

    // Debe mostrar botón "Entendido / Cerrar"
    expect(screen.getByRole('button', { name: 'Entendido / Cerrar' })).toBeDefined();
  });
});
