'use client';

import dynamic from 'next/dynamic';
import React from 'react';

interface AvisoMapProps {
  latitud: number;
  longitud: number;
  titulo?: string;
  direccion?: string;
  height?: string | number;
}

const DynamicAvisoMap = dynamic(() => import('./AvisoMapInner'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: '260px',
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
        Cargando mapa interactivo...
      </div>
      <div style={{ fontSize: '0.75rem', color: '#666' }}>OpenStreetMap — Valdivia</div>
    </div>
  ),
});

export default function AvisoMap({
  latitud,
  longitud,
  titulo,
  direccion,
  height = '300px',
}: AvisoMapProps) {
  return (
    <div
      style={{
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        border: '1px solid #DFE3E8',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <DynamicAvisoMap
        latitud={latitud}
        longitud={longitud}
        titulo={titulo}
        direccion={direccion}
      />
    </div>
  );
}
