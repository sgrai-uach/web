'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import styles from './PatrullaForm.module.css';

interface PatrullaIdentificacionSectionProps {
  codigo: string;
  nombre: string;
  errorCodigo?: string;
  errorNombre?: string;
  onChangeCodigo: (val: string) => void;
  onChangeNombre: (val: string) => void;
  onBlurCodigo: () => void;
}

export const PatrullaIdentificacionSection: React.FC<PatrullaIdentificacionSectionProps> = ({
  codigo,
  nombre,
  errorCodigo,
  errorNombre,
  onChangeCodigo,
  onChangeNombre,
  onBlurCodigo,
}) => {
  return (
    <section className={styles.section} aria-labelledby="seccion-identificacion">
      <div className={styles.sectionHeader}>
        <ShieldCheck size={20} color="var(--color-primary-teal, #1B6F7D)" aria-hidden="true" />
        <h2 id="seccion-identificacion" className={styles.sectionTitle}>
          Identificación de la Patrulla
        </h2>
      </div>
      <p className={styles.sectionDescription}>
        Ingrese el código identificador táctico único bajo el Sistema de Comando de Incidentes (ICS)
        y un nombre descriptivo institucional para la unidad.
      </p>

      <div className={styles.fieldGrid}>
        {/* Código Identificador Único */}
        <div className={styles.fieldGroup}>
          <label htmlFor="patrulla-codigo" className={styles.fieldLabel}>
            Código Identificador
            <span className={styles.requiredMark} aria-hidden="true">
              *
            </span>
          </label>
          <input
            id="patrulla-codigo"
            type="text"
            required
            autoComplete="off"
            placeholder="Ej. PV-NORTE-01"
            value={codigo}
            onChange={(e) => onChangeCodigo(e.target.value)}
            onBlur={onBlurCodigo}
            className={`${styles.inputField} ${errorCodigo ? styles.inputError : ''}`}
            aria-invalid={Boolean(errorCodigo)}
            aria-describedby={errorCodigo ? 'error-patrulla-codigo' : 'help-patrulla-codigo'}
          />
          {errorCodigo ? (
            <span id="error-patrulla-codigo" className={styles.errorText} role="alert">
              {errorCodigo}
            </span>
          ) : (
            <span id="help-patrulla-codigo" className={styles.helperText}>
              Identificador alfanumérico único (3 a 50 caracteres, ej. PV-NORTE-01).
            </span>
          )}
        </div>

        {/* Nombre Descriptivo (Opcional) */}
        <div className={styles.fieldGroup}>
          <label htmlFor="patrulla-nombre" className={styles.fieldLabel}>
            Nombre Descriptivo (Opcional)
          </label>
          <input
            id="patrulla-nombre"
            type="text"
            autoComplete="off"
            placeholder="Ej. Patrulla Rápida Norte 1"
            value={nombre}
            onChange={(e) => onChangeNombre(e.target.value)}
            className={`${styles.inputField} ${errorNombre ? styles.inputError : ''}`}
            aria-invalid={Boolean(errorNombre)}
            aria-describedby={errorNombre ? 'error-patrulla-nombre' : 'help-patrulla-nombre'}
          />
          {errorNombre ? (
            <span id="error-patrulla-nombre" className={styles.errorText} role="alert">
              {errorNombre}
            </span>
          ) : (
            <span id="help-patrulla-nombre" className={styles.helperText}>
              Si se omite, se utilizará automáticamente el código identificador.
            </span>
          )}
        </div>
      </div>
    </section>
  );
};

export default PatrullaIdentificacionSection;
