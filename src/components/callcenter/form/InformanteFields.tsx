'use client';

import React from 'react';
import Input from '@/components/ui/Input';

interface InformanteFieldsProps {
  informanteNombre: string;
  setInformanteNombre: (nombre: string) => void;
  informanteRut: string;
  onRutChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  informanteTelefono: string;
  setInformanteTelefono: (tel: string) => void;
  errorNombre?: string;
  errorRut?: string;
  errorTelefono?: string;
}

export default function InformanteFields({
  informanteNombre,
  setInformanteNombre,
  informanteRut,
  onRutChange,
  informanteTelefono,
  setInformanteTelefono,
  errorNombre,
  errorRut,
  errorTelefono,
}: InformanteFieldsProps) {
  return (
    <div
      style={{
        backgroundColor: '#ECEFF3',
        padding: '20px',
        borderLeft: 'var(--stripe-width, 4px) solid var(--stripe-color, #1B6F7D)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: '14px', color: '#14505A' }}>
        3. Identificación del Informante
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <Input
          id="informanteNombre"
          label="Nombre Completo"
          requiredIndicator
          type="text"
          value={informanteNombre}
          onChange={(e) => setInformanteNombre(e.target.value)}
          placeholder="Ej: Pedro Martínez"
          error={errorNombre}
        />

        <Input
          id="informanteRut"
          label="RUT Chileno (con DV)"
          requiredIndicator
          type="text"
          value={informanteRut}
          onChange={onRutChange}
          placeholder="11111111-1"
          maxLength={12}
          error={errorRut}
        />
      </div>

      <div style={{ maxWidth: '300px' }}>
        <Input
          id="informanteTelefono"
          label="Teléfono de Contacto (Opcional)"
          type="text"
          value={informanteTelefono}
          onChange={(e) => setInformanteTelefono(e.target.value)}
          placeholder="+56912345678 o 912345678"
          error={errorTelefono}
        />
      </div>
    </div>
  );
}
