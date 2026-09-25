'use client';

import React from 'react';
import type { EmpleadoFormData } from '@/hooks/useEmpleadoForm';
import type { CatalogoItem } from '@/types/catalogos';

interface DatosPersonalesFieldsProps {
  formData: EmpleadoFormData;
  updateField: <K extends keyof EmpleadoFormData>(field: K, value: EmpleadoFormData[K]) => void;
  onActivoChange: (checked: boolean) => void;
  roles: CatalogoItem[];
  delegaciones: CatalogoItem[];
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
}

export default function DatosPersonalesFields({
  formData,
  updateField,
  onActivoChange,
  roles,
  delegaciones,
  inputStyle,
  labelStyle,
}: DatosPersonalesFieldsProps) {
  const {
    rut,
    nombres,
    apellidos,
    email,
    telefono,
    rolId,
    delegacionId,
    activo,
    fechaIngreso,
    fechaSalida,
  } = formData;

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h3
        style={{
          fontSize: '1.275rem',
          fontWeight: 700,
          color: 'var(--color-primary-teal, #1B6F7D)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '1rem',
        }}
      >
        1. Datos del Personal Municipal
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <div>
          <label htmlFor="form-rut" style={labelStyle}>RUT *</label>
          <input
            id="form-rut"
            type="text"
            value={rut}
            onChange={(e) => updateField('rut', e.target.value)}
            placeholder="12.345.678-K"
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label htmlFor="form-nombres" style={labelStyle}>Nombres *</label>
          <input
            id="form-nombres"
            type="text"
            value={nombres}
            onChange={(e) => updateField('nombres', e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label htmlFor="form-apellidos" style={labelStyle}>Apellidos</label>
          <input
            id="form-apellidos"
            type="text"
            value={apellidos}
            onChange={(e) => updateField('apellidos', e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label htmlFor="form-email" style={labelStyle}>Correo Institucional</label>
          <input
            id="form-email"
            type="email"
            value={email}
            onChange={(e) => updateField('email', e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label htmlFor="form-telefono" style={labelStyle}>Teléfono *</label>
          <input
            id="form-telefono"
            type="text"
            value={telefono}
            onChange={(e) => updateField('telefono', e.target.value)}
            placeholder="+569..."
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label htmlFor="form-rol" style={labelStyle}>Rol y Permisos</label>
          <select
            id="form-rol"
            value={rolId}
            onChange={(e) => updateField('rolId', e.target.value)}
            style={inputStyle}
            required
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre} ({r.codigo})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="form-delegacion" style={labelStyle}>Delegación Asignada</label>
          <select
            id="form-delegacion"
            value={delegacionId}
            onChange={(e) => updateField('delegacionId', e.target.value)}
            style={inputStyle}
          >
            <option value="">-- Sin Delegación --</option>
            {delegaciones.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre} ({d.codigo})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="form-fecha-ingreso" style={labelStyle}>Fecha de Ingreso Municipal</label>
          <input
            id="form-fecha-ingreso"
            type="date"
            value={fechaIngreso}
            onChange={(e) => updateField('fechaIngreso', e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '1.25rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={activo}
              onChange={(e) => onActivoChange(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-teal, #1B6F7D)', borderRadius: 0 }}
            />
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-charcoal, #3B3F45)' }}>
              Cuenta de Usuario Activa
            </span>
          </label>
        </div>

        {/* Fecha de salida: sólo visible si el usuario se encuentra inactivo */}
        {!activo && (
          <div>
            <label style={labelStyle}>
              Fecha de Salida / Desvinculación
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#FFF2F2',
                border: '1px solid #E0B4B4',
                padding: '0.625rem 0.85rem',
                fontSize: '0.875rem',
                color: '#9F3A38',
                fontWeight: 600,
                gap: '0.5rem',
              }}
            >
              <span>📅 Fecha de Salida Registrada: <strong>{fechaSalida || new Date().toISOString().slice(0, 10)}</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
