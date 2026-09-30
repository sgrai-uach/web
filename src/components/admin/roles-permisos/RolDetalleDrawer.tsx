'use client';

import React, { useMemo } from 'react';
import { agruparPermisosPorModulo } from '@/services/seguridadService';
import type { RolItem } from '@/types/seguridad';
import PermisosAgrupados from './PermisosAgrupados';
import SinPermisosState from './SinPermisosState';
import RolDetalleHeader from './drawer/RolDetalleHeader';
import RolDetalleInfo from './drawer/RolDetalleInfo';
import RolDetalleFooter from './drawer/RolDetalleFooter';
import Heading from '@/components/ui/Heading';
import { useGestionPermisos } from '@/hooks/useGestionPermisos';

interface RolDetalleDrawerProps {
  rol: RolItem | null;
  usuarioId: string;
  onClose: () => void;
  onRolActualizado?: () => void;
}

export default function RolDetalleDrawer({
  rol,
  usuarioId,
  onClose,
  onRolActualizado,
}: RolDetalleDrawerProps) {
  const {
    modoEdicion,
    activarModoEdicion,
    cancelarEdicion,
    cargandoCatalogo,
    guardando,
    seleccionados,
    permisosBloqueados,
    modulosAgrupados,
    agregadosCount,
    revocadosCount,
    tieneCambios,
    togglePermiso,
    marcarModulo,
    desmarcarModulo,
    guardarCambios,
  } = useGestionPermisos({
    rol,
    usuarioId,
    onExito: onRolActualizado,
  });

  const permisosAgrupadosLectura = useMemo(() => {
    if (!rol || !rol.permisos) return {};
    return agruparPermisosPorModulo(rol.permisos);
  }, [rol]);

  if (!rol) return null;

  const tienePermisosLectura = rol.cantidadPermisos > 0 && rol.permisos.length > 0;
  const handleCerrar = () => {
    if (modoEdicion) cancelarEdicion();
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(20, 80, 90, 0.45)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'stretch',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !guardando) handleCerrar();
      }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="drawer-title"
    >
      <aside
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: '#FFFFFF',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <RolDetalleHeader
          nombre={rol.nombre}
          onClose={handleCerrar}
        />

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
            backgroundColor: 'var(--color-bg-light, #ECEFF3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <RolDetalleInfo rol={rol} />

          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.75rem',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <Heading as="h3" variant="h4" color="charcoal" noMargin>
                Matriz de Permisos ({modoEdicion ? seleccionados.size : rol.cantidadPermisos})
              </Heading>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  padding: '0.2rem 0.55rem',
                  backgroundColor: modoEdicion ? '#E0F2F1' : '#ECEFF3',
                  color: modoEdicion ? 'var(--color-primary-teal, #1B6F7D)' : 'var(--color-charcoal, #3B3F45)',
                  border: `1px solid ${modoEdicion ? '#80CBC4' : '#CFD8DC'}`,
                }}
              >
                {modoEdicion ? 'Modo Edición' : 'Modo Lectura'}
              </span>
            </div>

            {modoEdicion ? (
              cargandoCatalogo ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#5F676E' }}>
                  Cargando catálogo completo de permisos...
                </div>
              ) : (
                <PermisosAgrupados
                  permisosPorModulo={modulosAgrupados}
                  modoEdicion={true}
                  seleccionados={seleccionados}
                  permisosBloqueados={permisosBloqueados}
                  onToggle={togglePermiso}
                  onMarcarModulo={marcarModulo}
                  onDesmarcarModulo={desmarcarModulo}
                />
              )
            ) : tienePermisosLectura ? (
              <PermisosAgrupados permisosPorModulo={permisosAgrupadosLectura} />
            ) : (
              <SinPermisosState
                nombreRol={rol.nombre}
                onAsignarPermisos={activarModoEdicion}
              />
            )}
          </div>
        </div>

        <RolDetalleFooter
          onClose={handleCerrar}
          modoEdicion={modoEdicion}
          guardando={guardando}
          tieneCambios={tieneCambios}
          totalSeleccionados={seleccionados.size}
          agregadosCount={agregadosCount}
          revocadosCount={revocadosCount}
          onIniciarEdicion={activarModoEdicion}
          onCancelarEdicion={cancelarEdicion}
          onGuardarCambios={guardarCambios}
        />
      </aside>
    </div>
  );
}
