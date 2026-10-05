'use client';

import React from 'react';
import { Trash2, Pencil } from 'lucide-react';
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
  onEliminar?: (recurso: RecursoItem) => void;
  puedeEliminar?: boolean;
}

export default function RecursoDetalleModal({
  recurso,
  onCerrar,
  onEditar,
  onEliminar,
  puedeEliminar = false,
}: RecursoDetalleModalProps) {
  if (!recurso) return null;

  const actions = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
      <div>
        {puedeEliminar && onEliminar && (
          <Button
            type="button"
            variant="destructive"
            size="md"
            onClick={() => {
              onCerrar();
              onEliminar(recurso);
            }}
            icon={<Trash2 size={16} aria-hidden="true" />}
            iconPosition="left"
          >
            Dar de baja recurso
          </Button>
        )}
      </div>

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
          size="md"
          onClick={onCerrar}
        >
          Cerrar Ficha
        </Button>
      </div>
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

