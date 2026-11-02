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
  FiltrosAsistentesSocialesState,
  EstadoOperativoPersonal,
} from '@/types/asistenteSocialPersonal';

interface AsistentesSocialesFiltrosProps {
  filtros: FiltrosAsistentesSocialesState;
  onCambiarBusqueda: (busqueda: string) => void;
  onCambiarDelegacion: (delegacionId?: string) => void;
  onCambiarEstadoOperativo: (estado?: EstadoOperativoPersonal) => void;
  onLimpiarFiltros: () => void;
}

const OPCIONES_ESTADO_OPERATIVO = [
  { valor: '', etiqueta: 'Todos los estados' },
  { valor: 'disponible', etiqueta: 'Disponible' },
  { valor: 'en_mision', etiqueta: 'En Misión' },
  { valor: 'descanso', etiqueta: 'Descanso' },
  { valor: 'licencia', etiqueta: 'Licencia Médica' },
  { valor: 'inactivo', etiqueta: 'Inactivo' },
];

export default function AsistentesSocialesFiltros({
  filtros,
  onCambiarBusqueda,
  onCambiarDelegacion,
  onCambiarEstadoOperativo,
  onLimpiarFiltros,
}: AsistentesSocialesFiltrosProps) {
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

    if (filtros.estadoOperativo) {
      const match = OPCIONES_ESTADO_OPERATIVO.find((e) => e.valor === filtros.estadoOperativo);
      chips.push({
        id: 'estadoOperativo',
        etiqueta: 'Estado Operativo',
        valorVisible: match ? match.etiqueta : filtros.estadoOperativo,
        onRemove: () => onCambiarEstadoOperativo(undefined),
      });
    }

    return chips;
  }, [filtros, onCambiarBusqueda, onCambiarDelegacion, onCambiarEstadoOperativo]);

  return (
    <FilterBar
      titulo="Filtros y Búsqueda de Personal"
      storageKey="sgrai:filtros:asistentes-sociales:colapsado"
      totalFiltrosActivos={chipsActivos.length}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-3, 12px)',
          alignItems: 'flex-end',
        }}
      >
        <FilterSearchInput
          id="filtro-busqueda-asistentes-sociales"
          label="Búsqueda de Asistente:"
          value={filtros.busqueda || ''}
          onChange={onCambiarBusqueda}
          placeholder="Nombre, RUT, teléfono o email..."
        />

        <FilterSelect
          id="filtro-delegacion-asistentes-sociales"
          label="Delegación Territorial:"
          value={filtros.delegacionId || ''}
          options={opcionesDelegacion}
          onChange={(val) => onCambiarDelegacion(val || undefined)}
        />

        <FilterSelect
          id="filtro-estado-asistentes-sociales"
          label="Estado Operativo:"
          value={filtros.estadoOperativo || ''}
          options={OPCIONES_ESTADO_OPERATIVO}
          onChange={(val) => onCambiarEstadoOperativo((val as EstadoOperativoPersonal) || undefined)}
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
