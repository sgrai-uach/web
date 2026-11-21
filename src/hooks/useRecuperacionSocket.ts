'use client';

import { useEffect, useState, useRef } from 'react';
import { getSocket } from '@/lib/socket/client';
import type {
  EventoRecuperacionResponse,
  EditarOperativoRecuperacionData,
} from '@/types/recuperacion';

export interface RecuperacionActualizadaEvent
  extends EditarOperativoRecuperacionData {
  accion?: 'EDITADA' | 'CERRADA' | 'REPORTE_TERRENO' | 'EN_EJECUCION' | string;
}

export interface UseRecuperacionSocketOptions {
  onRecuperacionCreada?: (evento: EventoRecuperacionResponse) => void;
  onRecuperacionActualizada?: (evento: RecuperacionActualizadaEvent) => void;
  enabled?: boolean;
}

/**
 * Hook de tiempo real para escuchar creación y actualización de eventos de recuperación (HU-29, HU-74).
 * Se une a las salas operativas ('sala:encargados', 'encargado' y 'mapa') y escucha
 * 'recuperacion:creada' y 'recuperacion:actualizada'.
 */
export function useRecuperacionSocket({
  onRecuperacionCreada,
  onRecuperacionActualizada,
  enabled = true,
}: UseRecuperacionSocketOptions = {}) {
  const [conectado, setConectado] = useState(false);
  const [ultimoEvento, setUltimoEvento] = useState<string | null>(null);

  const callbackCreadaRef = useRef(onRecuperacionCreada);
  const callbackActualizadaRef = useRef(onRecuperacionActualizada);

  useEffect(() => {
    callbackCreadaRef.current = onRecuperacionCreada;
  }, [onRecuperacionCreada]);

  useEffect(() => {
    callbackActualizadaRef.current = onRecuperacionActualizada;
  }, [onRecuperacionActualizada]);

  useEffect(() => {
    if (!enabled) return;

    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    const unirseSalas = () => {
      setConectado(true);
      socket.emit('unirse', 'sala:encargados');
      socket.emit('join', 'sala:encargados');
      socket.emit('unirse', 'encargado');
      socket.emit('join', 'encargado');
      socket.emit('unirse', 'mapa');
      socket.emit('join', 'mapa');
    };

    const onConnect = () => {
      unirseSalas();
    };

    const onDisconnect = () => {
      setConectado(false);
    };

    if (socket.connected) {
      unirseSalas();
    }

    const handleRecuperacionCreada = (
      payload: EventoRecuperacionResponse | { data: EventoRecuperacionResponse }
    ) => {
      const evento =
        payload && 'data' in payload && payload.data
          ? payload.data
          : (payload as EventoRecuperacionResponse);
      const codigo = evento?.codigo || 'Evento';
      const sector = evento?.sector || 'Valdivia';
      setUltimoEvento(`Recuperación despachada: ${codigo} en ${sector}`);

      if (callbackCreadaRef.current && evento) {
        callbackCreadaRef.current(evento);
      }
    };

    const handleRecuperacionActualizada = (
      payload: RecuperacionActualizadaEvent | { data: RecuperacionActualizadaEvent }
    ) => {
      const evento =
        payload && 'data' in payload && payload.data
          ? payload.data
          : (payload as RecuperacionActualizadaEvent);
      const codigo = evento?.codigo || 'Evento';
      const sector = evento?.sector || 'Valdivia';

      if (evento?.accion === 'CERRADA' || evento?.estado === 'COMPLETADA') {
        setUltimoEvento(`Recuperación concluida: ${codigo} en ${sector}`);
      } else if (evento?.accion === 'REPORTE_TERRENO') {
        setUltimoEvento(
          `Reporte de cierre en terreno recibido para ${codigo} en ${sector}`
        );
      } else if (evento?.accion === 'EN_EJECUCION') {
        setUltimoEvento(`Operativo en ejecución: ${codigo} en ${sector}`);
      } else {
        setUltimoEvento(`Recuperación actualizada: ${codigo} en ${sector}`);
      }

      if (callbackActualizadaRef.current && evento) {
        callbackActualizadaRef.current(evento);
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('recuperacion:creada', handleRecuperacionCreada);
    socket.on('recuperacion:actualizada', handleRecuperacionActualizada);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('recuperacion:creada', handleRecuperacionCreada);
      socket.off('recuperacion:actualizada', handleRecuperacionActualizada);
      socket.emit('salir', 'sala:encargados');
      socket.emit('leave', 'sala:encargados');
      socket.emit('salir', 'encargado');
      socket.emit('leave', 'encargado');
      socket.emit('salir', 'mapa');
      socket.emit('leave', 'mapa');
    };
  }, [enabled]);

  return {
    conectado,
    ultimoEvento,
  };
}
