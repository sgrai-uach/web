'use client';

import React, { useState, useMemo } from 'react';
import {
  ClipboardList,
  User,
  Clock,
  ShieldCheck,
  ChevronDown,
  SlidersHorizontal,
  AlertTriangle,
  Home,
  Users,
  HeartHandshake,
} from 'lucide-react';
import Heading from '@/components/ui/Heading';
import Chip from '@/components/ui/Chip';
import type {
  ReporteTerrenoDetalle,
  MisionBitacoraHito,
  PatrullaMisionDetalle,
  IncidenteMisionResumen,
  EvaluacionTerrenoMisionDetalle,
} from '@/types/misiones';
import {
  esJustificacionSinCambios,
  formatearEstado,
  formatearPrioridad,
  formatearCompromisoVivienda,
  fueTipologiaModificada,
  obtenerVarianteCompromisoVivienda,
} from '@/lib/utils/estadoUtils';
import { MisionEvidenciasGallery } from './MisionEvidenciasGallery';
import styles from '@/styles/mision-detalle.module.css';

interface MisionReportesSectionProps {
  reportes: ReporteTerrenoDetalle[];
  bitacora?: MisionBitacoraHito[];
  patrulla?: PatrullaMisionDetalle | null;
  incidente?: IncidenteMisionResumen | null;
  reporteDestacadoId?: string | null;
  seccionRef?: React.RefObject<HTMLDivElement | null>;
}

