'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { AlertTriangle, ShieldAlert, FileQuestion, Paperclip } from 'lucide-react';
import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import { getSocket } from '@/lib/socket/client';
import {
  obtenerDetalleMision,
  DEFAULT_ENCARGADO_ID,
} from '@/services/misionesService';
import {
  esPayloadAdjuntoCreadoValido,
  type AdjuntoEvidencia,
  type DictamenAtencionTerreno,
  type MisionDetalleCompleto,
  type ReporteTerrenoDetalle,
} from '@/types/misiones';
import { esReporteVerificacionCierre } from '@/lib/utils/estadoUtils';
import { MisionSkeletonLoader } from './MisionSkeletonLoader';
import { MisionDetalleHeader } from './MisionDetalleHeader';
import { MisionContextoSection } from './MisionContextoSection';
import { MisionEquipoSection } from './MisionEquipoSection';
import { MisionBitacoraSection } from './MisionBitacoraSection';
import { MisionReportesSection } from './MisionReportesSection';
import { MisionEvidenciasGallery } from './MisionEvidenciasGallery';
import styles from '@/styles/mision-detalle.module.css';

interface MisionDetalleModalProps {
  misionId: string | null;
  userId?: string;
  enfocarReportes?: boolean;
  reporteDestacadoId?: string | null;
  onCerrar: () => void;
}

