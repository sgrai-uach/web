'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import styles from '@/styles/chatbot.module.css';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import type { ResultadoAviso } from '@/services/avisosService';

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
        <Heading as="h3" variant="h3" color="charcoal" className={styles.resultTitle} noMargin>
          {esDuplicado
            ? 'Incidente Previamente Reportado'
            : 'Tu reporte ha sido recibido'}
        </Heading>
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copiarCodigo}
            aria-label="Copiar código de seguimiento al portapapeles"
            style={{ minHeight: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
          >
            {copiado ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Check size={14} aria-hidden="true" /> Código copiado
              </span>
            ) : (
              'Copiar código'
            )}
          </Button>
        </div>
      )}

      <div style={{ marginTop: '1.25rem', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Button
          type="button"
          variant="secondary"
          onClick={onNuevoReporte}
        >
          Realizar otro reporte
        </Button>
        <Button
          variant="outline"
          href="/ciudadania"
        >
          Volver al Portal Ciudadano
        </Button>
      </div>
    </div>
  );
};
