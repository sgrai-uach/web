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
import type { MisionDetalleCompleto, ReporteTerrenoDetalle } from '@/types/misiones';
import { MisionSkeletonLoader } from './MisionSkeletonLoader';
import { MisionDetalleHeader } from './MisionDetalleHeader';
import { MisionContextoSection } from './MisionContextoSection';
import { MisionEquipoSection } from './MisionEquipoSection';
import { MisionBitacoraSection } from './MisionBitacoraSection';
import { MisionReportesSection } from './MisionReportesSection';
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

  // Sincronización en tiempo real de nuevos reportes o rectificaciones en la misión abierta
  useEffect(() => {
    if (!misionId) return;

    const socket = getSocket();
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
          estadoTerreno: 'EN_PROGRESO',
          adjuntos: [],
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

        return {
          ...prev,
          prioridad:
            typeof rawDatos?.prioridad === 'string'
              ? (rawDatos.prioridad as MisionDetalleCompleto['prioridad'])
              : prev.prioridad,
          incidente: prev.incidente
            ? {
                ...prev.incidente,
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
    };

    socket.on('incidente:actualizado', handleIncidenteActualizado);
    return () => {
      socket.off('incidente:actualizado', handleIncidenteActualizado);
    };
  }, [misionId]);

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
                incidente={mision.incidente}
                reporteDestacadoId={reporteDestacadoId}
                seccionRef={seccionReportesRef}
              />
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
