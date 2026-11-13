'use client';

import React, { useState, useMemo } from 'react';
import {
  Eye,
  ShieldCheck,
  Users,
  AlertTriangle,
  Clock,
  ChevronDown,
  ClipboardCheck,
  FileText,
  SlidersHorizontal,
  Route,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';
import { DrawerSectionHeader } from './DrawerSectionHeader';
import type {
  IncidenteDetalle,
  ReporteEvaluacionTerreno,
} from '@/services/incidentesService';
import {
  formatearEstado,
  formatearPrioridad,
  formatearTipoMision,
  formatearCompromisoVivienda,
} from '@/lib/utils/estadoUtils';
import { obtenerVarianteChipEstadoMision } from '@/lib/utils/chipVariants';
import styles from '@/styles/mando.module.css';

interface IncidenteMisionesSectionProps {
  misiones: IncidenteDetalle['misiones'];
  reportesEvaluacionTerreno?: ReporteEvaluacionTerreno[];
  incidenteEstado?: string;
  onVerDetalleMision?: (misionId: string) => void;
  onVerReportesMision?: (misionId: string, reporteId?: string) => void;
  onAsignarPatrulla?: () => void;
  puedeAsignar?: boolean;
}

export const IncidenteMisionesSection: React.FC<IncidenteMisionesSectionProps> = ({
  misiones,
  reportesEvaluacionTerreno = [],
  incidenteEstado,
  onVerDetalleMision,
  onVerReportesMision,
  onAsignarPatrulla,
  puedeAsignar = true,
}) => {
  // Agrupar reportes de evaluación en terreno por misión (ordenados del más reciente al más antiguo)
  const reportesPorMision = useMemo(() => {
    const mapa = new Map<string, ReporteEvaluacionTerreno[]>();
    const ordenados = [...reportesEvaluacionTerreno].sort((a, b) => {
      const verA = Number(a.versionReporte ?? 0);
      const verB = Number(b.versionReporte ?? 0);
      if (verA !== verB) return verB - verA;
      return new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime();
    });

    for (const rep of ordenados) {
      const lista = mapa.get(rep.misionId) || [];
      lista.push(rep);
      mapa.set(rep.misionId, lista);
    }
    return mapa;
  }, [reportesEvaluacionTerreno]);
  const tieneVerificacionActiva = misiones.some(
    (m) =>
      m.tipoMision === 'VERIFICACION' &&
      ['PLANIFICADA', 'DESPACHADA', 'EN_CURSO'].includes(m.estado)
  );

  const mostrarBotonDespacho =
    incidenteEstado === 'REPORTADO' &&
    !tieneVerificacionActiva &&
    Boolean(onAsignarPatrulla) &&
    puedeAsignar;

  // 1. Separar misiones rechazadas vs misiones activas / vigentes
  const misionesRechazadas = misiones.filter(
    (m) => m.estado === 'RECHAZADA' || Boolean(m.justificacionRechazo)
  );

  const misionesActivas = misiones
    .filter((m) => !misionesRechazadas.some((r) => r.id === m.id))
    .sort((a, b) => {
      // Priorizar misiones en proceso al tope: EN_CURSO (0) > DESPACHADA (1) > PLANIFICADA (2) > COMPLETADA (3)
      const ordenEstado: Record<string, number> = {
        EN_CURSO: 0,
        DESPACHADA: 1,
        PLANIFICADA: 2,
        COMPLETADA: 3,
        CANCELADA: 4,
      };
      return (ordenEstado[a.estado] ?? 99) - (ordenEstado[b.estado] ?? 99);
    });

  // Si hay misiones en proceso, los rechazos inician colapsados para priorizar las activas.
  // Si no hay misiones en proceso, inician abiertos para visualización inmediata del motivo.
  const [rechazosAbiertos, setRechazosAbiertos] = useState<boolean>(
    misionesActivas.length === 0 && misionesRechazadas.length > 0
  );

  const formatFechaHora = (fechaIso?: string | null) => {
    if (!fechaIso) return null;
    try {
      const d = new Date(fechaIso);
      return d.toLocaleString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return null;
    }
  };

  const renderTarjetaMision = (
    mision: IncidenteDetalle['misiones'][number],
    esDentroDeRechazos = false
  ) => {
    const esRechazada = mision.estado === 'RECHAZADA' || Boolean(mision.justificacionRechazo);
    const fechaLegible = formatFechaHora(mision.fechaInicio || mision.creadoEn);

    return (
      <div
        key={mision.id}
        className={styles.misionCard}
        style={{
          border: esDentroDeRechazos ? '1px solid #DFE3E8' : undefined,
          borderLeft:
            esRechazada && !esDentroDeRechazos
              ? '4px solid var(--color-danger, #D32F2F)'
              : '1px solid #CBD5E1',
          backgroundColor: esRechazada ? '#FFFDFD' : 'var(--color-bg-light, #ECEFF3)',
          marginBottom: '0.6rem',
        }}
      >
        {/* Cabecera de la Tarjeta con Código, Título y Chip de Estado */}
        <div className={styles.misionHeader} style={{ alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', flex: 1 }}>
            <Chip variant="neutral" size="sm" title="Código correlativo de misión">
              {mision.codigo}
            </Chip>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-charcoal-dark, #24272B)' }}>
              {mision.titulo}
            </span>
          </div>

          {/* Chip de Estado Estilo SGRAI */}
          <Chip variant={obtenerVarianteChipEstadoMision(mision.estado)} size="sm">
            {formatearEstado(mision.estado)}
          </Chip>
        </div>

        {/* Metadatos Estructurados (Tipo, Prioridad, Fecha) */}
        <div
          style={{
            fontSize: '0.8125rem',
            marginTop: '0.35rem',
            color: 'var(--color-charcoal, #3B3F45)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          <span>
            <strong>Tipo:</strong> {formatearTipoMision(mision.tipoMision)}
          </span>
          <span>&bull;</span>
          <span>
            <strong>Prioridad:</strong> {formatearPrioridad(mision.prioridad)}
          </span>
          {fechaLegible && (
            <>
              <span>&bull;</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted, #5F676E)' }}>
                <Clock size={12} aria-hidden="true" />
                <span>{fechaLegible}</span>
              </span>
            </>
          )}
        </div>

        {/* Equipos Asignados */}
        {mision.patrulla && (
          <div
            style={{
              fontSize: '0.8125rem',
              marginTop: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--color-text-dark, #2B2B2B)',
            }}
          >
            <ShieldCheck size={14} color="var(--color-primary-teal, #1B6F7D)" aria-hidden="true" style={{ flexShrink: 0 }} />
            <span>
              <strong>Patrulla:</strong> {mision.patrulla.nombre}{' '}
              <span style={{ color: 'var(--color-text-muted, #5F676E)' }}>
                ({formatearEstado(mision.patrulla.estado)})
              </span>
            </span>
          </div>
        )}

        {mision.cuadrilla && (
          <div
            style={{
              fontSize: '0.8125rem',
              marginTop: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--color-text-dark, #2B2B2B)',
            }}
          >
            <Users size={14} color="var(--color-primary-teal, #1B6F7D)" aria-hidden="true" style={{ flexShrink: 0 }} />
            <span>
              <strong>Cuadrilla:</strong> {mision.cuadrilla.nombre}{' '}
              <span style={{ color: 'var(--color-text-muted, #5F676E)' }}>
                ({formatearEstado(mision.cuadrilla.estado)})
              </span>
            </span>
          </div>
        )}

        {/* Bloque Destacado de Rechazo de Misión */}
        {mision.justificacionRechazo && (
          <div
            style={{
              marginTop: '0.6rem',
              padding: '8px 10px',
              backgroundColor: 'var(--color-danger-bg, #FFEBEE)',
              border: '1px solid #FFCDD2',
              borderLeft: '3px solid var(--color-danger, #D32F2F)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
              <AlertTriangle size={14} color="var(--color-danger, #D32F2F)" aria-hidden="true" />
              <strong style={{ fontSize: '0.8125rem', color: 'var(--color-danger, #D32F2F)' }}>
                Motivo de Rechazo en Terreno:
              </strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-charcoal, #3B3F45)' }}>
              {mision.justificacionRechazo}
            </p>
          </div>
        )}

        {/* Acceso Directo al Último Reporte de Terreno y a Todos los Reportes de la Misión (HU-38) */}
        {(() => {
          const reportesMision = reportesPorMision.get(mision.id) || [];
          if (reportesMision.length === 0) return null;

          const ultimoReporte = reportesMision[0];
          const numVersion = Number(ultimoReporte.versionReporte || reportesMision.length);
          const esRectificacion = Boolean(
            ultimoReporte.esRectificacion || numVersion > 1
          );
          const etiquetaUltimo = esRectificacion
            ? `Reporte #${numVersion} — Rectificación Vigente`
            : 'Reporte #1 — Evaluación Inicial';

          const prioridadAjustadaManual = Boolean(
            (ultimoReporte.prioridadSugerida &&
              ultimoReporte.prioridadAsignada &&
              ultimoReporte.prioridadSugerida !== ultimoReporte.prioridadAsignada) ||
              ultimoReporte.justificacionPrioridad
          );

          const evalData = (ultimoReporte.evaluacion || {}) as Record<string, unknown>;
          const familiasRaw = Array.isArray(evalData.familias)
            ? (evalData.familias as Record<string, unknown>[])
            : undefined;
          const familiasCount =
            familiasRaw && familiasRaw.length > 0
              ? familiasRaw.length
              : typeof evalData.familiasAfectadas === 'number'
                ? evalData.familiasAfectadas
                : undefined;
          const nucleoTotal =
            typeof evalData.nucleoFamiliarTotal === 'number'
              ? evalData.nucleoFamiliarTotal
              : ultimoReporte.personasAfectadas;
          const ninos =
            typeof evalData.cantidadNinos === 'number' ? evalData.cantidadNinos : undefined;
          const adultosMayores =
            typeof evalData.cantidadAdultosMayores === 'number'
              ? evalData.cantidadAdultosMayores
              : undefined;
          const discapacitados =
            typeof evalData.personasDiscapacitadas === 'number'
              ? evalData.personasDiscapacitadas
              : undefined;
          const mascotas =
            typeof evalData.mascotasAfectadas === 'number'
              ? evalData.mascotasAfectadas
              : undefined;
          const compromisoViv =
            typeof evalData.nivelCompromisoVivienda === 'string'
              ? evalData.nivelCompromisoVivienda
              : undefined;

          const handleIrAUltimoReporte = () => {
            if (onVerReportesMision) {
              onVerReportesMision(mision.id, ultimoReporte.id);
            } else {
              onVerDetalleMision?.(mision.id);
            }
          };

          const handleIrATodosLosReportes = () => {
            if (onVerReportesMision) {
              onVerReportesMision(mision.id);
            } else {
              onVerDetalleMision?.(mision.id);
            }
          };

          return (
            <div
              data-testid={`ultimo-reporte-mision-${mision.id}`}
              style={{
                marginTop: '0.65rem',
                padding: '10px 12px',
                backgroundColor: 'var(--color-white, #FFFFFF)',
                border: '1px solid var(--border-color-neutral, #DFE3E8)',
                borderLeft: '3px solid var(--color-primary-teal, #1B6F7D)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginBottom: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ClipboardCheck
                    size={14}
                    color="var(--color-primary-teal, #1B6F7D)"
                    aria-hidden="true"
                  />
                  <strong
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-primary-teal-dark, #14505A)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px',
                    }}
                  >
                    Último Reporte Realizado: {etiquetaUltimo}
                  </strong>
                </div>

                {formatFechaHora(ultimoReporte.creadoEn) && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--color-text-muted, #5F676E)',
                    }}
                  >
                    {formatFechaHora(ultimoReporte.creadoEn)}
                  </span>
                )}
              </div>

              {/* Comparativa de Prioridad Sugerida vs Asignada */}
              {(ultimoReporte.prioridadSugerida || ultimoReporte.prioridadAsignada) && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    fontSize: '0.78rem',
                    marginBottom: '6px',
                    color: 'var(--color-charcoal, #3B3F45)',
                  }}
                >
                  {ultimoReporte.prioridadSugerida && (
                    <span>
                      <strong>Prioridad sugerida:</strong>{' '}
                      {formatearPrioridad(ultimoReporte.prioridadSugerida)}
                    </span>
                  )}
                  {ultimoReporte.prioridadAsignada && (
                    <span>
                      <strong>Prioridad confirmada:</strong>{' '}
                      <span
                        style={{
                          fontWeight: 700,
                          color: prioridadAjustadaManual
                            ? 'var(--color-warning, #E65100)'
                            : 'var(--color-primary-teal-dark, #14505A)',
                        }}
                      >
                        {formatearPrioridad(ultimoReporte.prioridadAsignada)}
                      </span>
                    </span>
                  )}
                </div>
              )}

              {ultimoReporte.justificacionPrioridad && (
                <p
                  style={{
                    margin: '0 0 6px 0',
                    fontSize: '0.78rem',
                    color: 'var(--color-charcoal, #3B3F45)',
                    backgroundColor: 'var(--color-warning-bg, #FFF3E0)',
                    padding: '4px 8px',
                    borderLeft: '2px solid var(--color-warning, #E65100)',
                  }}
                >
                  <SlidersHorizontal
                    size={11}
                    style={{ marginRight: '4px', verticalAlign: 'middle' }}
                    aria-hidden="true"
                  />
                  <strong>Justificación prioridad:</strong> {ultimoReporte.justificacionPrioridad}
                </p>
              )}

              {/* Resumen demográfico rápido */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  fontSize: '0.75rem',
                  color: 'var(--color-charcoal, #3B3F45)',
                  marginBottom: '6px',
                }}
              >
                {familiasCount !== undefined && (
                  <span>
                    <strong>Hogares:</strong> {familiasCount}{' '}
                    {familiasCount === 1 ? 'familia' : 'familias'}
                  </span>
                )}
                <span>
                  <strong>Núcleo familiar:</strong> {nucleoTotal} pers.
                </span>
                {ninos !== undefined && (
                  <span>
                    <strong>Niños:</strong> {ninos}
                  </span>
                )}
                {adultosMayores !== undefined && (
                  <span>
                    <strong>Adultos mayores:</strong> {adultosMayores}
                  </span>
                )}
                {discapacitados !== undefined && (
                  <span>
                    <strong>Discapacidad:</strong> {discapacitados}
                  </span>
                )}
                {mascotas !== undefined && (
                  <span>
                    <strong>Mascotas:</strong> {mascotas}
                  </span>
                )}
                {compromisoViv && (
                  <span>
                    <strong>Vivienda:</strong> {formatearCompromisoVivienda(compromisoViv)}
                  </span>
                )}
              </div>

              {/* Detalle compacto de familias si hay desglose */}
              {familiasRaw &&
                familiasRaw.length > 0 &&
                (familiasRaw.length > 1 || Boolean(familiasRaw[0].referencia)) && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '4px',
                      marginBottom: '6px',
                    }}
                  >
                    {familiasRaw.map((f, fIdx) => {
                      const refLimpia = typeof f.referencia === 'string' ? f.referencia.trim() : '';
                      const nombre = refLimpia
                        ? refLimpia.toLowerCase().startsWith('fam')
                          ? refLimpia
                          : `Fam. ${refLimpia}`
                        : `Fam. #${fIdx + 1}`;
                      const pers =
                        typeof f.nucleoFamiliarTotal === 'number'
                          ? `${f.nucleoFamiliarTotal}p`
                          : '';
                      const comp =
                        typeof f.nivelCompromisoVivienda === 'string'
                          ? formatearCompromisoVivienda(f.nivelCompromisoVivienda)
                          : '';
                      return (
                        <span
                          key={fIdx}
                          style={{
                            fontSize: '0.72rem',
                            backgroundColor: 'var(--color-bg-light, #ECEFF3)',
                            padding: '2px 6px',
                            border: '1px solid #DFE3E8',
                            borderRadius: '0px',
                            color: 'var(--color-charcoal-dark, #24272B)',
                          }}
                        >
                          <strong>{nombre}:</strong> {[pers, comp].filter(Boolean).join(' · ')}
                          {Boolean(f.requiereAsistenciaSocial) && ' (FIBE)'}
                        </span>
                      );
                    })}
                  </div>
                )}

              {ultimoReporte.resumenTecnico &&
                !/^\s*Evaluaci[oó]n en Terreno #\d+/i.test(ultimoReporte.resumenTecnico) && (
                  <p
                    style={{
                      margin: '0 0 8px 0',
                      fontSize: '0.78rem',
                      color: 'var(--color-text-dark, #2B2B2B)',
                      lineHeight: 1.35,
                    }}
                  >
                    {ultimoReporte.resumenTecnico}
                  </p>
                )}

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  justifyContent: 'flex-end',
                }}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleIrAUltimoReporte}
                  title={`Abrir directamente el último reporte realizado de la misión ${mision.codigo}`}
                  aria-label={`Ver último reporte de la misión ${mision.codigo}`}
                >
                  <FileText size={12} aria-hidden="true" style={{ marginRight: '4px' }} />
                  <span>Ver Último Reporte</span>
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleIrATodosLosReportes}
                  title={`Ver todos los reportes de terreno (${reportesMision.length}) en el detalle de la misión ${mision.codigo}`}
                  aria-label={`Ver todos los reportes de la misión ${mision.codigo}`}
                >
                  <ClipboardCheck size={12} aria-hidden="true" style={{ marginRight: '4px' }} />
                  <span>
                    {reportesMision.length > 1
                      ? `Ver Todos los Reportes (${reportesMision.length})`
                      : 'Ver Reportes en Misión (1)'}
                  </span>
                </Button>
              </div>
            </div>
          );
        })()}

        {/* Acción de Detalle */}
        <div style={{ marginTop: '0.6rem', display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onVerDetalleMision?.(mision.id)}
            title={`Ver detalles completos de la misión ${mision.codigo}`}
            aria-label={`Ver detalles de la misión ${mision.codigo}`}
          >
            <Eye size={13} aria-hidden="true" style={{ marginRight: '4px' }} />
            <span>Ver Detalles</span>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.drawerSection}>
      <DrawerSectionHeader
        icono={<Route size={18} />}
        titulo={`Misiones y Equipos en Terreno (${misiones.length})`}
      />

      {mostrarBotonDespacho && (
        <div
          style={{
            backgroundColor: '#F8FAFB',
            border: '1px solid var(--border-color-neutral, #DFE3E8)',
            padding: '12px 14px',
            borderRadius: 0,
            marginBottom: misiones.length > 0 ? '1rem' : '0',
          }}
        >
          <p
            style={{
              color: 'var(--color-text-dark, #2B2B2B)',
              fontSize: '0.85rem',
              margin: '0 0 10px 0',
            }}
          >
            Este incidente está pendiente de evaluación inicial. Despache una patrulla disponible para verificar en terreno las necesidades reales.
          </p>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onAsignarPatrulla}
            title="Despachar patrulla verificadora"
          >
            <ShieldCheck size={14} style={{ marginRight: '5px' }} />
            <span>Despachar Patrulla Verificadora</span>
          </Button>
        </div>
      )}

      {misiones.length === 0 && !mostrarBotonDespacho && (
        <p style={{ color: 'var(--color-text-muted, #5F676E)', fontSize: '0.85rem', margin: 0 }}>
          No se han despachado misiones operativas para este caso.
        </p>
      )}

      {/* 1. Misiones Activas y en Proceso (priorizadas al inicio de la lista) */}
      {misionesActivas.map((mision) => renderTarjetaMision(mision))}

      {/* 2. Menú Desplegable Agrupado de Misiones Rechazadas */}
      {misionesRechazadas.length > 0 && (
        <div className={styles.rechazosContainer}>
          <button
            type="button"
            className={styles.rechazosTrigger}
            onClick={() => setRechazosAbiertos(!rechazosAbiertos)}
            aria-expanded={rechazosAbiertos}
            aria-label={`${rechazosAbiertos ? 'Colapsar' : 'Desplegar'} misiones rechazadas (${misionesRechazadas.length})`}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} color="var(--color-danger, #D32F2F)" aria-hidden="true" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-danger, #D32F2F)' }}>
                Misiones Rechazadas en Terreno ({misionesRechazadas.length})
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #5F676E)' }}>
                {rechazosAbiertos ? 'Ocultar' : 'Ver motivos'}
              </span>
              <ChevronDown
                size={16}
                color="var(--color-danger, #D32F2F)"
                className={rechazosAbiertos ? styles.chevronRotated : ''}
                aria-hidden="true"
              />
            </div>
          </button>

          {rechazosAbiertos && (
            <div className={styles.rechazosBody}>
              {misionesRechazadas.map((mision) => renderTarjetaMision(mision, true))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

