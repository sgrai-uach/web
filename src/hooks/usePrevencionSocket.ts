'use client';

import { useEffect, useState, useRef } from 'react';
import { getSocket } from '@/lib/socket/client';
import type { EventoPrevencionDTO } from '@/types/evento-prevencion';

export interface UsePrevencionSocketOptions {
  onEventoCreado?: (evento: EventoPrevencionDTO) => void;
  onPrevencionCreada?: (evento: EventoPrevencionDTO) => void;
  onEventoActualizado?: (evento: EventoPrevencionDTO) => void;
  onPrevencionActualizada?: (evento: EventoPrevencionDTO) => void;
  enabled?: boolean;
}

/**
 * Hook de tiempo real para escuchar la creación, despacho y edición de eventos de prevención (HU-30 / HU-77).
 * Se une a las salas operativas ('sala:encargados' y 'mapa') y escucha 'prevencion:creada' y 'prevencion:actualizada'.
 */
export function usePrevencionSocket({
  onEventoCreado,
  onPrevencionCreada,
  onEventoActualizado,
  onPrevencionActualizada,
  enabled = true,
}: UsePrevencionSocketOptions = {}) {
  const [conectado, setConectado] = useState(false);
  const [ultimoEvento, setUltimoEvento] = useState<string | null>(null);

  const handlerCreada = onPrevencionCreada || onEventoCreado;
  const callbackCreadaRef = useRef(handlerCreada);

  const handlerActualizada = onPrevencionActualizada || onEventoActualizado;
  const callbackActualizadaRef = useRef(handlerActualizada);

  useEffect(() => {
    callbackCreadaRef.current = handlerCreada;
  }, [handlerCreada]);

  useEffect(() => {
    callbackActualizadaRef.current = handlerActualizada;
  }, [handlerActualizada]);

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

    const handlePrevencionCreada = (payload: EventoPrevencionDTO | { data: EventoPrevencionDTO }) => {
      const evento = (payload && 'data' in payload && payload.data) ? payload.data : (payload as EventoPrevencionDTO);
      const codigo = evento?.codigo || 'Evento';
      const sector = evento?.sector || 'Valdivia';
      setUltimoEvento(`Prevención despachada: ${codigo} en ${sector}`);

      if (callbackCreadaRef.current && evento) {
        callbackCreadaRef.current(evento);
      }
    };

    const handlePrevencionActualizada = (payload: EventoPrevencionDTO | { data: EventoPrevencionDTO }) => {
      const evento = (payload && 'data' in payload && payload.data) ? payload.data : (payload as EventoPrevencionDTO);
      const codigo = evento?.codigo || 'Evento';
      setUltimoEvento(`Prevención actualizada: ${codigo}`);

      if (callbackActualizadaRef.current && evento) {
        callbackActualizadaRef.current(evento);
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('prevencion:creada', handlePrevencionCreada);
    socket.on('prevencion:actualizada', handlePrevencionActualizada);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('prevencion:creada', handlePrevencionCreada);
      socket.off('prevencion:actualizada', handlePrevencionActualizada);
      socket.emit('salir', 'sala:encargados');
      socket.emit('leave', 'sala:encargados');
      socket.emit('salir', 'mapa');
      socket.emit('leave', 'mapa');
    };
  }, [enabled]);

  return {
    conectado,
    ultimoEvento,
  };
}
