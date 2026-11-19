'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { EstadoEventoPrevencion } from '@/types/evento-prevencion';
import type { CatalogoItem } from '@/types/catalogos';
import styles from './EventosPrevencion.module.css';

interface EventosPrevencionFiltrosProps {
  busqueda: string;
  delegacionId?: string;
  estado?: EstadoEventoPrevencion;
  delegaciones: CatalogoItem[];
  onBusquedaChange: (busqueda: string) => void;
  onDelegacionChange: (delegacionId?: string) => void;
  onEstadoChange: (estado?: EstadoEventoPrevencion) => void;
  onLimpiar: () => void;
  totalResultados?: number;
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
}) => {
  const hayFiltrosActivos = Boolean(busqueda.trim() || delegacionId || estado);

  const delegacionSeleccionada = delegaciones.find((d) => d.id === delegacionId);

  return (
    <div className={styles.filtrosCard}>
      <div className={styles.filtrosRow}>
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
              <button
                type="button"
                onClick={() => onBusquedaChange('')}
                className={styles.btnLimpiarBusqueda}
                title="Limpiar búsqueda"
                aria-label="Limpiar búsqueda de texto"
              >
                <X size={14} />
              </button>
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

        {/* Resumen de resultados y botón de limpieza global */}
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
              <button
                type="button"
                onClick={() => onBusquedaChange('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', padding: 0 }}
                aria-label="Quitar filtro de texto"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {delegacionSeleccionada && (
            <span className={styles.chipFiltro}>
              Delegación: {delegacionSeleccionada.nombre}
              <button
                type="button"
                onClick={() => onDelegacionChange(undefined)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', padding: 0 }}
                aria-label="Quitar filtro de delegación"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {estado && (
            <span className={styles.chipFiltro}>
              Estado: {estado === 'EN_CURSO' ? 'En Ejecución' : estado}
              <button
                type="button"
                onClick={() => onEstadoChange(undefined)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', padding: 0 }}
                aria-label="Quitar filtro de estado"
              >
                <X size={12} />
              </button>
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
