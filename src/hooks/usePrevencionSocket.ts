'use client';

import { useEffect, useState, useRef } from 'react';
import { getSocket } from '@/lib/socket/client';
import type { EventoPrevencionDTO } from '@/types/evento-prevencion';

export interface UsePrevencionSocketOptions {
  onEventoCreado?: (evento: EventoPrevencionDTO) => void;
  onPrevencionCreada?: (evento: EventoPrevencionDTO) => void;
  enabled?: boolean;
}

/**
 * Hook de tiempo real para escuchar la creación y despacho de eventos de prevención (HU-30).
 * Se une a las salas operativas ('sala:encargados' y 'mapa') y escucha el evento 'prevencion:creada'.
 */
export function usePrevencionSocket({
  onEventoCreado,
  onPrevencionCreada,
  enabled = true,
}: UsePrevencionSocketOptions = {}) {
  const [conectado, setConectado] = useState(false);
  const [ultimoEvento, setUltimoEvento] = useState<string | null>(null);

  const handler = onPrevencionCreada || onEventoCreado;
  const callbackRef = useRef(handler);

  useEffect(() => {
    callbackRef.current = handler;
  }, [handler]);

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

      if (callbackRef.current && evento) {
        callbackRef.current(evento);
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('prevencion:creada', handlePrevencionCreada);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('prevencion:creada', handlePrevencionCreada);
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
