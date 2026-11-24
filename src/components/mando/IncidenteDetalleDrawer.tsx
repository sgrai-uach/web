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
  esSolicitudApoyoCuadrilla,
  formatearEstado,
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
  limpiarTrazabilidadIncidente,
  limpiarTrazabilidadMision,
  setTrazabilidadEstado,
  vincularMisionIncidente,
} from '@/lib/socket/trazabilidadStore';
import {
  esPayloadTrazabilidadValido,
  extraerEstadoInicialNotificacion,
  resolverSiguienteEstadoTrazabilidad,
} from '@/lib/socket/trazabilidadConfig';
import {
  actualizarEstadoMisionTiempoReal,
  registrarHitoMisionTiempoReal,
} from '@/lib/socket/misionesStore';
import {
  normalizarPayloadHitoMision,
  normalizarPayloadMisionActualizada,
} from '@/lib/utils/misionHitos';
import { TrazabilidadLecturaBox } from './TrazabilidadLecturaBox';
import InlineNotice from '@/components/ui/InlineNotice';
import {
  esPayloadAdjuntoCreadoValido,
  type AdjuntoEvidencia,
  type DespacharCuadrillaResponse,
  type DespacharPatrullaResponseData,
  type DictamenAtencionTerreno,
} from '@/types/misiones';
import type { EstadoIncidente } from '@/services/incidentesService';
import { HardHat, CheckCircle2, Ban, AlertTriangle } from 'lucide-react';
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

  const cargarDetalle = useCallback((silencioso = false) => {
    if (!incidenteId) return;
    if (!silencioso || !detalleRef.current) {
      setCargando(true);
    }
    setError(null);

    obtenerDetalleIncidente(incidenteId, userId)
      .then((res) => {
        if (res.exito && res.datos) {
          const incId = res.datos.id;
          const misionesHidratadas = res.datos.misiones.map((m) => {
            vincularMisionIncidente(m.id, incId);
            const tipoUnidad = m.cuadrilla
              ? 'CUADRILLA'
              : m.patrulla
                ? 'PATRULLA'
                : undefined;
            if (m.trazabilidadNotificacion) {
              setTrazabilidadEstado(m.id, m.trazabilidadNotificacion, incId, {
                tipoUnidad,
              });
            }
            const consolidado = getTrazabilidadEstado(m.id) ?? m.trazabilidadNotificacion;
            return consolidado ? { ...m, trazabilidadNotificacion: consolidado } : m;
          });
          // Sincronizar únicamente la misión activa más reciente con el incidente en trazabilidadStore
          const misionActivaMasRecienteConTrazabilidad = [...misionesHidratadas]
            .reverse()
            .find(
              (m) =>
                ['PLANIFICADA', 'DESPACHADA', 'EN_CURSO'].includes(m.estado) &&
                Boolean(m.trazabilidadNotificacion)
            );
          if (misionActivaMasRecienteConTrazabilidad?.trazabilidadNotificacion) {
            const tipoUnidadReciente = misionActivaMasRecienteConTrazabilidad.cuadrilla
              ? 'CUADRILLA'
              : misionActivaMasRecienteConTrazabilidad.patrulla
                ? 'PATRULLA'
                : undefined;
            setTrazabilidadEstado(
              misionActivaMasRecienteConTrazabilidad.id,
              misionActivaMasRecienteConTrazabilidad.trazabilidadNotificacion,
              incId,
              { tipoUnidad: tipoUnidadReciente, reemplazarMisionActiva: true }
            );
          } else {
            limpiarTrazabilidadIncidente(incId);
          }
          const detalleActualizado = { ...res.datos, misiones: misionesHidratadas };
          detalleRef.current = detalleActualizado;
          setDetalle(detalleActualizado);
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

  const tieneCuadrillaActiva = useMemo(() => {
    if (!detalle?.misiones) return false;
    return detalle.misiones.some(
      (m) =>
        (m.tipoMision === 'ATENCION_CUADRILLA' || Boolean(m.cuadrilla)) &&
        ['PLANIFICADA', 'DESPACHADA', 'EN_CURSO'].includes(m.estado)
    );
  }, [detalle]);

  // 1. Visibilidad: Mostrar acción táctica de despacho en EN_ATENCION (siempre) o VERIFICANDO con evaluación completada
  const puedeDespacharCuadrilla = useMemo(() => {
    if (!tienePermisoAsignar || !detalle) return false;
    if (detalle.estado === 'EN_ATENCION') return true;
    return (
      detalle.estado === 'VERIFICANDO' &&
      misionVerificacion?.estado === 'COMPLETADA' &&
      !tieneCuadrillaActiva
    );
  }, [tienePermisoAsignar, detalle, misionVerificacion, tieneCuadrillaActiva]);

  // Cierre de faenas de cuadrilla con incidente aún en EN_ATENCION (espera H86)
  const misionCuadrillaCompletada = useMemo(() => {
    if (!detalle || detalle.estado !== 'EN_ATENCION' || tieneCuadrillaActiva) return null;
    return (
      detalle.misiones.find(
        (m) => m.tipoMision === 'ATENCION_CUADRILLA' && m.estado === 'COMPLETADA'
      ) || null
    );
  }, [detalle, tieneCuadrillaActiva]);

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
      !tieneCuadrillaActiva
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
    const estadoInicialCuadrilla = extraerEstadoInicialNotificacion(resultado);
    setTrazabilidadEstado(
      resultado.mision.id,
      estadoInicialCuadrilla,
      resultado.incidente.id,
      { tipoUnidad: 'CUADRILLA', reemplazarMisionActiva: true }
    );

    setDetalle((prev) =>
      prev
        ? {
            ...prev,
            apoyoSolicitado: false,
            requiereCuadrillaAdicional: false,
            detalleApoyoRequerido: null,
          }
        : prev
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

          const esApoyoCuadrillaEntrante = esSolicitudApoyoCuadrilla(reporteEntranteRef);

          return {
            ...prev,
            tipoAfectacion: nuevoTipo,
            misiones: prev.misiones.map((m) => {
              if (esCierreCuadrilla && m.tipoMision === 'ATENCION_CUADRILLA') {
                const coincide = reporteEntranteRef?.misionId
                  ? m.id === reporteEntranteRef.misionId
                  : ['PLANIFICADA', 'DESPACHADA', 'EN_CURSO'].includes(m.estado);
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
            faenasCuadrillaCompletadas:
              typeof rawDatos?.faenasCuadrillaCompletadas === 'boolean'
                ? rawDatos.faenasCuadrillaCompletadas
                : esCierreCuadrilla
                  ? true
                  : prev.faenasCuadrillaCompletadas,
            apoyoSolicitado:
              typeof rawDatos?.apoyoSolicitado === 'boolean'
                ? rawDatos.apoyoSolicitado
                : esApoyoCuadrillaEntrante
                  ? true
                  : prev.apoyoSolicitado,
            requiereCuadrillaAdicional:
              rawDatos?.apoyoSolicitado === false
                ? false
                : typeof rawDatos?.requiereCuadrillaAdicional === 'boolean'
                  ? rawDatos.requiereCuadrillaAdicional
                  : typeof rawDatos?.requiere_cuadrilla_adicional === 'boolean'
                    ? rawDatos.requiere_cuadrilla_adicional
                    : esApoyoCuadrillaEntrante &&
                        reporteEntranteRef?.requiereCuadrillaAdicional !== undefined
                      ? Boolean(reporteEntranteRef.requiereCuadrillaAdicional) ||
                        Boolean(prev.requiereCuadrillaAdicional)
                      : prev.requiereCuadrillaAdicional,
            detalleApoyoRequerido:
              rawDatos?.apoyoSolicitado === false
                ? null
                : typeof rawDatos?.detalleApoyoRequerido === 'string'
                  ? rawDatos.detalleApoyoRequerido
                  : esApoyoCuadrillaEntrante &&
                      reporteEntranteRef?.detalleApoyoRequerido !== undefined
                    ? reporteEntranteRef.detalleApoyoRequerido
                    : prev.detalleApoyoRequerido,
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

      const tipoUnidadEvento =
        payload.tipoUnidad ??
        (payload.cuadrillaId
          ? 'CUADRILLA'
          : payload.patrullaId
            ? 'PATRULLA'
            : undefined);
      setTrazabilidadEstado(payload.misionId, payload.estado, incidenteId, {
        tipoUnidad: tipoUnidadEvento,
        reemplazarMisionActiva: true,
      });
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

    const handleMisionActualizada = (rawPayload: unknown) => {
      const normalized = normalizarPayloadMisionActualizada(rawPayload);
      if (normalized) {
        actualizarEstadoMisionTiempoReal(normalized);
      }

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
        Boolean(misId && detalleRef.current?.misiones.some((m) => m.id === misId));
      if (!pertenece) return;

      const estadoMisionEv = typeof raw?.estado === 'string' ? raw.estado.toUpperCase() : '';
      const tipoMisionEv =
        typeof raw?.tipoMision === 'string'
          ? raw.tipoMision
          : typeof raw?.tipo_mision === 'string'
            ? raw.tipo_mision
            : '';
      const fechaInicioEv =
        typeof raw?.fechaInicio === 'string'
          ? raw.fechaInicio
          : typeof raw?.fecha_inicio === 'string'
            ? raw.fecha_inicio
            : undefined;

      if (estadoMisionEv === 'EN_CURSO' || estadoMisionEv === 'EN_PROCESO') {
        const esCuadrillaEv = tipoMisionEv === 'ATENCION_CUADRILLA';
        setDetalle((prev) => {
          if (!prev || prev.id !== incidenteId) return prev;
          return {
            ...prev,
            estado: esCuadrillaEv
              ? 'EN_ATENCION'
              : prev.estado === 'REPORTADO'
                ? 'VERIFICANDO'
                : prev.estado,
            misiones: prev.misiones.map((m) => {
              if (misId && m.id !== misId) return m;
              if (!misId && tipoMisionEv && m.tipoMision !== tipoMisionEv) return m;
              return {
                ...m,
                estado: estadoMisionEv as typeof m.estado,
                fechaInicio: fechaInicioEv ?? m.fechaInicio,
                cuadrilla:
                  esCuadrillaEv && m.cuadrilla
                    ? { ...m.cuadrilla, estado: 'EN_MISION' }
                    : m.cuadrilla,
              };
            }),
          };
        });
      }

      cargarDetalle(true);
    };

    const handleMisionHito = (raw: unknown) => {
      const normalized = normalizarPayloadHitoMision(raw);
      if (!normalized) return;

      registrarHitoMisionTiempoReal(normalized);

      const detalleActual = detalleRef.current;
      if (!detalleActual || detalleActual.id !== incidenteId) return;
      const perteneceAlIncidente = detalleActual.misiones.some(
        (m) => m.id === normalized.misionId
      );
      if (!perteneceAlIncidente || !normalized.nuevoEstadoMision) return;

      setDetalle((prev) => {
        if (!prev || prev.id !== incidenteId) return prev;
        return {
          ...prev,
          misiones: prev.misiones.map((m) =>
            m.id === normalized.misionId
              ? {
                  ...m,
                  estado: normalized.nuevoEstadoMision as typeof m.estado,
                  cuadrilla:
                    m.cuadrilla && normalized.nuevoEstadoMision === 'EN_CURSO'
                      ? { ...m.cuadrilla, estado: 'EN_MISION' }
                      : m.cuadrilla,
                }
              : m
          ),
        };
      });
    };

    const handleMisionRechazada = (payload: unknown) => {
      const p = payload as Record<string, unknown> | null | undefined;
      const raw = (p?.datos || p?.data || p) as Record<string, unknown> | null | undefined;
      const incId = typeof raw?.incidenteId === 'string' ? raw.incidenteId : undefined;
      const misId = typeof raw?.misionId === 'string' ? raw.misionId : undefined;
      if (incId === incidenteId) {
        if (misId) {
          limpiarTrazabilidadMision(misId, incId);
        } else {
          limpiarTrazabilidadIncidente(incId);
        }
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

    const handleMisionApoyoSolicitado = (rawPayload: unknown) => {
      const p = rawPayload as Record<string, unknown> | null | undefined;
      const raw = (p?.datos || p?.data || p) as Record<string, unknown> | null | undefined;
      if (!raw || typeof raw !== 'object') return;
      const incId =
        typeof raw.incidenteId === 'string'
          ? raw.incidenteId
          : typeof raw.incidente_id === 'string'
            ? raw.incidente_id
            : undefined;
      const misId =
        typeof raw.misionId === 'string'
          ? raw.misionId
          : typeof raw.mision_id === 'string'
            ? raw.mision_id
            : undefined;

      const pertenece =
        incId === incidenteId ||
        Boolean(misId && detalleRef.current?.misiones.some((m) => m.id === misId));
      if (!pertenece) return;

      const detalleApoyo =
        typeof raw.detalleApoyoRequerido === 'string'
          ? raw.detalleApoyoRequerido
          : typeof raw.detalle_apoyo_requerido === 'string'
            ? raw.detalle_apoyo_requerido
            : null;
      const requiereApoyo =
        typeof raw.requiereApoyoAdicional === 'boolean'
          ? raw.requiereApoyoAdicional
          : typeof raw.requiere_apoyo_adicional === 'boolean'
            ? raw.requiere_apoyo_adicional
            : true;
      const requiereCuadrillaAdicional =
        requiereApoyo === false
          ? false
          : typeof raw.requiereCuadrillaAdicional === 'boolean'
            ? raw.requiereCuadrillaAdicional
            : typeof raw.requiere_cuadrilla_adicional === 'boolean'
              ? raw.requiere_cuadrilla_adicional
              : false;

      setDetalle((prev) => {
        if (!prev || prev.id !== incidenteId) return prev;
        return {
          ...prev,
          apoyoSolicitado: Boolean(requiereApoyo),
          requiereCuadrillaAdicional,
          detalleApoyoRequerido: Boolean(requiereApoyo)
            ? detalleApoyo ?? prev.detalleApoyoRequerido ?? null
            : null,
        };
      });

      cargarDetalle(true);
    };

    socket.on('connect', asegurarSalasEncargado);
    socket.on('incidente:actualizado', handleActualizadoSocket);
    socket.on('notificacion:trazabilidad_actualizada', handleTrazabilidad);
    socket.on('mision:actualizada', handleMisionActualizada);
    socket.on('mision:hito_registrado', handleMisionHito);
    socket.on('mision:rechazada', handleMisionRechazada);
    socket.on('incidente:actualizado', handleIncidenteActualizado);
    socket.on('adjunto:creado', handleAdjuntoCreado);
    socket.on('mision:apoyo_solicitado', handleMisionApoyoSolicitado);

    return () => {
      socket.off('connect', asegurarSalasEncargado);
      socket.off('incidente:actualizado', handleActualizadoSocket);
      socket.off('notificacion:trazabilidad_actualizada', handleTrazabilidad);
      socket.off('mision:actualizada', handleMisionActualizada);
      socket.off('mision:hito_registrado', handleMisionHito);
      socket.off('mision:rechazada', handleMisionRechazada);
      socket.off('incidente:actualizado', handleIncidenteActualizado);
      socket.off('adjunto:creado', handleAdjuntoCreado);
      socket.off('mision:apoyo_solicitado', handleMisionApoyoSolicitado);
    };
  }, [incidenteId, cargarDetalle]);

  const handleAsignacionExitosa = (data: DespacharPatrullaResponseData) => {
    const estadoInicial = extraerEstadoInicialNotificacion(data);
    setTrazabilidadEstado(data.mision.id, estadoInicial, data.incidente.id, {
      tipoUnidad: 'PATRULLA',
      reemplazarMisionActiva: true,
    });

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

  const misionUnidadActiva =
    detalle?.misiones.find(
      (m) =>
        (Boolean(m.cuadrilla) || Boolean(m.patrulla)) &&
        ['PLANIFICADA', 'DESPACHADA', 'EN_CURSO'].includes(m.estado)
    ) ?? null;
  const tipoUnidadActivaResumen = misionUnidadActiva?.cuadrilla
    ? 'CUADRILLA'
    : misionUnidadActiva?.patrulla
      ? 'PATRULLA'
      : null;
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

          {/* Banner prioritario de solicitud de apoyo adicional en terreno (HU-44) */}
          {detalle && detalle.apoyoSolicitado && (
            <div
              data-testid="banner-apoyo-solicitado"
              style={{
                padding: 'var(--space-2, 8px) var(--space-4, 16px)',
                borderBottom: detalle.requiereCuadrillaAdicional
                  ? '1px solid #FFCDD2'
                  : '1px solid #FFE0B2',
              }}
            >
              <InlineNotice
                variant={detalle.requiereCuadrillaAdicional ? 'error' : 'warning'}
                title={
                  detalle.requiereCuadrillaAdicional
                    ? 'Cuadrilla Adicional Solicitada en Terreno'
                    : 'Apoyo Adicional Solicitado en Terreno'
                }
                icon={<AlertTriangle size={18} aria-hidden="true" />}
              >
                <p style={{ margin: 0, fontSize: '0.8125rem' }}>
                  {detalle.detalleApoyoRequerido?.trim() ||
                    'La cuadrilla en terreno solicitó refuerzos adicionales para continuar la atención.'}
                </p>
              </InlineNotice>
            </div>
          )}

          {/* Barra táctica de despacho de cuadrilla operativa (HU-21 / Regla ICS §3.2 / HU-44) */}
          {puedeDespacharCuadrilla && detalle && (() => {
            const apoyoActivo = Boolean(detalle.apoyoSolicitado);
            const apoyoCuadrillaRojo = Boolean(apoyoActivo && detalle.requiereCuadrillaAdicional);
            const apoyoAmbar = Boolean(apoyoActivo && !detalle.requiereCuadrillaAdicional);

            return (
              <div
                data-testid="barra-tactica-despacho-cuadrilla"
                style={{
                  backgroundColor: apoyoCuadrillaRojo
                    ? 'var(--color-danger-bg, #FFEBEE)'
                    : apoyoAmbar
                      ? 'var(--color-warning-bg, #FFF3E0)'
                      : 'var(--color-bg-light, #ECEFF3)',
                  padding: 'var(--space-3, 12px) var(--space-4, 16px)',
                  borderBottom: apoyoCuadrillaRojo
                    ? '2px solid #FFCDD2'
                    : apoyoAmbar
                      ? '2px solid #FFE0B2'
                      : '2px solid var(--border-color-neutral, #DFE3E8)',
                  borderLeft: apoyoCuadrillaRojo
                    ? '4px solid var(--color-danger, #D32F2F)'
                    : apoyoAmbar
                      ? '4px solid var(--color-warning, #E65100)'
                      : 'none',
                  borderRadius: 0,
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
                      <strong
                        style={{
                          fontSize: '0.875rem',
                          color: apoyoCuadrillaRojo
                            ? 'var(--color-danger, #D32F2F)'
                            : apoyoAmbar
                              ? 'var(--color-warning, #E65100)'
                              : 'var(--color-primary-teal-dark, #14505A)',
                        }}
                      >
                        Intervención Táctica Operativa
                      </strong>
                      {apoyoCuadrillaRojo && (
                        <Chip
                          data-testid="badge-cuadrilla-adicional-despacho"
                          variant="danger"
                          size="sm"
                          icon={<AlertTriangle size={11} strokeWidth={2.2} />}
                        >
                          Cuadrilla adicional solicitada
                        </Chip>
                      )}
                      {apoyoAmbar && (
                        <Chip
                          data-testid="badge-apoyo-adicional-despacho"
                          variant="warning"
                          size="sm"
                          icon={<AlertTriangle size={11} strokeWidth={2.2} />}
                        >
                          Apoyo adicional solicitado
                        </Chip>
                      )}
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
                            borderRadius: 0,
                          }}
                        >
                          <CheckCircle2 size={12} />
                          <span>Verificación Completada</span>
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dark, #2B2B2B)', marginTop: '2px' }}>
                      {detalle.estado === 'EN_ATENCION' ? (
                        apoyoCuadrillaRojo ? (
                          <span>
                            Una cuadrilla en terreno solicitó{' '}
                            <strong>cuadrilla adicional</strong>. Despacha una nueva cuadrilla con misión de apoyo distinta.
                          </span>
                        ) : apoyoAmbar ? (
                          <span>
                            Cuadrilla en terreno reportó requerimiento de apoyo adicional. Puedes despachar refuerzo operativo si es necesario.
                          </span>
                        ) : tieneCuadrillaActiva ? (
                          <span style={{ color: 'var(--color-text-muted, #5F676E)' }}>
                            Cuadrilla actualmente en atención. Puedes despachar una cuadrilla adicional con una misión distinta.
                          </span>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted, #5F676E)' }}>
                            Faenas previas cerradas. Puedes despachar una nueva cuadrilla operativa antes de resolver el incidente.
                          </span>
                        )
                      ) : detalle.estado === 'REPORTADO' ? (
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
                            Patrulla asignada: {misionVerificacion.patrulla.nombre} ({formatearEstado(misionVerificacion.estado)}).
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
                    variant={apoyoCuadrillaRojo ? 'destructive' : 'primary'}
                    size="sm"
                    onClick={() => setModalCuadrillaAbierto(true)}
                    style={
                      apoyoAmbar
                        ? {
                            backgroundColor: 'var(--color-warning, #E65100)',
                            borderColor: '#BF360C',
                            color: '#FFFFFF',
                            borderRadius: 0,
                          }
                        : { borderRadius: 0 }
                    }
                    title={
                      detalle.estado === 'EN_ATENCION'
                        ? 'Despachar cuadrilla adicional con misión de apoyo táctico'
                        : 'Despachar cuadrilla operativa a este incidente'
                    }
                    aria-label="Despachar Cuadrilla Operativa"
                  >
                    <HardHat size={15} style={{ marginRight: '6px' }} />
                    <span>Despachar Cuadrilla</span>
                  </Button>
                </div>
              </div>
            );
          })()}

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
                {misionUnidadActiva && (
                  <TrazabilidadLecturaBox
                    variante="drawer"
                    estado={misionUnidadActiva.trazabilidadNotificacion}
                    tipoUnidad={tipoUnidadActivaResumen}
                    testId="drawer-trazabilidad-resumen"
                    metaDerecha={`${misionUnidadActiva.codigo} · ${
                      misionUnidadActiva.cuadrilla?.nombre ??
                      misionUnidadActiva.patrulla?.nombre
                    }`}
                  />
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
