'use client';

import React from 'react';
import type { PermisoAsignado, PermisosPorModulo } from '@/types/api';

interface PermisosAgrupadosProps {
  permisosPorModulo: PermisosPorModulo;
}

// Colores de acento institucional para módulos conocidos
function obtenerColorModulo(modulo: string): string {
  switch (modulo.toLowerCase()) {
    case 'seguridad':
      return 'var(--color-primary-teal, #1B6F7D)';
    case 'incidentes':
      return '#0288D1';
    case 'recursos y personal':
      return '#689F38';
    case 'misiones':
      return '#E65100';
    case 'eventos atp':
      return '#7B1FA2';
    default:
      return 'var(--color-charcoal, #3B3F45)';
  }
}

export default function PermisosAgrupados({
  permisosPorModulo,
}: PermisosAgrupadosProps) {
  const modulos = Object.keys(permisosPorModulo);

  if (modulos.length === 0) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {modulos.map((modulo) => {
        const permisos = permisosPorModulo[modulo] || [];
        const colorModulo = obtenerColorModulo(modulo);

        return (
          <section
            key={modulo}
            style={{
              backgroundColor: 'var(--color-white, #FFFFFF)',
              border: '1px solid #DFE3E8',
              borderLeft: `4px solid ${colorModulo}`,
            }}
          >
            {/* Cabecera del Módulo */}
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#F8F9FA',
                borderBottom: '1px solid #DFE3E8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: colorModulo,
                    display: 'inline-block',
                  }}
                />
                <h4
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    color: 'var(--color-charcoal, #3B3F45)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Módulo: {modulo}
                </h4>
              </div>

              <span
                style={{
                  backgroundColor: '#ECEFF1',
                  color: 'var(--color-charcoal, #3B3F45)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.5rem',
                  borderRadius: 0,
                }}
              >
                {permisos.length} {permisos.length === 1 ? 'permiso' : 'permisos'}
              </span>
            </div>

            {/* Listado de Permisos en este Módulo */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {permisos.map((permiso: PermisoAsignado, idx: number) => {
                const esUltimo = idx === permisos.length - 1;

                return (
                  <div
                    key={permiso.id}
                    style={{
                      padding: '0.875rem 1rem',
                      borderBottom: esUltimo ? 'none' : '1px solid #EDF1F5',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          flexWrap: 'wrap',
                          marginBottom: '0.25rem',
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            color: 'var(--color-charcoal, #3B3F45)',
                          }}
                        >
                          {permiso.nombre}
                        </span>

                        <code
                          style={{
                            backgroundColor: '#ECEFF3',
                            color: 'var(--color-primary-teal, #1B6F7D)',
                            fontSize: '0.75rem',
                            padding: '0.15rem 0.4rem',
                            fontWeight: 600,
                            fontFamily: 'monospace',
                            border: '1px solid #CFD8DC',
                          }}
                        >
                          {permiso.codigo}
                        </code>
                      </div>

                      {permiso.descripcion && (
                        <p
                          style={{
                            fontSize: '0.8125rem',
                            color: '#555555',
                            lineHeight: '1.4',
                            margin: 0,
                          }}
                        >
                          {permiso.descripcion}
                        </p>
                      )}
                    </div>

                    {/* Placeholder interactivo preparado para HU-5 (Criterio 6) */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '0.25rem',
                      }}
                    >
                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          cursor: 'not-allowed',
                          opacity: 0.9,
                        }}
                        title="La modificación y revocación de permisos estará habilitada en HU-5"
                      >
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#2E7D32',
                          }}
                        >
                          Asignado
                        </span>
                        <input
                          type="checkbox"
                          checked={true}
                          disabled
                          readOnly
                          style={{
                            cursor: 'not-allowed',
                            width: '16px',
                            height: '16px',
                            accentColor: 'var(--color-accent-mint, #4FAE9B)',
                          }}
                          aria-label={`Permiso ${permiso.nombre} activo (modo lectura)`}
                        />
                      </label>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          color: '#888',
                          fontStyle: 'italic',
                        }}
                      >
                        (Modo lectura &bull; HU-5)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
