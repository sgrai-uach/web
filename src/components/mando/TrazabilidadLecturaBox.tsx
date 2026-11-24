'use client';

import React from 'react';
import type { EstadoTrazabilidadNotificacion } from '@/services/incidentesService';
import {
  obtenerConfigTrazabilidad,
  type TipoUnidadTrazabilidad,
} from '@/lib/socket/trazabilidadConfig';
import { TrazabilidadIcon } from './TrazabilidadIcon';

export interface TrazabilidadLecturaBoxProps {
  estado?: EstadoTrazabilidadNotificacion | null;
  tipoUnidad?: TipoUnidadTrazabilidad | null;
  variante?: 'card' | 'drawer' | 'compact';
  metaDerecha?: React.ReactNode;
  testId?: string;
}

/**
 * Recuadro único y estandarizado para visualizar la trazabilidad de entrega y
 * confirmación de lectura de misiones en terreno, compartido entre Patrulla y Cuadrilla.
 */
export function TrazabilidadLecturaBox({
  estado,
  tipoUnidad,
  variante = 'card',
  metaDerecha,
  testId,
}: TrazabilidadLecturaBoxProps) {
  const cfg = estado ? obtenerConfigTrazabilidad(estado, tipoUnidad) : undefined;

  if (variante === 'compact') {
    if (!cfg) return null;

    return (
      <span
        data-testid={testId}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 6px',
          backgroundColor: cfg.bg,
          color: cfg.color,
          border: '1px solid currentColor',
          borderRadius: 0,
          fontSize: '11px',
          fontWeight: 600,
        }}
        title={cfg.texto}
      >
        <TrazabilidadIcon estado={estado ?? undefined} size={11} />
        <span>
          {cfg.etiquetaLectura}: {cfg.textoCorto}
        </span>
      </span>
    );
  }

  if (variante === 'drawer') {
    const etiquetaSinAcuse =
      tipoUnidad === 'CUADRILLA'
        ? 'SIN ACUSE: Lectura por cuadrilla aún no confirmada'
        : 'SIN ACUSE: Lectura por patrulla aún no confirmada';

    return (
      <div
        data-testid={testId ?? 'drawer-trazabilidad-resumen'}
        style={{
          marginBottom: 'var(--space-3, 12px)',
          padding: '8px 12px',
          borderRadius: 0,
          border: cfg ? '1px solid currentColor' : '1px dashed #94A3B8',
          borderLeft: cfg ? '4px solid currentColor' : '4px solid #94A3B8',
          backgroundColor: cfg ? cfg.bg : '#F8FAFC',
          color: cfg ? cfg.color : '#5F676E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '0.8rem',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
          <TrazabilidadIcon estado={estado ?? undefined} size={15} />
          <span>
            {cfg ? `${cfg.etiquetaLectura}: ${cfg.texto}` : etiquetaSinAcuse}
          </span>
        </span>
        {metaDerecha ? (
          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{metaDerecha}</span>
        ) : null}
      </div>
    );
  }

  // Variante 'card' (tarjeta del tablero Kanban)
  return (
    <div
      data-testid={testId}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '3px',
        width: '100%',
        boxSizing: 'border-box',
        flexShrink: 0,
        overflow: 'hidden',
        padding: '6px 8px',
        backgroundColor: cfg ? cfg.bg : '#F8FAFC',
        color: cfg ? cfg.color : '#5F676E',
        border: cfg ? '1px solid currentColor' : '1px dashed #94A3B8',
        borderLeft: cfg ? '4px solid currentColor' : '4px solid #94A3B8',
        borderRadius: 0,
        fontSize: '0.72rem',
        lineHeight: 1.25,
      }}
      title={
        cfg
          ? `Estado de notificación en terreno: ${cfg.texto}`
          : 'Aún no se registra confirmación de recepción o lectura desde la unidad en terreno'
      }
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          fontWeight: 700,
          maxWidth: '100%',
          overflowWrap: 'anywhere',
          wordBreak: 'break-word',
        }}
      >
        <TrazabilidadIcon estado={cfg ? (estado ?? undefined) : undefined} size={13} />
        <span>{cfg ? cfg.etiquetaLectura : 'SIN ACUSE'}</span>
      </span>
      <span
        style={{
          fontWeight: cfg ? 600 : 500,
          fontSize: '0.7rem',
          lineHeight: 1.3,
          maxWidth: '100%',
          overflowWrap: 'anywhere',
          wordBreak: 'break-word',
        }}
      >
        {cfg ? cfg.textoCorto : 'Lectura aún no confirmada'}
      </span>
    </div>
  );
}

export default TrazabilidadLecturaBox;
