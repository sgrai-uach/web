'use client';

import React from 'react';
import type { FiltroEstadoPermisos, FiltroTipoRol } from '@/types/seguridad';

export type { FiltroTipoRol, FiltroEstadoPermisos };

interface RolesFiltrosProps {
  busqueda: string;
  onBusquedaChange: (valor: string) => void;
  filtroTipo: FiltroTipoRol;
  onFiltroTipoChange: (filtro: FiltroTipoRol) => void;
  filtroEstado: FiltroEstadoPermisos;
  onFiltroEstadoChange: (filtro: FiltroEstadoPermisos) => void;
  onRefrescar: () => void;
  cargando: boolean;
}

const TIPOS_ROL = [
  { clave: 'TODOS', label: 'Todos' },
  { clave: 'SISTEMA', label: 'Sistema' },
  { clave: 'PERSONALIZADO', label: 'Personalizado' },
] as const;

const ESTADOS_PERMISO = [
  { clave: 'TODOS', label: 'Todos' },
  { clave: 'CON_PERMISOS', label: 'Con Permisos' },
  { clave: 'SIN_PERMISOS', label: 'Sin Permisos' },
] as const;

function ButtonGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { readonly clave: T; readonly label: string }[];
  value: T;
  onChange: (val: T) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
      <span style={{ fontSize: '0.8125rem', color: '#666', fontWeight: 600 }}>{label}:</span>
      <div style={{ display: 'inline-flex', border: '1px solid #CCD2D9' }}>
        {options.map((opt) => {
          const activo = value === opt.clave;
          return (
            <button
              key={opt.clave}
              type="button"
              onClick={() => onChange(opt.clave)}
              style={{
                border: 'none', borderRadius: 0, padding: '0.45rem 0.75rem',
                fontSize: '0.75rem', fontWeight: activo ? 700 : 500,
                backgroundColor: activo ? 'var(--color-primary-teal, #1B6F7D)' : '#FFFFFF',
                color: activo ? '#FFFFFF' : 'var(--color-charcoal, #3B3F45)',
                cursor: 'pointer', transition: 'background-color 0.15s ease',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function RolesFiltros({
  busqueda,
  onBusquedaChange,
  filtroTipo,
  onFiltroTipoChange,
  filtroEstado,
  onFiltroEstadoChange,
  onRefrescar,
  cargando,
}: RolesFiltrosProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-white, #FFFFFF)', border: '1px solid #DFE3E8',
        padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex',
        flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
      }}
    >
      <div style={{ flex: '1 1 300px', minWidth: '260px', position: 'relative' }}>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          placeholder="Buscar perfil por nombre, descripción o módulo..."
          style={{
            width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #CCD2D9',
            borderRadius: 0, fontSize: '0.875rem', color: 'var(--color-charcoal, #3B3F45)',
            backgroundColor: '#FFFFFF', outline: 'none',
          }}
        />
        {busqueda && (
          <button
            type="button"
            onClick={() => onBusquedaChange('')}
            style={{
              position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
              border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '1rem', color: '#888',
            }}
            title="Limpiar búsqueda"
          >
            &times;
          </button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <ButtonGroup label="Tipo" options={TIPOS_ROL} value={filtroTipo} onChange={onFiltroTipoChange} />
        <ButtonGroup label="Permisos" options={ESTADOS_PERMISO} value={filtroEstado} onChange={onFiltroEstadoChange} />

        <button
          type="button"
          onClick={onRefrescar}
          disabled={cargando}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            border: '1px solid #CCD2D9', borderRadius: 0, padding: '0.45rem 0.85rem',
            fontSize: '0.8125rem', fontWeight: 600, backgroundColor: '#FFFFFF',
            color: 'var(--color-charcoal, #3B3F45)', cursor: cargando ? 'not-allowed' : 'pointer',
            opacity: cargando ? 0.7 : 1,
          }}
          title="Refrescar listado de roles"
        >
          <span>{cargando ? 'Cargando...' : 'Refrescar'}</span>
        </button>
      </div>
    </div>
  );
}
