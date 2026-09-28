import React from 'react';
import type { RecursoDetallesFormFields } from '@/types/recurso';

interface RecursoMotobombaFieldsProps {
  detalles: RecursoDetallesFormFields;
  onChange: <K extends keyof RecursoDetallesFormFields>(
    field: K,
    val: RecursoDetallesFormFields[K]
  ) => void;
}

export default function RecursoMotobombaFields({
  detalles,
  onChange,
}: RecursoMotobombaFieldsProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-light)',
        padding: '16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label htmlFor="caudalMaximoLpm" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-dark)' }}>
          Caudal Máximo (Litros/min)
        </label>
        <input
          id="caudalMaximoLpm"
          type="number"
          min="1"
          value={detalles.caudalMaximoLpm}
          onChange={(e) => onChange('caudalMaximoLpm', e.target.value)}
          placeholder="Ej. 1000"
          style={{ padding: '8px 10px', fontSize: '14px', border: '1px solid var(--color-charcoal)', borderRadius: 0 }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label htmlFor="diametroPulgadas" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-dark)' }}>
          Diámetro de Salida (Pulgadas)
        </label>
        <input
          id="diametroPulgadas"
          type="number"
          min="0.5"
          step="0.5"
          value={detalles.diametroPulgadas}
          onChange={(e) => onChange('diametroPulgadas', e.target.value)}
          placeholder="Ej. 2, 3"
          style={{ padding: '8px 10px', fontSize: '14px', border: '1px solid var(--color-charcoal)', borderRadius: 0 }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label htmlFor="potenciaHp" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-dark)' }}>
          Potencia del Motor (HP)
        </label>
        <input
          id="potenciaHp"
          type="number"
          min="0.1"
          step="0.1"
          value={detalles.potenciaHp}
          onChange={(e) => onChange('potenciaHp', e.target.value)}
          placeholder="Ej. 5.5"
          style={{ padding: '8px 10px', fontSize: '14px', border: '1px solid var(--color-charcoal)', borderRadius: 0 }}
        />
      </div>
    </div>
  );
}
