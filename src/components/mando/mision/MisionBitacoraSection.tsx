'use client';

import React from 'react';
import { History, Calendar, Clock } from 'lucide-react';
import Heading from '@/components/ui/Heading';
import type { MisionBitacoraHito } from '@/types/misiones';
import {
  esHitoTipologiaSinCambios,
  formatearHitoBitacora,
} from '@/lib/utils/estadoUtils';
import styles from '@/styles/mision-detalle.module.css';

interface MisionBitacoraSectionProps {
  bitacora: MisionBitacoraHito[];
}

const limpiarDescripcion = (desc?: string | null): string => {
  if (!desc) return '';
  return desc
    .replace(/\(EN_CURSO\)/gi, '(En curso)')
    .replace(/\(DESPACHADA\)/gi, '(Despachada)')
    .replace(/\(PLANIFICADA\)/gi, '(Planificada)')
    .replace(/\(COMPLETADA\)/gi, '(Completada)')
    .replace(/\(RECHAZADA\)/gi, '(Rechazada)')
    .replace(/\(CANCELADA\)/gi, '(Cancelada)')
    .replace(/\(EN_VERIFICACION\)/gi, '(En verificación)');
};

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
            {bitacora.map((hito, index) => {
              const sinCambiosTipologia = esHitoTipologiaSinCambios(hito);
              const tituloHito = sinCambiosTipologia
                ? 'Tipología constatada en terreno (sin cambios)'
                : formatearHitoBitacora(hito.hito);
              const descripcionLimpia = limpiarDescripcion(hito.descripcion);
              const descripcionFinal = sinCambiosTipologia
                ? descripcionLimpia.replace(
                    /^Tipolog[íi]a reclasificada en terreno a:/i,
                    'Tipología confirmada en terreno sin modificaciones:'
                  )
                : descripcionLimpia;

              return (
                <div
                  key={`${hito.timestamp}-${index}`}
                  className={styles.timelineItem}
                >
                  <div className={styles.timelineDot} />
                  <div className={styles.timelineHeader}>
                    <span className={styles.timelineHito}>
                      {tituloHito}
                    </span>
                    <span className={styles.timelineDate}>
                      <Calendar size={12} />
                      <span>{hito.fecha}</span>
                      <Clock size={12} style={{ marginLeft: '4px' }} />
                      <span>{hito.hora}</span>
                    </span>
                  </div>
                  <p className={styles.timelineDesc}>{descripcionFinal}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
