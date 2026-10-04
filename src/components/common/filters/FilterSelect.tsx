'use client';

import React from 'react';
import styles from './FilterComponents.module.css';

export interface FilterSelectOption {
  valor: string;
  etiqueta: string;
}

interface FilterSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  id: string;
  label: string;
  value: string;
  onChange: (nuevoValor: string) => void;
  options?: readonly FilterSelectOption[] | FilterSelectOption[];
  ariaLabel?: string;
}

export function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
  children,
  ariaLabel,
  className = '',
  ...props
}: FilterSelectProps) {
  return (
    <div className={styles.filterField}>
      <label htmlFor={id} className={styles.filterLabel}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${styles.filterSelect} ${className}`.trim()}
        aria-label={ariaLabel || label}
        {...props}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.valor} value={opt.valor}>
                {opt.etiqueta}
              </option>
            ))
          : children}
      </select>
    </div>
  );
}

export default FilterSelect;
