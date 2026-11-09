import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import NuevoEventoAtpPage from '../page';
import * as sessionContextModule from '@/context/SimulatedSessionContext';

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

describe('NuevoEventoAtpPage - RBAC y Renderizado (H61)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar la página de creación si el usuario tiene rol Administrador', () => {
    vi.spyOn(sessionContextModule, 'useSimulatedSession').mockReturnValue({
      usuarioActivo: {
        id: '00000000-0000-4000-8000-000000000001',
        nombre: 'Administrador General',
        email: 'admin@valdivia.cl',
        rut: '11.111.111-1',
        rol: 'Administrador',
        esAdmin: true,
      },
      setUsuarioActivo: vi.fn(),
      cambiarUsuarioPorId: vi.fn(),
      usuariosDisponibles: [],
      permisos: new Set(['eventos_atp:crear']),
      cargandoPermisos: false,
      refrescarPermisos: vi.fn(),
      hasPermission: vi.fn().mockReturnValue(true),
      hasAnyPermission: vi.fn().mockReturnValue(true),
      usuarioDetalleServidor: null,
    });

    render(<NuevoEventoAtpPage />);

    expect(
      screen.getByText('Crear Evento de Alerta Temprana Preventiva')
    ).toBeInTheDocument();
    expect(screen.getByText('Evento ATP')).toBeInTheDocument();
    expect(screen.getByTestId('mock-evento-atp-form')).toBeInTheDocument();
    expect(screen.queryByText('Acceso Restringido')).toBeNull();
  });

  it('debe permitir acceso si el usuario cuenta con el permiso eventos_atp:crear', () => {
    vi.spyOn(sessionContextModule, 'useSimulatedSession').mockReturnValue({
      usuarioActivo: {
        id: '00000000-0000-4000-8000-000000000003',
        nombre: 'Encargado Territorial',
        email: 'encargado@valdivia.cl',
        rut: '33.333.333-3',
        rol: 'Encargado',
        esAdmin: false,
      },
      setUsuarioActivo: vi.fn(),
      cambiarUsuarioPorId: vi.fn(),
      usuariosDisponibles: [],
      permisos: new Set(['eventos_atp:crear']),
      cargandoPermisos: false,
      refrescarPermisos: vi.fn(),
      hasPermission: vi.fn((p) => p === 'eventos_atp:crear'),
      hasAnyPermission: vi.fn().mockReturnValue(true),
      usuarioDetalleServidor: null,
    });

    render(<NuevoEventoAtpPage />);

    expect(
      screen.getByText('Crear Evento de Alerta Temprana Preventiva')
    ).toBeInTheDocument();
    expect(screen.getByTestId('mock-evento-atp-form')).toBeInTheDocument();
  });

  it('debe bloquear el acceso y mostrar Acceso Denegado a usuarios sin rol Administrador ni permisos', () => {
    vi.spyOn(sessionContextModule, 'useSimulatedSession').mockReturnValue({
      usuarioActivo: {
        id: '00000000-0000-4000-8000-000000000005',
        nombre: 'Ciudadano Informante',
        email: 'informante@correo.cl',
        rut: '55.555.555-5',
        rol: 'Informante',
        esAdmin: false,
      },
      setUsuarioActivo: vi.fn(),
      cambiarUsuarioPorId: vi.fn(),
      usuariosDisponibles: [],
      permisos: new Set(),
      cargandoPermisos: false,
      refrescarPermisos: vi.fn(),
      hasPermission: vi.fn().mockReturnValue(false),
      hasAnyPermission: vi.fn().mockReturnValue(false),
      usuarioDetalleServidor: null,
    });

    render(<NuevoEventoAtpPage />);

    expect(screen.getByText('Acceso Restringido')).toBeInTheDocument();
    expect(
      screen.getByText(/la Creación de Eventos ATP/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Se requieren privilegios de Administrador o el permiso 'eventos_atp:crear'/i)
    ).toBeInTheDocument();
    expect(screen.queryByTestId('mock-evento-atp-form')).toBeNull();
  });
});
