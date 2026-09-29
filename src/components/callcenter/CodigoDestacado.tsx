'use client';

import React from 'react';

interface CodigoDestacadoProps {
  titulo: string;
  codigo: string;
  subtitulo: string;
  borderColor: string;
  codigoColor: string;
}

export default function CodigoDestacado({
  titulo,
  codigo,
  subtitulo,
  borderColor,
  codigoColor,
}: CodigoDestacadoProps) {
  return (
    <div
      style={{
        backgroundColor: '#ECEFF3',
        borderLeft: `4px solid ${borderColor}`,
        padding: '16px',
      }}
    >
      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#555', fontWeight: 700 }}>
        {titulo}
      </div>
      <div
        style={{
          fontSize: '26px',
          fontWeight: 900,
          color: codigoColor,
          letterSpacing: '1px',
          marginTop: '4px',
        }}
      >
        {codigo}
      </div>
      <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
        {subtitulo}
      </div>
    </div>
  );
}