function normalizarDetallesEvaluacion(
  raw?: EvaluacionTerrenoMisionDetalle | Record<string, unknown> | null
): EvaluacionTerrenoMisionDetalle | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const clavesRelevantes = [
    'familias',
    'nucleoFamiliarTotal',
    'nucleo_familiar_total',
    'familiasAfectadas',
    'familias_afectadas',
    'cantidadNinos',
    'cantidad_ninos',
    'cantidadAdultosMayores',
    'cantidad_adultos_mayores',
    'personasDiscapacitadas',
    'personas_discapacitadas',
    'personasElectrodependientes',
    'personas_electrodependientes',
    'mascotasAfectadas',
    'mascotas_afectadas',
    'viviendasAfectadas',
    'viviendas_afectadas',
    'nivelCompromisoVivienda',
    'nivel_compromiso_vivienda',
    'requiereEvacuacion',
    'requiere_evacuacion',
    'riesgosActivos',
    'riesgos_activos',
    'detallesAdicionales',
    'detalles_adicionales',
  ];
  const tieneAlgunCampo = clavesRelevantes.some((k) => r[k] !== undefined && r[k] !== null);
  if (!tieneAlgunCampo) return null;

  const riesgosRaw = (r.riesgosActivos || r.riesgos_activos || {}) as Record<string, unknown>;
  const familiasRaw = Array.isArray(r.familias) ? (r.familias as Record<string, unknown>[]) : undefined;

  return {
    familias: familiasRaw
      ? familiasRaw.map((f, i) => ({
          id: typeof f.id === 'string' ? f.id : `fam-${i + 1}`,
          referencia: typeof f.referencia === 'string' ? f.referencia : undefined,
          nucleoFamiliarTotal: typeof f.nucleoFamiliarTotal === 'number' ? f.nucleoFamiliarTotal : undefined,
          cantidadNinos: typeof f.cantidadNinos === 'number' ? f.cantidadNinos : undefined,
          cantidadAdultosMayores: typeof f.cantidadAdultosMayores === 'number' ? f.cantidadAdultosMayores : undefined,
          personasDiscapacitadas: typeof f.personasDiscapacitadas === 'number' ? f.personasDiscapacitadas : undefined,
          personasElectrodependientes: typeof f.personasElectrodependientes === 'number' ? f.personasElectrodependientes : undefined,
          mascotasAfectadas: typeof f.mascotasAfectadas === 'number' ? f.mascotasAfectadas : undefined,
          nivelCompromisoVivienda: typeof f.nivelCompromisoVivienda === 'string' ? f.nivelCompromisoVivienda : undefined,
          requiereAsistenciaSocial: typeof f.requiereAsistenciaSocial === 'boolean' ? f.requiereAsistenciaSocial : undefined,
        }))
      : undefined,
    nucleoFamiliarTotal:
      typeof r.nucleoFamiliarTotal === 'number'
        ? r.nucleoFamiliarTotal
        : typeof r.nucleo_familiar_total === 'number'
          ? r.nucleo_familiar_total
          : undefined,
    familiasAfectadas:
      typeof r.familiasAfectadas === 'number'
        ? r.familiasAfectadas
        : typeof r.familias_afectadas === 'number'
          ? r.familias_afectadas
          : undefined,
    cantidadNinos:
      typeof r.cantidadNinos === 'number'
        ? r.cantidadNinos
        : typeof r.cantidad_ninos === 'number'
          ? r.cantidad_ninos
          : undefined,
    cantidadAdultosMayores:
      typeof r.cantidadAdultosMayores === 'number'
        ? r.cantidadAdultosMayores
        : typeof r.cantidad_adultos_mayores === 'number'
          ? r.cantidad_adultos_mayores
          : undefined,
    personasDiscapacitadas:
      typeof r.personasDiscapacitadas === 'number'
        ? r.personasDiscapacitadas
        : typeof r.personas_discapacitadas === 'number'
          ? r.personas_discapacitadas
          : undefined,
    personasElectrodependientes:
      typeof r.personasElectrodependientes === 'number'
        ? r.personasElectrodependientes
        : typeof r.personas_electrodependientes === 'number'
          ? r.personas_electrodependientes
          : undefined,
    mascotasAfectadas:
      typeof r.mascotasAfectadas === 'number'
        ? r.mascotasAfectadas
        : typeof r.mascotas_afectadas === 'number'
          ? r.mascotas_afectadas
          : undefined,
    viviendasAfectadas:
      typeof r.viviendasAfectadas === 'number'
        ? r.viviendasAfectadas
        : typeof r.viviendas_afectadas === 'number'
          ? r.viviendas_afectadas
          : undefined,
    nivelCompromisoVivienda:
      typeof r.nivelCompromisoVivienda === 'string'
        ? r.nivelCompromisoVivienda
        : typeof r.nivel_compromiso_vivienda === 'string'
          ? r.nivel_compromiso_vivienda
          : undefined,
    requiereEvacuacion:
      typeof r.requiereEvacuacion === 'boolean'
        ? r.requiereEvacuacion
        : typeof r.requiere_evacuacion === 'boolean'
          ? r.requiere_evacuacion
          : undefined,
    requiereAsistenciaSocial:
      typeof r.requiereAsistenciaSocial === 'boolean'
        ? r.requiereAsistenciaSocial
        : typeof r.requiere_asistencia_social === 'boolean'
          ? r.requiere_asistencia_social
          : undefined,
    riesgosActivos: {
      riesgoElectrico: Boolean(
        riesgosRaw.riesgoElectrico ?? riesgosRaw.riesgo_electrico ?? r.riesgoElectrico
      ),
      riesgoEstructural: Boolean(
        riesgosRaw.riesgoEstructural ?? riesgosRaw.riesgo_estructural ?? r.riesgoEstructural
      ),
      riesgoQuimicoSanitario: Boolean(
        riesgosRaw.riesgoQuimicoSanitario ??
          riesgosRaw.riesgo_quimico_sanitario ??
          r.riesgoQuimicoSanitario
      ),
      aislamientoVial: Boolean(
        riesgosRaw.aislamientoVial ?? riesgosRaw.aislamiento_vial ?? r.aislamientoVial
      ),
    },
    detallesAdicionales:
      typeof r.detallesAdicionales === 'string'
        ? r.detallesAdicionales
        : typeof r.detalles_adicionales === 'string'
          ? r.detalles_adicionales
          : null,
  };
}

