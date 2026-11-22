'use client';

import React, { useEffect, useState } from 'react';
import { Check, Clock, Eye, ShieldCheck, Users, WifiOff, AlertTriangle, Hourglass } from 'lucide-react';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import type { IncidenteDetalle } from '@/services/incidentesService';
import type { EstadoMision } from '@/types/misiones';
import { TRAZABILIDAD_CONFIG } from '@/lib/socket/trazabilidadConfig';
import {
  getSnapshotEstadosMisiones,
  subscribeMisionesRealtime,
} from '@/lib/socket/misionesStore';
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
  onVerDetalleCuadrilla?: (cuadrillaId: string) => void;
  onAsignarPatrulla?: () => void;
  puedeAsignar?: boolean;
}

function traducirEstadoMision(estado: string): { label: string; color: string; bg: string; borderColor: string } {
  const mapa: Record<string, { label: string; color: string; bg: string; borderColor: string }> = {
    PLANIFICADA: {
      label: 'Planificada',
      color: 'var(--color-charcoal, #3B3F45)',
      bg: 'var(--color-bg-light, #ECEFF3)',
      borderColor: '#CBD5E1',
    },
    DESPACHADA: {
      label: 'Despachada',
      color: 'var(--color-primary-teal, #1B6F7D)',
      bg: 'var(--color-info-bg, #E0F2F1)',
      borderColor: 'var(--color-primary-teal, #1B6F7D)',
    },
    EN_CURSO: {
      label: 'En Curso',
      color: 'var(--color-warning, #E65100)',
      bg: 'var(--color-warning-bg, #FFF3E0)',
      borderColor: 'var(--color-warning, #E65100)',
    },
    COMPLETADA: {
      label: 'Completada',
      color: 'var(--color-success, #2E7D32)',
      bg: 'var(--color-success-bg, #E8F5E9)',
      borderColor: 'var(--color-success, #2E7D32)',
    },
    RECHAZADA: {
      label: 'Rechazada',
      color: 'var(--color-danger, #D32F2F)',
      bg: 'var(--color-danger-bg, #FFEBEE)',
      borderColor: 'var(--color-danger, #D32F2F)',
    },
    CANCELADA: {
      label: 'Cancelada',
      color: 'var(--color-text-muted, #5F676E)',
      bg: 'var(--color-bg-light, #ECEFF3)',
      borderColor: '#CBD5E1',
    },
  };
  return mapa[estado] || {
    label: estado,
    color: 'var(--color-text-dark, #2B2B2B)',
    bg: '#ECEFF3',
    borderColor: '#CBD5E1',
  };
}

function traducirTipoMision(tipo: string): string {
  const mapa: Record<string, string> = {
    VERIFICACION: 'Verificación en Terreno',
    EVALUACION_INICIAL: 'Evaluación Inicial',
    ATENCION_CUADRILLA: 'Atención de Cuadrilla',
    PREVENCION: 'Operación Preventiva',
    RECUPERACION: 'Recuperación de Infraestructura',
    ASISTENCIA_SOCIAL: 'Asistencia Social (FIBE)',
  };
  return mapa[tipo] || tipo;
}

function traducirPrioridad(prioridad: string): { label: string; color: string } {
  const mapa: Record<string, { label: string; color: string }> = {
    CRITICA: { label: 'Crítica', color: 'var(--color-danger, #D32F2F)' },
    ALTA: { label: 'Alta', color: 'var(--color-warning, #E65100)' },
    MEDIA: { label: 'Media', color: 'var(--color-primary-teal, #1B6F7D)' },
    BAJA: { label: 'Baja', color: 'var(--color-text-muted, #5F676E)' },
  };
  return mapa[prioridad] || { label: prioridad, color: 'inherit' };
}

