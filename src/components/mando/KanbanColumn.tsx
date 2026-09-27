'use client';

import React from 'react';
import type {
  IncidenteResumen,
  EstadoIncidente,
  PaginacionMeta,
} from '@/services/incidentesService';
import Button from '@/components/ui/Button';
import { IncidenteCard } from './IncidenteCard';
import styles from '@/styles/mando.module.css';

interface KanbanColumnProps {
  estado: EstadoIncidente;
  titulo: string;
  incidentes: IncidenteResumen[];
  paginacion: PaginacionMeta | null;
  cargandoMas: boolean;
  onCargarMas: (estado: EstadoIncidente) => void;
  onSeleccionarIncidente: (incidente: IncidenteResumen) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  estado,
  titulo,
  incidentes,
  paginacion,
  cargandoMas,
  onCargarMas,
  onSeleccionarIncidente,
}) => {
  const getHeaderStyle = (est: EstadoIncidente) => {
    switch (est) {
      case 'REPORTADO':
        return styles.columnHeaderReportado;
      case 'VERIFICANDO':
        return styles.columnHeaderVerificando;
      case 'EN_ATENCION':
        return styles.columnHeaderEnAtencion;
      case 'RESUELTO':
        return styles.columnHeaderResuelto;
      case 'NO_ABORDABLE':
      default:
        return styles.columnHeaderNoAbordable;
    }
  };

  const total = paginacion ? paginacion.total : incidentes.length;

  return (
    <div
      className={styles.kanbanColumn}
      aria-label={`Columna ${titulo} con ${incidentes.length} incidentes visibles`}
    >
      <div className={`${styles.columnHeader} ${getHeaderStyle(estado)}`}>
        <h3 className={styles.columnTitle}>{titulo}</h3>
        <span className={styles.columnCounter} title={`Total registrados: ${total}`}>
          {incidentes.length} / {total}
        </span>
      </div>

      <div className={styles.columnCardsList}>
        {incidentes.length === 0 ? (
          <div className={styles.columnEmptyMessage}>
            No hay incidentes en este estado
          </div>
        ) : (
          incidentes.map((incidente) => (
            <IncidenteCard
              key={incidente.id}
              incidente={incidente}
              onClick={onSeleccionarIncidente}
            />
          ))
        )}

        {paginacion?.tieneSiguiente && (
          <div style={{ marginTop: '0.5rem' }}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => onCargarMas(estado)}
              disabled={cargandoMas}
            >
              {cargandoMas ? 'Cargando más...' : 'Cargar más casos'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
