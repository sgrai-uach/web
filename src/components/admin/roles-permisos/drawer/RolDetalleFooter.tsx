import React from 'react';

interface RolDetalleFooterProps {
  onClose: () => void;
}

export default function RolDetalleFooter({ onClose }: RolDetalleFooterProps) {
  return (
    <footer
      style={{
        padding: '1rem 1.5rem',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #DFE3E8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
      }}
    >
      <button
        type="button"
        disabled
        style={{
          backgroundColor: '#ECEFF1',
          color: '#90A4AE',
          border: '1px solid #CFD8DC',
          borderRadius: 0,
          padding: '0.625rem 1rem',
          fontSize: '0.8125rem',
          fontWeight: 700,
          cursor: 'not-allowed',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}
        title="Próximamente en HU-5: Asignación y revocación de permisos"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        <span>Modificar Permisos (HU-5)</span>
      </button>

      <button
        type="button"
        onClick={onClose}
        style={{
          backgroundColor: 'var(--color-charcoal, #3B3F45)',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: 0,
          padding: '0.625rem 1.5rem',
          fontSize: '0.875rem',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Cerrar Detalle
      </button>
    </footer>
  );
}
