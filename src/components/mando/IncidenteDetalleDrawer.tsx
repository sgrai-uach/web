'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
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
import { IncidenteEvidenciasSection } from './drawer/IncidenteEvidenciasSection';
import { MisionDetalleModal } from './mision/MisionDetalleModal';
import { ModalAsignarCuadrilla } from './ModalAsignarCuadrilla';
import { AsignarPatrullaModal } from './patrullas/AsignarPatrullaModal';
import { useOptionalAuth } from '@/context/AuthContext';
import { useOptionalToast } from '@/components/ui/Toast';
import { usePuedeAsignarMision } from '@/hooks/usePuedeAsignarMision';
import {
  esReporteCierreCuadrilla,
  esReporteVerificacionCierre,
  formatearEstadoTerreno,
  formatearHorasHombre,
  fueTipologiaModificada,
} from '@/lib/utils/estadoUtils';
import { obtenerVarianteChipEstadoTerreno } from '@/lib/utils/chipVariants';
import Chip from '@/components/ui/Chip';
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
import {
  esPayloadAdjuntoCreadoValido,
  type AdjuntoEvidencia,
  type DespacharCuadrillaResponse,
  type DespacharPatrullaResponseData,
  type DictamenAtencionTerreno,
} from '@/types/misiones';
import type { EstadoIncidente } from '@/services/incidentesService';
import { HardHat, CheckCircle2, Ban } from 'lucide-react';
import styles from '@/styles/mando.module.css';

export interface IncidenteDetalleDrawerProps {
  incidenteId: string | null;
  incidenteCodigo?: string | null;
  userId: string;
  onCerrar: () => void;
  onSelectCuadrilla?: (cuadrillaId: string) => void;
  onIncidenteActualizado?: (incidenteId?: string, nuevoEstado?: EstadoIncidente) => void;
}

