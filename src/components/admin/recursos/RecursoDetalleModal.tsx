'use client';

import React from 'react';
import type { RecursoItem } from '@/types/recurso';
import Modal from '@/components/common/Modal';
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
    <button
      type="button"
      onClick={onCerrar}
      style={{
        backgroundColor: 'var(--color-charcoal)',
        color: 'var(--color-white)',
        border: 'none',
        borderRadius: 0,
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      Cerrar Ficha
    </button>
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
