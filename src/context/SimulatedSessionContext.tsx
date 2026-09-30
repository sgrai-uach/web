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

const SimulatedSessionContext = createContext<SimulatedSessionContextValue | null>(null);

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

  return new Set();
}

export function SimulatedSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [usuarioActivo, setUsuarioActivoState] = useState<UsuarioSimulado>(
    USUARIOS_SIMULADOS_SISTEMA[0]
  );
  const [permisos, setPermisos] = useState<Set<string>>(() =>
    obtenerPermisosFallback(
      USUARIOS_SIMULADOS_SISTEMA[0].rol,
      USUARIOS_SIMULADOS_SISTEMA[0].esAdmin
    )
  );
  const [cargandoPermisos, setCargandoPermisos] = useState(false);
  const [usuarioDetalleServidor, setUsuarioDetalleServidor] =
    useState<UsuarioActivoDetalle | null>(null);

  // Inicializar desde localStorage si existe
  useEffect(() => {
    try {
      const guardadoId = localStorage.getItem(STORAGE_KEY);
      if (guardadoId) {
        const encontrado = USUARIOS_SIMULADOS_SISTEMA.find(
          (u) => u.id === guardadoId
        );
        if (encontrado) {
          setUsuarioActivoState(encontrado);
        }
      }
    } catch {
      // Ignorar errores de acceso a localStorage en navegadores restrictivos
    }
  }, []);

  // Función para consultar permisos frescos del backend
  const cargarPermisosUsuario = useCallback(async (usuario: UsuarioSimulado) => {
    setCargandoPermisos(true);
    try {
      const detalle = await obtenerUsuarioActivo(usuario.id);
      setUsuarioDetalleServidor(detalle);
      if (detalle && Array.isArray(detalle.permisos)) {
        setPermisos(new Set(detalle.permisos));
      } else {
        setPermisos(obtenerPermisosFallback(usuario.rol, usuario.esAdmin));
      }
    } catch {
      // Si la API falla o está offline, aplicar fallback por rol
      setPermisos(obtenerPermisosFallback(usuario.rol, usuario.esAdmin));
    } finally {
      setCargandoPermisos(false);
    }
  }, []);

  // Cargar permisos cada vez que cambia el usuario activo
  useEffect(() => {
    cargarPermisosUsuario(usuarioActivo);
  }, [usuarioActivo, cargarPermisosUsuario]);

  const setUsuarioActivo = useCallback(
    (nuevoUsuario: UsuarioSimulado) => {
      setUsuarioActivoState(nuevoUsuario);
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
    await cargarPermisosUsuario(usuarioActivo);
  }, [cargarPermisosUsuario, usuarioActivo]);

  const hasPermission = useCallback(
    (codigo: string): boolean => {
      if (usuarioActivo.esAdmin) return true;
      return permisos.has(codigo);
    },
    [usuarioActivo.esAdmin, permisos]
  );

  const hasAnyPermission = useCallback(
    (codigos: string[]): boolean => {
      if (usuarioActivo.esAdmin) return true;
      return codigos.some((c) => permisos.has(c));
    },
    [usuarioActivo.esAdmin, permisos]
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
