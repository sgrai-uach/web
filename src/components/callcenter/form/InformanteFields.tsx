'use client';

import React from 'react';

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
        padding: '16px',
        borderLeft: '4px solid #1B6F7D',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: '14px', color: '#14505A' }}>
        5. Identificación del Informante
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div>
          <label
            htmlFor="informanteNombre"
            style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}
          >
            Nombre Completo *
          </label>
          <input
            id="informanteNombre"
            type="text"
            value={informanteNombre}
            onChange={(e) => setInformanteNombre(e.target.value)}
            placeholder="Ej: Pedro Martínez"
            style={{
              width: '100%',
              padding: '8px 10px',
              border: errorNombre ? '2px solid #D32F2F' : '1px solid #3B3F45',
              fontSize: '13px',
              backgroundColor: '#FFFFFF',
              borderRadius: 0,
            }}
          />
          {errorNombre && (
            <span style={{ color: '#D32F2F', fontSize: '11px', marginTop: '2px', display: 'block' }}>
              {errorNombre}
            </span>
          )}
        </div>

        <div>
          <label
            htmlFor="informanteRut"
            style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}
          >
            RUT Chileno (con DV) *
          </label>
          <input
            id="informanteRut"
            type="text"
            value={informanteRut}
            onChange={onRutChange}
            placeholder="11111111-1"
            maxLength={12}
            style={{
              width: '100%',
              padding: '8px 10px',
              border: errorRut ? '2px solid #D32F2F' : '1px solid #3B3F45',
              fontSize: '13px',
              backgroundColor: '#FFFFFF',
              borderRadius: 0,
            }}
          />
          {errorRut && (
            <span style={{ color: '#D32F2F', fontSize: '11px', marginTop: '2px', display: 'block' }}>
              {errorRut}
            </span>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="informanteTelefono"
          style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}
        >
          Teléfono de Contacto (Opcional)
        </label>
        <input
          id="informanteTelefono"
          type="text"
          value={informanteTelefono}
          onChange={(e) => setInformanteTelefono(e.target.value)}
          placeholder="+56912345678 o 912345678"
          style={{
            width: '100%',
            maxWidth: '300px',
            padding: '8px 10px',
            border: errorTelefono ? '2px solid #D32F2F' : '1px solid #3B3F45',
            fontSize: '13px',
            backgroundColor: '#FFFFFF',
            borderRadius: 0,
          }}
        />
        {errorTelefono && (
          <span style={{ color: '#D32F2F', fontSize: '11px', marginTop: '2px', display: 'block' }}>
            {errorTelefono}
          </span>
        )}
      </div>
    </div>
  );
}
