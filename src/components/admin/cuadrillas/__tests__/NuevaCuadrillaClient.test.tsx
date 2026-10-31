import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import NuevaCuadrillaClient from '../NuevaCuadrillaClient';
import * as AuthContextModule from '@/context/AuthContext';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('../CuadrillaForm', () => ({
  default: () => <div data-testid="cuadrilla-form-mock">CuadrillaForm Component</div>,
}));

describe('NuevaCuadrillaClient RBAC (H79)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe bloquear el acceso y mostrar AccesoDenegadoState si el usuario carece del permiso recursos:crear', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      usuario: {
        id: 'usr-regular',
        rut: '12.345.678-9',
        nombres: 'Pedro',
        apellidos: 'Informante',
        nombreCompleto: 'Pedro Informante',
        email: 'pedro@valdivia.cl',
        rolId: 'rol-callcenter',
        rolCodigo: 'CALL_CENTER',
        rolNombre: 'Call Center',
        delegacionId: null,
        delegacionNombre: null,
        permisos: ['incidentes:avisos:leer'],
      },
      token: 'jwt-token',
      estaAutenticado: true,
      cargando: false,
      login: vi.fn(),
      logout: vi.fn(),
      tienePermiso: (codigo: string) => codigo === 'incidentes:avisos:leer',
      tieneAlgunPermiso: () => false,
      refrescarPerfil: vi.fn(),
    });

    render(<NuevaCuadrillaClient />);

    expect(screen.getByText(/Acceso Restringido/i)).toBeDefined();
    expect(screen.getByText(/Permisos insuficientes/i)).toBeDefined();
    expect(screen.getByText(/Volver al Centro de Mando/i)).toBeDefined();
    expect(screen.queryByTestId('cuadrilla-form-mock')).toBeNull();
  });

  it('debe permitir el acceso si el usuario posee el permiso recursos:crear', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      usuario: {
        id: 'usr-admin',
        rut: '11.111.111-1',
        nombres: 'Encargado',
        apellidos: 'Logística',
        nombreCompleto: 'Encargado Logística',
        email: 'encargado@valdivia.cl',
        rolId: 'rol-encargado',
        rolCodigo: 'ENCARGADO',
        rolNombre: 'Encargado de Operaciones',
        delegacionId: null,
        delegacionNombre: null,
        permisos: ['recursos:crear', 'recursos:leer'],
      },
      token: 'jwt-token',
      estaAutenticado: true,
      cargando: false,
      login: vi.fn(),
      logout: vi.fn(),
      tienePermiso: (codigo: string) => ['recursos:crear', 'recursos:leer'].includes(codigo),
      tieneAlgunPermiso: () => true,
      refrescarPerfil: vi.fn(),
    });

    render(<NuevaCuadrillaClient />);

    expect(screen.getByRole('heading', { name: /Registrar Nueva Cuadrilla Operativa/i })).toBeDefined();
    expect(screen.getByTestId('cuadrilla-form-mock')).toBeDefined();
    expect(screen.queryByText(/Acceso Denegado/i)).toBeNull();
  });
});
