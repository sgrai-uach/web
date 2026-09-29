'use client';

import React from 'react';
import type { PrioridadIncidente } from '@/types/incidente-manual';
import Select from '@/components/ui/Select';

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
      <Select
        id="tipoAfectacion"
        label="2. Tipo de Afectación"
        requiredIndicator
        value={tipoAfectacion}
        onChange={(e) => setTipoAfectacion(e.target.value)}
        disabled={cargandoTipos}
        error={errorTipo}
      >
        {tiposAfectacion.map((tipo) => (
          <option key={tipo} value={tipo}>
            {tipo}
          </option>
        ))}
      </Select>

      <Select
        id="prioridad"
        label="Prioridad"
        value={prioridad}
        onChange={(e) => setPrioridad(e.target.value as PrioridadIncidente)}
      >
        <option value="BAJA">BAJA</option>
        <option value="MEDIA">MEDIA</option>
        <option value="ALTA">ALTA</option>
        <option value="CRITICA">CRÍTICA</option>
      </Select>
    </div>
  );
}
