'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { getSocket } from '@/lib/socket/client';
import {
  obtenerDetalleIncidente,
  type IncidenteDetalle,
  type ReporteEvaluacionTerreno,
} from '@/services/incidentesService';
import { IncidenteDetalleHeader } from './drawer/IncidenteDetalleHeader';
import { IncidenteResumenSection } from './drawer/IncidenteResumenSection';
import { IncidenteUltimoReporteSection } from './drawer/IncidenteUltimoReporteSection';
import { IncidenteUbicacionSection } from './drawer/IncidenteUbicacionSection';
import { IncidenteInformanteSection } from './drawer/IncidenteInformanteSection';
import { IncidenteMisionesSection } from './drawer/IncidenteMisionesSection';
import { IncidenteRecursosSection } from './drawer/IncidenteRecursosSection';
import { MisionDetalleModal } from './mision/MisionDetalleModal';
import { ModalAsignarCuadrilla } from './ModalAsignarCuadrilla';
import { AsignarPatrullaModal } from './patrullas/AsignarPatrullaModal';
import { useOptionalAuth } from '@/context/AuthContext';
import { useOptionalToast } from '@/components/ui/Toast';
import { usePuedeAsignarMision } from '@/hooks/usePuedeAsignarMision';
import { fueTipologiaModificada } from '@/lib/utils/estadoUtils';
import Button from '@/components/ui/Button';
import InlineNotice from '@/components/ui/InlineNotice';
import type { DespacharCuadrillaResponse, DespacharPatrullaResponseData } from '@/types/misiones';
import type { EstadoIncidente } from '@/services/incidentesService';
import { HardHat, CheckCircle2 } from 'lucide-react';
import styles from '@/styles/mando.module.css';

export interface IncidenteDetalleDrawerProps {
  incidenteId: string | null;
  incidenteCodigo?: string | null;
  userId: string;
  onCerrar: () => void;
  onIncidenteActualizado?: (incidenteId?: string, nuevoEstado?: EstadoIncidente) => void;
}

