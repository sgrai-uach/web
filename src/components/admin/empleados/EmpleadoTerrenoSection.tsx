'use client';

import React from 'react';
import Heading from '@/components/ui/Heading';
import { Briefcase } from 'lucide-react';

interface EmpleadoTerrenoSectionProps {
  especialidad: string;
  setEspecialidad: (val: string) => void;
  cargo: string;
  setCargo: (val: string) => void;
  especialidades: string[];
  cargos: string[];
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.625rem 0.875rem',
  border: '1px solid var(--border-color-neutral, #DFE3E8)',
  fontSize: '0.875rem',
  color: 'var(--color-text-dark, #2B2B2B)',
  backgroundColor: 'var(--color-white, #FFFFFF)',
  borderRadius: 0,
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8125rem',
  fontWeight: 700,
  color: 'var(--color-charcoal, #3B3F45)',
  textTransform: 'uppercase',
  letterSpacing: '0.4px',
  marginBottom: '0.35rem',
};

export default function EmpleadoTerrenoSection({
  especialidad,
  setEspecialidad,
  cargo,
  setCargo,
  especialidades,
  cargos,
}: EmpleadoTerrenoSectionProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-light, #ECEFF3)',
        border: '1px solid var(--border-color-neutral, #DFE3E8)',
        borderLeft: '4px solid var(--color-accent-mint, #4FAE9B)',
        padding: '1.25rem',
        marginBottom: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <Briefcase size={18} color="var(--color-primary-teal, #1B6F7D)" />
        <Heading as="h3" variant="h4" color="teal-dark" noMargin>
          3. Especialización para Personal de Terreno
        </Heading>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
        }}
      >
        <div>
          <label htmlFor="form-especialidad" style={labelStyle}>
            Especialidad Operativa
          </label>
          <input
            id="form-especialidad"
            type="text"
            list="datalist-especialidades"
            value={especialidad}
            onChange={(e) => setEspecialidad(e.target.value)}
            placeholder="Ej. Motosierrista, Conductor, Verificador..."
            style={inputStyle}
          />
          <datalist id="datalist-especialidades">
            {especialidades.map((esp) => (
              <option key={esp} value={esp} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="form-cargo" style={labelStyle}>
            Cargo en Terreno
          </label>
          <input
            id="form-cargo"
            type="text"
            list="datalist-cargos"
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
            placeholder="Ej. Delegado de Cuadrilla, Brigadista..."
            style={inputStyle}
          />
          <datalist id="datalist-cargos">
            {cargos.map((cg) => (
              <option key={cg} value={cg} />
            ))}
          </datalist>
        </div>
      </div>
    </div>
  );
}
