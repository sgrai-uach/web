'use client';

import React from 'react';
import InlineNotice, { type InlineNoticeProps } from '@/components/ui/InlineNotice';
import type { NotificationType, NotificationState } from '@/types/common';

export interface NotificationBannerProps {
  notification?: NotificationState | null;
  type?: NotificationType;
  title?: string;
  message?: string;
  errors?: Array<{ campo?: string; mensaje: string }>;
  onClose?: () => void;
}

/**
 * @deprecated Use `<InlineNotice />` from `@/components/ui/InlineNotice` or `useToast()` instead.
 */
export default function NotificationBanner({
  notification,
  type,
  title,
  message,
  errors,
  onClose,
}: NotificationBannerProps) {
  // Soporte retrocompatible si se pasa el objeto `notification`
  if (notification) {
    const isExito = notification.tipo === 'exito' || notification.type === 'success' || notification.type === 'exito';
    const variant: InlineNoticeProps['variant'] = isExito ? 'success' : 'error';
    const text = notification.mensaje || notification.message || '';

    return (
      <div style={{ marginBottom: '1.25rem' }}>
        <InlineNotice variant={variant} title={notification.title} onClose={onClose}>
          <div>{text}</div>
          {notification.details && notification.details.length > 0 && (
            <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px' }}>
              {notification.details.map((detail, idx) => (
                <li key={idx}>{detail}</li>
              ))}
            </ul>
          )}
        </InlineNotice>
      </div>
    );
  }

  if (!message && (!errors || errors.length === 0)) {
    return null;
  }

  const variantMap: Record<string, InlineNoticeProps['variant']> = {
    error: 'error',
    success: 'success',
    exito: 'success',
    warning: 'warning',
    info: 'info',
  };

  const selectedVariant = type ? variantMap[type] || 'info' : 'info';

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <InlineNotice variant={selectedVariant} title={title} onClose={onClose}>
        {message && <div>{message}</div>}
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
    </div>
  );
}
