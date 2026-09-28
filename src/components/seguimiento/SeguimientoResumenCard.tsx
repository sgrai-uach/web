'use client';

import React, { useState } from 'react';
import styles from '@/styles/seguimiento.module.css';
import type { DatosSeguimiento, EstadoIncidente } from '@/services/seguimientoService';

interface SeguimientoResumenCardProps {
  datos: DatosSeguimiento;
  actualizadoEnVivo?: boolean;
}

export const SeguimientoResumenCard: React.FC<SeguimientoResumenCardProps> = ({
  datos,
  actualizadoEnVivo = false,
}) => {
  const [copiado, setCopiado] = useState(false);

  const copiarCodigo = () => {
    if (datos.codigoSeguimiento) {
      navigator.clipboard.writeText(datos.codigoSeguimiento);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const formatearFecha = (fechaIso: string): string => {
    try {
      const fecha = new Date(fechaIso);
      return new Intl.DateTimeFormat('es-CL', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(fecha);
    } catch {
      return fechaIso;
    }
  };

  const getBadgeClass = (estado: EstadoIncidente): string => {
    switch (estado) {
      case 'REPORTADO':
        return styles.badgeReportado;
      case 'VERIFICANDO':
        return styles.badgeVerificando;
      case 'EN_ATENCION':
        return styles.badgeEnAtencion;
      case 'RESUELTO':
        return styles.badgeResuelto;
      case 'NO_ABORDABLE':
        return styles.badgeNoAbordable;
      default:
        return styles.badgeReportado;
    }
  };

  return (
    <div
      className={styles.resultCard}
      role="status"
      aria-live="polite"
      aria-label={`Detalle del reporte ${datos.codigoSeguimiento}`}
    >
      {/* Encabezado: Código y Estado */}
      <div className={styles.cardHeader}>
        <div className={styles.codeBlock}>
          <span className={styles.codeLabel}>Código de Seguimiento</span>
          <div className={styles.codeNumberRow}>
            <span className={styles.codeNumber}>{datos.codigoSeguimiento}</span>
            <button
              type="button"
              className={styles.btnCopy}
              onClick={copiarCodigo}
              aria-label="Copiar código de seguimiento al portapapeles"
            >
              {copiado ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>
        </div>

        <div className={styles.statusBadgeGroup}>
          <span
            className={`${styles.statusBadge} ${getBadgeClass(datos.estado)} ${
              actualizadoEnVivo ? styles.pulseAnimated : ''
            }`}
          >
            {datos.estadoEtiqueta || datos.estado}
          </span>
          {actualizadoEnVivo && (
            <div className={styles.liveIndicator}>
              <span className={styles.liveDot} />
              <span>Actualizado en vivo</span>
            </div>
          )}
        </div>
      </div>

      {/* Descripción oficial entregada por la API en lenguaje ciudadano */}
      <div className={styles.statusDescriptionBox}>
        <p className={styles.statusDescriptionText}>
          {datos.estadoDescripcion}
        </p>
      </div>

      {/* Aviso institucional si el reporte reforzó un caso duplicado en el sector */}
      {datos.esDuplicado && (
        <div className={styles.duplicateNoticeBox}>
          <strong>Nota institucional:</strong> Este requerimiento fue asociado a un incidente ya registrado en tu sector dentro de las últimas 24 horas. Tu aviso sumó prioridad a la coordinación de los equipos municipales en terreno.
        </div>
      )}

      {/* Resumen operativo sin datos personales sensibles */}
      <div className={styles.detailsGrid}>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Tipo de Afectación</span>
          <p className={styles.detailValue}>{datos.tipoAfectacion}</p>
        </div>

        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Ubicación Referencial</span>
          <p className={styles.detailValue}>{datos.direccionAproximada}</p>
        </div>

        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Fecha y Hora de Ingreso</span>
          <p className={styles.detailValue}>{formatearFecha(datos.creadoEn)}</p>
        </div>

        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Última Actualización</span>
          <p className={styles.detailValue}>{formatearFecha(datos.actualizadoEn)}</p>
        </div>

        {datos.descripcion && (
          <div className={`${styles.detailItem} ${styles.detailFullRow}`}>
            <span className={styles.detailLabel}>Detalle Ingresado por el Informante</span>
            <p className={styles.detailValue}>{datos.descripcion}</p>
          </div>
        )}
      </div>
    </div>
  );
};
