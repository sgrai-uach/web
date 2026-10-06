'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Pagination.module.css';

export interface PaginationProps {
  paginaActual?: number;
  pagina?: number;
  totalPaginas: number;
  totalItems?: number;
  total?: number;
  limite: number;
  onCambiarPagina: (pagina: number) => void;
  onCambiarLimite: (limite: number) => void;
  opcionesLimite?: number[];
  nombreEntidad?: string;
  className?: string;
}

export default function Pagination({
  paginaActual,
  pagina,
  totalPaginas,
  totalItems,
  total,
  limite,
  onCambiarPagina,
  onCambiarLimite,
  opcionesLimite = [10, 20, 50],
  nombreEntidad = 'elementos',
  className = '',
}: PaginationProps) {
  const currentPagina = paginaActual ?? pagina ?? 1;
  const currentTotal = totalItems ?? total ?? 0;

  if (currentTotal <= 0) return null;

  const desde = Math.min((currentPagina - 1) * limite + 1, currentTotal);
  const hasta = Math.min(currentPagina * limite, currentTotal);

  return (
    <div className={`${styles.paginationContainer} ${className}`} role="navigation" aria-label="Paginación">
      <div className={styles.rangeInfo}>
        Mostrando <strong className={styles.rangeBold}>{desde}</strong> a{' '}
        <strong className={styles.rangeBold}>{hasta}</strong> de{' '}
        <strong className={styles.rangeBold}>{currentTotal}</strong> {nombreEntidad}
      </div>

      <div className={styles.controlsGroup}>
        <div className={styles.limitSelector}>
          <label htmlFor="pagination-limit-select" className={styles.limitLabel}>
            Por página:
          </label>
          <select
            id="pagination-limit-select"
            value={limite}
            onChange={(e) => onCambiarLimite(Number(e.target.value))}
            className={styles.limitSelect}
            aria-label={`Cantidad de ${nombreEntidad} por página`}
          >
            {opcionesLimite.map((opcion) => (
              <option key={opcion} value={opcion}>
                {opcion}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.navButtons}>
          <button
            type="button"
            onClick={() => onCambiarPagina(currentPagina - 1)}
            disabled={currentPagina <= 1}
            className={styles.navButton}
            aria-label="Página anterior"
          >
            <ChevronLeft size={14} aria-hidden="true" />
            <span>Anterior</span>
          </button>

          <span className={styles.pageIndicator} aria-live="polite">
            Pág. {currentPagina} de {Math.max(1, totalPaginas)}
          </span>

          <button
            type="button"
            onClick={() => onCambiarPagina(currentPagina + 1)}
            disabled={currentPagina >= totalPaginas || totalPaginas === 0}
            className={styles.navButton}
            aria-label="Página siguiente"
          >
            <span>Siguiente</span>
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
