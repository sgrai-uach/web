import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EmpleadoModificarModal from '../EmpleadoModificarModal';
import { empleadosService } from '@/services/empleadosService';
import type { EmpleadoUsuario } from '@/types/empleados';

// Mock de useCatalogos
vi.mock('@/hooks/useCatalogos', () => ({
  useCatalogos: () => ({
    catalogos: {
      roles: [{ id: 'rol-1', codigo: 'ADMIN', nombre: 'Administrador' }],
      delegaciones: [{ id: 'del-1', codigo: 'NORTE', nombre: 'Delegación Norte' }],
      especialidades: ['Motosierrista'],
      cargos: ['Conductor'],
    },
    cargando: false,
    error: null,
  }),
}));

const mockEmpleado: EmpleadoUsuario = {
  usuario_id: 'usr-123',
  personal_id: 'per-123',
  rut: '12.345.678-5',
  nombres: 'Carlos',
  apellidos: 'Miranda',
  email: 'carlos.miranda@valdivia.cl',
  telefono: '+56912345678',
  direccion: 'Valdivia',
  rol_id: 'rol-1',
  rol_nombre: 'Administrador',
  delegacion_id: 'del-1',
  delegacion_nombre: 'Delegación Norte',
  especialidad: 'Motosierrista',
  cargo: 'Conductor',
  usuario_activo: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('EmpleadoModificarModal', () => {
  const onClose = vi.fn();
  const onEmpleadoActualizado = vi.fn();
  const onDarDeBaja = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no debe renderizar nada cuando usuario es null', () => {
    const { container } = render(
      <EmpleadoModificarModal
        usuario={null}
        isOpen={true}
        onClose={onClose}
        onEmpleadoActualizado={onEmpleadoActualizado}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('no debe renderizar nada cuando isOpen es false', () => {
    const { container } = render(
      <EmpleadoModificarModal
        usuario={mockEmpleado}
        isOpen={false}
        onClose={onClose}
        onEmpleadoActualizado={onEmpleadoActualizado}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('debe renderizar el título con el nombre del funcionario y los datos del formulario', () => {
    render(
      <EmpleadoModificarModal
        usuario={mockEmpleado}
        isOpen={true}
        onClose={onClose}
        onEmpleadoActualizado={onEmpleadoActualizado}
        onDarDeBaja={onDarDeBaja}
      />
    );

    // Título modal
    expect(
      screen.getByText('Ficha de Modificación: Carlos Miranda')
    ).toBeDefined();

    // Campos precargados
    const inputNombres = screen.getByDisplayValue('Carlos');
    const inputApellidos = screen.getByDisplayValue('Miranda');
    const inputEmail = screen.getByDisplayValue('carlos.miranda@valdivia.cl');

    expect(inputNombres).toBeDefined();
    expect(inputApellidos).toBeDefined();
    expect(inputEmail).toBeDefined();

    // Botones de acción
    expect(screen.getByRole('button', { name: /guardar cambios/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /dar de baja/i })).toBeDefined();
  });

  it('debe llamar a onClose al hacer clic en Cancelar', () => {
    render(
      <EmpleadoModificarModal
        usuario={mockEmpleado}
        isOpen={true}
        onClose={onClose}
        onEmpleadoActualizado={onEmpleadoActualizado}
      />
    );

    const btnCancelar = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(btnCancelar);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('debe llamar a onDarDeBaja al presionar el botón Dar de baja', () => {
    render(
      <EmpleadoModificarModal
        usuario={mockEmpleado}
        isOpen={true}
        onClose={onClose}
        onEmpleadoActualizado={onEmpleadoActualizado}
        onDarDeBaja={onDarDeBaja}
      />
    );

    const btnBaja = screen.getByRole('button', { name: /dar de baja/i });
    fireEvent.click(btnBaja);

    expect(onDarDeBaja).toHaveBeenCalledTimes(1);
  });

  it('debe enviar la actualización y llamar inmediatamente a onEmpleadoActualizado sin notificación de éxito inline en modal', async () => {
    vi.spyOn(empleadosService, 'updateEmpleado').mockResolvedValueOnce({
      usuario_id: 'usr-123',
      rut: '12.345.678-5',
      nombres: 'Carlos',
      apellidos: 'Miranda Editado',
      email: 'carlos.miranda@valdivia.cl',
      usuario_activo: true,
      rol_id: 'rol-1',
    });

    render(
      <EmpleadoModificarModal
        usuario={mockEmpleado}
        isOpen={true}
        onClose={onClose}
        onEmpleadoActualizado={onEmpleadoActualizado}
      />
    );

    const btnGuardar = screen.getByRole('button', { name: /guardar cambios/i });
    fireEvent.click(btnGuardar);

    await waitFor(() => {
      expect(onEmpleadoActualizado).toHaveBeenCalledTimes(1);
    });

    // No debe mostrarse InlineNotice de éxito dentro del modal
    expect(screen.queryByText(/actualizados exitosamente/i)).toBeNull();
  });
});
