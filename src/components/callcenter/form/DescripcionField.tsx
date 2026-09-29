'use client';

import React from 'react';
import Textarea from '@/components/ui/Textarea';

interface DescripcionFieldProps {
  descripcion: string;
  setDescripcion: (desc: string) => void;
  errorDescripcion?: string;
}

export default function DescripcionField({
  descripcion,
  setDescripcion,
  errorDescripcion,
}: DescripcionFieldProps) {
  return (
    <Textarea
      id="descripcion"
      label="5. Descripción de la Emergencia / Situación"
      requiredIndicator
      value={descripcion}
      onChange={(e) => setDescripcion(e.target.value)}
      rows={3}
      placeholder="Describe brevemente la afectación, personas o bienes en riesgo (mínimo 5 caracteres)..."
      error={errorDescripcion}
    />
  );
}
