'use client';

import React from 'react';
import styles from '@/styles/chatbot.module.css';
import type { DatosReporte } from '@/hooks/useChatbot';

interface ReportSummaryCardProps {
  datos: DatosReporte;
  onConfirmar: () => void;
  onModificar: () => void;
  deshabilitado?: boolean;
}

export const ReportSummaryCard: React.FC<ReportSummaryCardProps> = ({
  datos,
  onConfirmar,
  onModificar,
  deshabilitado = false,
}) => {
  return (
    <div className={styles.summaryCard} aria-label="Resumen de datos del incidente">
      <h3 className={styles.summaryTitle}>Resumen del Reporte</h3>
      <div className={styles.summaryGrid}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Tipo de Afectación</span>
          <span className={styles.summaryValue}>{datos.tipoAfectacion || 'No especificado'}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Ubicación / Dirección</span>
          <span className={styles.summaryValue}>{datos.direccion || 'No especificado'}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Detalle Adicional</span>
          <span className={styles.summaryValue}>{datos.descripcion || 'Sin detalle adicional'}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Informante</span>
          <span className={styles.summaryValue}>{datos.informanteNombre || 'No especificado'}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>RUT</span>
          <span className={styles.summaryValue}>{datos.informanteRut || 'No especificado'}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Teléfono de Contacto (Obligatorio)</span>
          <span className={styles.summaryValue}>{datos.informanteTelefono || 'No especificado'}</span>
        </div>
      </div>

      <div className={styles.summaryActions}>
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={onConfirmar}
          disabled={deshabilitado}
        >
          {deshabilitado ? 'Enviando reporte...' : 'Confirmar y Enviar Reporte'}
        </button>
        <button
          type="button"
          className={styles.btnSecondary}
          onClick={onModificar}
          disabled={deshabilitado}
        >
          Modificar datos
        </button>
      </div>
    </div>
  );
};
