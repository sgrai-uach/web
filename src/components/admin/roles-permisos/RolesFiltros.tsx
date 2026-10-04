'use client';

import React from 'react';
import type { FiltroEstadoPermisos, FiltroTipoRol } from '@/types/seguridad';
import Button from '@/components/ui/Button';
import { RotateCw } from 'lucide-react';
import {
  FilterBar,
  FilterSearchInput,
  SegmentedButtonGroup,
  ActiveFilterChips,
  type ActiveChipItem,
} from '@/components/common/filters';

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

const OPCIONES_TIPO_ROL: { valor: FiltroTipoRol; etiqueta: string }[] = [
  { valor: 'TODOS', etiqueta: 'Todos' },
  { valor: 'SISTEMA', etiqueta: 'Sistema' },
  { valor: 'PERSONALIZADO', etiqueta: 'Personalizado' },
];

const OPCIONES_ESTADO_PERMISO: { valor: FiltroEstadoPermisos; etiqueta: string }[] = [
  { valor: 'TODOS', etiqueta: 'Todos' },
  { valor: 'CON_PERMISOS', etiqueta: 'Con Permisos' },
  { valor: 'SIN_PERMISOS', etiqueta: 'Sin Permisos' },
];

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
  const chipsActivos: ActiveChipItem[] = [];

  if (busqueda?.trim()) {
    chipsActivos.push({
      id: 'busqueda',
      etiqueta: 'Búsqueda',
      valorVisible: `"${busqueda.trim()}"`,
      onRemove: () => onBusquedaChange(''),
    });
  }

  if (filtroTipo !== 'TODOS') {
    const opt = OPCIONES_TIPO_ROL.find((t) => t.valor === filtroTipo);
    chipsActivos.push({
      id: 'tipo',
      etiqueta: 'Tipo de Rol',
      valorVisible: opt ? opt.etiqueta : filtroTipo,
      onRemove: () => onFiltroTipoChange('TODOS'),
    });
  }

  if (filtroEstado !== 'TODOS') {
    const opt = OPCIONES_ESTADO_PERMISO.find((e) => e.valor === filtroEstado);
    chipsActivos.push({
      id: 'estado',
      etiqueta: 'Permisos',
      valorVisible: opt ? opt.etiqueta : filtroEstado,
      onRemove: () => onFiltroEstadoChange('TODOS'),
    });
  }

  const handleLimpiarTodos = () => {
    onBusquedaChange('');
    onFiltroTipoChange('TODOS');
    onFiltroEstadoChange('TODOS');
  };

  const headerActions = (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={onRefrescar}
      disabled={cargando}
      title="Refrescar listado de roles"
      aria-label="Refrescar listado de roles"
    >
      <RotateCw size={14} className={cargando ? 'animate-spin' : ''} aria-hidden="true" />
      <span>{cargando ? 'Cargando...' : 'Refrescar'}</span>
    </Button>
  );

  return (
    <FilterBar
      titulo="Filtros de Perfiles y Permisos"
      storageKey="sgrai:filtros:roles:colapsado"
      totalFiltrosActivos={chipsActivos.length}
      headerActions={headerActions}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '12px',
          alignItems: 'flex-end',
        }}
      >
        <FilterSearchInput
          id="busqueda-roles"
          label="Buscar perfil:"
          value={busqueda}
          onChange={onBusquedaChange}
          placeholder="Buscar perfil por nombre, descripción o módulo..."
          debounceMs={300}
        />

        <SegmentedButtonGroup<FiltroTipoRol>
          id="filtro-tipo-rol"
          label="Tipo de Rol:"
          options={OPCIONES_TIPO_ROL}
          value={filtroTipo}
          onChange={onFiltroTipoChange}
        />

        <SegmentedButtonGroup<FiltroEstadoPermisos>
          id="filtro-estado-permisos"
          label="Estado de Permisos:"
          options={OPCIONES_ESTADO_PERMISO}
          value={filtroEstado}
          onChange={onFiltroEstadoChange}
        />
      </div>

      <ActiveFilterChips
        chips={chipsActivos}
        onClearAll={handleLimpiarTodos}
        clearAllText="Limpiar filtros"
      />
    </FilterBar>
  );
}
