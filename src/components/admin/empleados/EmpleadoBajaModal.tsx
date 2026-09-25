'use client';

import React from 'react';
import type { EmpleadoUsuario } from '@/types/empleados';

interface EmpleadoBajaModalProps {
  empleado: EmpleadoUsuario | null;
  eliminando: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function EmpleadoBajaModal({
  empleado,
  eliminando,
  onConfirmar,
  onCancelar,
}: EmpleadoBajaModalProps) {
  if (!empleado) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          maxWidth: '520px',
          width: '100%',
          borderTop: '5px solid #C53030',
          padding: '1.75rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        }}
      >
        <h3
          style={{
            margin: '0 0 0.75rem 0',
            color: 'var(--color-text-dark, #2B2B2B)',
            fontSize: '1.1875rem',
            fontWeight: 700,
          }}
        >
          Confirmar Baja de Funcionario
        </h3>
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
            marginBottom: '1.5rem',
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

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onCancelar}
            disabled={eliminando}
            style={{
              backgroundColor: 'var(--color-charcoal, #3B3F45)',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.625rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: eliminando ? 'not-allowed' : 'pointer',
              borderRadius: 0,
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={eliminando}
            style={{
              backgroundColor: '#C53030',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.625rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: eliminando ? 'not-allowed' : 'pointer',
              opacity: eliminando ? 0.7 : 1,
              borderRadius: 0,
            }}
          >
            {eliminando ? 'Dando de baja...' : 'Sí, dar de baja'}
          </button>
        </div>
      </div>
    </div>
  );
}
