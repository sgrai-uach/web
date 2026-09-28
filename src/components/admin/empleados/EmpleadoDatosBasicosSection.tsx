'use client';

import React from 'react';
import Heading from '@/components/ui/Heading';
import Input from '@/components/ui/Input';

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
        <Input
          id="form-rut"
          label="RUT Funcionario"
          requiredIndicator
          type="text"
          required
          value={rut}
          onChange={(e) => setRut(e.target.value)}
          placeholder="Ej. 12.345.678-9"
        />

        <Input
          id="form-nombres"
          label="Nombres"
          requiredIndicator
          type="text"
          required
          value={nombres}
          onChange={(e) => setNombres(e.target.value)}
        />

        <Input
          id="form-apellidos"
          label="Apellidos"
          requiredIndicator
          type="text"
          required
          value={apellidos}
          onChange={(e) => setApellidos(e.target.value)}
        />

        <Input
          id="form-email"
          label="Correo Institucional"
          requiredIndicator
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          id="form-telefono"
          label="Teléfono de Contacto"
          requiredIndicator
          type="tel"
          required
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="+56 9 1234 5678"
        />
      </div>
    </div>
  );
}
