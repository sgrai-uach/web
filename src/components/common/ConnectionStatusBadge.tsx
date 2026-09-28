import React from 'react';
import styles from './ConnectionStatusBadge.module.css';

export interface ConnectionStatusBadgeProps {
  connected: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
  tooltip?: string;
  className?: string;
}

export default function ConnectionStatusBadge({
  connected,
  activeLabel = 'En vivo (WebSockets)',
  inactiveLabel = 'Reconectando...',
  tooltip,
  className = '',
}: ConnectionStatusBadgeProps) {
  const defaultTooltip = connected
    ? 'Conexión activa con el servidor en tiempo real'
    : 'Intentando restablecer conexión con el servidor...';

  return (
    <div
      className={`${styles.badge} ${className}`.trim()}
      title={tooltip || defaultTooltip}
      role="status"
      aria-live="polite"
    >
      <span
        className={`${styles.dot} ${connected ? styles.connected : styles.disconnected}`}
        aria-hidden="true"
      />
      <span>{connected ? activeLabel : inactiveLabel}</span>
    </div>
  );
}
