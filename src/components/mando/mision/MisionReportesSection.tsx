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
  Ban,
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
  calcularComparativaPersonasAfectadas,
  esJustificacionSinCambios,
  esReporteVerificacionCierre,
  formatearDictamenTerreno,
  formatearEstado,
  formatearNombrePatrulla,
  formatearPrioridad,
  formatearCompromisoVivienda,
  fueTipologiaModificada,
  obtenerVarianteCompromisoVivienda,
} from '@/lib/utils/estadoUtils';
import { obtenerVarianteChipDictamen } from '@/lib/utils/chipVariants';
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

interface ReporteCardShellProps {
  toggleId: string;
  testId: string;
  reportId: string;
  estaAbierto: boolean;
  onToggle: () => void;
  ariaLabel: string;
  icono: React.ReactNode;
  autorNombre: string;
  autorSubtitulo?: string | null;
  fechaFormateada: string;
  chips: React.ReactNode;
  borderLeftColor?: string;
  esDestacado?: boolean;
  children: React.ReactNode;
}

const ReporteCardShell: React.FC<ReporteCardShellProps> = ({
  toggleId,
  testId,
  reportId,
  estaAbierto,
  onToggle,
  ariaLabel,
  icono,
  autorNombre,
  autorSubtitulo,
  fechaFormateada,
  chips,
  borderLeftColor,
  esDestacado = false,
  children,
}) => {
  const cardStyle: React.CSSProperties | undefined = esDestacado
    ? {
        borderLeft: '4px solid var(--color-primary-teal, #1B6F7D)',
        borderColor: 'var(--color-primary-teal, #1B6F7D)',
      }
    : borderLeftColor
      ? { borderLeft: `4px solid ${borderLeftColor}` }
      : undefined;

  return (
    <div
      className={styles.reporteCard}
      data-testid={testId}
      data-report-id={reportId}
      style={cardStyle}
    >
      <button
        type="button"
        className={styles.reporteHeaderTrigger}
        data-testid={`toggle-reporte-${toggleId}`}
        onClick={onToggle}
        aria-expanded={estaAbierto}
        aria-label={ariaLabel}
      >
        <div className={styles.reporteHeaderTop}>
          <div className={styles.evaluadorInfo}>
            {icono}
            <div>
              <span className={styles.evaluadorNombre}>{autorNombre}</span>
              {autorSubtitulo && (
                <>
                  {' '}
                  <span className={styles.evaluadorRut}>{autorSubtitulo}</span>
                </>
              )}
            </div>
          </div>

          <div className={styles.reporteHeaderRight}>
            {fechaFormateada && (
              <span
                style={{
                  fontSize: '12px',
                  color: 'var(--color-text-muted, #5F676E)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Clock size={12} aria-hidden="true" />
                <span>{fechaFormateada}</span>
              </span>
            )}

            <span
              className={`${styles.reporteChevron} ${
                estaAbierto ? styles.reporteChevronExpanded : ''
              }`}
            >
              <ChevronDown size={18} aria-hidden="true" />
            </span>
          </div>
        </div>

        <div className={styles.reporteMetaTags}>{chips}</div>
      </button>

      {estaAbierto && <div className={styles.reporteBody}>{children}</div>}
    </div>
  );
};

export const MisionReportesSection: React.FC<MisionReportesSectionProps> = ({
  reportes,
  bitacora = [],
  patrulla,
  incidente,
  reporteDestacadoId,
  seccionRef,
}) => {
  const [desplegados, setDesplegados] = useState<Record<string, boolean>>({});

  // Ordenar reportes dejando la versión más reciente primero (vigente) y priorizando VERIFICACION_CIERRE al cierre
  const reportesOrdenados = useMemo(() => {
    if (reportes.length <= 1) return reportes;
    return [...reportes].sort((a, b) => {
      const cierreA = esReporteVerificacionCierre(a) ? 1 : 0;
      const cierreB = esReporteVerificacionCierre(b) ? 1 : 0;
      if (cierreA !== cierreB) return cierreB - cierreA;
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

  const itemsUnificados = useMemo(() => {
    type ItemUnificado =
      | { kind: 'reclasificacion'; id: string; timestamp: number }
      | { kind: 'terreno'; id: string; timestamp: number; reporte: ReporteTerrenoDetalle };

    const lista: ItemUnificado[] = reportesOrdenados.map((r) => ({
      kind: 'terreno',
      id: r.id,
      timestamp: new Date(r.creadoEn).getTime() || 0,
      reporte: r,
    }));

    if (hitoReclasificacion) {
      const tsHito =
        new Date(hitoReclasificacion.timestamp).getTime() ||
        new Date(`${hitoReclasificacion.fecha}T${hitoReclasificacion.hora}`).getTime() ||
        0;
      lista.push({
        kind: 'reclasificacion',
        id: 'verificacion-terreno',
        timestamp: tsHito,
      });
    }

    return lista.sort((a, b) => b.timestamp - a.timestamp);
  }, [reportesOrdenados, hitoReclasificacion]);

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
        {totalInformes > 1 && (
          <Chip variant="teal" size="sm">
            {totalInformes} versiones registradas
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
            {itemsUnificados.map((item, idxUnificado) => {
              const esMasReciente = idxUnificado === 0;

              if (item.kind === 'reclasificacion' && hitoReclasificacion) {
                const tipoFinal = tipoNuevoMeta || incidente?.tipoAfectacion || '';
                const sinCambios = tipoAnteriorMeta
                  ? !fueTipologiaModificada(tipoAnteriorMeta, tipoFinal)
                  : esJustificacionSinCambios(
                      justificacionExtraida || hitoReclasificacion.descripcion
                    );
                const fechaHitoFormateada = formatFecha(
                  hitoReclasificacion.timestamp ||
                    `${hitoReclasificacion.fecha}T${hitoReclasificacion.hora}`
                );

                return (
                  <ReporteCardShell
                    key={item.id}
                    toggleId="verificacion-terreno"
                    testId="reporte-verificacion-reclasificacion"
                    reportId={
                      hitoReclasificacion.id
                        ? `reclasificacion-${hitoReclasificacion.id}`
                        : 'verificacion-terreno'
                    }
                    estaAbierto={estaVerificacionAbierta}
                    onToggle={() =>
                      toggleDesplegable('verificacion-terreno', estaVerificacionAbierta)
                    }
                    ariaLabel={`${estaVerificacionAbierta ? 'Colapsar' : 'Desplegar'} informe de evaluación en terreno`}
                    icono={<ShieldCheck size={16} color="var(--color-primary-teal, #1B6F7D)" />}
                    autorNombre={formatearNombrePatrulla(patrulla?.nombre)}
                    autorSubtitulo={patrulla?.lider ? `(Líder: ${patrulla.lider.nombre})` : null}
                    fechaFormateada={fechaHitoFormateada}
                    borderLeftColor="var(--color-primary-teal, #1B6F7D)"
                    esDestacado={esDestacadoReclasificacion}
                    chips={
                      <>
                        <Chip
                          variant="teal"
                          size="sm"
                          title="Constatación técnica presencial realizada por patrulla verificadora"
                        >
                          Evaluación en Terreno Realizada
                        </Chip>
                        {totalInformes > 1 && (
                          <Chip variant={esMasReciente ? 'solid-teal' : 'neutral'} size="sm">
                            {esMasReciente ? 'Vigente' : 'Histórico'}
                          </Chip>
                        )}
                        <Chip variant={sinCambios ? 'success' : 'teal'} size="sm">
                          {sinCambios ? 'Tipología sin cambios' : 'Tipología reclasificada'}
                        </Chip>
                      </>
                    }
                  >
                    <div>
                      <span className={styles.dataLabel}>
                        Diagnóstico Técnico y Tipología Constatada:
                      </span>
                      <p
                        style={{
                          margin: '4px 0 0 0',
                          fontSize: '15px',
                          fontWeight: 700,
                          color: 'var(--color-primary-teal-dark, #14505A)',
                        }}
                      >
                        {sinCambios && tipoFinal
                          ? `${tipoFinal} (confirmada sin modificaciones por la patrulla)`
                          : tipoAnteriorMeta
                            ? `${tipoAnteriorMeta} → ${tipoFinal || 'Tipología reclasificada en terreno'}`
                            : tipoFinal || 'Tipología reclasificada en terreno'}
                      </p>
                    </div>

                    <div>
                      <span className={styles.dataLabel}>
                        Justificación y Constatación Presencial:
                      </span>
                      <p
                        style={{
                          margin: '4px 0 0 0',
                          fontSize: '14px',
                          color: 'var(--color-text-dark, #2B2B2B)',
                          lineHeight: 1.4,
                        }}
                      >
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
                  </ReporteCardShell>
                );
              }

              const reporte = (item as { kind: 'terreno'; reporte: ReporteTerrenoDetalle }).reporte;
              const idx = reportesOrdenados.findIndex((r) => r.id === reporte.id);
              const estaAbierto =
                desplegados[reporte.id] ?? (idAbiertoPorDefecto === reporte.id);
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
              const esCierre = esReporteVerificacionCierre(reporte);
              const comparativaPersonas = esCierre
                ? calcularComparativaPersonasAfectadas(reporte, reportesOrdenados)
                : null;
              const requiereFibeCierre = Boolean(
                reporte.requiereAsistenciaSocial ?? evalNorm?.requiereAsistenciaSocial
              );
              const hogaresCount =
                evalNorm?.familias && evalNorm.familias.length > 0
                  ? evalNorm.familias.length
                  : evalNorm?.familiasAfectadas;

              const borderLeftColor = esCierre
                ? reporte.dictamen === 'NO_ABORDABLE'
                  ? 'var(--color-danger, #D32F2F)'
                  : 'var(--color-accent-mint, #4FAE9B)'
                : prioridadModificada
                  ? 'var(--color-warning, #E65100)'
                  : 'var(--color-accent-mint, #4FAE9B)';

              return (
                <ReporteCardShell
                  key={reporte.id}
                  toggleId={reporte.id}
                  testId={
                    esCierre
                      ? `reporte-verificacion-cierre-${reporte.id}`
                      : `reporte-terreno-card-${reporte.id}`
                  }
                  reportId={reporte.id}
                  estaAbierto={estaAbierto}
                  onToggle={() => toggleDesplegable(reporte.id, estaAbierto)}
                  ariaLabel={`${estaAbierto ? 'Colapsar' : 'Desplegar'} informe técnico de ${reporte.evaluador.nombre}`}
                  icono={<User size={16} color="var(--color-primary-teal, #1B6F7D)" />}
                  autorNombre={reporte.evaluador.nombre}
                  autorSubtitulo={
                    reporte.evaluador.rut
                      ? `(RUT: ${reporte.evaluador.rut})`
                      : `(${reporte.evaluador.email})`
                  }
                  fechaFormateada={formatFecha(reporte.creadoEn)}
                  borderLeftColor={borderLeftColor}
                  esDestacado={esDestacado}
                  chips={
                    <>
                      {esCierre ? (
                        <>
                          <Chip variant="teal" size="sm">
                            {reporte.etiquetaReporte || 'Informe de Verificación y Cierre'}
                          </Chip>
                          {reporte.dictamen && (
                            <Chip
                              data-testid={`badge-dictamen-${reporte.id}`}
                              variant={obtenerVarianteChipDictamen(reporte.dictamen)}
                              size="sm"
                            >
                              Dictamen: {formatearDictamenTerreno(reporte.dictamen)}
                            </Chip>
                          )}
                        </>
                      ) : (
                        tieneEvaluacionPrioridad && (
                          <Chip variant={esRectificacion ? 'teal' : 'neutral'} size="sm">
                            {etiquetaVersion}
                          </Chip>
                        )
                      )}

                      {totalInformes > 1 && (
                        <Chip variant={esMasReciente ? 'solid-teal' : 'neutral'} size="sm">
                          {esMasReciente ? 'Vigente' : 'Histórico'}
                        </Chip>
                      )}

                      {!esCierre && hogaresCount ? (
                        <Chip variant="neutral" size="sm" title="Familias / Hogares evaluados en terreno">
                          {hogaresCount} {hogaresCount === 1 ? 'hogar' : 'hogares'}
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
                    </>
                  }
                >
                  {esCierre ? (
                    <>
                      {(reporte.dictamen === 'NO_ABORDABLE' || Boolean(reporte.motivoNoAbordable)) && (
                        <div
                          data-testid={`motivo-no-abordable-${reporte.id}`}
                          style={{
                            padding: '10px 12px',
                            backgroundColor: 'var(--color-danger-bg, #FFEBEE)',
                            border: '1px solid #FFCDD2',
                            borderLeft: '4px solid var(--color-danger, #D32F2F)',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              marginBottom: '4px',
                            }}
                          >
                            <Ban size={14} color="var(--color-danger, #D32F2F)" aria-hidden="true" />
                            <strong
                              style={{
                                fontSize: '13px',
                                color: 'var(--color-danger, #D32F2F)',
                              }}
                            >
                              Declaración Fundada de No Abordabilidad
                            </strong>
                          </div>
                          <p
                            style={{
                              margin: 0,
                              fontSize: '13px',
                              color: 'var(--color-text-dark, #2B2B2B)',
                              lineHeight: 1.4,
                            }}
                          >
                            {reporte.motivoNoAbordable ||
                              'Motivo de no abordabilidad registrado en terreno.'}
                          </p>
                        </div>
                      )}

                      {reporte.resumenTecnico && (
                        <div>
                          <span className={styles.dataLabel}>
                            Diagnóstico y Resumen Técnico del Siniestro:
                          </span>
                          <p
                            style={{
                              margin: '4px 0 0 0',
                              fontSize: '14px',
                              color: 'var(--color-text-dark, #2B2B2B)',
                              lineHeight: 1.45,
                            }}
                          >
                            {reporte.resumenTecnico}
                          </p>
                        </div>
                      )}

                      <div
                        data-testid={`datos-verificacion-cierre-${reporte.id}`}
                        style={{
                          padding: '10px 12px',
                          backgroundColor: 'var(--color-bg-light, #ECEFF3)',
                          border: '1px solid var(--border-color-neutral, #DFE3E8)',
                        }}
                      >
                        <div className={styles.dataGrid}>
                          <div className={styles.dataItem}>
                            <span className={styles.dataLabel}>Personas Damnificadas</span>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                flexWrap: 'wrap',
                                marginTop: '2px',
                              }}
                            >
                              <span className={styles.dataValue} style={{ fontWeight: 700 }}>
                                {reporte.personasAfectadas}
                              </span>
                              {comparativaPersonas?.fueModificado ? (
                                <Chip
                                  variant="warning"
                                  size="sm"
                                  data-testid="badge-personas-modificadas"
                                  title="La cantidad de personas afectadas fue actualizada al cerrar la verificación respecto a la evaluación de prioridad"
                                >
                                  {comparativaPersonas.personasPrevias !== null
                                    ? `Modificado respecto a prioridad (Antes: ${comparativaPersonas.personasPrevias})`
                                    : 'Modificado al cierre'}
                                </Chip>
                              ) : comparativaPersonas && comparativaPersonas.personasPrevias !== null ? (
                                <span
                                  style={{
                                    fontSize: '12px',
                                    color: 'var(--color-text-muted, #5F676E)',
                                  }}
                                >
                                  (Rescatado del reporte de prioridad sin cambios)
                                </span>
                              ) : null}
                            </div>
                          </div>

                          <div className={styles.dataItem}>
                            <span className={styles.dataLabel}>Daños Materiales Estimados</span>
                            <span className={styles.dataValue}>
                              {reporte.danosEstimados || 'Sin daños materiales adicionales especificados'}
                            </span>
                          </div>

                          <div className={styles.dataItem}>
                            <span className={styles.dataLabel}>Asistencia Social (Ficha FIBE)</span>
                            <div style={{ marginTop: '2px' }}>
                              <Chip
                                variant={requiereFibeCierre ? 'warning' : 'neutral'}
                                size="sm"
                                icon={<HeartHandshake size={12} />}
                                data-testid="chip-fibe-verificacion-cierre"
                              >
                                {requiereFibeCierre ? 'Requiere Ficha FIBE' : 'No requiere Ficha FIBE'}
                              </Chip>
                            </div>
                          </div>
                        </div>
                      </div>

                      {(reporte.observaciones || evalNorm?.detallesAdicionales) && (
                        <div>
                          <span className={styles.dataLabel}>Observaciones Generales:</span>
                          <p
                            style={{
                              margin: '4px 0 0 0',
                              fontSize: '13px',
                              color: 'var(--color-text-muted, #5F676E)',
                              lineHeight: 1.4,
                            }}
                          >
                            {reporte.observaciones || evalNorm?.detallesAdicionales}
                          </p>
                        </div>
                      )}

                      {/* Galería de Evidencias */}
                      <MisionEvidenciasGallery adjuntos={reporte.adjuntos} />
                    </>
                  ) : (
                    <>
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

                          {(riesgosLista.length > 0 || evalNorm.requiereEvacuacion) && (
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
                    </>
                  )}
                </ReporteCardShell>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
