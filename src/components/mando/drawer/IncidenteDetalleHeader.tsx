'use client';

import React from 'react';
import Heading from '@/components/ui/Heading';
import { X } from 'lucide-react';
import type { IncidenteDetalle } from '@/services/incidentesService';
import styles from '@/styles/mando.module.css';

interface IncidenteDetalleHeaderProps {
  detalle: IncidenteDetalle | null;
  onCerrar: () => void;
}

export const IncidenteDetalleHeader: React.FC<IncidenteDetalleHeaderProps> = ({
  detalle,
  onCerrar,
}) => {
  return (
    <div className={styles.drawerHeader}>
      <div className={styles.drawerHeaderInfo}>
        <Heading as="h2" variant="h3" color="teal-dark" noMargin>
          {detalle ? detalle.codigo : 'Cargando caso...'}
        </Heading>
        {detalle && (
          <div className={styles.drawerBadgesRow}>
            <span className={styles.badgePrioridad} style={{ backgroundColor: 'var(--color-primary-teal-dark, #14505A)' }}>
              Estado: {detalle.estado}
            </span>
            <span className={styles.badgePrioridad} style={{ backgroundColor: 'var(--color-primary-teal, #1B6F7D)' }}>
              Prioridad: {detalle.prioridad}
            </span>
            {detalle.requiereAsistenciaSocial && (
              <span className={styles.tagAsistenciaSocial}>
                FIBE Requerida
              </span>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        className={styles.drawerCloseBtn}
        onClick={onCerrar}
        aria-label="Cerrar panel de detalle"
      >
        <X size={20} />
      </button>
    </div>
  );
};
