import React from 'react';
import Button from '@/components/ui/Button';
import { Edit3 } from 'lucide-react';

interface RolDetalleFooterProps {
  onClose: () => void;
  onModificarPermisos?: () => void;
}

export default function RolDetalleFooter({
  onClose,
  onModificarPermisos,
}: RolDetalleFooterProps) {
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
      <Button
        type="button"
        variant="primary"
        size="sm"
        onClick={onModificarPermisos}
        disabled={!onModificarPermisos}
        title="Asignar o revocar permisos a este perfil"
      >
        <Edit3 size={14} aria-hidden="true" />
        <span>Modificar Permisos</span>
      </Button>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onClose}
      >
        Cerrar Detalle
      </Button>
    </footer>
  );
}
