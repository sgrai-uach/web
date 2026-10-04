'use client';

import React, { useState } from 'react';
import {
  MapPin,
  ShieldAlert,
  Building2,
  Calendar,
  Copy,
  Check,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import type { PuntoCriticoItem, PrioridadPuntoCritico } from '@/types/puntoCritico';
import Modal from '@/components/common/Modal';
import Button from '@/components/ui/Button';

interface PuntoCriticoDetalleModalProps {
  punto: PuntoCriticoItem | null;
  onCerrar: () => void;
  onEliminar?: (punto: PuntoCriticoItem) => void;
  puedeEliminar?: boolean;
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

export default function PuntoCriticoDetalleModal({
  punto,
  onCerrar,
  onEliminar,
  puedeEliminar = true,
}: PuntoCriticoDetalleModalProps) {
  const [copiado, setCopiado] = useState(false);

  if (!punto) return null;

  const prioridadInfo = PRIORIDAD_CONFIG[punto.prioridad] || PRIORIDAD_CONFIG.MEDIA;

  const handleCopiarCoordenadas = async () => {
    const texto = `${punto.latitud}, ${punto.longitud}`;
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Fallback silencioso
    }
  };

  const formatearFecha = (fechaIso: string) => {
    try {
      return new Intl.DateTimeFormat('es-CL', {
        dateStyle: 'long',
        timeStyle: 'short',
      }).format(new Date(fechaIso));
    } catch {
      return fechaIso;
    }
  };

  const urlMapa = `https://www.openstreetmap.org/?mlat=${punto.latitud}&mlon=${punto.longitud}#map=16/${punto.latitud}/${punto.longitud}`;

  const actions = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {punto.activo && onEliminar && (
        <Button
          type="button"
          variant="destructive"
          onClick={() => {
            onCerrar();
            onEliminar(punto);
          }}
          disabled={!puedeEliminar}
          icon={<Trash2 size={15} aria-hidden="true" />}
        >
          Eliminar
        </Button>
      )}
      <Button
        type="button"
        variant="primary"
        href={urlMapa}
        target="_blank"
        rel="noopener noreferrer"
        icon={<ExternalLink size={15} />}
      >
        Ver en Mapa
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={onCerrar}
      >
        Cerrar Ficha
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={Boolean(punto)}
      title="Ficha Detallada de Punto Crítico"
      onClose={onCerrar}
      actions={actions}
      maxWidth="680px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Cabecera del Punto Crítico */}
        <div
          style={{
            borderLeft: '4px solid var(--color-primary-teal, #1B6F7D)',
            backgroundColor: '#F8FAFC',
            padding: '14px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--color-primary-teal, #1B6F7D)',
                backgroundColor: 'var(--color-info-bg, #E0F2F1)',
                padding: '3px 8px',
                border: '1px solid #B2DFDB',
              }}
            >
              {punto.codigo}
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
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
              Prioridad {prioridadInfo.label}
            </span>

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
          </div>

          <h3
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--color-primary-teal-dark, #14505A)',
            }}
          >
            {punto.nombre}
          </h3>

          {punto.descripcion && (
            <p
              style={{
                margin: 0,
                fontSize: '13px',
                color: 'var(--color-text-dark, #2B2B2B)',
                lineHeight: 1.5,
              }}
            >
              {punto.descripcion}
            </p>
          )}
        </div>

        {/* Grilla de Atributos */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Bloque: Evaluación de Amenaza */}
          <div
            style={{
              border: '1px solid var(--border-color-neutral, #DFE3E8)',
              padding: '14px 16px',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 700,
                fontSize: '13px',
                color: 'var(--color-primary-teal-dark, #14505A)',
                borderBottom: '1px solid #ECEFF3',
                paddingBottom: '6px',
              }}
            >
              <ShieldAlert size={16} aria-hidden="true" />
              <span>Amenaza y Riesgo</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted, #5F676E)', fontWeight: 600 }}>Tipo de Riesgo: </span>
                <span style={{ fontWeight: 700, color: 'var(--color-charcoal, #3B3F45)' }}>
                  {punto.tipoRiesgo || 'No especificado'}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted, #5F676E)', fontWeight: 600 }}>Nivel de Prioridad: </span>
                <span style={{ fontWeight: 700, color: prioridadInfo.color }}>
                  {prioridadInfo.label}
                </span>
              </div>
            </div>
          </div>

          {/* Bloque: Jurisdicción Territorial */}
          <div
            style={{
              border: '1px solid var(--border-color-neutral, #DFE3E8)',
              padding: '14px 16px',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 700,
                fontSize: '13px',
                color: 'var(--color-primary-teal-dark, #14505A)',
                borderBottom: '1px solid #ECEFF3',
                paddingBottom: '6px',
              }}
            >
              <Building2 size={16} aria-hidden="true" />
              <span>Jurisdicción Municipal</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted, #5F676E)', fontWeight: 600 }}>Delegación: </span>
                <span style={{ fontWeight: 700, color: 'var(--color-charcoal, #3B3F45)' }}>
                  {punto.delegacion?.nombre || 'Central Comunal'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bloque de Coordenadas y Ubicación Espacial */}
        <div
          style={{
            border: '1px solid var(--border-color-neutral, #DFE3E8)',
            padding: '14px 16px',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #ECEFF3',
              paddingBottom: '6px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 700,
                fontSize: '13px',
                color: 'var(--color-primary-teal-dark, #14505A)',
              }}
            >
              <MapPin size={16} aria-hidden="true" />
              <span>Coordenadas Geográficas (PostGIS WGS 84)</span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopiarCoordenadas}
              icon={copiado ? <Check size={14} /> : <Copy size={14} />}
            >
              {copiado ? 'Coordenadas Copiadas' : 'Copiar Coordenadas'}
            </Button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              fontSize: '13px',
              paddingTop: '4px',
            }}
          >
            <div
              style={{
                backgroundColor: '#F8FAFC',
                padding: '8px 12px',
                border: '1px solid #ECEFF3',
              }}
            >
              <span style={{ color: 'var(--color-text-muted, #5F676E)', display: 'block', fontSize: '11px', fontWeight: 600 }}>
                LATITUD
              </span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '14px', color: 'var(--color-primary-teal-dark, #14505A)' }}>
                {punto.latitud}
              </span>
            </div>

            <div
              style={{
                backgroundColor: '#F8FAFC',
                padding: '8px 12px',
                border: '1px solid #ECEFF3',
              }}
            >
              <span style={{ color: 'var(--color-text-muted, #5F676E)', display: 'block', fontSize: '11px', fontWeight: 600 }}>
                LONGITUD
              </span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '14px', color: 'var(--color-primary-teal-dark, #14505A)' }}>
                {punto.longitud}
              </span>
            </div>
          </div>
        </div>

        {/* Pie con Metadatos de Creación */}
        {punto.creadoEn && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--color-text-muted, #5F676E)',
              paddingTop: '4px',
            }}
          >
            <Calendar size={13} aria-hidden="true" />
            <span>Fecha de registro en catastro: {formatearFecha(punto.creadoEn)}</span>
          </div>
        )}
      </div>
    </Modal>
  );
}
