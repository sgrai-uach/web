import React from 'react';
import { Info, AlertTriangle, AlertCircle, CheckCircle2, X } from 'lucide-react';
import styles from './InlineNotice.module.css';

export interface InlineNoticeProps {
  variant?: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export default function InlineNotice({
  variant = 'info',
  title,
  children,
  icon,
  onClose,
  className = '',
}: InlineNoticeProps) {
  const getIcon = () => {
    if (icon) return icon;
    switch (variant) {
      case 'warning':
        return <AlertTriangle size={18} aria-hidden="true" />;
      case 'error':
        return <AlertCircle size={18} aria-hidden="true" />;
      case 'success':
        return <CheckCircle2 size={18} aria-hidden="true" />;
      case 'info':
      default:
        return <Info size={18} aria-hidden="true" />;
    }
  };

  const variantClass = {
    info: styles.noticeInfo,
    warning: styles.noticeWarning,
    error: styles.noticeError,
    success: styles.noticeSuccess,
  }[variant];

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      className={`${styles.notice} ${variantClass} ${className}`}
    >
      <div className={styles.iconWrapper}>{getIcon()}</div>
      <div className={styles.content}>
        {title && <div className={styles.title}>{title}</div>}
        <div>{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar notificación"
          className={styles.closeButton}
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
