'use client';

import React, { useMemo } from 'react';
import { agruparPermisosPorModulo } from '@/lib/api/seguridad';
import type { RolItem } from '@/types/api';
import PermisosAgrupados from './PermisosAgrupados';
import SinPermisosState from './SinPermisosState';

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

  function formatearFecha(fechaIso?: string) {
    if (!fechaIso) return 'N/A';
    try {
      return new Intl.DateTimeFormat('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(fechaIso));
    } catch {
      return fechaIso;
    }
  }

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
      {/* Panel lateral deslizante con bordes rectos institucionales */}
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
          animation: 'slideInRight 0.2s ease-out',
        }}
      >
        {/* Cabecera del Panel */}
        <header
          style={{
            backgroundColor: 'var(--color-primary-teal-dark, #14505A)',
            color: '#FFFFFF',
            padding: '1.25rem 1.5rem',
            borderBottom: '3px solid var(--color-accent-mint, #4FAE9B)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                opacity: 0.85,
                marginBottom: '0.2rem',
              }}
            >
              Auditoría y Gestión de Perfil
            </div>
            <h2
              id="drawer-title"
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                letterSpacing: '-0.2px',
                margin: 0,
              }}
            >
              {rol.nombre}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '1.75rem',
              lineHeight: 1,
              cursor: 'pointer',
              padding: '0.25rem',
              opacity: 0.85,
              transition: 'opacity 0.15s ease',
            }}
            title="Cerrar panel de detalle"
            aria-label="Cerrar panel"
          >
            &times;
          </button>
        </header>

        {/* Contenido con scroll independiente */}
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
          {/* Tarjeta de Metadatos del Perfil */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #DFE3E8',
              padding: '1.25rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginBottom: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    backgroundColor: rol.esSistema ? '#ECEFF1' : '#E8F5E9',
                    color: rol.esSistema ? 'var(--color-charcoal, #3B3F45)' : '#2E7D32',
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '0.25rem 0.55rem',
                    border: `1px solid ${rol.esSistema ? '#CFD8DC' : '#A5D6A7'}`,
                  }}
                >
                  {rol.esSistema ? 'Perfil del Sistema' : 'Perfil Personalizado'}
                </span>

                <span
                  style={{
                    backgroundColor: rol.activo ? '#E8F5E9' : '#FFEBEE',
                    color: rol.activo ? '#2E7D32' : '#C62828',
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '0.25rem 0.55rem',
                    border: `1px solid ${rol.activo ? '#A5D6A7' : '#FFCDD2'}`,
                  }}
                >
                  {rol.activo ? 'Estado Activo' : 'Inactivo'}
                </span>
              </div>

              <span
                style={{
                  fontSize: '0.75rem',
                  color: '#777',
                  fontFamily: 'monospace',
                }}
              >
                ID: {rol.id.substring(0, 8)}...
              </span>
            </div>

            <p
              style={{
                fontSize: '0.875rem',
                color: '#444',
                lineHeight: '1.5',
                marginBottom: '1rem',
              }}
            >
              {rol.descripcion || 'Sin descripción detallada registrada para este perfil.'}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.75rem',
                backgroundColor: '#F8F9FA',
                padding: '0.75rem',
                border: '1px solid #EDF1F5',
                fontSize: '0.75rem',
              }}
            >
              <div>
                <span style={{ color: '#777', display: 'block' }}>Permisos asignados:</span>
                <strong style={{ fontSize: '0.875rem', color: 'var(--color-primary-teal, #1B6F7D)' }}>
                  {rol.cantidadPermisos} {rol.cantidadPermisos === 1 ? 'permiso' : 'permisos'}
                </strong>
              </div>

              <div>
                <span style={{ color: '#777', display: 'block' }}>Última actualización:</span>
                <strong style={{ fontSize: '0.8125rem', color: '#333' }}>
                  {formatearFecha(rol.actualizadoEn)}
                </strong>
              </div>
            </div>
          </div>

          {/* Sección de Permisos Agrupados por Módulo o Estado Vacío */}
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

        {/* Pie del Panel con Botones de Acción (Preparación para HU-5) */}
        <footer
          style={{
            padding: '1rem 1.5rem',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #DFE3E8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Botón preparado para HU-5 (Criterio 6) */}
          <button
            type="button"
            disabled
            style={{
              backgroundColor: '#ECEFF1',
              color: '#90A4AE',
              border: '1px solid #CFD8DC',
              borderRadius: 0,
              padding: '0.625rem 1rem',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'not-allowed',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
            title="Próximamente en HU-5: Asignación y revocación de permisos"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Modificar Permisos (HU-5)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: 'var(--color-charcoal, #3B3F45)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 0,
              padding: '0.625rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            Cerrar Detalle
          </button>
        </footer>
      </aside>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
