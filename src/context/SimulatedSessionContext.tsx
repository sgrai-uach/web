'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  USUARIOS_SIMULADOS_SISTEMA,
  type UsuarioSimulado,
} from '@/config/usuariosSimulados';
import { obtenerUsuarioActivo } from '@/services/seguridadService';
import type { UsuarioActivoDetalle } from '@/types/seguridad';
import { AuthContext } from '@/context/AuthContext';

const STORAGE_KEY = 'sgrai_simulated_user_id';
const CHANGE_EVENT = 'sgrai_simulated_user_change';

function subscribeStorage(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function getStorageSnapshot(): string {
  if (typeof window === 'undefined') return USUARIOS_SIMULADOS_SISTEMA[0].id;
  try {
    return localStorage.getItem(STORAGE_KEY) || USUARIOS_SIMULADOS_SISTEMA[0].id;
  } catch {
    return USUARIOS_SIMULADOS_SISTEMA[0].id;
  }
}

function getServerStorageSnapshot(): string {
  return USUARIOS_SIMULADOS_SISTEMA[0].id;
}

interface SimulatedSessionContextValue {
  usuarioActivo: UsuarioSimulado;
  setUsuarioActivo: (usuario: UsuarioSimulado) => void;
  cambiarUsuarioPorId: (id: string) => void;
  usuariosDisponibles: UsuarioSimulado[];
  permisos: Set<string>;
  cargandoPermisos: boolean;
  refrescarPermisos: () => Promise<void>;
  hasPermission: (codigo: string) => boolean;
  hasAnyPermission: (codigos: string[]) => boolean;
  usuarioDetalleServidor: UsuarioActivoDetalle | null;
  isMounted: boolean;
}

export const SimulatedSessionContext = createContext<SimulatedSessionContextValue | null>(null);

/**
 * Fallback de permisos cuando la API no está disponible o durante la carga inicial.
 * Soporta permisos personalizados guardados en localStorage.
 */
function obtenerPermisosFallback(rol: string, esAdmin: boolean): Set<string> {
  if (typeof window !== 'undefined') {
    try {
      const customPermsStr = localStorage.getItem(`sgrai_simulated_perms_${rol}`);
      if (customPermsStr) {
        const parsed = JSON.parse(customPermsStr);
        if (Array.isArray(parsed)) {
          return new Set(parsed);
        }
      }
    } catch {
      // Ignorar fallos de lectura de localStorage
    }
  }

  if (esAdmin || rol === 'Administrador') {
    return new Set([
      'seguridad:roles:leer',
      'seguridad:roles:gestionar',
      'recursos:leer',
      'recursos:crear',
      'recursos:editar',
      'recursos:eliminar',
      'incidentes:kanban',
      'incidentes:avisos:leer',
      'incidentes:avisos:verificar',
      'incidentes:avisos:descartar',
      'crear_incidente_manual',
      'misiones:asignar',
      'eventos_atp:crear',
      'puntos_criticos:leer',
      'puntos_criticos:crear',
      'puntos_criticos:gestionar',
      'puntos_criticos:eliminar',
      'personal:leer',
      'personal:crear',
      'personal:gestionar',
      'asistencia_social:crear',
      'asistencia_social:leer',
    ]);
  }

  if (rol === 'Call Center') {
    return new Set([
      'crear_incidente_manual',
      'incidentes:avisos:leer',
      'incidentes:avisos:verificar',
      'incidentes:avisos:descartar',
    ]);
  }

  if (rol === 'Encargado') {
    return new Set([
      'incidentes:kanban',
      'misiones:asignar',
      'recursos:leer',
      'asistencia_social:crear',
      'asistencia_social:leer',
    ]);
  }

  if (rol === 'Asistente Social') {
    return new Set(['asistencia_social:leer']);
  }

  if (rol === 'Supervisor Estratégico' || rol === 'Supervisor') {
    return new Set(['recursos:leer']);
  }

  return new Set();
}

export function SimulatedSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const activeUserId = useSyncExternalStore(
    subscribeStorage,
    getStorageSnapshot,
    getServerStorageSnapshot
  );

  const usuarioSimuladoManual = useMemo<UsuarioSimulado>(() => {
    return (
      USUARIOS_SIMULADOS_SISTEMA.find((u) => u.id === activeUserId) ||
      USUARIOS_SIMULADOS_SISTEMA[0]
    );
  }, [activeUserId]);

  const [permisosSimulados, setPermisosSimulados] = useState<Set<string>>(() => {
    const inicial = USUARIOS_SIMULADOS_SISTEMA[0];
    return obtenerPermisosFallback(inicial.rol, inicial.esAdmin);
  });
  const [cargandoPermisos, setCargandoPermisos] = useState(false);
  const [usuarioDetalleServidor, setUsuarioDetalleServidor] =
    useState<UsuarioActivoDetalle | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setIsMounted(true);
    });
  }, []);

  const auth = useContext(AuthContext);

  // Derivar usuario activo: si hay sesión real activa en AuthContext, tiene precedencia
  const usuarioActivo = useMemo<UsuarioSimulado>(() => {
    if (auth && auth.estaAutenticado && auth.usuario) {
      return {
        id: auth.usuario.id,
        nombre: auth.usuario.nombre,
        email: auth.usuario.email,
        rut: auth.usuario.rut,
        rol: auth.usuario.rolNombre,
        esAdmin: auth.usuario.rolCodigo === 'ADMIN',
      };
    }
    return usuarioSimuladoManual;
  }, [auth, usuarioSimuladoManual]);

  // Derivar permisos activos: si hay sesión real activa en AuthContext, sincronizar
  const permisos = useMemo<Set<string>>(() => {
    if (auth && auth.estaAutenticado && auth.usuario) {
      return new Set(auth.usuario.permisos);
    }
    return permisosSimulados;
  }, [auth, permisosSimulados]);

  // Sincronizar permisos frescos del backend cuando cambia el usuario simulado
  useEffect(() => {
    if (auth?.estaAutenticado) return;
    let cancelado = false;
    void obtenerUsuarioActivo(usuarioSimuladoManual.id)
      .then((detalle) => {
        if (cancelado) return;
        setUsuarioDetalleServidor(detalle);
        if (detalle && Array.isArray(detalle.permisos)) {
          setPermisosSimulados(new Set(detalle.permisos));
        } else {
          setPermisosSimulados(
            obtenerPermisosFallback(usuarioSimuladoManual.rol, usuarioSimuladoManual.esAdmin)
          );
        }
      })
      .catch(() => {
        if (cancelado) return;
        setPermisosSimulados(
          obtenerPermisosFallback(usuarioSimuladoManual.rol, usuarioSimuladoManual.esAdmin)
        );
      })
      .finally(() => {
        if (!cancelado) {
          setCargandoPermisos(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [auth?.estaAutenticado, usuarioSimuladoManual]);

  const setUsuarioActivo = useCallback(
    (nuevoUsuario: UsuarioSimulado) => {
      try {
        localStorage.setItem(STORAGE_KEY, nuevoUsuario.id);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event(CHANGE_EVENT));
        }
      } catch {
        // Ignorar fallos de persistencia
      }
    },
    []
  );

  const cambiarUsuarioPorId = useCallback(
    (id: string) => {
      const encontrado = USUARIOS_SIMULADOS_SISTEMA.find((u) => u.id === id);
      if (encontrado) {
        setUsuarioActivo(encontrado);
      }
    },
    [setUsuarioActivo]
  );

  const refrescarPermisos = useCallback(async () => {
    setCargandoPermisos(true);
    try {
      if (auth?.estaAutenticado) {
        await auth.refrescarPerfil();
        return;
      }
      const detalle = await obtenerUsuarioActivo(usuarioSimuladoManual.id);
      setUsuarioDetalleServidor(detalle);
      if (detalle && Array.isArray(detalle.permisos)) {
        setPermisosSimulados(new Set(detalle.permisos));
      } else {
        setPermisosSimulados(
          obtenerPermisosFallback(usuarioSimuladoManual.rol, usuarioSimuladoManual.esAdmin)
        );
      }
    } catch {
      setPermisosSimulados(
        obtenerPermisosFallback(usuarioSimuladoManual.rol, usuarioSimuladoManual.esAdmin)
      );
    } finally {
      setCargandoPermisos(false);
    }
  }, [auth, usuarioSimuladoManual]);

  const hasPermission = useCallback(
    (codigo: string): boolean => {
      return permisos.has(codigo);
    },
    [permisos]
  );

  const hasAnyPermission = useCallback(
    (codigos: string[]): boolean => {
      return codigos.some((c) => permisos.has(c));
    },
    [permisos]
  );

  const contextValue = useMemo<SimulatedSessionContextValue>(
    () => ({
      usuarioActivo,
      setUsuarioActivo,
      cambiarUsuarioPorId,
      usuariosDisponibles: USUARIOS_SIMULADOS_SISTEMA,
      permisos,
      cargandoPermisos,
      refrescarPermisos,
      hasPermission,
      hasAnyPermission,
      usuarioDetalleServidor,
      isMounted,
    }),
    [
      usuarioActivo,
      setUsuarioActivo,
      cambiarUsuarioPorId,
      permisos,
      cargandoPermisos,
      refrescarPermisos,
      hasPermission,
      hasAnyPermission,
      usuarioDetalleServidor,
      isMounted,
    ]
  );

  return (
    <SimulatedSessionContext.Provider value={contextValue}>
      {children}
    </SimulatedSessionContext.Provider>
  );
}

export function useSimulatedSession() {
  const context = useContext(SimulatedSessionContext);
  if (!context) {
    throw new Error(
      'useSimulatedSession debe ser utilizado dentro de un <SimulatedSessionProvider>'
    );
  }
  return context;
}
