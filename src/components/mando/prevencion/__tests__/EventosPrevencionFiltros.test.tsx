import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventosPrevencionFiltros } from '../EventosPrevencionFiltros';
import type { CatalogoItem } from '@/types/catalogos';

describe('EventosPrevencionFiltros (HU-76)', () => {
  const mockDelegaciones: CatalogoItem[] = [
    { id: 'del-1', codigo: 'NORTE', nombre: 'Norte' },
    { id: 'del-2', codigo: 'SUR', nombre: 'Sur' },
  ];

  it('debe renderizar inputs de búsqueda, selector de delegación y selector de estados', () => {
    render(
      <EventosPrevencionFiltros
        busqueda=""
        delegaciones={mockDelegaciones}
        onBusquedaChange={vi.fn()}
        onDelegacionChange={vi.fn()}
        onEstadoChange={vi.fn()}
        onLimpiar={vi.fn()}
      />
    );

    expect(screen.getByPlaceholderText(/Buscar por código, sector o punto crítico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Filtrar por delegación municipal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Filtrar por estado del evento preventivo/i)).toBeInTheDocument();
  });

  it('debe disparar onBusquedaChange al escribir en el input', () => {
    const onBusquedaChange = vi.fn();
    render(
      <EventosPrevencionFiltros
        busqueda="collico"
        delegaciones={mockDelegaciones}
        onBusquedaChange={onBusquedaChange}
        onDelegacionChange={vi.fn()}
        onEstadoChange={vi.fn()}
        onLimpiar={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText(/Buscar por código, sector o punto crítico/i);
    fireEvent.change(input, { target: { value: 'angachilla' } });

    expect(onBusquedaChange).toHaveBeenCalledWith('angachilla');
  });

  it('debe disparar onDelegacionChange al seleccionar una delegación', () => {
    const onDelegacionChange = vi.fn();
    render(
      <EventosPrevencionFiltros
        busqueda=""
        delegaciones={mockDelegaciones}
        onBusquedaChange={vi.fn()}
        onDelegacionChange={onDelegacionChange}
        onEstadoChange={vi.fn()}
        onLimpiar={vi.fn()}
      />
    );

    const select = screen.getByLabelText(/Filtrar por delegación municipal/i);
    fireEvent.change(select, { target: { value: 'del-2' } });

    expect(onDelegacionChange).toHaveBeenCalledWith('del-2');
  });

  it('debe disparar onEstadoChange con EN_CURSO al seleccionar En Ejecución', () => {
    const onEstadoChange = vi.fn();
    render(
      <EventosPrevencionFiltros
        busqueda=""
        delegaciones={mockDelegaciones}
        onBusquedaChange={vi.fn()}
        onDelegacionChange={vi.fn()}
        onEstadoChange={onEstadoChange}
        onLimpiar={vi.fn()}
      />
    );

    const select = screen.getByLabelText(/Filtrar por estado del evento preventivo/i);
    fireEvent.change(select, { target: { value: 'EN_CURSO' } });

    expect(onEstadoChange).toHaveBeenCalledWith('EN_CURSO');
  });

  it('debe mostrar botón y chips de filtros activos cuando hay filtros aplicados', () => {
    const onLimpiar = vi.fn();
    render(
      <EventosPrevencionFiltros
        busqueda="sumidero"
        delegacionId="del-1"
        estado="EN_CURSO"
        delegaciones={mockDelegaciones}
        onBusquedaChange={vi.fn()}
        onDelegacionChange={vi.fn()}
        onEstadoChange={vi.fn()}
        onLimpiar={onLimpiar}
        totalResultados={5}
      />
    );

    expect(screen.getByText(/Filtros activos:/i)).toBeInTheDocument();
    expect(screen.getByText(/Delegación: Norte/i)).toBeInTheDocument();
    expect(screen.getByText(/Estado: En Ejecución/i)).toBeInTheDocument();
    expect(screen.getByText(/5 resultados encontrados/i)).toBeInTheDocument();

    const btnLimpiar = screen.getByRole('button', { name: /Limpiar filtros/i });
    fireEvent.click(btnLimpiar);

    expect(onLimpiar).toHaveBeenCalled();
  });
});
