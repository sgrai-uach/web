'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  durationMs?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser usado dentro de un ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, durationMs = 5000 }: Omit<ToastMessage, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastMessage = { id, type, title, message, durationMs };

      setToasts((prev) => [...prev, newToast]);

      if (durationMs > 0) {
        setTimeout(() => {
          removeToast(id);
        }, durationMs);
      }
    },
    [removeToast]
  );

  const showSuccess = useCallback(
    (message: string, title = 'Operación exitosa') => {
      showToast({ type: 'success', title, message });
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, title = 'Error') => {
      showToast({ type: 'error', title, message, durationMs: 7000 });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, title = 'Atención') => {
      showToast({ type: 'warning', title, message, durationMs: 6000 });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, title = 'Información') => {
      showToast({ type: 'info', title, message });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{ showToast, showSuccess, showError, showWarning, showInfo, removeToast }}
    >
      {children}
      <div
        id="toast-container"
        style={{
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          maxWidth: '420px',
          width: 'calc(100vw - 3rem)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => {
          const borderColor =
            toast.type === 'success'
              ? 'var(--color-accent-mint, #4FAE9B)'
              : toast.type === 'error'
              ? '#D32F2F'
              : toast.type === 'warning'
              ? '#E65100'
              : 'var(--color-primary-teal, #1B6F7D)';

          const barColor = borderColor;

          return (
            <div
              key={toast.id}
              role="alert"
              style={{
                pointerEvents: 'auto',
                backgroundColor: 'var(--color-white, #FFFFFF)',
                color: 'var(--color-text-dark, #2B2B2B)',
                borderLeft: `6px solid ${borderColor}`,
                borderTop: '1px solid #DFE3E8',
                borderRight: '1px solid #DFE3E8',
                borderBottom: '1px solid #DFE3E8',
                borderRadius: 0,
                padding: '1rem',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '0.75rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              }}
            >
              <div style={{ flex: 1 }}>
                {toast.title && (
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      color: barColor,
                      marginBottom: '0.25rem',
                    }}
                  >
                    {toast.title}
                  </div>
                )}
                <div style={{ fontSize: '0.875rem', lineHeight: '1.35' }}>
                  {toast.message}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Cerrar notificación"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-charcoal, #3B3F45)',
                  fontSize: '1.25rem',
                  lineHeight: '1',
                  cursor: 'pointer',
                  padding: '0 0.25rem',
                  borderRadius: 0,
                }}
              >
                &times;
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