export const IncidenteDetalleDrawer: React.FC<IncidenteDetalleDrawerProps> = ({
  incidenteId,
  incidenteCodigo = null,
  userId,
  onCerrar,
  onIncidenteActualizado,
}) => {
  const toast = useOptionalToast();
  const auth = useOptionalAuth();

  const [detalle, setDetalle] = useState<IncidenteDetalle | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [misionSeleccionadaId, setMisionSeleccionadaId] = useState<string | null>(null);
  const [enfocarReportesMision, setEnfocarReportesMision] = useState<boolean>(false);
  const [reporteDestacadoId, setReporteDestacadoId] = useState<string | null>(null);
  const [modalCuadrillaAbierto, setModalCuadrillaAbierto] = useState<boolean>(false);
  const [modalAsignarPatrullaAbierto, setModalAsignarPatrullaAbierto] = useState<boolean>(false);
  const puedeAsignar = usePuedeAsignarMision();

  // Verificación de permisos RBAC ('misiones:asignar')
  const tienePermisoAsignar =
    puedeAsignar ||
    !auth ||
    auth.tienePermiso('misiones:asignar') ||
    auth.usuario?.rolCodigo === 'ENCARGADO' ||
    auth.usuario?.rolCodigo === 'ADMINISTRADOR';

  const cargarDetalle = useCallback(() => {
    if (!incidenteId) return;
    setCargando(true);
    setError(null);

    obtenerDetalleIncidente(incidenteId, userId)
      .then((res) => {
        if (res.exito && res.datos) {
          setDetalle(res.datos);
        } else {
          setError(res.mensaje || 'Error al obtener el detalle del incidente.');
        }
      })
      .catch(() => {
        setError('Error de comunicación con el servidor al cargar el incidente.');
      })
      .finally(() => {
        setCargando(false);
      });
  }, [incidenteId, userId]);

  useEffect(() => {
    let isMounted = true;

    queueMicrotask(() => {
      if (!isMounted) return;
      if (!incidenteId) {
        setDetalle(null);
        setError(null);
        setModalCuadrillaAbierto(false);
        setModalAsignarPatrullaAbierto(false);
        return;
      }
      cargarDetalle();
    });

    return () => {
      isMounted = false;
    };
  }, [incidenteId, cargarDetalle]);

  // Cierre por tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'Escape' &&
        !misionSeleccionadaId &&
        !modalCuadrillaAbierto &&
        !modalAsignarPatrullaAbierto
      ) {
        onCerrar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCerrar, misionSeleccionadaId, modalCuadrillaAbierto, modalAsignarPatrullaAbierto]);

  // 1. Visibilidad: Mostrar acción táctica de despacho en estados VERIFICANDO y REPORTADO (CA-1 HU-21)
  const puedeDespacharCuadrilla = useMemo(() => {
    if (!tienePermisoAsignar || !detalle) return false;
    return detalle.estado === 'VERIFICANDO' || detalle.estado === 'REPORTADO';
  }, [tienePermisoAsignar, detalle]);

  // Misión de verificación previa
  const misionVerificacion = useMemo(() => {
    if (!detalle?.misiones) return null;
    return (
      detalle.misiones.find(
        (m) =>
          m.tipoMision === 'VERIFICACION' &&
          m.estado !== 'CANCELADA' &&
          m.estado !== 'RECHAZADA'
      ) || null
    );
  }, [detalle]);

  const handleDespachoExitoso = (resultado: DespacharCuadrillaResponse['data']) => {
    if (resultado.patrullaLiberada) {
      toast?.showSuccess(
        `Cuadrilla despachada exitosamente. La patrulla ${resultado.patrullaLiberada.nombre} ha sido liberada y ya se encuentra DISPONIBLE para nuevas asignaciones.`,
        'Despacho Táctico Confirmado'
      );
    } else {
      toast?.showSuccess(
        `Cuadrilla '${resultado.cuadrilla.nombre}' despachada exitosamente al incidente ${resultado.incidente.codigo}.`,
        'Despacho Táctico Confirmado'
      );
    }
    cargarDetalle();
    onIncidenteActualizado?.();
  };

  // Sincronización en tiempo real ante reclasificación o cambios mientras el drawer está abierto
  useEffect(() => {
    if (!incidenteId) return;

    const socket = getSocket();
    const handleActualizadoSocket = (payload: unknown) => {
      const p = payload as Record<string, unknown> | null | undefined;
      const rawDatos = (p?.datos || p?.data || p) as Record<string, unknown> | null | undefined;
      const id =
        typeof rawDatos?.id === 'string'
          ? rawDatos.id
          : typeof rawDatos?.incidenteId === 'string'
            ? rawDatos.incidenteId
            : undefined;

      if (id === incidenteId) {
        setDetalle((prev) => {
          if (!prev) return prev;
          const nuevoTipo =
            typeof rawDatos?.tipoAfectacion === 'string'
              ? rawDatos.tipoAfectacion
              : prev.tipoAfectacion;
          const nuevaPrioridad =
            typeof rawDatos?.prioridad === 'string'
              ? (rawDatos.prioridad as IncidenteDetalle['prioridad'])
              : prev.prioridad;
          const nuevoEstado =
            typeof rawDatos?.nuevoEstado === 'string'
              ? (rawDatos.nuevoEstado as IncidenteDetalle['estado'])
              : typeof rawDatos?.estado === 'string'
                ? (rawDatos.estado as IncidenteDetalle['estado'])
                : prev.estado;
          const justificacionPrioridad =
            typeof rawDatos?.justificacionPrioridad === 'string'
              ? rawDatos.justificacionPrioridad
              : prev.justificacionPrioridad;
          const prioridadSugerida =
            typeof rawDatos?.prioridadSugerida === 'string'
              ? (rawDatos.prioridadSugerida as IncidenteDetalle['prioridadSugerida'])
              : prev.prioridadSugerida;
          const justificacion =
            typeof rawDatos?.justificacion === 'string'
              ? rawDatos.justificacion
              : justificacionPrioridad || prev.justificacionReclasificacion;
          const huboCambioPrioridad = Boolean(
            (rawDatos?.prioridad && rawDatos.prioridad !== prev.prioridad) ||
              (prioridadSugerida && nuevaPrioridad !== prioridadSugerida)
          );

          let nuevosReportes = prev.reportesEvaluacionTerreno || [];
          if (rawDatos?.reporteTerreno && typeof rawDatos.reporteTerreno === 'object') {
            const repentrante = rawDatos.reporteTerreno as ReporteEvaluacionTerreno;
            const yaExiste = nuevosReportes.some((r) => r.id === repentrante.id);
            nuevosReportes = yaExiste
              ? nuevosReportes.map((r) => (r.id === repentrante.id ? repentrante : r))
              : [repentrante, ...nuevosReportes];
          }

          return {
            ...prev,
            tipoAfectacion: nuevoTipo,
            misiones: prev.misiones.map((m) =>
              m.tipoMision === 'VERIFICACION' && nuevoTipo && prev.codigo
                ? { ...m, titulo: `Verificación: ${nuevoTipo} - ${prev.codigo}` }
                : m
            ),
            prioridad: nuevaPrioridad,
            prioridadSugerida,
            justificacionPrioridad,
            requiereAsistenciaSocial:
              typeof rawDatos?.requiereAsistenciaSocial === 'boolean'
                ? rawDatos.requiereAsistenciaSocial
                : prev.requiereAsistenciaSocial,
            estado: nuevoEstado,
            tipoIncidenteId:
              typeof rawDatos?.tipoIncidenteId === 'string'
                ? rawDatos.tipoIncidenteId
                : prev.tipoIncidenteId,
            reportesEvaluacionTerreno: nuevosReportes,
            reclasificadoEnTerreno: Boolean(
              fueTipologiaModificada(prev.tipoAfectacion, nuevoTipo) ||
                prev.reclasificadoEnTerreno
            ),
            justificacionReclasificacion: justificacion,
            cambioPrioridadMotivo: huboCambioPrioridad
              ? justificacionPrioridad ||
                justificacion ||
                'Ajustada tras verificación presencial en terreno'
              : prev.cambioPrioridadMotivo,
            actualizadoEn:
              typeof rawDatos?.actualizadoEn === 'string'
                ? rawDatos.actualizadoEn
                : new Date().toISOString(),
          };
        });
      }
    };

    socket.on('incidente:actualizado', handleActualizadoSocket);
    return () => {
      socket.off('incidente:actualizado', handleActualizadoSocket);
    };
  }, [incidenteId]);

  const handleAsignacionExitosa = (data: DespacharPatrullaResponseData) => {
    setDetalle((prev) => {
      if (!prev) return prev;
      const nuevaMision = {
        id: data.mision.id,
        codigo: data.mision.codigo,
        titulo: data.mision.titulo,
        descripcion: null,
        tipoMision: data.mision.tipoMision,
        estado: data.mision.estado,
        prioridad: prev.prioridad,
        justificacionRechazo: null,
        patrulla: {
          id: data.patrulla.id,
          nombre: data.patrulla.nombre,
          estado: data.patrulla.estado,
        },
        cuadrilla: null,
        fechaInicio: null,
        fechaCierre: null,
        creadoEn: new Date().toISOString(),
      };
      return {
        ...prev,
        estado: 'REPORTADO',
        misiones: [nuevaMision, ...prev.misiones],
      };
    });

    // Mantener en estado REPORTADO hasta que la patrulla acepte en terreno
    onIncidenteActualizado?.(data.incidente.id, 'REPORTADO');
  };

  if (!incidenteId) return null;

  const estaVerificadoConcluido = misionVerificacion?.estado === 'COMPLETADA';

  return (
    <>
      <div
        className={styles.drawerOverlay}
        onClick={onCerrar}
        role="dialog"
        aria-modal="true"
        aria-label={`Detalle del incidente ${detalle?.codigo || ''}`}
      >
        <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
          <IncidenteDetalleHeader
            detalle={detalle}
            codigoInicial={incidenteCodigo}
            incidenteId={incidenteId}
            onCerrar={onCerrar}
            onAsignarPatrulla={() => setModalAsignarPatrullaAbierto(true)}
            puedeAsignar={puedeAsignar}
          />

          {/* Barra táctica de despacho de cuadrilla operativa (HU-21 / Regla ICS §3.2) */}
          {puedeDespacharCuadrilla && detalle && (
            <div
              style={{
                backgroundColor: 'var(--color-bg-light, #ECEFF3)',
                padding: 'var(--space-3, 12px) var(--space-4, 16px)',
                borderBottom: '2px solid var(--border-color-neutral, #DFE3E8)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '0.875rem', color: 'var(--color-primary-teal-dark, #14505A)' }}>
                      Intervención Táctica Operativa
                    </strong>
                    {detalle.estado === 'VERIFICANDO' && estaVerificadoConcluido && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: 'var(--color-success-bg, #E8F5E9)',
                          color: 'var(--color-success, #2E7D32)',
                          border: '1px solid #C8E6C9',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '1px 6px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.02em',
                        }}
                      >
                        <CheckCircle2 size={12} />
                        <span>Verificación Completada</span>
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dark, #2B2B2B)', marginTop: '2px' }}>
                    {detalle.estado === 'REPORTADO' ? (
                      <span style={{ color: 'var(--color-text-muted, #5F676E)' }}>
                        Sin patrulla previa asignada (despacho táctico directo).
                      </span>
                    ) : misionVerificacion?.patrulla ? (
                      estaVerificadoConcluido ? (
                        <span>
                          Diagnóstico técnico en terreno finalizado por{' '}
                          <strong>{misionVerificacion.patrulla.nombre}</strong>. Listo para despacho de cuadrilla.
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted, #5F676E)' }}>
                          Patrulla asignada: {misionVerificacion.patrulla.nombre} ({misionVerificacion.estado}).
                        </span>
                      )
                    ) : (
                      <span style={{ color: 'var(--color-text-muted, #5F676E)' }}>
                        Verificación técnica registrada.
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setModalCuadrillaAbierto(true)}
                  title="Despachar cuadrilla operativa a este incidente"
                  aria-label="Despachar Cuadrilla Operativa"
                >
                  <HardHat size={15} style={{ marginRight: '6px' }} />
                  <span>Despachar Cuadrilla</span>
                </Button>
              </div>
            </div>
          )}

          <div className={styles.drawerBody}>
            {cargando && (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-muted, #5F676E)' }}>
                Cargando información detallada del incidente...
              </div>
            )}

            {error && (
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <InlineNotice variant="error">
                  {error}
                </InlineNotice>
              </div>
            )}

            {!cargando && detalle && (
              <>
                <IncidenteResumenSection
                  detalle={detalle}
                  onVerReporteCambioAfectacion={(misionId, reporteId) => {
                    setEnfocarReportesMision(true);
                    setReporteDestacadoId(reporteId);
                    setMisionSeleccionadaId(misionId);
                  }}
                />
                <IncidenteUltimoReporteSection
                  detalle={detalle}
                  onVerDetalleReporte={(misionId, reporteId) => {
                    setEnfocarReportesMision(true);
                    setReporteDestacadoId(reporteId);
                    setMisionSeleccionadaId(misionId);
                  }}
                />
                <IncidenteUbicacionSection detalle={detalle} />
                <IncidenteInformanteSection detalle={detalle} />
                <IncidenteMisionesSection
                  misiones={detalle.misiones}
                  reportesEvaluacionTerreno={detalle.reportesEvaluacionTerreno}
                  incidenteEstado={detalle.estado}
                  onVerDetalleMision={(misionId) => {
                    setEnfocarReportesMision(false);
                    setReporteDestacadoId(null);
                    setMisionSeleccionadaId(misionId);
                  }}
                  onVerReportesMision={(misionId, reporteId) => {
                    setEnfocarReportesMision(true);
                    setReporteDestacadoId(reporteId || null);
                    setMisionSeleccionadaId(misionId);
                  }}
                  onAsignarPatrulla={() => setModalAsignarPatrullaAbierto(true)}
                  puedeAsignar={puedeAsignar}
                />
                <IncidenteRecursosSection recursos={detalle.recursosAsociados} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Detalle de Misión (HU-17 / HU-38) con preservación del contexto del incidente y tablero */}
      <MisionDetalleModal
        misionId={misionSeleccionadaId}
        userId={userId}
        enfocarReportes={enfocarReportesMision}
        reporteDestacadoId={reporteDestacadoId}
        onCerrar={() => {
          setMisionSeleccionadaId(null);
          setEnfocarReportesMision(false);
          setReporteDestacadoId(null);
        }}
      />

      {modalCuadrillaAbierto && detalle && (
        <ModalAsignarCuadrilla
          key={detalle.id}
          isOpen={modalCuadrillaAbierto}
          onClose={() => setModalCuadrillaAbierto(false)}
          incidente={detalle}
          userId={userId}
          onSuccess={handleDespachoExitoso}
        />
      )}

      {/* Modal de Asignación de Patrulla Verificadora (HU-20) */}
      <AsignarPatrullaModal
        isOpen={modalAsignarPatrullaAbierto}
        onClose={() => setModalAsignarPatrullaAbierto(false)}
        incidente={
          detalle
            ? {
                id: detalle.id,
                codigo: detalle.codigo,
                tipoAfectacion: detalle.tipoAfectacion,
                direccion: detalle.direccion,
                prioridad: detalle.prioridad,
              }
            : null
        }
        userId={userId}
        onAsignacionExitosa={handleAsignacionExitosa}
      />
    </>
  );
};
