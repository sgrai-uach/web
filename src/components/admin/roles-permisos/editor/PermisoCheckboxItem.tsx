import React from 'react';
import { Lock } from 'lucide-react';
import type { PermisoCatalogoItem } from '@/types/seguridad';

interface PermisoCheckboxItemProps {
  permiso: PermisoCatalogoItem;
  seleccionado: boolean;
  bloqueado?: boolean;
  onToggle: (permisoId: string) => void;
}

export default function PermisoCheckboxItem({
  permiso,
  seleccionado,
  bloqueado = false,
  onToggle,
}: PermisoCheckboxItemProps) {
  const handleChange = () => {
    if (!bloqueado) {
      onToggle(permiso.id);
    }
  };

  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '10px 12px',
        backgroundColor: seleccionado ? 'var(--color-white, #FFFFFF)' : '#F8FAFC',
        border: `1px solid ${seleccionado ? 'var(--color-primary-teal, #1B6F7D)' : 'var(--border-color-neutral, #DFE3E8)'}`,
        cursor: bloqueado ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.15s ease, border-color 0.15s ease',
        userSelect: 'none',
        borderRadius: 0,
      }}
      title={bloqueado ? 'Permiso protegido del Administrador (no revocable)' : undefined}
    >
      <input
        type="checkbox"
        checked={seleccionado}
        disabled={bloqueado}
        onChange={handleChange}
        style={{
          marginTop: '3px',
          accentColor: 'var(--color-primary-teal, #1B6F7D)',
          cursor: bloqueado ? 'not-allowed' : 'pointer',
          borderRadius: 0,
          width: '16px',
          height: '16px',
        }}
        aria-label={`Permiso ${permiso.nombre}`}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: 'var(--font-size-base, 14px)',
              fontWeight: 600,
              color: 'var(--color-charcoal, #3B3F45)',
            }}
          >
            {permiso.nombre}
          </span>

          <code
            style={{
              fontSize: 'var(--font-size-xs, 11px)',
              backgroundColor: 'var(--color-bg-light, #ECEFF3)',
              color: 'var(--color-primary-teal-dark, #14505A)',
              padding: '1px 6px',
              borderRadius: 0,
              fontFamily: 'monospace',
            }}
          >
            {permiso.codigo}
          </code>

          {bloqueado && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--color-warning, #E65100)',
                backgroundColor: 'var(--color-warning-bg, #FFF3E0)',
                padding: '1px 6px',
                borderRadius: 0,
              }}
            >
              <Lock size={12} aria-hidden="true" />
              Protegido
            </span>
          )}
        </div>

        {permiso.descripcion && (
          <span
            style={{
              fontSize: 'var(--font-size-sm, 12px)',
              color: 'var(--color-text-muted, #5F676E)',
              lineHeight: 1.4,
            }}
          >
            {permiso.descripcion}
          </span>
        )}
      </div>
    </label>
  );
}
