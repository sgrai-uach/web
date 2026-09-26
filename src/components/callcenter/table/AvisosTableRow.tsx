'use client';

import React from 'react';
import type { AvisoItem } from '@/types/avisos';

interface AvisosTableRowProps {
  aviso: AvisoItem;
  idx: number;
  onSeleccionarAviso: (aviso: AvisoItem) => void;
}

function formatearFechaHora(fechaIso: string) {
  try {
    const d = new Date(fechaIso);
    return new Intl.DateTimeFormat('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(d);
  } catch {
    return fechaIso;
  }
}

function renderSemaforo(minutos: number) {
  if (minutos > 30) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#FFEBEE', color: '#B71C1C', border: '1px solid #FFCDD2', padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 800 }}>
        <span style={{ width: '8px', height: '8px', backgroundColor: '#D32F2F', borderRadius: '50%', display: 'inline-block' }} />
        {minutos} min &bull; URGENTE
      </span>
    );
  }
  if (minutos >= 15) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#FFF9C4', color: '#E65100', border: '1px solid #FFE082', padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>
        <span style={{ width: '8px', height: '8px', backgroundColor: '#F57F17', borderRadius: '50%', display: 'inline-block' }} />
        {minutos} min
      </span>
    );
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#E8F5E9', color: '#1B5E20', border: '1px solid #A5D6A7', padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>
      <span style={{ width: '8px', height: '8px', backgroundColor: '#2E7D32', borderRadius: '50%', display: 'inline-block' }} />
      {minutos} min
    </span>
  );
}

function renderOrigen(origen: string) {
  const color = origen === 'WEB' ? 'var(--color-primary-teal, #1B6F7D)' : origen === 'CHATBOT' ? '#6A1B9A' : '#00838F';
  const etiqueta = origen === 'WEB' ? 'Portal Web' : origen === 'CHATBOT' ? 'Chatbot' : origen === 'TELEFONO' ? 'Teléfono 14XX' : origen;
  return (
    <span style={{ borderLeft: `3px solid ${color}`, paddingLeft: '0.5rem', fontWeight: 600, fontSize: '0.8125rem', color: 'var(--color-charcoal, #3B3F45)' }}>
      {etiqueta}
    </span>
  );
}

export default function AvisosTableRow({ aviso, idx, onSeleccionarAviso }: AvisosTableRowProps) {
  const filaUrgente = aviso.minutosEnEspera > 30;
  return (
    <tr
      style={{
        borderBottom: '1px solid #E5E9EE',
        backgroundColor: filaUrgente ? 'rgba(211, 47, 47, 0.03)' : idx % 2 === 0 ? 'var(--color-white, #FFFFFF)' : '#FAFCFD',
      }}
    >
      <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>{renderSemaforo(aviso.minutosEnEspera)}</td>
      <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: '#555' }} suppressHydrationWarning>
        {formatearFechaHora(aviso.creadoEn)}
      </td>
      <td style={{ padding: '0.875rem 1rem' }}>
        <span style={{ fontWeight: 700, color: 'var(--color-primary-teal, #1B6F7D)' }}>
          {aviso.tipoPreliminarNombre || 'Sin tipificar'}
        </span>
      </td>
      <td style={{ padding: '0.875rem 1rem' }}>{renderOrigen(aviso.origenReporte)}</td>
      <td style={{ padding: '0.875rem 1rem', maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={aviso.descripcion}>
        {aviso.descripcion}
      </td>
      <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: '#666' }}>
        {aviso.latitud.toFixed(4)}, {aviso.longitud.toFixed(4)}
      </td>
      <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
        <button
          type="button"
          onClick={() => onSeleccionarAviso(aviso)}
          style={{
            backgroundColor: 'var(--color-accent-mint, #4FAE9B)',
            color: '#FFFFFF',
            border: 'none',
            padding: '0.45rem 0.85rem',
            fontSize: '0.8125rem',
            fontWeight: 700,
            cursor: 'pointer',
            borderRadius: 0,
            whiteSpace: 'nowrap',
          }}
        >
          Revisar Aviso &rarr;
        </button>
      </td>
    </tr>
  );
}
