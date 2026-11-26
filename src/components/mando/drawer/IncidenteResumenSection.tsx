'use client';

import React from 'react';
import { CheckCircle2, FileText, GitCompareArrows, ShieldCheck } from 'lucide-react';
import type { IncidenteDetalle } from '@/services/incidentesService';
import {
  esJustificacionSinCambios,
  formatearFuenteOrigen,
  fueTipologiaModificada,
} from '@/lib/utils/estadoUtils';
import { DrawerSectionHeader } from './DrawerSectionHeader';
import Chip from '@/components/ui/Chip';

import styles from '@/styles/mando.module.css';

interface IncidenteResumenSectionProps {
  detalle: IncidenteDetalle;
  onVerReporteCambioAfectacion?: (misionId: string, reporteId: string) => void;
}

export const IncidenteResumenSection: React.FC<IncidenteResumenSectionProps> = ({
  detalle,
  onVerReporteCambioAfectacion,
}) => {
  // Determinar si hubo cambio de tipo de afectación y a qué misión/reporte vincula
  const cambioAfectacion = React.useMemo(() => {
    if (detalle.reclasificacionTipologia) {
      return {
        misionId: detalle.reclasificacionTipologia.misionId,
        misionCodigo: detalle.reclasificacionTipologia.misionCodigo,
        reporteId: `reclasificacion-${detalle.reclasificacionTipologia.hitoId}`,
        tipoAnterior: detalle.reclasificacionTipologia.tipoAnterior,
        tipoNuevo: detalle.reclasificacionTipologia.tipoNuevo,
        justificacion: detalle.reclasificacionTipologia.justificacion,
      };
    }

    const justif = detalle.justificacionReclasificacion?.trim() || '';
    const esGlosaSoloPrioridad =
      /^(?:Reporte de evaluaci[oó]n[^:]*:\s*)?Prioridad (?:actualizada|asignada)\b/i.test(
        justif
      );

    if (justif.length > 0 && !esGlosaSoloPrioridad && detalle.misiones.length > 0) {
      const misionVerif =
        detalle.misiones.find((m) => m.tipoMision === 'VERIFICACION') || detalle.misiones[0];
      return {
        misionId: misionVerif.id,
        misionCodigo: misionVerif.codigo,
        reporteId: 'verificacion-terreno',
        tipoAnterior: null,
        tipoNuevo: detalle.tipoAfectacion,
        justificacion: detalle.justificacionReclasificacion || null,
      };
    }

    return null;
  }, [detalle]);

  const huboCambioTipologia = cambioAfectacion
    ? cambioAfectacion.tipoAnterior
      ? fueTipologiaModificada(cambioAfectacion.tipoAnterior, cambioAfectacion.tipoNuevo)
      : !esJustificacionSinCambios(cambioAfectacion.justificacion)
    : false;

  const tooltipCambio = cambioAfectacion
    ? !huboCambioTipologia
      ? `La tipología (${cambioAfectacion.tipoNuevo}) fue constatada en terreno sin modificaciones por la patrulla. Click para ver el reporte en la misión ${cambioAfectacion.misionCodigo}`
      : cambioAfectacion.tipoAnterior
        ? `Tipo de afectación cambiado en terreno (${cambioAfectacion.tipoAnterior} → ${cambioAfectacion.tipoNuevo}). Click para ver el reporte en la misión ${cambioAfectacion.misionCodigo}`
        : `Tipo de afectación reclasificado en terreno (${cambioAfectacion.tipoNuevo}). Click para ver el reporte en la misión ${cambioAfectacion.misionCodigo}`
    : '';

  return (
    <div className={styles.drawerSection}>
      <DrawerSectionHeader
        icono={<FileText size={18} />}
        titulo="Resumen del Incidente"
      />
      <div className={styles.drawerDataGrid}>
        <div>
          <span className={styles.drawerDataLabel}>Tipo de Afectación</span>
          <span
            className={styles.drawerDataValue}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}
          >
            <span>{detalle.tipoAfectacion}</span>
            {cambioAfectacion && onVerReporteCambioAfectacion && (
              <Chip
                data-testid="btn-ver-cambio-afectacion"
                variant={huboCambioTipologia ? 'teal' : 'success'}
                size="sm"
                icon={huboCambioTipologia ? <GitCompareArrows size={12} /> : <CheckCircle2 size={12} />}
                onClick={() =>
                  onVerReporteCambioAfectacion(
                    cambioAfectacion.misionId,
                    cambioAfectacion.reporteId
                  )
                }
                title={tooltipCambio}
                aria-label={tooltipCambio}
              >
                {!huboCambioTipologia
                  ? 'Confirmada sin cambios'
                  : cambioAfectacion.tipoAnterior
                    ? `Antes: ${cambioAfectacion.tipoAnterior}`
                    : 'Reclasificado'}
              </Chip>
            )}
          </span>
        </div>
        <div>
          <span className={styles.drawerDataLabel}>Código de Seguimiento</span>
          <span className={styles.drawerDataValue}>{detalle.codigoSeguimiento}</span>
        </div>
        <div>
          <span className={styles.drawerDataLabel}>Origen del Reporte</span>
          <span className={styles.drawerDataValue}>
            {formatearFuenteOrigen(detalle.fuenteOrigen)}
          </span>
        </div>
        <div>
          <span className={styles.drawerDataLabel}>Fecha de Ingreso</span>
          <span className={styles.drawerDataValue}>
            {new Date(detalle.creadoEn).toLocaleString('es-CL')}
          </span>
        </div>
      </div>

      {cambioAfectacion && huboCambioTipologia && (
        <div
          data-testid="bloque-reclasificacion-terreno"
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--color-info-bg, #E0F2F1)',
            borderLeft: '4px solid var(--color-primary-teal, #1B6F7D)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '0.35rem',
            }}
          >
            <ShieldCheck size={16} color="var(--color-primary-teal, #1B6F7D)" aria-hidden="true" />
            <strong
              style={{
                fontSize: '0.8125rem',
                color: 'var(--color-primary-teal-dark, #14505A)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Reclasificación Técnica en Terreno
            </strong>
          </div>
          <p style={{ margin: '0.2rem 0', fontSize: '0.8125rem', color: 'var(--color-charcoal, #3B3F45)' }}>
            <strong>Tipología constatada:</strong> {detalle.tipoAfectacion}
          </p>
          {cambioAfectacion.justificacion && (
            <p style={{ margin: '0.2rem 0', fontSize: '0.8125rem', color: 'var(--color-charcoal, #3B3F45)' }}>
              <strong>Justificación de la patrulla:</strong> {cambioAfectacion.justificacion}
            </p>
          )}
        </div>
      )}

      <div style={{ marginTop: '0.75rem' }}>
        <span className={styles.drawerDataLabel}>Descripción del Relato</span>
        <p className={styles.drawerDataValue} style={{ margin: '0.25rem 0' }}>
          {detalle.descripcion || 'Sin descripción detallada ingresada.'}
        </p>
      </div>
    </div>
  );
};
