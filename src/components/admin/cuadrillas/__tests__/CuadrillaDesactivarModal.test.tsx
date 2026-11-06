import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CuadrillaDesactivarModal from '../CuadrillaDesactivarModal';
import type { CuadrillaItem } from '@/types/cuadrilla';

describe('CuadrillaDesactivarModal (HU-82)', () => {
  const mockCuadrillaDisponible: CuadrillaItem = {
    id: '50000000-0000-4000-8000-000000000001',
    nombre: 'Cuadrilla Vías y Despeje Urbano',
    estado: 'DISPONIBLE',
    delegacion: {
      id: '30000000-0000-4000-8000-000000000001',
      nombre: 'Delegación Municipal Norte',
    },
    delegado: {
      id: '00000000-0000-4000-8000-000000000005',
      nombre: 'Carlos Delegado',
      email: 'carlos@valdivia.cl',
      rut: '15.111.222-3',
    },
    recursos: [
      {
        id: 'cd1',
        recursoId: 'r1',
        nombre: 'Camioneta 4x4',
        cantidadAsignada: 1,
        esIndividual: true,
      },
    ],
    trabajadores: [
      {
        id: 'cp1',
        personalId: 'p1',
        usuarioId: 'u1',
        nombre: 'Pedro Obrero',
        cargo: 'Motosierrista',
        asignadoEn: '2026-10-24T12:00:00.000Z',
      },
    ],
    totalRecursos: 1,
    totalTrabajadores: 1,
    creadoEn: '2026-10-24T12:00:00.000Z',
  };

  const mockCuadrillaEnMision: CuadrillaItem = {
    ...mockCuadrillaDisponible,
    id: '50000000-0000-4000-8000-000000000002',
    nombre: 'Cuadrilla Mitigación Costera',
    estado: 'EN_MISION',
  };

  it('no debe renderizar nada si cuadrilla es null', () => {
    const { container } = render(
      <CuadrillaDesactivarModal
        cuadrilla={null}
        desactivando={false}
        onConfirmar={vi.fn()}
        onCancelar={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('debe renderizar el mensaje de advertencia y consecuencias para una cuadrilla disponible', () => {
    render(
      <CuadrillaDesactivarModal
        cuadrilla={mockCuadrillaDisponible}
        desactivando={false}
        onConfirmar={vi.fn()}
        onCancelar={vi.fn()}
      />
    );

    expect(screen.getByText(/Confirmar Desactivación de Cuadrilla/i)).toBeInTheDocument();
    expect(screen.getByText(/Cuadrilla Vías y Despeje Urbano/i)).toBeInTheDocument();
    expect(screen.getByText(/Consecuencias de la baja lógica:/i)).toBeInTheDocument();
    expect(screen.getByText(/1 recurso/i)).toBeInTheDocument();
    expect(screen.getByText(/1 trabajador/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sí, desactivar cuadrilla/i })).toBeInTheDocument();
  });

  it('debe bloquear la acción si la cuadrilla se encuentra EN_MISION', () => {
    render(
      <CuadrillaDesactivarModal
        cuadrilla={mockCuadrillaEnMision}
        desactivando={false}
        onConfirmar={vi.fn()}
        onCancelar={vi.fn()}
      />
    );

    expect(screen.getByText(/Acción Bloqueada: Cuadrilla con Misión en Curso/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Sí, desactivar cuadrilla/i })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
  });

  it('debe llamar a onConfirmar al presionar el botón de confirmación', () => {
    const onConfirmarMock = vi.fn();
    render(
      <CuadrillaDesactivarModal
        cuadrilla={mockCuadrillaDisponible}
        desactivando={false}
        onConfirmar={onConfirmarMock}
        onCancelar={vi.fn()}
      />
    );

    const botonConfirmar = screen.getByRole('button', { name: /Sí, desactivar cuadrilla/i });
    fireEvent.click(botonConfirmar);

    expect(onConfirmarMock).toHaveBeenCalledTimes(1);
  });

  it('debe llamar a onCancelar al presionar el botón Cancelar', () => {
    const onCancelarMock = vi.fn();
    render(
      <CuadrillaDesactivarModal
        cuadrilla={mockCuadrillaDisponible}
        desactivando={false}
        onConfirmar={vi.fn()}
        onCancelar={onCancelarMock}
      />
    );

    const botonCancelar = screen.getByRole('button', { name: /Cancelar/i });
    fireEvent.click(botonCancelar);

    expect(onCancelarMock).toHaveBeenCalledTimes(1);
  });

  it('debe deshabilitar botones y mostrar estado cargando cuando desactivando es true', () => {
    render(
      <CuadrillaDesactivarModal
        cuadrilla={mockCuadrillaDisponible}
        desactivando={true}
        onConfirmar={vi.fn()}
        onCancelar={vi.fn()}
      />
    );

    expect(screen.getByText(/Desactivando.../i)).toBeInTheDocument();
    const botonCancelar = screen.getByRole('button', { name: /Cancelar/i });
    expect(botonCancelar).toBeDisabled();
  });
});
