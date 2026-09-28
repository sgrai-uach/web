import React from 'react';
import InlineNotice, { type InlineNoticeProps } from '@/components/ui/InlineNotice';
import type { NotificationType } from '@/types/common';

interface NotificationBannerProps {
  type: NotificationType;
  title?: string;
  message: string;
  errors?: Array<{ campo?: string; mensaje: string }>;
  onClose?: () => void;
}

/**
 * @deprecated Use `<InlineNotice />` from `@/components/ui/InlineNotice` or `useToast()` instead.
 */
export default function NotificationBanner({
  type,
  title,
  message,
  errors,
  onClose,
}: NotificationBannerProps) {
  const variantMap: Record<NotificationType, InlineNoticeProps['variant']> = {
    error: 'error',
    success: 'success',
    warning: 'warning',
    info: 'info',
  };

  return (
    <InlineNotice variant={variantMap[type] || 'info'} title={title} onClose={onClose}>
      <div>{message}</div>
      {errors && errors.length > 0 && (
        <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px' }}>
          {errors.map((err, index) => (
            <li key={index}>
              {err.campo ? <strong>{err.campo}: </strong> : null}
              {err.mensaje}
            </li>
          ))}
        </ul>
      )}
    </InlineNotice>
  );
}
