import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AppSidebar from '../AppSidebar';
import { AuthContext, type AuthContextValue } from '@/context/AuthContext';

let currentPathname = '/callcenter';

vi.mock('next/navigation', () => ({
  usePathname: () => currentPathname,
  useRouter: () => ({ push: vi.fn() }),
}));

function renderSidebar(
  authOverrides: Partial<AuthContextValue> = {},
  collapsed = false,
  onToggleCollapse = vi.fn()
) {
  const usuario = authOverrides.usuario ?? null;
  const tieneAlgunPermiso = (codigos: string[]): boolean => {
    if (!usuario) return false;
    if (usuario.rolCodigo === 'ADMIN') return true;
    return codigos.some((c) => usuario.permisos.includes(c));
  };

  const defaultAuth: AuthContextValue = {
    usuario,
    token: usuario ? 'valid-jwt-token' : null,
    estaAutenticado: Boolean(usuario),
    cargando: false,
    login: vi.fn(),
    logout: vi.fn(),
    tienePermiso: (cod) => (usuario?.rolCodigo === 'ADMIN' ? true : Boolean(usuario?.permisos.includes(cod))),
    tieneAlgunPermiso,
    refrescarPerfil: vi.fn(),
    ...authOverrides,
  };

  return render(
    <AuthContext.Provider value={defaultAuth}>
      <AppSidebar collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
    </AuthContext.Provider>
  );
}

