import React from 'react';

interface AvisosTableEmptyProps {
  cargando: boolean;
}

export default function AvisosTableEmpty({ cargando }: AvisosTableEmptyProps) {
  if (cargando) {
    return (
      <tr>
        <td
          colSpan={7}
          style={{
            padding: '3rem 1rem',
            textAlign: 'center',
            color: 'var(--color-charcoal, #3B3F45)',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
            Cargando avisos de emergencia...
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#666' }}>
            Conectando con la base de datos municipal...
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td
        colSpan={7}
        style={{
          padding: '3.5rem 1rem',
          textAlign: 'center',
          backgroundColor: '#FAFAFA',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-accent-mint, #4FAE9B)',
            color: '#FFFFFF',
            width: '44px',
            height: '44px',
            marginBottom: '0.75rem',
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
            <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
            <path d="m9 8 2 2 4-4" />
          </svg>
        </div>
        <div
          style={{
            fontWeight: 700,
            fontSize: '1rem',
            color: 'var(--color-primary-teal, #1B6F7D)',
            marginBottom: '0.25rem',
          }}
        >
          No hay avisos pendientes en la bandeja
        </div>
        <div style={{ fontSize: '0.875rem', color: '#666' }}>
          El sistema está escuchando en tiempo real vía WebSockets para nuevos reportes de la ciudadanía.
        </div>
      </td>
    </tr>
  );
}
