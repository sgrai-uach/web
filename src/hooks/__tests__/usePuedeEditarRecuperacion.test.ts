import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePuedeEditarRecuperacion } from '../usePuedeEditarRecuperacion';
import { AuthContext, type AuthContextValue } from '@/context/AuthContext';
import { SimulatedSessionContext } from '@/context/SimulatedSessionContext';

describe('usePuedeEditarRecuperacion (HU-74 - Fail-Closed)', () => {
  it('retorna false cuando se renderiza fuera de AuthProvider y SimulatedSessionProvider (Fail-Closed)', () => {
    const { result } = renderHook(() => usePuedeEditarRecuperacion());
    expect(result.current).toBe(false);
  });

  it('retorna false mientras AuthContext está cargando', () => {
    const mockAuth: AuthContextValue = {
      usuario: null,
      token: null,
      estaAutenticado: false,
      cargando: true,
      login: vi.fn(),
      logout: vi.fn(),
      tienePermiso: () => true,
      tieneAlgunPermiso: () => true,
      refrescarPerfil: vi.fn(),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(AuthContext.Provider, { value: mockAuth }, children);

    const { result } = renderHook(() => usePuedeEditarRecuperacion(), { wrapper });
    expect(result.current).toBe(false);
  });

  it('retorna true si AuthContext autenticado tiene permiso recuperacion:editar', () => {
    const mockAuth: AuthContextValue = {
      usuario: {
        id: 'u1',
        rut: '11111111-1',
        nombre: 'Encargado',
        email: 'encargado@valdivia.cl',
        rolId: 'r1',
        rolNombre: 'Encargado',
        rolCodigo: 'ENCARGADO',
        delegacionId: null,
        delegacionNombre: null,
        permisos: ['recuperacion:editar'],
      },
      token: 'jwt-token',
      estaAutenticado: true,
      cargando: false,
      login: vi.fn(),
      logout: vi.fn(),
      tienePermiso: (codigo) => codigo === 'recuperacion:editar',
      tieneAlgunPermiso: (codigos) => codigos.includes('recuperacion:editar'),
      refrescarPerfil: vi.fn(),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(AuthContext.Provider, { value: mockAuth }, children);

    const { result } = renderHook(() => usePuedeEditarRecuperacion(), { wrapper });
    expect(result.current).toBe(true);
  });

  it('retorna false si AuthContext autenticado no tiene permiso ni es ADMIN', () => {
    const mockAuth: AuthContextValue = {
      usuario: {
        id: 'u2',
        rut: '22222222-2',
        nombre: 'Supervisor',
        email: 'sup@valdivia.cl',
        rolId: 'r2',
        rolNombre: 'Supervisor',
        rolCodigo: 'SUPERVISOR',
        delegacionId: null,
        delegacionNombre: null,
        permisos: ['recuperacion:leer'],
      },
      token: 'jwt-token',
      estaAutenticado: true,
      cargando: false,
      login: vi.fn(),
      logout: vi.fn(),
      tienePermiso: () => false,
      tieneAlgunPermiso: () => false,
      refrescarPerfil: vi.fn(),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(AuthContext.Provider, { value: mockAuth }, children);

    const { result } = renderHook(() => usePuedeEditarRecuperacion(), { wrapper });
    expect(result.current).toBe(false);
  });

  it('retorna true si SimulatedSessionContext tiene recuperacion:editar sin AuthContext', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        SimulatedSessionContext.Provider,
        {
          value: {
            usuarioActivo: {
              id: 'u1',
              nombre: 'Encargado',
              email: 'e@valdivia.cl',
              rut: '33333333-3',
              rol: 'Encargado',
              esAdmin: false,
            },
            setUsuarioActivo: vi.fn(),
            cambiarUsuarioPorId: vi.fn(),
            usuariosDisponibles: [],
            permisos: new Set(['recuperacion:editar']),
            cargandoPermisos: false,
            refrescarPermisos: vi.fn(),
            hasPermission: (c) => c === 'recuperacion:editar',
            hasAnyPermission: (cs) => cs.includes('recuperacion:editar'),
            usuarioDetalleServidor: null,
            isMounted: true,
          },
        },
        children
      );

    const { result } = renderHook(() => usePuedeEditarRecuperacion(), { wrapper });
    expect(result.current).toBe(true);
  });
});
