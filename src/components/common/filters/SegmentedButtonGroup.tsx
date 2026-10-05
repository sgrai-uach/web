'use client';

import React from 'react';
import styles from './FilterComponents.module.css';

export interface SegmentedOption<T extends string = string> {
  valor: T;
  etiqueta: string;
  contador?: number;
}

interface SegmentedButtonGroupProps<T extends string = string> {
  label?: string;
  options: readonly SegmentedOption<T>[] | SegmentedOption<T>[];
  value: T;
  onChange: (nuevoValor: T) => void;
  id?: string;
  ariaLabel?: string;
}

export function SegmentedButtonGroup<T extends string = string>({
  label,
  options,
  value,
  onChange,
  id,
  ariaLabel,
}: SegmentedButtonGroupProps<T>) {
  return (
    <div className={styles.segmentedGroupContainer}>
      {label && (
        <span id={id ? `${id}-label` : undefined} className={styles.filterLabel}>
          {label}
        </span>
      )}
      <div
        id={id}
        role="group"
        aria-label={ariaLabel || label}
        aria-labelledby={id && label ? `${id}-label` : undefined}
        className={styles.segmentedButtons}
      >
        {options.map((opt) => {
          const activo = value === opt.valor;
          return (
            <button
              key={opt.valor}
              type="button"
              className={`${styles.segmentedBtn} ${activo ? styles.segmentedBtnActive : ''}`}
              aria-pressed={activo}
              onClick={() => onChange(opt.valor)}
            >
              <span>{opt.etiqueta}</span>
              {typeof opt.contador === 'number' && (
                <span className={`${styles.segmentedCounter} ${activo ? styles.segmentedCounterActive : ''}`}>
                  {opt.contador}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SegmentedButtonGroup;
