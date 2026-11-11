'use client';

import { useEffect, useState, useRef } from 'react';
import { getSocket } from '@/lib/socket/client';
import type { EventoRecuperacionResponse } from '@/types/recuperacion';

export interface UseRecuperacionSocketOptions {
  onRecuperacionCreada?: (evento: EventoRecuperacionResponse) => void;
  onRecuperacionActualizada?: (payload: unknown) => void;
  onRecursoActualizado?: (payload: unknown) => void;
  onPatrullaActualizada?: (payload: unknown) => void;
  eventoId?: string;
  enabled?: boolean;
}

/**
 * Hook de tiempo real para escuchar la creación, despacho y actualización de eventos de recuperación (HU-29 y HU-32).
 * Se une a las salas operativas ('sala:encargados' y 'mapa') y escucha eventos de WebSocket.
 */
export function useRecuperacionSocket({
  onRecuperacionCreada,
  onRecuperacionActualizada,
  onRecursoActualizado,
  onPatrullaActualizada,
  eventoId,
  enabled = true,
}: UseRecuperacionSocketOptions = {}) {
  const [conectado, setConectado] = useState(false);
  const [ultimoEvento, setUltimoEvento] = useState<string | null>(null);

  const callbackCreadaRef = useRef(onRecuperacionCreada);
  const callbackActualizadaRef = useRef(onRecuperacionActualizada);
  const callbackRecursoRef = useRef(onRecursoActualizado);
  const callbackPatrullaRef = useRef(onPatrullaActualizada);

  useEffect(() => {
    callbackCreadaRef.current = onRecuperacionCreada;
  }, [onRecuperacionCreada]);

  useEffect(() => {
    callbackActualizadaRef.current = onRecuperacionActualizada;
  }, [onRecuperacionActualizada]);

  useEffect(() => {
    callbackRecursoRef.current = onRecursoActualizado;
  }, [onRecursoActualizado]);

  useEffect(() => {
    callbackPatrullaRef.current = onPatrullaActualizada;
  }, [onPatrullaActualizada]);

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

    const handleRecuperacionCreada = (payload: EventoRecuperacionResponse | { data: EventoRecuperacionResponse }) => {
      const evento = (payload && 'data' in payload && payload.data) ? payload.data : (payload as EventoRecuperacionResponse);
      const codigo = evento?.codigo || 'Evento';
      const sector = evento?.sector || 'Valdivia';
      setUltimoEvento(`Recuperación despachada: ${codigo} en ${sector}`);

      if (callbackCreadaRef.current && evento) {
        callbackCreadaRef.current(evento);
      }
    };

    const handleRecuperacionActualizada = (payload: unknown) => {
      const obj = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null;
      const dataObj = obj && 'data' in obj && typeof obj.data === 'object' ? (obj.data as Record<string, unknown>) : null;
      const evento = dataObj || obj;
      const targetId = evento && ('id' in evento ? String(evento.id) : null);

      if (!eventoId || (targetId && targetId === eventoId)) {
        const codigo = evento && 'codigo' in evento ? String(evento.codigo) : 'Evento';
        setUltimoEvento(`Recuperación actualizada: ${codigo}`);
        if (callbackActualizadaRef.current) {
          callbackActualizadaRef.current(payload);
        }
      }
    };

    const handleRecursoActualizado = (payload: unknown) => {
      if (callbackRecursoRef.current) {
        callbackRecursoRef.current(payload);
      }
    };

    const handlePatrullaActualizada = (payload: unknown) => {
      if (callbackPatrullaRef.current) {
        callbackPatrullaRef.current(payload);
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('recuperacion:creada', handleRecuperacionCreada);
    socket.on('recuperacion:actualizada', handleRecuperacionActualizada);
    socket.on('recurso:actualizado', handleRecursoActualizado);
    socket.on('patrulla:actualizada', handlePatrullaActualizada);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('recuperacion:creada', handleRecuperacionCreada);
      socket.off('recuperacion:actualizada', handleRecuperacionActualizada);
      socket.off('recurso:actualizado', handleRecursoActualizado);
      socket.off('patrulla:actualizada', handlePatrullaActualizada);
      socket.emit('salir', 'sala:encargados');
      socket.emit('leave', 'sala:encargados');
      socket.emit('salir', 'mapa');
      socket.emit('leave', 'mapa');
    };
  }, [enabled, eventoId]);

  return {
    conectado,
    ultimoEvento,
  };
}
