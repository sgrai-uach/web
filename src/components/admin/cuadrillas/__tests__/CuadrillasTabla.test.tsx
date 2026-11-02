import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CuadrillasTabla from '../CuadrillasTabla';
import type { CuadrillaItem } from '@/types/cuadrilla';

describe('CuadrillasTabla (H81)', () => {
  const mockCuadrillas: CuadrillaItem[] = [
    {
      id: 'cuadrilla-1',
      nombre: 'Cuadrilla Vías y Despeje',
      estado: 'DISPONIBLE',
      delegacion: { id: 'del-1', nombre: 'Norte' },
      delegado: { id: 'u-1', nombre: 'Carlos Delegado', email: 'carlos@valdivia.cl', rut: '15.111.222-3' },
      recursos: [
        {
          id: 'rec-1',
          recursoId: 'r-1',
          nombre: 'Camioneta 4x4',
          cantidadAsignada: 1,
          esIndividual: true,
        },
      ],
      trabajadores: [
        {
          id: 'trab-1',
          personalId: 'p-1',
          usuarioId: 'u-2',
          nombre: 'Pedro Obrero',
          cargo: 'Motosierrista',
          especialidad: 'Poda',
          asignadoEn: '2026-10-24T12:00:00.000Z',
        },
      ],
      creadoEn: '2026-10-24T12:00:00.000Z',
    },
    {
      id: 'cuadrilla-2',
      nombre: 'Cuadrilla Costa en Terreno',
      estado: 'EN_MISION',
      delegacion: { id: 'del-2', nombre: 'Costa' },
      delegado: { id: 'u-3', nombre: 'Matías Oyarzún', email: 'matias@valdivia.cl', rut: '18.123.789-4' },
      recursos: [],
      trabajadores: [],
      creadoEn: '2026-10-25T08:00:00.000Z',
    },
  ];

  it('debe renderizar las cuadrillas con su nombre, delegado y badges de estado', () => {
    render(
      <CuadrillasTabla
        cuadrillas={mockCuadrillas}
        cargando={false}
        onEditarCuadrilla={vi.fn()}
        onVerDetalle={vi.fn()}
        puedeEditar={true}
      />
    );

    expect(screen.getByText('Cuadrilla Vías y Despeje')).toBeDefined();
    expect(screen.getByText('Carlos Delegado')).toBeDefined();
    expect(screen.getByText('DISPONIBLE')).toBeDefined();

    expect(screen.getByText('Cuadrilla Costa en Terreno')).toBeDefined();
    expect(screen.getByText('Matías Oyarzún')).toBeDefined();
    expect(screen.getByText('EN MISIÓN')).toBeDefined();
  });

  it('debe bloquear y deshabilitar el botón de editar ante cuadrillas en estado EN_MISION', () => {
    const onEditar = vi.fn();
    render(
      <CuadrillasTabla
        cuadrillas={mockCuadrillas}
        cargando={false}
        onEditarCuadrilla={onEditar}
        onVerDetalle={vi.fn()}
        puedeEditar={true}
      />
    );

    const botonesEditar = screen.getAllByRole('button', { name: /editar/i });
    expect(botonesEditar).toHaveLength(2);

    // Primer botón (DISPONIBLE): habilitado
    expect(botonesEditar[0]).not.toBeDisabled();
    fireEvent.click(botonesEditar[0]);
    expect(onEditar).toHaveBeenCalledWith(mockCuadrillas[0]);

    // Segundo botón (EN_MISION): deshabilitado
    expect(botonesEditar[1]).toBeDisabled();
    fireEvent.click(botonesEditar[1]);
    expect(onEditar).toHaveBeenCalledTimes(1); // No vuelve a ejecutarse
  });

  it('debe permitir invocar el visor de detalle al hacer clic en Detalle', () => {
    const onDetalle = vi.fn();
    render(
      <CuadrillasTabla
        cuadrillas={mockCuadrillas}
        cargando={false}
        onEditarCuadrilla={vi.fn()}
        onVerDetalle={onDetalle}
        puedeEditar={true}
      />
    );

    const botonesDetalle = screen.getAllByRole('button', { name: /detalle/i });
    fireEvent.click(botonesDetalle[0]);
    expect(onDetalle).toHaveBeenCalledWith(mockCuadrillas[0]);
  });
});
