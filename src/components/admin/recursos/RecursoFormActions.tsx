import React from 'react';
import Button from '@/components/ui/Button';

interface RecursoFormActionsProps {
  isValid: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
}

export default function RecursoFormActions({
  isValid,
  isSubmitting,
  onCancel,
}: RecursoFormActionsProps) {
  return (
    <div
      style={{
        borderTop: '1px solid var(--color-bg-light)',
        paddingTop: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}
    >
      <Button
        type="button"
        variant="secondary"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancelar
      </Button>

      <Button
        type="submit"
        variant="primary"
        disabled={!isValid || isSubmitting}
      >
        {isSubmitting ? 'Guardando Recurso...' : 'Guardar Recurso'}
      </Button>
    </div>
  );
}
