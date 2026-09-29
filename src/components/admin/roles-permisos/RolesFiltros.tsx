'use client';

import React from 'react';
import type { FiltroEstadoPermisos, FiltroTipoRol } from '@/types/seguridad';
import Button from '@/components/ui/Button';
import { RotateCw, X } from 'lucide-react';

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
            <Button
              key={opt.clave}
              type="button"
              variant={activo ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onChange(opt.clave)}
              style={{
                borderRadius: 0,
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                minHeight: 'auto',
                color: activo ? '#FFFFFF' : 'var(--color-charcoal, #3B3F45)',
              }}
            >
              {opt.label}
            </Button>
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
        padding: '1rem 1.25rem', display: 'flex',
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
            width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--border-color-dark, #3B3F45)',
            borderRadius: 0, fontSize: '0.875rem', color: 'var(--color-charcoal, #3B3F45)',
            backgroundColor: '#FFFFFF', outline: 'none',
          }}
        />
        {busqueda && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onBusquedaChange('')}
            style={{
              position: 'absolute',
              right: '6px',
              top: '50%',
              transform: 'translateY(-50%)',
              padding: '2px 6px',
              minHeight: 'auto',
              color: '#888',
            }}
            title="Limpiar búsqueda"
            aria-label="Limpiar búsqueda"
          >
            <X size={14} aria-hidden="true" />
          </Button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <ButtonGroup label="Tipo" options={TIPOS_ROL} value={filtroTipo} onChange={onFiltroTipoChange} />
        <ButtonGroup label="Permisos" options={ESTADOS_PERMISO} value={filtroEstado} onChange={onFiltroEstadoChange} />

        <Button
          type="button"
          variant="secondary"
          onClick={onRefrescar}
          disabled={cargando}
          title="Refrescar listado de roles"
        >
          <RotateCw size={14} className={cargando ? 'animate-spin' : ''} aria-hidden="true" />
          <span>{cargando ? 'Cargando...' : 'Refrescar'}</span>
        </Button>
      </div>
    </div>
  );
}
