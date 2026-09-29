'use client';

import React from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/ui/Button';
import type { EmpleadoUsuario } from '@/types/empleados';

interface EmpleadoBajaModalProps {
  empleado: EmpleadoUsuario | null;
  eliminando: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

/**
 * Modal accesible de confirmación para baja lógica de funcionarios.
 * Reutiliza el componente común Modal y Button conforme a docs/ARCHITECTURE.md.
 */
export default function EmpleadoBajaModal({
  empleado,
  eliminando,
  onConfirmar,
  onCancelar,
}: EmpleadoBajaModalProps) {
  if (!empleado) return null;

  return (
    <Modal
      isOpen={Boolean(empleado)}
      title="Confirmar Baja de Funcionario"
      onClose={onCancelar}
      maxWidth="520px"
      actions={
        <>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onCancelar}
            disabled={eliminando}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="md"
            onClick={onConfirmar}
            loading={eliminando}
            disabled={eliminando}
          >
            {eliminando ? 'Dando de baja...' : 'Sí, dar de baja'}
          </Button>
        </>
      }
    >
      <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#4B5563', lineHeight: 1.5 }}>
        ¿Está seguro de que desea dar de baja al empleado{' '}
        <strong>
          {empleado.nombres} {empleado.apellidos}
        </strong>{' '}
        (RUT: {empleado.rut})?
      </p>

      <div
        style={{
          backgroundColor: '#FEF2F2',
          borderLeft: '4px solid #EF4444',
          padding: '0.75rem',
          fontSize: '0.8125rem',
          color: '#991B1B',
          lineHeight: 1.4,
        }}
      >
        <strong>Efectos de la baja lógica:</strong>
        <ul style={{ margin: '0.35rem 0 0 1.25rem', padding: 0 }}>
          <li>El usuario no podrá volver a iniciar sesión en el sistema.</li>
          <li>Su estado operativo y disponibilidad territorial quedarán desactivados.</li>
          <li>Se conservará la integridad referencial de misiones e incidentes pasados.</li>
        </ul>
      </div>
    </Modal>
  );
}
