'use client';

import React, { useEffect, useState, useRef } from 'react';
import { AlertTriangle, ShieldAlert, FileQuestion } from 'lucide-react';
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
import {
  esReporteCierreCuadrilla,
  esReporteVerificacionCierre,
  normalizarMaterialesConsumidos,
} from '@/lib/utils/estadoUtils';
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

  // Sincronización en tiempo real de nuevos reportes, rectificaciones y adjuntos en la misión abierta
  useEffect(() => {
    if (!misionId) return;

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

      const nuevoAdjunto: AdjuntoEvidencia = {
        id: candidato.id,
        nombreArchivo: candidato.nombreArchivo,
        url: candidato.url,
        tipoMime: candidato.tipoMime,
        tamanoBytes: candidato.tamanoBytes,
        creadoEn: candidato.creadoEn,
      };

      let requiereRecarga = false;

      setMision((prev) => {
        if (!prev || prev.id !== misionId) return prev;

        if (candidato.reporteTerrenoId) {
          const existeReporte = (prev.reportesTerreno || []).some(
            (r) => r.id === candidato.reporteTerrenoId
          );
          if (existeReporte) {
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
          }
          requiereRecarga = true;
          return prev;
        }

        if (candidato.incidenteId && prev.incidente?.id === candidato.incidenteId) {
          requiereRecarga = true;
          const actuales = Array.isArray(prev.adjuntos) ? prev.adjuntos : [];
          if (!actuales.some((a) => a.id === nuevoAdjunto.id)) {
            return {
              ...prev,
              adjuntos: [...actuales, nuevoAdjunto],
            };
          }
        }
        return prev;
      });

      if (requiereRecarga) {
        void obtenerDetalleMision(misionId, userId).then((res) => {
          if (res.exito && res.datos) {
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

      let requiereRecargaPorCierreCuadrilla = false;

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
            repRaw.evaluacion && typeof repRaw.evaluacion === 'object'
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
          resumenTecnico: String(
            repRaw.resumenTecnico || repRaw.resumenFaenas || repRaw.resumen_faenas || ''
          ),
          resumenFaenas:
            typeof repRaw.resumenFaenas === 'string'
              ? repRaw.resumenFaenas
              : typeof repRaw.resumen_faenas === 'string'
                ? repRaw.resumen_faenas
                : null,
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
          horasHombre:
            typeof repRaw.horasHombre === 'number'
              ? repRaw.horasHombre
              : typeof repRaw.horas_hombre === 'number'
                ? repRaw.horas_hombre
                : null,
          materialesConsumidos: normalizarMaterialesConsumidos(
            repRaw.materialesConsumidos ?? repRaw.materiales_consumidos
          ),
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

        const esCierreCuadrilla = esReporteCierreCuadrilla(nuevoReporte);
        const esCierre =
          esReporteVerificacionCierre(nuevoReporte) ||
          esCierreCuadrilla ||
          rawDatos?.nuevoEstado === 'NO_ABORDABLE';

        if (esCierreCuadrilla) {
          requiereRecargaPorCierreCuadrilla = true;
        }

        return {
          ...prev,
          estado: esCierre ? 'COMPLETADA' : prev.estado,
          fechaCierre:
            esCierre && typeof rawDatos?.fechaCierre === 'string'
              ? rawDatos.fechaCierre
              : esCierre && !prev.fechaCierre
                ? new Date().toISOString()
                : prev.fechaCierre,
          prioridad:
            typeof rawDatos?.prioridad === 'string'
              ? (rawDatos.prioridad as MisionDetalleCompleto['prioridad'])
              : prev.prioridad,
          cuadrilla:
            esCierreCuadrilla && prev.cuadrilla
              ? { ...prev.cuadrilla, estado: 'DISPONIBLE' }
              : prev.cuadrilla,
          evaluaciones: esCierreCuadrilla
            ? {
                ...(prev.evaluaciones || {}),
                reporteCuadrillaEnviado: true,
                reporteCuadrillaEnviadoEn: nuevoReporte.creadoEn,
              }
            : prev.evaluaciones,
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
                  typeof rawDatos?.prioridadSugerida === 'string'
                    ? rawDatos.prioridadSugerida
                    : prev.incidente.prioridadSugerida,
                justificacionPrioridad:
                  typeof rawDatos?.justificacionPrioridad === 'string'
                    ? rawDatos.justificacionPrioridad
                    : prev.incidente.justificacionPrioridad,
              }
            : null,
          reportesTerreno: nuevosReportes,
        };
      });

      if (requiereRecargaPorCierreCuadrilla) {
        void obtenerDetalleMision(misionId, userId).then((res) => {
          if (res.exito && res.datos) {
            setMision(res.datos);
          }
        });
      }
    };

    const handleMisionActualizada = (rawPayload: unknown) => {
      const p = rawPayload as Record<string, unknown> | null | undefined;
      const raw = (p?.datos || p?.data || rawPayload) as Record<string, unknown> | null | undefined;
      if (!raw || typeof raw !== 'object') return;
      const evMisionId =
        typeof raw.misionId === 'string'
          ? raw.misionId
          : typeof raw.id === 'string'
            ? raw.id
            : '';
      const evEstado = typeof raw.estado === 'string' ? raw.estado.toUpperCase() : '';
      if (evMisionId === misionId && evEstado === 'COMPLETADA') {
        void obtenerDetalleMision(misionId, userId).then((res) => {
          if (res.exito && res.datos) {
            setMision(res.datos);
          }
        });
      }
    };

    socket.on('connect', asegurarSalasEncargado);
    socket.on('adjunto:creado', handleAdjuntoCreado);
    socket.on('incidente:actualizado', handleIncidenteActualizado);
    socket.on('mision:actualizada', handleMisionActualizada);
    return () => {
      socket.off('connect', asegurarSalasEncargado);
      socket.off('adjunto:creado', handleAdjuntoCreado);
      socket.off('incidente:actualizado', handleIncidenteActualizado);
      socket.off('mision:actualizada', handleMisionActualizada);
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
                cuadrilla={mision.cuadrilla}
                incidente={mision.incidente}
                reporteDestacadoId={reporteDestacadoId}
                seccionRef={seccionReportesRef}
              />

              {/* Evidencia multimedia preliminar (cargada durante la misión en curso antes de consolidarse en un informe) */}
              {(() => {
                const idsEnReportes = new Set(
                  (mision.reportesTerreno || []).flatMap((r) =>
                    (r.adjuntos || []).map((a) => a.id)
                  )
                );
                const adjuntosPreliminares = (mision.adjuntos || []).filter(
                  (a) => !idsEnReportes.has(a.id)
                );
                if (adjuntosPreliminares.length === 0) return null;
                return (
                  <div
                    style={{
                      padding: '12px 16px',
                      backgroundColor: 'var(--color-bg-light, #ECEFF3)',
                      border: '1px solid var(--border-color-neutral-dark, #CCD2D9)',
                    }}
                  >
                    <MisionEvidenciasGallery adjuntos={adjuntosPreliminares} />
                  </div>
                );
              })()}
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
