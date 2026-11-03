'use client';

import React from 'react';
import { MapPin, CheckCircle2 } from 'lucide-react';
import type { IncidenteResumen } from '@/services/incidentesService';
import { obtenerNombreDelegacion } from '@/lib/utils/delegacionUtils';
import styles from '@/styles/mando.module.css';
import Heading from '@/components/ui/Heading';

interface IncidenteCardProps {
  incidente: IncidenteResumen;
  onClick: (incidente: IncidenteResumen) => void;
}

export const IncidenteCard: React.FC<IncidenteCardProps> = ({ incidente, onClick }) => {
  const estaVerificado = Boolean(incidente.verificado);
  const getPrioridadClass = (prioridad: string) => {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(incidente);
    }
  };

  return (
    <div
      className={`${styles.incidenteCard} ${estaVerificado ? styles.incidenteVerificado : ''}`}
      onClick={() => onClick(incidente)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Ver detalles del incidente ${incidente.codigo} tipo ${incidente.tipoAfectacion}`}
    >
      <div className={styles.cardTopRow}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          <span className={styles.cardCodigo}>{incidente.codigo}</span>
          {estaVerificado && (
            <span
              className={styles.badgeVerificado}
              title="Diagnóstico técnico en terreno finalizado por patrulla"
              data-testid="badge-verificado"
            >
              <CheckCircle2 size={11} aria-hidden="true" />
              <span>Verificado</span>
            </span>
          )}
        </div>
        <span
          className={`${styles.badgePrioridad} ${getPrioridadClass(incidente.prioridad)}`}
          title={`Prioridad: ${incidente.prioridad}`}
        >
          {incidente.prioridad}
        </span>
      </div>

      <Heading as="h4" variant="h4" color="charcoal" className={styles.cardTipoAfectacion} noMargin>
        {incidente.tipoAfectacion}
      </Heading>

      <p className={styles.cardDireccion} title={incidente.direccion}>
        <MapPin size={14} aria-hidden="true" style={{ flexShrink: 0 }} />
        <span>{incidente.direccion}</span>
      </p>

      <div className={styles.cardFooter}>
        <div className={styles.cardMetaTags}>
          {incidente.requiereAsistenciaSocial && (
            <span
              className={styles.tagAsistenciaSocial}
              title="Este incidente requiere levantamiento de ficha FIBE"
            >
              FIBE
            </span>
          )}
          {incidente.totalMisiones > 0 && (
            <span className={styles.tagMisiones}>
              {incidente.totalMisiones}{' '}
              {incidente.totalMisiones === 1 ? 'misión' : 'misiones'}
            </span>
          )}
        </div>

        <span>{obtenerNombreDelegacion(incidente.delegacionNombre, 'Sin delegación')}</span>
      </div>
    </div>
  );
};
