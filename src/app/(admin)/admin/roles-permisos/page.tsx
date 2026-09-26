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
import { ToastProvider } from '@/components/ui/Toast';
import { useRolesPermisos } from '@/hooks/useRolesPermisos';

function RolesPermisosContent() {
  const {
    usuarioActivo,
    setUsuarioActivo,
    roles,
    cargando,
    refrescando,
    errorRbac,
    rolSeleccionado,
    setRolSeleccionado,
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
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-light, #ECEFF3)',
        paddingBottom: '3.5rem',
      }}
    >
      <RolesHeader
        usuarioActivo={usuarioActivo}
        onCambiarUsuario={(nuevo) => {
          setUsuarioActivo(nuevo);
          setRolSeleccionado(null);
        }}
        metricas={metricas}
      />

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem' }}>
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
      </main>

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
