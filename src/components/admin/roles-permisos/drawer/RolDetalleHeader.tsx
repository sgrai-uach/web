import React from 'react';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import { X } from 'lucide-react';

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
        <Heading id="drawer-title" as="h2" variant="h2" color="white" noMargin>
          {nombre}
        </Heading>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onClose}
        style={{ color: '#FFFFFF', padding: '0.25rem', minHeight: 'auto' }}
        title="Cerrar panel de detalle"
        aria-label="Cerrar panel"
      >
        <X size={20} aria-hidden="true" />
      </Button>
    </header>
  );
}
