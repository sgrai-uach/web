'use client';

import React from 'react';
import Heading from '@/components/ui/Heading';

interface EmpleadoDatosBasicosSectionProps {
  rut: string;
  setRut: (val: string) => void;
  nombres: string;
  setNombres: (val: string) => void;
  apellidos: string;
  setApellidos: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  telefono: string;
  setTelefono: (val: string) => void;
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

export default function EmpleadoDatosBasicosSection({
  rut,
  setRut,
  nombres,
  setNombres,
  apellidos,
  setApellidos,
  email,
  setEmail,
  telefono,
  setTelefono,
}: EmpleadoDatosBasicosSectionProps) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <Heading as="h3" variant="h4" color="teal" style={{ marginBottom: '0.875rem' }}>
        1. Información Personal y Contacto
      </Heading>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
        }}
      >
        <div>
          <label htmlFor="form-rut" style={labelStyle}>
            RUT Funcionario *
          </label>
          <input
            id="form-rut"
            type="text"
            required
            value={rut}
            onChange={(e) => setRut(e.target.value)}
            placeholder="Ej. 12.345.678-9"
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="form-nombres" style={labelStyle}>
            Nombres *
          </label>
          <input
            id="form-nombres"
            type="text"
            required
            value={nombres}
            onChange={(e) => setNombres(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="form-apellidos" style={labelStyle}>
            Apellidos *
          </label>
          <input
            id="form-apellidos"
            type="text"
            required
            value={apellidos}
            onChange={(e) => setApellidos(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="form-email" style={labelStyle}>
            Correo Institucional *
          </label>
          <input
            id="form-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="form-telefono" style={labelStyle}>
            Teléfono de Contacto *
          </label>
          <input
            id="form-telefono"
            type="tel"
            required
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="+56 9 1234 5678"
            style={inputStyle}
          />
        </div>
      </div>
    </div>
  );
}
