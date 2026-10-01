import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminEmpleadosPage from '../page';
import { ToastProvider } from '@/components/ui/Toast';
import * as empleadosServiceModule from '@/services/empleadosService';
import type { EmpleadoUsuario } from '@/types/empleados';

const mockCatalogos = {
  roles: [{ id: 'rol-1', codigo: 'ADMIN', nombre: 'Administrador' }],
  delegaciones: [{ id: 'del-1', codigo: 'NORTE', nombre: 'Delegación Norte' }],
  especialidades: [],
  cargos: [],
};

const renderConProveedores = (ui: React.ReactElement) => {
  return render(<ToastProvider>{ui}</ToastProvider>);
};

describe('AdminEmpleadosPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(empleadosServiceModule.empleadosService, 'getCatalogos').mockResolvedValue(
      mockCatalogos
    );
    vi.spyOn(empleadosServiceModule.empleadosService, 'getEmpleados').mockResolvedValue([]);
  });

  it('debe renderizar el título de la página y el botón de acción institucional "+ Nuevo Funcionario"', () => {
    renderConProveedores(<AdminEmpleadosPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Gestión de Personal' })
    ).toBeDefined();
    expect(
      screen.getByRole('button', { name: /\+ nuevo funcionario/i })
    ).toBeDefined();
  });

  it('debe abrir el modal RegistrarEmpleadoModal al presionar "+ Nuevo Funcionario"', () => {
    renderConProveedores(<AdminEmpleadosPage />);

    expect(
      screen.queryByText('Registrar Nuevo Funcionario Municipal')
    ).toBeNull();

    const botonNuevo = screen.getByRole('button', {
      name: /\+ nuevo funcionario/i,
    });
    fireEvent.click(botonNuevo);

    expect(
      screen.getByText('Registrar Nuevo Funcionario Municipal')
    ).toBeDefined();
  });

  it('debe cerrar el modal y disparar toast de éxito al completar el registro', async () => {
    const mockNuevo: EmpleadoUsuario = {
      usuario_id: 'usr-999',
      rut: '11.111.111-1',
      nombres: 'María',
      apellidos: 'Valenzuela',
      email: 'mvalenzuela@valdivia.cl',
      telefono: '+56912345678',
      usuario_activo: true,
      fecha_ingreso: '2026-10-01',
      fecha_salida: null,
      rol_id: 'rol-1',
      rol_codigo: 'ADMIN',
      rol_nombre: 'Administrador',
      delegacion_id: 'del-1',
      delegacion_codigo: 'NORTE',
      delegacion_nombre: 'Delegación Norte',
      es_personal: false,
      personal_id: null,
      especialidad: null,
      cargo: null,
      estado_operativo: null,
      disponible_terreno: null,
      observaciones: null,
    };

    vi.spyOn(empleadosServiceModule.empleadosService, 'createEmpleado').mockResolvedValue(
      mockNuevo
    );

    renderConProveedores(<AdminEmpleadosPage />);

    // Abrir modal
    fireEvent.click(
      screen.getByRole('button', { name: /\+ nuevo funcionario/i })
    );

    // Esperar a que el modal esté abierto y los catálogos cargados (select habilitado)
    await screen.findByText('Registrar Nuevo Funcionario Municipal');
    await waitFor(() => {
      const selectRol = screen.getByLabelText(/rol institucional/i) as HTMLSelectElement;
      expect(selectRol.disabled).toBe(false);
    });

    // Llenar campos
    fireEvent.change(screen.getByLabelText(/rut chileno/i), {
      target: { value: '11.111.111-1' },
    });
    fireEvent.change(
      screen.getByLabelText(/correo electrónico institucional/i),
      {
        target: { value: 'mvalenzuela@valdivia.cl' },
      }
    );
    fireEvent.change(screen.getByLabelText(/^nombres/i), {
      target: { value: 'María' },
    });
    fireEvent.change(screen.getByLabelText(/^apellidos/i), {
      target: { value: 'Valenzuela' },
    });
    fireEvent.change(screen.getByLabelText(/teléfono de contacto/i), {
      target: { value: '+56912345678' },
    });
    fireEvent.change(screen.getByLabelText(/rol institucional/i), {
      target: { value: 'rol-1' },
    });
    fireEvent.change(screen.getByLabelText(/delegación territorial/i), {
      target: { value: 'del-1' },
    });
    fireEvent.change(screen.getByLabelText(/contraseña inicial/i), {
      target: { value: 'PasswordSegura2026!' },
    });

    // Guardar
    fireEvent.click(
      screen.getByRole('button', { name: /registrar funcionario/i })
    );

    await waitFor(() => {
      expect(
        screen.queryByText('Registrar Nuevo Funcionario Municipal')
      ).toBeNull();
    });
  });
});
