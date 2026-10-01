'use client';

import React from 'react';
import Button from '@/components/ui/Button';

interface EmpleadoFormActionsProps {
  guardando: boolean;
  onCancelar: () => void;
  onDarDeBaja?: () => void;
  deshabilitarBaja?: boolean;
}

export default function EmpleadoFormActions({
  guardando,
  onCancelar,
  onDarDeBaja,
  deshabilitarBaja = false,
}: EmpleadoFormActionsProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '0.75rem',
        borderTop: '1px solid var(--border-color-neutral, #DFE3E8)',
        paddingTop: '1.25rem',
      }}
    >
      {onDarDeBaja && (
        <Button
          type="button"
          variant="destructive"
          size="md"
          onClick={onDarDeBaja}
          disabled={guardando || deshabilitarBaja}
          title={
            deshabilitarBaja
              ? 'El funcionario ya se encuentra inactivo / dado de baja'
              : 'Dar de baja al funcionario'
          }
          style={{ marginRight: 'auto' }}
        >
          Dar de baja
        </Button>
      )}
      <Button
        type="button"
        variant="secondary"
        size="md"
        onClick={onCancelar}
        disabled={guardando}
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        variant="primary"
        size="md"
        disabled={guardando}
      >
        {guardando ? 'Guardando...' : 'Guardar Cambios'}
      </Button>
    </div>
  );
}
