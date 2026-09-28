'use client';

import { useEffect, useRef, useState } from 'react';
import { getSocket } from '@/lib/socket/client';
import type {
  SocketAvisoDescartadoPayload,
  SocketAvisoNuevoPayload,
  SocketAvisoVerificadoPayload,
} from '@/types/api';

export interface UseCallCenterSocketCallbacks {
  onAvisoNuevo?: (aviso: SocketAvisoNuevoPayload) => void;
  onAvisoVerificado?: (payload: SocketAvisoVerificadoPayload) => void;
  onAvisoDescartado?: (payload: SocketAvisoDescartadoPayload) => void;
}

/**
 * Hook para gestionar la suscripción a la sala 'call-center' vía WebSockets.
 * Actualiza en tiempo real avisos nuevos, verificados y descartados.
 */
export function useCallCenterSocket(callbacks: UseCallCenterSocketCallbacks = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const callbacksRef = useRef(callbacks);

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    const socket = getSocket();

    function handleConnect() {
      setIsConnected(true);
      socket.emit('join', 'call-center');
    }

    function handleDisconnect() {
      setIsConnected(false);
    }

    function handleAvisoNuevo(aviso: SocketAvisoNuevoPayload) {
      callbacksRef.current.onAvisoNuevo?.(aviso);
    }

    function handleAvisoVerificado(payload: SocketAvisoVerificadoPayload) {
      callbacksRef.current.onAvisoVerificado?.(payload);
    }

    function handleAvisoDescartado(payload: SocketAvisoDescartadoPayload) {
      callbacksRef.current.onAvisoDescartado?.(payload);
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('aviso:nuevo', handleAvisoNuevo);
    socket.on('aviso:verificado', handleAvisoVerificado);
    socket.on('aviso:descartado', handleAvisoDescartado);

    if (socket.connected) {
      // Usar timeout o microtask para no ejecutar setState sincrónicamente en el cuerpo del efecto
      queueMicrotask(() => {
        setIsConnected(true);
      });
      socket.emit('join', 'call-center');
    } else {
      socket.connect();
    }

    return () => {
      socket.emit('leave', 'call-center');
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('aviso:nuevo', handleAvisoNuevo);
      socket.off('aviso:verificado', handleAvisoVerificado);
      socket.off('aviso:descartado', handleAvisoDescartado);
    };
  }, []);

  return { isConnected };
}
