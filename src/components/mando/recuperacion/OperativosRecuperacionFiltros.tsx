'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';
import {
  FilterBar,
  FilterSearchInput,
  FilterSelect,
} from '@/components/common/filters';
import Button from '@/components/ui/Button';
import type { DelegacionOpcion } from '@/types/incidentesKpis';
import type { FiltrosOperativosRecuperacion } from '@/hooks/useOperativosRecuperacion';
import type { EstadoRecuperacion, PrioridadRecuperacion } from '@/types/recuperacion';
import {
  ESTADOS_RECUPERACION_OPCIONES,
  PRIORIDADES_RECUPERACION_OPCIONES,
} from './recuperacionLabels';
import styles from './OperativosRecuperacion.module.css';

export interface OperativosRecuperacionFiltrosProps {
  filtros: FiltrosOperativosRecuperacion;
  delegaciones: DelegacionOpcion[];
  onFiltrosChange: (
    updater:
      | FiltrosOperativosRecuperacion
      | ((prev: FiltrosOperativosRecuperacion) => FiltrosOperativosRecuperacion)
  ) => void;
  onLimpiarFiltros: () => void;
}

export const OperativosRecuperacionFiltros: React.FC<OperativosRecuperacionFiltrosProps> = ({
  filtros,
  delegaciones,
  onFiltrosChange,
  onLimpiarFiltros,
}) => {
  const totalFiltrosActivos = [
    filtros.delegacionId,
    filtros.estado,
    filtros.prioridad,
    filtros.busqueda.trim(),
    filtros.fechaDesde,
    filtros.fechaHasta,
  ].filter(Boolean).length;

  return (
    <FilterBar
      titulo="Filtros de Operativos de Recuperación"
      storageKey="sgrai_filtros_recuperacion"
      totalFiltrosActivos={totalFiltrosActivos}
      headerActions={
        totalFiltrosActivos > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onLimpiarFiltros}
          >
            <RotateCcw size={14} style={{ marginRight: '6px' }} />
            <span>Limpiar filtros</span>
          </Button>
        ) : null
      }
    >
      <div className={styles.filtersGrid}>
        <FilterSearchInput
          id="recuperacion-busqueda"
          label="Buscar:"
          value={filtros.busqueda}
          debounceMs={0}
          placeholder="Código (REC-...), nombre o sector"
          ariaLabel="Buscar operativos de recuperación"
          onChange={(nuevoValor) =>
            onFiltrosChange((prev) => ({ ...prev, busqueda: nuevoValor }))
          }
        />

        <FilterSelect
          id="recuperacion-delegacion"
          label="Delegación:"
          value={filtros.delegacionId}
          ariaLabel="Filtrar por delegación municipal"
          options={[
            { valor: '', etiqueta: 'Todas las delegaciones' },
            ...delegaciones.map((d) => ({ valor: d.id, etiqueta: d.nombre })),
          ]}
          onChange={(nuevoValor) =>
            onFiltrosChange((prev) => ({ ...prev, delegacionId: nuevoValor }))
          }
        />

        <FilterSelect
          id="recuperacion-estado"
          label="Estado:"
          value={filtros.estado}
          ariaLabel="Filtrar por estado del operativo"
          options={[
            { valor: '', etiqueta: 'Todos los estados' },
            ...ESTADOS_RECUPERACION_OPCIONES,
          ]}
          onChange={(nuevoValor) =>
            onFiltrosChange((prev) => ({
              ...prev,
              estado: nuevoValor as EstadoRecuperacion | '',
            }))
          }
        />

        <FilterSelect
          id="recuperacion-prioridad"
          label="Prioridad:"
          value={filtros.prioridad}
          ariaLabel="Filtrar por prioridad del operativo"
          options={[
            { valor: '', etiqueta: 'Todas las prioridades' },
            ...PRIORIDADES_RECUPERACION_OPCIONES,
          ]}
          onChange={(nuevoValor) =>
            onFiltrosChange((prev) => ({
              ...prev,
              prioridad: nuevoValor as PrioridadRecuperacion | '',
            }))
          }
        />

        <div className={styles.dateFieldGroup}>
          <label htmlFor="recuperacion-fecha-desde" className={styles.dateLabel}>
            Desde
          </label>
          <input
            id="recuperacion-fecha-desde"
            type="date"
            className={styles.dateInput}
            value={filtros.fechaDesde}
            max={filtros.fechaHasta || undefined}
            onChange={(e) =>
              onFiltrosChange((prev) => ({ ...prev, fechaDesde: e.target.value }))
            }
          />
        </div>

        <div className={styles.dateFieldGroup}>
          <label htmlFor="recuperacion-fecha-hasta" className={styles.dateLabel}>
            Hasta
          </label>
          <input
            id="recuperacion-fecha-hasta"
            type="date"
            className={styles.dateInput}
            value={filtros.fechaHasta}
            min={filtros.fechaDesde || undefined}
            onChange={(e) =>
              onFiltrosChange((prev) => ({ ...prev, fechaHasta: e.target.value }))
            }
          />
        </div>
      </div>
    </FilterBar>
  );
};
