'use client';

import React from 'react';
import { CheckCircle2, Radio, Car, Coffee, CalendarOff, XCircle, Circle } from 'lucide-react';
import type { EstadoOperativo } from '@/types/empleados';

export interface BadgeEstadoOperativoProps {
  estado: EstadoOperativo | null | undefined;
  /** Etiqueta alternativa (por ejemplo, para indicar que no aplica). */
  etiquetaNoAplica?: string;
}

interface EstiloEstado {
  etiqueta: string;
  color: string;
  fondo: string;
  borde: string;
  Icono: React.ComponentType<{ size?: number | string; style?: React.CSSProperties }>;
}

/**
 * Configuración institucional de cada estado operativo (H11).
 * Los colores provienen de los tokens del design system.
 */
export const ESTADOS_OPERATIVOS: Record<EstadoOperativo, EstiloEstado> = {
  disponible: {
    etiqueta: 'Disponible',
    color: 'var(--color-success, #2E7D32)',
    fondo: 'var(--color-success-bg, #E8F5E9)',
    borde: 'var(--color-success-border, #A5D6A7)',
    Icono: CheckCircle2,
  },
  en_mision: {
    etiqueta: 'En Misión',
    color: 'var(--color-warning, #E65100)',
    fondo: 'var(--color-warning-bg, #FFF3E0)',
    borde: 'var(--color-warning-border, #FFE0B2)',
    Icono: Radio,
  },
  en_patrulla: {
    etiqueta: 'En Patrulla',
    color: 'var(--color-info, #1B6F7D)',
    fondo: 'var(--color-info-bg, #E0F2F1)',
    borde: 'var(--color-info-border, #B2DFDB)',
    Icono: Car,
  },
  descanso: {
    etiqueta: 'Descanso',
    color: 'var(--color-charcoal, #3B3F45)',
    fondo: 'var(--color-bg-light, #ECEFF3)',
    borde: 'var(--border-color-neutral, #DFE3E8)',
    Icono: Coffee,
  },
  licencia: {
    etiqueta: 'Licencia',
    color: 'var(--color-primary-teal-dark, #14505A)',
    fondo: 'var(--color-info-bg, #E0F2F1)',
    borde: 'var(--color-info-border, #B2DFDB)',
    Icono: CalendarOff,
  },
  inactivo: {
    etiqueta: 'Inactivo',
    color: 'var(--color-danger, #D32F2F)',
    fondo: 'var(--color-danger-bg, #FFEBEE)',
    borde: 'var(--color-danger-border, #FFCDD2)',
    Icono: XCircle,
  },
};

/**
 * Badge institucional que representa la disponibilidad actual (estado operativo)
 * de un funcionario. La disponibilidad siempre está presente en `usuario.estado_operativo`.
 */
export default function BadgeEstadoOperativo({
  estado,
  etiquetaNoAplica = 'No aplica',
}: BadgeEstadoOperativoProps) {
  if (!estado) {
    return (
      <span
        data-testid="badge-estado-operativo"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          backgroundColor: 'var(--color-bg-light, #ECEFF3)',
          color: 'var(--color-charcoal, #3B3F45)',
          border: '1px solid var(--border-color-neutral, #DFE3E8)',
          padding: '0.2rem 0.5rem',
          fontSize: '0.75rem',
          fontWeight: 700,
          whiteSpace: 'nowrap',
        }}
      >
        <Circle size={12} />
        <span>{etiquetaNoAplica}</span>
      </span>
    );
  }

  const estilo = ESTADOS_OPERATIVOS[estado] ?? ESTADOS_OPERATIVOS.inactivo;
  const { Icono } = estilo;

  return (
    <span
      data-testid="badge-estado-operativo"
      data-estado={estado}
      title={`Estado operativo: ${estilo.etiqueta}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        backgroundColor: estilo.fondo,
        color: estilo.color,
        border: `1px solid ${estilo.borde}`,
        padding: '0.2rem 0.5rem',
        fontSize: '0.75rem',
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      <Icono size={12} />
      <span>{estilo.etiqueta}</span>
    </span>
  );
}
