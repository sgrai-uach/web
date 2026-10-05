'use client';

import React from 'react';
import { History, Calendar, Clock } from 'lucide-react';
import Heading from '@/components/ui/Heading';
import type { MisionBitacoraHito } from '@/types/misiones';
import styles from '@/styles/mision-detalle.module.css';

interface MisionBitacoraSectionProps {
  bitacora: MisionBitacoraHito[];
}

export const MisionBitacoraSection: React.FC<MisionBitacoraSectionProps> = ({ bitacora }) => {
  return (
    <div className={styles.seccionBloque}>
      <div className={styles.seccionHeader}>
        <div className={styles.seccionTituloGroup}>
          <History size={18} color="var(--color-primary-teal, #1B6F7D)" />
          <Heading as="h3" variant="h4" color="teal" noMargin>
            Bitácora Cronológica de Operaciones ({bitacora.length})
          </Heading>
        </div>
      </div>

      <div className={styles.seccionBody}>
        {bitacora.length === 0 ? (
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted, #5F676E)' }}>
            No se registran eventos en la bitácora de la misión aún.
          </p>
        ) : (
          <div className={styles.timelineList}>
            {bitacora.map((hito, index) => (
              <div key={`${hito.timestamp}-${index}`} className={styles.timelineItem}>
                <div className={styles.timelineDot} />
                <div className={styles.timelineHeader}>
                  <span className={styles.timelineHito}>{hito.hito}</span>
                  <span className={styles.timelineDate}>
                    <Calendar size={12} />
                    <span>{hito.fecha}</span>
                    <Clock size={12} style={{ marginLeft: '4px' }} />
                    <span>{hito.hora}</span>
                  </span>
                </div>
                <p className={styles.timelineDesc}>{hito.descripcion}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
