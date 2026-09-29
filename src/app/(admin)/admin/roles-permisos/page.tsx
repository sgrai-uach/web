'use client';

import React from 'react';
import AccesoDenegadoState from '@/components/admin/roles-permisos/AccesoDenegadoState';
import RolDetalleDrawer from '@/components/admin/roles-permisos/RolDetalleDrawer';
import RolesFiltros from '@/components/admin/roles-permisos/RolesFiltros';
import RolesGrid from '@/components/admin/roles-permisos/RolesGrid';
import RolesHeader, {
  USUARIOS_SIMULADOS,
} from '@/components/admin/roles-permisos/RolesHeader';
import RolesSkeleton from '@/components/admin/roles-permisos/RolesSkeleton';
import { useRolesPermisos } from '@/hooks/useRolesPermisos';

export default function RolesPermisosPage() {
  const {
    usuarioActivo,
    setUsuarioActivo,
    roles,
    cargando,
    refrescando,
    errorRbac,
    rolSeleccionado,
    setRolSeleccionado,
    handleRolActualizado,
    busqueda,
    setBusqueda,
    filtroTipo,
    setFiltroTipo,
    filtroEstado,
    setFiltroEstado,
    handleRefrescarManual,
    metricas,
    busquedaActiva,
    limpiarFiltros,
  } = useRolesPermisos();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6, 24px)' }}>
      <RolesHeader
        usuarioActivo={usuarioActivo}
        onCambiarUsuario={(nuevo) => {
          setUsuarioActivo(nuevo);
          setRolSeleccionado(null);
        }}
        metricas={metricas}
      />

      {errorRbac ? (
        <AccesoDenegadoState
          rolUsuario={usuarioActivo.rol}
          onCambiarAAdmin={() => setUsuarioActivo(USUARIOS_SIMULADOS[0])}
        />
      ) : (
        <>
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

          {cargando && roles.length === 0 ? (
            <RolesSkeleton />
          ) : (
            <RolesGrid
              roles={roles}
              onSeleccionarRol={(rol) => setRolSeleccionado(rol)}
              busquedaActiva={busquedaActiva}
              onLimpiarFiltros={limpiarFiltros}
            />
          )}
        </>
      )}

      <RolDetalleDrawer
        rol={rolSeleccionado}
        usuarioId={usuarioActivo.id}
        onClose={() => setRolSeleccionado(null)}
        onRolActualizado={handleRolActualizado}
      />
    </div>
  );
}
