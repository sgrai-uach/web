import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BuscadorRecursosSelect, type RecursoOpcionItem } from '../BuscadorRecursosSelect';

describe('BuscadorRecursosSelect', () => {
  const mockRecursos: RecursoOpcionItem[] = [
    {
      id: 'rec-camioneta',
      nombre: 'Camioneta Toyota Hilux 4x4 Patrulla Norte',
      cantidadDisponible: 1,
      cantidadInventario: 1,
      cantidadEnUso: 0,
      esIndividual: true,
      estado: 'DISPONIBLE',
    },
    {
      id: 'rec-motosierra',
      nombre: 'Motosierra Stihl MS 382 Profesional',
      cantidadDisponible: 4,
      cantidadInventario: 5,
      cantidadEnUso: 1,
      esIndividual: false,
      estado: 'DISPONIBLE',
    },
    {
      id: 'rec-sacos',
      nombre: 'Sacos de Arena de Contención Fluvial',
      cantidadDisponible: 190,
      cantidadInventario: 200,
      cantidadEnUso: 10,
      esIndividual: false,
      estado: 'DISPONIBLE',
    },
    {
      id: 'rec-camion-taller',
      nombre: 'Camión Aljibe Mercedes Benz',
      cantidadDisponible: 0,
      cantidadInventario: 1,
      cantidadEnUso: 0,
      esIndividual: true,
      estado: 'EN_MANTENCION',
    },
    {
      id: 'rec-sin-stock',
      nombre: 'Generador Eléctrico 5kVA',
      cantidadDisponible: 0,
      cantidadInventario: 2,
      cantidadEnUso: 2,
      esIndividual: false,
      estado: 'DISPONIBLE',
    },
  ];

  it('debe renderizar el input buscador con su placeholder y etiqueta accesible', () => {
    render(
      <BuscadorRecursosSelect
        recursos={mockRecursos}
        value=""
        onChange={vi.fn()}
        placeholder="Buscar insumos..."
        ariaLabel="Buscador de insumos"
      />
    );

    const input = screen.getByLabelText('Buscador de insumos');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Buscar insumos...');
  });

  it('debe desplegar la lista de opciones al enfocar o escribir en el input', () => {
    render(
      <BuscadorRecursosSelect
        recursos={mockRecursos}
        value=""
        onChange={vi.fn()}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText(/Camioneta Toyota Hilux 4x4 Patrulla Norte/i)).toBeInTheDocument();
    expect(screen.getByText(/Motosierra Stihl MS 382 Profesional/i)).toBeInTheDocument();
    expect(screen.getByText(/Sacos de Arena de Contención Fluvial/i)).toBeInTheDocument();
  });

  it('debe filtrar en tiempo real los recursos según el texto ingresado', () => {
    render(
      <BuscadorRecursosSelect
        recursos={mockRecursos}
        value=""
        onChange={vi.fn()}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'motosierra' } });

    expect(screen.getByText(/Motosierra Stihl MS 382 Profesional/i)).toBeInTheDocument();
    expect(screen.queryByText(/Camioneta Toyota Hilux/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Sacos de Arena/i)).not.toBeInTheDocument();
  });

  it('debe mostrar mensaje cuando no hay resultados que coincidan con la búsqueda', () => {
    render(
      <BuscadorRecursosSelect
        recursos={mockRecursos}
        value=""
        onChange={vi.fn()}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'helicoptero' } });

    expect(screen.getByText(/No se encontraron insumos que coincidan con "helicoptero"/i)).toBeInTheDocument();
  });

  it('debe llamar onChange con el ID del recurso al hacer clic en una opción disponible', () => {
    const handleChange = vi.fn();
    render(
      <BuscadorRecursosSelect
        recursos={mockRecursos}
        value=""
        onChange={handleChange}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);

    const opcionSacos = screen.getByText(/Sacos de Arena de Contención Fluvial/i);
    fireEvent.click(opcionSacos);

    expect(handleChange).toHaveBeenCalledWith('rec-sacos');
  });

  it('no debe permitir seleccionar recursos en mantención o sin stock', () => {
    const handleChange = vi.fn();
    render(
      <BuscadorRecursosSelect
        recursos={mockRecursos}
        value=""
        onChange={handleChange}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);

    const opcionTaller = screen.getByText(/Camión Aljibe Mercedes Benz/i);
    fireEvent.click(opcionTaller);
    expect(handleChange).not.toHaveBeenCalled();

    const opcionSinStock = screen.getByText(/Generador Eléctrico 5kVA/i);
    fireEvent.click(opcionSinStock);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('debe permitir limpiar la selección con el botón de borrar', () => {
    const handleChange = vi.fn();
    render(
      <BuscadorRecursosSelect
        recursos={mockRecursos}
        value="rec-sacos"
        onChange={handleChange}
      />
    );

    const clearButton = screen.getByLabelText(/Quitar selección de insumo/i);
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);
    expect(handleChange).toHaveBeenCalledWith('');
  });
});
