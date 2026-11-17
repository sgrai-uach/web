'use client';

import { useEffect, useState, useRef } from 'react';
import { getSocket } from '@/lib/socket/client';
import { esPayloadTrazabilidadValido } from '@/lib/socket/trazabilidadConfig';
import { setTrazabilidadEstado } from '@/lib/socket/trazabilidadStore';
import type { EstadoIncidente, PrioridadIncidente } from '@/services/incidentesService';

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
  cuadrillaId?: string | null;
  cuadrillaNombre?: string | null;
  patrullaId?: string | null;
  patrullaNombre?: string | null;
  incidenteId?: string | null;
  incidenteCodigo?: string | null;
  rechazadoPorId?: string | null;
  rechazadoEn?: string;
}

export interface CuadrillaActualizadaPayload {
  id: string;
  nombre?: string;
  estado: string;
  delegacionId?: string | null;
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
  onCuadrillaActualizada?: (payload: CuadrillaActualizadaPayload) => void;
  onNotificacionTrazabilidadActualizada?: (payload: NotificacionTrazabilidadPayload) => void;
  enabled?: boolean;
}

/**
 * Hook para la conexión en tiempo real del Encargado de Centro de Mando.
 * Se une a la sala 'sala:encargados' y escucha la creación y actualización de incidentes,
 * rechazos de misiones y disponibilidad de cuadrillas.
 */
export function useEncargadoKanbanSocket({
  onIncidenteCreado,
  onIncidenteActualizado,
  onMisionRechazada,
  onCuadrillaActualizada,
  onNotificacionTrazabilidadActualizada,
  enabled = true,
}: UseEncargadoKanbanSocketOptions = {}) {
  const [conectado, setConectado] = useState(false);
  const [ultimoEvento, setUltimoEvento] = useState<string | null>(null);

  const creadoRef = useRef(onIncidenteCreado);
  const actualizadoRef = useRef(onIncidenteActualizado);
  const rechazadaRef = useRef(onMisionRechazada);
  const cuadrillaActualizadaRef = useRef(onCuadrillaActualizada);
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
    cuadrillaActualizadaRef.current = onCuadrillaActualizada;
  }, [onCuadrillaActualizada]);

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
      const codigo = typeof raw?.codigo === 'string' ? raw.codigo : '';
      const claveDedup = misionId || codigo;
      const ahora = Date.now();

      // Deduplicación reactiva ante emisiones múltiples por broadcast o varias salas concurrentes
      if (claveDedup) {
        const ultimaVez = eventosProcesadosRef.current.get(claveDedup);
        if (ultimaVez && ahora - ultimaVez < 5000) {
          return;
        }
        eventosProcesadosRef.current.set(claveDedup, ahora);
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
        codigo,
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
        cuadrillaId: typeof raw?.cuadrillaId === 'string' ? raw.cuadrillaId : null,
        cuadrillaNombre: typeof raw?.cuadrillaNombre === 'string' ? raw.cuadrillaNombre : null,
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

    const handleCuadrillaActualizada = (payload: unknown) => {
      const p = payload as Record<string, unknown> | null | undefined;
      const raw = (p?.datos || p?.data || p) as Record<string, unknown> | null | undefined;
      const id = typeof raw?.id === 'string' ? raw.id : '';
      const estado = typeof raw?.estado === 'string' ? raw.estado : '';
      if (!id || !estado) return;

      const normalizedPayload: CuadrillaActualizadaPayload = {
        id,
        nombre: typeof raw?.nombre === 'string' ? raw.nombre : undefined,
        estado,
        delegacionId: typeof raw?.delegacionId === 'string' ? raw.delegacionId : null,
      };

      if (cuadrillaActualizadaRef.current) {
        cuadrillaActualizadaRef.current(normalizedPayload);
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
    socket.on('mision:rechazada', handleMisionRechazada);
    socket.on('cuadrilla:actualizada', handleCuadrillaActualizada);
    socket.on('notificacion:trazabilidad_actualizada', handleTrazabilidad);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('incidente:creado', handleCreado);
      socket.off('incidente:actualizado', handleActualizado);
      socket.off('mision:rechazada', handleMisionRechazada);
      socket.off('cuadrilla:actualizada', handleCuadrillaActualizada);
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
