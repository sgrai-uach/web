'use client';

import { useEffect, useState, useRef } from 'react';
import { getSocket } from '@/lib/socket/client';
import type { EstadoIncidente } from '@/lib/api/seguimiento';

export interface EstadoActualizadoPayload {
  codigoSeguimiento: string;
  estado: EstadoIncidente;
  estadoEtiqueta: string;
  estadoDescripcion: string;
  actualizadoEn: string;
}

export interface UseSeguimientoSocketOptions {
  codigo?: string;
  onEstadoActualizado?: (payload: EstadoActualizadoPayload) => void;
}

/**
 * Hook para sincronizar el estado del incidente en tiempo real mediante Socket.io.
 *
 * Se une a la sala 'sala:seguimiento:{codigo}' al montar, escucha el evento
 * 'incidente:estado_actualizado' y emite 'salir' al desmontar.
 */
export function useSeguimientoSocket({
  codigo,
  onEstadoActualizado,
}: UseSeguimientoSocketOptions) {
  const [conectado, setConectado] = useState(false);
  const [actualizadoEnVivo, setActualizadoEnVivo] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(onEstadoActualizado);

  useEffect(() => {
    callbackRef.current = onEstadoActualizado;
  }, [onEstadoActualizado]);

  useEffect(() => {
    if (!codigo || !/^\d{8}$/.test(codigo.trim())) return;

    const codigoLimpio = codigo.trim();
    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      setConectado(true);
      socket.emit('unirse', `sala:seguimiento:${codigoLimpio}`);
    };

    const onDisconnect = () => {
      setConectado(false);
    };

    if (socket.connected) {
      socket.emit('unirse', `sala:seguimiento:${codigoLimpio}`);
      queueMicrotask(() => {
        setConectado(true);
      });
    }

    const handleEstadoActualizado = (payload: EstadoActualizadoPayload) => {
      if (payload.codigoSeguimiento === codigoLimpio) {
        setActualizadoEnVivo(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setActualizadoEnVivo(false);
        }, 4000);

        if (callbackRef.current) {
          callbackRef.current(payload);
        }
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('incidente:estado_actualizado', handleEstadoActualizado);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('incidente:estado_actualizado', handleEstadoActualizado);
      socket.emit('salir', `sala:seguimiento:${codigoLimpio}`);
    };
  }, [codigo]);

  return {
    conectado,
    actualizadoEnVivo,
  };
}
