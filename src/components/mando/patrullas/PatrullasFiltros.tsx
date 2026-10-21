'use client';

import React from 'react';
import { RotateCw } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useCatalogos } from '@/hooks/useCatalogos';
import type { FiltrosPatrullas, EstadoPatrullaEnum } from '@/types/patrullas';
import {
  FilterBar,
  FilterSearchInput,
  FilterSelect,
  ActiveFilterChips,
  type ActiveChipItem,
} from '@/components/common/filters';

interface PatrullasFiltrosProps {
  filtros: FiltrosPatrullas;
  onFiltrosChange: (actualizador: Partial<FiltrosPatrullas>) => void;
  onLimpiarFiltros: () => void;
  onRefrescar: () => void;
  cargando: boolean;
}

const OPCIONES_ESTADO = [
  { valor: 'TODOS', etiqueta: 'Todos los estados' },
  { valor: 'DISPONIBLE', etiqueta: 'Disponibles' },
  { valor: 'EN_VERIFICACION', etiqueta: 'En Verificación' },
  { valor: 'EN_PREVENCION', etiqueta: 'En Prevención' },
  { valor: 'EN_RECUPERACION', etiqueta: 'En Recuperación' },
  { valor: 'EN_MISION', etiqueta: 'En Misión' },
  { valor: 'NO_DISPONIBLE', etiqueta: 'No Disponibles' },
] as const;

export const PatrullasFiltros: React.FC<PatrullasFiltrosProps> = ({
  filtros,
  onFiltrosChange,
  onLimpiarFiltros,
  onRefrescar,
  cargando,
}) => {
  const { nombresDelegaciones } = useCatalogos();

  const opcionesDelegacion = [
    { valor: 'TODAS', etiqueta: 'Todas las delegaciones' },
    ...nombresDelegaciones.map((nombre) => ({
      valor: nombre,
      etiqueta: nombre,
    })),
  ];

  // Chips de filtros activos
  const chipsActivos: ActiveChipItem[] = [];

  if (filtros.busqueda?.trim()) {
    chipsActivos.push({
      id: 'filtro-chip-busqueda',
      etiqueta: 'Búsqueda',
      valorVisible: `"${filtros.busqueda.trim()}"`,
      onRemove: () => onFiltrosChange({ busqueda: '' }),
    });
  }

  if (filtros.delegacion && filtros.delegacion !== 'TODAS') {
    chipsActivos.push({
      id: 'filtro-chip-delegacion',
      etiqueta: 'Delegación',
      valorVisible: filtros.delegacion,
      esDelegacion: true,
      onRemove: () => onFiltrosChange({ delegacion: 'TODAS', delegacionId: undefined }),
    });
  }

  if (filtros.estado && filtros.estado !== 'TODOS') {
    const estadoObj = OPCIONES_ESTADO.find((e) => e.valor === filtros.estado);
    chipsActivos.push({
      id: 'filtro-chip-estado',
      etiqueta: 'Estado',
      valorVisible: estadoObj ? estadoObj.etiqueta : filtros.estado,
      onRemove: () => onFiltrosChange({ estado: 'TODOS' }),
    });
  }

  return (
    <FilterBar>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          width: '100%',
        }}
      >
        {/* Búsqueda textual */}
        <FilterSearchInput
          id="filtro-patrulla-busqueda"
          label="Buscar:"
          value={filtros.busqueda || ''}
          placeholder="Buscar por patrulla o líder..."
          onChange={(busqueda) => onFiltrosChange({ busqueda })}
        />

        {/* Selector de Delegación Territorial */}
        <FilterSelect
          id="filtro-patrulla-delegacion"
          label="Delegación"
          value={filtros.delegacion || 'TODAS'}
          options={opcionesDelegacion}
          onChange={(delegacion) => onFiltrosChange({ delegacion, delegacionId: undefined })}
          disabled={cargando}
        />

        {/* Selector de Estado Operativo */}
        <FilterSelect
          id="filtro-patrulla-estado"
          label="Estado"
          value={filtros.estado || 'TODOS'}
          options={OPCIONES_ESTADO}
          onChange={(estado) => onFiltrosChange({ estado: estado as EstadoPatrullaEnum | 'TODOS' })}
          disabled={cargando}
        />

        {/* Botón de Refrescar */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefrescar}
          disabled={cargando}
          title="Refrescar lista de patrullas"
          style={{ minHeight: '38px', borderRadius: 0 }}
        >
          <RotateCw size={14} className={cargando ? 'animate-spin' : ''} style={{ marginRight: '6px' }} />
          <span>Refrescar</span>
        </Button>
      </div>

      {/* Chips activos si existen */}
      {chipsActivos.length > 0 && (
        <ActiveFilterChips chips={chipsActivos} onClearAll={onLimpiarFiltros} />
      )}
    </FilterBar>
  );
};
