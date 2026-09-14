'use client';

import React from 'react';

interface AccesoDenegadoStateProps {
  rolUsuario: string;
  onCambiarAAdmin: () => void;
}

export default function AccesoDenegadoState({
  rolUsuario,
  onCambiarAAdmin,
}: AccesoDenegadoStateProps) {
  return (
    <div
      style={{
        maxWidth: '700px',
        margin: '3rem auto',
        backgroundColor: 'var(--color-white, #FFFFFF)',
        borderTop: '4px solid #D32F2F',
        borderLeft: '1px solid #DFE3E8',
        borderRight: '1px solid #DFE3E8',
        borderBottom: '1px solid #DFE3E8',
        padding: '2.5rem 2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '64px',
          height: '64px',
          backgroundColor: '#FFEBEE',
          color: '#D32F2F',
          marginBottom: '1.25rem',
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
      </div>

      <div
        style={{
          fontSize: '0.8125rem',
          textTransform: 'uppercase',
          fontWeight: 700,
          color: '#D32F2F',
          letterSpacing: '0.5px',
          marginBottom: '0.25rem',
        }}
      >
        HTTP 403 &bull; Acceso Denegado (RBAC)
      </div>

      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 800,
          color: 'var(--color-charcoal, #3B3F45)',
          marginBottom: '0.75rem',
        }}
      >
        Se requiere perfil de Administrador
      </h2>

      <p
        style={{
          fontSize: '0.925rem',
          color: '#555',
          lineHeight: '1.5',
          marginBottom: '1.5rem',
        }}
      >
        La sesión actual tiene asignado el perfil <strong>&ldquo;{rolUsuario}&rdquo;</strong>.
        Este módulo de seguridad y auditoría de permisos está restringido exclusivamente
        para usuarios con el rol de <strong>Administrador</strong> de la Dirección de Gestión de
        Riesgos de Desastres.
      </p>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={onCambiarAAdmin}
          style={{
            backgroundColor: 'var(--color-primary-teal, #1B6F7D)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 0,
            padding: '0.75rem 1.5rem',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
          }}
        >
          Cambiar a Administrador General &rarr;
        </button>

        <a
          href="/callcenter"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: 'var(--color-charcoal, #3B3F45)',
            color: '#FFFFFF',
            padding: '0.75rem 1.25rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Ir a Centro Call Center
        </a>
      </div>
    </div>
  );
}
