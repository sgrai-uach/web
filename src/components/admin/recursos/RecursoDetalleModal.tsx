'use client';

import React from 'react';
import type { RecursoItem } from '@/types/recurso';
import Modal from '@/components/common/Modal';
import Button from '@/components/ui/Button';
import RecursoDetalleResumen from './detalle/RecursoDetalleResumen';
import RecursoDetalleSpecs from './detalle/RecursoDetalleSpecs';
import RecursoDetalleUbicacion from './detalle/RecursoDetalleUbicacion';

interface RecursoDetalleModalProps {
  recurso: RecursoItem | null;
  onCerrar: () => void;
}

export default function RecursoDetalleModal({
  recurso,
  onCerrar,
}: RecursoDetalleModalProps) {
  if (!recurso) return null;

  const actions = (
    <Button
      type="button"
      variant="secondary"
      onClick={onCerrar}
    >
      Cerrar Ficha
    </Button>
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
