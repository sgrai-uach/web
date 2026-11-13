import React from 'react';
import {
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Hourglass,
  SlidersHorizontal,
  ClipboardCheck,
} from 'lucide-react';
import type { IncidenteResumen } from '@/services/incidentesService';
import { obtenerNombreDelegacion } from '@/lib/utils/delegacionUtils';
import { formatearPrioridad } from '@/lib/utils/estadoUtils';
import { obtenerVarianteChipPrioridad } from '@/lib/utils/chipVariants';
import styles from '@/styles/mando.module.css';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';

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
  const estaVerificado = Boolean(incidente.verificado);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(incidente);
    }
  };

  const prioridadFueModificadaManual = Boolean(
    (incidente.prioridadSugerida &&
      incidente.prioridadSugerida !== incidente.prioridad) ||
      incidente.justificacionPrioridad
  );

  const justificacionPrioridadTexto =
    incidente.justificacionPrioridad || incidente.cambioPrioridadMotivo;

  const tooltipPrioridad = prioridadFueModificadaManual
    ? `Prioridad ajustada manualmente en terreno: ${formatearPrioridad(incidente.prioridad)}${
        incidente.prioridadSugerida
          ? ` (Sugerida por sistema: ${formatearPrioridad(incidente.prioridadSugerida)})`
          : ''
      }${justificacionPrioridadTexto ? `. Justificación: ${justificacionPrioridadTexto}` : ''}`
    : incidente.prioridadSugerida
      ? `Prioridad: ${formatearPrioridad(incidente.prioridad)} (Coincide con sugerencia del sistema)`
      : `Prioridad: ${formatearPrioridad(incidente.prioridad)}`;

  const totalReportes = Number(incidente.totalReportesTerreno ?? 0);

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
        <span className={styles.cardCodigo}>{incidente.codigo}</span>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
          {prioridadFueModificadaManual && (
            <Chip
              data-testid="indicador-prioridad-ajustada"
              variant="warning"
              size="sm"
              icon={<SlidersHorizontal size={11} />}
              title={tooltipPrioridad}
            >
              Ajustada
            </Chip>
          )}
          <Chip
            variant={obtenerVarianteChipPrioridad(incidente.prioridad)}
            size="sm"
            title={tooltipPrioridad}
          >
            {formatearPrioridad(incidente.prioridad)}
          </Chip>
        </div>
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
            <Chip
              variant="warning"
              size="sm"
              title="Este incidente requiere levantamiento de ficha FIBE"
            >
              FIBE
            </Chip>
          )}
          {(incidente.reclasificadoEnTerreno || incidente.verificado) && (
            <Chip
              variant="success"
              size="sm"
              icon={<CheckCircle2 size={11} strokeWidth={2.2} />}
              title={
                incidente.justificacionReclasificacion
                  ? `Tipología reclasificada en terreno: ${incidente.justificacionReclasificacion}${incidente.cambioPrioridadMotivo || incidente.justificacionPrioridad ? ` (Prioridad ajustada: ${formatearPrioridad(incidente.prioridad)})` : ''}`
                  : incidente.justificacionPrioridad
                    ? `Evaluación en terreno con ajuste de prioridad: ${incidente.justificacionPrioridad} (Prioridad: ${formatearPrioridad(incidente.prioridad)})`
                    : `Tipología rectificada por patrulla en terreno (Prioridad: ${formatearPrioridad(incidente.prioridad)})`
              }
            >
              Verificado
            </Chip>
          )}
          {totalReportes > 0 && (
            <Chip
              data-testid="badge-total-reportes-terreno"
              variant={totalReportes > 1 ? 'teal' : 'neutral'}
              size="sm"
              icon={<ClipboardCheck size={11} />}
              title={
                totalReportes > 1
                  ? `Se han recibido ${totalReportes} reportes de evaluación en terreno (último envío corresponde a Rectificación #${totalReportes})`
                  : 'Se ha recibido 1 reporte de evaluación inicial desde terreno'
              }
            >
              {totalReportes === 1
                ? '1 reporte'
                : `${totalReportes} reportes · Rectificado`}
            </Chip>
          )}
          {incidente.totalMisiones > 0 && (
            <Chip variant="neutral" size="sm">
              {incidente.totalMisiones}{' '}
              {incidente.totalMisiones === 1 ? 'misión' : 'misiones'}
            </Chip>
          )}
        </div>

        <span className={styles.cardDelegacion}>
          {obtenerNombreDelegacion(incidente.delegacionNombre, 'Sin delegación')}
        </span>
      </div>

      {incidente.estado === 'REPORTADO' &&
        (incidente.tieneMisionDespachada ||
          (!incidente.tieneMisionEnCurso && onAsignarPatrulla && puedeAsignarPatrulla)) && (
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
          ) : !incidente.tieneMisionEnCurso && onAsignarPatrulla && puedeAsignarPatrulla ? (
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
