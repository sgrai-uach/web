'use client';

import React from 'react';

interface SinPermisosStateProps {
  nombreRol?: string;
}

export default function SinPermisosState({ nombreRol }: SinPermisosStateProps) {
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
      {/* Ícono de escudo/candado plano */}
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
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="11" width="18" height="11" rx="0" ry="0" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
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

      <div
        style={{
          display: 'inline-block',
          backgroundColor: '#FFF3E0',
          color: '#E65100',
          border: '1px solid #FFE0B2',
          padding: '0.35rem 0.75rem',
          fontSize: '0.75rem',
          fontWeight: 600,
        }}
      >
        Nota: La asignación de permisos estará disponible a través del módulo de gestión (HU-5)
      </div>
    </div>
  );
}
