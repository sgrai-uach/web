'use client';

import React from 'react';
import { ArrowDownAZ, ArrowUpZA } from 'lucide-react';
import type { CatalogoItem } from '@/types/empleados';
import { selectStyle, labelStyle } from './empleadoStyles';

interface EmpleadoFiltrosBarProps {
  delegacionFiltro: string;
  setDelegacionFiltro: (val: string) => void;
  rolFiltro: string;
  setRolFiltro: (val: string) => void;
  ordenarPor: string;
  setOrdenarPor: (val: string) => void;
  orden: 'asc' | 'desc';
  setOrden: (val: 'asc' | 'desc') => void;
  delegaciones: CatalogoItem[];
  roles: CatalogoItem[];
}

export default function EmpleadoFiltrosBar({
  delegacionFiltro,
  setDelegacionFiltro,
  rolFiltro,
  setRolFiltro,
  ordenarPor,
  setOrdenarPor,
  orden,
  setOrden,
  delegaciones,
  roles,
}: EmpleadoFiltrosBarProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '0.75rem',
        marginTop: '0.875rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid var(--color-bg-light, #ECEFF3)',
      }}
    >
      <div>
        <label htmlFor="filtro-delegacion" style={labelStyle}>
          Filtrar por Delegación
        </label>
        <select
          id="filtro-delegacion"
          value={delegacionFiltro}
          onChange={(e) => setDelegacionFiltro(e.target.value)}
          style={selectStyle}
        >
          <option value="">Todas las delegaciones</option>
          {delegaciones.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nombre}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filtro-rol" style={labelStyle}>
          Filtrar por Rol
        </label>
        <select
          id="filtro-rol"
          value={rolFiltro}
          onChange={(e) => setRolFiltro(e.target.value)}
          style={selectStyle}
        >
          <option value="">Todos los roles</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="ordenar-por" style={labelStyle}>
          Ordenar lista por
        </label>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <select
            id="ordenar-por"
            value={ordenarPor}
            onChange={(e) => setOrdenarPor(e.target.value)}
            style={{ ...selectStyle, flex: 1 }}
          >
            <option value="apellidos">Apellidos</option>
            <option value="nombres">Nombres</option>
            <option value="rut">RUT</option>
          </select>
          <button
            type="button"
            onClick={() => setOrden(orden === 'asc' ? 'desc' : 'asc')}
            style={{
              padding: '0.45rem 0.65rem',
              border: '1px solid var(--border-color-neutral, #DFE3E8)',
              background: 'var(--color-bg-light, #ECEFF3)',
              borderRadius: 0,
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
            title={`Orden: ${orden === 'asc' ? 'Ascendente (A-Z)' : 'Descendente (Z-A)'}`}
          >
            {orden === 'asc' ? <ArrowDownAZ size={16} /> : <ArrowUpZA size={16} />}
            <span>{orden === 'asc' ? 'A-Z' : 'Z-A'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
