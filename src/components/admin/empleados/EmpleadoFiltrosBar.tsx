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
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '0.75rem',
        marginTop: '0.875rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid var(--color-bg-light, #ECEFF3)',
      }}
    >
      <div>
        <label htmlFor="filtro-estado" style={labelStyle}>
          Estado de Cuenta
        </label>
        <select
          id="filtro-estado"
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro?.(e.target.value as EstadoFiltro)}
          style={selectStyle}
        >
          <option value="todos">Todos los estados</option>
          <option value="activo">Solo Activos</option>
          <option value="inactivo">Inactivos / Baja Lógica</option>
        </select>
      </div>
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOrden(orden === 'asc' ? 'desc' : 'asc')}
            title={`Orden: ${orden === 'asc' ? 'Ascendente (A-Z)' : 'Descendente (Z-A)'}`}
          >
            {orden === 'asc' ? <ArrowDownAZ size={16} /> : <ArrowUpZA size={16} />}
            <span>{orden === 'asc' ? 'A-Z' : 'Z-A'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
