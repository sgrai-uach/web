import React from 'react';
import { MapPin, ShieldCheck, Hourglass } from 'lucide-react';
import type { IncidenteResumen } from '@/services/incidentesService';
import { obtenerNombreDelegacion } from '@/lib/utils/delegacionUtils';
import styles from '@/styles/mando.module.css';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';

interface IncidenteCardProps {
  incidente: IncidenteResumen;
  onClick: (incidente: IncidenteResumen) => void;
  onAsignarPatrulla?: (incidente: IncidenteResumen) => void;
}

export const IncidenteCard: React.FC<IncidenteCardProps> = ({
  incidente,
  onClick,
  onAsignarPatrulla,
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

      {incidente.estado === 'REPORTADO' && (
        <div style={{ marginTop: '0.625rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color-neutral, #DFE3E8)' }}>
          {incidente.tieneMisionDespachada ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled
              icon={<Hourglass size={15} strokeWidth={2.25} style={{ flexShrink: 0 }} aria-hidden="true" />}
              style={{
                width: '100%',
                justifyContent: 'center',
                backgroundColor: 'var(--color-warning-bg, #FFF3E0)',
                color: 'var(--color-warning, #E65100)',
                cursor: 'not-allowed',
                borderColor: 'var(--color-warning-border, #FFE0B2)',
                fontWeight: 700,
                opacity: 1,
              }}
              title="La patrulla fue asignada y está a la espera de aceptar o rechazar en terreno"
              aria-label={`Confirmación pendiente para el incidente ${incidente.codigo}`}
            >
              <span>Confirmación Pendiente</span>
            </Button>
          ) : onAsignarPatrulla ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={<ShieldCheck size={14} style={{ flexShrink: 0 }} />}
              onClick={(e) => {
                e.stopPropagation();
                onAsignarPatrulla(incidente);
              }}
              style={{ width: '100%', justifyContent: 'center' }}
              title={`Asignar patrulla verificadora al incidente ${incidente.codigo}`}
              aria-label={`Asignar patrulla verificadora al incidente ${incidente.codigo}`}
            >
              <span>Asignar Patrulla</span>
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
};
