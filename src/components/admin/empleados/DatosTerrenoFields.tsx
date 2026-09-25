'use client';

import React from 'react';
import type { EmpleadoFormData } from '@/hooks/useEmpleadoForm';

interface DatosTerrenoFieldsProps {
  esRolTerreno: boolean;
  formData: EmpleadoFormData;
  updateField: <K extends keyof EmpleadoFormData>(field: K, value: EmpleadoFormData[K]) => void;
  especialidades: string[];
  cargos: string[];
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
}

export default function DatosTerrenoFields({
  esRolTerreno,
  formData,
  updateField,
  especialidades,
  cargos,
  inputStyle,
  labelStyle,
}: DatosTerrenoFieldsProps) {
  if (!esRolTerreno) return null;

  const { especialidad, cargo } = formData;

  return (
    <div
      style={{
        backgroundColor: '#F8FAFC',
        border: '1px solid #D1D9E2',
        borderLeft: '4px solid var(--color-accent-mint, #4FAE9B)',
        padding: '1.25rem',
        marginBottom: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <h3
          style={{
            fontSize: '1.275rem',
            fontWeight: 800,
            color: 'var(--color-primary-teal-dark, #14505A)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: 0,
          }}
        >
          2. Opciones para el personal de terreno
        </h3>
        <span
          style={{
            fontSize: '0.6875rem',
            backgroundColor: 'var(--color-accent-mint, #4FAE9B)',
            color: '#FFFFFF',
            padding: '0.15rem 0.4rem',
            fontWeight: 700,
            borderRadius: 0,
          }}
        >
          Opciones Extendidas
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Especialidad con datalist sugerido de la DB */}
        <div>
          <label htmlFor="form-especialidad" style={labelStyle}>Especialidad Operativa</label>
          <input
            id="form-especialidad"
            type="text"
            list="datalist-especialidades"
            value={especialidad}
            onChange={(e) => updateField('especialidad', e.target.value)}
            placeholder="Ej. Motosierrista, Conductor, Verificador..."
            style={inputStyle}
          />
          <datalist id="datalist-especialidades">
            {especialidades.map((esp) => (
              <option key={esp} value={esp} />
            ))}
          </datalist>
        </div>

        {/* Cargo con datalist sugerido de la DB */}
        <div>
          <label htmlFor="form-cargo" style={labelStyle}>Cargo en Terreno</label>
          <input
            id="form-cargo"
            type="text"
            list="datalist-cargos"
            value={cargo}
            onChange={(e) => updateField('cargo', e.target.value)}
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
