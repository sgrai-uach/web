import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RolesFiltros from '../RolesFiltros';

describe('RolesFiltros Component', () => {
  const defaultProps = {
    busqueda: '',
    onBusquedaChange: vi.fn(),
    filtroTipo: 'TODOS' as const,
    onFiltroTipoChange: vi.fn(),
    filtroEstado: 'TODOS' as const,
    onFiltroEstadoChange: vi.fn(),
    onRefrescar: vi.fn(),
    cargando: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('debe renderizar la barra con título y controles de filtrado', () => {
    render(<RolesFiltros {...defaultProps} />);

    expect(screen.getByText('Filtros de Perfiles y Permisos')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Buscar por nombre, descripción o módulo.../i)).toBeInTheDocument();
    expect(screen.getByText('Tipo de Rol:')).toBeInTheDocument();
    expect(screen.getByText('Estado de Permisos:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Actualizar datos/i })).toBeInTheDocument();
  });

  it('debe invocar onFiltroTipoChange cuando se hace clic en una opción de tipo', () => {
    const onFiltroTipoChange = vi.fn();
    render(<RolesFiltros {...defaultProps} onFiltroTipoChange={onFiltroTipoChange} />);

    const btnSistema = screen.getByRole('button', { name: 'Sistema' });
    fireEvent.click(btnSistema);

    expect(onFiltroTipoChange).toHaveBeenCalledWith('SISTEMA');
  });

  it('debe invocar onFiltroEstadoChange cuando se hace clic en una opción de permisos', () => {
    const onFiltroEstadoChange = vi.fn();
    render(<RolesFiltros {...defaultProps} onFiltroEstadoChange={onFiltroEstadoChange} />);

    const btnConPermisos = screen.getByRole('button', { name: 'Con Permisos' });
    fireEvent.click(btnConPermisos);

    expect(onFiltroEstadoChange).toHaveBeenCalledWith('CON_PERMISOS');
  });

  it('debe mostrar chips de filtros activos y permitir limpiarlos', () => {
    const onBusquedaChange = vi.fn();
    const onFiltroTipoChange = vi.fn();
    const onFiltroEstadoChange = vi.fn();

    render(
      <RolesFiltros
        {...defaultProps}
        busqueda="coordinador"
        filtroTipo="SISTEMA"
        filtroEstado="CON_PERMISOS"
        onBusquedaChange={onBusquedaChange}
        onFiltroTipoChange={onFiltroTipoChange}
        onFiltroEstadoChange={onFiltroEstadoChange}
      />
    );

    expect(screen.getByText(/Búsqueda: "coordinador"/i)).toBeInTheDocument();
    expect(screen.getByText(/Tipo de Rol: Sistema/i)).toBeInTheDocument();
    expect(screen.getByText(/Permisos: Con Permisos/i)).toBeInTheDocument();

    // Limpiar todos
    const btnLimpiar = screen.getByRole('button', { name: /Limpiar filtros/i });
    fireEvent.click(btnLimpiar);

    expect(onBusquedaChange).toHaveBeenCalledWith('');
    expect(onFiltroTipoChange).toHaveBeenCalledWith('TODOS');
    expect(onFiltroEstadoChange).toHaveBeenCalledWith('TODOS');
  });

  it('debe permitir remover un filtro individual desde su chip', () => {
    const onFiltroTipoChange = vi.fn();

    render(
      <RolesFiltros
        {...defaultProps}
        filtroTipo="PERSONALIZADO"
        onFiltroTipoChange={onFiltroTipoChange}
      />
    );

    const btnQuitarTipo = screen.getByTitle(/Quitar filtro de tipo de rol/i);
    fireEvent.click(btnQuitarTipo);

    expect(onFiltroTipoChange).toHaveBeenCalledWith('TODOS');
  });

  it('debe invocar onRefrescar al hacer clic en el botón de refrescar', () => {
    const onRefrescar = vi.fn();
    render(<RolesFiltros {...defaultProps} onRefrescar={onRefrescar} />);

    const btnRefrescar = screen.getByRole('button', { name: /Actualizar datos/i });
    fireEvent.click(btnRefrescar);

    expect(onRefrescar).toHaveBeenCalledTimes(1);
  });

  it('debe mostrar los contadores en las opciones de Tipo de Rol y Permisos (F-06)', () => {
    render(
      <RolesFiltros
        {...defaultProps}
        contadoresTipo={{
          TODOS: 7,
          SISTEMA: 4,
          PERSONALIZADO: 3,
        }}
        contadoresEstado={{
          TODOS: 7,
          CON_PERMISOS: 5,
          SIN_PERMISOS: 2,
        }}
      />
    );

    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('debe persistir el estado colapsado en localStorage con la clave sgrai:filtros:roles:colapsado', () => {
    render(<RolesFiltros {...defaultProps} />);

    const btnToggle = screen.getByRole('button', { name: /Minimizar filtros/i });
    fireEvent.click(btnToggle);

    expect(localStorage.getItem('sgrai:filtros:roles:colapsado')).toBe('true');
  });
});
