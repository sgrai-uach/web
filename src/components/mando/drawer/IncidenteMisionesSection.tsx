'use client';

import React from 'react';
import { Eye, ShieldCheck } from 'lucide-react';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import type { IncidenteDetalle, EstadoTrazabilidadNotificacion } from '@/services/incidentesService';
import styles from '@/styles/mando.module.css';

interface TrazabilidadBadgeConfig {
  texto: string;
  bg: string;
  color: string;
}

const TRAZABILIDAD_CONFIG: Record<EstadoTrazabilidadNotificacion, TrazabilidadBadgeConfig> = {
  PENDIENTE_ENVIO: {
    texto: 'Patrulla sin señal / offline',
    bg: '#ECEFF3',
    color: '#3B3F45',
  },
  ENVIADA: {
    texto: 'Alerta emitida al móvil',
    bg: '#FFF3E0',
    color: '#E65100',
  },
  RECIBIDA: {
    texto: 'Recibida en móvil de terreno',
    bg: '#E8F5E9',
    color: '#2E7D32',
  },
  LEIDA: {
    texto: 'Leída por operador en terreno',
    bg: '#E0F2F1',
    color: '#14505A',
  },
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
          {mision.trazabilidadNotificacion && TRAZABILIDAD_CONFIG[mision.trazabilidadNotificacion] && (
            <div style={{ marginTop: '0.35rem' }}>
              <span
                data-testid={`badge-trazabilidad-${mision.id}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 0,
                  backgroundColor: TRAZABILIDAD_CONFIG[mision.trazabilidadNotificacion].bg,
                  color: TRAZABILIDAD_CONFIG[mision.trazabilidadNotificacion].color,
                  border: '1px solid currentColor',
                }}
              >
                {TRAZABILIDAD_CONFIG[mision.trazabilidadNotificacion].texto}
              </span>
            </div>
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
