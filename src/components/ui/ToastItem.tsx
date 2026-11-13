'use client';

import React, { useEffect, useRef } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  ClipboardCheck,
  GitCompareArrows,
  BellRing,
  ShieldCheck,
  UserX,
  Shield,
  ArrowRight,
} from 'lucide-react';
import Button from './Button';
import Chip from './Chip';
import type { ToastMessage } from './Toast';
import { obtenerVarianteChipPrioridad } from '@/lib/utils/chipVariants';

interface ToastItemProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

const TYPE_BORDER_MAP: Record<string, string> = {
  success: 'var(--color-accent-mint, #4FAE9B)',
  error: 'var(--color-danger, #D32F2F)',
  warning: 'var(--color-warning, #E65100)',
  info: 'var(--color-primary-teal, #1B6F7D)',
};

const TYPE_ICON_BG_MAP: Record<string, { bg: string; color: string }> = {
  success: { bg: 'rgba(79, 174, 155, 0.12)', color: 'var(--color-accent-mint, #4FAE9B)' },
  error: { bg: 'rgba(211, 47, 47, 0.12)', color: 'var(--color-danger, #D32F2F)' },
  warning: { bg: 'rgba(230, 81, 0, 0.12)', color: 'var(--color-warning, #E65100)' },
  info: { bg: 'rgba(27, 111, 125, 0.12)', color: 'var(--color-primary-teal, #1B6F7D)' },
};

export default function ToastItem({ toast, onRemove }: ToastItemProps) {
  const borderColor = TYPE_BORDER_MAP[toast.type] || 'var(--color-primary-teal, #1B6F7D)';
  const iconColors = TYPE_ICON_BG_MAP[toast.type] || TYPE_ICON_BG_MAP.info;

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const remainingTimeRef = useRef<number>(toast.durationMs ?? 6000);
  const startTimeRef = useRef<number>(Date.now());

  const startTimer = () => {
    if (remainingTimeRef.current <= 0) return;
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onRemove(toast.id);
    }, remainingTimeRef.current);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    startTimer();
    return () => clearTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.id]);

  const handleMouseEnter = () => {
    clearTimer();
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
  };

  const handleMouseLeave = () => {
    startTimer();
  };

  const renderIcon = () => {
    if (toast.icon) {
      if (typeof toast.icon === 'string') {
        switch (toast.icon) {
          case 'reporte':
            return <ClipboardCheck size={18} color={iconColors.color} />;
          case 'reclasificacion':
            return <GitCompareArrows size={18} color={iconColors.color} />;
          case 'incidente':
            return <BellRing size={18} color={iconColors.color} />;
          case 'patrulla':
            return <ShieldCheck size={18} color={iconColors.color} />;
          case 'rechazo':
            return <UserX size={18} color={iconColors.color} />;
          case 'operativo':
            return <Shield size={18} color={iconColors.color} />;
          default:
            break;
        }
      } else {
        return toast.icon;
      }
    }

    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={18} color={iconColors.color} />;
      case 'error':
        return <AlertCircle size={18} color={iconColors.color} />;
      case 'warning':
        return <AlertTriangle size={18} color={iconColors.color} />;
      case 'info':
      default:
        return <Info size={18} color={iconColors.color} />;
    }
  };

  return (
    <div
      role="alert"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        pointerEvents: 'auto',
        backgroundColor: 'var(--color-white, #FFFFFF)',
        color: 'var(--color-text-dark, #2B2B2B)',
        borderLeft: `5px solid ${borderColor}`,
        borderTop: '1px solid #DFE3E8',
        borderRight: '1px solid #DFE3E8',
        borderBottom: '1px solid #DFE3E8',
        borderRadius: 0,
        padding: '0.875rem 1rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        boxShadow: 'var(--shadow-md, 0 4px 12px rgba(0,0,0,0.12))',
      }}
    >
      {/* Caja de ícono semántico */}
      <div
        style={{
          flexShrink: 0,
          width: '32px',
          height: '32px',
          backgroundColor: iconColors.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 0,
        }}
      >
        {renderIcon()}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Cabecera: Título y Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            marginBottom: '0.25rem',
            flexWrap: 'wrap',
          }}
        >
          {toast.title && (
            <div
              style={{
                fontWeight: 700,
                fontSize: '0.875rem',
                color: borderColor,
                lineHeight: 1.25,
              }}
            >
              {toast.title}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {toast.codeBadge && (
              <Chip variant="neutral" size="sm">
                {toast.codeBadge}
              </Chip>
            )}
            {toast.priorityBadge && (
              <Chip variant={obtenerVarianteChipPrioridad(toast.priorityBadge)} size="sm">
                {toast.priorityBadge}
              </Chip>
            )}
          </div>
        </div>

        {/* Mensaje descriptivo */}
        <div
          style={{
            fontSize: '0.8125rem',
            lineHeight: 1.45,
            color: 'var(--color-text-dark, #2B2B2B)',
            wordBreak: 'break-word',
          }}
        >
          {toast.message}
        </div>

        {/* Bloque estructurado de detalles */}
        {toast.details && toast.details.length > 0 && (
          <div
            style={{
              marginTop: '0.5rem',
              padding: '0.4rem 0.6rem',
              backgroundColor: '#F8FAFB',
              borderLeft: '2px solid var(--border-color-neutral, #DFE3E8)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.2rem',
              fontSize: '0.75rem',
            }}
          >
            {toast.details.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-charcoal, #3B3F45)' }}>
                  {item.label}:
                </span>
                <span style={{ color: 'var(--color-text-dark, #2B2B2B)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Botón de acción contextual */}
        {toast.action && (
          <div style={{ marginTop: '0.5rem' }}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                toast.action?.onClick();
                onRemove(toast.id);
              }}
              style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.5rem',
                minHeight: '26px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span>{toast.action.label}</span>
              <ArrowRight size={13} />
            </Button>
          </div>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onRemove(toast.id)}
        aria-label="Cerrar notificación"
        style={{
          color: 'var(--color-charcoal, #3B3F45)',
          minHeight: 'auto',
          padding: '2px',
          alignSelf: 'flex-start',
        }}
      >
        <X size={16} />
      </Button>
    </div>
  );
}
