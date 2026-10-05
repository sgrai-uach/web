import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import NuevoEventoSocialClient from '../NuevoEventoSocialClient';

let mockRol = 'Encargado';
let mockHasPermission = vi.fn((_perm: string) => true);

vi.mock('@/context/SimulatedSessionContext', () => ({
  useSimulatedSession: () => ({
    usuarioActivo: {
      id: '00000000-0000-4000-8000-000000000003',
      nombre: 'Usuario Operativo',
      rol: mockRol,
      esAdmin: false,
    },
    hasPermission: (perm: string) => mockHasPermission(perm),
  }),
}));

vi.mock('../EventoAsistenciaSocialForm', () => ({
  default: () => <div data-testid="mock-evento-form">Formulario de Evento Social</div>,
}));

describe('NuevoEventoSocialClient — RBAC', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('permite acceso al Encargado para registrar eventos sociales', () => {
    mockRol = 'Encargado';
    mockHasPermission = vi.fn(() => false); // Incluso si hasPermission no tiene el permiso explícito, Encargado tiene rol autorizado

    render(<NuevoEventoSocialClient basePath="/gestion/asistente-social" />);

    expect(screen.getByTestId('mock-evento-form')).toBeDefined();
    expect(screen.getByText(/Nuevo Evento de Asistencia Social/i)).toBeDefined();
  });

  it('permite acceso a cualquier usuario que cuente con el permiso asistencia_social:crear', () => {
    mockRol = 'Operador Call Center';
    mockHasPermission = vi.fn((perm: string) => perm === 'asistencia_social:crear');

    render(<NuevoEventoSocialClient basePath="/gestion/asistente-social" />);

    expect(screen.getByTestId('mock-evento-form')).toBeDefined();
    expect(screen.queryByText(/Acceso Denegado/i)).toBeNull();
  });

  it('bloquea el acceso y muestra AccesoDenegadoState si el usuario no es Encargado ni cuenta con el permiso', () => {
    mockRol = 'Ciudadano';
    mockHasPermission = vi.fn(() => false);

    render(<NuevoEventoSocialClient basePath="/gestion/asistente-social" />);

    expect(screen.queryByTestId('mock-evento-form')).toBeNull();
    expect(screen.getByText(/Acceso Restringido/i)).toBeDefined();
    expect(
      screen.getByText(/Se requiere el rol de Encargado o contar con el permiso 'asistencia_social:crear'/i)
    ).toBeDefined();
  });
});
