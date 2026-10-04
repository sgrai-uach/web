import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PuntoCriticoEliminarModal from '../PuntoCriticoEliminarModal';
import type { PuntoCriticoItem } from '@/types/puntoCritico';

const mockPunto: PuntoCriticoItem = {
  id: '40000000-0000-4000-8000-000000000001',
  codigo: 'PC-ANG-01',
  nombre: 'Sector Humedal Angachilla - Pasaje Los Robles',
  descripcion: 'Zona baja con riesgo recurrente de anegamiento',
  tipoRiesgo: 'Inundación y anegamiento',
  prioridad: 'ALTA',
  activo: true,
  estadoTexto: 'Activo',
  latitud: -39.8456,
  longitud: -73.2389,
  delegacion: {
    id: '30000000-0000-4000-8000-000000000002',
    codigo: 'DEL_SUR',
    nombre: 'Delegación Municipal Sur',
  },
  creadoEn: '2026-06-15T12:00:00.000Z',
};

describe('PuntoCriticoEliminarModal (HU-56)', () => {
  it('no debe renderizar nada si isOpen es false o punto es null', () => {
    const { container: c1 } = render(
      <PuntoCriticoEliminarModal
        punto={mockPunto}
        isOpen={false}
        isSubmitting={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(c1.firstChild).toBeNull();

    const { container: c2 } = render(
      <PuntoCriticoEliminarModal
        punto={null}
        isOpen={true}
        isSubmitting={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(c2.firstChild).toBeNull();
  });

  it('debe renderizar advertencia institucional, datos del punto y botones de acción', () => {
    render(
      <PuntoCriticoEliminarModal
        punto={mockPunto}
        isOpen={true}
        isSubmitting={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: 'Eliminar Punto Crítico' })).toBeDefined();
    expect(screen.getByText(/¿Está seguro de eliminar este punto crítico\?/i)).toBeDefined();
    expect(screen.getByText('PC-ANG-01')).toBeDefined();
    expect(screen.getByText('Sector Humedal Angachilla - Pasaje Los Robles')).toBeDefined();
    expect(screen.getByText('Inundación y anegamiento')).toBeDefined();
    expect(screen.getByText('Delegación Municipal Sur')).toBeDefined();

    expect(screen.getByRole('button', { name: /cancelar/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /eliminar punto crítico/i })).toBeDefined();
  });

  it('debe llamar a onClose al hacer clic en Cancelar', () => {
    const handleClose = vi.fn();
    render(
      <PuntoCriticoEliminarModal
        punto={mockPunto}
        isOpen={true}
        isSubmitting={false}
        onClose={handleClose}
        onConfirm={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('debe llamar a onConfirm al hacer clic en Eliminar Punto Crítico', () => {
    const handleConfirm = vi.fn();
    render(
      <PuntoCriticoEliminarModal
        punto={mockPunto}
        isOpen={true}
        isSubmitting={false}
        onClose={vi.fn()}
        onConfirm={handleConfirm}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /eliminar punto crítico/i }));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('debe mostrar estado de carga y deshabilitar botones mientras se procesa', () => {
    render(
      <PuntoCriticoEliminarModal
        punto={mockPunto}
        isOpen={true}
        isSubmitting={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('Eliminando...')).toBeDefined();
    const btnCancel = screen.getByRole('button', { name: /cancelar/i });
    expect(btnCancel.hasAttribute('disabled')).toBe(true);
  });

  it('debe mostrar alerta de error 409 cuando se informa bloqueo por misiones activas', () => {
    const mensajeBloqueo =
      "No es posible eliminar el punto crítico 'Sector Humedal Angachilla' porque cuenta con 1 misión(es) preventivas activas o patrullas asignadas en terreno (Misiones asociadas: MIS-2026-004).";

    render(
      <PuntoCriticoEliminarModal
        punto={mockPunto}
        isOpen={true}
        isSubmitting={false}
        errorBloqueo={mensajeBloqueo}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    const alerta = screen.getByRole('alert');
    expect(alerta).toBeDefined();
    expect(screen.getByText(/Acción Bloqueada:/i)).toBeDefined();
    expect(screen.getByText(mensajeBloqueo)).toBeDefined();
  });
});
