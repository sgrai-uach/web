'use client';

import React from 'react';
import { Phone, HardHat } from 'lucide-react';
import type { OrigenReporte } from '@/types/incidente-manual';

interface OrigenSelectorProps {
  origenReporte: OrigenReporte;
  onSelect: (origen: OrigenReporte) => void;
}

export default function OrigenSelector({
  origenReporte,
  onSelect,
}: OrigenSelectorProps) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontWeight: 700,
          fontSize: '14px',
          color: '#14505A',
          marginBottom: '8px',
        }}
      >
        1. Origen del Reporte *
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <button
          type="button"
          onClick={() => onSelect('LLAMADA_TELEFONICA')}
          style={{
            padding: '14px',
            border: origenReporte === 'LLAMADA_TELEFONICA' ? '2px solid #1B6F7D' : '1px solid #DFE3E8',
            backgroundColor: origenReporte === 'LLAMADA_TELEFONICA' ? '#14505A' : '#ECEFF3',
            color: origenReporte === 'LLAMADA_TELEFONICA' ? '#FFFFFF' : '#2B2B2B',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderRadius: 0,
            transition: 'all 0.15s ease',
          }}
        >
          <Phone size={24} aria-hidden="true" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>Llamada Telefónica</div>
            <div style={{ fontSize: '12px', opacity: 0.85 }}>Informante vía Call Center 1451</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelect('FUNCIONARIO_TERRENO')}
          style={{
            padding: '14px',
            border: origenReporte === 'FUNCIONARIO_TERRENO' ? '2px solid #1B6F7D' : '1px solid #DFE3E8',
            backgroundColor: origenReporte === 'FUNCIONARIO_TERRENO' ? '#14505A' : '#ECEFF3',
            color: origenReporte === 'FUNCIONARIO_TERRENO' ? '#FFFFFF' : '#2B2B2B',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderRadius: 0,
            transition: 'all 0.15s ease',
          }}
        >
          <HardHat size={24} aria-hidden="true" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>Funcionario en Terreno</div>
            <div style={{ fontSize: '12px', opacity: 0.85 }}>Aviso por patrullero o cuadrilla municipal</div>
          </div>
        </button>
      </div>
    </div>
  );
}
