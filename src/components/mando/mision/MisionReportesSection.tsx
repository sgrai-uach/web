'use client';

import React, { useState } from 'react';
import { ClipboardList, User, Clock, ShieldCheck, ChevronDown } from 'lucide-react';
import Heading from '@/components/ui/Heading';
import type {
  ReporteTerrenoDetalle,
  MisionBitacoraHito,
  PatrullaMisionDetalle,
  IncidenteMisionResumen,
} from '@/types/misiones';
import { formatearEstado, formatearPrioridad } from '@/lib/utils/estadoUtils';
import { MisionEvidenciasGallery } from './MisionEvidenciasGallery';
import styles from '@/styles/mision-detalle.module.css';

interface MisionReportesSectionProps {
  reportes: ReporteTerrenoDetalle[];
  bitacora?: MisionBitacoraHito[];
  patrulla?: PatrullaMisionDetalle | null;
  incidente?: IncidenteMisionResumen | null;
}

export const MisionReportesSection: React.FC<MisionReportesSectionProps> = ({
  reportes,
  bitacora = [],
  patrulla,
  incidente,
}) => {
  const [desplegados, setDesplegados] = useState<Record<string, boolean>>({});

  const toggleDesplegable = (id: string) => {
    setDesplegados((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? true),
    }));
  };

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

  const hitoReclasificacion = bitacora.find((h) => h.hito === 'TIPOLOGIA_RECLASIFICADA');
  const totalInformes = reportes.length + (hitoReclasificacion ? 1 : 0);

  let justificacionExtraida: string | null = null;
  if (hitoReclasificacion) {
    const match = hitoReclasificacion.descripcion.match(/Justificación:\s*(.+)$/i);
    justificacionExtraida = match ? match[1].trim() : hitoReclasificacion.descripcion;
  }

  const estaVerificacionAbierta = desplegados['verificacion-terreno'] ?? true;

  return (
    <div className={styles.seccionBloque}>
      <div className={styles.seccionHeader}>
        <div className={styles.seccionTituloGroup}>
          <ClipboardList size={18} color="var(--color-primary-teal, #1B6F7D)" />
          <Heading as="h3" variant="h4" color="teal" noMargin>
            Informes Técnicos y Reportes de Terreno ({totalInformes})
          </Heading>
        </div>
      </div>

      <div className={styles.seccionBody}>
        {totalInformes === 0 ? (
          <div className={styles.emptyStateContainer} data-testid="empty-reportes-container">
            <ClipboardList size={38} color="var(--color-text-muted, #5F676E)" />
            <p className={styles.emptyStateTitle}>Sin reportes aún</p>
            <p className={styles.emptyStateSubtitle}>
              La unidad aún no ha emitido informes técnicos en terreno. Los reportes y evaluaciones aparecerán aquí a medida que el equipo los sincronice.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3, 12px)' }}>
            {/* Informe Técnico de Reclasificación / Verificación en Terreno */}
            {hitoReclasificacion && (
              <div
                className={styles.reporteCard}
                style={{
                  borderLeft: '4px solid var(--color-primary-teal, #1B6F7D)',
                  backgroundColor: 'var(--color-info-bg, #E0F2F1)',
                }}
                data-testid="reporte-verificacion-reclasificacion"
              >
                <button
                  type="button"
                  className={styles.reporteHeaderTrigger}
                  onClick={() => toggleDesplegable('verificacion-terreno')}
                  aria-expanded={estaVerificacionAbierta}
                  aria-label={`${estaVerificacionAbierta ? 'Colapsar' : 'Desplegar'} informe de evaluación en terreno`}
                >
                  <div className={styles.evaluadorInfo}>
                    <ShieldCheck size={18} color="var(--color-primary-teal, #1B6F7D)" />
                    <div>
                      <span className={styles.evaluadorNombre}>
                        {patrulla?.nombre ? `Patrulla ${patrulla.nombre}` : 'Patrulla Verificadora'}
                      </span>{' '}
                      {patrulla?.lider && (
                        <span className={styles.evaluadorRut}>
                          (Líder: {patrulla.lider.nombre})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.reporteMetaTags}>
                    <span
                      className={styles.badgeTerreno}
                      style={{
                        backgroundColor: 'var(--color-primary-teal, #1B6F7D)',
                        color: 'var(--color-white, #FFFFFF)',
                        border: 'none',
                        fontWeight: 700,
                      }}
                      title="Constatación técnica presencial realizada por patrulla verificadora"
                    >
                      Evaluación en Terreno Realizada
                    </span>

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
                      <span>{hitoReclasificacion.fecha} {hitoReclasificacion.hora}</span>
                    </span>

                    <span
                      className={`${styles.reporteChevron} ${
                        estaVerificacionAbierta ? styles.reporteChevronExpanded : ''
                      }`}
                    >
                      <ChevronDown size={18} aria-hidden="true" />
                    </span>
                  </div>
                </button>

                {estaVerificacionAbierta && (
                  <div className={styles.reporteBody}>
                    <div>
                      <span className={styles.dataLabel}>Diagnóstico Técnico y Tipología Constatada:</span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: 700, color: 'var(--color-primary-teal-dark, #14505A)' }}>
                        {incidente?.tipoAfectacion || 'Tipología reclasificada en terreno'}
                      </p>
                    </div>

                    <div>
                      <span className={styles.dataLabel}>Justificación y Constatación Presencial:</span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--color-text-dark, #2B2B2B)', lineHeight: 1.4 }}>
                        {justificacionExtraida || hitoReclasificacion.descripcion}
                      </p>
                    </div>

                    {incidente && (
                      <div className={styles.dataGrid}>
                        <div className={styles.dataItem}>
                          <span className={styles.dataLabel}>Prioridad Confirmada</span>
                          <span className={styles.dataValue} style={{ fontWeight: 700 }}>
                            {formatearPrioridad(incidente.prioridad)}
                          </span>
                        </div>

                        <div className={styles.dataItem}>
                          <span className={styles.dataLabel}>Estado Operativo del Incidente</span>
                          <span className={styles.dataValue} style={{ fontWeight: 600 }}>
                            {formatearEstado(incidente.estado)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Lista de Reportes de Cuadrilla u Operativos */}
            {reportes.map((reporte) => {
              const estaAbierto = desplegados[reporte.id] ?? true;

              return (
                <div key={reporte.id} className={styles.reporteCard}>
                  <button
                    type="button"
                    className={styles.reporteHeaderTrigger}
                    onClick={() => toggleDesplegable(reporte.id)}
                    aria-expanded={estaAbierto}
                    aria-label={`${estaAbierto ? 'Colapsar' : 'Desplegar'} informe técnico de ${reporte.evaluador.nombre}`}
                  >
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
                        {formatearEstado(reporte.estadoTerreno)}
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

                      <span
                        className={`${styles.reporteChevron} ${
                          estaAbierto ? styles.reporteChevronExpanded : ''
                        }`}
                      >
                        <ChevronDown size={18} aria-hidden="true" />
                      </span>
                    </div>
                  </button>

                  {/* Contenido técnico desplegable */}
                  {estaAbierto && (
                    <div className={styles.reporteBody}>
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

                      {/* Galería de Evidencias */}
                      <MisionEvidenciasGallery adjuntos={reporte.adjuntos} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
