'use client';

import React from 'react';
import Button from '@/components/ui/Button';

interface FormSubmitActionsProps {
  enviando: boolean;
  onLimpiar: () => void;
}

export default function FormSubmitActions({
  enviando,
  onLimpiar,
}: FormSubmitActionsProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        borderTop: '2px solid #ECEFF3',
        paddingTop: '20px',
        flexWrap: 'wrap',
        gap: '16px',
      }}
    >
      <Button
        type="button"
        variant="secondary"
        size="lg"
        onClick={onLimpiar}
        disabled={enviando}
        style={{ minWidth: '150px' }}
      >
        Limpiar campos
      </Button>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={enviando}
        style={{ minWidth: '240px' }}
      >
        {enviando ? 'Enviando reporte...' : 'Guardar y Notificar al Encargado'}
      </Button>
    </div>
  );
}
