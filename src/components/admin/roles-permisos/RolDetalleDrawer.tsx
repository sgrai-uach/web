'use client';

import React, { useMemo } from 'react';
import { agruparPermisosPorModulo } from '@/services/seguridadService';
import type { RolItem } from '@/types/seguridad';
import PermisosAgrupados from './PermisosAgrupados';
import SinPermisosState from './SinPermisosState';
import RolDetalleHeader from './drawer/RolDetalleHeader';
import RolDetalleInfo from './drawer/RolDetalleInfo';
import RolDetalleFooter from './drawer/RolDetalleFooter';

interface RolDetalleDrawerProps {
  rol: RolItem | null;
  onClose: () => void;
}

export default function RolDetalleDrawer({ rol, onClose }: RolDetalleDrawerProps) {
  const permisosAgrupados = useMemo(() => {
    if (!rol || !rol.permisos) return {};
    return agruparPermisosPorModulo(rol.permisos);
  }, [rol]);

  if (!rol) return null;

  const tienePermisos = rol.cantidadPermisos > 0 && rol.permisos.length > 0;

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
        if (e.target === e.currentTarget) onClose();
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
          boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <RolDetalleHeader nombre={rol.nombre} onClose={onClose} />

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
              }}
            >
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: 'var(--color-charcoal, #3B3F45)',
                  margin: 0,
                }}
              >
                Matriz de Permisos ({rol.cantidadPermisos})
              </h3>
              {tienePermisos && (
                <span style={{ fontSize: '0.75rem', color: '#666' }}>
                  Agrupados por módulo funcional
                </span>
              )}
            </div>

            {tienePermisos ? (
              <PermisosAgrupados permisosPorModulo={permisosAgrupados} />
            ) : (
              <SinPermisosState nombreRol={rol.nombre} />
            )}
          </div>
        </div>

        <RolDetalleFooter onClose={onClose} />
      </aside>
    </div>
  );
}
