import React from 'react';
import {
  MapPin,
  MapPinCheck,
  ShieldCheck,
  CheckCircle2,
  Hourglass,
  SlidersHorizontal,
  ClipboardCheck,
  Ban,
  HardHat,
} from 'lucide-react';
import type {
  EstadoTrazabilidadNotificacion,
  IncidenteResumen,
} from '@/services/incidentesService';
import { TRAZABILIDAD_CONFIG } from '@/lib/socket/trazabilidadConfig';
import { TrazabilidadIcon } from './TrazabilidadIcon';
import { obtenerNombreDelegacion } from '@/lib/utils/delegacionUtils';
import { formatearEstadoTerreno, formatearPrioridad } from '@/lib/utils/estadoUtils';
import {
  obtenerVarianteChipEstadoTerreno,
  obtenerVarianteChipPrioridad,
} from '@/lib/utils/chipVariants';
import styles from '@/styles/mando.module.css';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';

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
  const estaVerificado = Boolean(incidente.verificado);
  const tieneFaenasFinalizadas = Boolean(
    incidente.estado === 'EN_ATENCION' && incidente.faenasCuadrillaCompletadas
  );

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
      className={`${styles.incidenteCard} ${estaVerificado ? styles.incidenteVerificado : ''} ${tieneFaenasFinalizadas ? styles.incidenteFaenasFinalizadas : ''}`}
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
        <MapPin size={14} aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>{incidente.direccion}</span>
      </p>

      {incidente.estado === 'NO_ABORDABLE' && incidente.motivoNoAbordable && (
        <div
          data-testid="card-motivo-no-abordable"
          title={incidente.motivoNoAbordable}
          style={{
            marginTop: '0.35rem',
            marginBottom: '0.4rem',
            padding: '5px 8px',
            backgroundColor: 'var(--color-danger-bg, #FFEBEE)',
            borderLeft: '3px solid var(--color-danger, #D32F2F)',
            fontSize: '0.75rem',
            color: 'var(--color-charcoal, #3B3F45)',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          <strong style={{ color: 'var(--color-danger, #D32F2F)' }}>Motivo:</strong>{' '}
          {incidente.motivoNoAbordable}
        </div>
      )}

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
          {incidente.estado === 'NO_ABORDABLE' && (
            <Chip
              variant="danger"
              size="sm"
              icon={<Ban size={11} strokeWidth={2.2} />}
              title={
                incidente.motivoNoAbordable
                  ? `Declarado No Abordable en terreno: ${incidente.motivoNoAbordable}`
                  : 'Incidente declarado No Abordable en terreno'
              }
            >
              No Abordable
            </Chip>
          )}
          {incidente.dictamenTerreno === 'REQUIERE_CUADRILLA' &&
            incidente.estado !== 'NO_ABORDABLE' && (
              <Chip
                variant="teal"
                size="sm"
                icon={<HardHat size={11} strokeWidth={2.2} />}
                title="Verificación cerrada con dictamen: Requiere despacho de cuadrilla"
              >
                Requiere Cuadrilla
              </Chip>
            )}
          {(incidente.reclasificadoEnTerreno || incidente.verificado) && (
            <Chip
              variant="success"
              size="sm"
              icon={<CheckCircle2 size={11} strokeWidth={2.2} />}
              title={
                incidente.reclasificadoEnTerreno
                  ? incidente.justificacionReclasificacion
                    ? `Tipología reclasificada en terreno: ${incidente.justificacionReclasificacion}${incidente.cambioPrioridadMotivo || incidente.justificacionPrioridad ? ` (Prioridad ajustada: ${formatearPrioridad(incidente.prioridad)})` : ''}`
                    : `Tipología rectificada por patrulla en terreno (Prioridad: ${formatearPrioridad(incidente.prioridad)})`
                  : incidente.justificacionPrioridad
                    ? `Evaluación en terreno con ajuste de prioridad: ${incidente.justificacionPrioridad} (Prioridad: ${formatearPrioridad(incidente.prioridad)})`
                    : `Tipología constatada en terreno sin modificaciones (Prioridad: ${formatearPrioridad(incidente.prioridad)})`
              }
            >
              Verificado
            </Chip>
          )}
          {incidente.estado === 'EN_ATENCION' && incidente.faenasCuadrillaCompletadas && (
            <Chip
              data-testid="badge-faenas-finalizadas"
              variant="success"
              size="sm"
              icon={<CheckCircle2 size={11} strokeWidth={2.2} />}
              title="La cuadrilla completó las faenas y envió su informe técnico final. Pendiente resolución final del incidente (H86)."
            >
              Faenas finalizadas
            </Chip>
          )}
          {incidente.estado === 'EN_ATENCION' &&
            incidente.faenasCuadrillaCompletadas &&
            incidente.estadoTerrenoFinal &&
            ['CRITICO', 'INACCESIBLE', 'REQUIERE_SEGUIMIENTO'].includes(
              incidente.estadoTerrenoFinal.trim().toUpperCase()
            ) && (
              <Chip
                data-testid="badge-estado-terreno-card"
                variant={obtenerVarianteChipEstadoTerreno(incidente.estadoTerrenoFinal)}
                size="sm"
                title={`Estado final del terreno reportado al cierre: ${formatearEstadoTerreno(incidente.estadoTerrenoFinal)}`}
              >
                Terreno: {formatearEstadoTerreno(incidente.estadoTerrenoFinal)}
              </Chip>
            )}
          {totalReportes > 0 && (
            <Chip
              data-testid="badge-total-reportes-terreno"
              variant={
                totalReportes > 1 &&
                !incidente.faenasCuadrillaCompletadas &&
                incidente.estado !== 'EN_ATENCION' &&
                incidente.estado !== 'RESUELTO'
                  ? 'teal'
                  : 'neutral'
              }
              size="sm"
              icon={<ClipboardCheck size={11} />}
              title={
                totalReportes > 1
                  ? incidente.faenasCuadrillaCompletadas ||
                    incidente.estado === 'EN_ATENCION' ||
                    incidente.estado === 'RESUELTO'
                    ? `Se han registrado ${totalReportes} reportes técnicos en terreno`
                    : `Se han recibido ${totalReportes} reportes de evaluación en terreno (último envío corresponde a Rectificación #${totalReportes})`
                  : 'Se ha recibido 1 reporte de evaluación inicial desde terreno'
              }
            >
              {totalReportes === 1
                ? '1 reporte'
                : incidente.faenasCuadrillaCompletadas ||
                    incidente.estado === 'EN_ATENCION' ||
                    incidente.estado === 'RESUELTO'
                  ? `${totalReportes} reportes`
                  : `${totalReportes} reportes · Rectificado`}
            </Chip>
          )}
          {incidente.totalMisiones > 0 && (
            <Chip variant="neutral" size="sm">
              {incidente.totalMisiones}{' '}
              {incidente.totalMisiones === 1 ? 'misión' : 'misiones'}
            </Chip>
          )}
          {(incidente.cuadrillaEnTerreno || incidente.estado === 'EN_ATENCION') && (
            <Chip
              data-testid={
                incidente.cuadrillaEnTerreno
                  ? 'badge-llegada-terreno'
                  : 'badge-sin-llegada-terreno'
              }
              variant={incidente.cuadrillaEnTerreno ? 'success' : 'warning'}
              size="sm"
              icon={
                incidente.cuadrillaEnTerreno ? (
                  <MapPinCheck size={11} strokeWidth={2.2} />
                ) : (
                  <Hourglass size={11} strokeWidth={2.2} />
                )
              }
              title={
                incidente.cuadrillaEnTerreno
                  ? 'La cuadrilla reportó su llegada física a terreno'
                  : 'La cuadrilla aún no ha reportado llegada a terreno'
              }
            >
              {incidente.cuadrillaEnTerreno ? 'En terreno' : 'Sin llegada a terreno'}
            </Chip>
          )}
        </div>

        <span className={styles.cardDelegacion}>
          {obtenerNombreDelegacion(incidente.delegacionNombre, 'Sin delegación')}
        </span>
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
            flexShrink: 0,
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
              flexShrink: 0,
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
