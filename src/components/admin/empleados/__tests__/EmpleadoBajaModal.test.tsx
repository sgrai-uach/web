import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EmpleadoBajaModal from '../EmpleadoBajaModal';
import type { EmpleadoUsuario } from '@/types/empleados';

const mockEmpleadoDisponible: EmpleadoUsuario = {
  usuario_id: 'usr-1',
  rut: '12.345.678-5',
  nombres: 'Juan',
  apellidos: 'Pérez',
  email: 'juan.perez@valdivia.cl',
  telefono: '+56912345678',
  usuario_activo: true,
  fecha_ingreso: '2024-01-01',
  fecha_salida: null,
  rol_id: 'rol-1',
  rol_codigo: 'BRIGADISTA',
  rol_nombre: 'Personal de Terreno',
  delegacion_id: 'del-1',
  delegacion_codigo: 'DEL_NORTE',
  delegacion_nombre: 'Delegación Norte',
  es_personal: true,
  personal_id: 'pers-1',
  especialidad: 'Motosierrista',
  cargo: 'Brigadista Terreno',
  estado_operativo: 'disponible',
  disponible_terreno: true,
  observaciones: null,
};

const mockEmpleadoEnMision: EmpleadoUsuario = {
  ...mockEmpleadoDisponible,
  usuario_id: 'usr-2',
  nombres: 'Carlos',
  apellidos: 'Gómez',
  estado_operativo: 'en_mision',
};

describe('HU-13: EmpleadoBajaModal', () => {
  it('no renderiza nada si empleado es null', () => {
    const { container } = render(
      <EmpleadoBajaModal
        empleado={null}
        eliminando={false}
        onConfirmar={vi.fn()}
        onCancelar={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('muestra datos del empleado y botón de confirmación si está disponible', () => {
    const onConfirmar = vi.fn();
    const onCancelar = vi.fn();

    render(
      <EmpleadoBajaModal
        empleado={mockEmpleadoDisponible}
        eliminando={false}
        onConfirmar={onConfirmar}
        onCancelar={onCancelar}
      />
    );

    expect(screen.getByText(/Juan Pérez/)).toBeInTheDocument();
    expect(screen.getByText(/12.345.678-5/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sí, dar de baja/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Sí, dar de baja/i }));
    expect(onConfirmar).toHaveBeenCalledTimes(1);
  });

  it('bloquea la acción y muestra advertencia si el empleado está en misión activa', () => {
    const onConfirmar = vi.fn();
    const onCancelar = vi.fn();

    render(
      <EmpleadoBajaModal
        empleado={mockEmpleadoEnMision}
        eliminando={false}
        onConfirmar={onConfirmar}
        onCancelar={onCancelar}
      />
    );

    expect(screen.getByText(/Acción Bloqueada: Funcionario en terreno activo/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Sí, dar de baja/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Cerrar$/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Cerrar$/i }));
    expect(onCancelar).toHaveBeenCalledTimes(1);
    expect(onConfirmar).not.toHaveBeenCalled();
  });
});
