'use client';

import React from 'react';
import type { PrioridadIncidente } from '@/types/incidente-manual';

interface AfectacionPrioridadFieldsProps {
  tipoAfectacion: string;
  setTipoAfectacion: (tipo: string) => void;
  prioridad: PrioridadIncidente;
  setPrioridad: (prioridad: PrioridadIncidente) => void;
  tiposAfectacion: string[];
  cargandoTipos: boolean;
  errorTipo?: string;
}

export default function AfectacionPrioridadFields({
  tipoAfectacion,
  setTipoAfectacion,
  prioridad,
  setPrioridad,
  tiposAfectacion,
  cargandoTipos,
  errorTipo,
}: AfectacionPrioridadFieldsProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
      <div>
        <label
          htmlFor="tipoAfectacion"
          style={{ display: 'block', fontWeight: 700, fontSize: '14px', color: '#14505A', marginBottom: '6px' }}
        >
          2. Tipo de Afectación *
        </label>
        <select
          id="tipoAfectacion"
          value={tipoAfectacion}
          onChange={(e) => setTipoAfectacion(e.target.value)}
          disabled={cargandoTipos}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: errorTipo ? '2px solid #D32F2F' : '1px solid #3B3F45',
            fontSize: '14px',
            backgroundColor: '#FFFFFF',
            borderRadius: 0,
          }}
        >
          {tiposAfectacion.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
        {errorTipo && (
          <span style={{ color: '#D32F2F', fontSize: '12px', marginTop: '4px', display: 'block' }}>
            {errorTipo}
          </span>
        )}
      </div>

      <div>
        <label
          htmlFor="prioridad"
          style={{ display: 'block', fontWeight: 700, fontSize: '14px', color: '#14505A', marginBottom: '6px' }}
        >
          Prioridad
        </label>
        <select
          id="prioridad"
          value={prioridad}
          onChange={(e) => setPrioridad(e.target.value as PrioridadIncidente)}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #3B3F45',
            fontSize: '14px',
            backgroundColor: '#FFFFFF',
            borderRadius: 0,
            fontWeight: 600,
          }}
        >
          <option value="BAJA">BAJA</option>
          <option value="MEDIA">MEDIA</option>
          <option value="ALTA">ALTA</option>
          <option value="CRITICA">CRÍTICA</option>
        </select>
      </div>
    </div>
  );
}
