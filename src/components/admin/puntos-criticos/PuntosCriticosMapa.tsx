'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import type { PuntoCriticoItem } from '@/types/puntoCritico';

interface PuntosCriticosMapaProps {
  puntos: PuntoCriticoItem[];
  onEliminarPunto?: (punto: PuntoCriticoItem) => void;
  onSeleccionarPunto?: (punto: PuntoCriticoItem) => void;
  puedeEliminar?: boolean;
  height?: string | number;
}

const DynamicPuntosCriticosMapaInner = dynamic(
  () => import('./PuntosCriticosMapaInner'),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: '100%',
          height: '480px',
          backgroundColor: 'var(--color-bg-light, #ECEFF3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-charcoal, #3B3F45)',
          fontSize: '0.875rem',
          border: '1px solid #DFE3E8',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
          Cargando mapa cartográfico de puntos críticos...
        </div>
        <div style={{ fontSize: '0.75rem', color: '#666' }}>
          OpenStreetMap — Dirección de Gestión de Riesgos de Desastres (Valdivia)
        </div>
      </div>
    ),
  }
);

export default function PuntosCriticosMapa({
  puntos,
  onEliminarPunto,
  onSeleccionarPunto,
  puedeEliminar = true,
  height = '520px',
}: PuntosCriticosMapaProps) {
  return (
    <div
      style={{
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        border: '1px solid var(--border-color-neutral, #DFE3E8)',
        position: 'relative',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
      }}
    >
      <DynamicPuntosCriticosMapaInner
        puntos={puntos}
        onEliminarPunto={onEliminarPunto}
        onSeleccionarPunto={onSeleccionarPunto}
        puedeEliminar={puedeEliminar}
      />
    </div>
  );
}
