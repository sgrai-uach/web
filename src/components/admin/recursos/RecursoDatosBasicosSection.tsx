import React from 'react';

interface RecursoDatosBasicosSectionProps {
  nombre: string;
  descripcion: string;
  esIndividual: boolean;
  errorNombre?: string;
  onChangeNombre: (val: string) => void;
  onChangeDescripcion: (val: string) => void;
  onChangeEsIndividual: (esIndividual: boolean) => void;
  onBlurNombre: () => void;
}

export default function RecursoDatosBasicosSection({
  nombre,
  descripcion,
  esIndividual,
  errorNombre,
  onChangeNombre,
  onChangeDescripcion,
  onChangeEsIndividual,
  onBlurNombre,
}: RecursoDatosBasicosSectionProps) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ borderBottom: '2px solid var(--color-primary-teal)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: 'var(--color-primary-teal)', fontWeight: 'bold', fontSize: '18px' }}>1.</span>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary-teal-dark)', margin: 0 }}>Información General</h2>
      </div>

      {/* Nombre del Recurso */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label htmlFor="nombre" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-dark)' }}>
          Nombre del Recurso <span style={{ color: '#C81E1E' }}>*</span>
        </label>
        <input
          id="nombre"
          type="text"
          required
          autoComplete="off"
          value={nombre}
          onChange={(e) => onChangeNombre(e.target.value)}
          onBlur={onBlurNombre}
          placeholder="Ej. Sacos de arena, Motobomba 3 HP, Camioneta Rescate 4x4"
          style={{
            padding: '10px 12px',
            fontSize: '14px',
            border: errorNombre ? '2px solid #C81E1E' : '1px solid var(--color-charcoal)',
            borderRadius: 0,
            outline: 'none',
            backgroundColor: 'var(--color-white)',
            color: 'var(--color-text-dark)',
          }}
        />
        {errorNombre && (
          <span style={{ fontSize: '12px', color: '#C81E1E', fontWeight: 500 }}>{errorNombre}</span>
        )}
      </div>

      {/* Descripción */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label htmlFor="descripcion" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-dark)' }}>
          Descripción u Observaciones (Opcional)
        </label>
        <textarea
          id="descripcion"
          rows={3}
          value={descripcion}
          onChange={(e) => onChangeDescripcion(e.target.value)}
          placeholder="Especificaciones adicionales, condiciones de uso o estado del activo..."
          style={{
            padding: '10px 12px',
            fontSize: '14px',
            border: '1px solid var(--color-charcoal)',
            borderRadius: 0,
            outline: 'none',
            backgroundColor: 'var(--color-white)',
            color: 'var(--color-text-dark)',
            resize: 'vertical',
          }}
        />
      </div>

      {/* Selector de Tipo de Recurso */}
      <div style={{ backgroundColor: 'var(--color-bg-light)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary-teal-dark)' }}>Tipo de Recurso</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--color-text-dark)', fontWeight: !esIndividual ? 700 : 400 }}>
            <input
              type="radio"
              name="esIndividual"
              checked={!esIndividual}
              onChange={() => onChangeEsIndividual(false)}
              style={{ accentColor: 'var(--color-primary-teal)', cursor: 'pointer' }}
            />
            Material o Insumo (ej. sacos de arena, frazadas, combustible)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--color-text-dark)', fontWeight: esIndividual ? 700 : 400 }}>
            <input
              type="radio"
              name="esIndividual"
              checked={esIndividual}
              onChange={() => onChangeEsIndividual(true)}
              style={{ accentColor: 'var(--color-primary-teal)', cursor: 'pointer' }}
            />
            Vehículo o Maquinaria (ej. camioneta, grúa, motobomba)
          </label>
        </div>
      </div>
    </section>
  );
}
