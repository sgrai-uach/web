import React from 'react';
import { X } from 'lucide-react';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import type { AvisoItem } from '@/types/avisos';

interface AvisoDetalleHeaderProps {
  aviso: AvisoItem;
  onClose: () => void;
}

export default function AvisoDetalleHeader({ aviso, onClose }: AvisoDetalleHeaderProps) {
  const formatearFecha = (fechaStr: string) => {
    try {
      return new Date(fechaStr).toLocaleString('es-CL', {
        dateStyle: 'short',
        timeStyle: 'medium',
      });
    } catch {
      return fechaStr;
    }
  };

  return (
    <div
      style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid #DFE3E8',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        backgroundColor: '#FFFFFF',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', backgroundColor: '#E3F2FD', color: '#1565C0' }}>
            Aviso Call Center
          </span>
          <span style={{ fontSize: '0.75rem', color: '#666' }}>
            Recibido: {formatearFecha(aviso.creadoEn)} ({aviso.minutosEnEspera} min en espera)
          </span>
        </div>
        <Heading as="h3" variant="h3" color="teal-dark" noMargin>
          {aviso.tipoPreliminarNombre || 'Aviso de Emergencia sin clasificar'}
        </Heading>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onClose}
        aria-label="Cerrar modal"
        style={{ minHeight: 'auto', padding: '4px' }}
      >
        <X size={20} aria-hidden="true" />
      </Button>
    </div>
  );
}
