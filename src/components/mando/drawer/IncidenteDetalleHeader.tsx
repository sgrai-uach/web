'use client';

import React from 'react';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import { X, ShieldCheck } from 'lucide-react';
import type { IncidenteDetalle } from '@/services/incidentesService';
import styles from '@/styles/mando.module.css';

interface IncidenteDetalleHeaderProps {
  detalle: IncidenteDetalle | null;
  onCerrar: () => void;
  onAsignarPatrulla?: () => void;
}

export const IncidenteDetalleHeader: React.FC<IncidenteDetalleHeaderProps> = ({
  detalle,
  onCerrar,
  onAsignarPatrulla,
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {detalle?.estado === 'REPORTADO' && onAsignarPatrulla && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onAsignarPatrulla}
            title="Asignar patrulla verificadora"
            aria-label="Asignar patrulla verificadora al incidente"
          >
            <ShieldCheck size={15} style={{ marginRight: '4px' }} />
            <span>Asignar Patrulla</span>
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={styles.drawerCloseBtn}
          onClick={onCerrar}
          aria-label="Cerrar panel de detalle"
        >
          <X size={20} />
        </Button>
      </div>
    </div>
  );
};
