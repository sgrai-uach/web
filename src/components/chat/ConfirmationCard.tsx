'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import styles from '@/styles/chatbot.module.css';
import type { ResultadoAviso } from '@/lib/api/avisos';

interface ConfirmationCardProps {
  resultado: ResultadoAviso;
  onNuevoReporte: () => void;
}

export const ConfirmationCard: React.FC<ConfirmationCardProps> = ({
  resultado,
  onNuevoReporte,
}) => {
  const [copiado, setCopiado] = useState(false);

  const copiarCodigo = () => {
    if (resultado.codigoSeguimiento) {
      navigator.clipboard.writeText(resultado.codigoSeguimiento);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const esDuplicado = resultado.esDuplicado;

  return (
    <div
      className={`${styles.resultCard} ${
        esDuplicado ? styles.resultCardDuplicate : styles.resultCardSuccess
      }`}
      role="status"
      aria-live="polite"
    >
      <div className={styles.resultHeader}>
        <span
          className={`${styles.resultBadge} ${
            esDuplicado ? styles.resultBadgeDuplicate : styles.resultBadgeSuccess
          }`}
        >
          {esDuplicado ? 'Aviso Asociado' : 'Reporte Ingresado'}
        </span>
        <h3 className={styles.resultTitle}>
          {esDuplicado
            ? 'Incidente Previamente Reportado'
            : 'Tu reporte ha sido recibido'}
        </h3>
      </div>

      <p className={styles.resultDescription}>
        {esDuplicado
          ? 'Este incidente ya fue reportado previamente en tu sector dentro de las últimas 24 horas y nuestros equipos municipales ya se encuentran coordinando la atención. Tu aviso ha sido sumado al caso en curso para reforzar la prioridad.'
          : 'El incidente fue registrado exitosamente en el Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI). Una patrulla o cuadrilla municipal evaluará el requerimiento a la brevedad.'}
      </p>

      {resultado.codigoSeguimiento && (
        <div className={styles.trackingCodeBlock}>
          <span className={styles.trackingCodeLabel}>Número de Seguimiento</span>
          <span className={styles.trackingCodeNumber}>{resultado.codigoSeguimiento}</span>
          <button
            type="button"
            className={styles.copyCodeButton}
            onClick={copiarCodigo}
            aria-label="Copiar código de seguimiento al portapapeles"
          >
            {copiado ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Check size={14} aria-hidden="true" /> Código copiado
              </span>
            ) : (
              'Copiar código'
            )}
          </button>
        </div>
      )}

      <div style={{ marginTop: '1.25rem' }}>
        <button
          type="button"
          className={styles.btnSecondary}
          onClick={onNuevoReporte}
        >
          Realizar otro reporte
        </button>
      </div>
    </div>
  );
};
