'use client';

import React from 'react';
import { ArrowDownAZ, ArrowUpZA } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { CatalogoItem } from '@/types/empleados';
import type { EstadoFiltro } from '@/hooks/useEmpleados';
import { selectStyle, labelStyle } from './empleadoStyles';

interface EmpleadoFiltrosBarProps {
  delegacionFiltro: string;
  setDelegacionFiltro: (val: string) => void;
  rolFiltro: string;
  setRolFiltro: (val: string) => void;
  estadoFiltro?: EstadoFiltro;
  setEstadoFiltro?: (val: EstadoFiltro) => void;
  ordenarPor: string;
  setOrdenarPor: (val: string) => void;
  orden: 'asc' | 'desc';
  setOrden: (val: 'asc' | 'desc') => void;
  delegaciones: CatalogoItem[];
  roles: CatalogoItem[];
}

const compactSelectStyle: React.CSSProperties = {
  ...selectStyle,
  height: '32px',
  padding: '4px 8px',
  fontSize: '0.8125rem',
};

const compactLabelStyle: React.CSSProperties = {
  ...labelStyle,
  fontSize: '0.75rem',
  marginBottom: '2px',
};

export default function EmpleadoFiltrosBar({
  delegacionFiltro,
  setDelegacionFiltro,
  rolFiltro,
  setRolFiltro,
  estadoFiltro = 'todos',
  setEstadoFiltro,
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
        gap: '0.5rem',
        marginTop: '0.5rem',
        paddingTop: '0.5rem',
        borderTop: '1px solid var(--color-bg-light, #ECEFF3)',
      }}
    >
      <div>
        <label htmlFor="filtro-estado" style={compactLabelStyle}>
          Estado
        </label>
        <select
          id="filtro-estado"
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro?.(e.target.value as EstadoFiltro)}
          style={compactSelectStyle}
        >
          <option value="todos">Todos</option>
          <option value="activo">Solo Activos</option>
          <option value="inactivo">Inactivos (Baja)</option>
        </select>
      </div>
      <div>
        <label htmlFor="filtro-delegacion" style={compactLabelStyle}>
          Delegación
        </label>
        <select
          id="filtro-delegacion"
          value={delegacionFiltro}
          onChange={(e) => setDelegacionFiltro(e.target.value)}
          style={compactSelectStyle}
        >
          <option value="">Todas</option>
          {delegaciones.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nombre}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filtro-rol" style={compactLabelStyle}>
          Rol
        </label>
        <select
          id="filtro-rol"
          value={rolFiltro}
          onChange={(e) => setRolFiltro(e.target.value)}
          style={compactSelectStyle}
        >
          <option value="">Todos</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="ordenar-por" style={compactLabelStyle}>
          Ordenar por
        </label>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <select
            id="ordenar-por"
            value={ordenarPor}
            onChange={(e) => setOrdenarPor(e.target.value)}
            style={{ ...compactSelectStyle, flex: 1 }}
          >
            <option value="apellidos">Apellidos</option>
            <option value="nombres">Nombres</option>
            <option value="rut">RUT</option>
          </select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOrden(orden === 'asc' ? 'desc' : 'asc')}
            style={{ height: '32px', padding: '0 6px', fontSize: '0.75rem' }}
            title={`Orden: ${orden === 'asc' ? 'Ascendente (A-Z)' : 'Descendente (Z-A)'}`}
          >
            {orden === 'asc' ? <ArrowDownAZ size={14} /> : <ArrowUpZA size={14} />}
            <span>{orden === 'asc' ? 'A-Z' : 'Z-A'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
