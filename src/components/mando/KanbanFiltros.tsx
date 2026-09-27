'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import { RotateCw } from 'lucide-react';
import type { FiltrosKanban } from '@/hooks/useIncidentesKanban';
import type { PrioridadIncidente } from '@/services/incidentesService';
import styles from '@/styles/mando.module.css';

interface KanbanFiltrosProps {
  filtros: FiltrosKanban;
  onFiltrosChange: (nuevosFiltros: FiltrosKanban) => void;
  onRecargar: () => void;
  cargando: boolean;
}

export const KanbanFiltros: React.FC<KanbanFiltrosProps> = ({
  filtros,
  onFiltrosChange,
  onRecargar,
  cargando,
}) => {
  const handleBusquedaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltrosChange({
      ...filtros,
      busqueda: e.target.value,
    });
  };

  const handlePrioridadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltrosChange({
      ...filtros,
      prioridad: e.target.value as PrioridadIncidente | '',
    });
  };

  const handleTipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltrosChange({
      ...filtros,
      tipoAfectacion: e.target.value,
    });
  };

  const handleLimpiar = () => {
    onFiltrosChange({
      busqueda: '',
      prioridad: '',
      tipoAfectacion: '',
    });
  };

  const tieneFiltrosActivos =
    Boolean(filtros.busqueda.trim()) ||
    Boolean(filtros.prioridad) ||
    Boolean(filtros.tipoAfectacion);

  return (
    <section className={styles.filtrosContainer} aria-label="Filtros tácticos del tablero">
      <div className={styles.filtrosForm}>
        <input
          type="search"
          placeholder="Buscar por código (ej. INC-5829), calle o descripción..."
          value={filtros.busqueda}
          onChange={handleBusquedaChange}
          className={styles.filtroInput}
          aria-label="Buscar incidentes"
        />

        <select
          value={filtros.prioridad}
          onChange={handlePrioridadChange}
          className={styles.filtroSelect}
          aria-label="Filtrar por nivel de prioridad"
        >
          <option value="">Todas las Prioridades</option>
          <option value="CRITICA">Prioridad Crítica</option>
          <option value="ALTA">Prioridad Alta</option>
          <option value="MEDIA">Prioridad Media</option>
          <option value="BAJA">Prioridad Baja</option>
        </select>

        <select
          value={filtros.tipoAfectacion}
          onChange={handleTipoChange}
          className={styles.filtroSelect}
          aria-label="Filtrar por tipo de afectación"
        >
          <option value="">Todos los Tipos de Afectación</option>
          <option value="Inundación">Inundación</option>
          <option value="Anegamiento">Anegamiento</option>
          <option value="Caída de árbol">Caída de árbol</option>
          <option value="Derrumbe">Derrumbe</option>
          <option value="Corte de camino">Corte de camino</option>
          <option value="Incendio">Incendio</option>
          <option value="Peligro estructural">Peligro estructural</option>
        </select>

        {tieneFiltrosActivos && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleLimpiar}
          >
            Limpiar filtros
          </Button>
        )}
      </div>

      <div>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={onRecargar}
          disabled={cargando}
          aria-label="Actualizar tablero"
        >
          <RotateCw size={15} className={cargando ? styles.spinner : undefined} />
          {cargando ? 'Actualizando...' : 'Actualizar Tablero'}
        </Button>
      </div>
    </section>
  );
};
