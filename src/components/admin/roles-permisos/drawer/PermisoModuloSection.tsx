import React from 'react';
import type { PermisoAsignado } from '@/types/seguridad';
import PermisoItemRow from './PermisoItemRow';

interface PermisoModuloSectionProps {
  modulo: string;
  permisos: PermisoAsignado[];
}

function obtenerColorModulo(modulo: string): string {
  switch (modulo.toLowerCase()) {
    case 'seguridad':
      return 'var(--color-primary-teal, #1B6F7D)';
    case 'incidentes':
      return '#0288D1';
    case 'recursos y personal':
      return '#689F38';
    case 'misiones':
      return '#E65100';
    case 'eventos atp':
      return '#7B1FA2';
    default:
      return 'var(--color-charcoal, #3B3F45)';
  }
}

export default function PermisoModuloSection({ modulo, permisos }: PermisoModuloSectionProps) {
  const colorModulo = obtenerColorModulo(modulo);

  return (
    <section
      style={{
        backgroundColor: 'var(--color-white, #FFFFFF)',
        border: '1px solid #DFE3E8',
        borderLeft: `4px solid ${colorModulo}`,
      }}
    >
      <div
        style={{
          padding: '0.75rem 1rem',
          backgroundColor: '#F8F9FA',
          borderBottom: '1px solid #DFE3E8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '8px', height: '8px', backgroundColor: colorModulo, display: 'inline-block' }} />
          <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-charcoal, #3B3F45)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Módulo: {modulo}
          </h4>
        </div>

        <span style={{ backgroundColor: '#ECEFF1', color: 'var(--color-charcoal, #3B3F45)', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 0 }}>
          {permisos.length} {permisos.length === 1 ? 'permiso' : 'permisos'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {permisos.map((permiso, idx) => (
          <PermisoItemRow key={permiso.id} permiso={permiso} esUltimo={idx === permisos.length - 1} />
        ))}
      </div>
    </section>
  );
}
