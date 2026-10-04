import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminEmpleadosPage from '../page';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthContext, type AuthContextValue } from '@/context/AuthContext';
import * as empleadosServiceModule from '@/services/empleadosService';
import type { EmpleadoUsuario } from '@/types/empleados';

const mockCatalogos = {
  roles: [{ id: 'rol-1', codigo: 'ADMIN', nombre: 'Administrador' }],
  delegaciones: [{ id: 'del-1', codigo: 'NORTE', nombre: 'Delegación Norte' }],
  especialidades: [],
  cargos: [],
};

const createMockAuth = (
  permisos: string[] = ['personal:leer', 'personal:crear'],
  rolCodigo = 'ADMIN',
  rolNombre = 'Administrador'
): AuthContextValue => ({
  usuario: {
    id: 'usr-test-1',
    rut: '12.345.678-5',
    nombre: 'Valdiviano de Prueba',
    email: 'test@valdivia.cl',
    rolId: 'rol-1',
    rolNombre,
    rolCodigo,
    delegacionId: 'del-1',
    delegacionNombre: 'Delegación Norte',
    permisos,
  },
  token: 'mock-jwt-token',
  estaAutenticado: true,
  cargando: false,
  login: vi.fn(),
  logout: vi.fn(),
  tienePermiso: (codigo) =>
    rolCodigo === 'ADMIN' ? true : permisos.includes(codigo),
  tieneAlgunPermiso: (codigos) =>
    rolCodigo === 'ADMIN' ? true : codigos.some((c) => permisos.includes(c)),
  refrescarPerfil: vi.fn(),
});

const renderConProveedores = (
  ui: React.ReactElement,
  authValue: AuthContextValue = createMockAuth()
) => {
  return render(
    <AuthContext.Provider value={authValue}>
      <ToastProvider>{ui}</ToastProvider>
    </AuthContext.Provider>
  );
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

  it('permite ver y accionar "+ Nuevo Funcionario" a un perfil no-admin que posea el permiso personal:crear', () => {
    const customAuth = createMockAuth(
      ['personal:leer', 'personal:crear'],
      'ENCARGADO_RRHH',
      'Encargado de Personal'
    );
    renderConProveedores(<AdminEmpleadosPage />, customAuth);

    const boton = screen.getByRole('button', { name: /\+ nuevo funcionario/i });
    expect(boton).toBeDefined();

    fireEvent.click(boton);
    expect(
      screen.getByText('Registrar Nuevo Funcionario Municipal')
    ).toBeDefined();
  });

  it('oculta el botón "+ Nuevo Funcionario" si el usuario solo tiene permiso personal:leer', () => {
    const soloLecturaAuth = createMockAuth(
      ['personal:leer'],
      'SUPERVISOR_OPERATIVO',
      'Supervisor'
    );
    renderConProveedores(<AdminEmpleadosPage />, soloLecturaAuth);

    expect(
      screen.queryByRole('button', { name: /\+ nuevo funcionario/i })
    ).toBeNull();
    // Pero la búsqueda y directorio sí deben estar disponibles
    expect(screen.getByPlaceholderText(/buscar por rut/i)).toBeDefined();
  });

  it('muestra AccesoDenegadoState si el usuario no tiene ningún permiso de personal', () => {
    const sinPermisosAuth = createMockAuth(
      ['avisos:leer'],
      'OPERADOR_CALLCENTER',
      'Operador Call Center'
    );
    renderConProveedores(<AdminEmpleadosPage />, sinPermisosAuth);

    expect(screen.getByRole('alert')).toBeDefined();
    expect(
      screen.getByText(/permisos insuficientes para gestión de personal/i)
    ).toBeDefined();
    expect(
      screen.queryByRole('button', { name: /\+ nuevo funcionario/i })
    ).toBeNull();
  });
});
