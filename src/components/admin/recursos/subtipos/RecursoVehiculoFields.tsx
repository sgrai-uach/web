import React from 'react';
import type { RecursoDetallesFormFields, TipoCombustible } from '@/types/recurso';

interface RecursoVehiculoFieldsProps {
  detalles: RecursoDetallesFormFields;
  onChange: <K extends keyof RecursoDetallesFormFields>(
    field: K,
    val: RecursoDetallesFormFields[K]
  ) => void;
}

export default function RecursoVehiculoFields({
  detalles,
  onChange,
}: RecursoVehiculoFieldsProps) {
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
        <label htmlFor="kilometraje" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-dark)' }}>
          Kilometraje (km)
        </label>
        <input
          id="kilometraje"
          type="number"
          min="0"
          value={detalles.kilometraje}
          onChange={(e) => onChange('kilometraje', e.target.value)}
          placeholder="0"
          style={{ padding: '8px 10px', fontSize: '14px', border: '1px solid var(--color-charcoal)', borderRadius: 0 }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label htmlFor="tipoCombustible" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-dark)' }}>
          Tipo de Combustible
        </label>
        <select
          id="tipoCombustible"
          value={detalles.tipoCombustible}
          onChange={(e) => onChange('tipoCombustible', e.target.value as TipoCombustible)}
          style={{ padding: '8px 10px', fontSize: '14px', border: '1px solid var(--color-charcoal)', borderRadius: 0 }}
        >
          <option value="">Seleccione...</option>
          <option value="DIESEL">Diésel</option>
          <option value="GASOLINA">Gasolina</option>
          <option value="HIBRIDO">Híbrido</option>
          <option value="ELECTRICO">Eléctrico</option>
          <option value="OTRO">Otro</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label htmlFor="capacidadPasajeros" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-dark)' }}>
          Capacidad de Pasajeros
        </label>
        <input
          id="capacidadPasajeros"
          type="number"
          min="1"
          value={detalles.capacidadPasajeros}
          onChange={(e) => onChange('capacidadPasajeros', e.target.value)}
          placeholder="Ej. 5"
          style={{ padding: '8px 10px', fontSize: '14px', border: '1px solid var(--color-charcoal)', borderRadius: 0 }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label htmlFor="numeroChasis" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-dark)' }}>
          Número de Chasis / VIN
        </label>
        <input
          id="numeroChasis"
          type="text"
          value={detalles.numeroChasis}
          onChange={(e) => onChange('numeroChasis', e.target.value)}
          placeholder="Ej. 8AJHA00G2M0000000"
          style={{ padding: '8px 10px', fontSize: '14px', border: '1px solid var(--color-charcoal)', borderRadius: 0 }}
        />
      </div>
    </div>
  );
}
