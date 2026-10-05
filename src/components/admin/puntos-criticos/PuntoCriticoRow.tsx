'use client';

import React, { useState } from 'react';
import { Copy, Check, ExternalLink, MapPin, AlertCircle, Pencil } from 'lucide-react';
import type { PuntoCriticoItem, PrioridadPuntoCritico } from '@/types/puntoCritico';
import Button from '@/components/ui/Button';

interface PuntoCriticoRowProps {
  punto: PuntoCriticoItem;
  indice: number;
  onSeleccionar?: (punto: PuntoCriticoItem) => void;
  onEditar?: (punto: PuntoCriticoItem) => void;
}

const PRIORIDAD_CONFIG: Record<
  PrioridadPuntoCritico,
  { label: string; bg: string; color: string; border: string }
> = {
  CRITICA: {
    label: 'Crítica',
    bg: 'var(--color-danger-bg, #FFEBEE)',
    color: 'var(--color-danger, #D32F2F)',
    border: '#FFCDD2',
  },
  ALTA: {
    label: 'Alta',
    bg: 'var(--color-warning-bg, #FFF3E0)',
    color: 'var(--color-warning, #E65100)',
    border: '#FFE0B2',
  },
  MEDIA: {
    label: 'Media',
    bg: '#FEF3C7',
    color: '#B45309',
    border: '#FDE68A',
  },
  BAJA: {
    label: 'Baja',
    bg: 'var(--color-success-bg, #E8F5E9)',
    color: 'var(--color-success, #2E7D32)',
    border: '#C8E6C9',
  },
};

export default function PuntoCriticoRow({
  punto,
  indice,
  onSeleccionar,
  onEditar,
}: PuntoCriticoRowProps) {
  const esFilaPar = indice % 2 === 0;
  const [copiado, setCopiado] = useState(false);

  const prioridadInfo = PRIORIDAD_CONFIG[punto.prioridad] || PRIORIDAD_CONFIG.MEDIA;

  const handleCopiarCoordenadas = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const texto = `${punto.latitud}, ${punto.longitud}`;
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Fallback silencioso si el navegador restringe portapapeles
    }
  };

  const urlMapa = `https://www.openstreetmap.org/?mlat=${punto.latitud}&mlon=${punto.longitud}#map=16/${punto.latitud}/${punto.longitud}`;

  return (
    <tr
      onClick={() => onSeleccionar?.(punto)}
      style={{
        backgroundColor: esFilaPar ? 'var(--color-white, #FFFFFF)' : '#F8FAFC',
        borderBottom: '1px solid var(--border-color-neutral, #DFE3E8)',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-bg-light, #ECEFF3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = esFilaPar ? 'var(--color-white, #FFFFFF)' : '#F8FAFC';
      }}
    >
      {/* Identificador / Nombre / Sector */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--color-primary-teal, #1B6F7D)',
                backgroundColor: 'var(--color-info-bg, #E0F2F1)',
                padding: '2px 6px',
                border: '1px solid #B2DFDB',
              }}
            >
              {punto.codigo}
            </span>
          </div>
          <span
            style={{
              fontWeight: 700,
              color: 'var(--color-primary-teal-dark, #14505A)',
              fontSize: '14px',
              lineHeight: 1.3,
            }}
          >
            {punto.nombre}
          </span>
          {punto.descripcion && (
            <span
              style={{
                fontSize: '12px',
                color: 'var(--color-text-muted, #5F676E)',
                lineHeight: 1.4,
                maxWidth: '380px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={punto.descripcion}
            >
              {punto.descripcion}
            </span>
          )}
        </div>
      </td>

      {/* Tipo de Riesgo */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        {punto.tipoRiesgo ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: 'var(--color-charcoal, #3B3F45)',
              fontWeight: 500,
            }}
          >
            <AlertCircle size={14} style={{ color: 'var(--color-primary-teal, #1B6F7D)', flexShrink: 0 }} aria-hidden="true" />
            <span>{punto.tipoRiesgo}</span>
          </span>
        ) : (
          <span style={{ color: 'var(--color-text-muted, #5F676E)', fontSize: '13px' }}>-</span>
        )}
      </td>

      {/* Prioridad / Gravedad */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: '12px',
            fontWeight: 700,
            padding: '3px 8px',
            backgroundColor: prioridadInfo.bg,
            color: prioridadInfo.color,
            border: `1px solid ${prioridadInfo.border}`,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {prioridadInfo.label}
        </span>
      </td>

      {/* Coordenadas Geográficas y Enlace a Mapa */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={13} style={{ color: 'var(--color-primary-teal, #1B6F7D)', flexShrink: 0 }} aria-hidden="true" />
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '12px',
                color: 'var(--color-charcoal, #3B3F45)',
                fontWeight: 600,
              }}
            >
              {punto.latitud.toFixed(4)}, {punto.longitud.toFixed(4)}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleCopiarCoordenadas}
              title="Copiar coordenadas al portapapeles"
              style={{
                background: 'none',
                border: 'none',
                padding: '2px 4px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                color: copiado ? 'var(--color-success, #2E7D32)' : 'var(--color-primary-teal, #1B6F7D)',
                fontWeight: 600,
              }}
            >
              {copiado ? <Check size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
              <span>{copiado ? 'Copiado' : 'Copiar'}</span>
            </button>

            <span style={{ color: '#D5DCE4', fontSize: '12px' }}>|</span>

            <a
              href={urlMapa}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Ver en OpenStreetMap"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                color: 'var(--color-primary-teal, #1B6F7D)',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              <span>Mapa</span>
              <ExternalLink size={11} aria-hidden="true" />
            </a>
          </div>
        </div>
      </td>

      {/* Delegación Asociada */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <span
          style={{
            fontSize: '13px',
            color: 'var(--color-charcoal, #3B3F45)',
            fontWeight: 500,
          }}
        >
          {punto.delegacion?.nombre || 'Central Comunal'}
        </span>
      </td>

      {/* Estado Actual */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 600,
            padding: '3px 8px',
            backgroundColor: punto.activo ? 'var(--color-success-bg, #E8F5E9)' : '#F3F4F6',
            color: punto.activo ? 'var(--color-success, #2E7D32)' : '#4B5563',
            border: `1px solid ${punto.activo ? '#C8E6C9' : '#E5E7EB'}`,
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: 'var(--radius-round, 9999px)',
              backgroundColor: punto.activo ? 'var(--color-success, #2E7D32)' : '#9CA3AF',
            }}
            aria-hidden="true"
          />
          <span>{punto.estadoTexto}</span>
        </span>
      </td>

      {/* Acción de Edición (HU-55) */}
      <td
        style={{
          padding: '14px 16px',
          verticalAlign: 'middle',
          textAlign: 'center',
        }}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEditar?.(punto);
          }}
          icon={<Pencil size={13} aria-hidden="true" />}
          title={`Editar características de ${punto.codigo}`}
          aria-label={`Editar ${punto.codigo}`}
        >
          Editar
        </Button>
      </td>
    </tr>
  );
}
