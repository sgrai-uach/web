'use client';

import React from 'react';
import type { PrioridadPuntoCritico } from '@/types/puntoCritico';
import { useCatalogos } from '@/hooks/useCatalogos';
import {
  FilterBar,
  FilterSearchInput,
  FilterSelect,
  ActiveFilterChips,
  type ActiveChipItem,
} from '@/components/common/filters';

interface PuntosCriticosFiltrosProps {
  busqueda: string;
  delegacionId?: string;
  delegacionNombre?: string;
  prioridad?: PrioridadPuntoCritico;
  onCambiarBusqueda: (busqueda: string) => void;
  onCambiarDelegacion: (delegacionId?: string, delegacionNombre?: string) => void;
  onCambiarPrioridad: (prioridad?: PrioridadPuntoCritico) => void;
  onLimpiarFiltros: () => void;
}

const OPCIONES_PRIORIDAD = [
  { valor: '', etiqueta: 'Todas las prioridades' },
  { valor: 'CRITICA', etiqueta: 'Crítica' },
  { valor: 'ALTA', etiqueta: 'Alta' },
  { valor: 'MEDIA', etiqueta: 'Media' },
  { valor: 'BAJA', etiqueta: 'Baja' },
] as const;

export default function PuntosCriticosFiltros({
  busqueda,
  delegacionId,
  delegacionNombre,
  prioridad,
  onCambiarBusqueda,
  onCambiarDelegacion,
  onCambiarPrioridad,
  onLimpiarFiltros,
}: PuntosCriticosFiltrosProps) {
  const { nombresDelegaciones, resolverId, resolverNombre } = useCatalogos();

  // Nombre visible para la delegación seleccionada
  const nombreDelegacionSeleccionada =
    delegacionNombre ||
    (delegacionId ? resolverNombre(delegacionId) || delegacionId : 'TODAS');

  const opcionesDelegacion = [
    { valor: 'TODAS', etiqueta: 'Todas las delegaciones' },
    ...nombresDelegaciones.map((n) => ({
      valor: n,
      etiqueta: n,
    })),
  ];

  const handleDelegacionChange = (valor: string) => {
    if (valor === 'TODAS' || !valor) {
      onCambiarDelegacion(undefined, undefined);
    } else {
      const idResuelto = resolverId(valor);
      onCambiarDelegacion(idResuelto, valor);
    }
  };

  // Construcción de chips activos
  const chipsActivos: ActiveChipItem[] = [];

  if (busqueda?.trim()) {
    chipsActivos.push({
      id: 'busqueda',
      etiqueta: 'Búsqueda',
      valorVisible: `"${busqueda.trim()}"`,
      onRemove: () => onCambiarBusqueda(''),
    });
  }

  if (nombreDelegacionSeleccionada && nombreDelegacionSeleccionada !== 'TODAS') {
    chipsActivos.push({
      id: 'delegacion',
      etiqueta: 'Delegación',
      valorVisible: nombreDelegacionSeleccionada,
      onRemove: () => handleDelegacionChange('TODAS'),
      esDelegacion: true,
    });
  }

  if (prioridad) {
    chipsActivos.push({
      id: 'prioridad',
      etiqueta: 'Prioridad',
      valorVisible: prioridad,
      onRemove: () => onCambiarPrioridad(undefined),
    });
  }

  return (
    <FilterBar
      titulo="Filtros de Puntos Críticos"
      storageKey="sgrai:filtros:puntos-criticos:colapsado"
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
          id="filtro-busqueda-pc"
          label="Buscar sector o código:"
          value={busqueda}
          onChange={onCambiarBusqueda}
          placeholder="Ej: PC-ANG-01, Humedal, Inundación..."
          debounceMs={300}
        />

        <FilterSelect
          id="filtro-delegacion-pc"
          label="Delegación Territorial:"
          value={nombreDelegacionSeleccionada}
          options={opcionesDelegacion}
          onChange={handleDelegacionChange}
        />

        <FilterSelect
          id="filtro-prioridad-pc"
          label="Prioridad Operativa:"
          value={prioridad || ''}
          options={OPCIONES_PRIORIDAD}
          onChange={(val) => onCambiarPrioridad((val as PrioridadPuntoCritico) || undefined)}
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
