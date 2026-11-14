'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  obtenerDetalleIncidente,
  type IncidenteDetalle,
} from '@/services/incidentesService';
import { IncidenteDetalleHeader } from './drawer/IncidenteDetalleHeader';
import { IncidenteResumenSection } from './drawer/IncidenteResumenSection';
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
import Button from '@/components/ui/Button';
import { getSocket } from '@/lib/socket/client';
import {
  getTrazabilidadEstado,
  setTrazabilidadEstado,
  vincularMisionIncidente,
} from '@/lib/socket/trazabilidadStore';
import {
  TRAZABILIDAD_CONFIG,
  esPayloadTrazabilidadValido,
  extraerEstadoInicialNotificacion,
  resolverSiguienteEstadoTrazabilidad,
} from '@/lib/socket/trazabilidadConfig';
import { TrazabilidadIcon } from './TrazabilidadIcon';
import InlineNotice from '@/components/ui/InlineNotice';
import type { DespacharCuadrillaResponse, DespacharPatrullaResponseData } from '@/types/misiones';
import type { EstadoIncidente } from '@/services/incidentesService';
import { HardHat, CheckCircle2 } from 'lucide-react';
import styles from '@/styles/mando.module.css';

export interface IncidenteDetalleDrawerProps {
  incidenteId: string | null;
  userId: string;
  onCerrar: () => void;
  onIncidenteActualizado?: (incidenteId?: string, nuevoEstado?: EstadoIncidente) => void;
}

export const IncidenteDetalleDrawer: React.FC<IncidenteDetalleDrawerProps> = ({
  incidenteId,
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
  const [modalCuadrillaAbierto, setModalCuadrillaAbierto] = useState<boolean>(false);
  const [modalAsignarPatrullaAbierto, setModalAsignarPatrullaAbierto] = useState<boolean>(false);
  const puedeAsignar = usePuedeAsignarMision();
  const detalleRef = useRef<IncidenteDetalle | null>(null);

  useEffect(() => {
    detalleRef.current = detalle;
  }, [detalle]);

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
          const incId = res.datos.id;
          const misionesHidratadas = res.datos.misiones.map((m) => {
            vincularMisionIncidente(m.id, incId);
            if (m.trazabilidadNotificacion) {
              setTrazabilidadEstado(m.id, m.trazabilidadNotificacion, incId);
            }
            const consolidado = getTrazabilidadEstado(m.id) ?? m.trazabilidadNotificacion;
            return consolidado ? { ...m, trazabilidadNotificacion: consolidado } : m;
          });
          setDetalle({ ...res.datos, misiones: misionesHidratadas });
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

  useEffect(() => {
    if (!incidenteId) return;

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

    const handleTrazabilidad = (payload: unknown) => {
      if (!esPayloadTrazabilidadValido(payload)) return;

      const detalleActual = detalleRef.current;
      if (!detalleActual || detalleActual.id !== incidenteId) return;

      const perteneceAlIncidente = detalleActual.misiones.some(
        (m) => m.id === payload.misionId
      );
      if (!perteneceAlIncidente) return;

      setTrazabilidadEstado(payload.misionId, payload.estado, incidenteId);
      setDetalle((prev) => {
        if (!prev || prev.id !== incidenteId) return prev;
        let cambio = false;
        const misionesActualizadas = prev.misiones.map((m) => {
          if (m.id !== payload.misionId) return m;
          const siguiente = resolverSiguienteEstadoTrazabilidad(
            m.trazabilidadNotificacion,
            payload.estado
          );
          if (!siguiente) return m;
          cambio = true;
          return { ...m, trazabilidadNotificacion: siguiente };
        });
        return cambio ? { ...prev, misiones: misionesActualizadas } : prev;
      });
    };

    socket.on('connect', asegurarSalasEncargado);
    socket.on('notificacion:trazabilidad_actualizada', handleTrazabilidad);

    return () => {
      socket.off('connect', asegurarSalasEncargado);
      socket.off('notificacion:trazabilidad_actualizada', handleTrazabilidad);
    };
  }, [incidenteId]);

  const handleAsignacionExitosa = (data: DespacharPatrullaResponseData) => {
    const estadoInicial = extraerEstadoInicialNotificacion(data);
    setTrazabilidadEstado(data.mision.id, estadoInicial, data.incidente.id);

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
        trazabilidadNotificacion: estadoInicial,
        fechaInicio: null,
        fechaCierre: null,
        creadoEn: new Date().toISOString(),
      };
      return {
        ...prev,
        estado: 'VERIFICANDO',
        misiones: [nuevaMision, ...prev.misiones],
      };
    });

    // Notificar al tablero Kanban para mover la tarjeta de inmediato
    onIncidenteActualizado?.(data.incidente.id, 'VERIFICANDO');
  };

  if (!incidenteId) return null;

  const misionPatrullaActiva = detalle?.misiones.find(
    (m) =>
      Boolean(m.patrulla) &&
      ['PLANIFICADA', 'DESPACHADA', 'EN_CURSO'].includes(m.estado)
  );
  const trazabilidadResumenCfg = misionPatrullaActiva?.trazabilidadNotificacion
    ? TRAZABILIDAD_CONFIG[misionPatrullaActiva.trazabilidadNotificacion]
    : undefined;
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
                {misionPatrullaActiva && (
                  <div
                    data-testid="drawer-trazabilidad-resumen"
                    style={{
                      marginBottom: 'var(--space-3, 12px)',
                      padding: '8px 12px',
                      borderRadius: 0,
                      border: trazabilidadResumenCfg
                        ? '1px solid currentColor'
                        : '1px dashed #94A3B8',
                      borderLeft: trazabilidadResumenCfg
                        ? '4px solid currentColor'
                        : '4px solid #94A3B8',
                      backgroundColor: trazabilidadResumenCfg
                        ? trazabilidadResumenCfg.bg
                        : '#F8FAFC',
                      color: trazabilidadResumenCfg
                        ? trazabilidadResumenCfg.color
                        : '#5F676E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px',
                      fontSize: '0.8rem',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                      <TrazabilidadIcon
                        estado={misionPatrullaActiva.trazabilidadNotificacion}
                        size={15}
                      />
                      <span>
                        {trazabilidadResumenCfg
                          ? `${trazabilidadResumenCfg.etiquetaLectura}: ${trazabilidadResumenCfg.texto}`
                          : 'SIN ACUSE: Lectura por patrulla aún no confirmada'}
                      </span>
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                      {misionPatrullaActiva.codigo} · {misionPatrullaActiva.patrulla?.nombre}
                    </span>
                  </div>
                )}
                <IncidenteResumenSection detalle={detalle} />
                <IncidenteUbicacionSection detalle={detalle} />
                <IncidenteInformanteSection detalle={detalle} />
                <IncidenteMisionesSection
                  misiones={detalle.misiones}
                  incidenteEstado={detalle.estado}
                  onVerDetalleMision={(misionId) => setMisionSeleccionadaId(misionId)}
                  onAsignarPatrulla={() => setModalAsignarPatrullaAbierto(true)}
                  puedeAsignar={puedeAsignar}
                />
                <IncidenteRecursosSection recursos={detalle.recursosAsociados} />
              </>
            )}
          </div>
        </div>
      </div>

      <MisionDetalleModal
        misionId={misionSeleccionadaId}
        userId={userId}
        onCerrar={() => setMisionSeleccionadaId(null)}
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
