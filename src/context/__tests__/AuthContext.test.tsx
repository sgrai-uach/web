import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import * as seguridadService from '@/services/seguridadService';
import * as cookieUtils from '@/lib/utils/cookieUtils';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

function ConsumerComponent() {
  const {
    usuario,
    token,
    estaAutenticado,
    cargando,
    login,
    logout,
    tienePermiso,
    tieneAlgunPermiso,
  } = useAuth();

  if (cargando) {
    return <span data-testid="cargando">Cargando...</span>;
  }

  return (
    <div>
      <span data-testid="auth-status">{estaAutenticado ? 'AUTENTICADO' : 'ANONIMO'}</span>
      <span data-testid="token-val">{token || 'SIN_TOKEN'}</span>
      <span data-testid="user-name">{usuario?.nombre || 'NO_USER'}</span>
      <span data-testid="user-role">{usuario?.rolNombre || 'NO_ROL'}</span>
      <span data-testid="permiso-admin">
        {tienePermiso('seguridad:roles:gestionar') ? 'SI' : 'NO'}
      </span>
      <span data-testid="algun-permiso">
        {tieneAlgunPermiso(['recursos:crear', 'otra:cosa']) ? 'SI' : 'NO'}
      </span>

      <button
        data-testid="btn-login"
        onClick={() =>
          login({ identificador: 'admin@valdivia.cl', password: 'Valdivia2026!' })
        }
      >
        Iniciar Sesión
      </button>

      <button data-testid="btn-logout" onClick={() => logout()}>
        Cerrar Sesión
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookieUtils.removeAuthCookie();
  });

  it('debe iniciar como anónimo cuando no hay cookie de autenticación', async () => {
    vi.spyOn(cookieUtils, 'getAuthCookie').mockReturnValue(null);

    render(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status').textContent).toBe('ANONIMO');
    expect(screen.getByTestId('token-val').textContent).toBe('SIN_TOKEN');
    expect(screen.getByTestId('user-name').textContent).toBe('NO_USER');
  });

  it('debe autenticar exitosamente y actualizar el estado al invocar login', async () => {
    vi.spyOn(cookieUtils, 'getAuthCookie').mockReturnValue(null);
    const setCookieSpy = vi.spyOn(cookieUtils, 'setAuthCookie');

    const mockUserData = {
      token: 'jwt-123',
      expiraEn: '2026-10-01T04:00:00Z',
      usuario: {
        id: 'usr-1',
        rut: '11111111-1',
        nombre: 'Administrador General',
        email: 'admin@valdivia.cl',
        rolId: 'rol-1',
        rolNombre: 'Administrador',
        rolCodigo: 'ADMIN',
        delegacionId: 'del-1',
        permisos: ['seguridad:roles:gestionar', 'recursos:crear'],
      },
    };

    vi.spyOn(seguridadService, 'loginUsuario').mockResolvedValue(mockUserData);

    render(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByTestId('btn-login'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('AUTENTICADO');
    });

    expect(screen.getByTestId('token-val').textContent).toBe('jwt-123');
    expect(screen.getByTestId('user-name').textContent).toBe('Administrador General');
    expect(screen.getByTestId('permiso-admin').textContent).toBe('SI');
    expect(screen.getByTestId('algun-permiso').textContent).toBe('SI');
    expect(setCookieSpy).toHaveBeenCalledWith('jwt-123', '2026-10-01T04:00:00Z');
  });

  it('debe limpiar cookie y estado al invocar logout', async () => {
    vi.spyOn(cookieUtils, 'getAuthCookie').mockReturnValue(null);
    const removeCookieSpy = vi.spyOn(cookieUtils, 'removeAuthCookie');

    vi.spyOn(seguridadService, 'loginUsuario').mockResolvedValue({
      token: 'jwt-123',
      expiraEn: '2026-10-01T04:00:00Z',
      usuario: {
        id: 'usr-1',
        rut: '11111111-1',
        nombre: 'Operador Call Center',
        email: 'callcenter@valdivia.cl',
        rolId: 'rol-2',
        rolNombre: 'Call Center',
        rolCodigo: 'CALL_CENTER',
        delegacionId: 'del-1',
        permisos: ['incidentes:avisos:leer'],
      },
    });

    render(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByTestId('btn-login'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('AUTENTICADO');
    });

    fireEvent.click(screen.getByTestId('btn-logout'));

    expect(screen.getByTestId('auth-status').textContent).toBe('ANONIMO');
    expect(removeCookieSpy).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/login');
  });
});
