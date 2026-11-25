'use client';

import { useEffect, useState, useRef } from 'react';
import { getSocket } from '@/lib/socket/client';
import { esPayloadTrazabilidadValido } from '@/lib/socket/trazabilidadConfig';
import { setTrazabilidadEstado } from '@/lib/socket/trazabilidadStore';
import type {
  EstadoIncidente,
  PrioridadIncidente,
  ReporteEvaluacionTerreno,
} from '@/services/incidentesService';
import type { DictamenAtencionTerreno } from '@/types/misiones';
import {
  esJustificacionSinCambios,
  esReporteVerificacionCierre,
  formatearDictamenTerreno,
  formatearEstado,
  formatearPrioridad,
  fueTipologiaModificada,
} from '@/lib/utils/estadoUtils';

export interface IncidenteCreadoPayload {
  evento: 'incidente:creado';
  datos: {
    id: string;
    codigo: string;
    tipoAfectacion: string;
    direccion: string;
    latitud: number;
    longitud: number;
    estado: 'REPORTADO';
    prioridad: PrioridadIncidente;
    creadoEn: string;
  };
  emitidoEn: string;
}

export interface IncidenteActualizadoPayload {
  evento: 'incidente:actualizado';
  /** Indica que el payload fue sintetizado desde mision:actualizada para sincronizar el tablero sin emitir toast duplicado */
  esSintetico?: boolean;
  datos: {
    id: string;
    codigo: string;
    nuevoEstado: EstadoIncidente;
    prioridad?: PrioridadIncidente;
    prioridadSugerida?: PrioridadIncidente | null;
    justificacionPrioridad?: string | null;
    requiereAsistenciaSocial?: boolean;
    verificado?: boolean;
    dictamen?: DictamenAtencionTerreno | null;
    motivoNoAbordable?: string | null;
    fechaCierre?: string | null;
    tipoIncidenteId?: string;
    tipoAnterior?: string;
    tipoAfectacion?: string;
    justificacion?: string;
    reporteTerreno?: ReporteEvaluacionTerreno | null;
    actualizadoEn: string;
  };
  emitidoEn: string;
}

export interface MisionRechazadaPayload {
  misionId: string;
  codigo: string;
  tipoMision: string;
  motivo: string;
  justificacionRechazo?: string;
  patrullaId?: string | null;
  patrullaNombre?: string | null;
  incidenteId?: string | null;
  incidenteCodigo?: string | null;
  rechazadoPorId?: string | null;
  rechazadoEn?: string;
}

export interface NotificacionTrazabilidadPayload {
  notificacionId: string;
  misionId: string;
  patrullaId: string;
  estado: 'PENDIENTE_ENVIO' | 'ENVIADA' | 'RECIBIDA' | 'LEIDA';
  intentosEnvio?: number;
  creadaAt?: string;
  enviadaAt?: string | null;
  recibidaAt?: string | null;
  leidaAt?: string | null;
  actualizadoEn?: string;
}

export interface UseEncargadoKanbanSocketOptions {
  onIncidenteCreado?: (payload: IncidenteCreadoPayload) => void;
  onIncidenteActualizado?: (payload: IncidenteActualizadoPayload) => void;
  onMisionRechazada?: (payload: MisionRechazadaPayload) => void;
  onNotificacionTrazabilidadActualizada?: (payload: NotificacionTrazabilidadPayload) => void;
  enabled?: boolean;
}

/**
 * Hook para la conexión en tiempo real del Encargado de Centro de Mando.
 * Se une a la sala 'sala:encargados' y escucha la creación y actualización de incidentes, rechazos de misiones y trazabilidad.
 */