export const IncidenteDetalleDrawer: React.FC<IncidenteDetalleDrawerProps> = ({
  incidenteId,
  incidenteCodigo = null,
  userId,
  onCerrar,
  onSelectCuadrilla,
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

  const puedeCrearEventoFibe = !auth
    ? true
    : auth.tienePermiso('asistencia_social:crear') ||
      auth.usuario?.rolCodigo === 'ENCARGADO' ||
      auth.usuario?.rolCodigo === 'ADMIN' ||
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

  // Cierre de faenas de cuadrilla con incidente aún en EN_ATENCION (espera H86)
  const misionCuadrillaCompletada = useMemo(() => {
    if (!detalle || detalle.estado !== 'EN_ATENCION') return null;
    const tieneActiva = detalle.misiones.some(
      (m) =>
        (m.tipoMision === 'ATENCION_CUADRILLA' || Boolean(m.cuadrilla)) &&
        ['PLANIFICADA', 'DESPACHADA', 'EN_CURSO'].includes(m.estado)
    );
    if (tieneActiva) return null;
    return (
      detalle.misiones.find(
        (m) => m.tipoMision === 'ATENCION_CUADRILLA' && m.estado === 'COMPLETADA'
      ) || null
    );
  }, [detalle]);

  const ultimoReporteCuadrilla = useMemo(() => {
    if (!detalle?.reportesEvaluacionTerreno) return null;
    return (
      detalle.reportesEvaluacionTerreno.find((r) => esReporteCierreCuadrilla(r)) || null
    );
  }, [detalle]);

  const mostrarBannerFaenasCompletadas = Boolean(
    detalle &&
      detalle.estado === 'EN_ATENCION' &&
      (misionCuadrillaCompletada || ultimoReporteCuadrilla) &&
      !detalle.misiones.some(
        (m) =>
          (m.tipoMision === 'ATENCION_CUADRILLA' || Boolean(m.cuadrilla)) &&
          ['PLANIFICADA', 'DESPACHADA', 'EN_CURSO'].includes(m.estado)
      )
  );

  const handleDespachoExitoso = (resultado: DespacharCuadrillaResponse['data']) => {
    const detallesDespacho: Array<{ label: string; value: string }> = [
      { label: 'Cuadrilla', value: resultado.cuadrilla.nombre },
      { label: 'Misión', value: resultado.mision.codigo },
    ];
    if (resultado.patrullaLiberada) {
      detallesDespacho.push({
        label: 'Patrulla liberada',
        value: `${resultado.patrullaLiberada.nombre} (Disponible)`,
      });
    }
    toast?.showSuccess(
      resultado.patrullaLiberada
        ? `Cuadrilla "${resultado.cuadrilla.nombre}" despachada al incidente ${resultado.incidente.codigo}. Patrulla ${resultado.patrullaLiberada.nombre} liberada.`
        : `Cuadrilla "${resultado.cuadrilla.nombre}" despachada exitosamente al incidente ${resultado.incidente.codigo}.`,
      'Despacho Táctico Confirmado',
      {
        icon: 'cuadrilla',
        codeBadge: resultado.incidente.codigo,
        dedupKey: `despacho-cuadrilla:${resultado.incidente.id}:${resultado.cuadrilla.id}`,
        details: detallesDespacho,
      }
    );
    cargarDetalle();
    onIncidenteActualizado?.();
  };

  // Sincronización en tiempo real ante reclasificación, trazabilidad o cambios mientras el drawer está abierto
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
          let esCierreVerificacion = nuevoEstado === 'NO_ABORDABLE';
          let esCierreCuadrilla = false;
          let reporteEntranteRef: ReporteEvaluacionTerreno | null = null;
          if (rawDatos?.reporteTerreno && typeof rawDatos.reporteTerreno === 'object') {
            const repentrante = rawDatos.reporteTerreno as ReporteEvaluacionTerreno;
            reporteEntranteRef = repentrante;
            if (esReporteCierreCuadrilla(repentrante)) {
              esCierreCuadrilla = true;
            } else if (esReporteVerificacionCierre(repentrante)) {
              esCierreVerificacion = true;
            }
            const yaExiste = nuevosReportes.some((r) => r.id === repentrante.id);
            nuevosReportes = yaExiste
              ? nuevosReportes.map((r) => (r.id === repentrante.id ? repentrante : r))
              : [repentrante, ...nuevosReportes];
          }

          const dictamenEntrante =
            typeof rawDatos?.dictamen === 'string'
              ? (rawDatos.dictamen as DictamenAtencionTerreno)
              : reporteEntranteRef?.dictamen ?? prev.dictamenTerreno;

          const motivoNoAbordableEntrante =
            typeof rawDatos?.motivoNoAbordable === 'string'
              ? rawDatos.motivoNoAbordable
              : typeof rawDatos?.motivo_no_abordable === 'string'
                ? rawDatos.motivo_no_abordable
                : reporteEntranteRef?.motivoNoAbordable ?? prev.motivoNoAbordable;

          const fechaCierreEntrante =
            typeof rawDatos?.fechaCierre === 'string'
              ? rawDatos.fechaCierre
              : typeof rawDatos?.fecha_cierre === 'string'
                ? rawDatos.fecha_cierre
                : prev.fechaCierre;

          const estadoFinal =
            esCierreCuadrilla && nuevoEstado === 'RESUELTO'
              ? prev.estado
              : nuevoEstado;

          return {
            ...prev,
            tipoAfectacion: nuevoTipo,
            misiones: prev.misiones.map((m) => {
              if (esCierreCuadrilla && m.tipoMision === 'ATENCION_CUADRILLA') {
                const coincide =
                  (reporteEntranteRef?.misionId && m.id === reporteEntranteRef.misionId) ||
                  ['PLANIFICADA', 'DESPACHADA', 'EN_CURSO'].includes(m.estado);
                if (coincide) {
                  return {
                    ...m,
                    estado: 'COMPLETADA',
                    fechaCierre:
                      fechaCierreEntrante || m.fechaCierre || new Date().toISOString(),
                    cuadrilla: m.cuadrilla
                      ? { ...m.cuadrilla, estado: 'DISPONIBLE' }
                      : m.cuadrilla,
                  };
                }
              }
              if (m.tipoMision === 'VERIFICACION') {
                const tituloAct =
                  nuevoTipo && prev.codigo
                    ? `Verificación: ${nuevoTipo} - ${prev.codigo}`
                    : m.titulo;
                if (esCierreVerificacion) {
                  return {
                    ...m,
                    titulo: tituloAct,
                    estado: 'COMPLETADA',
                    fechaCierre: fechaCierreEntrante || m.fechaCierre || new Date().toISOString(),
                  };
                }
                return { ...m, titulo: tituloAct };
              }
              return m;
            }),
            prioridad: nuevaPrioridad,
            prioridadSugerida,
            justificacionPrioridad,
            requiereAsistenciaSocial:
              typeof rawDatos?.requiereAsistenciaSocial === 'boolean'
                ? rawDatos.requiereAsistenciaSocial
                : reporteEntranteRef?.requiereAsistenciaSocial !== undefined
                  ? reporteEntranteRef.requiereAsistenciaSocial
                  : prev.requiereAsistenciaSocial,
            verificado:
              typeof rawDatos?.verificado === 'boolean'
                ? rawDatos.verificado
                : esCierreVerificacion
                  ? true
                  : prev.verificado,
            faenasCuadrillaCompletadas: esCierreCuadrilla
              ? true
              : prev.faenasCuadrillaCompletadas,
            estadoTerrenoFinal: esCierreCuadrilla
              ? reporteEntranteRef?.estadoTerreno ?? prev.estadoTerrenoFinal
              : prev.estadoTerrenoFinal,
            horasHombreRegistradas: esCierreCuadrilla
              ? reporteEntranteRef?.horasHombre ?? prev.horasHombreRegistradas
              : prev.horasHombreRegistradas,
            dictamenTerreno: dictamenEntrante,
            motivoNoAbordable: motivoNoAbordableEntrante,
            fechaCierre: esCierreCuadrilla ? prev.fechaCierre : fechaCierreEntrante,
            estado: estadoFinal,
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

    const handleMisionRechazada = (payload: unknown) => {
      const p = payload as Record<string, unknown> | null | undefined;
      const raw = (p?.datos || p?.data || p) as Record<string, unknown> | null | undefined;
      const incId = typeof raw?.incidenteId === 'string' ? raw.incidenteId : undefined;
      if (incId === incidenteId) {
        cargarDetalle();
      }
    };

    const handleIncidenteActualizado = (payload: unknown) => {
      const p = payload as Record<string, unknown> | null | undefined;
      const raw = (p?.datos || p?.data || p) as Record<string, unknown> | null | undefined;
      const id =
        typeof raw?.id === 'string'
          ? raw.id
          : typeof raw?.incidenteId === 'string'
            ? raw.incidenteId
            : undefined;
      if (id === incidenteId) {
        cargarDetalle();
      }
    };

    const handleMisionActualizada = (rawPayload: unknown) => {
      const p = rawPayload as Record<string, unknown> | null | undefined;
      const raw = (p?.datos || p?.data || p) as Record<string, unknown> | null | undefined;
      const incId =
        typeof raw?.incidenteId === 'string'
          ? raw.incidenteId
          : typeof raw?.incidente_id === 'string'
            ? raw.incidente_id
            : undefined;
      const misId =
        typeof raw?.misionId === 'string'
          ? raw.misionId
          : typeof raw?.id === 'string'
            ? raw.id
            : undefined;
      const pertenece =
        incId === incidenteId ||
        (misId && detalleRef.current?.misiones.some((m) => m.id === misId));
      if (pertenece) {
        cargarDetalle();
      }
    };

    const handleAdjuntoCreado = (rawPayload: unknown) => {
      const p = rawPayload as Record<string, unknown> | null | undefined;
      const candidato = (p?.datos || p?.data || rawPayload) as unknown;
      if (!esPayloadAdjuntoCreadoValido(candidato)) return;

      const coincideReporte =
        Boolean(candidato.reporteTerrenoId) &&
        Boolean(
          detalleRef.current?.reportesEvaluacionTerreno?.some(
            (r) => r.id === candidato.reporteTerrenoId
          )
        );

      if (candidato.incidenteId === incidenteId || coincideReporte) {
        cargarDetalle();
      }
    };

    socket.on('connect', asegurarSalasEncargado);
    socket.on('incidente:actualizado', handleActualizadoSocket);
    socket.on('notificacion:trazabilidad_actualizada', handleTrazabilidad);
    socket.on('mision:actualizada', handleMisionActualizada);
    socket.on('mision:rechazada', handleMisionRechazada);
    socket.on('incidente:actualizado', handleIncidenteActualizado);
    socket.on('adjunto:creado', handleAdjuntoCreado);

    return () => {
      socket.off('connect', asegurarSalasEncargado);
      socket.off('incidente:actualizado', handleActualizadoSocket);
      socket.off('notificacion:trazabilidad_actualizada', handleTrazabilidad);
      socket.off('mision:actualizada', handleMisionActualizada);
      socket.off('mision:rechazada', handleMisionRechazada);
      socket.off('incidente:actualizado', handleIncidenteActualizado);
      socket.off('adjunto:creado', handleAdjuntoCreado);
    };
  }, [incidenteId, cargarDetalle]);

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
        estado: 'REPORTADO',
        misiones: [nuevaMision, ...prev.misiones],
      };
    });

    // Mantener en estado REPORTADO hasta que la patrulla acepte en terreno
    onIncidenteActualizado?.(data.incidente.id, 'REPORTADO');
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
            codigoInicial={incidenteCodigo}
            incidenteId={incidenteId}
            onCerrar={onCerrar}
            onAsignarPatrulla={() => setModalAsignarPatrullaAbierto(true)}
            puedeAsignar={puedeAsignar}
            puedeCrearEventoFibe={puedeCrearEventoFibe}
          />

          {/* Banner informativo de cierre por No Abordabilidad en terreno (HU-39 / HU-86) */}
          {detalle && detalle.estado === 'NO_ABORDABLE' && (
            <div
              data-testid="banner-incidente-no-abordable"
              role="alert"
              style={{
                backgroundColor: 'var(--color-danger-bg, #FFEBEE)',
                padding: 'var(--space-3, 12px) var(--space-4, 16px)',
                borderBottom: '2px solid #FFCDD2',
                borderLeft: '4px solid var(--color-danger, #D32F2F)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
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
                <strong
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-danger, #D32F2F)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Ban size={15} aria-hidden="true" />
                  <span>Caso cerrado en terreno como No Abordable</span>
                </strong>
                {detalle.fechaCierre && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #5F676E)' }}>
                    Cierre: {new Date(detalle.fechaCierre).toLocaleString('es-CL')}
                  </span>
                )}
              </div>
              {detalle.motivoNoAbordable && (
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-dark, #2B2B2B)' }}>
                  <strong>Motivo de no abordabilidad:</strong> {detalle.motivoNoAbordable}
                </p>
              )}
            </div>
          )}

          {/* Banner informativo de cierre de faenas por Cuadrilla (permanece en EN_ATENCION hasta H86) */}
          {mostrarBannerFaenasCompletadas && (
            <div
              data-testid="banner-faenas-cuadrilla-completadas"
              role="status"
              style={{
                backgroundColor: 'var(--color-info-bg, #E0F2F1)',
                padding: 'var(--space-3, 12px) var(--space-4, 16px)',
                borderBottom: '2px solid #B2DFDB',
                borderLeft: '4px solid var(--color-accent-mint, #4FAE9B)',
                borderRadius: 0,
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
                <strong
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-primary-teal-dark, #14505A)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <HardHat size={15} aria-hidden="true" />
                  <span>Faenas de cuadrilla finalizadas — Cuadrilla liberada</span>
                </strong>
                {misionCuadrillaCompletada?.fechaCierre && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #5F676E)' }}>
                    Cierre faena: {new Date(misionCuadrillaCompletada.fechaCierre).toLocaleString('es-CL')}
                  </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-dark, #2B2B2B)' }}>
                La cuadrilla completó los trabajos en terreno y volvió a estado{' '}
                <strong>Disponible</strong>. El incidente permanece{' '}
                <strong>En Atención</strong> para evaluación y decreto de resolución final del Encargado (H86).
              </p>
              {ultimoReporteCuadrilla && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <Chip
                    variant={obtenerVarianteChipEstadoTerreno(ultimoReporteCuadrilla.estadoTerreno)}
                    size="sm"
                  >
                    Terreno: {formatearEstadoTerreno(ultimoReporteCuadrilla.estadoTerreno)}
                  </Chip>
                  {typeof ultimoReporteCuadrilla.horasHombre === 'number' && (
                    <Chip variant="neutral" size="sm">
                      {formatearHorasHombre(ultimoReporteCuadrilla.horasHombre)}
                    </Chip>
                  )}
                </div>
              )}
            </div>
          )}

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
                  onVerDetalleCuadrilla={onSelectCuadrilla}
                  onAsignarPatrulla={() => setModalAsignarPatrullaAbierto(true)}
                  puedeAsignar={puedeAsignar}
                />
                <IncidenteEvidenciasSection
                  adjuntos={(detalle as IncidenteDetalle & { adjuntos?: AdjuntoEvidencia[] }).adjuntos}
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
