'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import { RotateCw } from 'lucide-react';
import type {
  FiltroDelegacion,
  FiltroEstado,
  FiltroOrigen,
  FiltroSemaforo,
} from '@/types/avisos';
import { ESTADOS_OPCIONES } from '@/types/avisos';
import { useCatalogos } from '@/hooks/useCatalogos';
import {
  FilterBar,
  FilterSearchInput,
  FilterSelect,
  ActiveFilterChips,
  type ActiveChipItem,
} from '@/components/common/filters';

interface AvisosFiltrosProps {
  busqueda: string;
  onBusquedaChange: (val: string) => void;
  filtroOrigen: FiltroOrigen;
  onFiltroOrigenChange: (val: FiltroOrigen) => void;
  filtroSemaforo: FiltroSemaforo;
  onFiltroSemaforoChange: (val: FiltroSemaforo) => void;
  filtroDelegacion: FiltroDelegacion;
  onFiltroDelegacionChange: (val: FiltroDelegacion) => void;
  filtroEstado: FiltroEstado;
  onFiltroEstadoChange: (val: FiltroEstado) => void;
  hayFiltrosActivos: boolean;
  onLimpiarFiltros: () => void;
  onRefrescar: () => void;
  cargando: boolean;
}

export default function AvisosFiltros({
  busqueda,
  onBusquedaChange,
  filtroOrigen,
  onFiltroOrigenChange,
  filtroSemaforo,
  onFiltroSemaforoChange,
  filtroDelegacion,
  onFiltroDelegacionChange,
  filtroEstado,
  onFiltroEstadoChange,
  hayFiltrosActivos,
  onLimpiarFiltros,
  onRefrescar,
  cargando,
}: AvisosFiltrosProps) {
  const { nombresDelegaciones } = useCatalogos();

  const delegacionesOpciones = [
    { valor: 'TODAS', etiqueta: 'Todas las delegaciones' },
    ...nombresDelegaciones.map((n) => ({
      valor: n,
      etiqueta: n,
    })),
  ];

  const estadosOpciones = ESTADOS_OPCIONES.map((e) => ({
    valor: e.valor,
    etiqueta: e.etiqueta,
  }));

  const origenOpciones = [
    { valor: 'TODOS', etiqueta: 'Todos los canales' },
    { valor: 'WEB', etiqueta: 'Portal Web' },
    { valor: 'CHATBOT', etiqueta: 'Chatbot Municipal' },
    { valor: 'TELEFONO', etiqueta: 'Central Telefónica' },
  ];

  const semaforoOpciones = [
    { valor: 'TODOS', etiqueta: 'Todas las prioridades' },
    { valor: 'EN_TIEMPO', etiqueta: 'En Tiempo (< 15 min)' },
    { valor: 'PRECAUCION', etiqueta: 'Precaución (15-30 min)' },
    { valor: 'URGENTE', etiqueta: 'Urgente (> 30 min)' },
  ];

  // Construcción de chips activos
  const chipsActivos: ActiveChipItem[] = [];

  if (busqueda.trim()) {
    chipsActivos.push({
      id: 'busqueda',
      etiqueta: 'Texto',
      valorVisible: `"${busqueda.trim()}"`,
      onRemove: () => onBusquedaChange(''),
    });
  }

  if (filtroDelegacion !== 'TODAS') {
    chipsActivos.push({
      id: 'delegacion',
      etiqueta: 'Delegación',
      valorVisible: filtroDelegacion,
      onRemove: () => onFiltroDelegacionChange('TODAS'),
      esDelegacion: true,
    });
  }

  if (filtroEstado !== 'PENDIENTE') {
    const labelEstado =
      filtroEstado === 'VERIFICADO'
        ? 'Verificado'
        : filtroEstado === 'RECHAZADO'
        ? 'Rechazado'
        : 'Todos';
    chipsActivos.push({
      id: 'estado',
      etiqueta: 'Estado',
      valorVisible: labelEstado,
      onRemove: () => onFiltroEstadoChange('PENDIENTE'),
    });
  }

  if (filtroOrigen !== 'TODOS') {
    const labelOrigen =
      filtroOrigen === 'WEB'
        ? 'Portal Web'
        : filtroOrigen === 'CHATBOT'
        ? 'Chatbot'
        : 'Teléfono';
    chipsActivos.push({
      id: 'origen',
      etiqueta: 'Canal',
      valorVisible: labelOrigen,
      onRemove: () => onFiltroOrigenChange('TODOS'),
    });
  }

  if (filtroSemaforo !== 'TODOS') {
    const labelSemaforo =
      filtroSemaforo === 'EN_TIEMPO'
        ? 'En Tiempo'
        : filtroSemaforo === 'PRECAUCION'
        ? 'Precaución'
        : 'Urgente';
    chipsActivos.push({
      id: 'semaforo',
      etiqueta: 'Prioridad',
      valorVisible: labelSemaforo,
      onRemove: () => onFiltroSemaforoChange('TODOS'),
    });
  }

  return (
    <FilterBar
      titulo="Bandeja de Avisos"
      storageKey="sgrai:filtros:avisos:colapsado"
      totalFiltrosActivos={chipsActivos.length}
      headerActions={
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onRefrescar}
          disabled={cargando}
          title="Refrescar lista de avisos"
        >
          <RotateCw size={14} className={cargando ? 'animate-spin' : ''} aria-hidden="true" />
          <span>{cargando ? 'Actualizando...' : 'Refrescar'}</span>
        </Button>
      }
    >
      {/* Grilla principal de controles estandarizada */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          alignItems: 'flex-end',
        }}
      >
        <FilterSearchInput
          id="filtro-busqueda"
          label="Buscar por descripción o calle:"
          value={busqueda}
          onChange={onBusquedaChange}
          placeholder="Ej: Inundación, Picarte..."
          debounceMs={300}
        />

        <FilterSelect
          id="filtro-delegacion"
          label="Delegación Territorial:"
          value={filtroDelegacion}
          options={delegacionesOpciones}
          onChange={(val) => onFiltroDelegacionChange(val as FiltroDelegacion)}
        />

        <FilterSelect
          id="filtro-estado"
          label="Estado del Aviso:"
          value={filtroEstado}
          options={estadosOpciones}
          onChange={(val) => onFiltroEstadoChange(val as FiltroEstado)}
        />

        <FilterSelect
          id="filtro-origen"
          label="Canal de Origen:"
          value={filtroOrigen}
          options={origenOpciones}
          onChange={(val) => onFiltroOrigenChange(val as FiltroOrigen)}
        />

        <FilterSelect
          id="filtro-semaforo"
          label="Prioridad de Espera:"
          value={filtroSemaforo}
          options={semaforoOpciones}
          onChange={(val) => onFiltroSemaforoChange(val as FiltroSemaforo)}
        />
      </div>

      {/* Indicador visual de filtros activos y acción Limpiar Filtros */}
      {(hayFiltrosActivos || chipsActivos.length > 0) && (
        <div data-testid="indicador-filtros-activos">
          <ActiveFilterChips
            chips={chipsActivos}
            onClearAll={onLimpiarFiltros}
            clearAllText="Limpiar filtros"
          />
        </div>
      )}
    </FilterBar>
  );
}
