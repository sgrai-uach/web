'use client';

import { useEffect, useState, useRef } from 'react';
import { getSocket } from '@/lib/socket/client';
import { esPayloadTrazabilidadValido } from '@/lib/socket/trazabilidadConfig';
import { setTrazabilidadEstado } from '@/lib/socket/trazabilidadStore';
import {
  actualizarEstadoMisionTiempoReal,
  registrarHitoMisionTiempoReal,
} from '@/lib/socket/misionesStore';
import {
  normalizarPayloadHitoMision,
  normalizarPayloadMisionActualizada,
  obtenerConfigHito,
} from '@/lib/utils/misionHitos';
import type { EstadoIncidente, PrioridadIncidente } from '@/services/incidentesService';
import type {
  MisionActualizadaPayload,
  MisionHitoRegistradoPayload,
} from '@/types/misiones';

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
  datos: {
    id: string;
    codigo: string;
    nuevoEstado: EstadoIncidente;
    prioridad: PrioridadIncidente;
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
  onMisionHitoRegistrado?: (payload: MisionHitoRegistradoPayload) => void;
  onMisionActualizada?: (payload: MisionActualizadaPayload) => void;
  enabled?: boolean;
}

/**
 * Hook para la conexión en tiempo real del Encargado de Centro de Mando.
 * Se une a la sala 'sala:encargados' y escucha la creación y actualización de incidentes,
 * aceptación y actualización de misiones (H36/H40), llegada a terreno (H42),
 * trazabilidad (H35) y rechazos de misiones (H41/H69).
 */
export function useEncargadoKanbanSocket({
  onIncidenteCreado,
  onIncidenteActualizado,
  onMisionRechazada,
  onNotificacionTrazabilidadActualizada,
  onMisionHitoRegistrado,
  onMisionActualizada,
  enabled = true,
}: UseEncargadoKanbanSocketOptions = {}) {
  const [conectado, setConectado] = useState(false);
  const [ultimoEvento, setUltimoEvento] = useState<string | null>(null);

  const creadoRef = useRef(onIncidenteCreado);
  const actualizadoRef = useRef(onIncidenteActualizado);
  const rechazadaRef = useRef(onMisionRechazada);
  const eventosProcesadosRef = useRef<Map<string, number>>(new Map());
  const trazabilidadRef = useRef(onNotificacionTrazabilidadActualizada);
  const misionHitoRef = useRef(onMisionHitoRegistrado);
  const misionActualizadaRef = useRef(onMisionActualizada);

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
    misionHitoRef.current = onMisionHitoRegistrado;
  }, [onMisionHitoRegistrado]);

  useEffect(() => {
    misionActualizadaRef.current = onMisionActualizada;
  }, [onMisionActualizada]);

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

    const handleCreado = (payload: IncidenteCreadoPayload) => {
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
          actualizadoEn:
            typeof rawDatos?.actualizadoEn === 'string'
              ? rawDatos.actualizadoEn
              : new Date().toISOString(),
        },
        emitidoEn:
          typeof p?.emitidoEn === 'string' ? p.emitidoEn : new Date().toISOString(),
      };

      setUltimoEvento(
        `Actualizado: ${normalizedPayload.datos.codigo || ''} → ${normalizedPayload.datos.nuevoEstado}`
      );
      if (actualizadoRef.current) {
        actualizadoRef.current(normalizedPayload);
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

    const handleMisionHitoRegistrado = (payload: unknown) => {
      const normalized = normalizarPayloadHitoMision(payload);
      if (!normalized) return;

      registrarHitoMisionTiempoReal(normalized);
      const config = obtenerConfigHito(normalized.hito);
      setUltimoEvento(
        `${config.etiqueta}: ${normalized.codigoMision || normalized.misionId}`
      );
      if (misionHitoRef.current) {
        misionHitoRef.current(normalized);
      }
    };

    const handleMisionActualizada = (payload: unknown) => {
      const normalized = normalizarPayloadMisionActualizada(payload);
      if (!normalized) return;

      actualizarEstadoMisionTiempoReal(normalized);
      setUltimoEvento(
        `Misión actualizada: ${normalized.codigo || normalized.misionId} → ${normalized.estado}`
      );
      if (misionActualizadaRef.current) {
        misionActualizadaRef.current(normalized);
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('incidente:creado', handleCreado);
    socket.on('incidente:actualizado', handleActualizado);
    socket.on('mision:rechazada', handleMisionRechazada);
    socket.on('notificacion:trazabilidad_actualizada', handleTrazabilidad);
    socket.on('mision:hito_registrado', handleMisionHitoRegistrado);
    socket.on('mision:actualizada', handleMisionActualizada);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('incidente:creado', handleCreado);
      socket.off('incidente:actualizado', handleActualizado);
      socket.off('mision:rechazada', handleMisionRechazada);
      socket.off('notificacion:trazabilidad_actualizada', handleTrazabilidad);
      socket.off('mision:hito_registrado', handleMisionHitoRegistrado);
      socket.off('mision:actualizada', handleMisionActualizada);
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
