'use client';

import React from 'react';
import AvisosKpiCards from './header/AvisosKpiCards';

export interface OperadorInfo {
  id: string;
  nombre: string;
  rol: string;
}

export const OPERADORES_PREDEFINIDOS: OperadorInfo[] = [
  {
    id: 'c1111111-1111-4111-8111-111111111111',
    nombre: 'Carlos Miranda (Mesa 1)',
    rol: 'Operador Call Center',
  },
  {
    id: 'c2222222-2222-4222-8222-222222222222',
    nombre: 'Patricia Valenzuela (Mesa 2)',
    rol: 'Operador Call Center',
  },
  {
    id: 'c3333333-3333-4333-8333-333333333333',
    nombre: 'Rodrigo Fuentes (Mesa 3)',
    rol: 'Operador Call Center',
  },
];

interface AvisosHeaderProps {
  socketConnected: boolean;
  operadorActivo: OperadorInfo;
  onCambiarOperador: (op: OperadorInfo) => void;
  metricas: {
    total: number;
    enTiempo: number;
    precaucion: number;
    urgentes: number;
  };
}

export default function AvisosHeader({
  socketConnected,
  operadorActivo,
  onCambiarOperador,
  metricas,
}: AvisosHeaderProps) {
  return (
    <header style={{ width: '100%', marginBottom: '1.5rem' }}>
      <div
        style={{
          backgroundColor: 'var(--color-primary-teal-dark, #14505A)',
          color: 'var(--color-text-light, #FFFFFF)',
          padding: '0.625rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          borderBottom: '3px solid var(--color-accent-mint, #4FAE9B)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              backgroundColor: 'var(--color-accent-mint, #4FAE9B)',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1rem',
              color: '#FFFFFF',
            }}
          >
            V
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', letterSpacing: '0.5px', textTransform: 'uppercase', opacity: 0.9 }}>
              Municipalidad de Valdivia &bull; Gestión de Riesgos de Desastres
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.125rem', letterSpacing: '-0.2px' }}>
              SGRAI &mdash; Centro de Recepción Call Center
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '0.35rem 0.75rem',
              fontSize: '0.8125rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
            title={socketConnected ? 'Suscrito a sala call-center' : 'Reconectando con el servidor'}
          >
            <span
              style={{
                display: 'inline-block',
                width: '10px',
                height: '10px',
                backgroundColor: socketConnected ? '#4FAE9B' : '#FFA726',
                borderRadius: '50%',
                boxShadow: socketConnected ? '0 0 6px #4FAE9B' : 'none',
              }}
            />
            <span>{socketConnected ? 'En vivo (WebSockets)' : 'Conectando...'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
            <span style={{ opacity: 0.85 }}>Operador:</span>
            <select
              value={operadorActivo.id}
              onChange={(e) => {
                const found = OPERADORES_PREDEFINIDOS.find((o) => o.id === e.target.value);
                if (found) onCambiarOperador(found);
              }}
              style={{
                backgroundColor: '#FFFFFF',
                color: 'var(--color-charcoal, #3B3F45)',
                border: 'none',
                padding: '0.35rem 0.6rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                borderRadius: 0,
              }}
              aria-label="Seleccionar operador activo"
            >
              {OPERADORES_PREDEFINIDOS.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <AvisosKpiCards metricas={metricas} />
    </header>
  );
}
