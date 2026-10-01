import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HeaderUserWidget from '../HeaderUserWidget';
import { AuthContext, type AuthContextValue } from '@/context/AuthContext';

function renderWithAuth(authOverrides: Partial<AuthContextValue>) {
  const defaultAuth: AuthContextValue = {
    usuario: null,
    token: null,
    estaAutenticado: false,
    cargando: false,
    login: vi.fn(),
    logout: vi.fn(),
    tienePermiso: vi.fn(),
    tieneAlgunPermiso: vi.fn(),
    refrescarPerfil: vi.fn(),
    ...authOverrides,
  };

  return render(
    <AuthContext.Provider value={defaultAuth}>
      <HeaderUserWidget />
    </AuthContext.Provider>
  );
}

describe('HeaderUserWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar enlace a Iniciar Sesión cuando el usuario no está autenticado', () => {
    renderWithAuth({ estaAutenticado: false, usuario: null });

    const link = screen.getByRole('link', { name: /Iniciar Sesión/i });
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('/login');
  });

  it('debe desplegar el nombre y rol del funcionario autenticado', () => {
    renderWithAuth({
      estaAutenticado: true,
      usuario: {
        id: 'usr-1',
        rut: '11111111-1',
        nombre: 'Cristóbal Administrador',
        email: 'admin@valdivia.cl',
        rolId: 'rol-1',
        rolNombre: 'Administrador',
        rolCodigo: 'ADMIN',
        delegacionId: 'del-1',
        permisos: [],
      },
    });

    expect(screen.getByText('Cristóbal Administrador')).toBeDefined();
    expect(screen.getByText('Administrador')).toBeDefined();
    expect(screen.getByRole('button', { name: /Cerrar sesión/i })).toBeDefined();
  });

  it('debe invocar la función logout al hacer clic en Salir', () => {
    const mockLogout = vi.fn();
    renderWithAuth({
      estaAutenticado: true,
      usuario: {
        id: 'usr-1',
        rut: '11111111-1',
        nombre: 'Cristóbal Administrador',
        email: 'admin@valdivia.cl',
        rolId: 'rol-1',
        rolNombre: 'Administrador',
        rolCodigo: 'ADMIN',
        delegacionId: null,
        permisos: [],
      },
      logout: mockLogout,
    });

    const logoutBtn = screen.getByRole('button', { name: /Cerrar sesión/i });
    fireEvent.click(logoutBtn);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
