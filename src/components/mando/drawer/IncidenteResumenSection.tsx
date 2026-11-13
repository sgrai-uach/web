'use client';

import React from 'react';
import { CheckCircle2, FileText, GitCompareArrows } from 'lucide-react';
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

    if (
      (detalle.reclasificadoEnTerreno || detalle.justificacionReclasificacion) &&
      detalle.misiones.length > 0
    ) {
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

      <div style={{ marginTop: '0.75rem' }}>
        <span className={styles.drawerDataLabel}>Descripción del Relato</span>
        <p className={styles.drawerDataValue} style={{ margin: '0.25rem 0' }}>
          {detalle.descripcion || 'Sin descripción detallada ingresada.'}
        </p>
      </div>
    </div>
  );
};
