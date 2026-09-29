'use client';

import React from 'react';
import Heading from '@/components/ui/Heading';
import type { IncidenteDetalle } from '@/services/incidentesService';
import styles from '@/styles/mando.module.css';

interface IncidenteMisionesSectionProps {
  misiones: IncidenteDetalle['misiones'];
}

export const IncidenteMisionesSection: React.FC<IncidenteMisionesSectionProps> = ({ misiones }) => {
  return (
    <div className={styles.drawerSection}>
      <Heading as="h3" variant="h4" color="teal" style={{ marginBottom: '0.75rem' }}>
        Misiones y Equipos en Terreno ({misiones.length})
      </Heading>
      {misiones.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted, #5F676E)', fontSize: '0.85rem', margin: 0 }}>
          No se han despachado misiones operativas para este caso.
        </p>
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
          </div>
        ))
      )}
    </div>
  );
};
