import React from 'react';
import Heading from '@/components/ui/Heading';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
  style,
}: EmptyStateProps) {
  return (
    <div
      className={`${styles.container} ${className}`.trim()}
      style={style}
      role="status"
    >
      <div className={styles.iconBox} aria-hidden="true">
        {icon}
      </div>

      <Heading
        as="h3"
        variant="h3"
        color="teal-dark"
        align="center"
        style={{ margin: '0 0 var(--space-2, 8px) 0' }}
      >
        {title}
      </Heading>

      <div className={styles.description}>
        {description}
      </div>

      {action && (
        <div className={styles.actionWrapper}>
          {action}
        </div>
      )}
    </div>
  );
}
