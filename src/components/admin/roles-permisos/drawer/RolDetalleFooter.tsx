import React from 'react';
import Button from '@/components/ui/Button';
import { Edit3 } from 'lucide-react';

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
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled
        title="Próximamente en HU-5: Asignación y revocación de permisos"
      >
        <Edit3 size={14} aria-hidden="true" />
        <span>Modificar Permisos (HU-5)</span>
      </Button>

      <Button
        type="button"
        variant="secondary"
        onClick={onClose}
      >
        Cerrar Detalle
      </Button>
    </footer>
  );
}
