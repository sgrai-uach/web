'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import { RotateCw, ClipboardList } from 'lucide-react';
import type { FiltrosKanban } from '@/hooks/useIncidentesKanban';
import type { PrioridadIncidente } from '@/services/incidentesService';
import { useCatalogos } from '@/hooks/useCatalogos';
import {
  FilterBar,
  FilterSearchInput,
  SegmentedButtonGroup,
  FilterSelect,
  ActiveFilterChips,
  type ActiveChipItem,
} from '@/components/common/filters';

interface KanbanFiltrosProps {
  filtros: FiltrosKanban;
  onFiltrosChange: (nuevosFiltros: FiltrosKanban) => void;
  onLimpiarFiltros?: () => void;
  onRecargar: () => void;
  cargando: boolean;
  onAbrirMisiones?: () => void;
}

const OPCIONES_ESTADO = [
  { valor: 'TODOS', etiqueta: 'Todas las columnas' },
  { valor: 'REPORTADO', etiqueta: 'Reportado' },
  { valor: 'VERIFICANDO', etiqueta: 'Verificando' },
  { valor: 'EN_ATENCION', etiqueta: 'En Atención' },
  { valor: 'RESUELTO', etiqueta: 'Resuelto' },
  { valor: 'NO_ABORDABLE', etiqueta: 'No Abordable' },
] as const;

const OPCIONES_PRIORIDAD = [
  { valor: '', etiqueta: 'Todas las Prioridades' },
  { valor: 'CRITICA', etiqueta: 'Prioridad Crítica' },
  { valor: 'ALTA', etiqueta: 'Prioridad Alta' },
  { valor: 'MEDIA', etiqueta: 'Prioridad Media' },
  { valor: 'BAJA', etiqueta: 'Prioridad Baja' },
] as const;

const OPCIONES_AFECTACION = [
  { valor: '', etiqueta: 'Todos los Tipos de Afectación' },
  { valor: 'Inundación', etiqueta: 'Inundación' },
  { valor: 'Anegamiento', etiqueta: 'Anegamiento' },
  { valor: 'Caída de árbol', etiqueta: 'Caída de árbol' },
  { valor: 'Derrumbe', etiqueta: 'Derrumbe' },
  { valor: 'Corte de camino', etiqueta: 'Corte de camino' },
  { valor: 'Incendio', etiqueta: 'Incendio' },
  { valor: 'Peligro estructural', etiqueta: 'Peligro estructural' },
] as const;

const OPCIONES_ORIGEN = [
  { valor: '', etiqueta: 'Todos los Canales' },
  { valor: 'WEB', etiqueta: 'Portal Web' },
  { valor: 'CHATBOT', etiqueta: 'Chatbot Municipal' },
  { valor: 'LLAMADA_TELEFONICA', etiqueta: 'Central Telefónica' },
  { valor: 'FUNCIONARIO_TERRENO', etiqueta: 'Funcionario en Terreno' },
] as const;