export const MisionDetalleModal: React.FC<MisionDetalleModalProps> = ({
  misionId,
  userId = DEFAULT_ENCARGADO_ID,
  enfocarReportes = false,
  reporteDestacadoId = null,
  onCerrar,
}) => {
  const [mision, setMision] = useState<MisionDetalleCompleto | null>(null);
  const [cargando, setCargando] = useState<boolean>(Boolean(misionId));
  const [error, setError] = useState<string | null>(null);
  const [codigoError, setCodigoError] = useState<number | undefined>(undefined);
  const seccionReportesRef = useRef<HTMLDivElement | null>(null);
  const misionRef = useRef<MisionDetalleCompleto | null>(null);

  useEffect(() => {
    misionRef.current = mision;
  }, [mision]);

  useEffect(() => {
    let activo = true;
    if (!misionId) return;

    queueMicrotask(() => {
      if (!activo) return;
      setCargando(true);
      setError(null);
      setCodigoError(undefined);
    });

    void (async () => {
      const res = await obtenerDetalleMision(misionId, userId);
      if (!activo) return;

      if (res.exito && res.datos) {
        setMision(res.datos);
      } else {
        setError(res.mensaje);
        setCodigoError(res.codigoError);
      }
      setCargando(false);
    })();

    return () => {
      activo = false;
    };
  }, [misionId, userId]);

  // Hacer scroll automático hacia la tarjeta del reporte destacado o la sección de reportes
  useEffect(() => {
    if (!cargando && mision && (enfocarReportes || reporteDestacadoId)) {
      const timer = setTimeout(() => {
        if (!seccionReportesRef.current) return;
        const targetEl = reporteDestacadoId
          ? (seccionReportesRef.current.querySelector(
              `[data-report-id="${reporteDestacadoId}"]`
            ) as HTMLElement | null) ||
            (reporteDestacadoId.startsWith('reclasificacion-')
              ? (seccionReportesRef.current.querySelector(
                  '[data-testid="reporte-verificacion-reclasificacion"]'
                ) as HTMLElement | null)
              : null)
          : null;

        const elemToScroll = targetEl || seccionReportesRef.current;
        if (typeof elemToScroll.scrollIntoView === 'function') {
          elemToScroll.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [cargando, mision, enfocarReportes, reporteDestacadoId]);

  // Sincronización en tiempo real de nuevos reportes, rectificaciones, rechazo y adjuntos de la misión abierta
  useEffect(() => {
    if (!misionId) return;

    let activo = true;
    const socket = getSocket();

    const asegurarSalasEncargado = () => {
      socket.emit('join', 'encargado');
      socket.emit('unirse', 'sala:encargados');
    };

    if (!socket.connected && typeof socket.connect === 'function') {
      socket.connect();
    }
    if (socket.connected) {
      asegurarSalasEncargado();
    }

    const handleAdjuntoCreado = (rawPayload: unknown) => {
      const p = rawPayload as Record<string, unknown> | null | undefined;
      const candidato = (p?.datos || p?.data || rawPayload) as unknown;
      if (!esPayloadAdjuntoCreadoValido(candidato)) return;

      const misionActual = misionRef.current;
      if (!misionActual || misionActual.id !== misionId) return;

      const nuevoAdjunto: AdjuntoEvidencia = {
        id: candidato.id,
        nombreArchivo: candidato.nombreArchivo,
        url: candidato.url,
        tipoMime: candidato.tipoMime,
        tamanoBytes: candidato.tamanoBytes,
        creadoEn: candidato.creadoEn,
      };

      const pertenecePorReporte = Boolean(
        candidato.reporteTerrenoId &&
          (misionActual.reportesTerreno || []).some(
            (r) => r.id === candidato.reporteTerrenoId
          )
      );
      const pertenecePorIncidente = Boolean(
        candidato.incidenteId && misionActual.incidente?.id === candidato.incidenteId
      );
      const pertenecePorMision = Boolean(
        candidato.misionId && candidato.misionId === misionActual.id
      );

      if (pertenecePorReporte) {
        setMision((prev) => {
          if (!prev || prev.id !== misionId) return prev;
          return {
            ...prev,
            reportesTerreno: prev.reportesTerreno.map((rep) => {
              if (rep.id !== candidato.reporteTerrenoId) return rep;
              if (rep.adjuntos.some((a) => a.id === nuevoAdjunto.id)) return rep;
              return {
                ...rep,
                adjuntos: [...rep.adjuntos, nuevoAdjunto],
              };
            }),
          };
        });
        return;
      }

      if (pertenecePorIncidente || pertenecePorMision) {
        setMision((prev) => {
          if (!prev || prev.id !== misionId) return prev;
          const directos = prev.adjuntos ?? [];
          if (directos.some((a) => a.id === nuevoAdjunto.id)) return prev;
          return {
            ...prev,
            adjuntos: [nuevoAdjunto, ...directos],
          };
        });
      }

      if (candidato.reporteTerrenoId || pertenecePorIncidente || pertenecePorMision) {
        void obtenerDetalleMision(misionId, userId).then((res) => {
          if (activo && res.exito && res.datos) {
            setMision(res.datos);
          }
        });
      }
    };

    const handleIncidenteActualizado = (payload: unknown) => {
      const p = payload as Record<string, unknown> | null | undefined;
      const rawDatos = (p?.datos || p?.data || p) as Record<string, unknown> | null | undefined;
      const repRaw = rawDatos?.reporteTerreno as Record<string, unknown> | undefined;
      if (!repRaw || repRaw.misionId !== misionId) return;

      setMision((prev) => {
        if (!prev) return prev;
        const nuevoReporte: ReporteTerrenoDetalle = {
          id: String(repRaw.id || `rep-${Date.now()}`),
          misionId,
          tipoReporte:
            typeof repRaw.tipoReporte === 'string' ? repRaw.tipoReporte : undefined,
          dictamen:
            repRaw.dictamen === 'REQUIERE_CUADRILLA' || repRaw.dictamen === 'NO_ABORDABLE'
              ? (repRaw.dictamen as DictamenAtencionTerreno)
              : undefined,
          motivoNoAbordable:
            typeof repRaw.motivoNoAbordable === 'string' ? repRaw.motivoNoAbordable : null,
          requiereAsistenciaSocial:
            typeof repRaw.requiereAsistenciaSocial === 'boolean'
              ? repRaw.requiereAsistenciaSocial
              : undefined,
          personasAfectadasPrevias:
            typeof repRaw.personasAfectadasPrevias === 'number'
              ? repRaw.personasAfectadasPrevias
              : null,
          personasAfectadasModificadas:
            typeof repRaw.personasAfectadasModificadas === 'boolean'
              ? repRaw.personasAfectadasModificadas
              : undefined,
          versionReporte: Number(repRaw.versionReporte ?? prev.reportesTerreno.length + 1),
          esRectificacion: Boolean(repRaw.esRectificacion ?? prev.reportesTerreno.length > 0),
          etiquetaReporte:
            typeof repRaw.etiquetaReporte === 'string' ? repRaw.etiquetaReporte : undefined,
          prioridadSugerida:
            (repRaw.prioridadSugerida as ReporteTerrenoDetalle['prioridadSugerida']) ?? null,
          prioridadAsignada:
            (repRaw.prioridadAsignada as ReporteTerrenoDetalle['prioridadAsignada']) ?? null,
          justificacionPrioridad:
            typeof repRaw.justificacionPrioridad === 'string'
              ? repRaw.justificacionPrioridad
              : null,
          detallesEvaluacion:
            repRaw.detallesEvaluacion && typeof repRaw.detallesEvaluacion === 'object'
              ? (repRaw.detallesEvaluacion as ReporteTerrenoDetalle['detallesEvaluacion'])
              : repRaw.evaluacion && typeof repRaw.evaluacion === 'object'
                ? (repRaw.evaluacion as ReporteTerrenoDetalle['detallesEvaluacion'])
                : undefined,
          evaluador:
            repRaw.evaluador && typeof repRaw.evaluador === 'object'
              ? {
                  id: String((repRaw.evaluador as Record<string, unknown>).id || ''),
                  nombre: String(
                    (repRaw.evaluador as Record<string, unknown>).nombre || 'Patrulla en Terreno'
                  ),
                  email: String((repRaw.evaluador as Record<string, unknown>).email || ''),
                  rut:
                    typeof (repRaw.evaluador as Record<string, unknown>).rut === 'string'
                      ? String((repRaw.evaluador as Record<string, unknown>).rut)
                      : null,
                }
              : { id: 'patrulla', nombre: 'Patrulla en Terreno', email: '' },
          resumenTecnico: String(repRaw.resumenTecnico || ''),
          accionesRealizadas:
            typeof repRaw.accionesRealizadas === 'string' ? repRaw.accionesRealizadas : null,
          requiereApoyoAdicional: Boolean(repRaw.requiereApoyoAdicional),
          danosEstimados: typeof repRaw.danosEstimados === 'string' ? repRaw.danosEstimados : null,
          observaciones:
            typeof repRaw.observaciones === 'string'
              ? repRaw.observaciones
              : typeof repRaw.detallesAdicionales === 'string'
                ? repRaw.detallesAdicionales
                : null,
          personasAfectadas: Number(repRaw.personasAfectadas ?? 0),
          estadoTerreno:
            typeof repRaw.estadoTerreno === 'string' ? repRaw.estadoTerreno : 'EN_PROGRESO',
          adjuntos: Array.isArray(repRaw.adjuntos)
            ? (repRaw.adjuntos as AdjuntoEvidencia[])
            : [],
          creadoEn:
            typeof repRaw.creadoEn === 'string' ? repRaw.creadoEn : new Date().toISOString(),
          actualizadoEn:
            typeof repRaw.creadoEn === 'string' ? repRaw.creadoEn : new Date().toISOString(),
        };

        const existeIdx = prev.reportesTerreno.findIndex((r) => r.id === nuevoReporte.id);
        const nuevosReportes =
          existeIdx >= 0
            ? prev.reportesTerreno.map((r, i) => (i === existeIdx ? nuevoReporte : r))
            : [nuevoReporte, ...prev.reportesTerreno];

        const esCierre =
          esReporteVerificacionCierre(nuevoReporte) || rawDatos?.nuevoEstado === 'NO_ABORDABLE';
        const fechaCierreEntrante =
          typeof rawDatos?.fechaCierre === 'string'
            ? rawDatos.fechaCierre
            : typeof rawDatos?.fecha_cierre === 'string'
              ? rawDatos.fecha_cierre
              : undefined;
        const motivoNoAbordableEntrante =
          typeof rawDatos?.motivoNoAbordable === 'string'
            ? rawDatos.motivoNoAbordable
            : typeof rawDatos?.motivo_no_abordable === 'string'
              ? rawDatos.motivo_no_abordable
              : nuevoReporte.motivoNoAbordable ?? undefined;

        return {
          ...prev,
          estado: esCierre ? 'COMPLETADA' : prev.estado,
          fechaCierre:
            esCierre && fechaCierreEntrante
              ? fechaCierreEntrante
              : esCierre && !prev.fechaCierre
                ? new Date().toISOString()
                : prev.fechaCierre,
          patrulla:
            esCierre && prev.patrulla
              ? { ...prev.patrulla, estado: 'DISPONIBLE' }
              : prev.patrulla,
          prioridad:
            typeof rawDatos?.prioridad === 'string'
              ? (rawDatos.prioridad as MisionDetalleCompleto['prioridad'])
              : prev.prioridad,
          incidente: prev.incidente
            ? {
                ...prev.incidente,
                estado:
                  typeof rawDatos?.nuevoEstado === 'string'
                    ? rawDatos.nuevoEstado
                    : prev.incidente.estado,
                requiereAsistenciaSocial:
                  typeof rawDatos?.requiereAsistenciaSocial === 'boolean'
                    ? rawDatos.requiereAsistenciaSocial
                    : typeof nuevoReporte.requiereAsistenciaSocial === 'boolean'
                      ? nuevoReporte.requiereAsistenciaSocial
                      : prev.incidente.requiereAsistenciaSocial,
                prioridad:
                  typeof rawDatos?.prioridad === 'string'
                    ? rawDatos.prioridad
                    : prev.incidente.prioridad,
                prioridadSugerida:
                  rawDatos?.prioridadSugerida === null
                    ? null
                    : typeof rawDatos?.prioridadSugerida === 'string'
                      ? rawDatos.prioridadSugerida
                      : prev.incidente.prioridadSugerida,
                justificacionPrioridad:
                  rawDatos?.justificacionPrioridad === null
                    ? null
                    : typeof rawDatos?.justificacionPrioridad === 'string'
                      ? rawDatos.justificacionPrioridad
                      : prev.incidente.justificacionPrioridad,
                motivoNoAbordable:
                  motivoNoAbordableEntrante !== undefined
                    ? motivoNoAbordableEntrante
                    : prev.incidente.motivoNoAbordable,
                fechaCierre:
                  esCierre && rawDatos?.nuevoEstado === 'NO_ABORDABLE'
                    ? fechaCierreEntrante ?? prev.incidente.fechaCierre ?? new Date().toISOString()
                    : prev.incidente.fechaCierre,
              }
            : null,
          evaluaciones:
            esCierre && prev.evaluaciones
              ? {
                  ...prev.evaluaciones,
                  reporteVerificacionEnviado: true,
                  dictamenVerificacion:
                    nuevoReporte.dictamen ?? prev.evaluaciones.dictamenVerificacion,
                }
              : prev.evaluaciones,
          reportesTerreno: nuevosReportes,
        };
      });
    };

    const handleMisionActualizada = (payload: unknown) => {
      const p = payload as Record<string, unknown> | null | undefined;
      const rawDatos = (p?.datos || p?.data || p) as Record<string, unknown> | null | undefined;
      const idEvento = String(
        rawDatos?.misionId ??
          rawDatos?.id ??
          (rawDatos?.mision as Record<string, unknown> | undefined)?.id ??
          ''
      );
      if (!idEvento || idEvento !== misionId) return;

      const hitoRaw = rawDatos?.hito as Record<string, unknown> | undefined;
      if (hitoRaw && typeof hitoRaw === 'object') {
        setMision((prev) => {
          if (!prev) return prev;
          const hitoId = String(hitoRaw.id || `hito-${Date.now()}`);
          const yaExiste = prev.bitacoraTiempos.some((h) => h.id === hitoId);
          const tsIso =
            typeof hitoRaw.timestamp === 'string'
              ? hitoRaw.timestamp
              : typeof hitoRaw.creadoEn === 'string'
                ? hitoRaw.creadoEn
                : new Date().toISOString();
          const fechaObj = new Date(tsIso);
          const fechaStr =
            typeof hitoRaw.fecha === 'string'
              ? hitoRaw.fecha
              : fechaObj.toISOString().slice(0, 10);
          const horaStr =
            typeof hitoRaw.hora === 'string'
              ? hitoRaw.hora
              : fechaObj.toISOString().slice(11, 19);
          const nuevoHito: MisionDetalleCompleto['bitacoraTiempos'][number] = {
            id: hitoId,
            hito: String(hitoRaw.hito || 'ACTUALIZACION'),
            descripcion:
              typeof hitoRaw.descripcion === 'string' ? hitoRaw.descripcion : '',
            fecha: fechaStr,
            hora: horaStr,
            timestamp: tsIso,
            metadatos:
              hitoRaw.metadatos && typeof hitoRaw.metadatos === 'object'
                ? (hitoRaw.metadatos as Record<string, unknown>)
                : null,
          };
          const nuevoEstado =
            typeof rawDatos?.estado === 'string'
              ? (rawDatos.estado as MisionDetalleCompleto['estado'])
              : prev.estado;
          return {
            ...prev,
            estado: nuevoEstado,
            patrulla:
              nuevoEstado === 'COMPLETADA' && prev.patrulla
                ? { ...prev.patrulla, estado: 'DISPONIBLE' }
                : prev.patrulla,
            bitacoraTiempos: yaExiste
              ? prev.bitacoraTiempos
              : [...prev.bitacoraTiempos, nuevoHito],
          };
        });
      } else {
        void (async () => {
          const res = await obtenerDetalleMision(misionId, userId);
          if (activo && res.exito && res.datos) {
            setMision(res.datos);
          }
        })();
      }
    };

    const handleMisionRechazada = (payload: unknown) => {
      const p = payload as Record<string, unknown> | null | undefined;
      const raw = (p?.datos || p?.data || p) as Record<string, unknown> | null | undefined;
      const idPayload =
        typeof raw?.misionId === 'string'
          ? raw.misionId
          : typeof raw?.id === 'string'
            ? raw.id
            : undefined;
      if (idPayload !== misionId) return;

      void obtenerDetalleMision(misionId, userId).then((res) => {
        if (activo && res.exito && res.datos) {
          setMision(res.datos);
        }
      });
    };

    socket.on('connect', asegurarSalasEncargado);
    socket.on('adjunto:creado', handleAdjuntoCreado);
    socket.on('incidente:actualizado', handleIncidenteActualizado);
    socket.on('mision:actualizada', handleMisionActualizada);
    socket.on('mision:rechazada', handleMisionRechazada);
    return () => {
      activo = false;
      socket.off('connect', asegurarSalasEncargado);
      socket.off('adjunto:creado', handleAdjuntoCreado);
      socket.off('incidente:actualizado', handleIncidenteActualizado);
      socket.off('mision:actualizada', handleMisionActualizada);
      socket.off('mision:rechazada', handleMisionRechazada);
    };
  }, [misionId, userId]);

  // Manejo de tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCerrar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCerrar]);

  const adjuntosDirectos = useMemo<AdjuntoEvidencia[]>(() => {
    if (!mision) return [];
    const idsEnReportes = new Set(
      (mision.reportesTerreno ?? []).flatMap((rep) =>
        (rep.adjuntos ?? []).map((adj) => adj.id)
      )
    );
    return (mision.adjuntos ?? []).filter((adj) => !idsEnReportes.has(adj.id));
  }, [mision]);

  if (!misionId) return null;

  return (
    <div
      className={styles.modalOverlay}
      onClick={onCerrar}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mision-detalle-titulo"
    >
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {cargando && (
          <div style={{ padding: 'var(--space-6, 24px)' }}>
            <div style={{ marginBottom: 'var(--space-4, 16px)' }}>
              <Heading as="h3" variant="h3" color="teal">
                Cargando información detallada de la misión...
              </Heading>
            </div>
            <MisionSkeletonLoader />
          </div>
        )}

        {!cargando && error && (
          <div style={{ padding: 'var(--space-6, 24px)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4, 16px)' }}>
            <div className={styles.emptyStateContainer}>
              {codigoError === 403 ? (
                <ShieldAlert size={48} color="var(--color-danger, #D32F2F)" />
              ) : codigoError === 404 ? (
                <FileQuestion size={48} color="var(--color-warning, #E65100)" />
              ) : (
                <AlertTriangle size={48} color="var(--color-danger, #D32F2F)" />
              )}

              <Heading as="h3" variant="h3" color="charcoal">
                {codigoError === 403
                  ? 'Acceso Restringido'
                  : codigoError === 404
                  ? 'Misión No Encontrada'
                  : 'Error al consultar la misión'}
              </Heading>

              <p className={styles.emptyStateSubtitle}>{error}</p>

              <div style={{ marginTop: 'var(--space-2, 8px)' }}>
                <Button variant="secondary" size="md" onClick={onCerrar}>
                  Volver al listado
                </Button>
              </div>
            </div>
          </div>
        )}

        {!cargando && !error && mision && (
          <>
            <MisionDetalleHeader mision={mision} onCerrar={onCerrar} />

            <div className={styles.modalBody}>
              {/* Banner de Rechazo si aplica */}
              {mision.estado === 'RECHAZADA' && mision.justificacionRechazo && (
                <div className={styles.bannerRechazo} role="alert">
                  <AlertTriangle className={styles.bannerRechazoIcon} size={20} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '14px', marginBottom: '2px' }}>
                      Misión Rechazada por la Unidad en Terreno
                    </strong>
                    <span style={{ fontSize: '13px' }}>
                      <strong>Motivo indicado:</strong> {mision.justificacionRechazo}
                    </span>
                  </div>
                </div>
              )}

              {/* Contexto: Incidente o Prevención */}
              <MisionContextoSection
                incidente={mision.incidente}
                prevencion={mision.prevencion}
                descripcionMision={mision.descripcion}
              />

              {/* Unidad y Recursos Asignados */}
              <MisionEquipoSection
                cuadrilla={mision.cuadrilla}
                patrulla={mision.patrulla}
              />

              {/* Bitácora de Tiempos */}
              <MisionBitacoraSection bitacora={mision.bitacoraTiempos || []} />

              {/* Reportes de Terreno y Evidencia */}
              <MisionReportesSection
                key={`${mision.id}-${reporteDestacadoId || 'default'}`}
                reportes={mision.reportesTerreno || []}
                bitacora={mision.bitacoraTiempos || []}
                patrulla={mision.patrulla}
                incidente={mision.incidente}
                reporteDestacadoId={reporteDestacadoId}
                seccionRef={seccionReportesRef}
              />

              {adjuntosDirectos.length > 0 && (
                <section className={styles.seccionBloque} aria-label="Evidencias directas de la misión">
                  <div className={styles.seccionHeader}>
                    <div className={styles.seccionTituloGroup}>
                      <Paperclip size={18} color="var(--color-primary-teal, #1B6F7D)" />
                      <Heading as="h3" variant="h4" color="teal" noMargin>
                        Evidencias de la Misión / Incidente ({adjuntosDirectos.length})
                      </Heading>
                    </div>
                  </div>
                  <div className={styles.seccionBody}>
                    <MisionEvidenciasGallery adjuntos={adjuntosDirectos} />
                  </div>
                </section>
              )}
            </div>

            <footer className={styles.modalFooter}>
              <Button variant="secondary" size="md" onClick={onCerrar}>
                Cerrar Detalle
              </Button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};