describe('AppSidebar — Control de Acceso y Visibilidad RBAC', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentPathname = '/callcenter';
  });

  it('debe mostrar todos los módulos y grupos cuando el usuario es Administrador (ADMIN)', () => {
    renderSidebar({
      usuario: {
        id: 'usr-admin',
        rut: '11111111-1',
        nombre: 'Admin General',
        email: 'admin@valdivia.cl',
        rolId: 'rol-admin',
        rolNombre: 'Administrador',
        rolCodigo: 'ADMIN',
        delegacionId: null,
        permisos: [],
      },
    });

    // Grupos visibles
    expect(screen.getByText('Atención Ciudadana')).toBeDefined();
    expect(screen.getByText('Operaciones')).toBeDefined();
    expect(screen.getByText('Estratégico')).toBeDefined();
    expect(screen.getByText('Administración')).toBeDefined();

    // Módulos públicos
    expect(screen.getByText('Chatbot de Reportes')).toBeDefined();
    expect(screen.getByText('Seguimiento de Avisos')).toBeDefined();

    // Módulos operativos
    expect(screen.getByText('Bandeja de Avisos')).toBeDefined();
    expect(screen.getByText('Ingreso Manual')).toBeDefined();
    expect(screen.getByText('Centro de Mando')).toBeDefined();
    expect(screen.getByText('Fichas FIBE')).toBeDefined();

    // Módulos estratégicos y administrativos
    expect(screen.getByText('Dashboard y Reportes')).toBeDefined();
    expect(screen.getByText('Gestión de Personal')).toBeDefined();
    expect(screen.getByText('Inventario Logístico')).toBeDefined();
    expect(screen.getByText('Roles y Permisos')).toBeDefined();
  });

  it('debe filtrar módulos no autorizados y ocultar grupos vacíos para rol Call Center', () => {
    renderSidebar({
      usuario: {
        id: 'usr-cc',
        rut: '22222222-2',
        nombre: 'Operador Call Center',
        email: 'callcenter@valdivia.cl',
        rolId: 'rol-cc',
        rolNombre: 'Operador Call Center',
        rolCodigo: 'CALL_CENTER',
        delegacionId: null,
        permisos: ['incidentes:avisos:leer'],
      },
    });

    // Módulos públicos y autorizados presentes
    expect(screen.getByText('Chatbot de Reportes')).toBeDefined();
    expect(screen.getByText('Seguimiento de Avisos')).toBeDefined();
    expect(screen.getByText('Bandeja de Avisos')).toBeDefined();
    expect(screen.getByText('Operaciones')).toBeDefined();

    // Módulos no autorizados ausentes
    expect(screen.queryByText('Ingreso Manual')).toBeNull();
    expect(screen.queryByText('Centro de Mando')).toBeNull();
    expect(screen.queryByText('Fichas FIBE')).toBeNull();

    // Grupos sin ningún módulo autorizado no deben renderizarse
    expect(screen.queryByText('Estratégico')).toBeNull();
    expect(screen.queryByText('Administración')).toBeNull();
    expect(screen.queryByText('Inventario Logístico')).toBeNull();
    expect(screen.queryByText('Roles y Permisos')).toBeNull();
    expect(screen.queryByText('Gestión de Personal')).toBeNull();
  });

  it('debe mostrar solo los módulos correspondientes a los permisos específicos del Encargado', () => {
    renderSidebar({
      usuario: {
        id: 'usr-encargado',
        rut: '33333333-3',
        nombre: 'Encargado de Emergencias',
        email: 'encargado@valdivia.cl',
        rolId: 'rol-encargado',
        rolNombre: 'Encargado de Emergencias',
        rolCodigo: 'ENCARGADO',
        delegacionId: null,
        permisos: ['incidentes:kanban', 'recursos:leer'],
      },
    });

    // Operaciones con Centro de Mando
    expect(screen.getByText('Operaciones')).toBeDefined();
    expect(screen.getByText('Centro de Mando')).toBeDefined();
    expect(screen.queryByText('Bandeja de Avisos')).toBeNull();

    // Administración con Inventario Logístico
    expect(screen.getByText('Administración')).toBeDefined();
    expect(screen.getByText('Inventario Logístico')).toBeDefined();
    expect(screen.queryByText('Roles y Permisos')).toBeNull();
    expect(screen.queryByText('Gestión de Personal')).toBeNull();

    // Estratégico no debe aparecer
    expect(screen.queryByText('Estratégico')).toBeNull();
  });

  it('debe desplegar únicamente los módulos públicos cuando el usuario no tiene permisos', () => {
    renderSidebar({
      usuario: {
        id: 'usr-sin-permisos',
        rut: '44444444-4',
        nombre: 'Usuario Sin Permisos',
        email: 'usuario@valdivia.cl',
        rolId: 'rol-basico',
        rolNombre: 'Funcionario Básico',
        rolCodigo: 'BASICO',
        delegacionId: null,
        permisos: [],
      },
    });

    // Módulos públicos
    expect(screen.getByText('Atención Ciudadana')).toBeDefined();
    expect(screen.getByText('Chatbot de Reportes')).toBeDefined();
    expect(screen.getByText('Seguimiento de Avisos')).toBeDefined();

    // Ningún grupo restringido
    expect(screen.queryByText('Operaciones')).toBeNull();
    expect(screen.queryByText('Estratégico')).toBeNull();
    expect(screen.queryByText('Administración')).toBeNull();
  });

  it('debe permitir acceso a módulos públicos cuando no hay sesión iniciada (anónimo)', () => {
    renderSidebar({
      usuario: null,
      estaAutenticado: false,
    });

    expect(screen.getByText('Atención Ciudadana')).toBeDefined();
    expect(screen.getByText('Chatbot de Reportes')).toBeDefined();
    expect(screen.getByText('Seguimiento de Avisos')).toBeDefined();

    expect(screen.queryByText('Operaciones')).toBeNull();
    expect(screen.queryByText('Estratégico')).toBeNull();
    expect(screen.queryByText('Administración')).toBeNull();
  });

  it('debe emitir onToggleCollapse al hacer clic en el botón de alternar barra lateral', () => {
    const mockToggle = vi.fn();
    renderSidebar({}, false, mockToggle);

    const toggleBtn = screen.getByRole('button', { name: /Colapsar barra lateral/i });
    fireEvent.click(toggleBtn);

    expect(mockToggle).toHaveBeenCalledTimes(1);
  });
});
