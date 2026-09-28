'use client';

import React from 'react';
import Heading from '@/components/ui/Heading';
import { Calendar } from 'lucide-react';
import type { CatalogoItem } from '@/types/empleados';
import { inputStyle, labelStyle } from './empleadoStyles';

interface EmpleadoCuentaRolSectionProps {
  rolId: string;
  setRolId: (val: string) => void;
  delegacionId: string;
  setDelegacionId: (val: string) => void;
  fechaIngreso: string;
  setFechaIngreso: (val: string) => void;
  activo: boolean;
  setActivo: (val: boolean) => void;
  fechaSalida: string;
  setFechaSalida: (val: string) => void;
  roles: CatalogoItem[];
  delegaciones: CatalogoItem[];
}

export default function EmpleadoCuentaRolSection({
  rolId,
  setRolId,
  delegacionId,
  setDelegacionId,
  fechaIngreso,
  setFechaIngreso,
  activo,
  setActivo,
  fechaSalida,
  setFechaSalida,
  roles,
  delegaciones,
}: EmpleadoCuentaRolSectionProps) {
  const handleActivoChange = (checked: boolean) => {
    setActivo(checked);
    if (!checked && !fechaSalida) {
      setFechaSalida(new Date().toISOString().slice(0, 10));
    } else if (checked) {
      setFechaSalida('');
    }
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <Heading as="h3" variant="h4" color="teal" style={{ marginBottom: '0.875rem' }}>
        2. Cuenta de Usuario y Asignación Institucional
      </Heading>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <div>
          <label htmlFor="form-rol" style={labelStyle}>Rol y Privilegios *</label>
          <select id="form-rol" value={rolId} onChange={(e) => setRolId(e.target.value)} style={inputStyle} required>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.nombre} ({r.codigo})</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="form-delegacion" style={labelStyle}>Delegación Asignada</label>
          <select id="form-delegacion" value={delegacionId} onChange={(e) => setDelegacionId(e.target.value)} style={inputStyle}>
            <option value="">-- Sin Delegación --</option>
            {delegaciones.map((d) => (
              <option key={d.id} value={d.id}>{d.nombre} ({d.codigo})</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="form-fecha-ingreso" style={labelStyle}>Fecha de Ingreso Municipal</label>
          <input id="form-fecha-ingreso" type="date" value={fechaIngreso} onChange={(e) => setFechaIngreso(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={activo}
              onChange={(e) => handleActivoChange(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-teal, #1B6F7D)', borderRadius: 0 }}
            />
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-charcoal, #3B3F45)' }}>
              Cuenta de Usuario Activa
            </span>
          </label>
        </div>

        {!activo && (
          <div>
            <label style={labelStyle}>Fecha de Salida / Desvinculación</label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--color-danger-bg, #FFEBEE)',
                border: '1px solid var(--color-danger, #D32F2F)',
                padding: '0.625rem 0.85rem',
                fontSize: '0.875rem',
                color: 'var(--color-danger, #D32F2F)',
                fontWeight: 600,
                gap: '0.5rem',
              }}
            >
              <Calendar size={16} />
              <span>Fecha de Salida Registrada: <strong>{fechaSalida || new Date().toISOString().slice(0, 10)}</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
