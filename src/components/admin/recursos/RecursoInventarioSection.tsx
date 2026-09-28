import React from 'react';
import Heading from '@/components/ui/Heading';

interface RecursoInventarioSectionProps {
  esIndividual: boolean;
  cantidadInventario: number | string;
  cantidadMinima: number | string;
  errorCantidadInventario?: string;
  onChangeCantidadInventario: (val: number | string) => void;
  onChangeCantidadMinima: (val: number | string) => void;
  onKeyDownNumeric: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur: (field: string) => void;
}

export default function RecursoInventarioSection({
  esIndividual,
  cantidadInventario,
  cantidadMinima,
  errorCantidadInventario,
  onChangeCantidadInventario,
  onChangeCantidadMinima,
  onKeyDownNumeric,
  onBlur,
}: RecursoInventarioSectionProps) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div
        style={{
          borderBottom: '2px solid var(--color-primary-teal)',
          paddingBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ color: 'var(--color-primary-teal)', fontWeight: 'bold', fontSize: '18px' }}>
          2.
        </span>
        <Heading as="h2" variant="h3" color="teal-dark" noMargin>
          Inventario y Stock
        </Heading>
      </div>

      {esIndividual ? (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--color-bg-light)',
            borderLeft: '4px solid var(--color-accent-mint)',
            fontSize: '14px',
            color: 'var(--color-primary-teal-dark)',
          }}
        >
          <strong>Cantidad fijada en 1:</strong> Al ser un vehículo o maquinaria, el inventario se registra por unidad única. Su estado inicial será calculado automáticamente como <code>DISPONIBLE</code>.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {/* Cantidad Inicial */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="cantidadInventario" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-dark)' }}>
              Cantidad <span style={{ color: '#C81E1E' }}>*</span>
            </label>
            <input
              id="cantidadInventario"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              required
              autoComplete="off"
              value={cantidadInventario}
              onKeyDown={onKeyDownNumeric}
              onChange={(e) => {
                const digitsOnly = e.target.value.replace(/\D/g, '');
                onChangeCantidadInventario(digitsOnly === '' ? '' : parseInt(digitsOnly, 10));
              }}
              onBlur={() => onBlur('cantidadInventario')}
              placeholder="Ej. 50"
              style={{
                padding: '10px 12px',
                fontSize: '14px',
                border: errorCantidadInventario ? '2px solid #C81E1E' : '1px solid var(--color-charcoal)',
                borderRadius: 0,
                outline: 'none',
              }}
            />
            {errorCantidadInventario && (
              <span style={{ fontSize: '12px', color: '#C81E1E' }}>
                {errorCantidadInventario}
              </span>
            )}
          </div>

          {/* Cantidad Mínima para Alerta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="cantidadMinima" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-dark)' }}>
              Cantidad Mínima (Umbral Bajo Stock)
            </label>
            <input
              id="cantidadMinima"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              value={cantidadMinima}
              onKeyDown={onKeyDownNumeric}
              onChange={(e) => {
                const digitsOnly = e.target.value.replace(/\D/g, '');
                onChangeCantidadMinima(digitsOnly === '' ? '' : parseInt(digitsOnly, 10));
              }}
              onBlur={() => onBlur('cantidadMinima')}
              placeholder="Ej. 10 (0 para desactivar)"
              style={{
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid var(--color-charcoal)',
                borderRadius: 0,
                outline: 'none',
              }}
            />
            <span style={{ fontSize: '11px', color: 'var(--color-charcoal)' }}>
              Si el stock baja a este valor o menos, pasará automáticamente a estado de alerta (0 desactiva la alerta).
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
