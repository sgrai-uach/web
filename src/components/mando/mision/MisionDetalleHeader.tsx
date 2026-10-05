'use client';

import React from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import type { MisionDetalleCompleto, EstadoMision, PrioridadMision } from '@/types/misiones';
import styles from '@/styles/mision-detalle.module.css';

interface MisionDetalleHeaderProps {
  mision: MisionDetalleCompleto;
  onCerrar: () => void;
}

export const MisionDetalleHeader: React.FC<MisionDetalleHeaderProps> = ({
  mision,
  onCerrar,
}) => {
  const getEstadoClass = (estado: EstadoMision) => {
    switch (estado) {
      case 'PLANIFICADA':
        return styles.estadoPlanificada;
      case 'DESPACHADA':
        return styles.estadoDespachada;
      case 'EN_CURSO':
        return styles.estadoEnCurso;
      case 'COMPLETADA':
        return styles.estadoCompletada;
      case 'CANCELADA':
        return styles.estadoCancelada;
      case 'RECHAZADA':
        return styles.estadoRechazada;
      default:
        return '';
    }
  };

  const getPrioridadClass = (prioridad: PrioridadMision) => {
    switch (prioridad) {
      case 'CRITICA':
        return styles.prioridadCritica;
      case 'ALTA':
        return styles.prioridadAlta;
      case 'MEDIA':
        return styles.prioridadMedia;
      case 'BAJA':
      default:
        return styles.prioridadBaja;
    }
  };

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

  return (
    <header className={styles.modalHeader}>
      <div className={styles.headerInfo}>
        <div className={styles.headerTopRow}>
          <span className={styles.codigoBadge} title="Código Oficial de la Misión">
            {mision.codigo}
          </span>
          <span className={styles.tipoBadge} title="Tipo de Misión Táctica">
            {mision.tipoMision.replace(/_/g, ' ')}
          </span>
          <span
            className={`${styles.badgeEstado} ${getEstadoClass(mision.estado)}`}
            title={`Estado operativo: ${mision.estado}`}
          >
            {mision.estado.replace(/_/g, ' ')}
          </span>
          <span
            className={`${styles.badgePrioridad} ${getPrioridadClass(mision.prioridad)}`}
            title={`Prioridad: ${mision.prioridad}`}
          >
            {mision.prioridad}
          </span>
        </div>

        <h2 className={styles.headerTitle} id="mision-detalle-titulo">
          {mision.titulo}
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
