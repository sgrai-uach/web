import React from 'react';
import { Lock } from 'lucide-react';

interface PermisoItemRowProps {
  permiso: {
    id: string;
    codigo: string;
    nombre: string;
    descripcion?: string | null;
  };
  esUltimo: boolean;
  modoEdicion?: boolean;
  seleccionado?: boolean;
  bloqueado?: boolean;
  onToggle?: (id: string) => void;
}

export default function PermisoItemRow({
  permiso,
  esUltimo,
  modoEdicion = false,
  seleccionado = true,
  bloqueado = false,
  onToggle,
}: PermisoItemRowProps) {
  return (
    <div
      style={{
        padding: '0.875rem 1rem',
        borderBottom: esUltimo ? 'none' : '1px solid #EDF1F5',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '1rem',
        backgroundColor: modoEdicion && seleccionado ? '#FAFCFA' : 'transparent',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-charcoal, #3B3F45)' }}>
            {permiso.nombre}
          </span>
          <code
            style={{
              backgroundColor: '#ECEFF3',
              color: 'var(--color-primary-teal, #1B6F7D)',
              fontSize: '0.75rem',
              padding: '0.15rem 0.4rem',
              fontWeight: 600,
              fontFamily: 'monospace',
              border: '1px solid #CFD8DC',
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
        {modoEdicion ? (
          bloqueado ? (
            <>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'not-allowed' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-warning, #E65100)' }}>
                  Protegido
                </span>
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  style={{ width: '16px', height: '16px', borderRadius: 0, cursor: 'not-allowed' }}
                  aria-label={`Permiso ${permiso.nombre} protegido`}
                />
              </label>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-warning, #E65100)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                <Lock size={10} aria-hidden="true" />
                No revocable
              </span>
            </>
          ) : (
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: seleccionado ? '#2E7D32' : '#888888' }}>
                {seleccionado ? 'Asignado' : 'Inactivo'}
              </span>
              <input
                type="checkbox"
                checked={Boolean(seleccionado)}
                onChange={() => onToggle?.(permiso.id)}
                style={{
                  cursor: 'pointer',
                  width: '16px',
                  height: '16px',
                  borderRadius: 0,
                  accentColor: 'var(--color-accent-mint, #4FAE9B)',
                }}
                aria-label={`Permiso ${permiso.nombre}`}
              />
            </label>
          )
        ) : (
          <>
            <label
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'default', opacity: 0.9 }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2E7D32' }}>Asignado</span>
              <input
                type="checkbox"
                checked={true}
                disabled
                readOnly
                style={{ cursor: 'default', width: '16px', height: '16px', accentColor: 'var(--color-accent-mint, #4FAE9B)' }}
                aria-label={`Permiso ${permiso.nombre} activo (modo lectura)`}
              />
            </label>
            <span style={{ fontSize: '0.6875rem', color: '#888', fontStyle: 'italic' }}>
              (Modo lectura)
            </span>
          </>
        )}
      </div>
    </div>
  );
}
