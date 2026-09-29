'use client';

import React from 'react';
import { Phone, HardHat, Check } from 'lucide-react';
import type { OrigenReporte } from '@/types/incidente-manual';
import styles from './OrigenSelector.module.css';

interface OrigenSelectorProps {
  origenReporte: OrigenReporte;
  onSelect: (origen: OrigenReporte) => void;
}

export default function OrigenSelector({
  origenReporte,
  onSelect,
}: OrigenSelectorProps) {
  const isLlamada = origenReporte === 'LLAMADA_TELEFONICA';
  const isFuncionario = origenReporte === 'FUNCIONARIO_TERRENO';

  return (
    <div
      role="radiogroup"
      aria-labelledby="origen-reporte-label"
      className={styles.container}
    >
      <label id="origen-reporte-label" className={styles.label}>
        1. Origen del Reporte *
      </label>
      <div className={styles.grid}>
        <button
          type="button"
          role="radio"
          aria-checked={isLlamada}
          className={`${styles.radioOption} ${isLlamada ? styles.radioOptionActive : ''}`}
          onClick={() => onSelect('LLAMADA_TELEFONICA')}
        >
          <div className={styles.contentWrapper}>
            <Phone size={24} aria-hidden="true" className={styles.icon} />
            <div className={styles.textGroup}>
              <div className={styles.title}>Llamada Telefónica</div>
              <div className={styles.subtitle}>Informante vía Call Center 1451</div>
            </div>
          </div>
          <div className={styles.indicatorWrapper} aria-hidden="true">
            {isLlamada ? (
              <span className={styles.indicatorChecked}>
                <Check size={14} strokeWidth={3} />
              </span>
            ) : (
              <span className={styles.indicatorUnchecked} />
            )}
          </div>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={isFuncionario}
          className={`${styles.radioOption} ${isFuncionario ? styles.radioOptionActive : ''}`}
          onClick={() => onSelect('FUNCIONARIO_TERRENO')}
        >
          <div className={styles.contentWrapper}>
            <HardHat size={24} aria-hidden="true" className={styles.icon} />
            <div className={styles.textGroup}>
              <div className={styles.title}>Funcionario en Terreno</div>
              <div className={styles.subtitle}>Aviso por patrullero o cuadrilla municipal</div>
            </div>
          </div>
          <div className={styles.indicatorWrapper} aria-hidden="true">
            {isFuncionario ? (
              <span className={styles.indicatorChecked}>
                <Check size={14} strokeWidth={3} />
              </span>
            ) : (
              <span className={styles.indicatorUnchecked} />
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
