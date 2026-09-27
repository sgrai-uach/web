'use client';

import { useEffect, useState, useRef } from 'react';
import { getSocket } from '@/lib/socket/client';

export interface IncidenteCreadoSocketPayload {
  id: string;
  codigo: string;
  tipoAfectacion: string;
  direccion: string;
  estado: string;
  prioridad: string;
  requiereAsistenciaSocial?: boolean;
  latitud?: number;
  longitud?: number;
  creadoEn: string;
}

interface UseEncargadoSocketOptions {
  onIncidenteCreado?: (incidente: IncidenteCreadoSocketPayload) => void;
}

export function useEncargadoSocket(options: UseEncargadoSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(() =>
    typeof window !== 'undefined' ? getSocket().connected : false
  );
  const [ultimoIncidente, setUltimoIncidente] = useState<IncidenteCreadoSocketPayload | null>(null);
  const callbackRef = useRef(options.onIncidenteCreado);

  useEffect(() => {
    callbackRef.current = options.onIncidenteCreado;
  }, [options.onIncidenteCreado]);

  useEffect(() => {
    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      setIsConnected(true);
      socket.emit('unirse:sala', 'sala:encargados');
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const handleIncidenteCreado = (payload: { datos: IncidenteCreadoSocketPayload }) => {
      const datos = payload?.datos || payload;
      setUltimoIncidente(datos);
      if (callbackRef.current) {
        callbackRef.current(datos);
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('incidente:creado', handleIncidenteCreado);

    if (socket.connected) {
      setTimeout(() => {
        setIsConnected(true);
      }, 0);
      socket.emit('unirse:sala', 'sala:encargados');
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('incidente:creado', handleIncidenteCreado);
    };
  }, []);

  return {
    isConnected,
    ultimoIncidente,
  };
}
