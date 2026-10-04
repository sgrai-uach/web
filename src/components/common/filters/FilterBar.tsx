'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './FilterComponents.module.css';

export interface FilterBarProps {
  children: React.ReactNode;
  titulo?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  storageKey?: string;
  totalFiltrosActivos?: number;
  headerActions?: React.ReactNode;
  collapsibleOnMobile?: boolean; // Compatibilidad hacia atrás
  className?: string;
  style?: React.CSSProperties;
}

export function FilterBar({
  children,
  titulo = 'Filtros y Búsqueda',
  collapsible = true,
  defaultCollapsed = false,
  storageKey,
  totalFiltrosActivos = 0,
  headerActions,
  collapsibleOnMobile,
  className = '',
  style,
}: FilterBarProps) {
  // Si se pasa collapsibleOnMobile y no se especifica collapsible explícitamente, se respeta
  const puedeColapsar = collapsible || Boolean(collapsibleOnMobile);
  const [colapsado, setColapsado] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !storageKey) return defaultCollapsed;
    try {
      const guardado = localStorage.getItem(storageKey);
      if (guardado !== null) {
        return guardado === 'true';
      }
    } catch {
      // Modo seguro si localStorage está deshabilitado o restringido
    }
    return defaultCollapsed;
  });

  const alternarColapso = () => {
    setColapsado((prev) => {
      const nuevo = !prev;
      if (storageKey && typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageKey, String(nuevo));
        } catch {}
      }
      return nuevo;
    });
  };

  return (
    <section
      className={`${styles.filterContainer} ${className}`.trim()}
      style={style}
      aria-label="Controles de filtrado de listado"
    >
      {/* Barra de cabecera estándar con título, badge y toggle de minimizar */}
      <div className={styles.filterHeaderBar}>
        <div className={styles.filterHeaderLeft}>
          <span className={styles.filterHeaderTitle}>
            <SlidersHorizontal size={14} aria-hidden="true" />
            <span>{titulo}</span>
          </span>
          {totalFiltrosActivos > 0 && (
            <span
              className={styles.activeBadge}
              data-testid="badge-filtros-activos"
              aria-label={`${totalFiltrosActivos} filtros activos`}
            >
              {totalFiltrosActivos} activo{totalFiltrosActivos > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className={styles.filterHeaderRight}>
          {headerActions}

          {puedeColapsar && (
            <button
              type="button"
              onClick={alternarColapso}
              className={styles.toggleCollapseBtn}
              data-testid="btn-toggle-filtros"
              aria-expanded={!colapsado}
              title={colapsado ? 'Expandir panel de filtros' : 'Minimizar panel de filtros'}
            >
              <span>{colapsado ? 'Expandir filtros' : 'Minimizar filtros'}</span>
              {colapsado ? (
                <ChevronDown size={14} aria-hidden="true" />
              ) : (
                <ChevronUp size={14} aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Cuerpo de controles desplegable */}
      {!colapsado && <div className={styles.filterBody}>{children}</div>}
    </section>
  );
}

export default FilterBar;
