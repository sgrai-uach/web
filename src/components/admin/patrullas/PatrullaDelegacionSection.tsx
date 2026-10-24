'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import type { CatalogoItem } from '@/types/catalogos';
import styles from './PatrullaForm.module.css';

interface PatrullaDelegacionSectionProps {
  delegacionId: string;
  delegaciones: CatalogoItem[];
  errorDelegacion?: string;
  cargando?: boolean;
  onChangeDelegacion: (val: string) => void;
  onBlurDelegacion: () => void;
}

export const PatrullaDelegacionSection: React.FC<PatrullaDelegacionSectionProps> = ({
  delegacionId,
  delegaciones,
  errorDelegacion,
  cargando = false,
  onChangeDelegacion,
  onBlurDelegacion,
}) => {
  return (
    <section className={styles.section} aria-labelledby="seccion-delegacion">
      <div className={styles.sectionHeader}>
        <MapPin size={20} color="var(--color-primary-teal, #1B6F7D)" aria-hidden="true" />
        <h2 id="seccion-delegacion" className={styles.sectionTitle}>
          Delegación Municipal Base
        </h2>
      </div>
      <p className={styles.sectionDescription}>
        Seleccione la jurisdicción territorial de la Municipalidad de Valdivia a la cual estará
        adscrita la patrulla como base operativa.
      </p>

      <div className={styles.fieldGrid}>
        <div className={styles.fieldGroup}>
          <label htmlFor="patrulla-delegacion" className={styles.fieldLabel}>
            Delegación Base
            <span className={styles.requiredMark} aria-hidden="true">
              *
            </span>
          </label>
          <select
            id="patrulla-delegacion"
            required
            value={delegacionId}
            disabled={cargando}
            onChange={(e) => onChangeDelegacion(e.target.value)}
            onBlur={onBlurDelegacion}
            className={`${styles.selectField} ${errorDelegacion ? styles.inputError : ''}`}
            aria-invalid={Boolean(errorDelegacion)}
            aria-describedby={errorDelegacion ? 'error-patrulla-delegacion' : 'help-patrulla-delegacion'}
          >
            <option value="">
              {cargando ? 'Cargando delegaciones...' : '-- Seleccione Delegación Municipal --'}
            </option>
            {delegaciones.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre} {d.codigo ? `(${d.codigo})` : ''}
              </option>
            ))}
          </select>
          {errorDelegacion ? (
            <span id="error-patrulla-delegacion" className={styles.errorText} role="alert">
              {errorDelegacion}
            </span>
          ) : (
            <span id="help-patrulla-delegacion" className={styles.helperText}>
              Sector territorial para despacho rápido de triage e incidentes en terreno.
            </span>
          )}
        </div>
      </div>
    </section>
  );
};

export default PatrullaDelegacionSection;
