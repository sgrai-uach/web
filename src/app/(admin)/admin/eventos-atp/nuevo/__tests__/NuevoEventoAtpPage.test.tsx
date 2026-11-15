import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import NuevoEventoAtpPage from '../page';
import { AuthContext, type AuthContextValue } from '@/context/AuthContext';
import {
  SimulatedSessionContext,
  type SimulatedSessionContextValue,
} from '@/context/SimulatedSessionContext';
import type { UsuarioSimulado } from '@/config/usuariosSimulados';

// Mock de useRouter y usePathname
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/gestion/admin/eventos-atp/nuevo',
}));

// Mock del formulario para testear aisladamente la página y su control RBAC
vi.mock('@/components/admin/eventos-atp/EventoAtpForm', () => ({
  default: () => (
    <div data-testid="mock-evento-atp-form">EventoAtpForm Activo</div>
  ),
}));

const usuarioAdministrador: UsuarioSimulado = {
  id: '00000000-0000-4000-8000-000000000001',
  nombre: 'Administrador General',
  email: 'admin@valdivia.cl',
  rut: '11.111.111-1',
  rol: 'Administrador',
  esAdmin: true,
};

const usuarioEncargado: UsuarioSimulado = {
  id: '00000000-0000-4000-8000-000000000003',
  nombre: 'Encargado Territorial',
  email: 'encargado@valdivia.cl',
  rut: '33.333.333-3',
  rol: 'Encargado',
  esAdmin: false,
};

const usuarioInformante: UsuarioSimulado = {
  id: '00000000-0000-4000-8000-000000000005',
  nombre: 'Ciudadano Informante',
  email: 'informante@correo.cl',
  rut: '55.555.555-5',
  rol: 'Informante',
  esAdmin: false,
};

function crearSesion(overrides: Partial<SimulatedSessionContextValue> = {}) {
  return {
    usuarioActivo: usuarioAdministrador,
    setUsuarioActivo: vi.fn(),
    cambiarUsuarioPorId: vi.fn(),
    usuariosDisponibles: [],
    permisos: new Set<string>(['eventos_atp:crear']),
    cargandoPermisos: false,
    refrescarPermisos: vi.fn(),
    hasPermission: vi.fn(() => true),
    hasAnyPermission: vi.fn(() => true),
    usuarioDetalleServidor: null,
    isMounted: true,
    ...overrides,
  } as SimulatedSessionContextValue;
}

function crearAuth(overrides: Partial<AuthContextValue> = {}) {
  return {
    usuario: null,
    token: null,
    estaAutenticado: false,
    cargando: false,
    login: vi.fn(),
    logout: vi.fn(),
    tienePermiso: vi.fn(() => false),
    tieneAlgunPermiso: vi.fn(() => false),
    refrescarPerfil: vi.fn(),
    ...overrides,
  } as AuthContextValue;
}

function renderPagina(
  sesion: SimulatedSessionContextValue,
  auth: AuthContextValue = crearAuth()
) {
  return render(
    <AuthContext.Provider value={auth}>
      <SimulatedSessionContext.Provider value={sesion}>
        <NuevoEventoAtpPage />
      </SimulatedSessionContext.Provider>
    </AuthContext.Provider>
  );
}

