import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthContext, type AuthContextValue } from '@/context/AuthContext';
import GestionWelcomeBanner from '../GestionWelcomeBanner';
import GestionModulosGrid from '../GestionModulosGrid';
import GestionResumenEstados from '../GestionResumenEstados';

// Mock services to prevent actual network calls during tests
vi.mock('@/services/incidentesService', () => ({
  incidentesService: {
    listar: vi.fn().mockResolvedValue({
      exito: true,
      incidentes: [
        { id: '1', estado: 'REPORTADO' },
        { id: '2', estado: 'VERIFICANDO' },
        { id: '3', estado: 'EN_ATENCION' },
        { id: '4', estado: 'RESUELTO' },
      ],
    }),
  },
}));

vi.mock('@/services/avisosService', () => ({
  listarAvisos: vi.fn().mockResolvedValue({
    data: [
      { id: 'av-1', estado: 'NO_VERIFICADO', fechaCreacion: new Date(Date.now() - 20 * 60000).toISOString() },
      { id: 'av-2', estado: 'NO_VERIFICADO', fechaCreacion: new Date(Date.now() - 5 * 60000).toISOString() },
    ],
  }),
}));

vi.mock('@/services/recursosService', () => ({
  getRecursos: vi.fn().mockResolvedValue({
    data: [
      { id: 'rec-1', estado: 'DISPONIBLE' },
      { id: 'rec-2', estado: 'ASIGNADO' },
    ],
  }),
}));

vi.mock('@/services/seguridadService', () => ({
  listarRolesYPermisos: vi.fn().mockResolvedValue({
    data: [
      { id: 'rol-1', activo: true },
      { id: 'rol-2', activo: false },
    ],
  }),
}));

function createAuthContextValue(usuario: AuthContextValue['usuario']): AuthContextValue {
  const tieneAlgunPermiso = (codigos: string[]): boolean => {
    if (!usuario) return false;
    if (usuario.rolCodigo === 'ADMIN') return true;
    return codigos.some((c) => usuario.permisos.includes(c));
  };

  return {
    usuario,
    token: usuario ? 'valid-jwt-token' : null,
    estaAutenticado: Boolean(usuario),
    cargando: false,
    login: vi.fn(),
    logout: vi.fn(),
    tienePermiso: (cod) => (usuario?.rolCodigo === 'ADMIN' ? true : Boolean(usuario?.permisos.includes(cod))),
    tieneAlgunPermiso,
    refrescarPerfil: vi.fn(),
  };
}

describe('GestionWelcomeBanner', () => {
  it('muestra el saludo personalizado con nombre y rol del funcionario', () => {
    const authVal = createAuthContextValue({
      id: 'usr-1',
      rut: '12.345.678-9',
      nombre: 'Rodrigo Valenzuela',
      email: 'rodrigo@valdivia.cl',
      rolId: 'rol-callcenter',
      rolNombre: 'Operador Call Center',
      rolCodigo: 'CALL_CENTER',
      delegacionId: 'Costa',
      permisos: ['incidentes:avisos:leer'],
    });

    render(
      <AuthContext.Provider value={authVal}>
        <GestionWelcomeBanner />
      </AuthContext.Provider>
    );

    expect(screen.getByText(/Bienvenido\/a, Rodrigo Valenzuela/i)).toBeInTheDocument();
    expect(screen.getByText(/Rol: Operador Call Center/i)).toBeInTheDocument();
    expect(screen.getByText(/Delegación Asignada: Delegación Municipal Costa/i)).toBeInTheDocument();
  });
});

describe('GestionModulosGrid — RBAC', () => {
  it('filtra los módulos mostrando solo aquellos para los que el usuario tiene permisos', () => {
    const authVal = createAuthContextValue({
      id: 'usr-2',
      rut: '11.111.111-1',
      nombre: 'María Operadora',
      email: 'maria@valdivia.cl',
      rolId: 'rol-cc',
      rolNombre: 'Operador Call Center',
      rolCodigo: 'CALL_CENTER',
      delegacionId: null,
      permisos: ['incidentes:avisos:leer', 'crear_incidente_manual'],
    });

    render(
      <AuthContext.Provider value={authVal}>
        <GestionModulosGrid />
      </AuthContext.Provider>
    );

    // Módulos que debe ver
    expect(screen.getByText('Bandeja de Call Center')).toBeInTheDocument();
    expect(screen.getByText('Ingreso Manual de Reportes')).toBeInTheDocument();

    // Módulos que no debe ver
    expect(screen.queryByText('Centro de Mando Táctico')).not.toBeInTheDocument();
    expect(screen.queryByText('Inventario Logístico')).not.toBeInTheDocument();
    expect(screen.queryByText('Roles y Seguridad (RBAC)')).not.toBeInTheDocument();
  });

  it('muestra estado vacío si el usuario no tiene permisos asignados', () => {
    const authVal = createAuthContextValue({
      id: 'usr-3',
      rut: '22.222.222-2',
      nombre: 'Sin Permisos',
      email: 'sinpermisos@valdivia.cl',
      rolId: 'rol-vacio',
      rolNombre: 'Sin Rol',
      rolCodigo: 'GUEST',
      delegacionId: null,
      permisos: [],
    });

    render(
      <AuthContext.Provider value={authVal}>
        <GestionModulosGrid />
      </AuthContext.Provider>
    );

    expect(screen.getByText(/Sin Módulos Operativos Asignados/i)).toBeInTheDocument();
  });

  it('un administrador con rol ADMIN ve todos los módulos', () => {
    const authVal = createAuthContextValue({
      id: 'usr-admin',
      rut: '99.999.999-9',
      nombre: 'Admin General',
      email: 'admin@valdivia.cl',
      rolId: 'rol-admin',
      rolNombre: 'Administrador General',
      rolCodigo: 'ADMIN',
      delegacionId: null,
      permisos: [],
    });

    render(
      <AuthContext.Provider value={authVal}>
        <GestionModulosGrid />
      </AuthContext.Provider>
    );

    expect(screen.getByText('Centro de Mando Táctico')).toBeInTheDocument();
    expect(screen.getByText('Bandeja de Call Center')).toBeInTheDocument();
    expect(screen.getByText('Inventario Logístico')).toBeInTheDocument();
    expect(screen.getByText('Roles y Seguridad (RBAC)')).toBeInTheDocument();
  });
});

describe('GestionResumenEstados — Métricas condicionales', () => {
  it('renderiza widgets de estados según las atribuciones del usuario', async () => {
    const authVal = createAuthContextValue({
      id: 'usr-mando',
      rut: '10.100.100-0',
      nombre: 'Encargado de Emergencias',
      email: 'encargado@valdivia.cl',
      rolId: 'rol-encargado',
      rolNombre: 'Encargado de Operaciones',
      rolCodigo: 'ENCARGADO',
      delegacionId: null,
      permisos: ['incidentes:kanban'],
    });

    render(
      <AuthContext.Provider value={authVal}>
        <GestionResumenEstados />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Centro de Mando')).toBeInTheDocument();
      expect(screen.getByText('Ciclo ICS')).toBeInTheDocument();
    });

    // No debe ver inventario ni roles
    expect(screen.queryByText('Inventario Logístico')).not.toBeInTheDocument();
    expect(screen.queryByText('Seguridad & RBAC')).not.toBeInTheDocument();
  });
});
