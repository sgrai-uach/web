'use client';

import React from 'react';
import { Check, Eye, ShieldCheck } from 'lucide-react';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import type { IncidenteDetalle } from '@/services/incidentesService';
import { TRAZABILIDAD_CONFIG } from '@/lib/socket/trazabilidadConfig';
import { TrazabilidadIcon } from '../TrazabilidadIcon';
import styles from '@/styles/mando.module.css';

interface IncidenteMisionesSectionProps {
  misiones: IncidenteDetalle['misiones'];
  incidenteEstado?: string;
  onVerDetalleMision?: (misionId: string) => void;
  onAsignarPatrulla?: () => void;
  puedeAsignar?: boolean;
}

export const IncidenteMisionesSection: React.FC<IncidenteMisionesSectionProps> = ({
  misiones,
  incidenteEstado,
  onVerDetalleMision,
  onAsignarPatrulla,
  puedeAsignar = true,
}) => {
  const tieneVerificacionActiva = misiones.some(
    (m) =>
      m.tipoMision === 'VERIFICACION' &&
      ['PLANIFICADA', 'DESPACHADA', 'EN_CURSO'].includes(m.estado)
  );

  const mostrarBotonDespacho =
    incidenteEstado === 'REPORTADO' &&
    !tieneVerificacionActiva &&
    Boolean(onAsignarPatrulla) &&
    puedeAsignar;

  return (
    <div className={styles.drawerSection}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <Heading as="h3" variant="h4" color="teal" noMargin>
          Misiones y Equipos en Terreno ({misiones.length})
        </Heading>
      </div>

      {mostrarBotonDespacho && (
        <div
          style={{
            backgroundColor: '#F8FAFB',
            border: '1px solid var(--border-color-neutral, #DFE3E8)',
            padding: '12px 14px',
            borderRadius: 0,
            marginBottom: misiones.length > 0 ? '1rem' : '0',
          }}
        >
          <p
            style={{
              color: 'var(--color-text-dark, #2B2B2B)',
              fontSize: '0.85rem',
              margin: '0 0 10px 0',
            }}
          >
            Este incidente está pendiente de evaluación inicial. Despache una patrulla disponible para verificar en terreno las necesidades reales.
          </p>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onAsignarPatrulla}
            title="Despachar patrulla verificadora"
          >
            <ShieldCheck size={14} style={{ marginRight: '5px' }} />
            <span>Despachar Patrulla Verificadora</span>
          </Button>
        </div>
      )}

      {misiones.length === 0 && !mostrarBotonDespacho && (
        <p style={{ color: 'var(--color-text-muted, #5F676E)', fontSize: '0.85rem', margin: 0 }}>
          No se han despachado misiones operativas para este caso.
        </p>
      )}

      {misiones.map((mision) => (
        <div key={mision.id} className={styles.misionCard}>
          <div className={styles.misionHeader}>
            <span>{mision.codigo}: {mision.titulo}</span>
            <span style={{ color: 'var(--color-primary-teal, #1B6F7D)', fontWeight: 700 }}>
              {mision.estado}
            </span>
          </div>
          <div style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>
            <strong>Tipo:</strong> {mision.tipoMision} | <strong>Prioridad:</strong> {mision.prioridad}
          </div>
          {mision.cuadrilla && (
            <div style={{ fontSize: '0.8125rem' }}>
              <strong>Cuadrilla:</strong> {mision.cuadrilla.nombre} ({mision.cuadrilla.estado})
            </div>
          )}
          {mision.patrulla && (
            <div style={{ fontSize: '0.8125rem' }}>
              <strong>Patrulla:</strong> {mision.patrulla.nombre} ({mision.patrulla.estado})
            </div>
          )}
          {mision.trazabilidadNotificacion && TRAZABILIDAD_CONFIG[mision.trazabilidadNotificacion] ? (
            (() => {
              const cfg = TRAZABILIDAD_CONFIG[mision.trazabilidadNotificacion];
              const pasos = [
                {
                  etiqueta: cfg.paso === 0 ? 'En cola offline' : 'Emitida al móvil',
                  completado: cfg.paso >= 1,
                },
                {
                  etiqueta: 'Recibida en móvil',
                  completado: cfg.paso >= 2,
                },
                {
                  etiqueta: 'Leída por operador',
                  completado: cfg.paso >= 3,
                },
              ];

              return (
                <div
                  style={{
                    marginTop: '0.5rem',
                    padding: '8px 10px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: 0,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '6px',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: cfg.color,
                      }}
                    >
                      <TrazabilidadIcon estado={mision.trazabilidadNotificacion} size={13} />
                      <span>{cfg.tituloLectura}</span>
                    </span>
                    <span
                      data-testid={`badge-trazabilidad-${mision.id}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 0,
                        backgroundColor: cfg.bg,
                        color: cfg.color,
                        border: '1px solid currentColor',
                      }}
                    >
                      {cfg.texto}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                      gap: '4px',
                      marginTop: '6px',
                    }}
                  >
                    {pasos.map((pasoItem) => (
                      <div
                        key={pasoItem.etiqueta}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 6px',
                          borderRadius: 0,
                          fontSize: '0.68rem',
                          fontWeight: pasoItem.completado ? 700 : 500,
                          backgroundColor: pasoItem.completado ? cfg.bg : '#F8FAFC',
                          color: pasoItem.completado ? cfg.color : '#5F676E',
                          border: pasoItem.completado
                            ? '1px solid currentColor'
                            : '1px solid #DFE3E8',
                        }}
                      >
                        <Check
                          size={11}
                          aria-hidden="true"
                          style={{
                            flexShrink: 0,
                            opacity: pasoItem.completado ? 1 : 0.3,
                          }}
                        />
                        <span>{pasoItem.etiqueta}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()
          ) : (
            mision.patrulla &&
            ['PLANIFICADA', 'DESPACHADA', 'EN_CURSO'].includes(mision.estado) && (
              <div
                data-testid={`aviso-trazabilidad-sin-acuse-${mision.id}`}
                style={{
                  marginTop: '0.5rem',
                  padding: '6px 10px',
                  backgroundColor: '#F8FAFC',
                  color: '#5F676E',
                  border: '1px dashed #94A3B8',
                  borderRadius: 0,
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <TrazabilidadIcon size={13} />
                <span>
                  <strong>SIN CONFIRMACIÓN DE LECTURA:</strong> Aún no se registra recepción o lectura desde la patrulla en terreno.
                </span>
              </div>
            )
          )}
          {mision.justificacionRechazo && (
            <div className={styles.misionRechazo}>
              <strong>Motivo de Rechazo por la Cuadrilla:</strong> {mision.justificacionRechazo}
            </div>
          )}

          <div style={{ marginTop: '0.6rem', display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onVerDetalleMision?.(mision.id)}
              title={`Ver detalles completos de la misión ${mision.codigo}`}
              aria-label={`Ver detalles de la misión ${mision.codigo}`}
            >
              <Eye size={13} aria-hidden="true" style={{ marginRight: '4px' }} />
              <span>Ver Detalles</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
