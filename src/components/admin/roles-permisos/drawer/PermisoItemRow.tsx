import React from 'react';
import type { PermisoAsignado } from '@/types/seguridad';

interface PermisoItemRowProps {
  permiso: PermisoAsignado;
  esUltimo: boolean;
}

export default function PermisoItemRow({ permiso, esUltimo }: PermisoItemRowProps) {
  return (
    <div
      style={{
        padding: '0.875rem 1rem',
        borderBottom: esUltimo ? 'none' : '1px solid #EDF1F5',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '1rem',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-charcoal, #3B3F45)' }}>
            {permiso.nombre}
          </span>
          <code
            style={{
              backgroundColor: '#ECEFF3', color: 'var(--color-primary-teal, #1B6F7D)',
              fontSize: '0.75rem', padding: '0.15rem 0.4rem', fontWeight: 600,
              fontFamily: 'monospace', border: '1px solid #CFD8DC',
            }}
          >
            {permiso.codigo}
          </code>
        </div>
        {permiso.descripcion && (
          <p style={{ fontSize: '0.8125rem', color: '#555555', lineHeight: '1.4', margin: 0 }}>
            {permiso.descripcion}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
        <label
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'not-allowed', opacity: 0.9 }}
          title="La modificación y revocación de permisos estará habilitada en HU-5"
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2E7D32' }}>Asignado</span>
          <input
            type="checkbox"
            checked={true}
            disabled
            readOnly
            style={{ cursor: 'not-allowed', width: '16px', height: '16px', accentColor: 'var(--color-accent-mint, #4FAE9B)' }}
            aria-label={`Permiso ${permiso.nombre} activo (modo lectura)`}
          />
        </label>
        <span style={{ fontSize: '0.6875rem', color: '#888', fontStyle: 'italic' }}>
          (Modo lectura &bull; HU-5)
        </span>
      </div>
    </div>
  );
}
