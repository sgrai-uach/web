import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CuadrillaDetalleDrawer from '../CuadrillaDetalleDrawer';
import type { CuadrillaItem } from '@/types/cuadrilla';

const cuadrillaBase: CuadrillaItem = {
  id: 'cuadrilla-1',
  nombre: 'Cuadrilla Vías y Despeje Urbano',
  estado: 'DISPONIBLE',
  delegacion: { id: 'del-1', nombre: 'Delegación Municipal Norte' },
  delegado: {
    id: 'u-1',
    nombre: 'Carlos Delegado',
    email: 'carlos@valdivia.cl',
    rut: '15.111.222-3',
  },
  recursos: [
    {
      id: 'rec-1',
      recursoId: 'r-1',
      nombre: 'Camioneta 4x4',
      cantidadAsignada: 1,
      esIndividual: true,
    },
    {
      id: 'rec-2',
      recursoId: 'r-2',
      nombre: 'Motosierra',
      cantidadAsignada: 2,
      esIndividual: false,
    },
  ],
  trabajadores: [
    {
      id: 'trab-1',
      personalId: 'p-1',
      usuarioId: 'u-2',
      nombre: 'Pedro Obrero',
      rut: '16.222.333-4',
      cargo: 'Motosierrista',
      especialidad: 'Poda de Altura',
      asignadoEn: '2026-10-24T12:00:00.000Z',
    },
  ],
  creadoEn: '2026-10-24T12:00:00.000Z',
};

describe('CuadrillaDetalleDrawer (H80)', () => {
  it('no debe renderizarse cuando está cerrado o sin cuadrilla', () => {
    const { container, rerender } = render(
      <CuadrillaDetalleDrawer cuadrilla={cuadrillaBase} isOpen={false} onCerrar={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();

    rerender(<CuadrillaDetalleDrawer cuadrilla={null} isOpen={true} onCerrar={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('debe mostrar delegado, trabajadores y recursos asignados', () => {
    render(
      <CuadrillaDetalleDrawer cuadrilla={cuadrillaBase} isOpen={true} onCerrar={vi.fn()} />
    );

    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getByText('Cuadrilla Vías y Despeje Urbano')).toBeDefined();
    expect(screen.getByText('Carlos Delegado')).toBeDefined();
    expect(screen.getByText('Trabajadores Asignados (1)')).toBeDefined();
    expect(screen.getByText('Pedro Obrero')).toBeDefined();
    expect(screen.getByText('Equipamiento y Vehículos (2)')).toBeDefined();
    expect(screen.getByText('Camioneta 4x4')).toBeDefined();
    expect(screen.getByText('Vehículo / Activo Individual')).toBeDefined();
    expect(screen.getByText('Insumo / Herramienta')).toBeDefined();
    expect(screen.getByText('2 unidades')).toBeDefined();
  });

  it('debe mostrar mensajes informativos cuando no hay dotación asignada', () => {
    render(
      <CuadrillaDetalleDrawer
        cuadrilla={{ ...cuadrillaBase, trabajadores: [], recursos: [] }}
        isOpen={true}
        onCerrar={vi.fn()}
      />
    );

    expect(
      screen.getByText('No hay trabajadores operativos asignados a esta cuadrilla.')
    ).toBeDefined();
    expect(
      screen.getByText('No hay recursos logísticos ni vehículos asignados a esta cuadrilla.')
    ).toBeDefined();
  });

  it('debe cerrarse con la tecla Escape y con el botón Cerrar', () => {
    const onCerrar = vi.fn();
    render(
      <CuadrillaDetalleDrawer cuadrilla={cuadrillaBase} isOpen={true} onCerrar={onCerrar} />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCerrar).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /cerrar panel de detalle/i }));
    expect(onCerrar).toHaveBeenCalledTimes(2);
  });

  it('debe bloquear la edición cuando la cuadrilla está en misión', () => {
    render(
      <CuadrillaDetalleDrawer
        cuadrilla={{ ...cuadrillaBase, estado: 'EN_MISION' }}
        isOpen={true}
        onCerrar={vi.fn()}
        onEditar={vi.fn()}
        puedeEditar={true}
      />
    );

    const botonEditar = screen.getByRole('button', { name: /editar cuadrilla/i });
    expect(botonEditar).toBeDisabled();
  });

  it('debe invocar onEditar para cuadrillas disponibles', () => {
    const onEditar = vi.fn();
    const onCerrar = vi.fn();
    render(
      <CuadrillaDetalleDrawer
        cuadrilla={cuadrillaBase}
        isOpen={true}
        onCerrar={onCerrar}
        onEditar={onEditar}
        puedeEditar={true}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /editar cuadrilla/i }));
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(onEditar).toHaveBeenCalledWith(cuadrillaBase);
  });
});
