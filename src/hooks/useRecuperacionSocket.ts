'use client';

import { useEffect, useState, useRef } from 'react';
import { getSocket } from '@/lib/socket/client';
import type {
  EventoRecuperacionResponse,
  EditarOperativoRecuperacionData,
} from '@/types/recuperacion';

const SALAS_RECUPERACION = ['encargado', 'sala:encargados', 'mapa'] as const;
const roomRefCounts = new Map<string, number>();

export interface UseRecuperacionSocketOptions {
  onRecuperacionCreada?: (evento: EventoRecuperacionResponse) => void;
  onRecuperacionActualizada?: (evento: EditarOperativoRecuperacionData) => void;
  onRecursoActualizado?: (payload: unknown) => void;
  onPatrullaActualizada?: (payload: unknown) => void;
  eventoId?: string;
  enabled?: boolean;
}

/**
 * Hook de tiempo real para escuchar la creación, despacho y actualización de eventos de recuperación (HU-29, HU-32 y HU-74).
 * Se une a las salas operativas ('sala:encargados', 'encargado' y 'mapa') y escucha eventos de WebSocket.
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

    let activo = true;
    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    const emitirSalas = () => {
      for (const sala of SALAS_RECUPERACION) {
        socket.emit('unirse', sala);
        socket.emit('join', sala);
      }
    };

    for (const sala of SALAS_RECUPERACION) {
      roomRefCounts.set(sala, (roomRefCounts.get(sala) ?? 0) + 1);
    }

    const onConnect = () => {
      setConectado(true);
      emitirSalas();
    };

    const onDisconnect = () => {
      setConectado(false);
    };

    if (socket.connected) {
      emitirSalas();
      queueMicrotask(() => {
        if (activo) {
          setConectado(true);
        }
      });
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
      payload: EditarOperativoRecuperacionData | { data: EditarOperativoRecuperacionData; evento?: EditarOperativoRecuperacionData }
    ) => {
      const obj = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null;
      const eventoObj =
        obj && 'evento' in obj && typeof obj.evento === 'object' && obj.evento !== null
          ? (obj.evento as EditarOperativoRecuperacionData)
          : null;
      const dataObj =
        obj && 'data' in obj && typeof obj.data === 'object' && obj.data !== null
          ? (obj.data as EditarOperativoRecuperacionData)
          : null;
      const evento = eventoObj || dataObj || (payload as EditarOperativoRecuperacionData);
      const targetId = evento && 'id' in evento ? String(evento.id) : null;
      const targetCodigo = evento && 'codigo' in evento ? String(evento.codigo) : null;

      if (!eventoId || (targetId && targetId === eventoId) || (targetCodigo && targetCodigo === eventoId)) {
        const codigo = targetCodigo || 'Evento';
        const sector = evento && 'sector' in evento && evento.sector ? String(evento.sector) : null;
        setUltimoEvento(
          sector ? `Recuperación actualizada: ${codigo} en ${sector}` : `Recuperación actualizada: ${codigo}`
        );
        if (callbackActualizadaRef.current && evento) {
          const argumento = eventoObj
            ? (payload as unknown as EditarOperativoRecuperacionData)
            : evento;
          callbackActualizadaRef.current(argumento);
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
      activo = false;
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('recuperacion:creada', handleRecuperacionCreada);
      socket.off('recuperacion:actualizada', handleRecuperacionActualizada);
      socket.off('recurso:actualizado', handleRecursoActualizado);
      socket.off('patrulla:actualizada', handlePatrullaActualizada);
      for (const sala of SALAS_RECUPERACION) {
        const nextCount = (roomRefCounts.get(sala) ?? 1) - 1;
        if (nextCount <= 0) {
          roomRefCounts.delete(sala);
          socket.emit('salir', sala);
          socket.emit('leave', sala);
        } else {
          roomRefCounts.set(sala, nextCount);
        }
      }
    };
  }, [enabled, eventoId]);

  return {
    conectado,
    ultimoEvento,
  };
}
