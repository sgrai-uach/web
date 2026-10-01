import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AvisosFiltros from '../AvisosFiltros';
import AvisosTableEmpty from '../table/AvisosTableEmpty';

describe('AvisosFiltros Component', () => {
  const defaultProps = {
    busqueda: '',
    onBusquedaChange: vi.fn(),
    filtroOrigen: 'TODOS' as const,
    onFiltroOrigenChange: vi.fn(),
    filtroSemaforo: 'TODOS' as const,
    onFiltroSemaforoChange: vi.fn(),
    filtroDelegacion: 'TODAS' as const,
    onFiltroDelegacionChange: vi.fn(),
    filtroEstado: 'PENDIENTE' as const,
    onFiltroEstadoChange: vi.fn(),
    hayFiltrosActivos: false,
    onLimpiarFiltros: vi.fn(),
    onRefrescar: vi.fn(),
    cargando: false,
  };

  it('debe renderizar el selector de Delegación con las opciones requeridas (Norte, Sur, Costa, Calle Calle)', () => {
    render(<AvisosFiltros {...defaultProps} />);

    const selectDelegacion = screen.getByLabelText(/Delegación:/i);
    expect(selectDelegacion).toBeInTheDocument();

    const options = Array.from((selectDelegacion as HTMLSelectElement).options).map(
      (opt) => opt.value
    );
    expect(options).toContain('TODAS');
    expect(options).toContain('Norte');
    expect(options).toContain('Sur');
    expect(options).toContain('Costa');
    expect(options).toContain('Calle Calle');
  });

  it('debe renderizar el selector de Estado con las opciones requeridas (Pendiente, Verificado, Rechazado)', () => {
    render(<AvisosFiltros {...defaultProps} />);

    const selectEstado = screen.getByLabelText(/Estado:/i);
    expect(selectEstado).toBeInTheDocument();

    const options = Array.from((selectEstado as HTMLSelectElement).options).map(
      (opt) => opt.value
    );
    expect(options).toContain('TODOS');
    expect(options).toContain('PENDIENTE');
    expect(options).toContain('VERIFICADO');
    expect(options).toContain('RECHAZADO');
  });

  it('debe invocar onFiltroDelegacionChange cuando el usuario selecciona una delegación', () => {
    const onFiltroDelegacionChange = vi.fn();
    render(
      <AvisosFiltros
        {...defaultProps}
        onFiltroDelegacionChange={onFiltroDelegacionChange}
      />
    );

    const select = screen.getByLabelText(/Delegación:/i);
    fireEvent.change(select, { target: { value: 'Norte' } });

    expect(onFiltroDelegacionChange).toHaveBeenCalledWith('Norte');
  });

  it('debe invocar onFiltroEstadoChange cuando el usuario selecciona un estado', () => {
    const onFiltroEstadoChange = vi.fn();
    render(
      <AvisosFiltros
        {...defaultProps}
        onFiltroEstadoChange={onFiltroEstadoChange}
      />
    );

    const select = screen.getByLabelText(/Estado:/i);
    fireEvent.change(select, { target: { value: 'VERIFICADO' } });

    expect(onFiltroEstadoChange).toHaveBeenCalledWith('VERIFICADO');
  });

  it('debe mostrar la barra visual de filtros activos cuando hay filtros aplicados', () => {
    render(
      <AvisosFiltros
        {...defaultProps}
        hayFiltrosActivos={true}
        filtroDelegacion="Costa"
        filtroEstado="VERIFICADO"
      />
    );

    expect(screen.getByTestId('indicador-filtros-activos')).toBeInTheDocument();
    expect(screen.getByText(/Delegación: Costa/i)).toBeInTheDocument();
    expect(screen.getByText(/Estado: Verificado/i)).toBeInTheDocument();
  });

  it('debe permitir limpiar todos los filtros mediante el botón "Limpiar filtros"', () => {
    const onLimpiarFiltros = vi.fn();
    render(
      <AvisosFiltros
        {...defaultProps}
        hayFiltrosActivos={true}
        filtroDelegacion="Sur"
        onLimpiarFiltros={onLimpiarFiltros}
      />
    );

    const btnLimpiar = screen.getByRole('button', { name: /Limpiar filtros/i });
    expect(btnLimpiar).toBeInTheDocument();

    fireEvent.click(btnLimpiar);
    expect(onLimpiarFiltros).toHaveBeenCalledTimes(1);
  });

  it('debe permitir remover un filtro individualmente desde su chip activo', () => {
    const onFiltroDelegacionChange = vi.fn();
    render(
      <AvisosFiltros
        {...defaultProps}
        hayFiltrosActivos={true}
        filtroDelegacion="Calle Calle"
        onFiltroDelegacionChange={onFiltroDelegacionChange}
      />
    );

    const btnQuitar = screen.getByTitle(/Quitar filtro de delegación/i);
    fireEvent.click(btnQuitar);

    expect(onFiltroDelegacionChange).toHaveBeenCalledWith('TODAS');
  });
});

describe('AvisosTableEmpty con filtros activos', () => {
  it('debe mostrar el mensaje amigable "No se encontraron avisos coincidentes" cuando hay filtros activos', () => {
    const onLimpiarFiltros = vi.fn();
    render(
      <table>
        <tbody>
          <AvisosTableEmpty
            cargando={false}
            hayFiltrosActivos={true}
            onLimpiarFiltros={onLimpiarFiltros}
          />
        </tbody>
      </table>
    );

    expect(
      screen.getByText('No se encontraron avisos coincidentes')
    ).toBeInTheDocument();

    const btnLimpiar = screen.getByRole('button', { name: /Limpiar filtros/i });
    expect(btnLimpiar).toBeInTheDocument();
    fireEvent.click(btnLimpiar);
    expect(onLimpiarFiltros).toHaveBeenCalledTimes(1);
  });

  it('debe mostrar el mensaje estándar de bandeja sin reportes cuando no hay filtros activos', () => {
    render(
      <table>
        <tbody>
          <AvisosTableEmpty cargando={false} hayFiltrosActivos={false} />
        </tbody>
      </table>
    );

    expect(
      screen.getByText('No hay avisos pendientes en la bandeja')
    ).toBeInTheDocument();
  });
});
