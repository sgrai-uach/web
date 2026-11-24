'use client';

import React from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import type { MisionDetalleCompleto } from '@/types/misiones';
import { formatearEstado, formatearPrioridad, formatearTipoMision } from '@/lib/utils/estadoUtils';
import {
  obtenerVarianteChipEstadoMision,
  obtenerVarianteChipPrioridad,
} from '@/lib/utils/chipVariants';
import Chip from '@/components/ui/Chip';
import styles from '@/styles/mision-detalle.module.css';

interface MisionDetalleHeaderProps {
  mision: MisionDetalleCompleto;
  onCerrar: () => void;
}

export const MisionDetalleHeader: React.FC<MisionDetalleHeaderProps> = ({
  mision,
  onCerrar,
}) => {
  const formatFecha = (isoString?: string | null) => {
    if (!isoString) return 'No registrado';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const tituloMisionSincronizado =
    mision.tipoMision === 'VERIFICACION' && mision.incidente?.tipoAfectacion && mision.incidente?.codigo
      ? `Verificación: ${mision.incidente.tipoAfectacion} - ${mision.incidente.codigo}`
      : mision.titulo;

  return (
    <header className={styles.modalHeader}>
      <div className={styles.headerInfo}>
        <div className={styles.headerTopRow}>
          <span className={styles.codigoBadge} title="Código Oficial de la Misión">
            {mision.codigo}
          </span>
          <Chip variant="neutral" size="md" title="Tipo de Misión Táctica">
            {formatearTipoMision(mision.tipoMision)}
          </Chip>
          <Chip
            variant={obtenerVarianteChipEstadoMision(mision.estado)}
            size="md"
            title={`Estado operativo: ${formatearEstado(mision.estado)}`}
          >
            {formatearEstado(mision.estado)}
          </Chip>
          <Chip
            variant={obtenerVarianteChipPrioridad(mision.prioridad)}
            size="md"
            title={`Prioridad: ${formatearPrioridad(mision.prioridad)}`}
          >
            {formatearPrioridad(mision.prioridad)}
          </Chip>
        </div>

        <h2 className={styles.headerTitle} id="mision-detalle-titulo">
          {tituloMisionSincronizado}
        </h2>

        <div className={styles.headerMetaRow}>
          <span title="Fecha de Despacho / Creación" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={14} aria-hidden="true" />
            <span>Creada: {formatFecha(mision.creadoEn)}</span>
          </span>

          {mision.fechaInicio && (
            <span title="Inicio de Operaciones en Terreno" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={14} aria-hidden="true" />
              <span>Inicio: {formatFecha(mision.fechaInicio)}</span>
            </span>
          )}

          {mision.fechaCierre && (
            <span title="Cierre de Misión" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={14} aria-hidden="true" />
              <span>Cierre: {formatFecha(mision.fechaCierre)}</span>
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        className={styles.headerCloseBtn}
        onClick={onCerrar}
        aria-label="Cerrar detalle de misión"
        title="Cerrar (Esc)"
      >
        <X size={24} aria-hidden="true" />
      </button>
    </header>
  );
};
