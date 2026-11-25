import React from 'react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { renderHook } from '@testing-library/react';
import { AuthContext, type AuthContextValue } from '@/context/AuthContext';
import {
  SimulatedSessionContext,
  type SimulatedSessionContextValue,
} from '@/context/SimulatedSessionContext';
import { usePuedeCrearEventoAtp } from '../usePuedeCrearEventoAtp';
import type { UsuarioSimulado } from '@/config/usuariosSimulados';

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

function crearSesion(
  overrides: Partial<SimulatedSessionContextValue> = {}
): SimulatedSessionContextValue {
  return {
    usuarioActivo: usuarioInformante,
    setUsuarioActivo: () => undefined,
    cambiarUsuarioPorId: () => undefined,
    usuariosDisponibles: [],
    permisos: new Set<string>(),
    cargandoPermisos: false,
    refrescarPermisos: async () => undefined,
    hasPermission: () => false,
    hasAnyPermission: () => false,
    usuarioDetalleServidor: null,
    isMounted: true,
    ...overrides,
  } as SimulatedSessionContextValue;
}

function crearAuth(
  overrides: Partial<AuthContextValue> = {}
): AuthContextValue {
  return {
    usuario: null,
    token: null,
    estaAutenticado: false,
    cargando: false,
    login: async () => {
      throw new Error('no implementado');
    },
    logout: () => undefined,
    tienePermiso: () => false,
    tieneAlgunPermiso: () => false,
    refrescarPerfil: async () => undefined,
    ...overrides,
  } as AuthContextValue;
}

function renderizarHook(
  sesion: SimulatedSessionContextValue,
  auth: AuthContextValue = crearAuth()
) {
  return renderHook(() => usePuedeCrearEventoAtp(), {
    wrapper: ({ children }) => (
      <AuthContext.Provider value={auth}>
        <SimulatedSessionContext.Provider value={sesion}>
          {children}
        </SimulatedSessionContext.Provider>
      </AuthContext.Provider>
    ),
  });
}

describe('usePuedeCrearEventoAtp (H61)', () => {
  it('debe permitir el acceso con rol Administrador', () => {
    const { result } = renderizarHook(
      crearSesion({ usuarioActivo: usuarioAdministrador })
    );

    expect(result.current).toBe(true);
  });

  it('debe permitir el acceso con el permiso eventos_atp:crear', () => {
    const { result } = renderizarHook(
      crearSesion({
        usuarioActivo: usuarioEncargado,
        permisos: new Set(['eventos_atp:crear']),
        hasPermission: (codigo: string) => codigo === 'eventos_atp:crear',
      })
    );

    expect(result.current).toBe(true);
  });

  it('debe denegar el acceso sin rol ni permiso', () => {
    const { result } = renderizarHook(crearSesion());

    expect(result.current).toBe(false);
  });

  it('debe denegar el acceso mientras la sesión no está resuelta', () => {
    const { result } = renderizarHook(crearSesion({ isMounted: false }));

    expect(result.current).toBe(false);
  });

  it('debe denegar el acceso mientras se carga la sesión real o los permisos', () => {
    const conAuthCargando = renderizarHook(
      crearSesion({ usuarioActivo: usuarioAdministrador }),
      crearAuth({ cargando: true })
    );
    expect(conAuthCargando.result.current).toBe(false);

    const conPermisosCargando = renderizarHook(
      crearSesion({
        usuarioActivo: usuarioAdministrador,
        cargandoPermisos: true,
      })
    );
    expect(conPermisosCargando.result.current).toBe(false);
  });

  it('debe validar el acceso con la sesión real de AuthContext', () => {
    const { result } = renderizarHook(
      crearSesion(),
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
        tienePermiso: (codigo: string) => codigo === 'eventos_atp:crear',
      })
    );

    expect(result.current).toBe(true);
  });

  it('debe denegar el acceso fuera de los proveedores de sesión', () => {
    const { result } = renderHook(() => usePuedeCrearEventoAtp());

    expect(result.current).toBe(false);
  });
});
