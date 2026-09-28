import React from 'react';
import type { RecursoDetallesFormFields } from '@/types/recurso';

interface RecursoMaquinariaFieldsProps {
  detalles: RecursoDetallesFormFields;
  onChange: <K extends keyof RecursoDetallesFormFields>(
    field: K,
    val: RecursoDetallesFormFields[K]
  ) => void;
}

export default function RecursoMaquinariaFields({
  detalles,
  onChange,
}: RecursoMaquinariaFieldsProps) {
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
        <label htmlFor="capacidadCargaKg" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-dark)' }}>
          Capacidad de Carga (kg)
        </label>
        <input
          id="capacidadCargaKg"
          type="number"
          min="1"
          value={detalles.capacidadCargaKg}
          onChange={(e) => onChange('capacidadCargaKg', e.target.value)}
          placeholder="Ej. 5000"
          style={{ padding: '8px 10px', fontSize: '14px', border: '1px solid var(--color-charcoal)', borderRadius: 0 }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label htmlFor="alcanceMaximoMetros" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-dark)' }}>
          Alcance Máximo (metros)
        </label>
        <input
          id="alcanceMaximoMetros"
          type="number"
          min="0.1"
          step="0.1"
          value={detalles.alcanceMaximoMetros}
          onChange={(e) => onChange('alcanceMaximoMetros', e.target.value)}
          placeholder="Ej. 18.5"
          style={{ padding: '8px 10px', fontSize: '14px', border: '1px solid var(--color-charcoal)', borderRadius: 0 }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label htmlFor="tipoGrua" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-dark)' }}>
          Tipo de Grúa / Maquinaria
        </label>
        <input
          id="tipoGrua"
          type="text"
          value={detalles.tipoGrua}
          onChange={(e) => onChange('tipoGrua', e.target.value)}
          placeholder="Ej. Pluma, Horquilla, Excavadora"
          style={{ padding: '8px 10px', fontSize: '14px', border: '1px solid var(--color-charcoal)', borderRadius: 0 }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label htmlFor="horometro" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-dark)' }}>
          Horómetro (Horas de Uso)
        </label>
        <input
          id="horometro"
          type="number"
          min="0"
          value={detalles.horometro}
          onChange={(e) => onChange('horometro', e.target.value)}
          placeholder="Ej. 120"
          style={{ padding: '8px 10px', fontSize: '14px', border: '1px solid var(--color-charcoal)', borderRadius: 0 }}
        />
      </div>
    </div>
  );
}
