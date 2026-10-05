'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
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
 * Modal accesible de confirmación para baja lógica de funcionarios (HU-13).
 * Reutiliza el componente común Modal y Button conforme a docs/ARCHITECTURE.md.
 * Impide la baja si el funcionario se encuentra actualmente en misión o patrulla activa.
 */
export default function EmpleadoBajaModal({
  empleado,
  eliminando,
  onConfirmar,
  onCancelar,
}: EmpleadoBajaModalProps) {
  if (!empleado) return null;

  const estaEnTerrenoActivo =
    empleado.estado_operativo === 'en_mision' ||
    empleado.estado_operativo === 'en_patrulla';

  const estadoTexto =
    empleado.estado_operativo === 'en_mision'
      ? 'En Misión'
      : empleado.estado_operativo === 'en_patrulla'
      ? 'En Patrulla'
      : empleado.estado_operativo;

  return (
    <Modal
      isOpen={Boolean(empleado)}
      title="Confirmar Baja de Funcionario"
      onClose={onCancelar}
      maxWidth="540px"
      actions={
        <>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onCancelar}
            disabled={eliminando}
          >
            {estaEnTerrenoActivo ? 'Cerrar' : 'Cancelar'}
          </Button>
          {!estaEnTerrenoActivo && (
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
          )}
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

      {estaEnTerrenoActivo ? (
        <div
          role="alert"
          style={{
            backgroundColor: '#FFFBEB',
            borderLeft: '4px solid #F59E0B',
            padding: '0.85rem',
            fontSize: '0.8125rem',
            color: '#92400E',
            lineHeight: 1.45,
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start',
            borderRadius: '0 4px 4px 0',
          }}
        >
          <AlertTriangle size={20} style={{ color: '#D97706', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#B45309' }}>
              Acción Bloqueada: Funcionario en terreno activo ({estadoTexto})
            </strong>
            <span>
              El sistema impide la baja lógica de funcionarios que forman parte de una cuadrilla o patrulla
              desplegada en terreno. Para proceder, primero debe finalizarse o reasignarse la misión en curso.
            </span>
          </div>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#FEF2F2',
            borderLeft: '4px solid #EF4444',
            padding: '0.75rem',
            fontSize: '0.8125rem',
            color: '#991B1B',
            lineHeight: 1.4,
            borderRadius: '0 4px 4px 0',
          }}
        >
          <strong>Efectos de la baja lógica:</strong>
          <ul style={{ margin: '0.35rem 0 0 1.25rem', padding: 0 }}>
            <li>El usuario no podrá volver a iniciar sesión en el sistema.</li>
            <li>Su estado operativo y disponibilidad territorial quedarán desactivados.</li>
            <li>Se conservará la integridad referencial de misiones e incidentes pasados.</li>
          </ul>
        </div>
      )}
    </Modal>
  );
}
