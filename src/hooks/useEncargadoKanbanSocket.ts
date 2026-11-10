'use client';

import { useEffect, useState, useRef } from 'react';
import { getSocket } from '@/lib/socket/client';
import type { EstadoIncidente, PrioridadIncidente } from '@/services/incidentesService';
import { formatearEstado, formatearPrioridad } from '@/lib/utils/estadoUtils';

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
    tipoIncidenteId?: string;
    tipoAfectacion?: string;
    justificacion?: string;
    actualizadoEn: string;
  };
  emitidoEn: string;
}

export interface UseEncargadoKanbanSocketOptions {
  onIncidenteCreado?: (payload: IncidenteCreadoPayload) => void;
  onIncidenteActualizado?: (payload: IncidenteActualizadoPayload) => void;
  enabled?: boolean;
}

/**
 * Hook para la conexión en tiempo real del Encargado de Centro de Mando.
 * Se une a la sala 'sala:encargados' y escucha la creación y actualización de incidentes.
 */
export function useEncargadoKanbanSocket({
  onIncidenteCreado,
  onIncidenteActualizado,
  enabled = true,
}: UseEncargadoKanbanSocketOptions = {}) {
  const [conectado, setConectado] = useState(false);
  const [ultimoEvento, setUltimoEvento] = useState<string | null>(null);

  const creadoRef = useRef(onIncidenteCreado);
  const actualizadoRef = useRef(onIncidenteActualizado);

  useEffect(() => {
    creadoRef.current = onIncidenteCreado;
  }, [onIncidenteCreado]);

  useEffect(() => {
    actualizadoRef.current = onIncidenteActualizado;
  }, [onIncidenteActualizado]);

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
          tipoIncidenteId:
            typeof rawDatos?.tipoIncidenteId === 'string'
              ? rawDatos.tipoIncidenteId
              : undefined,
          tipoAfectacion:
            typeof rawDatos?.tipoAfectacion === 'string'
              ? rawDatos.tipoAfectacion
              : undefined,
          justificacion:
            typeof rawDatos?.justificacion === 'string'
              ? rawDatos.justificacion
              : undefined,
          actualizadoEn:
            typeof rawDatos?.actualizadoEn === 'string'
              ? rawDatos.actualizadoEn
              : new Date().toISOString(),
        },
        emitidoEn:
          typeof p?.emitidoEn === 'string' ? p.emitidoEn : new Date().toISOString(),
      };

      const prioridadLegible = formatearPrioridad(normalizedPayload.datos.prioridad);
      if (normalizedPayload.datos.tipoAfectacion && normalizedPayload.datos.justificacion) {
        setUltimoEvento(
          `Tipología reclasificada: ${normalizedPayload.datos.codigo || ''} a ${normalizedPayload.datos.tipoAfectacion} (Prioridad: ${prioridadLegible})`
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

      if (incidenteId && (tipoMision === 'VERIFICACION' || !tipoMision)) {
        if (estadoMision === 'EN_CURSO' || estadoMision === 'DESPACHADA') {
          const syntheticIncPayload: IncidenteActualizadoPayload = {
            evento: 'incidente:actualizado',
            datos: {
              id: incidenteId,
              codigo: typeof raw?.incidenteCodigo === 'string' ? raw.incidenteCodigo : '',
              nuevoEstado: 'VERIFICANDO',
              prioridad: (raw?.prioridad as PrioridadIncidente) || 'MEDIA',
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
          setUltimoEvento(`Misión ${codigoMision} (${estadoMision}): Incidente en verificación`);
        }
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('incidente:creado', handleCreado);
    socket.on('incidente:actualizado', handleActualizado);
    socket.on('mision:creada', handleMisionEvent);
    socket.on('mision:actualizada', handleMisionEvent);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('incidente:creado', handleCreado);
      socket.off('incidente:actualizado', handleActualizado);
      socket.off('mision:creada', handleMisionEvent);
      socket.off('mision:actualizada', handleMisionEvent);
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
