'use client';

import { useEffect, useState, useRef } from 'react';
import { getSocket } from '@/lib/socket/client';
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

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('incidente:creado', handleCreado);
    socket.on('incidente:actualizado', handleActualizado);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('incidente:creado', handleCreado);
      socket.off('incidente:actualizado', handleActualizado);
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
