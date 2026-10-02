'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  USUARIOS_SIMULADOS_SISTEMA,
  type UsuarioSimulado,
} from '@/config/usuariosSimulados';
import { obtenerUsuarioActivo } from '@/services/seguridadService';
import type { UsuarioActivoDetalle } from '@/types/seguridad';
import { AuthContext } from '@/context/AuthContext';

const STORAGE_KEY = 'sgrai_simulated_user_id';

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
}

export const SimulatedSessionContext = createContext<SimulatedSessionContextValue | null>(null);

/**
 * Fallback de permisos cuando la API no está disponible o durante la carga inicial.
 */
function obtenerPermisosFallback(rol: string, esAdmin: boolean): Set<string> {
  if (esAdmin || rol === 'Administrador') {
    return new Set([
      'seguridad:roles:leer',
      'seguridad:roles:gestionar',
      'recursos:leer',
      'recursos:crear',
      'incidentes:kanban',
      'incidentes:avisos:leer',
      'incidentes:avisos:verificar',
      'incidentes:avisos:descartar',
      'crear_incidente_manual',
      'misiones:asignar',
      'eventos_atp:crear',
      'personal:leer',
      'personal:crear',
      'personal:gestionar',
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
    ]);
  }

  if (rol === 'Supervisor Estratégico' || rol === 'Supervisor') {
    return new Set(['recursos:leer']);
  }

  return new Set();
}

function obtenerSesionInicial(): UsuarioSimulado {
  if (typeof window !== 'undefined') {
    try {
      const guardadoId = localStorage.getItem(STORAGE_KEY);
      if (guardadoId) {
        const encontrado = USUARIOS_SIMULADOS_SISTEMA.find(
          (u) => u.id === guardadoId
        );
        if (encontrado) {
          return encontrado;
        }
      }
    } catch {
      // Ignorar fallos de lectura de localStorage
    }
  }
  return USUARIOS_SIMULADOS_SISTEMA[0];
}

export function SimulatedSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [usuarioSimuladoManual, setUsuarioSimuladoManual] = useState<UsuarioSimulado>(
    obtenerSesionInicial
  );
  const [permisosSimulados, setPermisosSimulados] = useState<Set<string>>(() => {
    const inicial = obtenerSesionInicial();
    return obtenerPermisosFallback(inicial.rol, inicial.esAdmin);
  });
  const [cargandoPermisos, setCargandoPermisos] = useState(false);
  const [usuarioDetalleServidor, setUsuarioDetalleServidor] =
    useState<UsuarioActivoDetalle | null>(null);

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
      setUsuarioSimuladoManual(nuevoUsuario);
      try {
        localStorage.setItem(STORAGE_KEY, nuevoUsuario.id);
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
