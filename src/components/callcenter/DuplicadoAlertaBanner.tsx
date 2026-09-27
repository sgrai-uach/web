'use client';

import React from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import type { DuplicadoItem } from '@/types/incidente-manual';

interface DuplicadoAlertaBannerProps {
  coincidencias: DuplicadoItem[];
  consultando?: boolean;
}

export default function DuplicadoAlertaBanner({
  coincidencias,
  consultando = false,
}: DuplicadoAlertaBannerProps) {
  if (consultando) {
    return (
      <div
        style={{
          backgroundColor: '#FFF9E6',
          borderLeft: '4px solid #FFA000',
          padding: '10px 14px',
          fontSize: '13px',
          color: '#5D4037',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <Loader2 size={16} color="#FFA000" aria-hidden="true" />
        <span>Verificando posibles reportes duplicados cercanos...</span>
      </div>
    );
  }

  if (!coincidencias || coincidencias.length === 0) {
    return null;
  }

  const distanciaMinima = Math.min(
    ...coincidencias.map((c) => c.distanciaMetros ?? 0)
  );

  return (
    <div
      role="alert"
      style={{
        backgroundColor: '#FFF8E1',
        borderLeft: '4px solid #FFA000',
        padding: '12px 16px',
        fontSize: '13px',
        color: '#4E342E',
        marginBottom: '18px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginBottom: '4px' }}>
        <AlertTriangle size={16} color="#FFA000" aria-hidden="true" />
        <span>Atención: Posible incidente duplicado detectado</span>
      </div>
      <p style={{ margin: '0 0 6px 0', lineHeight: 1.4 }}>
        Se identificaron <strong>{coincidencias.length}</strong> reporte(s) o incidente(s) del mismo tipo a aproximadamente{' '}
        <strong>{Math.round(distanciaMinima)} metros</strong> en las últimas 24 horas.
      </p>
      <p style={{ margin: 0, fontSize: '12px', color: '#6D4C41' }}>
        Puedes continuar completando el formulario. Si confirmas el reporte, el sistema te consultará si deseas omitirlo para no saturar al Encargado.
      </p>
    </div>
  );
}
