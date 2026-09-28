import React from 'react';
import styles from './SessionContextBar.module.css';

export interface SessionContextBarProps {
  title?: string;
  description?: string;
  leftContent?: React.ReactNode;
  extraSlot?: React.ReactNode;
  sessionSelector?: React.ReactNode;
  selectorId?: string;
  sessionLabel?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function SessionContextBar({
  title,
  description,
  leftContent,
  extraSlot,
  sessionSelector,
  selectorId,
  sessionLabel = 'Sesión activa:',
  className = '',
  children,
}: SessionContextBarProps) {
  return (
    <div className={`${styles.container} ${className}`.trim()} role="region" aria-label="Contexto de sesión y perfil">
      <div className={styles.leftGroup}>
        {leftContent ? (
          leftContent
        ) : (
          <>
            {title && <span className={styles.title}>{title}</span>}
            {description && <span className={styles.description}>{description}</span>}
          </>
        )}
      </div>

      <div className={styles.rightGroup}>
        {extraSlot && <div>{extraSlot}</div>}

        {sessionSelector ? (
          sessionSelector
        ) : children ? (
          <div className={styles.sessionBox}>
            {selectorId ? (
              <label htmlFor={selectorId} className={styles.sessionLabel}>
                {sessionLabel}
              </label>
            ) : (
              <span className={styles.sessionLabel}>{sessionLabel}</span>
            )}
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}
