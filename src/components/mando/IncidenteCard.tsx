import React from 'react';
import { MapPin, ShieldCheck } from 'lucide-react';
import type {
  EstadoTrazabilidadNotificacion,
  IncidenteResumen,
} from '@/services/incidentesService';
import { TRAZABILIDAD_CONFIG } from '@/lib/socket/trazabilidadConfig';
import { TrazabilidadIcon } from './TrazabilidadIcon';
import { obtenerNombreDelegacion } from '@/lib/utils/delegacionUtils';
import styles from '@/styles/mando.module.css';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';

interface IncidenteCardProps {
  incidente: IncidenteResumen;
  onClick: (incidente: IncidenteResumen) => void;
  onAsignarPatrulla?: (incidente: IncidenteResumen) => void;
  puedeAsignarPatrulla?: boolean;
  trazabilidadNotificacion?: EstadoTrazabilidadNotificacion;
}

export const IncidenteCard: React.FC<IncidenteCardProps> = ({
  incidente,
  onClick,
  onAsignarPatrulla,
  puedeAsignarPatrulla = true,
  trazabilidadNotificacion,
}) => {
  const estadoTrazabilidad =
    trazabilidadNotificacion ?? incidente.trazabilidadNotificacion;
  const trazabilidadConfig = estadoTrazabilidad
    ? TRAZABILIDAD_CONFIG[estadoTrazabilidad]
    : undefined;
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
        <MapPin size={14} aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />
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

      {trazabilidadConfig ? (
        <div
          data-testid={`card-trazabilidad-${incidente.id}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '3px',
            width: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden',
            padding: '6px 8px',
            backgroundColor: trazabilidadConfig.bg,
            color: trazabilidadConfig.color,
            border: '1px solid currentColor',
            borderLeft: '4px solid currentColor',
            borderRadius: 0,
            fontSize: '0.72rem',
            lineHeight: 1.25,
          }}
          title={`Estado de notificación en terreno: ${trazabilidadConfig.texto}`}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontWeight: 700,
              maxWidth: '100%',
              overflowWrap: 'anywhere',
              wordBreak: 'break-word',
            }}
          >
            <TrazabilidadIcon estado={estadoTrazabilidad} size={13} />
            <span>{trazabilidadConfig.etiquetaLectura}</span>
          </span>
          <span
            style={{
              fontWeight: 600,
              fontSize: '0.7rem',
              lineHeight: 1.3,
              maxWidth: '100%',
              overflowWrap: 'anywhere',
              wordBreak: 'break-word',
            }}
          >
            {trazabilidadConfig.textoCorto}
          </span>
        </div>
      ) : (
        incidente.estado === 'VERIFICANDO' && (
          <div
            data-testid={`card-trazabilidad-pendiente-${incidente.id}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '3px',
              width: '100%',
              boxSizing: 'border-box',
              overflow: 'hidden',
              padding: '6px 8px',
              backgroundColor: '#F8FAFC',
              color: '#5F676E',
              border: '1px dashed #94A3B8',
              borderRadius: 0,
              fontSize: '0.72rem',
              lineHeight: 1.25,
            }}
            title="Aún no se registra confirmación de recepción o lectura desde la patrulla en terreno"
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: 700,
                maxWidth: '100%',
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
              }}
            >
              <TrazabilidadIcon size={13} />
              <span>SIN ACUSE</span>
            </span>
            <span
              style={{
                fontWeight: 500,
                fontSize: '0.7rem',
                lineHeight: 1.3,
                maxWidth: '100%',
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
              }}
            >
              Lectura aún no confirmada
            </span>
          </div>
        )
      )}

      {incidente.estado === 'REPORTADO' && onAsignarPatrulla && puedeAsignarPatrulla && (
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
