'use client';

import React from 'react';
import type { EstadoRecurso } from '@/types/recurso';
import { useCatalogos } from '@/hooks/useCatalogos';
import {
  FilterBar,
  FilterSearchInput,
  SegmentedButtonGroup,
  FilterSelect,
  ActiveFilterChips,
  type ActiveChipItem,
} from '@/components/common/filters';

interface RecursosFiltrosProps {
  busqueda: string;
  estado?: EstadoRecurso;
  delegacionId?: string;
  delegacionNombre?: string;
  esIndividual?: boolean;
  onCambiarBusqueda: (busqueda: string) => void;
  onCambiarEstado: (estado?: EstadoRecurso) => void;
  onCambiarDelegacion: (delegacion?: string) => void;
  onCambiarEsIndividual: (esIndividual?: boolean) => void;
  onLimpiarFiltros: () => void;
  contadoresTipo?: { total?: number; individual?: number; granel?: number };
}

const OPCIONES_ESTADO = [
  { valor: '', etiqueta: 'Todos los estados' },
  { valor: 'DISPONIBLE', etiqueta: 'Disponible' },
  { valor: 'ASIGNADO', etiqueta: 'Asignado a Cuadrilla' },
  { valor: 'EN_MANTENCION', etiqueta: 'En Mantención' },
  { valor: 'BAJO_STOCK', etiqueta: 'Bajo Stock (Alerta)' },
  { valor: 'NO_DISPONIBLE', etiqueta: 'No Disponible' },
] as const;

const OPCIONES_TIPO_INVENTARIO = [
  { valor: 'TODOS', etiqueta: 'Todos los tipos' },
  { valor: 'INDIVIDUAL', etiqueta: 'Vehículo / Maquinaria (Individual)' },
  { valor: 'GRANEL', etiqueta: 'Material / Insumo (A Granel)' },
] as const;

export default function RecursosFiltros({
  busqueda,
  estado,
  delegacionId,
  delegacionNombre,
  esIndividual,
  onCambiarBusqueda,
  onCambiarEstado,
  onCambiarDelegacion,
  onCambiarEsIndividual,
  onLimpiarFiltros,
  contadoresTipo,
}: RecursosFiltrosProps) {
  const { nombresDelegaciones, resolverNombre } = useCatalogos();

  const opcionesTipoConContador = React.useMemo(() => {
    return OPCIONES_TIPO_INVENTARIO.map((opt) => {
      let contador: number | undefined;
      if (contadoresTipo) {
        if (opt.valor === 'TODOS') contador = contadoresTipo.total;
        else if (opt.valor === 'INDIVIDUAL') contador = contadoresTipo.individual;
        else if (opt.valor === 'GRANEL') contador = contadoresTipo.granel;
      }
      return {
        ...opt,
        contador,
      };
    });
  }, [contadoresTipo]);

  // Nombre efectivo de la delegación (resuelve si vino por Id o por Nombre)
  const delegacionActual =
    delegacionNombre ||
    (delegacionId ? resolverNombre(delegacionId) || '' : '');

  const opcionesDelegacion = [
    { valor: '', etiqueta: 'Todas las delegaciones' },
    ...nombresDelegaciones.map((nombre) => ({
      valor: nombre,
      etiqueta: nombre,
    })),
  ];

  const handleTipoInventarioChange = (val: string) => {
    if (val === 'INDIVIDUAL') {
      onCambiarEsIndividual(true);
    } else if (val === 'GRANEL') {
      onCambiarEsIndividual(false);
    } else {
      onCambiarEsIndividual(undefined);
    }
  };

  const tipoInventarioValor =
    esIndividual === undefined ? 'TODOS' : esIndividual ? 'INDIVIDUAL' : 'GRANEL';

  // Chips activos con nombres legibles
  const chipsActivos: ActiveChipItem[] = [];

  if (busqueda?.trim()) {
    chipsActivos.push({
      id: 'busqueda',
      etiqueta: 'Búsqueda',
      valorVisible: `"${busqueda.trim()}"`,
      onRemove: () => onCambiarBusqueda(''),
    });
  }

  if (delegacionActual) {
    chipsActivos.push({
      id: 'delegacion',
      etiqueta: 'Delegación',
      valorVisible: delegacionActual,
      onRemove: () => onCambiarDelegacion(undefined),
      esDelegacion: true,
    });
  }

  if (estado) {
    const labelEstado = OPCIONES_ESTADO.find((e) => e.valor === estado)?.etiqueta || estado;
    chipsActivos.push({
      id: 'estado',
      etiqueta: 'Estado',
      valorVisible: labelEstado,
      onRemove: () => onCambiarEstado(undefined),
    });
  }

  if (esIndividual !== undefined) {
    chipsActivos.push({
      id: 'tipo',
      etiqueta: 'Tipo',
      valorVisible: esIndividual ? 'Vehículo o Maquinaria' : 'Material o Insumo',
      onRemove: () => onCambiarEsIndividual(undefined),
    });
  }

  return (
    <FilterBar
      titulo="Filtros de Recursos"
      storageKey="sgrai:filtros:recursos:colapsado"
      totalFiltrosActivos={chipsActivos.length}
    >
      {/* Botonera segmentada de tipo de inventario (Imagen 1) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <SegmentedButtonGroup
          label="Tipo de Inventario:"
          options={opcionesTipoConContador}
          value={tipoInventarioValor}
          onChange={handleTipoInventarioChange}
          ariaLabel="Filtrar por tipo de inventario individual o a granel"
        />
      </div>

      {/* Controles en cuadrícula con etiquetas superiores (Imagen 2) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          alignItems: 'flex-end',
        }}
      >
        <FilterSearchInput
          id="filtro-busqueda"
          label="Buscar por nombre o descripción:"
          value={busqueda}
          onChange={onCambiarBusqueda}
          placeholder="Ej: Camioneta, Sacos..."
          debounceMs={300}
        />

        <FilterSelect
          id="filtro-delegacion"
          label="Delegación Territorial:"
          value={delegacionActual}
          options={opcionesDelegacion}
          onChange={(val) => onCambiarDelegacion(val || undefined)}
        />

        <FilterSelect
          id="filtro-estado"
          label="Estado Operativo:"
          value={estado || ''}
          options={OPCIONES_ESTADO}
          onChange={(val) => onCambiarEstado((val as EstadoRecurso) || undefined)}
        />
      </div>

      {/* Chips activos con nombres y botón Limpiar */}
      <ActiveFilterChips
        chips={chipsActivos}
        onClearAll={onLimpiarFiltros}
        clearAllText="Limpiar todos los filtros"
      />
    </FilterBar>
  );
}
