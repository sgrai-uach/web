import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CuadrillasFiltros from '../CuadrillasFiltros';
import type { DelegacionResumen } from '@/types/cuadrilla';

describe('CuadrillasFiltros (H80)', () => {
  const delegacionesMock: DelegacionResumen[] = [
    { id: 'del-1', nombre: 'Delegación Norte' },
    { id: 'del-2', nombre: 'Delegación Calle Calle' },
  ];

  it('caso 1: debe renderizar campo de búsqueda, select de delegación y select de estado', () => {
    render(
      <CuadrillasFiltros
        busqueda=""
        delegaciones={delegacionesMock}
        onBusquedaChange={vi.fn()}
        onDelegacionChange={vi.fn()}
        onEstadoChange={vi.fn()}
        onLimpiar={vi.fn()}
      />
    );

    expect(screen.getByPlaceholderText('Buscar por cuadrilla o delegado...')).toBeDefined();
    expect(screen.getByLabelText('Filtrar por delegación municipal')).toBeDefined();
    expect(screen.getByLabelText('Filtrar por estado operativo')).toBeDefined();
    expect(screen.getByText('Todas las delegaciones')).toBeDefined();
    expect(screen.getByText('Delegación Norte')).toBeDefined();
    expect(screen.getByText('Delegación Calle Calle')).toBeDefined();
    expect(screen.getByText('Solo Activas')).toBeDefined();
    expect(screen.getByText('Inactivas (Dadas de baja)')).toBeDefined();
    expect(screen.getByText('Todas las cuadrillas')).toBeDefined();
  });

  it('caso 2: al escribir en búsqueda, llama onBusquedaChange con el valor correcto', () => {
    const onBusquedaChange = vi.fn();
    render(
      <CuadrillasFiltros
        busqueda=""
        delegaciones={delegacionesMock}
        onBusquedaChange={onBusquedaChange}
        onDelegacionChange={vi.fn()}
        onEstadoChange={vi.fn()}
        onLimpiar={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText('Buscar por cuadrilla o delegado...');
    fireEvent.change(input, { target: { value: 'Vías' } });

    expect(onBusquedaChange).toHaveBeenCalledWith('Vías');
  });

  it('caso 3: botón "Limpiar filtros" solo visible cuando hay filtros activos', () => {
    const { rerender } = render(
      <CuadrillasFiltros
        busqueda=""
        delegaciones={delegacionesMock}
        onBusquedaChange={vi.fn()}
        onDelegacionChange={vi.fn()}
        onEstadoChange={vi.fn()}
        onLimpiar={vi.fn()}
      />
    );

    expect(screen.queryByText('Limpiar filtros')).toBeNull();

    // Con búsqueda activa
    rerender(
      <CuadrillasFiltros
        busqueda="Despeje"
        delegaciones={delegacionesMock}
        onBusquedaChange={vi.fn()}
        onDelegacionChange={vi.fn()}
        onEstadoChange={vi.fn()}
        onLimpiar={vi.fn()}
      />
    );
    expect(screen.getByText('Limpiar filtros')).toBeDefined();

    // Con delegación seleccionada
    rerender(
      <CuadrillasFiltros
        busqueda=""
        delegacionId="del-1"
        delegaciones={delegacionesMock}
        onBusquedaChange={vi.fn()}
        onDelegacionChange={vi.fn()}
        onEstadoChange={vi.fn()}
        onLimpiar={vi.fn()}
      />
    );
    expect(screen.getByText('Limpiar filtros')).toBeDefined();

    // Con estado seleccionado
    rerender(
      <CuadrillasFiltros
        busqueda=""
        estado="DISPONIBLE"
        delegaciones={delegacionesMock}
        onBusquedaChange={vi.fn()}
        onDelegacionChange={vi.fn()}
        onEstadoChange={vi.fn()}
        onLimpiar={vi.fn()}
      />
    );
    expect(screen.getByText('Limpiar filtros')).toBeDefined();
  });

  it('caso 4: clic en "Limpiar filtros" invoca onLimpiar', () => {
    const onLimpiar = vi.fn();
    render(
      <CuadrillasFiltros
        busqueda="Texto activo"
        delegaciones={delegacionesMock}
        onBusquedaChange={vi.fn()}
        onDelegacionChange={vi.fn()}
        onEstadoChange={vi.fn()}
        onLimpiar={onLimpiar}
      />
    );

    const botonLimpiar = screen.getByText('Limpiar filtros');
    fireEvent.click(botonLimpiar);

    expect(onLimpiar).toHaveBeenCalledTimes(1);
  });

  it('caso 5: cambiar delegación invoca onDelegacionChange con el id seleccionado o undefined', () => {
    const onDelegacionChange = vi.fn();
    const { rerender } = render(
      <CuadrillasFiltros
        busqueda=""
        delegaciones={delegacionesMock}
        onBusquedaChange={vi.fn()}
        onDelegacionChange={onDelegacionChange}
        onEstadoChange={vi.fn()}
        onLimpiar={vi.fn()}
      />
    );

    const selectDelegacion = screen.getByLabelText('Filtrar por delegación municipal');
    fireEvent.change(selectDelegacion, { target: { value: 'del-2' } });

    expect(onDelegacionChange).toHaveBeenCalledWith('del-2');

    // Cambiar a "Todas las delegaciones" (value = "")
    rerender(
      <CuadrillasFiltros
        busqueda=""
        delegacionId="del-2"
        delegaciones={delegacionesMock}
        onBusquedaChange={vi.fn()}
        onDelegacionChange={onDelegacionChange}
        onEstadoChange={vi.fn()}
        onLimpiar={vi.fn()}
      />
    );
    fireEvent.change(selectDelegacion, { target: { value: '' } });
    expect(onDelegacionChange).toHaveBeenCalledWith(undefined);
  });
});

