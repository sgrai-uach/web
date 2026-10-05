import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EmpleadoTabla from '../EmpleadoTabla';
import type { EmpleadoUsuario } from '@/types/empleados';

const mockEmpleados: EmpleadoUsuario[] = [
  {
    usuario_id: 'usr-1',
    personal_id: 'per-1',
    rut: '11.111.111-1',
    nombres: 'Juan',
    apellidos: 'Pérez',
    email: 'juan@valdivia.cl',
    telefono: '+56911111111',
    direccion: 'Centro',
    rol_id: 'rol-1',
    rol_nombre: 'Administrador',
    delegacion_id: 'del-1',
    delegacion_nombre: 'Delegación Norte',
    especialidad: 'Coordinador',
    cargo: 'Jefatura',
    usuario_activo: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

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
});
