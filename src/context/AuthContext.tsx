'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  loginUsuario,
  obtenerUsuarioActivo,
} from '@/services/seguridadService';
import {
  setAuthCookie,
  getAuthCookie,
  removeAuthCookie,
} from '@/lib/utils/cookieUtils';
import { obtenerNombreDelegacion } from '@/lib/utils/delegacionUtils';
import type {
  LoginRequest,
  UsuarioPerfilSesion,
  UsuarioActivoDetalle,
} from '@/types/seguridad';

export interface AuthContextValue {
  usuario: UsuarioPerfilSesion | null;
  token: string | null;
  estaAutenticado: boolean;
  cargando: boolean;
  login: (credenciales: LoginRequest) => Promise<UsuarioPerfilSesion>;
  logout: () => void;
  tienePermiso: (codigo: string) => boolean;
  tieneAlgunPermiso: (codigos: string[]) => boolean;
  refrescarPerfil: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioPerfilSesion | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return getAuthCookie();
  });
  const [cargando, setCargando] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(getAuthCookie());
  });

  // Mapear UsuarioActivoDetalle del endpoint usuario-activo a UsuarioPerfilSesion
  const mapDetalleAUsuarioPerfil = useCallback(
    (detalle: UsuarioActivoDetalle): UsuarioPerfilSesion => {
      const delegacionId = detalle.delegacionId || detalle.delegacion?.id || null;
      const delegacionNombre =
        detalle.delegacion?.nombre ||
        (delegacionId ? obtenerNombreDelegacion(delegacionId) : null);

      return {
        id: detalle.id,
        rut: detalle.rut,
        nombre: detalle.nombre,
        email: detalle.email,
        rolId: detalle.rol?.id || '',
        rolNombre: detalle.rol?.nombre || '',
        rolCodigo: detalle.rol?.codigo || '',
        delegacionId,
        delegacionNombre,
        permisos: Array.isArray(detalle.permisos)
          ? detalle.permisos
          : detalle.rol?.permisos || [],
      };
    },
    []
  );

  // Inicialización de sesión desde cookie al montar en cliente
  useEffect(() => {
    const cookieToken = getAuthCookie();
    if (!cookieToken) return;

    let cancelado = false;
    void obtenerUsuarioActivo()
      .then((detalle) => {
        if (cancelado) return;
        setUsuario(mapDetalleAUsuarioPerfil(detalle));
      })
      .catch(() => {
        if (cancelado) return;
        removeAuthCookie();
        setToken(null);
        setUsuario(null);
      })
      .finally(() => {
        if (!cancelado) {
          setCargando(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [mapDetalleAUsuarioPerfil]);

  const login = useCallback(
    async (credenciales: LoginRequest): Promise<UsuarioPerfilSesion> => {
      setCargando(true);
      try {
        const respuesta = await loginUsuario(credenciales);
        setAuthCookie(respuesta.token, respuesta.expiraEn);
        setToken(respuesta.token);
        setUsuario(respuesta.usuario);
        return respuesta.usuario;
      } finally {
        setCargando(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    removeAuthCookie();
    setToken(null);
    setUsuario(null);
    try {
      router.push('/login');
    } catch {
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = '/login';
      }
    }
  }, [router]);

  const refrescarPerfil = useCallback(async () => {
    try {
      const detalle = await obtenerUsuarioActivo();
      setUsuario(mapDetalleAUsuarioPerfil(detalle));
    } catch {
      // Interceptor maneja 401
    }
  }, [mapDetalleAUsuarioPerfil]);

  const tienePermiso = useCallback(
    (codigo: string): boolean => {
      if (!usuario) return false;
      if (usuario.rolCodigo === 'ADMIN') return true;
      return usuario.permisos.includes(codigo);
    },
    [usuario]
  );

  const tieneAlgunPermiso = useCallback(
    (codigos: string[]): boolean => {
      if (!usuario) return false;
      if (usuario.rolCodigo === 'ADMIN') return true;
      return codigos.some((c) => usuario.permisos.includes(c));
    },
    [usuario]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      token,
      estaAutenticado: Boolean(usuario && token),
      cargando,
      login,
      logout,
      tienePermiso,
      tieneAlgunPermiso,
      refrescarPerfil,
    }),
    [
      usuario,
      token,
      cargando,
      login,
      logout,
      tienePermiso,
      tieneAlgunPermiso,
      refrescarPerfil,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un <AuthProvider>');
  }
  return context;
}
