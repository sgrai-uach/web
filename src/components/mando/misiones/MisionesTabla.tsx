'use client';

import React from 'react';
import type { MisionItem } from '@/types/misiones';
import { AlertTriangle, Users, ShieldAlert } from 'lucide-react';
import Button from '@/components/ui/Button';

interface MisionesTablaProps {
  misiones: MisionItem[];
  cargando: boolean;
  hayFiltrosActivos: boolean;
  onLimpiarFiltros: () => void;
}

const BADGE_ESTADO: Record<string, { bg: string; color: string; label: string }> = {
  PLANIFICADA: { bg: 'var(--color-bg-light, #ECEFF3)', color: 'var(--color-text-dark, #2B2B2B)', label: 'Planificada' },
  DESPACHADA: { bg: 'var(--color-info-bg, #E0F2F1)', color: 'var(--color-primary-teal, #1B6F7D)', label: 'Despachada' },
  EN_CURSO: { bg: 'var(--color-warning-bg, #FFF3E0)', color: 'var(--color-warning, #E65100)', label: 'En Curso' },
  COMPLETADA: { bg: 'var(--color-success-bg, #E8F5E9)', color: 'var(--color-success, #2E7D32)', label: 'Completada' },
  CANCELADA: { bg: 'var(--color-bg-light, #ECEFF3)', color: 'var(--color-text-muted, #5F676E)', label: 'Cancelada' },
  RECHAZADA: { bg: 'var(--color-danger-bg, #FFEBEE)', color: 'var(--color-danger, #D32F2F)', label: 'Rechazada' },
};

const BADGE_PRIORIDAD: Record<string, { color: string; label: string }> = {
  CRITICA: { color: 'var(--color-danger, #D32F2F)', label: 'Crítica' },
  ALTA: { color: 'var(--color-warning, #E65100)', label: 'Alta' },
  MEDIA: { color: 'var(--color-primary-teal, #1B6F7D)', label: 'Media' },
  BAJA: { color: 'var(--color-text-muted, #5F676E)', label: 'Baja' },
};