export function useEncargadoKanbanSocket({
  onIncidenteCreado,
  onIncidenteActualizado,
  onMisionRechazada,
  onNotificacionTrazabilidadActualizada,
  enabled = true,
}: UseEncargadoKanbanSocketOptions = {}) {
  const [conectado, setConectado] = useState(false);
  const [ultimoEvento, setUltimoEvento] = useState<string | null>(null);

  const creadoRef = useRef(onIncidenteCreado);
  const actualizadoRef = useRef(onIncidenteActualizado);
  const rechazadaRef = useRef(onMisionRechazada);
  const trazabilidadRef = useRef(onNotificacionTrazabilidadActualizada);
  const eventosProcesadosRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    creadoRef.current = onIncidenteCreado;
  }, [onIncidenteCreado]);

  useEffect(() => {
    actualizadoRef.current = onIncidenteActualizado;
  }, [onIncidenteActualizado]);

  useEffect(() => {
    rechazadaRef.current = onMisionRechazada;
  }, [onMisionRechazada]);

  useEffect(() => {
    trazabilidadRef.current = onNotificacionTrazabilidadActualizada;
  }, [onNotificacionTrazabilidadActualizada]);

  useEffect(() => {
    if (!enabled) return;

    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      setConectado(true);
      socket.emit('join', 'encargado');
      socket.emit('unirse', 'sala:encargados');
      socket.emit('join', 'mapa');
      socket.emit('unirse', 'mapa');
    };

    const onDisconnect = () => {
      setConectado(false);
    };

    if (socket.connected) {
      socket.emit('join', 'encargado');
      socket.emit('unirse', 'sala:encargados');
      socket.emit('join', 'mapa');
      socket.emit('unirse', 'mapa');
      queueMicrotask(() => {
        setConectado(true);
      });
    }

    const esEventoDuplicado = (clave: string, ventanaMs = 4000): boolean => {
      const ahora = Date.now();
      const ultimoProc = eventosProcesadosRef.current.get(clave);
      if (ultimoProc && ahora - ultimoProc < ventanaMs) {
        return true;
      }
      eventosProcesadosRef.current.set(clave, ahora);
      return false;
    };

    const handleCreado = (payload: IncidenteCreadoPayload) => {
      const incId = payload?.datos?.id || payload?.datos?.codigo;
      if (incId && esEventoDuplicado(`inc-creado:${incId}`)) {
        return;
      }
      setUltimoEvento(`Nuevo incidente: ${payload?.datos?.codigo || ''}`);
      if (creadoRef.current) {
        creadoRef.current(payload);
      }
    };

    const handleActualizado = (payload: unknown) => {
      const p = payload as Record<string, unknown> | null | undefined;
      const rawDatos = (p?.datos || p?.data || p) as Record<string, unknown> | null | undefined;
      const id =
        typeof rawDatos?.id === 'string'
          ? rawDatos.id
          : typeof rawDatos?.incidenteId === 'string'
            ? rawDatos.incidenteId
            : undefined;
      const nuevoEstado =
        typeof rawDatos?.nuevoEstado === 'string'
          ? rawDatos.nuevoEstado
          : typeof rawDatos?.estado === 'string'
            ? rawDatos.estado
            : undefined;
      if (!id) return;

      const rawReporte =
        rawDatos?.reporteTerreno && typeof rawDatos.reporteTerreno === 'object'
          ? (rawDatos.reporteTerreno as ReporteEvaluacionTerreno)
          : undefined;

      const dictamenRaw =
        typeof rawDatos?.dictamen === 'string'
          ? rawDatos.dictamen
          : typeof rawDatos?.dictamenTerreno === 'string'
            ? rawDatos.dictamenTerreno
            : typeof rawReporte?.dictamen === 'string'
              ? rawReporte.dictamen
              : undefined;
      const dictamen =
        dictamenRaw === 'REQUIERE_CUADRILLA' || dictamenRaw === 'NO_ABORDABLE'
          ? (dictamenRaw as DictamenAtencionTerreno)
          : undefined;

      const motivoNoAbordable =
        typeof rawDatos?.motivoNoAbordable === 'string'
          ? rawDatos.motivoNoAbordable
          : typeof rawDatos?.motivo_no_abordable === 'string'
            ? rawDatos.motivo_no_abordable
            : typeof rawReporte?.motivoNoAbordable === 'string'
              ? rawReporte.motivoNoAbordable
              : undefined;

      const fechaCierre =
        typeof rawDatos?.fechaCierre === 'string'
          ? rawDatos.fechaCierre
          : typeof rawDatos?.fecha_cierre === 'string'
            ? rawDatos.fecha_cierre
            : undefined;

      const reporteKey = rawReporte?.id || rawReporte?.versionReporte || '';
      const tipoKey = typeof rawDatos?.tipoAfectacion === 'string' ? rawDatos.tipoAfectacion : '';
      const dictamenKey = dictamen || '';
      if (
        esEventoDuplicado(
          `inc-act:${id}:${nuevoEstado || 'VERIFICANDO'}:${reporteKey}:${tipoKey}:${dictamenKey}`
        )
      ) {
        return;
      }

      const justificacionPrioridad =
        rawDatos?.justificacionPrioridad === null
          ? null
          : typeof rawDatos?.justificacionPrioridad === 'string'
            ? rawDatos.justificacionPrioridad
            : rawDatos?.justificacion_prioridad === null
              ? null
              : typeof rawDatos?.justificacion_prioridad === 'string'
                ? rawDatos.justificacion_prioridad
                : rawReporte && 'justificacionPrioridad' in rawReporte
                  ? rawReporte.justificacionPrioridad
                  : undefined;

      const prioridadSugerida =
        typeof rawDatos?.prioridadSugerida === 'string'
          ? (rawDatos.prioridadSugerida as PrioridadIncidente)
          : typeof rawDatos?.prioridad_sugerida === 'string'
            ? (rawDatos.prioridad_sugerida as PrioridadIncidente)
            : (rawReporte?.prioridadSugerida as PrioridadIncidente | undefined) ?? undefined;

      const requiereAsistenciaSocial =
        typeof rawDatos?.requiereAsistenciaSocial === 'boolean'
          ? rawDatos.requiereAsistenciaSocial
          : typeof rawDatos?.requiere_asistencia_social === 'boolean'
            ? rawDatos.requiere_asistencia_social
            : typeof rawReporte?.requiereAsistenciaSocial === 'boolean'
              ? rawReporte.requiereAsistenciaSocial
              : undefined;

      const normalizedPayload: IncidenteActualizadoPayload = {
        evento: 'incidente:actualizado',
        datos: {
          id,
          codigo: typeof rawDatos?.codigo === 'string' ? rawDatos.codigo : '',
          nuevoEstado: (nuevoEstado as EstadoIncidente) || 'VERIFICANDO',
          prioridad:
            typeof rawDatos?.prioridad === 'string'
              ? (rawDatos.prioridad as PrioridadIncidente)
              : ('MEDIA' as PrioridadIncidente),
          prioridadSugerida,
          justificacionPrioridad,
          requiereAsistenciaSocial,
          verificado:
            typeof rawDatos?.verificado === 'boolean' ? rawDatos.verificado : undefined,
          dictamen,
          motivoNoAbordable,
          fechaCierre,
          tipoIncidenteId:
            typeof rawDatos?.tipoIncidenteId === 'string'
              ? rawDatos.tipoIncidenteId
              : undefined,
          tipoAnterior:
            typeof rawDatos?.tipoAnterior === 'string'
              ? rawDatos.tipoAnterior
              : typeof rawDatos?.tipo_anterior === 'string'
                ? rawDatos.tipo_anterior
                : undefined,
          tipoAfectacion:
            typeof rawDatos?.tipoAfectacion === 'string'
              ? rawDatos.tipoAfectacion
              : undefined,
          justificacion:
            typeof rawDatos?.justificacion === 'string'
              ? rawDatos.justificacion
              : justificacionPrioridad ?? undefined,
          reporteTerreno: rawReporte,
          actualizadoEn:
            typeof rawDatos?.actualizadoEn === 'string'
              ? rawDatos.actualizadoEn
              : new Date().toISOString(),
        },
        emitidoEn:
          typeof p?.emitidoEn === 'string' ? p.emitidoEn : new Date().toISOString(),
      };

      const prioridadLegible = formatearPrioridad(normalizedPayload.datos.prioridad);
      if (
        normalizedPayload.datos.nuevoEstado === 'NO_ABORDABLE' ||
        normalizedPayload.datos.dictamen === 'NO_ABORDABLE'
      ) {
        const motivoTexto = normalizedPayload.datos.motivoNoAbordable
          ? `: ${normalizedPayload.datos.motivoNoAbordable}`
          : '';
        setUltimoEvento(
          `Incidente ${normalizedPayload.datos.codigo || ''} declarado No Abordable en terreno${motivoTexto}`
        );
      } else if (
        normalizedPayload.datos.dictamen === 'REQUIERE_CUADRILLA' ||
        (normalizedPayload.datos.reporteTerreno &&
          esReporteVerificacionCierre(normalizedPayload.datos.reporteTerreno))
      ) {
        const dictamenTexto = normalizedPayload.datos.dictamen
          ? formatearDictamenTerreno(normalizedPayload.datos.dictamen)
          : 'Requiere Cuadrilla';
        setUltimoEvento(
          `Verificación finalizada en ${normalizedPayload.datos.codigo || 'incidente'}: ${dictamenTexto} (Prioridad: ${prioridadLegible})`
        );
      } else if (normalizedPayload.datos.reporteTerreno) {
        const numVer = Number(normalizedPayload.datos.reporteTerreno.versionReporte || 1);
        const esRect = Boolean(
          normalizedPayload.datos.reporteTerreno.esRectificacion || numVer > 1
        );
        const etiquetaVer = esRect
          ? `Reporte #${numVer} (Rectificación)`
          : 'Reporte #1 (Evaluación Inicial)';
        setUltimoEvento(
          `${etiquetaVer} recibido en ${normalizedPayload.datos.codigo || 'incidente'} → Prioridad: ${prioridadLegible}`
        );
      } else if (normalizedPayload.datos.tipoAfectacion && normalizedPayload.datos.justificacion) {
        const sinCambiosTipologia = normalizedPayload.datos.tipoAnterior
          ? !fueTipologiaModificada(
              normalizedPayload.datos.tipoAnterior,
              normalizedPayload.datos.tipoAfectacion
            )
          : esJustificacionSinCambios(normalizedPayload.datos.justificacion);

        setUltimoEvento(
          sinCambiosTipologia
            ? `Tipología confirmada sin cambios: ${normalizedPayload.datos.codigo || ''} (${normalizedPayload.datos.tipoAfectacion}, Prioridad: ${prioridadLegible})`
            : `Tipología reclasificada: ${normalizedPayload.datos.codigo || ''} a ${normalizedPayload.datos.tipoAfectacion} (Prioridad: ${prioridadLegible})`
        );
      } else {
        const estadoLegible = formatearEstado(normalizedPayload.datos.nuevoEstado);
        setUltimoEvento(
          `Actualizado: ${normalizedPayload.datos.codigo || ''} → ${estadoLegible} (Prioridad: ${prioridadLegible})`
        );
      }
      if (actualizadoRef.current) {
        actualizadoRef.current(normalizedPayload);
      }
    };

    const handleMisionEvent = (payload: unknown) => {
      const p = payload as Record<string, unknown> | null | undefined;
      const raw = (p?.datos || p?.data || p) as Record<string, unknown> | null | undefined;
      const incidenteId =
        typeof raw?.incidenteId === 'string'
          ? raw.incidenteId
          : typeof raw?.incidente_id === 'string'
            ? raw.incidente_id
            : undefined;
      const estadoMision = typeof raw?.estado === 'string' ? raw.estado : undefined;
      const tipoMision =
        typeof raw?.tipoMision === 'string'
          ? raw.tipoMision
          : typeof raw?.tipo_mision === 'string'
            ? raw.tipo_mision
            : undefined;
      const codigoMision = typeof raw?.codigo === 'string' ? raw.codigo : '';

      // Regla de Negocio (H69): Solo cuando la patrulla ACEPTA la misión (estado EN_CURSO)
      // el incidente transiciona a la columna VERIFICANDO.
      if (incidenteId && (tipoMision === 'VERIFICACION' || !tipoMision)) {
        if (estadoMision === 'EN_CURSO') {
          if (esEventoDuplicado(`mision-ev:${incidenteId}:${estadoMision}`)) {
            return;
          }
          const syntheticIncPayload: IncidenteActualizadoPayload = {
            evento: 'incidente:actualizado',
            esSintetico: true,
            datos: {
              id: incidenteId,
              codigo: typeof raw?.incidenteCodigo === 'string' ? raw.incidenteCodigo : '',
              nuevoEstado: 'VERIFICANDO',
              ...(typeof raw?.prioridad === 'string'
                ? { prioridad: raw.prioridad as PrioridadIncidente }
                : {}),
              actualizadoEn:
                typeof raw?.actualizadoEn === 'string'
                  ? raw.actualizadoEn
                  : new Date().toISOString(),
            },
            emitidoEn: new Date().toISOString(),
          };
          if (actualizadoRef.current) {
            actualizadoRef.current(syntheticIncPayload);
          }
          setUltimoEvento(`Misión ${codigoMision} aceptada: Incidente en verificación`);
        }
      }
    };

    const handleMisionRechazada = (payload: unknown) => {
      const p = payload as Record<string, unknown> | null | undefined;
      const raw = (p?.datos || p?.data || p) as Record<string, unknown> | null | undefined;
      const misionId =
        typeof raw?.misionId === 'string'
          ? raw.misionId
          : typeof raw?.id === 'string'
            ? raw.id
            : '';
      const ahora = Date.now();

      if (!misionId && typeof raw?.codigo !== 'string') return;

      // Deduplicación reactiva ante emisiones múltiples por broadcast o varias salas concurrentes
      if (misionId) {
        const ultimaVez = eventosProcesadosRef.current.get(misionId);
        if (ultimaVez && ahora - ultimaVez < 5000) {
          return;
        }
        eventosProcesadosRef.current.set(misionId, ahora);
        if (eventosProcesadosRef.current.size > 100) {
          for (const [key, timestamp] of eventosProcesadosRef.current.entries()) {
            if (ahora - timestamp > 10000) {
              eventosProcesadosRef.current.delete(key);
            }
          }
        }
      }

      const normalizedPayload: MisionRechazadaPayload = {
        misionId,
        codigo: typeof raw?.codigo === 'string' ? raw.codigo : '',
        tipoMision: typeof raw?.tipoMision === 'string' ? raw.tipoMision : 'VERIFICACION',
        motivo:
          typeof raw?.motivo === 'string'
            ? raw.motivo
            : typeof raw?.justificacionRechazo === 'string'
              ? raw.justificacionRechazo
              : 'Sin motivo especificado',
        justificacionRechazo:
          typeof raw?.justificacionRechazo === 'string'
            ? raw.justificacionRechazo
            : typeof raw?.motivo === 'string'
              ? raw.motivo
              : undefined,
        patrullaId: typeof raw?.patrullaId === 'string' ? raw.patrullaId : null,
        patrullaNombre: typeof raw?.patrullaNombre === 'string' ? raw.patrullaNombre : null,
        incidenteId: typeof raw?.incidenteId === 'string' ? raw.incidenteId : null,
        incidenteCodigo: typeof raw?.incidenteCodigo === 'string' ? raw.incidenteCodigo : null,
        rechazadoPorId: typeof raw?.rechazadoPorId === 'string' ? raw.rechazadoPorId : null,
        rechazadoEn:
          typeof raw?.rechazadoEn === 'string' ? raw.rechazadoEn : new Date().toISOString(),
      };

      setUltimoEvento(`Misión rechazada: ${normalizedPayload.codigo}`);
      if (rechazadaRef.current) {
        rechazadaRef.current(normalizedPayload);
      }
    };

    const handleTrazabilidad = (payload: unknown) => {
      if (!esPayloadTrazabilidadValido(payload)) return;

      const typedPayload = payload as NotificacionTrazabilidadPayload;
      setTrazabilidadEstado(typedPayload.misionId, typedPayload.estado);
      setUltimoEvento(`Trazabilidad misión: ${typedPayload.estado}`);
      if (trazabilidadRef.current) {
        trazabilidadRef.current(typedPayload);
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('incidente:creado', handleCreado);
    socket.on('incidente:actualizado', handleActualizado);
    socket.on('mision:creada', handleMisionEvent);
    socket.on('mision:actualizada', handleMisionEvent);
    socket.on('mision:rechazada', handleMisionRechazada);
    socket.on('notificacion:trazabilidad_actualizada', handleTrazabilidad);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('incidente:creado', handleCreado);
      socket.off('incidente:actualizado', handleActualizado);
      socket.off('mision:creada', handleMisionEvent);
      socket.off('mision:actualizada', handleMisionEvent);
      socket.off('mision:rechazada', handleMisionRechazada);
      socket.off('notificacion:trazabilidad_actualizada', handleTrazabilidad);
      socket.emit('leave', 'encargado');
      socket.emit('salir', 'sala:encargados');
      socket.emit('leave', 'mapa');
      socket.emit('salir', 'mapa');
    };
  }, [enabled]);

  return {
    conectado,
    ultimoEvento,
  };
}
