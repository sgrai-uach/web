'use client';

import React from 'react';
import type { AvisoItem } from '@/types/avisos';
import { normalizarEstadoAviso, obtenerDelegacionAviso } from '@/types/avisos';
import Button from '@/components/ui/Button';
import { formatearTiempoEspera } from '@/lib/utils/timeUtils';

interface AvisosTableRowProps {
  aviso: AvisoItem;
  idx: number;
  onSeleccionarAviso: (aviso: AvisoItem) => void;
}

function formatearFechaHora(fechaIso: string) {
  try {
    const d = new Date(fechaIso);
    return new Intl.DateTimeFormat('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return fechaIso;
  }
}

function renderSemaforo(minutos: number) {
  const tiempoTexto = formatearTiempoEspera(minutos);

  if (minutos > 30) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          backgroundColor: 'var(--color-danger-bg, #FFEBEE)',
          color: 'var(--color-danger, #D32F2F)',
          border: '1px solid #FFCDD2',
          padding: '0.25rem 0.5rem',
          fontSize: '0.75rem',
          fontWeight: 800,
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#D32F2F',
            borderRadius: '50%',
            display: 'inline-block',
          }}
        />
        {tiempoTexto} &bull; URGENTE
      </span>
    );
  }
  if (minutos >= 15) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          backgroundColor: '#FFF9C4',
          color: '#E65100',
          border: '1px solid #FFE082',
          padding: '0.25rem 0.5rem',
          fontSize: '0.75rem',
          fontWeight: 700,
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#F57F17',
            borderRadius: '50%',
            display: 'inline-block',
          }}
        />
        {tiempoTexto}
      </span>
    );
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        backgroundColor: 'var(--color-success-bg, #E8F5E9)',
        color: 'var(--color-success, #2E7D32)',
        border: '1px solid #A5D6A7',
        padding: '0.25rem 0.5rem',
        fontSize: '0.75rem',
        fontWeight: 600,
      }}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          backgroundColor: '#2E7D32',
          borderRadius: '50%',
          display: 'inline-block',
        }}
      />
      {tiempoTexto}
    </span>
  );
}

function renderOrigen(origen: string) {
  const color =
    origen === 'WEB'
      ? 'var(--color-primary-teal, #1B6F7D)'
      : origen === 'CHATBOT'
      ? '#6A1B9A'
      : '#00838F';
  const etiqueta =
    origen === 'WEB'
      ? 'Portal Web'
      : origen === 'CHATBOT'
      ? 'Chatbot'
      : origen === 'TELEFONO'
      ? 'Teléfono 14XX'
      : origen;
  return (
    <span
      style={{
        borderLeft: `3px solid ${color}`,
        paddingLeft: '0.5rem',
        fontWeight: 600,
        fontSize: '0.8125rem',
        color: 'var(--color-charcoal, #3B3F45)',
      }}
    >
      {etiqueta}
    </span>
  );
}

function renderEstadoBadge(estadoRaw?: string | null) {
  const estado = normalizarEstadoAviso(estadoRaw);
  if (estado === 'VERIFICADO') {
    return (
      <span
        style={{
          backgroundColor: 'var(--color-success-bg, #E8F5E9)',
          color: 'var(--color-success, #2E7D32)',
          border: '1px solid #A5D6A7',
          padding: '0.15rem 0.4rem',
          fontSize: '0.6875rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.3px',
          display: 'inline-block',
          marginTop: '0.25rem',
        }}
      >
        Verificado
      </span>
    );
  }
  if (estado === 'RECHAZADO') {
    return (
      <span
        style={{
          backgroundColor: 'var(--color-danger-bg, #FFEBEE)',
          color: 'var(--color-danger, #D32F2F)',
          border: '1px solid #FFCDD2',
          padding: '0.15rem 0.4rem',
          fontSize: '0.6875rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.3px',
          display: 'inline-block',
          marginTop: '0.25rem',
        }}
      >
        Rechazado
      </span>
    );
  }
  return null;
}

export default function AvisosTableRow({
  aviso,
  idx,
  onSeleccionarAviso,
}: AvisosTableRowProps) {
  const filaUrgente = aviso.minutosEnEspera > 30;
  const delegacion = obtenerDelegacionAviso(aviso);

  return (
    <tr
      style={{
        borderBottom: '1px solid #E5E9EE',
        backgroundColor: filaUrgente
          ? 'rgba(211, 47, 47, 0.03)'
          : idx % 2 === 0
          ? 'var(--color-white, #FFFFFF)'
          : '#FAFCFD',
      }}
    >
      <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
        {renderSemaforo(aviso.minutosEnEspera)}
      </td>
      <td
        style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: '#555' }}
        suppressHydrationWarning
      >
        {formatearFechaHora(aviso.creadoEn)}
      </td>
      <td style={{ padding: '0.875rem 1rem' }}>
        <div>
          <span style={{ fontWeight: 700, color: 'var(--color-primary-teal, #1B6F7D)' }}>
            {aviso.tipoPreliminarNombre || 'Sin tipificar'}
          </span>
          <div>{renderEstadoBadge(aviso.estado)}</div>
        </div>
      </td>
      <td style={{ padding: '0.875rem 1rem' }}>{renderOrigen(aviso.origenReporte)}</td>
      <td
        style={{
          padding: '0.875rem 1rem',
          maxWidth: '380px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={aviso.descripcion || undefined}
      >
        {aviso.descripcion}
      </td>
      <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem' }}>
        {delegacion ? (
          <div
            style={{
              fontWeight: 700,
              color: 'var(--color-primary-teal, #1B6F7D)',
              display: 'inline-block',
              backgroundColor: 'var(--color-bg-light, #ECEFF3)',
              padding: '0.1rem 0.4rem',
              marginBottom: '0.2rem',
              fontSize: '0.75rem',
            }}
          >
            Del. {delegacion}
          </div>
        ) : (
          <div style={{ color: 'var(--color-text-muted, #5F676E)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
            Sin delegación
          </div>
        )}
        <div style={{ color: '#666', fontSize: '0.75rem' }}>
          {aviso.direccionTexto || `${aviso.latitud.toFixed(4)}, ${aviso.longitud.toFixed(4)}`}
        </div>
      </td>
      <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => onSeleccionarAviso(aviso)}
          style={{ whiteSpace: 'nowrap' }}
        >
          Revisar Aviso &rarr;
        </Button>
      </td>
    </tr>
  );
}
