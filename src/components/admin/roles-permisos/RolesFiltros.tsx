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
  contadoresTipo?: Record<FiltroTipoRol, number>;
  contadoresEstado?: Record<FiltroEstadoPermisos, number>;
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
  contadoresTipo,
  contadoresEstado,
}: RolesFiltrosProps) {
  const chipsActivos: ActiveChipItem[] = [];

  const opcionesTipoConContador = React.useMemo(() => {
    return OPCIONES_TIPO_ROL.map((opt) => ({
      ...opt,
      contador: contadoresTipo ? contadoresTipo[opt.valor] : undefined,
    }));
  }, [contadoresTipo]);

  const opcionesEstadoConContador = React.useMemo(() => {
    return OPCIONES_ESTADO_PERMISO.map((opt) => ({
      ...opt,
      contador: contadoresEstado ? contadoresEstado[opt.valor] : undefined,
    }));
  }, [contadoresEstado]);

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
      variant="outline"
      size="sm"
      onClick={onRefrescar}
      disabled={cargando}
      title="Actualizar datos"
      aria-label="Actualizar datos"
    >
      <RotateCw size={14} className={cargando ? 'animate-spin' : ''} aria-hidden="true" />
      <span>{cargando ? 'Actualizando...' : 'Actualizar'}</span>
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          alignItems: 'flex-end',
        }}
      >
        <div>
          <FilterSearchInput
            id="busqueda-roles"
            label="Buscar perfil:"
            value={busqueda}
            onChange={onBusquedaChange}
            placeholder="Buscar por nombre, descripción o módulo..."
            debounceMs={300}
          />
        </div>

        <SegmentedButtonGroup<FiltroTipoRol>
          id="filtro-tipo-rol"
          label="Tipo de Rol:"
          options={opcionesTipoConContador}
          value={filtroTipo}
          onChange={onFiltroTipoChange}
        />

        <SegmentedButtonGroup<FiltroEstadoPermisos>
          id="filtro-estado-permisos"
          label="Estado de Permisos:"
          options={opcionesEstadoConContador}
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
