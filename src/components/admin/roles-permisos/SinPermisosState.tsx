'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import { ShieldAlert } from 'lucide-react';

interface SinPermisosStateProps {
  nombreRol?: string;
  onAsignarPermisos?: () => void;
}

export default function SinPermisosState({ nombreRol, onAsignarPermisos }: SinPermisosStateProps) {
  return (
    <div
      style={{
        backgroundColor: '#FAFAFA',
        border: '1px dashed #B0BEC5',
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        margin: '1rem 0',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '52px',
          height: '52px',
          backgroundColor: '#ECEFF1',
          color: '#78909C',
          marginBottom: '1rem',
        }}
      >
        <ShieldAlert size={26} aria-hidden="true" />
      </div>

      <div
        style={{
          fontWeight: 700,
          fontSize: '1.05rem',
          color: 'var(--color-charcoal, #3B3F45)',
          marginBottom: '0.35rem',
        }}
      >
        Sin permisos asignados
      </div>

      <p
        style={{
          fontSize: '0.875rem',
          color: '#607D8B',
          maxWidth: '420px',
          margin: '0 auto 1.25rem auto',
          lineHeight: '1.45',
        }}
      >
        Este perfil {nombreRol ? `(${nombreRol}) ` : ''}no cuenta con permisos
        asignados actualmente en el sistema.
      </p>

      {onAsignarPermisos && (
        <div style={{ marginTop: '0.5rem' }}>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onAsignarPermisos}
          >
            Asignar Permisos Ahora
          </Button>
        </div>
      )}
    </div>
  );
}
