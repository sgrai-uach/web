'use client';

import { useEffect, useState, useRef } from 'react';
import { getSocket } from '@/lib/socket/client';
import { suscribirSalasSocket } from '@/lib/socket/roomManager';
import type { EventoRecuperacionResponse } from '@/types/recuperacion';

export interface UseRecuperacionSocketOptions {
  onRecuperacionCreada?: (evento: EventoRecuperacionResponse) => void;
  enabled?: boolean;
}

/**
 * Hook de tiempo real para escuchar la creación y despacho de eventos de recuperación (HU-29).
 * Se une a las salas operativas ('sala:encargados' y 'mapa') y escucha 'recuperacion:creada'.
 */
export function useRecuperacionSocket({
  onRecuperacionCreada,
  enabled = true,
}: UseRecuperacionSocketOptions = {}) {
  const [conectado, setConectado] = useState(false);
  const [ultimoEvento, setUltimoEvento] = useState<string | null>(null);

  const callbackRef = useRef(onRecuperacionCreada);

  useEffect(() => {
    callbackRef.current = onRecuperacionCreada;
  }, [onRecuperacionCreada]);

  useEffect(() => {
    if (!enabled) return;

    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    const desuscribirSalas = suscribirSalasSocket(socket, [
      { sala: 'sala:encargados', eventosJoin: ['unirse', 'join'], eventosLeave: ['salir', 'leave'] },
      { sala: 'mapa', eventosJoin: ['unirse', 'join'], eventosLeave: ['salir', 'leave'] },
    ]);

    const onConnect = () => {
      setConectado(true);
    };

    const onDisconnect = () => {
      setConectado(false);
    };

    if (socket.connected) {
      queueMicrotask(() => {
        setConectado(true);
      });
    }

    const handleRecuperacionCreada = (payload: EventoRecuperacionResponse | { data: EventoRecuperacionResponse }) => {
      const evento = (payload && 'data' in payload && payload.data) ? payload.data : (payload as EventoRecuperacionResponse);
      const codigo = evento?.codigo || 'Evento';
      const sector = evento?.sector || 'Valdivia';
      setUltimoEvento(`Recuperación despachada: ${codigo} en ${sector}`);

      if (callbackRef.current && evento) {
        callbackRef.current(evento);
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('recuperacion:creada', handleRecuperacionCreada);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('recuperacion:creada', handleRecuperacionCreada);
      desuscribirSalas();
    };
  }, [enabled]);

  return {
    conectado,
    ultimoEvento,
  };
}
