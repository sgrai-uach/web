'use client';

import React, { useEffect, useRef, useState } from 'react';
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
import { AsignarPatrullaModal } from './patrullas/AsignarPatrullaModal';
import type { DespacharPatrullaResponseData } from '@/types/misiones';
import type { EstadoIncidente } from '@/services/incidentesService';
import { usePuedeAsignarMision } from '@/hooks/usePuedeAsignarMision';
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
import styles from '@/styles/mando.module.css';

interface IncidenteDetalleDrawerProps {
  incidenteId: string | null;
  userId: string;
  onCerrar: () => void;
  onIncidenteActualizado?: (incidenteId: string, nuevoEstado: EstadoIncidente) => void;
}

export const IncidenteDetalleDrawer: React.FC<IncidenteDetalleDrawerProps> = ({
  incidenteId,
  userId,
  onCerrar,
  onIncidenteActualizado,
}) => {
  const [detalle, setDetalle] = useState<IncidenteDetalle | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [misionSeleccionadaId, setMisionSeleccionadaId] = useState<string | null>(null);
  const [modalAsignarPatrullaAbierto, setModalAsignarPatrullaAbierto] = useState<boolean>(false);
  const puedeAsignar = usePuedeAsignarMision();
  const detalleRef = useRef<IncidenteDetalle | null>(null);

  useEffect(() => {
    detalleRef.current = detalle;
  }, [detalle]);

  useEffect(() => {
    if (!incidenteId) return;

    let isMounted = true;
    queueMicrotask(() => {
      if (isMounted) {
        setCargando(true);
        setError(null);
      }
    });

    obtenerDetalleIncidente(incidenteId, userId).then((res) => {
      if (!isMounted) return;
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
        setError(res.mensaje);
      }
      setCargando(false);
    });

    return () => {
      isMounted = false;
    };
  }, [incidenteId, userId]);

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

  return (
    <>
      <div className={styles.drawerOverlay} onClick={onCerrar} role="dialog" aria-modal="true">
        <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
          <IncidenteDetalleHeader
            detalle={detalle}
            onCerrar={onCerrar}
            onAsignarPatrulla={() => setModalAsignarPatrullaAbierto(true)}
            puedeAsignar={puedeAsignar}
          />

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

      {/* Modal de Detalle de Misión (HU-17) con preservación del contexto del incidente y tablero */}
      <MisionDetalleModal
        misionId={misionSeleccionadaId}
        userId={userId}
        onCerrar={() => setMisionSeleccionadaId(null)}
      />

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
