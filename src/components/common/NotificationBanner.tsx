'use client';

import React from 'react';
import type { NotificationState } from '@/types/common';

interface NotificationBannerProps {
  notification: NotificationState | null;
  onClose: () => void;
}

export default function NotificationBanner({ notification, onClose }: NotificationBannerProps) {
  if (!notification) return null;

  const isExito = notification.tipo === 'exito';

  return (
    <div
      role="alert"
      style={{
        backgroundColor: isExito ? '#E6F6ED' : '#FDE8E8',
        color: isExito ? '#12633E' : '#9B1C1C',
        borderLeft: `4px solid ${isExito ? 'var(--color-accent-mint, #4FAE9B)' : '#E02424'}`,
        padding: '0.875rem 1.25rem',
        fontSize: '0.9375rem',
        fontWeight: 700,
        marginBottom: '1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span>{notification.mensaje}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar notificación"
        style={{
          background: 'none',
          border: 'none',
          color: isExito ? '#12633E' : '#9B1C1C',
          cursor: 'pointer',
          fontWeight: 800,
          fontSize: '1rem',
          padding: '0.25rem',
        }}
      >
        ✕
      </button>
    </div>
  );
}
