'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './FilterComponents.module.css';

interface FilterBarProps {
  children: React.ReactNode;
  collapsibleOnMobile?: boolean;
  totalFiltrosActivos?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function FilterBar({
  children,
  collapsibleOnMobile = false,
  totalFiltrosActivos = 0,
  className = '',
  style,
}: FilterBarProps) {
  const [colapsado, setColapsado] = useState(false);

  return (
    <section
      className={`${styles.filterContainer} ${className}`.trim()}
      style={style}
      aria-label="Controles de filtrado de listado"
    >
      {collapsibleOnMobile && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setColapsado(!colapsado)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              color: 'var(--color-primary-teal, #1B6F7D)',
              padding: 0,
            }}
          >
            <SlidersHorizontal size={14} />
            <span>Filtros {totalFiltrosActivos > 0 ? `(${totalFiltrosActivos} activos)` : ''}</span>
            {colapsado ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      )}

      {(!collapsibleOnMobile || !colapsado) && children}
    </section>
  );
}

export default FilterBar;