export const MisionReportesSection: React.FC<MisionReportesSectionProps> = ({
  reportes,
  bitacora = [],
  patrulla,
  incidente,
  reporteDestacadoId,
  seccionRef,
}) => {
  const [desplegados, setDesplegados] = useState<Record<string, boolean>>({});

  // Ordenar reportes dejando la versión más reciente primero (vigente) cuando hay múltiples envíos
  const reportesOrdenados = useMemo(() => {
    if (reportes.length <= 1) return reportes;
    return [...reportes].sort((a, b) => {
      const verA = Number(a.versionReporte ?? 0);
      const verB = Number(b.versionReporte ?? 0);
      if (verA !== verB) return verB - verA;
      return new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime();
    });
  }, [reportes]);

  const toggleDesplegable = (id: string, estadoActual: boolean) => {
    setDesplegados((prev) => ({
      ...prev,
      [id]: !estadoActual,
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

  const hitosReclasificacion = bitacora.filter((h) => h.hito === 'TIPOLOGIA_RECLASIFICADA');
  const hitoReclasificacion =
    hitosReclasificacion.length > 0
      ? hitosReclasificacion[hitosReclasificacion.length - 1]
      : undefined;
  const totalInformes = reportesOrdenados.length + (hitoReclasificacion ? 1 : 0);

  let justificacionExtraida: string | null = null;
  let tipoAnteriorMeta: string | null = null;
  let tipoNuevoMeta: string | null = null;
  if (hitoReclasificacion) {
    const match = hitoReclasificacion.descripcion.match(/Justificación:\s*(.+)$/i);
    justificacionExtraida = match ? match[1].trim() : hitoReclasificacion.descripcion;
    const meta = hitoReclasificacion.metadatos;
    if (meta && typeof meta === 'object') {
      if (typeof meta.tipoAnterior === 'string' && meta.tipoAnterior.trim().length > 0) {
        tipoAnteriorMeta = meta.tipoAnterior.trim();
      }
      if (typeof meta.tipoNuevo === 'string' && meta.tipoNuevo.trim().length > 0) {
        tipoNuevoMeta = meta.tipoNuevo.trim();
      }
    }
  }

  const esDestacadoReclasificacion = Boolean(
    hitoReclasificacion &&
      reporteDestacadoId &&
      (reporteDestacadoId === 'verificacion-terreno' ||
        reporteDestacadoId.startsWith('reclasificacion-'))
  );

  // Determinar qué reporte se despliega por defecto (todos colapsados menos el último, salvo caso excepcional)
  const idAbiertoPorDefecto = useMemo(() => {
    if (esDestacadoReclasificacion) {
      return 'verificacion-terreno';
    }
    if (
      reporteDestacadoId &&
      reportesOrdenados.some((r) => r.id === reporteDestacadoId)
    ) {
      return reporteDestacadoId;
    }

    const ultimoReporteTerreno = reportesOrdenados[0];
    if (ultimoReporteTerreno && hitoReclasificacion) {
      const tsRep = new Date(ultimoReporteTerreno.creadoEn).getTime();
      const tsHito = new Date(hitoReclasificacion.timestamp).getTime();
      return tsRep >= tsHito ? ultimoReporteTerreno.id : 'verificacion-terreno';
    }
    if (ultimoReporteTerreno) {
      return ultimoReporteTerreno.id;
    }
    if (hitoReclasificacion) {
      return 'verificacion-terreno';
    }
    return null;
  }, [esDestacadoReclasificacion, reporteDestacadoId, reportesOrdenados, hitoReclasificacion]);

  const estaVerificacionAbierta =
    desplegados['verificacion-terreno'] ?? (idAbiertoPorDefecto === 'verificacion-terreno');

  return (
    <div
      ref={seccionRef}
      className={styles.seccionBloque}
      data-testid="mision-reportes-section"
    >
      <div className={styles.seccionHeader}>
        <div className={styles.seccionTituloGroup}>
          <ClipboardList size={18} color="var(--color-primary-teal, #1B6F7D)" />
          <Heading as="h3" variant="h4" color="teal" noMargin>
            Informes Técnicos y Reportes de Terreno ({totalInformes})
          </Heading>
        </div>
        {reportesOrdenados.length > 1 && (
          <Chip variant="teal" size="sm">
            {reportesOrdenados.length} versiones registradas
          </Chip>
        )}
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
                data-report-id={
                  hitoReclasificacion.id
                    ? `reclasificacion-${hitoReclasificacion.id}`
                    : 'verificacion-terreno'
                }
              >
                <button
                  type="button"
                  className={styles.reporteHeaderTrigger}
                  onClick={() => toggleDesplegable('verificacion-terreno', estaVerificacionAbierta)}
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
                    <Chip
                      variant="solid-teal"
                      size="sm"
                      title="Constatación técnica presencial realizada por patrulla verificadora"
                    >
                      Evaluación en Terreno Realizada
                    </Chip>

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
                        {(() => {
                          const tipoFinal = tipoNuevoMeta || incidente?.tipoAfectacion || '';
                          const sinCambios = tipoAnteriorMeta
                            ? !fueTipologiaModificada(tipoAnteriorMeta, tipoFinal)
                            : esJustificacionSinCambios(justificacionExtraida || hitoReclasificacion.descripcion);
                          if (sinCambios && tipoFinal) {
                            return `${tipoFinal} (confirmada sin modificaciones por la patrulla)`;
                          }
                          return tipoAnteriorMeta
                            ? `${tipoAnteriorMeta} → ${tipoFinal || 'Tipología reclasificada en terreno'}`
                            : tipoFinal || 'Tipología reclasificada en terreno';
                        })()}
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

            {/* Lista de Reportes de Terreno / Evaluación (Inicial y Rectificaciones) */}
            {reportesOrdenados.map((reporte, idx) => {
              const estaAbierto =
                desplegados[reporte.id] ?? (idAbiertoPorDefecto === reporte.id);
              const esMasReciente = idx === 0;
              const numVersion =
                reporte.versionReporte ??
                (reportesOrdenados.length > 1 ? reportesOrdenados.length - idx : 1);
              const esRectificacion = Boolean(
                reporte.esRectificacion || numVersion > 1
              );
              const etiquetaVersion =
                reporte.etiquetaReporte ||
                (esRectificacion
                  ? `Reporte #${numVersion} (Rectificación)`
                  : 'Reporte #1 (Inicial)');

              const evalNorm = normalizarDetallesEvaluacion(reporte.detallesEvaluacion);
              const tieneEvaluacionPrioridad = Boolean(
                reporte.prioridadSugerida ||
                  reporte.prioridadAsignada ||
                  reporte.justificacionPrioridad ||
                  reporte.versionReporte ||
                  evalNorm
              );
              const prioridadModificada = Boolean(
                (reporte.prioridadSugerida &&
                  reporte.prioridadAsignada &&
                  reporte.prioridadSugerida !== reporte.prioridadAsignada) ||
                  reporte.justificacionPrioridad
              );

              const riesgosLista: string[] = [];
              if (evalNorm?.riesgosActivos?.riesgoElectrico) {
                riesgosLista.push('Riesgo Eléctrico');
              }
              if (evalNorm?.riesgosActivos?.riesgoEstructural) {
                riesgosLista.push('Riesgo Estructural');
              }
              if (evalNorm?.riesgosActivos?.riesgoQuimicoSanitario) {
                riesgosLista.push('Riesgo Químico / Sanitario');
              }
              if (evalNorm?.riesgosActivos?.aislamientoVial) {
                riesgosLista.push('Aislamiento Vial');
              }

              const esDestacado = reporteDestacadoId === reporte.id;

              return (
                <div
                  key={reporte.id}
                  className={styles.reporteCard}
                  data-testid={`reporte-terreno-card-${reporte.id}`}
                  data-report-id={reporte.id}
                  style={
                    esDestacado
                      ? {
                          borderLeft: '4px solid var(--color-primary-teal, #1B6F7D)',
                          borderColor: 'var(--color-primary-teal, #1B6F7D)',
                        }
                      : undefined
                  }
                >
                  <button
                    type="button"
                    className={styles.reporteHeaderTrigger}
                    data-testid={`toggle-reporte-${reporte.id}`}
                    onClick={() => toggleDesplegable(reporte.id, estaAbierto)}
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

                    <div className={styles.reporteMetaTags} style={{ flexWrap: 'wrap' }}>
                      {tieneEvaluacionPrioridad && (
                        <Chip variant={esRectificacion ? 'teal' : 'neutral'} size="sm">
                          {etiquetaVersion}
                        </Chip>
                      )}

                      {reportesOrdenados.length > 1 && (
                        <Chip variant={esMasReciente ? 'solid-teal' : 'neutral'} size="sm">
                          {esMasReciente ? 'Vigente' : 'Histórico'}
                        </Chip>
                      )}

                      <Chip variant="neutral" size="sm" title="Estado reportado en terreno">
                        {formatearEstado(reporte.estadoTerreno)}
                      </Chip>

                      {(evalNorm?.familias && evalNorm.familias.length > 0
                        ? evalNorm.familias.length
                        : evalNorm?.familiasAfectadas) ? (
                        <Chip variant="neutral" size="sm" title="Familias / Hogares evaluados en terreno">
                          {evalNorm?.familias && evalNorm.familias.length > 0
                            ? evalNorm.familias.length
                            : evalNorm?.familiasAfectadas}{' '}
                          {(evalNorm?.familias && evalNorm.familias.length > 0
                            ? evalNorm.familias.length
                            : evalNorm?.familiasAfectadas) === 1
                            ? 'hogar'
                            : 'hogares'}
                        </Chip>
                      ) : null}

                      {reporte.requiereApoyoAdicional && (
                        <Chip
                          variant="warning"
                          size="sm"
                          title="El equipo en terreno requiere refuerzos o apoyo adicional"
                        >
                          Requiere Apoyo
                        </Chip>
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
                      {/* Bloque de Prioridad Sugerida vs. Confirmada y Justificación (HU-38) */}
                      {(reporte.prioridadSugerida ||
                        reporte.prioridadAsignada ||
                        reporte.justificacionPrioridad) && (
                        <div
                          data-testid={`comparativa-prioridad-${reporte.id}`}
                          style={{
                            padding: '10px 12px',
                            backgroundColor: prioridadModificada
                              ? 'var(--color-warning-bg, #FFF3E0)'
                              : 'var(--color-bg-light, #ECEFF3)',
                            border: `1px solid ${
                              prioridadModificada
                                ? '#FFCC80'
                                : 'var(--border-color-neutral, #DFE3E8)'
                            }`,
                            borderLeft: `4px solid ${
                              prioridadModificada
                                ? 'var(--color-warning, #E65100)'
                                : 'var(--color-primary-teal, #1B6F7D)'
                            }`,
                          }}
                        >
                          <div className={styles.dataGrid}>
                            {reporte.prioridadSugerida && (
                              <div className={styles.dataItem}>
                                <span className={styles.dataLabel}>
                                  Prioridad Sugerida (Sistema)
                                </span>
                                <span className={styles.dataValue} style={{ fontWeight: 700 }}>
                                  {formatearPrioridad(reporte.prioridadSugerida)}
                                </span>
                              </div>
                            )}

                            {(reporte.prioridadAsignada || incidente?.prioridad) && (
                              <div className={styles.dataItem}>
                                <span className={styles.dataLabel}>
                                  Prioridad Confirmada (Patrulla)
                                </span>
                                <span
                                  className={styles.dataValue}
                                  style={{
                                    fontWeight: 700,
                                    color: prioridadModificada
                                      ? 'var(--color-warning, #E65100)'
                                      : 'var(--color-primary-teal-dark, #14505A)',
                                  }}
                                >
                                  {formatearPrioridad(
                                    reporte.prioridadAsignada || incidente?.prioridad
                                  )}
                                  {prioridadModificada ? ' (Ajustada manualmente)' : ''}
                                </span>
                              </div>
                            )}
                          </div>

                          {reporte.justificacionPrioridad && (
                            <div
                              data-testid="justificacion-prioridad-reporte"
                              style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.08)' }}
                            >
                              <span
                                className={styles.dataLabel}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                <SlidersHorizontal size={12} aria-hidden="true" />
                                <span>Justificación Técnica de Cambio de Prioridad:</span>
                              </span>
                              <p
                                style={{
                                  margin: '4px 0 0 0',
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  color: 'var(--color-text-dark, #2B2B2B)',
                                }}
                              >
                                {reporte.justificacionPrioridad}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {reporte.resumenTecnico &&
                        !/^\s*Evaluaci[oó]n en Terreno #\d+/i.test(reporte.resumenTecnico) && (
                          <div>
                            <span className={styles.dataLabel}>Diagnóstico y Resumen Técnico:</span>
                            <p
                              style={{
                                margin: '4px 0 0 0',
                                fontSize: '14px',
                                color: 'var(--color-text-dark, #2B2B2B)',
                              }}
                            >
                              {reporte.resumenTecnico}
                            </p>
                          </div>
                        )}

                      {/* Desglose Demográfico y de Vulnerabilidad en Terreno (HU-38) */}
                      {evalNorm && (
                        <div
                          data-testid={`desglose-evaluacion-terreno-${reporte.id}`}
                          style={{
                            padding: '10px 12px',
                            backgroundColor: 'var(--color-bg-light, #ECEFF3)',
                            border: '1px solid var(--border-color-neutral, #DFE3E8)',
                          }}
                        >
                          <span
                            className={styles.dataLabel}
                            style={{
                              display: 'block',
                              marginBottom: '8px',
                              color: 'var(--color-primary-teal-dark, #14505A)',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              fontSize: '11px',
                              letterSpacing: '0.03em',
                            }}
                          >
                            Evaluación Demográfica y Condiciones en Terreno
                          </span>

                          {/* Desglose individualizado por Familia / Hogar (cuando hay >1 o tiene referencia) */}
                          {evalNorm.familias &&
                            evalNorm.familias.length > 0 &&
                            (evalNorm.familias.length > 1 || Boolean(evalNorm.familias[0].referencia)) && (
                              <div
                                data-testid={`familias-listado-${reporte.id}`}
                                style={{
                                  marginBottom: '12px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '8px',
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    color: 'var(--color-charcoal-dark, #24272B)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                  }}
                                >
                                  <Home size={14} color="var(--color-primary-teal, #1B6F7D)" aria-hidden="true" />
                                  <span>
                                    {evalNorm.familias.length > 1
                                      ? `Desglose por Hogar / Familia (${evalNorm.familias.length} hogares evaluados)`
                                      : 'Hogar Evaluado en Terreno'}
                                  </span>
                                </span>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {evalNorm.familias.map((f, fIdx) => {
                                    const refLimpia = f.referencia ? f.referencia.trim() : '';
                                    const nombreFamilia = refLimpia
                                      ? refLimpia.toLowerCase().startsWith('familia')
                                        ? refLimpia
                                        : `Familia ${refLimpia}`
                                      : `Familia #${fIdx + 1}`;
                                    const textoCompromiso = formatearCompromisoVivienda(
                                      f.nivelCompromisoVivienda
                                    );
                                    const varianteCompromiso = obtenerVarianteCompromisoVivienda(
                                      f.nivelCompromisoVivienda
                                    );

                                    return (
                                      <div
                                        key={f.id || `fam-${fIdx}`}
                                        data-testid={`familia-item-${reporte.id}-${fIdx}`}
                                        style={{
                                          padding: '8px 12px',
                                          backgroundColor: 'var(--color-white, #FFFFFF)',
                                          border: '1px solid var(--border-color-neutral, #DFE3E8)',
                                          borderLeft: '4px solid var(--color-primary-teal, #1B6F7D)',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          gap: '6px',
                                        }}
                                      >
                                        <div
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            flexWrap: 'wrap',
                                            gap: '6px',
                                          }}
                                        >
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Users
                                              size={14}
                                              color="var(--color-primary-teal, #1B6F7D)"
                                              aria-hidden="true"
                                            />
                                            <strong
                                              style={{
                                                fontSize: '13px',
                                                color: 'var(--color-charcoal-dark, #24272B)',
                                              }}
                                            >
                                              {nombreFamilia}
                                            </strong>
                                          </div>

                                          <div
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '6px',
                                              flexWrap: 'wrap',
                                            }}
                                          >
                                            <Chip
                                              variant={varianteCompromiso}
                                              size="sm"
                                              title="Nivel de daño habitacional constatado"
                                            >
                                              {textoCompromiso}
                                            </Chip>
                                            {f.requiereAsistenciaSocial && (
                                              <Chip
                                                variant="warning"
                                                size="sm"
                                                icon={<HeartHandshake size={11} />}
                                                title="Familia vulnerable con derivación para levantamiento de Ficha Básica de Emergencia (FIBE)"
                                              >
                                                Requiere FIBE
                                              </Chip>
                                            )}
                                          </div>
                                        </div>

                                        <div
                                          style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            alignItems: 'center',
                                            gap: '6px 14px',
                                            fontSize: '12px',
                                            color: 'var(--color-charcoal, #3B3F45)',
                                          }}
                                        >
                                          <span>
                                            <strong>Integrantes:</strong> {f.nucleoFamiliarTotal ?? 0} pers.
                                          </span>
                                          {f.cantidadNinos !== undefined && f.cantidadNinos > 0 && (
                                            <span>
                                              <strong>Niños/Adolescentes:</strong> {f.cantidadNinos}
                                            </span>
                                          )}
                                          {f.cantidadAdultosMayores !== undefined &&
                                            f.cantidadAdultosMayores > 0 && (
                                              <span>
                                                <strong>Adultos mayores:</strong>{' '}
                                                {f.cantidadAdultosMayores}
                                              </span>
                                            )}
                                          {f.personasDiscapacitadas !== undefined &&
                                            f.personasDiscapacitadas > 0 && (
                                              <span>
                                                <strong>Discapacidad:</strong>{' '}
                                                {f.personasDiscapacitadas}
                                              </span>
                                            )}
                                          {f.personasElectrodependientes !== undefined &&
                                            f.personasElectrodependientes > 0 && (
                                              <span>
                                                <strong>Electrodependientes:</strong>{' '}
                                                {f.personasElectrodependientes}
                                              </span>
                                            )}
                                          {f.mascotasAfectadas !== undefined &&
                                            f.mascotasAfectadas > 0 && (
                                              <span>
                                                <strong>Mascotas:</strong> {f.mascotasAfectadas}
                                              </span>
                                            )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                          <span
                            className={styles.dataLabel}
                            style={{
                              display: 'block',
                              marginBottom: '6px',
                              color: 'var(--color-primary-teal-dark, #14505A)',
                              fontSize: '11px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.02em',
                            }}
                          >
                            Consolidado General de Afectación
                          </span>

                          <div className={styles.dataGrid}>
                            <div className={styles.dataItem}>
                              <span className={styles.dataLabel}>Núcleo Familiar / Personas</span>
                              <span className={styles.dataValue} style={{ fontWeight: 700 }}>
                                {evalNorm.nucleoFamiliarTotal ?? reporte.personasAfectadas}
                                {evalNorm.familiasAfectadas !== undefined
                                  ? ` (${evalNorm.familiasAfectadas} ${
                                      evalNorm.familiasAfectadas === 1 ? 'familia' : 'familias'
                                    })`
                                  : ''}
                              </span>
                            </div>

                            {evalNorm.cantidadNinos !== undefined && (
                              <div className={styles.dataItem}>
                                <span className={styles.dataLabel}>Niños, Niñas y Adolescentes</span>
                                <span className={styles.dataValue} style={{ fontWeight: 700 }}>
                                  {evalNorm.cantidadNinos}
                                </span>
                              </div>
                            )}

                            {evalNorm.cantidadAdultosMayores !== undefined && (
                              <div className={styles.dataItem}>
                                <span className={styles.dataLabel}>Adultos Mayores</span>
                                <span className={styles.dataValue} style={{ fontWeight: 700 }}>
                                  {evalNorm.cantidadAdultosMayores}
                                </span>
                              </div>
                            )}

                            {evalNorm.personasDiscapacitadas !== undefined && (
                              <div className={styles.dataItem}>
                                <span className={styles.dataLabel}>Personas con Discapacidad</span>
                                <span className={styles.dataValue} style={{ fontWeight: 700 }}>
                                  {evalNorm.personasDiscapacitadas}
                                </span>
                              </div>
                            )}

                            {evalNorm.personasElectrodependientes !== undefined && (
                              <div className={styles.dataItem}>
                                <span className={styles.dataLabel}>Electrodependientes</span>
                                <span className={styles.dataValue} style={{ fontWeight: 700 }}>
                                  {evalNorm.personasElectrodependientes}
                                </span>
                              </div>
                            )}

                            {evalNorm.mascotasAfectadas !== undefined && (
                              <div className={styles.dataItem}>
                                <span className={styles.dataLabel}>Mascotas Afectadas</span>
                                <span className={styles.dataValue} style={{ fontWeight: 700 }}>
                                  {evalNorm.mascotasAfectadas}
                                </span>
                              </div>
                            )}

                            {evalNorm.nivelCompromisoVivienda && (
                              <div className={styles.dataItem}>
                                <span className={styles.dataLabel}>Compromiso de Vivienda</span>
                                <span className={styles.dataValue} style={{ fontWeight: 700 }}>
                                  {formatearCompromisoVivienda(evalNorm.nivelCompromisoVivienda)}
                                  {evalNorm.viviendasAfectadas !== undefined
                                    ? ` (${evalNorm.viviendasAfectadas} ${
                                        evalNorm.viviendasAfectadas === 1 ? 'vivienda' : 'viviendas'
                                      })`
                                    : ''}
                                </span>
                              </div>
                            )}
                          </div>

                          {(riesgosLista.length > 0 ||
                            evalNorm.requiereEvacuacion ||
                            evalNorm.requiereAsistenciaSocial) && (
                            <div
                              style={{
                                marginTop: '10px',
                                paddingTop: '8px',
                                borderTop: '1px solid #CBD5E1',
                              }}
                            >
                              <span
                                className={styles.dataLabel}
                                style={{
                                  display: 'block',
                                  marginBottom: '6px',
                                  color: 'var(--color-primary-teal-dark, #14505A)',
                                }}
                              >
                                Peligros Activos y Requerimientos Operativos:
                              </span>
                              <div
                                style={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  gap: '6px',
                                }}
                              >
                                {evalNorm.requiereEvacuacion && (
                                  <Chip
                                    variant="danger"
                                    size="sm"
                                    icon={<AlertTriangle size={12} />}
                                  >
                                    Requiere Evacuación
                                  </Chip>
                                )}

                                {evalNorm.requiereAsistenciaSocial && (
                                  <Chip variant="danger" size="sm">
                                    Requiere Ficha FIBE
                                  </Chip>
                                )}

                                {riesgosLista.map((riesgo) => (
                                  <Chip key={riesgo} variant="warning" size="sm">
                                    {riesgo}
                                  </Chip>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {reporte.accionesRealizadas && (
                        <div>
                          <span className={styles.dataLabel}>Acciones Ejecutadas en el Sitio:</span>
                          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--color-text-dark, #2B2B2B)' }}>
                            {reporte.accionesRealizadas}
                          </p>
                        </div>
                      )}

                      {(!evalNorm || reporte.danosEstimados) && (
                        <div className={styles.dataGrid}>
                          {!evalNorm && (
                            <div className={styles.dataItem}>
                              <span className={styles.dataLabel}>Personas Afectadas</span>
                              <span className={styles.dataValue} style={{ fontWeight: 700 }}>
                                {reporte.personasAfectadas}
                              </span>
                            </div>
                          )}

                          <div className={styles.dataItem}>
                            <span className={styles.dataLabel}>Daños Estimados</span>
                            <span className={styles.dataValue}>
                              {reporte.danosEstimados || 'Sin daños mayores reportados'}
                            </span>
                          </div>
                        </div>
                      )}

                      {(reporte.observaciones || evalNorm?.detallesAdicionales) && (
                        <div>
                          <span className={styles.dataLabel}>Observaciones y Detalles Adicionales:</span>
                          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-text-muted, #5F676E)' }}>
                            {reporte.observaciones || evalNorm?.detallesAdicionales}
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
