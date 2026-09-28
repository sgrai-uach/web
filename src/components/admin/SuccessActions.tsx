'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { useAutoRedirectTimer } from '@/hooks/useAutoRedirectTimer';
import styles from './SuccessActions.module.css';

interface SuccessActionsProps {
  recursoNombre: string;
  onReset: () => void;
  listPath?: string;
}

export default function SuccessActions({
  recursoNombre,
  onReset,
  listPath = '/admin/recursos',
}: SuccessActionsProps) {
  const {
    isCancelled,
    secondsRemaining,
    progressPercent,
    cancel,
    triggerRedirectNow,
  } = useAutoRedirectTimer({ redirectPath: listPath });

  return (
    <div className={styles.alertContainer} role="alert" aria-live="polite">
      <div className={styles.headerRow}>
        <div className={styles.checkIconWrapper}>
          <Check size={20} aria-hidden="true" />
        </div>
        <div>
          <h3 className={styles.title}>Recurso creado exitosamente</h3>
          <p className={styles.description}>
            El recurso <strong>&ldquo;{recursoNombre}&rdquo;</strong> ha sido registrado en el inventario logístico municipal.
          </p>
        </div>
      </div>

      <div className={styles.actionsGroup}>
        <button
          type="button"
          onClick={triggerRedirectNow}
          onMouseEnter={cancel}
          className={styles.countdownButton}
        >
          {!isCancelled && (
            <span
              className={styles.progressBar}
              style={{ width: `${progressPercent}%` }}
            />
          )}
          <span className={styles.buttonText}>
            {isCancelled
              ? 'Volver al listado'
              : `Volver al listado (${secondsRemaining}s)`}
          </span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className={styles.resetButton}
        >
          + Crear otro recurso
        </button>
      </div>
    </div>
  );
}
