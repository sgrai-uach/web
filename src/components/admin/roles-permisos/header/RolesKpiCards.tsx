import React from 'react';
import type { MetricasRoles } from '@/types/seguridad';

interface RolesKpiCardsProps {
  metricas: MetricasRoles;
}

export default function RolesKpiCards({ metricas }: RolesKpiCardsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        padding: '1.25rem 1.5rem 0.5rem 1.5rem',
        backgroundColor: 'var(--color-bg-light, #ECEFF3)',
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
          Total de Perfiles
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary-teal, #1B6F7D)' }}>
          {metricas.totalPerfiles}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#777' }}>Roles registrados en el sistema</div>
      </div>

      <div
        style={{
          backgroundColor: 'var(--color-white, #FFFFFF)',
          padding: '1rem',
          borderLeft: '4px solid var(--color-charcoal, #3B3F45)',
          borderTop: '1px solid #DFE3E8',
          borderRight: '1px solid #DFE3E8',
          borderBottom: '1px solid #DFE3E8',
        }}
      >
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#555', fontWeight: 600 }}>
          Perfiles de Sistema
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-charcoal, #3B3F45)' }}>
          {metricas.perfilesSistema}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#777' }}>Roles protegidos por catálogo</div>
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
          &bull; Con Permisos Activos
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2E7D32' }}>
          {metricas.perfilesConPermisos}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#777' }}>Con capacidades operativas</div>
      </div>

      <div
        style={{
          backgroundColor: 'var(--color-white, #FFFFFF)',
          padding: '1rem',
          borderLeft: '4px solid #E65100',
          borderTop: '1px solid #DFE3E8',
          borderRight: '1px solid #DFE3E8',
          borderBottom: '1px solid #DFE3E8',
        }}
      >
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#E65100', fontWeight: 700 }}>
          &bull; Sin Permisos Asignados
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#E65100' }}>
          {metricas.perfilesSinPermisos}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#777' }}>Pendientes de parametrización</div>
      </div>

      <div
        style={{
          backgroundColor: 'var(--color-white, #FFFFFF)',
          padding: '1rem',
          borderLeft: '4px solid var(--color-accent-mint, #4FAE9B)',
          borderTop: '1px solid #DFE3E8',
          borderRight: '1px solid #DFE3E8',
          borderBottom: '1px solid #DFE3E8',
        }}
      >
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-primary-teal, #1B6F7D)', fontWeight: 700 }}>
          Acciones de Seguridad
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-accent-mint, #4FAE9B)' }}>
          {metricas.totalPermisosUnicos}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#777' }}>Permisos únicos en catálogo</div>
      </div>
    </div>
  );
}
