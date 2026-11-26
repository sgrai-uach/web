'use client';

import React from 'react';
import { Search, X, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { CatalogoItem } from '@/types/catalogos';
import type { EstadoEventoPrevencion } from '@/types/evento-prevencion';
import styles from './EventosPrevencion.module.css';

export interface EventosPrevencionFiltrosProps {
  busqueda: string;
  delegacionId?: string;
  estado?: EstadoEventoPrevencion;
  delegaciones: CatalogoItem[];
  onBusquedaChange: (busqueda: string) => void;
  onDelegacionChange: (delegacionId?: string) => void;
  onEstadoChange: (estado?: EstadoEventoPrevencion) => void;
  onLimpiar: () => void;
  totalResultados?: number;
  onCrearNuevo?: () => void;
}

export const EventosPrevencionFiltros: React.FC<EventosPrevencionFiltrosProps> = ({
  busqueda,
  delegacionId,
  estado,
  delegaciones,
  onBusquedaChange,
  onDelegacionChange,
  onEstadoChange,
  onLimpiar,
  totalResultados,
  onCrearNuevo,
}) => {
  const hayFiltrosActivos = Boolean(
    busqueda.trim() || delegacionId || estado
  );

  const delegacionSeleccionada = delegaciones.find((d) => d.id === delegacionId);

  return (
    <div className={styles.filtrosBar}>
      <div className={styles.filtrosHeader}>
        <div className={styles.filtrosInputs}>
          {/* Buscador textual con debounce */}
          <div className={styles.busquedaWrapper}>
            <Search size={16} className={styles.busquedaIcon} aria-hidden="true" />
            <input
              type="text"
              id="filtro-busqueda-prevencion"
              value={busqueda}
              onChange={(e) => onBusquedaChange(e.target.value)}
              placeholder="Buscar por código, sector o punto crítico..."
              className={styles.busquedaInput}
              aria-label="Buscar eventos preventivos"
            />
            {busqueda && (
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => onBusquedaChange('')}
                className={styles.btnLimpiarBusqueda}
                title="Limpiar búsqueda"
                aria-label="Limpiar búsqueda de texto"
              >
                <X size={14} />
              </Button>
            )}
          </div>

          {/* Selector de Delegación Territorial */}
          <select
            id="filtro-delegacion-prevencion"
            value={delegacionId || ''}
            onChange={(e) => onDelegacionChange(e.target.value || undefined)}
            className={styles.selectorFiltro}
            aria-label="Filtrar por delegación municipal"
            style={{
              padding: '0 12px',
              border: '1px solid var(--border-color-neutral-dark, #CCD2D9)',
              backgroundColor: '#FFFFFF',
              color: 'var(--color-text-dark, #2B2B2B)',
              fontFamily: 'inherit',
              fontSize: '14px',
              borderRadius: 0,
            }}
          >
            <option value="">Todas las delegaciones</option>
            {delegaciones.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre.startsWith('Delegación') ? d.nombre : `Delegación ${d.nombre}`}
              </option>
            ))}
          </select>

          {/* Selector de Estado Operativo */}
          <select
            id="filtro-estado-prevencion"
            value={estado || ''}
            onChange={(e) => onEstadoChange((e.target.value as EstadoEventoPrevencion) || undefined)}
            className={styles.selectorFiltro}
            aria-label="Filtrar por estado del evento preventivo"
            style={{
              padding: '0 12px',
              border: '1px solid var(--border-color-neutral-dark, #CCD2D9)',
              backgroundColor: '#FFFFFF',
              color: 'var(--color-text-dark, #2B2B2B)',
              fontFamily: 'inherit',
              fontSize: '14px',
              borderRadius: 0,
            }}
          >
            <option value="">Todos los estados</option>
            <option value="PLANIFICADA">Planificada</option>
            <option value="EN_CURSO">En Ejecución</option>
            <option value="COMPLETADA">Completada</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </div>

        {/* Acciones: botón de creación institucional y botón de limpieza global */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {hayFiltrosActivos && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onLimpiar}
              title="Limpiar todos los filtros"
            >
              <X size={14} style={{ marginRight: '4px' }} />
              <span>Limpiar filtros</span>
            </Button>
          )}

          {onCrearNuevo && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onCrearNuevo}
              title="Crear nueva operación preventiva"
            >
              <Plus size={14} style={{ marginRight: '4px' }} />
              <span>Nuevo Evento Preventivo</span>
            </Button>
          )}
        </div>
      </div>

      {/* Chips de filtros activos */}
      {hayFiltrosActivos && (
        <div className={styles.chipsContainer}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted, #5F676E)', fontWeight: 600 }}>
            Filtros activos:
          </span>

          {busqueda.trim() && (
            <span className={styles.chipFiltro}>
              Texto: &ldquo;{busqueda.trim()}&rdquo;
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => onBusquedaChange('')}
                aria-label="Quitar filtro de texto"
                style={{ padding: '0 2px', height: 'auto', minHeight: 'unset', marginLeft: '4px' }}
              >
                <X size={12} />
              </Button>
            </span>
          )}

          {delegacionSeleccionada && (
            <span className={styles.chipFiltro}>
              Delegación: {delegacionSeleccionada.nombre}
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => onDelegacionChange(undefined)}
                aria-label="Quitar filtro de delegación"
                style={{ padding: '0 2px', height: 'auto', minHeight: 'unset', marginLeft: '4px' }}
              >
                <X size={12} />
              </Button>
            </span>
          )}

          {estado && (
            <span className={styles.chipFiltro}>
              Estado: {estado === 'EN_CURSO' ? 'En Ejecución' : estado}
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => onEstadoChange(undefined)}
                aria-label="Quitar filtro de estado"
                style={{ padding: '0 2px', height: 'auto', minHeight: 'unset', marginLeft: '4px' }}
              >
                <X size={12} />
              </Button>
            </span>
          )}

          {typeof totalResultados === 'number' && (
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--color-text-muted, #5F676E)' }}>
              {totalResultados} {totalResultados === 1 ? 'resultado encontrado' : 'resultados encontrados'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default EventosPrevencionFiltros;
