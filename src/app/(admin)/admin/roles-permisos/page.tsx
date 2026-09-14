'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AccesoDenegadoState from '@/components/admin/roles-permisos/AccesoDenegadoState';
import RolDetalleDrawer from '@/components/admin/roles-permisos/RolDetalleDrawer';
import RolesFiltros, {
  FiltroEstadoPermisos,
  FiltroTipoRol,
} from '@/components/admin/roles-permisos/RolesFiltros';
import RolesGrid from '@/components/admin/roles-permisos/RolesGrid';
import RolesHeader, {
  MetricasRoles,
  USUARIOS_SIMULADOS,
  UsuarioSimulado,
} from '@/components/admin/roles-permisos/RolesHeader';
import RolesSkeleton from '@/components/admin/roles-permisos/RolesSkeleton';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { ApiError, listarRolesYPermisos } from '@/lib/api/seguridad';
import type { RolItem } from '@/types/api';

function RolesPermisosContent() {
  const { showError, showSuccess } = useToast();

  // Usuario simulado para pruebas RBAC (Criterio 3)
  const [usuarioActivo, setUsuarioActivo] = useState<UsuarioSimulado>(
    USUARIOS_SIMULADOS[0]
  );

  // Estados de datos
  const [roles, setRoles] = useState<RolItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [errorRbac, setErrorRbac] = useState(false);

  // Rol seleccionado para el panel drawer
  const [rolSeleccionado, setRolSeleccionado] = useState<RolItem | null>(null);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipoRol>('TODOS');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstadoPermisos>('TODOS');

  // Función para recargar roles manualmente o tras cambiar usuario
  const cargarRoles = useCallback(
    async (usuarioId: string, silent = false) => {
      if (!silent) setCargando(true);
      try {
        const respuesta = await listarRolesYPermisos(usuarioId);
        setRoles(respuesta.data || []);
        setErrorRbac(false);
        if (silent) {
          showSuccess('Listado de perfiles actualizado', 'Sincronizado');
        }
      } catch (err: unknown) {
        if (err instanceof ApiError && err.isForbidden) {
          setErrorRbac(true);
          setRoles([]);
        } else {
          showError(
            err instanceof ApiError ? err.message : 'Error de comunicación con el servidor',
            'Error al cargar perfiles'
          );
        }
      } finally {
        if (!silent) setCargando(false);
      }
    },
    [showError, showSuccess]
  );

  // Carga inicial y ante cambio de usuario activo
  useEffect(() => {
    let activo = true;

    async function fetchData() {
      try {
        const respuesta = await listarRolesYPermisos(usuarioActivo.id);
        if (activo) {
          setRoles(respuesta.data || []);
          setErrorRbac(false);
          setCargando(false);
        }
      } catch (err: unknown) {
        if (activo) {
          if (err instanceof ApiError && err.isForbidden) {
            setErrorRbac(true);
            setRoles([]);
          } else {
            showError(
              err instanceof ApiError ? err.message : 'Error de comunicación con el servidor',
              'Error al cargar perfiles'
            );
          }
          setCargando(false);
        }
      }
    }

    fetchData();

    return () => {
      activo = false;
    };
  }, [usuarioActivo.id, showError]);

  // Handler de refresco manual
  const handleRefrescarManual = useCallback(async () => {
    setRefrescando(true);
    await cargarRoles(usuarioActivo.id, true);
    setRefrescando(false);
  }, [cargarRoles, usuarioActivo.id]);

  // Cálculo de KPIs y métricas del sistema
  const metricas = useMemo<MetricasRoles>(() => {
    const codigosUnicos = new Set<string>();
    let perfilesSistema = 0;
    let perfilesConPermisos = 0;
    let perfilesSinPermisos = 0;

    roles.forEach((r) => {
      if (r.esSistema) perfilesSistema += 1;
      if (r.cantidadPermisos > 0) {
        perfilesConPermisos += 1;
      } else {
        perfilesSinPermisos += 1;
      }

      if (r.permisos && r.permisos.length > 0) {
        r.permisos.forEach((p) => {
          if (p.codigo) codigosUnicos.add(p.codigo);
        });
      }
    });

    return {
      totalPerfiles: roles.length,
      perfilesSistema,
      perfilesConPermisos,
      perfilesSinPermisos,
      totalPermisosUnicos: codigosUnicos.size,
    };
  }, [roles]);

  // Filtrado de roles
  const rolesFiltrados = useMemo(() => {
    return roles.filter((rol) => {
      // Filtro texto
      if (busqueda.trim()) {
        const query = busqueda.toLowerCase().trim();
        const coincideNombre = rol.nombre.toLowerCase().includes(query);
        const coincideDesc = rol.descripcion?.toLowerCase().includes(query) || false;
        const coincideModulo = rol.permisos?.some((p) =>
          p.modulo.toLowerCase().includes(query)
        );
        const coincidePermiso = rol.permisos?.some((p) =>
          p.nombre.toLowerCase().includes(query) || p.codigo.toLowerCase().includes(query)
        );

        if (!coincideNombre && !coincideDesc && !coincideModulo && !coincidePermiso) {
          return false;
        }
      }

      // Filtro Tipo
      if (filtroTipo === 'SISTEMA' && !rol.esSistema) return false;
      if (filtroTipo === 'PERSONALIZADO' && rol.esSistema) return false;

      // Filtro Permisos
      if (filtroEstado === 'CON_PERMISOS' && rol.cantidadPermisos === 0) return false;
      if (filtroEstado === 'SIN_PERMISOS' && rol.cantidadPermisos > 0) return false;

      return true;
    });
  }, [roles, busqueda, filtroTipo, filtroEstado]);

  const busquedaActiva =
    Boolean(busqueda.trim()) || filtroTipo !== 'TODOS' || filtroEstado !== 'TODOS';

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroTipo('TODOS');
    setFiltroEstado('TODOS');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-light, #ECEFF3)',
        paddingBottom: '3.5rem',
      }}
    >
      {/* Cabecera y KPIs Institucionales */}
      <RolesHeader
        usuarioActivo={usuarioActivo}
        onCambiarUsuario={(nuevo) => {
          setUsuarioActivo(nuevo);
          setRolSeleccionado(null);
        }}
        metricas={metricas}
      />

      {/* Contenedor central */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem' }}>
        {errorRbac ? (
          /* Estado 403 Forbidden (Criterio 3) */
          <AccesoDenegadoState
            rolUsuario={usuarioActivo.rol}
            onCambiarAAdmin={() => setUsuarioActivo(USUARIOS_SIMULADOS[0])}
          />
        ) : (
          <>
            {/* Filtros y Buscador predictivo */}
            <RolesFiltros
              busqueda={busqueda}
              onBusquedaChange={setBusqueda}
              filtroTipo={filtroTipo}
              onFiltroTipoChange={setFiltroTipo}
              filtroEstado={filtroEstado}
              onFiltroEstadoChange={setFiltroEstado}
              onRefrescar={handleRefrescarManual}
              cargando={refrescando}
            />

            {/* Grilla o Skeleton Loader */}
            {cargando && roles.length === 0 ? (
              <RolesSkeleton />
            ) : (
              <RolesGrid
                roles={rolesFiltrados}
                onSeleccionarRol={(rol) => setRolSeleccionado(rol)}
                busquedaActiva={busquedaActiva}
                onLimpiarFiltros={limpiarFiltros}
              />
            )}
          </>
        )}
      </main>

      {/* Panel Lateral Drawer con Permisos Agrupados (Criterio 2) */}
      <RolDetalleDrawer
        rol={rolSeleccionado}
        onClose={() => setRolSeleccionado(null)}
      />
    </div>
  );
}

export default function RolesPermisosPage() {
  return (
    <ToastProvider>
      <RolesPermisosContent />
    </ToastProvider>
  );
}
