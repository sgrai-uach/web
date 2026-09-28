'use client';

import React from 'react';
import styles from '@/styles/seguimiento.module.css';
import type { EstadoIncidente } from '@/services/seguimientoService';

interface SeguimientoStepperProps {
  estado: EstadoIncidente;
}

const PASOS_ICS = [
  { id: 'REPORTADO', label: '1. Reportado' },
  { id: 'VERIFICANDO', label: '2. Verificando' },
  { id: 'EN_ATENCION', label: '3. En Atención' },
  { id: 'FINAL', label: '4. Resuelto' },
];

export const SeguimientoStepper: React.FC<SeguimientoStepperProps> = ({ estado }) => {
  const getIndiceEstado = (est: EstadoIncidente): number => {
    switch (est) {
      case 'REPORTADO':
        return 0;
      case 'VERIFICANDO':
        return 1;
      case 'EN_ATENCION':
        return 2;
      case 'RESUELTO':
      case 'NO_ABORDABLE':
        return 3;
      default:
        return 0;
    }
  };

  const indiceActual = getIndiceEstado(estado);
  const esNoAbordable = estado === 'NO_ABORDABLE';
  const esResuelto = estado === 'RESUELTO';

  return (
    <div className={styles.stepperContainer} role="region" aria-label="Progreso del incidente">
      <h3 className={styles.stepperTitle}>Progreso de la Atención (Ciclo de Vida ICS)</h3>
      <div className={styles.stepperGrid}>
        {PASOS_ICS.map((paso, index) => {
          const esCompletado = index < indiceActual || (index === 3 && esResuelto);
          const esActivo = index === indiceActual && !esResuelto && !esNoAbordable;
          const esCierreNoAbordable = index === 3 && esNoAbordable;
          const esCierreResuelto = index === 3 && esResuelto;

          let labelPaso = paso.label;
          if (index === 3) {
            if (esNoAbordable) labelPaso = '4. No Abordable';
            else labelPaso = '4. Resuelto';
          }

          let barClass = styles.stepBar;
          if (esCompletado) barClass = `${styles.stepBar} ${styles.stepBarCompleted}`;
          else if (esActivo) barClass = `${styles.stepBar} ${styles.stepBarActive}`;
          else if (esCierreNoAbordable) barClass = `${styles.stepBar} ${styles.stepBarFailed}`;

          let numberClass = styles.stepNumberPending;
          if (esCompletado || esCierreResuelto) numberClass = styles.stepNumberCompleted;
          else if (esActivo) numberClass = styles.stepNumberActive;
          else if (esCierreNoAbordable) numberClass = styles.stepNumberClosed;

          let labelClass = styles.stepLabel;
          if (esActivo) labelClass = styles.stepLabelActive;
          else if (esCompletado || esCierreResuelto || esCierreNoAbordable) labelClass = styles.stepLabelCompleted;

          return (
            <div
              key={paso.id}
              className={styles.stepItem}
              aria-current={esActivo || esCierreResuelto || esCierreNoAbordable ? 'step' : undefined}
            >
              <div className={barClass} />
              <div className={`${styles.stepNumber} ${numberClass}`}>
                {esCompletado || esCierreResuelto ? '✓' : esCierreNoAbordable ? '✕' : index + 1}
              </div>
              <span className={`${styles.stepLabel} ${labelClass}`}>{labelPaso}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
