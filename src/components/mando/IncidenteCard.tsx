import React from 'react';
import { MapPin, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { IncidenteResumen } from '@/services/incidentesService';
import { obtenerNombreDelegacion } from '@/lib/utils/delegacionUtils';
import { formatearPrioridad } from '@/lib/utils/estadoUtils';
import styles from '@/styles/mando.module.css';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';

interface IncidenteCardProps {
  incidente: IncidenteResumen;
  onClick: (incidente: IncidenteResumen) => void;
  onAsignarPatrulla?: (incidente: IncidenteResumen) => void;
  puedeAsignarPatrulla?: boolean;
}

export const IncidenteCard: React.FC<IncidenteCardProps> = ({
  incidente,
  onClick,
  onAsignarPatrulla,
  puedeAsignarPatrulla = true,
}) => {
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
      className={styles.incidenteCard}
      onClick={() => onClick(incidente)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Ver detalles del incidente ${incidente.codigo} tipo ${incidente.tipoAfectacion}`}
    >
      <div className={styles.cardTopRow}>
        <span className={styles.cardCodigo}>{incidente.codigo}</span>
        <span
          className={`${styles.badgePrioridad} ${getPrioridadClass(incidente.prioridad)}`}
          title={`Prioridad: ${formatearPrioridad(incidente.prioridad)}`}
        >
          {formatearPrioridad(incidente.prioridad)}
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
          {incidente.reclasificadoEnTerreno && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: '2px 6px',
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: 'var(--color-primary-teal, #1B6F7D)',
                backgroundColor: 'var(--color-info-bg, #E0F2F1)',
                border: '1px solid var(--color-primary-teal, #1B6F7D)',
              }}
              title={
                incidente.justificacionReclasificacion
                  ? `Tipología reclasificada en terreno: ${incidente.justificacionReclasificacion}${incidente.cambioPrioridadMotivo ? ` (Prioridad ajustada: ${formatearPrioridad(incidente.prioridad)})` : ''}`
                  : `Tipología rectificada por patrulla en terreno (Prioridad: ${formatearPrioridad(incidente.prioridad)})`
              }
            >
              <CheckCircle2 size={11} strokeWidth={2.5} aria-hidden="true" />
              <span>Verificado en terreno</span>
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

      {incidente.estado === 'REPORTADO' &&
        !incidente.tieneMisionDespachada &&
        (!incidente.totalMisiones || incidente.totalMisiones === 0) &&
        onAsignarPatrulla &&
        puedeAsignarPatrulla && (
        <div style={{ marginTop: '0.625rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color-neutral, #DFE3E8)' }}>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAsignarPatrulla(incidente);
            }}
            style={{ width: '100%', justifyContent: 'center' }}
            title={`Asignar patrulla verificadora al incidente ${incidente.codigo}`}
            aria-label={`Asignar patrulla verificadora al incidente ${incidente.codigo}`}
          >
            <ShieldCheck size={14} style={{ marginRight: '5px' }} />
            <span>Asignar Patrulla</span>
          </Button>
        </div>
      )}
    </div>
  );
};
