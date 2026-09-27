'use client';

import React from 'react';

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
    <div>
      <label
        htmlFor="descripcion"
        style={{ display: 'block', fontWeight: 700, fontSize: '14px', color: '#14505A', marginBottom: '6px' }}
      >
        4. Descripción de la Emergencia / Situación *
      </label>
      <textarea
        id="descripcion"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        rows={3}
        placeholder="Describe brevemente la afectación, personas o bienes en riesgo (mínimo 5 caracteres)..."
        style={{
          width: '100%',
          padding: '10px 12px',
          border: errorDescripcion ? '2px solid #D32F2F' : '1px solid #3B3F45',
          fontSize: '14px',
          borderRadius: 0,
          resize: 'vertical',
        }}
      />
      {errorDescripcion && (
        <span style={{ color: '#D32F2F', fontSize: '12px', marginTop: '4px', display: 'block' }}>
          {errorDescripcion}
        </span>
      )}
    </div>
  );
}
