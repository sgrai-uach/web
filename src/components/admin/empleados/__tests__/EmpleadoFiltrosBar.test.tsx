import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EmpleadoFiltrosBar from '../EmpleadoFiltrosBar';

describe('EmpleadoFiltrosBar', () => {
  const roles = [
    { id: 'rol-1', codigo: 'ROL_PATRULLA', nombre: 'Patrulla Verificadora' },
    { id: 'rol-2', codigo: 'ROL_ASISTENTE', nombre: 'Asistente Social' },
    { id: 'rol-3', codigo: 'ROL_ADMIN', nombre: 'Administrador' },
  ];

  const delegaciones = [
    { id: 'del-1', codigo: 'DEL_NORTE', nombre: 'Norte' },
    { id: 'del-2', codigo: 'DEL_SUR', nombre: 'Sur' },
  ];

  it('debe renderizar botonera rápida para Patrullas y Asistentes Sociales', () => {
    const handleSetRol = vi.fn();

    render(
      <EmpleadoFiltrosBar
        delegacionFiltro=""
        setDelegacionFiltro={vi.fn()}
        rolFiltro=""
        setRolFiltro={handleSetRol}
        ordenarPor="apellidos"
        setOrdenarPor={vi.fn()}
        orden="asc"
        setOrden={vi.fn()}
        delegaciones={delegaciones}
        roles={roles}
      />
    );

    const btnPatrullas = screen.getByRole('button', { name: 'Patrullas Verificadoras' });
    const btnAsistentes = screen.getByRole('button', { name: 'Asistentes Sociales' });

    expect(btnPatrullas).toBeDefined();
    expect(btnAsistentes).toBeDefined();

    fireEvent.click(btnPatrullas);
    expect(handleSetRol).toHaveBeenCalledWith('rol-1');
  });

  it('debe emitir la delegación por UUID al cambiar el selector (H11)', () => {
    const handleSetDelegacion = vi.fn();

    render(
      <EmpleadoFiltrosBar
        delegacionFiltro=""
        setDelegacionFiltro={handleSetDelegacion}
        rolFiltro=""
        setRolFiltro={vi.fn()}
        ordenarPor="apellidos"
        setOrdenarPor={vi.fn()}
        orden="asc"
        setOrden={vi.fn()}
        delegaciones={delegaciones}
        roles={roles}
      />
    );

    const selectDelegacion = screen.getByLabelText(/Filtrar por Delegación/i);
    fireEvent.change(selectDelegacion, { target: { value: 'del-1' } });

    expect(handleSetDelegacion).toHaveBeenCalledWith('del-1');
  });

  it('H11: debe ofrecer el filtro de estado operativo y el toggle de inactivos', () => {
    const handleEstadoOperativo = vi.fn();
    const handleIncluirInactivos = vi.fn();

    render(
      <EmpleadoFiltrosBar
        delegacionFiltro=""
        setDelegacionFiltro={vi.fn()}
        rolFiltro=""
        setRolFiltro={vi.fn()}
        estadoOperativoFiltro=""
        setEstadoOperativoFiltro={handleEstadoOperativo}
        incluirInactivos={false}
        setIncluirInactivos={handleIncluirInactivos}
        ordenarPor="apellidos"
        setOrdenarPor={vi.fn()}
        orden="asc"
        setOrden={vi.fn()}
        delegaciones={delegaciones}
        roles={roles}
      />
    );

    const selectEstado = screen.getByLabelText(/Estado Operativo/i);
    fireEvent.change(selectEstado, { target: { value: 'en_mision' } });
    expect(handleEstadoOperativo).toHaveBeenCalledWith('en_mision');

    const toggleInactivos = screen.getByLabelText(/Incluir funcionarios inactivos/i);
    fireEvent.click(toggleInactivos);
    expect(handleIncluirInactivos).toHaveBeenCalledWith(true);
  });

  it('debe mostrar el botón limpiar y llamarlo al hacer clic si hay filtros activos', () => {
    const handleLimpiar = vi.fn();

    render(
      <EmpleadoFiltrosBar
        delegacionFiltro="Norte"
        setDelegacionFiltro={vi.fn()}
        rolFiltro="rol-1"
        setRolFiltro={vi.fn()}
        ordenarPor="apellidos"
        setOrdenarPor={vi.fn()}
        orden="asc"
        setOrden={vi.fn()}
        delegaciones={delegaciones}
        roles={roles}
        onLimpiarFiltros={handleLimpiar}
      />
    );

    const btnLimpiar = screen.getByRole('button', { name: /Limpiar filtros de personal/i });
    fireEvent.click(btnLimpiar);

    expect(handleLimpiar).toHaveBeenCalled();
  });

  it('debe renderizar la búsqueda de personal integrada dentro del FilterBar', () => {
    const handleSetTermino = vi.fn();

    render(
      <EmpleadoFiltrosBar
        termino=""
        setTermino={handleSetTermino}
        delegacionFiltro=""
        setDelegacionFiltro={vi.fn()}
        rolFiltro=""
        setRolFiltro={vi.fn()}
        ordenarPor="apellidos"
        setOrdenarPor={vi.fn()}
        orden="asc"
        setOrden={vi.fn()}
        delegaciones={delegaciones}
        roles={roles}
      />
    );

    expect(screen.getByText('Filtros de Personal y Cuadrillas')).toBeDefined();
    const inputBusqueda = screen.getByPlaceholderText(/Buscar por RUT, Nombre, Apellidos o Correo.../i);
    expect(inputBusqueda).toBeDefined();

    fireEvent.change(inputBusqueda, { target: { value: 'González' } });
    expect(handleSetTermino).toHaveBeenCalledWith('González');
  });

  it('debe renderizar chips individuales y permitir removerlos con el botón [x]', () => {
    const handleSetTermino = vi.fn();
    const handleSetDelegacion = vi.fn();
    const handleSetEstado = vi.fn();

    render(
      <EmpleadoFiltrosBar
        termino="Pérez"
        setTermino={handleSetTermino}
        delegacionFiltro="Norte"
        setDelegacionFiltro={handleSetDelegacion}
        rolFiltro=""
        setRolFiltro={vi.fn()}
        estadoFiltro="inactivo"
        setEstadoFiltro={handleSetEstado}
        ordenarPor="apellidos"
        setOrdenarPor={vi.fn()}
        orden="asc"
        setOrden={vi.fn()}
        delegaciones={delegaciones}
        roles={roles}
      />
    );

    // Debe mostrar los chips activos
    expect(screen.getByText(/Búsqueda: "Pérez"/i)).toBeDefined();
    expect(screen.getByText(/Delegación: Norte/i)).toBeDefined();
    expect(screen.getByText(/Estado: Inactivos \(Baja\)/i)).toBeDefined();

    // Al pulsar quitar en el chip de búsqueda
    const btnQuitarBusqueda = screen.getByRole('button', { name: /Quitar filtro de búsqueda/i });
    fireEvent.click(btnQuitarBusqueda);
    expect(handleSetTermino).toHaveBeenCalledWith('');

    // Al pulsar quitar en el chip de delegación
    const btnQuitarDelegacion = screen.getByRole('button', { name: /Quitar filtro de delegación/i });
    fireEvent.click(btnQuitarDelegacion);
    expect(handleSetDelegacion).toHaveBeenCalledWith('');

    // Al pulsar quitar en el chip de estado
    const btnQuitarEstado = screen.getByRole('button', { name: /Quitar filtro de estado/i });
    fireEvent.click(btnQuitarEstado);
    expect(handleSetEstado).toHaveBeenCalledWith('todos');
  });
});

