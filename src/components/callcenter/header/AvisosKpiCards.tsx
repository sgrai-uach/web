import React from 'react';

interface AvisosKpiCardsProps {
  metricas: {
    total: number;
    enTiempo: number;
    precaucion: number;
    urgentes: number;
  };
}

export default function AvisosKpiCards({ metricas }: AvisosKpiCardsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        padding: '0',
      }}
    >
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
          Total Avisos
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary-teal, #1B6F7D)' }}>
          {metricas.total}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#777' }}>Avisos en bandeja</div>
      </div>

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
  );
}
