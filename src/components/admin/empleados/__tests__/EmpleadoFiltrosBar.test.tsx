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

  it('debe emitir delegación por nombre legible al cambiar el selector', () => {
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
    fireEvent.change(selectDelegacion, { target: { value: 'Norte' } });

    expect(handleSetDelegacion).toHaveBeenCalledWith('Norte');
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
});