describe('NuevoEventoAtpPage - RBAC y Renderizado (H61)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar la página de creación si el usuario tiene rol Administrador', () => {
    renderPagina(crearSesion());

    expect(
      screen.getByText('Crear Evento de Alerta Temprana Preventiva')
    ).toBeInTheDocument();
    expect(screen.getByText('Evento ATP')).toBeInTheDocument();
    expect(screen.getByTestId('mock-evento-atp-form')).toBeInTheDocument();
    expect(screen.queryByText('Acceso Restringido')).toBeNull();
  });

  it('debe permitir acceso si el usuario cuenta con el permiso eventos_atp:crear', () => {
    renderPagina(
      crearSesion({
        usuarioActivo: usuarioEncargado,
        permisos: new Set(['eventos_atp:crear']),
        hasPermission: vi.fn((p) => p === 'eventos_atp:crear') as never,
      })
    );

    expect(
      screen.getByText('Crear Evento de Alerta Temprana Preventiva')
    ).toBeInTheDocument();
    expect(screen.getByTestId('mock-evento-atp-form')).toBeInTheDocument();
  });

  it('debe bloquear el acceso y mostrar Acceso Denegado a usuarios sin rol Administrador ni permisos', () => {
    renderPagina(
      crearSesion({
        usuarioActivo: usuarioInformante,
        permisos: new Set(),
        hasPermission: vi.fn(() => false) as never,
        hasAnyPermission: vi.fn(() => false) as never,
      })
    );

    expect(screen.getByText('Acceso Restringido')).toBeInTheDocument();
    expect(
      screen.getByText(/la Creación de Eventos ATP/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Se requieren privilegios de Administrador o el permiso 'eventos_atp:crear'/i)
    ).toBeInTheDocument();
    expect(screen.queryByTestId('mock-evento-atp-form')).toBeNull();
  });

  it('no debe montar el formulario mientras la sesión no está resuelta (Fail-Closed)', () => {
    renderPagina(crearSesion({ isMounted: false }));

    expect(screen.queryByTestId('mock-evento-atp-form')).toBeNull();
    expect(screen.queryByText('Acceso Restringido')).toBeNull();
  });

  it('no debe montar el formulario mientras AuthContext está cargando', () => {
    renderPagina(
      crearSesion(),
      crearAuth({ cargando: true, estaAutenticado: true })
    );

    expect(screen.queryByTestId('mock-evento-atp-form')).toBeNull();
  });

  it('no debe montar el formulario mientras se cargan los permisos', () => {
    renderPagina(crearSesion({ cargandoPermisos: true }));

    expect(screen.queryByTestId('mock-evento-atp-form')).toBeNull();
  });

  it('no debe conceder acceso por el UUID estático del administrador por defecto', () => {
    renderPagina(
      crearSesion({
        usuarioActivo: {
          ...usuarioInformante,
          id: '00000000-0000-4000-8000-000000000001',
        },
        permisos: new Set(),
        hasPermission: vi.fn(() => false) as never,
        hasAnyPermission: vi.fn(() => false) as never,
      })
    );

    expect(screen.queryByTestId('mock-evento-atp-form')).toBeNull();
    expect(screen.getByText('Acceso Restringido')).toBeInTheDocument();
  });

  it('debe validar el acceso con la sesión real de AuthContext', () => {
    renderPagina(
      crearSesion({ usuarioActivo: usuarioInformante }),
      crearAuth({
        estaAutenticado: true,
        usuario: {
          id: '00000000-0000-4000-8000-000000000002',
          rut: '22.222.222-2',
          nombre: 'Usuario Call Center',
          email: 'callcenter@valdivia.cl',
          rolId: '20000000-0000-4000-8000-000000000002',
          rolNombre: 'Call Center',
          rolCodigo: 'CALL_CENTER',
          delegacionId: null,
          delegacionNombre: null,
          permisos: [],
        },
        tienePermiso: vi.fn(() => false) as never,
      })
    );

    expect(screen.queryByTestId('mock-evento-atp-form')).toBeNull();
    expect(screen.getByText('Acceso Restringido')).toBeInTheDocument();
  });

  it('debe habilitar el formulario con sesión real de Administrador', () => {
    renderPagina(
      crearSesion({ usuarioActivo: usuarioInformante }),
      crearAuth({
        estaAutenticado: true,
        usuario: {
          id: '00000000-0000-4000-8000-000000000001',
          rut: '11.111.111-1',
          nombre: 'Administrador General',
          email: 'admin@valdivia.cl',
          rolId: '20000000-0000-4000-8000-000000000001',
          rolNombre: 'Administrador',
          rolCodigo: 'ADMIN',
          delegacionId: null,
          delegacionNombre: null,
          permisos: ['eventos_atp:crear'],
        },
        tienePermiso: vi.fn(() => true) as never,
      })
    );

    expect(screen.getByTestId('mock-evento-atp-form')).toBeInTheDocument();
  });
});
