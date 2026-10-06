import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RecursosFiltros from '../RecursosFiltros';

vi.mock('@/hooks/useCatalogos', () => ({
  useCatalogos: () => ({
    nombresDelegaciones: ['Norte', 'Sur', 'Costa', 'Calle Calle'],
    resolverNombre: (id: string) => (id.includes('1') ? 'Norte' : undefined),
    cargando: false,
  }),
}));

describe('RecursosFiltros', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe renderizar controles de búsqueda, delegación con nombres y tipo de inventario', () => {
    render(
      <RecursosFiltros
        busqueda=""
        onCambiarBusqueda={vi.fn()}
        onCambiarEstado={vi.fn()}
        onCambiarDelegacion={vi.fn()}
        onCambiarEsIndividual={vi.fn()}
        onLimpiarFiltros={vi.fn()}
      />
    );

    expect(screen.getByLabelText(/Buscar por nombre o descripción/i)).toBeDefined();
    expect(screen.getByLabelText(/Delegación Territorial/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Vehículo \/ Maquinaria/i })).toBeDefined();
  });

  it('debe emitir delegación por nombre humano al seleccionar una opción', () => {
    const handleCambiarDelegacion = vi.fn();

    render(
      <RecursosFiltros
        busqueda=""
        onCambiarBusqueda={vi.fn()}
        onCambiarEstado={vi.fn()}
        onCambiarDelegacion={handleCambiarDelegacion}
        onCambiarEsIndividual={vi.fn()}
        onLimpiarFiltros={vi.fn()}
      />
    );

    const select = screen.getByLabelText(/Delegación Territorial/i);
    fireEvent.change(select, { target: { value: 'Norte' } });

    expect(handleCambiarDelegacion).toHaveBeenCalledWith('Norte');
  });

  it('debe emitir tipo individual al presionar la botonera segmentada', () => {
    const handleCambiarEsIndividual = vi.fn();

    render(
      <RecursosFiltros
        busqueda=""
        onCambiarBusqueda={vi.fn()}
        onCambiarEstado={vi.fn()}
        onCambiarDelegacion={vi.fn()}
        onCambiarEsIndividual={handleCambiarEsIndividual}
        onLimpiarFiltros={vi.fn()}
      />
    );

    const btnIndividual = screen.getByRole('button', { name: /Vehículo \/ Maquinaria/i });
    fireEvent.click(btnIndividual);

    expect(handleCambiarEsIndividual).toHaveBeenCalledWith(true);
  });

  it('debe mostrar chips activos con nombres y permitir limpiar todos', () => {
    const handleLimpiar = vi.fn();

    render(
      <RecursosFiltros
        busqueda="Camioneta"
        delegacionNombre="Costa"
        estado="DISPONIBLE"
        esIndividual={true}
        onCambiarBusqueda={vi.fn()}
        onCambiarEstado={vi.fn()}
        onCambiarDelegacion={vi.fn()}
        onCambiarEsIndividual={vi.fn()}
        onLimpiarFiltros={handleLimpiar}
      />
    );

    expect(screen.getAllByText('Costa').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Disponible').length).toBeGreaterThanOrEqual(1);

    const btnLimpiar = screen.getByRole('button', { name: /Limpiar todos los filtros/i });
    fireEvent.click(btnLimpiar);

    expect(handleLimpiar).toHaveBeenCalled();
  });
});
