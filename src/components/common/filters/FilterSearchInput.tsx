'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import styles from './FilterComponents.module.css';

interface FilterSearchInputProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (nuevoValor: string) => void;
  placeholder?: string;
  debounceMs?: number;
  ariaLabel?: string;
}

export function FilterSearchInput({
  id = 'filtro-busqueda',
  label = 'Buscar:',
  value,
  onChange,
  placeholder = 'Buscar...',
  debounceMs = 300,
  ariaLabel,
}: FilterSearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const ultimoValorEmitido = useRef(value);

  // Sincronizar si el valor externo cambia (ej. al presionar Limpiar Filtros)
  useEffect(() => {
    if (value !== ultimoValorEmitido.current) {
      ultimoValorEmitido.current = value;
      setLocalValue(value);
    }
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== ultimoValorEmitido.current) {
        ultimoValorEmitido.current = localValue;
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [localValue, debounceMs, onChange]);

  const handleClear = () => {
    setLocalValue('');
    ultimoValorEmitido.current = '';
    onChange('');
  };

  return (
    <div className={styles.filterField}>
      {label && (
        <label htmlFor={id} className={styles.filterLabel}>
          {label}
        </label>
      )}
      <div className={styles.searchWrapper}>
        <input
          id={id}
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder={placeholder}
          className={styles.filterInput}
          aria-label={ariaLabel || label}
        />
        {localValue && (
          <button
            type="button"
            onClick={handleClear}
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

export default FilterSearchInput;
