'use client';

import React from 'react';
import styles from '@/styles/mando.module.css';

interface AccesoDenegadoProps {
  onReintentar?: () => void;
}

export const AccesoDenegado: React.FC<AccesoDenegadoProps> = ({ onReintentar }) => {
  return (
    <div className={styles.accesoDenegadoContainer} role="alert">
      <svg
        className={styles.accesoDenegadoIcon}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </svg>
      <h2 className={styles.accesoDenegadoTitle}>Acceso Restringido — 403 Forbidden</h2>
      <p className={styles.accesoDenegadoText}>
        Esta vista del <strong>Centro de Incidentes</strong> está reservada exclusivamente para el
        rol de <strong>Encargado de Operaciones</strong> con permisos tácticos (<code>incidentes:kanban</code>).
        Tu cuenta no cuenta con las atribuciones necesarias para acceder a esta información operativa.
      </p>
      {onReintentar && (
        <button
          type="button"
          onClick={onReintentar}
          className={styles.btnPrimario}
        >
          Reintentar con Sesión de Encargado
        </button>
      )}
    </div>
  );
};
