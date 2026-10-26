import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EmpleadoTabla from '../EmpleadoTabla';
import type { EmpleadoUsuario } from '@/types/empleados';

const crearEmpleado = (overrides: Partial<EmpleadoUsuario> = {}): EmpleadoUsuario => ({
  usuario_id: 'usr-1',
  personal_id: 'per-1',
  rut: '11.111.111-1',
  nombres: 'Juan',
  apellidos: 'Pérez',
  email: 'juan@valdivia.cl',
  telefono: '+56911111111',
  rol_id: 'rol-1',
  rol_codigo: 'ADMIN',
  rol_nombre: 'Administrador',
  delegacion_id: 'del-1',
  delegacion_codigo: 'DEL_NORTE',
  delegacion_nombre: 'Delegación Norte',
  especialidad: 'Coordinador',
  cargo: 'Jefatura',
  estado_operativo: 'disponible',
  disponible_terreno: true,
  observaciones: null,
  usuario_activo: true,
  fecha_ingreso: '2026-01-01',
  fecha_salida: null,
  es_personal: true,
  ...overrides,
});

const mockEmpleados: EmpleadoUsuario[] = [crearEmpleado()];

describe('EmpleadoTabla', () => {
  it('debe renderizar columnas y botón explícito de edición en columna Acciones', () => {
    const handleSelect = vi.fn();
    const handleDarDeBaja = vi.fn();

    render(
      <EmpleadoTabla
        empleados={mockEmpleados}
        cargando={false}
        paginaActual={1}
        totalPaginas={1}
        totalItems={1}
        limite={10}
        onCambiarPagina={vi.fn()}
        onCambiarLimite={vi.fn()}
        onSelectUsuario={handleSelect}
        onDarDeBaja={handleDarDeBaja}
      />
    );

    // Cabecera Acciones
    expect(screen.getByText('Acciones')).toBeDefined();

    // Botón de edición
    const btnEditar = screen.getByRole('button', {
      name: /editar antecedentes de juan pérez/i,
    });
    expect(btnEditar).toBeDefined();

    fireEvent.click(btnEditar);
    expect(handleSelect).toHaveBeenCalledWith(mockEmpleados[0]);

    // Botón de baja lógica
    const btnBaja = screen.getByRole('button', {
      name: /dar de baja a juan pérez/i,
    });
    expect(btnBaja).toBeDefined();

    fireEvent.click(btnBaja);
    expect(handleDarDeBaja).toHaveBeenCalledWith(mockEmpleados[0]);
  });

  it('H11: debe mostrar las columnas institucionales de disponibilidad', () => {
    render(
      <EmpleadoTabla
        empleados={mockEmpleados}
        cargando={false}
        paginaActual={1}
        totalPaginas={1}
        totalItems={1}
        limite={10}
        onCambiarPagina={vi.fn()}
        onCambiarLimite={vi.fn()}
        onSelectUsuario={vi.fn()}
        onDarDeBaja={vi.fn()}
      />
    );

    expect(screen.getByText('RUT')).toBeDefined();
    expect(screen.getByText('Nombre y apellidos')).toBeDefined();
    expect(screen.getByText('Correo')).toBeDefined();
    expect(screen.getByText('Teléfono')).toBeDefined();
    expect(screen.getByText('Rol / Cargo')).toBeDefined();
    expect(screen.getByText('Delegación')).toBeDefined();
    expect(screen.getByText('Estado Operativo')).toBeDefined();
  });

  it('H11: debe mostrar el badge del estado operativo del funcionario', () => {
    render(
      <EmpleadoTabla
        empleados={[crearEmpleado({ estado_operativo: 'en_mision' })]}
        cargando={false}
        paginaActual={1}
        totalPaginas={1}
        totalItems={1}
        limite={10}
        onCambiarPagina={vi.fn()}
        onCambiarLimite={vi.fn()}
        onSelectUsuario={vi.fn()}
        onDarDeBaja={vi.fn()}
      />
    );

    expect(screen.getByText('En Misión')).toBeDefined();
    expect(screen.getByTestId('badge-estado-operativo').getAttribute('data-estado')).toBe('en_mision');
  });

  it('H11: debe mostrar el estado operativo también en empleados sin ficha de terreno', () => {
    render(
      <EmpleadoTabla
        empleados={[
          crearEmpleado({
            personal_id: null,
            es_personal: false,
            disponible_terreno: null,
            estado_operativo: 'descanso',
          }),
        ]}
        cargando={false}
        paginaActual={1}
        totalPaginas={1}
        totalItems={1}
        limite={10}
        onCambiarPagina={vi.fn()}
        onCambiarLimite={vi.fn()}
        onSelectUsuario={vi.fn()}
        onDarDeBaja={vi.fn()}
      />
    );

    expect(screen.getByText('Descanso')).toBeDefined();
  });

  it('H11: debe mostrar un estado vacío con acción de limpiar filtros', () => {
    const handleLimpiar = vi.fn();

    render(
      <EmpleadoTabla
        empleados={[]}
        cargando={false}
        paginaActual={1}
        totalPaginas={1}
        totalItems={0}
        limite={10}
        onCambiarPagina={vi.fn()}
        onCambiarLimite={vi.fn()}
        onSelectUsuario={vi.fn()}
        onDarDeBaja={vi.fn()}
        onLimpiarFiltros={handleLimpiar}
      />
    );

    expect(screen.getByText(/No se encontraron funcionarios/i)).toBeDefined();

    const btnLimpiar = screen.getByRole('button', { name: /Limpiar filtros/i });
    fireEvent.click(btnLimpiar);
    expect(handleLimpiar).toHaveBeenCalled();
  });

  it('debe mostrar el skeleton de carga mientras consulta el servidor', () => {
    render(
      <EmpleadoTabla
        empleados={[]}
        cargando={true}
        paginaActual={1}
        totalPaginas={1}
        totalItems={0}
        limite={10}
        onCambiarPagina={vi.fn()}
        onCambiarLimite={vi.fn()}
        onSelectUsuario={vi.fn()}
        onDarDeBaja={vi.fn()}
      />
    );

    expect(screen.getByTestId('empleados-skeleton')).toBeDefined();
  });
});
