'use client';

import React from 'react';
import { Check, Clock, Eye, ShieldCheck, WifiOff } from 'lucide-react';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import type { IncidenteDetalle } from '@/services/incidentesService';
import { TRAZABILIDAD_CONFIG } from '@/lib/socket/trazabilidadConfig';
import { TrazabilidadIcon } from '../TrazabilidadIcon';
import styles from '@/styles/mando.module.css';

const obtenerBordeSegmento = (
  completado: boolean,
  enEspera: boolean,
  colorActivo: string
): string => {
  if (completado) {
    return `2px solid ${colorActivo}`;
  }
  if (enEspera) {
    return '2px dashed #94A3B8';
  }
  return '2px dashed #CBD5E1';
};

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
                  numero: 1,
                  etiqueta: cfg.paso === 0 ? 'Sin señal (en cola)' : 'Emitida al móvil',
                  subEstado: cfg.paso === 0 ? 'En espera de red' : 'Confirmado',
                  completado: cfg.paso >= 1,
                  esActual: cfg.paso === 0,
                },
                {
                  numero: 2,
                  etiqueta: 'Recibida en móvil',
                  subEstado:
                    cfg.paso >= 2
                      ? 'Confirmado'
                      : cfg.paso === 1
                        ? 'Esperando acuse'
                        : 'Pendiente',
                  completado: cfg.paso >= 2,
                  esActual: cfg.paso === 1,
                },
                {
                  numero: 3,
                  etiqueta: 'Leída por operador',
                  subEstado:
                    cfg.paso >= 3
                      ? 'Confirmado'
                      : cfg.paso === 2
                        ? 'Esperando lectura'
                        : 'Pendiente',
                  completado: cfg.paso >= 3,
                  esActual: cfg.paso === 2,
                },
              ];

              return (
                <div
                  style={{
                    marginTop: '0.5rem',
                    padding: '10px 12px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: 0,
                    width: '100%',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
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
                        minWidth: 0,
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word',
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
                    data-testid={`timeline-trazabilidad-${mision.id}`}
                    role="list"
                    aria-label="Línea de tiempo de trazabilidad de la notificación"
                    className={styles.trazabilidadTimeline}
                  >
                    {pasos.map((pasoItem, idx) => {
                      const bordeIzq =
                        idx === 0
                          ? '2px solid transparent'
                          : obtenerBordeSegmento(
                              pasoItem.completado,
                              pasoItem.esActual,
                              cfg.color
                            );
                      const siguientePaso = pasos[idx + 1];
                      const bordeDer = !siguientePaso
                        ? '2px solid transparent'
                        : obtenerBordeSegmento(
                            siguientePaso.completado,
                            siguientePaso.esActual,
                            cfg.color
                          );

                      return (
                        <div
                          key={pasoItem.numero}
                          role="listitem"
                          data-testid={`timeline-step-${mision.id}-${pasoItem.numero}`}
                          data-estado={
                            pasoItem.completado
                              ? 'completado'
                              : pasoItem.esActual
                                ? 'actual'
                                : 'pendiente'
                          }
                          className={styles.trazabilidadStep}
                        >
                          <div className={styles.trazabilidadTrack}>
                            <span
                              aria-hidden="true"
                              className={styles.trazabilidadLineSegment}
                              style={{ borderTop: bordeIzq }}
                            />
                            <span
                              aria-hidden="true"
                              className={styles.trazabilidadNode}
                              style={{
                                borderRadius: 0,
                                backgroundColor: pasoItem.completado
                                  ? cfg.color
                                  : pasoItem.esActual
                                    ? cfg.bg
                                    : '#FFFFFF',
                                color: pasoItem.completado
                                  ? '#FFFFFF'
                                  : pasoItem.esActual
                                    ? cfg.color
                                    : '#94A3B8',
                                border:
                                  pasoItem.completado || pasoItem.esActual
                                    ? `2px solid ${cfg.color}`
                                    : '2px solid #CBD5E1',
                              }}
                            >
                              {pasoItem.completado ? (
                                <Check size={12} strokeWidth={2.75} aria-hidden="true" />
                              ) : pasoItem.esActual ? (
                                cfg.paso === 0 && idx === 0 ? (
                                  <WifiOff size={11} aria-hidden="true" />
                                ) : (
                                  <Clock size={11} aria-hidden="true" />
                                )
                              ) : (
                                <span>{pasoItem.numero}</span>
                              )}
                            </span>
                            <span
                              aria-hidden="true"
                              className={styles.trazabilidadLineSegment}
                              style={{ borderTop: bordeDer }}
                            />
                          </div>

                          <div className={styles.trazabilidadStepTextWrap}>
                            <span
                              className={styles.trazabilidadStepLabel}
                              style={{
                                fontWeight: pasoItem.completado || pasoItem.esActual ? 700 : 500,
                                color: pasoItem.completado
                                  ? cfg.color
                                  : pasoItem.esActual
                                    ? '#24272B'
                                    : '#5F676E',
                              }}
                            >
                              {pasoItem.etiqueta}
                            </span>
                            <span
                              className={styles.trazabilidadStepMeta}
                              style={{
                                fontWeight: pasoItem.esActual ? 600 : 500,
                                color: pasoItem.completado ? cfg.color : '#5F676E',
                              }}
                            >
                              {pasoItem.subEstado}
                            </span>
                          </div>
                        </div>
                      );
                    })}
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
                  alignItems: 'flex-start',
                  gap: '6px',
                  boxSizing: 'border-box',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
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
