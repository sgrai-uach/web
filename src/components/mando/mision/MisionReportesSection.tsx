'use client';

import React from 'react';
import { ClipboardList, User, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import Heading from '@/components/ui/Heading';
import type { ReporteTerrenoDetalle } from '@/types/misiones';
import { MisionEvidenciasGallery } from './MisionEvidenciasGallery';
import styles from '@/styles/mision-detalle.module.css';

interface MisionReportesSectionProps {
  reportes: ReporteTerrenoDetalle[];
}

export const MisionReportesSection: React.FC<MisionReportesSectionProps> = ({ reportes }) => {
  const formatFecha = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className={styles.seccionBloque}>
      <div className={styles.seccionHeader}>
        <div className={styles.seccionTituloGroup}>
          <ClipboardList size={18} color="var(--color-primary-teal, #1B6F7D)" />
          <Heading as="h3" variant="h4" color="teal" noMargin>
            Informes Técnicos y Reportes de Terreno ({reportes.length})
          </Heading>
        </div>
      </div>

      <div className={styles.seccionBody}>
        {reportes.length === 0 ? (
          <div className={styles.emptyStateContainer} data-testid="empty-reportes-container">
            <ClipboardList size={38} color="var(--color-text-muted, #5F676E)" />
            <p className={styles.emptyStateTitle}>Sin reportes aún</p>
            <p className={styles.emptyStateSubtitle}>
              La unidad aún no ha emitido informes técnicos en terreno. Los reportes y evaluaciones aparecerán aquí a medida que el equipo los sincronice.
            </p>
          </div>
        ) : (
          reportes.map((reporte) => (
            <div key={reporte.id} className={styles.reporteCard}>
              <div className={styles.reporteHeader}>
                <div className={styles.evaluadorInfo}>
                  <User size={16} color="var(--color-primary-teal, #1B6F7D)" />
                  <div>
                    <span className={styles.evaluadorNombre}>{reporte.evaluador.nombre}</span>{' '}
                    <span className={styles.evaluadorRut}>
                      {reporte.evaluador.rut ? `(RUT: ${reporte.evaluador.rut})` : `(${reporte.evaluador.email})`}
                    </span>
                  </div>
                </div>

                <div className={styles.reporteMetaTags}>
                  <span className={styles.badgeTerreno} title="Estado reportado en terreno">
                    {reporte.estadoTerreno}
                  </span>

                  {reporte.requiereApoyoAdicional && (
                    <span
                      className={styles.badgeApoyo}
                      title="El equipo en terreno requiere refuerzos o apoyo adicional"
                    >
                      Requiere Apoyo
                    </span>
                  )}

                  <span
                    style={{
                      fontSize: '12px',
                      color: 'var(--color-text-muted, #5F676E)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Clock size={12} />
                    <span>{formatFecha(reporte.creadoEn)}</span>
                  </span>
                </div>
              </div>

              {/* Contenido técnico */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <span className={styles.dataLabel}>Diagnóstico y Resumen Técnico:</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--color-text-dark, #2B2B2B)' }}>
                    {reporte.resumenTecnico}
                  </p>
                </div>

                {reporte.accionesRealizadas && (
                  <div>
                    <span className={styles.dataLabel}>Acciones Ejecutadas en el Sitio:</span>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--color-text-dark, #2B2B2B)' }}>
                      {reporte.accionesRealizadas}
                    </p>
                  </div>
                )}

                <div className={styles.dataGrid}>
                  <div className={styles.dataItem}>
                    <span className={styles.dataLabel}>Personas Afectadas</span>
                    <span className={styles.dataValue} style={{ fontWeight: 700 }}>
                      {reporte.personasAfectadas}
                    </span>
                  </div>

                  <div className={styles.dataItem}>
                    <span className={styles.dataLabel}>Daños Estimados</span>
                    <span className={styles.dataValue}>
                      {reporte.danosEstimados || 'Sin daños mayores reportados'}
                    </span>
                  </div>
                </div>

                {reporte.observaciones && (
                  <div>
                    <span className={styles.dataLabel}>Observaciones Adicionales:</span>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-text-muted, #5F676E)' }}>
                      {reporte.observaciones}
                    </p>
                  </div>
                )}
              </div>

              {/* Galería de Evidencias */}
              <MisionEvidenciasGallery adjuntos={reporte.adjuntos} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
