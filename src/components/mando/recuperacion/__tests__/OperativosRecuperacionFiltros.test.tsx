import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OperativosRecuperacionFiltros } from '../OperativosRecuperacionFiltros';
import { FILTROS_RECUPERACION_INICIALES } from '@/hooks/useOperativosRecuperacion';

const mockDelegaciones = [
  { id: '30000000-0000-4000-8000-000000000001', codigo: 'DEL_NORTE', nombre: 'Delegación Norte' },
];

describe('OperativosRecuperacionFiltros (HU-73)', () => {
  it('debe renderizar ActiveFilterChips para los filtros activos y permitir remover uno individualmente', () => {
    const onFiltrosChange = vi.fn();
    const onLimpiarFiltros = vi.fn();

    render(
      <OperativosRecuperacionFiltros
        filtros={{
          ...FILTROS_RECUPERACION_INICIALES,
          estado: 'EN_EJECUCION',
          delegacionId: '30000000-0000-4000-8000-000000000001',
        }}
        delegaciones={mockDelegaciones}
        onFiltrosChange={onFiltrosChange}
        onLimpiarFiltros={onLimpiarFiltros}
      />
    );

    expect(screen.getByTestId('active-filter-chips')).toBeInTheDocument();
    expect(screen.getByText(/Estado: En Ejecución/i)).toBeInTheDocument();
    expect(screen.getByText(/Delegación: Delegación Norte/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Quitar filtro de estado/i }));
    expect(onFiltrosChange).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Limpiar filtros/i }));
    expect(onLimpiarFiltros).toHaveBeenCalledTimes(1);
  });

  it('debe aplicar atributos min y max en los selectores de fecha', () => {
    render(
      <OperativosRecuperacionFiltros
        filtros={{
          ...FILTROS_RECUPERACION_INICIALES,
          fechaDesde: '2026-11-10',
          fechaHasta: '2026-11-24',
        }}
        delegaciones={mockDelegaciones}
        onFiltrosChange={vi.fn()}
        onLimpiarFiltros={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Desde')).toHaveAttribute('max', '2026-11-24');
    expect(screen.getByLabelText('Hasta')).toHaveAttribute('min', '2026-11-10');
  });
});
