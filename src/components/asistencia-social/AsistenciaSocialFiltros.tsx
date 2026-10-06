'use client';

import React, { useMemo } from 'react';
import { DELEGACIONES_MUNICIPALES } from '@/hooks/usePuntosCriticos';
import {
  FilterBar,
  FilterSearchInput,
  FilterSelect,
  ActiveFilterChips,
  type ActiveChipItem,
} from '@/components/common/filters';
import type {
  FiltrosEventosAsistenciaSocialState,
  PrioridadEventoSocial,
  EstadoEventoSocial,
} from '@/types/asistenciaSocial';

interface AsistenciaSocialFiltrosProps {
  filtros: FiltrosEventosAsistenciaSocialState;
  onCambiarBusqueda: (busqueda: string) => void;
  onCambiarDelegacion: (delegacionId?: string) => void;
  onCambiarPrioridad: (prioridad?: PrioridadEventoSocial) => void;
  onCambiarEstado: (estado?: EstadoEventoSocial) => void;
  onLimpiarFiltros: () => void;
}

const OPCIONES_PRIORIDAD = [
  { valor: '', etiqueta: 'Todas las prioridades' },
  { valor: 'CRITICA', etiqueta: 'Crítica' },
  { valor: 'ALTA', etiqueta: 'Alta' },
  { valor: 'MEDIA', etiqueta: 'Media' },
  { valor: 'BAJA', etiqueta: 'Baja' },
];

const OPCIONES_ESTADO = [
  { valor: 'PENDIENTE', etiqueta: 'Pendientes de asignación' },
  { valor: 'ASIGNADO', etiqueta: 'Asistente asignado' },
  { valor: 'EN_EVALUACION_FIBE', etiqueta: 'En evaluación FIBE' },
  { valor: 'FINALIZADO', etiqueta: 'Finalizados' },
  { valor: '', etiqueta: 'Todos los estados' },
];

export default function AsistenciaSocialFiltros({
  filtros,
  onCambiarBusqueda,
  onCambiarDelegacion,
  onCambiarPrioridad,
  onCambiarEstado,
  onLimpiarFiltros,
}: AsistenciaSocialFiltrosProps) {
  const opcionesDelegacion = useMemo(
    () => [
      { valor: '', etiqueta: 'Todas las delegaciones' },
      ...DELEGACIONES_MUNICIPALES.map((d) => ({
        valor: d.id,
        etiqueta: d.nombre,
      })),
    ],
    []
  );

  const chipsActivos = useMemo<ActiveChipItem[]>(() => {
    const chips: ActiveChipItem[] = [];

    if (filtros.busqueda && filtros.busqueda.trim() !== '') {
      chips.push({
        id: 'busqueda',
        etiqueta: 'Búsqueda',
        valorVisible: `"${filtros.busqueda}"`,
        onRemove: () => onCambiarBusqueda(''),
      });
    }

    if (filtros.delegacionId) {
      const match = DELEGACIONES_MUNICIPALES.find((d) => d.id === filtros.delegacionId);
      chips.push({
        id: 'delegacion',
        etiqueta: 'Delegación',
        valorVisible: match ? match.nombre : filtros.delegacionId,
        onRemove: () => onCambiarDelegacion(undefined),
      });
    }

    if (filtros.prioridad) {
      const match = OPCIONES_PRIORIDAD.find((p) => p.valor === filtros.prioridad);
      chips.push({
        id: 'prioridad',
        etiqueta: 'Prioridad',
        valorVisible: match ? match.etiqueta : filtros.prioridad,
        onRemove: () => onCambiarPrioridad(undefined),
      });
    }

    if (filtros.estado && filtros.estado !== 'PENDIENTE') {
      const match = OPCIONES_ESTADO.find((e) => e.valor === filtros.estado);
      chips.push({
        id: 'estado',
        etiqueta: 'Estado',
        valorVisible: match ? match.etiqueta : filtros.estado,
        onRemove: () => onCambiarEstado('PENDIENTE'),
      });
    }

    return chips;
  }, [filtros, onCambiarBusqueda, onCambiarDelegacion, onCambiarPrioridad, onCambiarEstado]);

  return (
    <FilterBar
      titulo="Filtros y Búsqueda"
      storageKey="sgrai:filtros:asistencia-social:colapsado"
      totalFiltrosActivos={chipsActivos.length}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          alignItems: 'flex-end',
        }}
      >
        <FilterSearchInput
          id="filtro-busqueda-asistencia-social"
          label="Búsqueda Rápida:"
          value={filtros.busqueda || ''}
          onChange={onCambiarBusqueda}
          placeholder="Código AS, dirección, contacto..."
        />

        <FilterSelect
          id="filtro-delegacion-asistencia-social"
          label="Delegación Territorial:"
          value={filtros.delegacionId || ''}
          options={opcionesDelegacion}
          onChange={(val) => onCambiarDelegacion(val || undefined)}
        />

        <FilterSelect
          id="filtro-prioridad-asistencia-social"
          label="Prioridad:"
          value={filtros.prioridad || ''}
          options={OPCIONES_PRIORIDAD}
          onChange={(val) => onCambiarPrioridad((val as PrioridadEventoSocial) || undefined)}
        />

        <FilterSelect
          id="filtro-estado-asistencia-social"
          label="Estado del Caso:"
          value={filtros.estado || ''}
          options={OPCIONES_ESTADO}
          onChange={(val) => onCambiarEstado((val as EstadoEventoSocial) || undefined)}
        />
      </div>

      <ActiveFilterChips
        chips={chipsActivos}
        onClearAll={onLimpiarFiltros}
        clearAllText="Limpiar filtros"
      />
    </FilterBar>
  );
}