function traducirEstadoEquipo(estado: string): string {
  const mapa: Record<string, string> = {
    DISPONIBLE: 'Disponible',
    EN_RUTA: 'En ruta',
    EN_MISION: 'En misión',
    EN_VERIFICACION: 'En verificación',
    EN_TERRENO: 'En terreno',
    OCUPADA: 'Ocupada',
    NO_DISPONIBLE: 'No disponible',
  };
  return mapa[estado] || estado;
}

export const IncidenteMisionesSection: React.FC<IncidenteMisionesSectionProps> = ({
  misiones,
  incidenteEstado,
  onVerDetalleMision,
  onVerDetalleCuadrilla,
  onAsignarPatrulla,
  puedeAsignar = true,
}) => {
  const [estadosTiempoReal, setEstadosTiempoReal] = useState<Record<string, EstadoMision>>({});

  useEffect(() => {
    let activo = true;
    queueMicrotask(() => {
      if (activo) {
        setEstadosTiempoReal(getSnapshotEstadosMisiones());
      }
    });
    const unsubscribe = subscribeMisionesRealtime(() => {
      if (activo) {
        setEstadosTiempoReal(getSnapshotEstadosMisiones());
      }
    });
    return () => {
      activo = false;
      unsubscribe();
    };
  }, []);

  const misionesConEstado = misiones.map((m) => ({
    ...m,
    estadoActual: estadosTiempoReal[m.id] ?? m.estado,
  }));

  const misionesRechazadas = misionesConEstado.filter((m) => m.estadoActual === 'RECHAZADA');
  const misionesVigentes = misionesConEstado.filter((m) => m.estadoActual !== 'RECHAZADA');
  const tieneMisionDespachada = misionesConEstado.some(
    (m) => m.estadoActual === 'DESPACHADA' || m.estadoActual === 'PLANIFICADA'
  );
  const requiereReasignacion = incidenteEstado === 'REPORTADO';

  return (
    <div className={styles.drawerSection}>
      <Heading as="h3" variant="h4" color="teal" style={{ marginBottom: '0.75rem' }}>
        Misiones y Equipos en Terreno ({misiones.length})
      </Heading>

      {/* Bloque de Despacho o Reasignación de Patrulla cuando el incidente está en estado REPORTADO */}
      {requiereReasignacion && onAsignarPatrulla && (tieneMisionDespachada || puedeAsignar) && (
        <div
          style={{
            backgroundColor: tieneMisionDespachada
              ? 'var(--color-warning-bg, #FFF3E0)'
              : misionesRechazadas.length > 0
              ? '#FFF8E1'
              : '#F8FAFB',
            border: `1px solid ${
              tieneMisionDespachada
                ? 'var(--color-warning, #E65100)'
                : misionesRechazadas.length > 0
                ? 'var(--color-warning, #E65100)'
                : 'var(--border-color-neutral, #DFE3E8)'
            }`,
            padding: '12px 14px',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
            {tieneMisionDespachada ? (
              <Hourglass size={18} color="var(--color-warning, #E65100)" style={{ flexShrink: 0, marginTop: '2px' }} />
            ) : misionesRechazadas.length > 0 ? (
              <AlertTriangle size={18} color="var(--color-warning, #E65100)" style={{ flexShrink: 0, marginTop: '2px' }} />
            ) : (
              <Clock size={18} color="var(--color-primary-teal, #1B6F7D)" style={{ flexShrink: 0, marginTop: '2px' }} />
            )}
            <p
              style={{
                color: 'var(--color-text-dark, #2B2B2B)',
                fontSize: '0.85rem',
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              {tieneMisionDespachada
                ? 'Misión despachada a patrulla verificadora. A la espera de que la unidad confirme y acepte la misión en su dispositivo para iniciar la evaluación en terreno.'
                : misionesRechazadas.length > 0
                ? 'El despacho previo fue rechazado por el equipo en terreno. El incidente se mantiene en estado Reportado y requiere una nueva asignación de patrulla verificadora.'
                : 'Este incidente está pendiente de evaluación inicial. Despache una patrulla disponible para verificar en terreno las necesidades reales.'}
            </p>
          </div>


          {tieneMisionDespachada ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled
                icon={<Hourglass size={15} strokeWidth={2.25} style={{ flexShrink: 0 }} aria-hidden="true" />}
                style={{
                  backgroundColor: 'var(--color-warning-bg, #FFF3E0)',
                  color: 'var(--color-warning, #E65100)',
                  cursor: 'not-allowed',
                  borderColor: 'var(--color-warning-border, #FFE0B2)',
                  fontWeight: 700,
                  opacity: 1,
                }}
                aria-label="Confirmación pendiente por la patrulla verificadora"
              >
                <span>Confirmación Pendiente</span>
              </Button>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted, #5F676E)' }}>
                (El incidente pasará a &quot;En Verificación&quot; cuando la patrulla acepte la asignación)
              </span>
            </div>
          ) : puedeAsignar ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onAsignarPatrulla}
              aria-label={misionesRechazadas.length > 0 ? 'Reasignar patrulla verificadora' : 'Despachar patrulla verificadora'}
            >
              <ShieldCheck size={14} style={{ marginRight: '5px' }} />
              <span>{misionesRechazadas.length > 0 ? 'Reasignar Patrulla Verificadora' : 'Despachar Patrulla Verificadora'}</span>
            </Button>
          ) : null}
        </div>
      )}

      {/* Listado de Misiones Vigentes / Activas */}
      {misionesVigentes.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
          {misionesVigentes.map((mision) => {
            const estadoBadge = traducirEstadoMision(mision.estadoActual);
            const tipoLegible = traducirTipoMision(mision.tipoMision);
            const prioridadInfo = traducirPrioridad(mision.prioridad);
            const estadoCuadrillaVisible =
              mision.cuadrilla && mision.estadoActual === 'EN_CURSO'
                ? 'EN_MISION'
                : mision.cuadrilla?.estado || '';

            return (
              <div key={mision.id} className={styles.misionCard}>
                <div className={styles.misionHeader}>
                  <span>
                    {mision.codigo}: {mision.titulo}
                  </span>
                  <span
                    style={{
                      padding: '2px 8px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: estadoBadge.bg,
                      color: estadoBadge.color,
                      border: `1px solid ${estadoBadge.borderColor}`,
                    }}
                  >
                    {estadoBadge.label}
                  </span>
                </div>

                <div style={{ fontSize: '0.8125rem', marginTop: '0.35rem', color: 'var(--color-charcoal, #3B3F45)' }}>
                  <strong>Tipo:</strong> {tipoLegible} &bull;{' '}
                  <strong>Prioridad:</strong>{' '}
                  <span style={{ color: prioridadInfo.color, fontWeight: 600 }}>{prioridadInfo.label}</span>
                </div>

                {mision.cuadrilla && (
                  <div style={{ fontSize: '0.8125rem', marginTop: '0.2rem' }}>
                    <strong>Cuadrilla:</strong> {mision.cuadrilla.nombre} ({traducirEstadoEquipo(estadoCuadrillaVisible)})
                  </div>
                )}
                {mision.patrulla && (
                  <div style={{ fontSize: '0.8125rem', marginTop: '0.2rem' }}>
                    <strong>Patrulla:</strong> {mision.patrulla.nombre} ({traducirEstadoEquipo(mision.patrulla.estado)})
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
            ['PLANIFICADA', 'DESPACHADA', 'EN_CURSO', 'EN_PROCESO'].includes(mision.estadoActual) && (
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

                <div
                  style={{
                    marginTop: '0.6rem',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '8px',
                    flexWrap: 'wrap',
                  }}
                >
                  {mision.cuadrilla &&
                    onVerDetalleCuadrilla &&
                    (mision.cuadrilla.id ||
                      (mision as unknown as { cuadrillaId?: string }).cuadrillaId) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          onVerDetalleCuadrilla(
                            mision.cuadrilla?.id ||
                              (mision as unknown as { cuadrillaId: string }).cuadrillaId
                          )
                        }
                        title={`Ver dotación, personal y equipamiento de ${mision.cuadrilla.nombre}`}
                        aria-label={`Ver ficha de la cuadrilla ${mision.cuadrilla.nombre}`}
                      >
                        <Users size={13} aria-hidden="true" style={{ marginRight: '5px' }} />
                        <span>Ver Cuadrilla</span>
                      </Button>
                    )}
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
            );
          })}
        </div>
      ) : (
        !requiereReasignacion &&
        misionesRechazadas.length === 0 && (
          <p style={{ color: 'var(--color-text-muted, #5F676E)', fontSize: '0.85rem', margin: 0 }}>
            No se han despachado misiones operativas para este caso.
          </p>
        )
      )}

      {/* Historial de Misiones y Rechazos Previos */}
      {misionesRechazadas.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '0.5rem',
              paddingBottom: '4px',
              borderBottom: '1px solid var(--border-color-neutral, #DFE3E8)',
            }}
          >
            <AlertTriangle size={15} color="var(--color-danger, #D32F2F)" />
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--color-danger, #D32F2F)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Historial de Asignaciones y Rechazos ({misionesRechazadas.length})
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {misionesRechazadas.map((mision) => {
              const tipoLegible = traducirTipoMision(mision.tipoMision);
              const prioridadInfo = traducirPrioridad(mision.prioridad);
              const nombreEquipo = mision.patrulla?.nombre
                ? mision.patrulla.nombre.toLowerCase().startsWith('patrulla')
                  ? mision.patrulla.nombre
                  : `Patrulla ${mision.patrulla.nombre}`
                : mision.cuadrilla?.nombre
                ? mision.cuadrilla.nombre.toLowerCase().startsWith('cuadrilla')
                  ? mision.cuadrilla.nombre
                  : `Cuadrilla ${mision.cuadrilla.nombre}`
                : 'Equipo en terreno';

              return (
                <div
                  key={mision.id}
                  style={{
                    backgroundColor: '#FFF5F5',
                    border: '1px solid #FEB2B2',
                    borderLeft: '4px solid var(--color-danger, #D32F2F)',
                    padding: '0.75rem',
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 700, color: '#742A2A' }}>
                      {mision.codigo}: {mision.titulo}
                    </span>
                    <span
                      style={{
                        padding: '2px 6px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: 'var(--color-danger-bg, #FFEBEE)',
                        color: 'var(--color-danger, #D32F2F)',
                        border: '1px solid var(--color-danger, #D32F2F)',
                      }}
                    >
                      Rechazada
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8125rem', color: '#4A5568', marginBottom: '0.35rem' }}>
                    <strong>Tipo:</strong> {tipoLegible} &bull; <strong>Prioridad:</strong> {prioridadInfo.label} &bull;{' '}
                    <strong>Unidad:</strong> {nombreEquipo}
                  </div>

                  {mision.justificacionRechazo && (
                    <div
                      style={{
                        backgroundColor: '#FED7D7',
                        color: '#742A2A',
                        padding: '0.5rem 0.65rem',
                        marginTop: '0.4rem',
                        fontSize: '0.8125rem',
                        borderLeft: '3px solid #E53E3E',
                      }}
                    >
                      <strong style={{ display: 'block', marginBottom: '2px' }}>Motivo del Rechazo ({nombreEquipo}):</strong>
                      <span>{mision.justificacionRechazo}</span>
                    </div>
                  )}

                  <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onVerDetalleMision?.(mision.id)}
                      title={`Ver bitácora de la misión rechazada ${mision.codigo}`}
                      aria-label={`Ver detalles de la misión ${mision.codigo}`}
                    >
                      <Eye size={13} aria-hidden="true" style={{ marginRight: '4px' }} />
                      <span>Ver Detalles</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
