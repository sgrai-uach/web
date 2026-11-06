'use client';

import React from 'react';
import { Eye, ShieldCheck } from 'lucide-react';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import type { IncidenteDetalle } from '@/services/incidentesService';
import styles from '@/styles/mando.module.css';

interface IncidenteMisionesSectionProps {
  misiones: IncidenteDetalle['misiones'];
  incidenteEstado?: string;
  onVerDetalleMision?: (misionId: string) => void;
  onAsignarPatrulla?: () => void;
}

export const IncidenteMisionesSection: React.FC<IncidenteMisionesSectionProps> = ({
  misiones,
  incidenteEstado,
  onVerDetalleMision,
  onAsignarPatrulla,
}) => {
  return (
    <div className={styles.drawerSection}>
      <Heading as="h3" variant="h4" color="teal" style={{ marginBottom: '0.75rem' }}>
        Misiones y Equipos en Terreno ({misiones.length})
      </Heading>
      {misiones.length === 0 ? (
        incidenteEstado === 'REPORTADO' ? (
          <div
            style={{
              backgroundColor: '#F8FAFB',
              border: '1px solid var(--border-color-neutral, #DFE3E8)',
              padding: '12px 14px',
              borderRadius: 0,
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
            {onAsignarPatrulla && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={onAsignarPatrulla}
              >
                <ShieldCheck size={14} style={{ marginRight: '5px' }} />
                <span>Despachar Patrulla Verificadora</span>
              </Button>
            )}
          </div>
        ) : (
          <p style={{ color: 'var(--color-text-muted, #5F676E)', fontSize: '0.85rem', margin: 0 }}>
            No se han despachado misiones operativas para este caso.
          </p>
        )
      ) : (
        misiones.map((mision) => (
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
        ))
      )}
    </div>
  );
};
