'use client';

import React from 'react';
import { X } from 'lucide-react';
import styles from '@/components/common/filters/FilterComponents.module.css';

interface EmpleadoSearchInputProps {
  termino: string;
  setTermino: (val: string) => void;
  cargando: boolean;
  onFocusInput: () => void;
}

export default function EmpleadoSearchInput({
  termino,
  setTermino,
  cargando,
  onFocusInput,
}: EmpleadoSearchInputProps) {
  return (
    <div className={styles.filterField}>
      <label htmlFor="buscar-empleado-input" className={styles.filterLabel}>
        Buscar funcionario o personal:
      </label>
      <div className={styles.searchWrapper}>
        <input
          id="buscar-empleado-input"
          type="text"
          value={termino}
          onChange={(e) => setTermino(e.target.value)}
          onFocus={onFocusInput}
          placeholder="Buscar por RUT, Nombre, Apellidos o Correo..."
          className={styles.filterInput}
          autoComplete="off"
        />
        {cargando && (
          <span
            style={{
              position: 'absolute',
              right: termino ? '32px' : '10px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--color-primary-teal, #1B6F7D)',
            }}
          >
            Buscando...
          </span>
        )}
        {termino && (
          <button
            type="button"
            onClick={() => setTermino('')}
            className={styles.searchClearBtn}
            title="Borrar búsqueda"
            aria-label="Borrar búsqueda"
          >
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
