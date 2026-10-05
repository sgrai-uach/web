import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PuntosCriticosEmptyState from '../PuntosCriticosEmptyState';

describe('PuntosCriticosEmptyState', () => {
  it('debe mostrar mensaje general de catastro vacío cuando no hay filtros activos', () => {
    render(
      <PuntosCriticosEmptyState
        esFiltroActivo={false}
      />
    );

    expect(screen.getByText('No hay puntos críticos registrados')).toBeInTheDocument();
    expect(
      screen.getByText(/Actualmente no existen puntos críticos o sectores vulnerables registrados/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Limpiar Filtros/i })).toBeNull();
  });

  it('debe mostrar mensaje de búsqueda sin resultados y botón para limpiar filtros cuando esFiltroActivo es true', () => {
    const handleLimpiar = vi.fn();
    render(
      <PuntosCriticosEmptyState
        esFiltroActivo={true}
        onLimpiarFiltros={handleLimpiar}
      />
    );

    expect(
      screen.getByText(/No se encontraron puntos críticos que coincidan con los criterios de búsqueda/i)
    ).toBeInTheDocument();

    const boton = screen.getByRole('button', { name: /Limpiar Filtros/i });
    expect(boton).toBeInTheDocument();

    fireEvent.click(boton);
    expect(handleLimpiar).toHaveBeenCalledTimes(1);
  });
});
