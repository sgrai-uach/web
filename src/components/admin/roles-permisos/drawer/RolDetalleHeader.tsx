import React from 'react';

interface RolDetalleHeaderProps {
  nombre: string;
  onClose: () => void;
}

export default function RolDetalleHeader({ nombre, onClose }: RolDetalleHeaderProps) {
  return (
    <header
      style={{
        backgroundColor: 'var(--color-primary-teal-dark, #14505A)',
        color: '#FFFFFF',
        padding: '1.25rem 1.5rem',
        borderBottom: '3px solid var(--color-accent-mint, #4FAE9B)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '1rem',
      }}
    >
      <div>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.85, marginBottom: '0.2rem' }}>
          Auditoría y Gestión de Perfil
        </div>
        <h2 id="drawer-title" style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.2px', margin: 0 }}>
          {nombre}
        </h2>
      </div>

      <button
        type="button"
        onClick={onClose}
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          color: '#FFFFFF',
          fontSize: '1.75rem',
          lineHeight: 1,
          cursor: 'pointer',
          padding: '0.25rem',
          opacity: 0.85,
        }}
        title="Cerrar panel de detalle"
        aria-label="Cerrar panel"
      >
        &times;
      </button>
    </header>
  );
}