export const MisionesTabla: React.FC<MisionesTablaProps> = ({
  misiones,
  cargando,
  hayFiltrosActivos,
  onLimpiarFiltros,
}) => {
  if (cargando) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted, #5F676E)' }}>
        Cargando listado de misiones operativas...
      </div>
    );
  }

  if (misiones.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          backgroundColor: 'var(--color-white, #FFFFFF)',
          border: '1px solid var(--border-color-neutral, #DFE3E8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div style={{ color: 'var(--color-text-muted, #5F676E)' }}>
          {hayFiltrosActivos
            ? 'No se encontraron misiones operativas coincidentes con los filtros aplicados.'
            : 'No existen misiones operativas registradas en el sistema actualmente.'}
        </div>
        {hayFiltrosActivos && (
          <Button type="button" variant="ghost" size="sm" onClick={onLimpiarFiltros}>
            Limpiar filtros aplicados
          </Button>
        )}
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', border: '1px solid var(--border-color-neutral, #DFE3E8)', backgroundColor: '#FFFFFF' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
        <thead>
          <tr
            style={{
              backgroundColor: 'var(--color-bg-light, #ECEFF3)',
              borderBottom: '2px solid var(--border-color-neutral-dark, #CCD2D9)',
              color: 'var(--color-charcoal, #3B3F45)',
            }}
          >
            <th style={{ padding: '10px 12px', fontWeight: 700 }}>Código</th>
            <th style={{ padding: '10px 12px', fontWeight: 700 }}>Misión y Detalle</th>
            <th style={{ padding: '10px 12px', fontWeight: 700 }}>Tipo</th>
            <th style={{ padding: '10px 12px', fontWeight: 700 }}>Prioridad</th>
            <th style={{ padding: '10px 12px', fontWeight: 700 }}>Delegación</th>
            <th style={{ padding: '10px 12px', fontWeight: 700 }}>Equipo Asignado</th>
            <th style={{ padding: '10px 12px', fontWeight: 700 }}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {misiones.map((mision) => {
            const badge = BADGE_ESTADO[mision.estado] || {
              bg: 'var(--color-bg-light, #ECEFF3)',
              color: 'var(--color-text-dark, #2B2B2B)',
              label: mision.estado,
            };
            const prioridadInfo = BADGE_PRIORIDAD[mision.prioridad] || {
              color: 'var(--color-text-muted, #5F676E)',
              label: mision.prioridad,
            };

            return (
              <tr
                key={mision.id}
                style={{
                  borderBottom: '1px solid var(--border-color-neutral, #DFE3E8)',
                  transition: 'background-color 0.15s ease',
                }}
              >
                {/* Código */}
                <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--color-primary-teal, #1B6F7D)', whiteSpace: 'nowrap' }}>
                  {mision.codigo}
                </td>

                {/* Título y descripción */}
                <td style={{ padding: '10px 12px', maxWidth: '320px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-dark, #2B2B2B)', marginBottom: '2px' }}>
                    {mision.titulo}
                  </div>
                  {mision.descripcion && (
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #5F676E)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {mision.descripcion}
                    </div>
                  )}
                  {mision.incidenteCodigo && (
                    <div style={{ fontSize: '11px', color: 'var(--color-primary-teal-dark, #14505A)', marginTop: '2px' }}>
                      Incidente: <strong>{mision.incidenteCodigo}</strong>
                    </div>
                  )}
                </td>

                {/* Tipo de Misión */}
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 6px',
                      backgroundColor: 'var(--color-bg-light, #ECEFF3)',
                      border: '1px solid var(--border-color-neutral-dark, #CCD2D9)',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: 0,
                    }}
                  >
                    {mision.tipoMision.replace('_', ' ')}
                  </span>
                </td>

                {/* Prioridad */}
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                  <span style={{ fontWeight: 700, color: prioridadInfo.color, fontSize: '12px' }}>
                    ● {prioridadInfo.label}
                  </span>
                </td>

                {/* Delegación Territorial */}
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', fontWeight: 600, color: 'var(--color-primary-teal, #1B6F7D)' }}>
                  {mision.delegacionNombre || 'Sin asignar'}
                </td>

                {/* Equipo asignado */}
                <td style={{ padding: '10px 12px', fontSize: '12px' }}>
                  {mision.cuadrillaNombre && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={12} color="var(--color-primary-teal, #1B6F7D)" />
                      <span>{mision.cuadrillaNombre}</span>
                    </div>
                  )}
                  {mision.patrullaNombre && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldAlert size={12} color="var(--color-primary-teal, #1B6F7D)" />
                      <span>{mision.patrullaNombre}</span>
                    </div>
                  )}
                  {!mision.cuadrillaNombre && !mision.patrullaNombre && (
                    <span style={{ color: 'var(--color-text-muted, #5F676E)' }}>Sin personal asignado</span>
                  )}
                </td>

                {/* Estado y justificación de rechazo */}
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '3px 8px',
                      backgroundColor: badge.bg,
                      color: badge.color,
                      fontSize: '11px',
                      fontWeight: 700,
                      borderRadius: 0,
                      border: `1px solid ${badge.color}`,
                    }}
                  >
                    {badge.label}
                  </span>

                  {mision.estado === 'RECHAZADA' && mision.justificacionRechazo && (
                    <div
                      style={{
                        marginTop: '4px',
                        padding: '4px 6px',
                        backgroundColor: 'var(--color-danger-bg, #FFEBEE)',
                        borderLeft: '2px solid var(--color-danger, #D32F2F)',
                        fontSize: '11px',
                        color: 'var(--color-danger, #D32F2F)',
                        maxWidth: '220px',
                        whiteSpace: 'normal',
                      }}
                      title={mision.justificacionRechazo}
                    >
                      <AlertTriangle size={11} style={{ display: 'inline', marginRight: '3px' }} />
                      <strong>Rechazo:</strong> {mision.justificacionRechazo}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MisionesTabla;
