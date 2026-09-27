import React from 'react';
import { AlertCircle, Check, Info } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { NotificationType } from '@/types/common';

interface NotificationBannerProps {
  type: NotificationType;
  title?: string;
  message: string;
  errors?: Array<{ campo?: string; mensaje: string }>;
  onClose?: () => void;
}

const colorStyles: Record<
  NotificationType,
  { bg: string; border: string; text: string; iconBg: string }
> = {
  error: {
    bg: '#FDF2F2',
    border: '#E02424',
    text: '#9B1C1C',
    iconBg: '#E02424',
  },
  success: {
    bg: '#F3FAF7',
    border: '#4FAE9B',
    text: '#14505A',
    iconBg: '#4FAE9B',
  },
  warning: {
    bg: '#FEFCE8',
    border: '#E3A008',
    text: '#723B10',
    iconBg: '#E3A008',
  },
  info: {
    bg: '#ECEFF3',
    border: '#1B6F7D',
    text: '#14505A',
    iconBg: '#1B6F7D',
  },
};

export default function NotificationBanner({
  type,
  title,
  message,
  errors,
  onClose,
}: NotificationBannerProps) {
  const styles = colorStyles[type] || colorStyles.info;

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        backgroundColor: styles.bg,
        borderLeft: `5px solid ${styles.border}`,
        borderTop: '1px solid #ECEFF3',
        borderRight: '1px solid #ECEFF3',
        borderBottom: '1px solid #ECEFF3',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        color: styles.text,
      }}
    >
      <div
        style={{
          width: '24px',
          height: '24px',
          backgroundColor: styles.iconBg,
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {type === 'error' ? (
          <AlertCircle size={15} />
        ) : type === 'success' ? (
          <Check size={15} />
        ) : (
          <Info size={15} />
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {title && (
          <div style={{ fontWeight: 700, fontSize: '15px', color: styles.text }}>
            {title}
          </div>
        )}
        <div style={{ fontSize: '14px', lineHeight: 1.4 }}>{message}</div>
        {errors && errors.length > 0 && (
          <ul
            style={{
              margin: '6px 0 0 0',
              paddingLeft: '18px',
              fontSize: '13px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            {errors.map((err, index) => (
              <li key={index}>
                {err.campo ? <strong>{err.campo}: </strong> : null}
                {err.mensaje}
              </li>
            ))}
          </ul>
        )}
      </div>

      {onClose && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Cerrar notificación"
          style={{
            color: styles.text,
            fontSize: '1rem',
            minHeight: 'auto',
            padding: '0 4px',
          }}
        >
          &times;
        </Button>
      )}
    </div>
  );
}
