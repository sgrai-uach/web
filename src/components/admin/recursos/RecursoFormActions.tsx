import React from 'react';

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
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        style={{
          backgroundColor: 'var(--color-charcoal)',
          color: 'var(--color-white)',
          border: 'none',
          borderRadius: 0,
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Cancelar
      </button>

      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        style={{
          backgroundColor: isValid && !isSubmitting ? 'var(--color-accent-mint)' : 'var(--color-bg-light)',
          color: isValid && !isSubmitting ? 'var(--color-white)' : 'var(--color-charcoal)',
          border: 'none',
          borderRadius: 0,
          padding: '12px 32px',
          fontSize: '14px',
          fontWeight: 700,
          cursor: isValid && !isSubmitting ? 'pointer' : 'not-allowed',
          transition: 'background-color 150ms ease',
        }}
      >
        {isSubmitting ? 'Guardando Recurso...' : 'Guardar Recurso'}
      </button>
    </div>
  );
}
