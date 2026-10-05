'use client';

import React from 'react';
import Modal from '@/components/common/Modal';
import type { EmpleadoUsuario } from '@/types/empleados';
import EmpleadoFormulario from './EmpleadoFormulario';

export interface EmpleadoModificarModalProps {
  usuario: EmpleadoUsuario | null;
  isOpen?: boolean;
  onClose: () => void;
  onEmpleadoActualizado: (empleado: EmpleadoUsuario) => void;
  onDarDeBaja?: () => void;
}

/**
 * Modal accesible de modificación de funcionarios (HU-12).
 * Conforme a docs/ARCHITECTURE.md y F-02 / sistema de diseño municipal.
 * Se despliega de manera centrada sobre la vista de personal, reemplazando
 * el panel lateral para mantener consistencia con los demás módulos.
 */
export default function EmpleadoModificarModal({
  usuario,
  isOpen,
  onClose,
  onEmpleadoActualizado,
  onDarDeBaja,
}: EmpleadoModificarModalProps) {
  const abierto = isOpen !== undefined ? isOpen && Boolean(usuario) : Boolean(usuario);

  if (!usuario) return null;

  return (
    <Modal
      isOpen={abierto}
      title={`Ficha de Modificación: ${usuario.nombres} ${usuario.apellidos}`}
      onClose={onClose}
      maxWidth="780px"
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <EmpleadoFormulario
          key={usuario.usuario_id}
          usuario={usuario}
          onEmpleadoActualizado={onEmpleadoActualizado}
          onCancelar={onClose}
          onDarDeBaja={onDarDeBaja}
          isModal
        />
      </div>
    </Modal>
  );
}
