'use client';

import React from 'react';
import { Pencil } from 'lucide-react';
import type { RecursoItem } from '@/types/recurso';
import Modal from '@/components/common/Modal';
import Button from '@/components/ui/Button';
import RecursoDetalleResumen from './detalle/RecursoDetalleResumen';
import RecursoDetalleSpecs from './detalle/RecursoDetalleSpecs';
import RecursoDetalleUbicacion from './detalle/RecursoDetalleUbicacion';

interface RecursoDetalleModalProps {
  recurso: RecursoItem | null;
  onCerrar: () => void;
  onEditar?: (recurso: RecursoItem) => void;
}

export default function RecursoDetalleModal({
  recurso,
  onCerrar,
  onEditar,
}: RecursoDetalleModalProps) {
  if (!recurso) return null;

  const actions = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {onEditar && (
        <Button
          type="button"
          variant="primary"
          onClick={() => {
            onEditar(recurso);
            onCerrar();
          }}
          style={{
            backgroundColor: 'var(--color-accent-mint)',
            color: 'var(--color-white)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Pencil size={15} aria-hidden="true" />
          <span>Editar Recurso</span>
        </Button>
      )}
      <Button
        type="button"
        variant="secondary"
        onClick={onCerrar}
      >
        Cerrar Ficha
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={Boolean(recurso)}
      title="Ficha Técnica de Inventario"
      onClose={onCerrar}
      actions={actions}
      maxWidth="750px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <RecursoDetalleResumen recurso={recurso} />
        <RecursoDetalleSpecs detalles={recurso.detalles} />
        <RecursoDetalleUbicacion
          latitud={recurso.latitud}
          longitud={recurso.longitud}
        />
      </div>
    </Modal>
  );
}