export const KanbanFiltros: React.FC<KanbanFiltrosProps> = ({
  filtros,
  onFiltrosChange,
  onLimpiarFiltros,
  onRecargar,
  cargando,
  onAbrirMisiones,
}) => {
  const { nombresDelegaciones } = useCatalogos();

  const handleBusquedaChange = (valor: string) => {
    onFiltrosChange({
      ...filtros,
      busqueda: valor,
    });
  };

  const handleDelegacionChange = (delegacion: string) => {
    onFiltrosChange({
      ...filtros,
      delegacion,
    });
  };

  const handleEstadoChange = (estado: string) => {
    onFiltrosChange({
      ...filtros,
      estado,
    });
  };

  const handlePrioridadChange = (prioridad: string) => {
    onFiltrosChange({
      ...filtros,
      prioridad: prioridad as PrioridadIncidente | '',
    });
  };

  const handleTipoChange = (tipoAfectacion: string) => {
    onFiltrosChange({
      ...filtros,
      tipoAfectacion,
    });
  };

  const handleOrigenChange = (fuenteOrigen: string) => {
    onFiltrosChange({
      ...filtros,
      fuenteOrigen,
    });
  };

  const handleLimpiar = () => {
    if (onLimpiarFiltros) {
      onLimpiarFiltros();
    } else {
      onFiltrosChange({
        busqueda: '',
        delegacion: 'TODAS',
        estado: 'TODOS',
        prioridad: '',
        tipoAfectacion: '',
        fuenteOrigen: '',
        delegacionId: undefined,
        soloHoy: false,
      });
    }
  };

  const opcionesDelegacion = [
    { valor: 'TODAS', etiqueta: 'Todas las delegaciones' },
    ...nombresDelegaciones.map((nombre) => ({
      valor: nombre,
      etiqueta: nombre,
    })),
  ];

  // Construir chips activos con nombres legibles
  const chipsActivos: ActiveChipItem[] = [];

  if (filtros.busqueda.trim()) {
    chipsActivos.push({
      id: 'busqueda',
      etiqueta: 'Búsqueda',
      valorVisible: `"${filtros.busqueda.trim()}"`,
      onRemove: () => handleBusquedaChange(''),
    });
  }

  if (filtros.delegacion && filtros.delegacion !== 'TODAS') {
    chipsActivos.push({
      id: 'delegacion',
      etiqueta: 'Delegación',
      valorVisible: filtros.delegacion,
      onRemove: () => handleDelegacionChange('TODAS'),
      esDelegacion: true,
    });
  }

  if (filtros.estado && filtros.estado !== 'TODOS') {
    const labelEstado = OPCIONES_ESTADO.find((e) => e.valor === filtros.estado)?.etiqueta || filtros.estado;
    chipsActivos.push({
      id: 'estado',
      etiqueta: 'Columna',
      valorVisible: labelEstado,
      onRemove: () => handleEstadoChange('TODOS'),
    });
  }

  if (filtros.prioridad) {
    chipsActivos.push({
      id: 'prioridad',
      etiqueta: 'Prioridad',
      valorVisible: filtros.prioridad,
      onRemove: () => handlePrioridadChange(''),
    });
  }

  if (filtros.tipoAfectacion) {
    chipsActivos.push({
      id: 'tipoAfectacion',
      etiqueta: 'Afectación',
      valorVisible: filtros.tipoAfectacion,
      onRemove: () => handleTipoChange(''),
    });
  }

  if (filtros.fuenteOrigen) {
    const labelOrigen = OPCIONES_ORIGEN.find((o) => o.valor === filtros.fuenteOrigen)?.etiqueta || filtros.fuenteOrigen;
    chipsActivos.push({
      id: 'fuenteOrigen',
      etiqueta: 'Origen',
      valorVisible: labelOrigen,
      onRemove: () => handleOrigenChange(''),
    });
  }

  if (filtros.soloHoy) {
    chipsActivos.push({
      id: 'soloHoy',
      etiqueta: 'Jornada',
      valorVisible: 'Solo hoy',
      onRemove: () => onFiltrosChange({ ...filtros, soloHoy: false }),
    });
  }

  return (
    <FilterBar
      titulo="Filtros del Tablero"
      storageKey="sgrai:filtros:mando:colapsado"
      totalFiltrosActivos={chipsActivos.length}
      headerActions={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: 'var(--font-size-sm, 13px)',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '4px 8px',
              backgroundColor: filtros.soloHoy ? 'var(--color-info-bg, #E0F2F1)' : 'var(--color-white, #FFFFFF)',
              color: filtros.soloHoy ? 'var(--color-primary-teal, #1B6F7D)' : 'var(--color-text-dark, #2B2B2B)',
              border: '1px solid var(--border-color-neutral-dark, #CCD2D9)',
              borderRadius: 'var(--radius-none, 0px)',
              height: '32px',
            }}
            title="Ver únicamente incidentes registrados en la jornada de hoy"
          >
            <input
              type="checkbox"
              checked={Boolean(filtros.soloHoy)}
              onChange={(e) =>
                onFiltrosChange({
                  ...filtros,
                  soloHoy: e.target.checked,
                })
              }
              aria-label="Filtrar incidentes solo de hoy"
            />
            <span>Solo hoy</span>
          </label>

          {onAbrirMisiones && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAbrirMisiones}
              title="Abrir panel de misiones operativas"
            >
              <ClipboardList size={14} aria-hidden="true" />
              <span>Misiones</span>
            </Button>
          )}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onRecargar}
            disabled={cargando}
            aria-label="Actualizar tablero"
            title="Refrescar estado de incidentes"
          >
            <RotateCw size={14} className={cargando ? 'animate-spin' : undefined} aria-hidden="true" />
            <span>{cargando ? 'Actualizando...' : 'Actualizar'}</span>
          </Button>
        </div>
      }
    >
      {/* Botonera de Estados para enfocar u ocultar columnas */}
      <div>
        <SegmentedButtonGroup
          label="Visualización de Columnas por Estado:"
          options={OPCIONES_ESTADO}
          value={filtros.estado || 'TODOS'}
          onChange={handleEstadoChange}
          ariaLabel="Filtrar u ocultar columnas del Kanban por estado"
        />
      </div>

      {/* Cuadrícula de Controles Estilo Imagen 2 con Nombres */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          alignItems: 'flex-end',
        }}
      >
        <FilterSearchInput
          id="filtro-incidente-busqueda"
          label="Buscar por código, calle o descripción:"
          value={filtros.busqueda}
          onChange={handleBusquedaChange}
          placeholder="Ej: INC-5829, Picarte, Inundación..."
          debounceMs={300}
        />

        <FilterSelect
          id="filtro-incidente-delegacion"
          label="Delegación Territorial:"
          value={filtros.delegacion || 'TODAS'}
          options={opcionesDelegacion}
          onChange={handleDelegacionChange}
        />

        <FilterSelect
          id="filtro-incidente-prioridad"
          label="Nivel de Prioridad:"
          value={filtros.prioridad || ''}
          options={OPCIONES_PRIORIDAD}
          onChange={handlePrioridadChange}
        />

        <FilterSelect
          id="filtro-incidente-tipo"
          label="Tipo de Afectación:"
          value={filtros.tipoAfectacion || ''}
          options={OPCIONES_AFECTACION}
          onChange={handleTipoChange}
        />

        <FilterSelect
          id="filtro-incidente-origen"
          label="Canal de Origen:"
          value={filtros.fuenteOrigen || ''}
          options={OPCIONES_ORIGEN}
          onChange={handleOrigenChange}
        />
      </div>

      {/* Barra de Chips Activos con nombres y botón de reseteo */}
      <ActiveFilterChips
        chips={chipsActivos}
        onClearAll={handleLimpiar}
        clearAllText="Limpiar todos los filtros"
      />
    </FilterBar>
  );
};

export default KanbanFiltros;
