'use client';

import React from 'react';
import { Filter, FilterX, X } from 'lucide-react';
import styles from './FilterComponents.module.css';

export interface ActiveChipItem {
  id: string;
  etiqueta: string;
  valorVisible: string;
  onRemove: () => void;
  esDelegacion?: boolean;
}

interface ActiveFilterChipsProps {
  chips: ActiveChipItem[];
  onClearAll: () => void;
  clearAllText?: string;
}

export function ActiveFilterChips({
  chips,
  onClearAll,
  clearAllText = 'Limpiar todos los filtros',
}: ActiveFilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className={styles.activeChipsRow} data-testid="active-filter-chips">
      <div className={styles.chipsList}>
        <span className={styles.chipsHeader}>
          <Filter size={13} aria-hidden="true" />
          Filtros activos:
        </span>

        {chips.map((chip) => (
          <span
            key={chip.id}
            className={`${styles.chipTag} ${chip.esDelegacion ? styles.chipTagDelegacion : ''}`}
          >
            <span>
              {chip.etiqueta}: <strong>{chip.valorVisible}</strong>
            </span>
            <button
              type="button"
              onClick={chip.onRemove}
              className={styles.chipRemoveBtn}
              title={`Quitar filtro ${chip.etiqueta}`}
              aria-label={`Quitar filtro ${chip.etiqueta}`}
            >
              <X size={12} aria-hidden="true" />
            </button>
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={onClearAll}
        className={styles.clearAllBtn}
        title="Restablecer todos los filtros a sus valores predeterminados"
      >
        <FilterX size={13} aria-hidden="true" />
        <span>{clearAllText}</span>
      </button>
    </div>
  );
}

export default ActiveFilterChips;
