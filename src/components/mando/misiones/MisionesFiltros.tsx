'use client';

import React from 'react';
import { RotateCw } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useCatalogos } from '@/hooks/useCatalogos';
import type { FiltrosMisiones, EstadoMision, TipoMision, PrioridadMision } from '@/types/misiones';
import {
  FilterBar,
  FilterSearchInput,
  SegmentedButtonGroup,
  FilterSelect,
  ActiveFilterChips,
  type ActiveChipItem,
} from '@/components/common/filters';

interface MisionesFiltrosProps {
  filtros: FiltrosMisiones;
  onFiltrosChange: (actualizador: Partial<FiltrosMisiones>) => void;
  onLimpiarFiltros: () => void;
  onRefrescar: () => void;
  cargando: boolean;
}

const OPCIONES_ESTADO = [
  { valor: 'TODOS', etiqueta: 'Todos' },
  { valor: 'PLANIFICADA', etiqueta: 'Planificadas' },
  { valor: 'DESPACHADA', etiqueta: 'Despachadas' },
  { valor: 'EN_CURSO', etiqueta: 'En Curso' },
  { valor: 'COMPLETADA', etiqueta: 'Completadas' },
  { valor: 'RECHAZADA', etiqueta: 'Rechazadas' },
] as const;

const OPCIONES_TIPO = [
  { valor: 'TODOS', etiqueta: 'Todos los Tipos' },
  { valor: 'VERIFICACION', etiqueta: 'Verificación en Terreno' },
  { valor: 'ATENCION_CUADRILLA', etiqueta: 'Atención con Cuadrilla' },
  { valor: 'PREVENCION', etiqueta: 'Mitigación y Prevención' },
  { valor: 'RECUPERACION', etiqueta: 'Recuperación y Despeje' },
  { valor: 'ASISTENCIA_SOCIAL', etiqueta: 'Asistencia Social (FIBE)' },
] as const;

const OPCIONES_PRIORIDAD = [
  { valor: '', etiqueta: 'Todas las Prioridades' },
  { valor: 'CRITICA', etiqueta: 'Crítica' },
  { valor: 'ALTA', etiqueta: 'Alta' },
  { valor: 'MEDIA', etiqueta: 'Media' },
  { valor: 'BAJA', etiqueta: 'Baja' },
] as const;

export const MisionesFiltros: React.FC<MisionesFiltrosProps> = ({
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

  // Chips activos con nombres legibles
  const chipsActivos: ActiveChipItem[] = [];

  if (filtros.busqueda.trim()) {
    chipsActivos.push({
      id: 'busqueda',
      etiqueta: 'Búsqueda',
      valorVisible: `"${filtros.busqueda.trim()}"`,
      onRemove: () => onFiltrosChange({ busqueda: '' }),
    });
  }

  if (filtros.estado && filtros.estado !== 'TODOS') {
    const label = OPCIONES_ESTADO.find((e) => e.valor === filtros.estado)?.etiqueta || filtros.estado;
    chipsActivos.push({
      id: 'estado',
      etiqueta: 'Estado',
      valorVisible: label,
      onRemove: () => onFiltrosChange({ estado: 'TODOS' }),
    });
  }

  if (filtros.tipoMision && filtros.tipoMision !== 'TODOS') {
    const label = OPCIONES_TIPO.find((t) => t.valor === filtros.tipoMision)?.etiqueta || filtros.tipoMision;
    chipsActivos.push({
      id: 'tipoMision',
      etiqueta: 'Tipo',
      valorVisible: label,
      onRemove: () => onFiltrosChange({ tipoMision: 'TODOS' }),
    });
  }

  if (filtros.delegacion && filtros.delegacion !== 'TODAS') {
    chipsActivos.push({
      id: 'delegacion',
      etiqueta: 'Delegación',
      valorVisible: filtros.delegacion,
      onRemove: () => onFiltrosChange({ delegacion: 'TODAS' }),
      esDelegacion: true,
    });
  }

  if (filtros.prioridad) {
    chipsActivos.push({
      id: 'prioridad',
      etiqueta: 'Prioridad',
      valorVisible: filtros.prioridad,
      onRemove: () => onFiltrosChange({ prioridad: '' }),
    });
  }

  return (
    <FilterBar collapsibleOnMobile totalFiltrosActivos={chipsActivos.length}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <SegmentedButtonGroup
          label="Estado Operativo de Misión:"
          options={OPCIONES_ESTADO}
          value={filtros.estado || 'TODOS'}
          onChange={(val) => onFiltrosChange({ estado: val as EstadoMision | 'TODOS' })}
          ariaLabel="Filtrar misiones por estado operativo"
        />

        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onRefrescar}
          disabled={cargando}
          title="Refrescar listado de misiones"
        >
          <RotateCw size={14} className={cargando ? 'animate-spin' : undefined} aria-hidden="true" />
          <span>{cargando ? 'Actualizando...' : 'Refrescar'}</span>
        </Button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          alignItems: 'flex-end',
        }}
      >
        <FilterSearchInput
          id="filtro-mision-busqueda"
          label="Buscar por código, título o detalle:"
          value={filtros.busqueda}
          onChange={(val) => onFiltrosChange({ busqueda: val })}
          placeholder="Ej: MIS-2026, Retiro de escombros..."
          debounceMs={300}
        />

        <FilterSelect
          id="filtro-mision-delegacion"
          label="Delegación Territorial:"
          value={filtros.delegacion || 'TODAS'}
          options={opcionesDelegacion}
          onChange={(val) => onFiltrosChange({ delegacion: val })}
        />

        <FilterSelect
          id="filtro-mision-tipo"
          label="Tipo de Misión:"
          value={filtros.tipoMision || 'TODOS'}
          options={OPCIONES_TIPO}
          onChange={(val) => onFiltrosChange({ tipoMision: val as TipoMision | 'TODOS' })}
        />

        <FilterSelect
          id="filtro-mision-prioridad"
          label="Prioridad:"
          value={filtros.prioridad || ''}
          options={OPCIONES_PRIORIDAD}
          onChange={(val) => onFiltrosChange({ prioridad: val as PrioridadMision | '' })}
        />
      </div>

      <ActiveFilterChips
        chips={chipsActivos}
        onClearAll={onLimpiarFiltros}
        clearAllText="Limpiar todos los filtros"
      />
    </FilterBar>
  );
};

export default MisionesFiltros;
