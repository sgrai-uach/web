'use client';

import React from 'react';

export interface OperadorInfo {
  id: string;
  nombre: string;
  rol: string;
}

export const OPERADORES_PREDEFINIDOS: OperadorInfo[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    nombre: 'Carlos Miranda (Mesa 1)',
    rol: 'Operador Call Center',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    nombre: 'Patricia Valenzuela (Mesa 2)',
    rol: 'Operador Call Center',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
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
      {/* Barra superior de acento institucional */}
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
          {/* Indicador WebSocket en tiempo real */}
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

          {/* Selector de Operador para auditoría y prueba de concurrencia */}
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

      {/* Franja de métricas / KPI Semáforo de Espera */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          padding: '1.25rem 1.5rem 0.5rem 1.5rem',
          backgroundColor: 'var(--color-bg-light, #ECEFF3)',
        }}
      >
        {/* Total pendientes */}
        <div
          style={{
            backgroundColor: 'var(--color-white, #FFFFFF)',
            padding: '1rem',
            borderLeft: '4px solid var(--color-primary-teal, #1B6F7D)',
            borderTop: '1px solid #DFE3E8',
            borderRight: '1px solid #DFE3E8',
            borderBottom: '1px solid #DFE3E8',
          }}
        >
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#666', fontWeight: 600 }}>
            Total Pendientes
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary-teal, #1B6F7D)' }}>
            {metricas.total}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#777' }}>Avisos en bandeja</div>
        </div>

        {/* En tiempo < 15 min */}
        <div
          style={{
            backgroundColor: 'var(--color-white, #FFFFFF)',
            padding: '1rem',
            borderLeft: '4px solid #2E7D32',
            borderTop: '1px solid #DFE3E8',
            borderRight: '1px solid #DFE3E8',
            borderBottom: '1px solid #DFE3E8',
          }}
        >
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#2E7D32', fontWeight: 700 }}>
            &bull; En Tiempo (&lt; 15 min)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2E7D32' }}>
            {metricas.enTiempo}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#777' }}>Atención óptima</div>
        </div>

        {/* Precaución 15-30 min */}
        <div
          style={{
            backgroundColor: 'var(--color-white, #FFFFFF)',
            padding: '1rem',
            borderLeft: '4px solid #F57F17',
            borderTop: '1px solid #DFE3E8',
            borderRight: '1px solid #DFE3E8',
            borderBottom: '1px solid #DFE3E8',
          }}
        >
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#F57F17', fontWeight: 700 }}>
            &bull; Precaución (15&ndash;30 min)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F57F17' }}>
            {metricas.precaucion}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#777' }}>Prioridad intermedia</div>
        </div>

        {/* Urgente > 30 min */}
        <div
          style={{
            backgroundColor: 'var(--color-white, #FFFFFF)',
            padding: '1rem',
            borderLeft: '4px solid #D32F2F',
            borderTop: '1px solid #DFE3E8',
            borderRight: '1px solid #DFE3E8',
            borderBottom: '1px solid #DFE3E8',
          }}
        >
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#D32F2F', fontWeight: 700 }}>
            &bull; Urgente (&gt; 30 min)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#D32F2F' }}>
            {metricas.urgentes}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#777' }}>Atención inmediata requerida</div>
        </div>
      </div>
    </header>
  );
}
