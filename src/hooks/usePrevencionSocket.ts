'use client';

import { useEffect, useState, useRef } from 'react';
import { getSocket } from '@/lib/socket/client';
import type { EventoPrevencionDTO } from '@/types/evento-prevencion';

export type PrevencionActualizadaPayload = EventoPrevencionDTO | Record<string, unknown>;

export interface UsePrevencionSocketOptions {
  onEventoCreado?: (evento: EventoPrevencionDTO) => void;
  onPrevencionCreada?: (evento: EventoPrevencionDTO) => void;
  onEventoActualizado?: (payload: PrevencionActualizadaPayload) => void;
  onPrevencionActualizada?: (payload: PrevencionActualizadaPayload) => void;
  onRecursoActualizado?: (payload: unknown) => void;
  onPatrullaActualizada?: (payload: unknown) => void;
  eventoId?: string;
  enabled?: boolean;
}

/**
 * Hook de tiempo real para escuchar la creación, despacho, edición y asignación de recursos
 * en eventos de prevención (HU-30 / HU-77 / HU-33).
 * Se une a las salas operativas ('encargado', 'sala:encargados' y 'mapa').
 */
export function usePrevencionSocket({
  onEventoCreado,
  onPrevencionCreada,
  onEventoActualizado,
  onPrevencionActualizada,
  onRecursoActualizado,
  onPatrullaActualizada,
  eventoId,
  enabled = true,
}: UsePrevencionSocketOptions = {}) {
  const [conectado, setConectado] = useState(false);
  const [ultimoEvento, setUltimoEvento] = useState<string | null>(null);

  const handlerCreada = onPrevencionCreada || onEventoCreado;
  const callbackCreadaRef = useRef(handlerCreada);

  const handlerActualizada = onPrevencionActualizada || onEventoActualizado;
  const callbackActualizadaRef = useRef(handlerActualizada);
  const callbackRecursoRef = useRef(onRecursoActualizado);
  const callbackPatrullaRef = useRef(onPatrullaActualizada);

  useEffect(() => {
    callbackCreadaRef.current = handlerCreada;
  }, [handlerCreada]);

  useEffect(() => {
    callbackActualizadaRef.current = handlerActualizada;
  }, [handlerActualizada]);

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
      socket.emit('unirse', 'encargado');
      socket.emit('join', 'encargado');
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

    const handlePrevencionActualizada = (payload: unknown) => {
      const obj = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null;
      if (!obj) return;

      const eventoObj =
        'evento' in obj && typeof obj.evento === 'object' && obj.evento !== null
          ? (obj.evento as Record<string, unknown>)
          : null;
      const dataObj =
        'data' in obj && typeof obj.data === 'object' && obj.data !== null
          ? (obj.data as Record<string, unknown>)
          : null;

      const eventoRef = eventoObj || dataObj || obj;
      const targetId =
        'id' in eventoRef && eventoRef.id
          ? String(eventoRef.id)
          : 'id' in obj && obj.id
          ? String(obj.id)
          : null;
      const targetCodigo =
        'codigo' in eventoRef && eventoRef.codigo
          ? String(eventoRef.codigo)
          : 'codigo' in obj && obj.codigo
          ? String(obj.codigo)
          : null;

      if (!eventoId || (targetId && targetId === eventoId) || (targetCodigo && targetCodigo === eventoId)) {
        const codigo = targetCodigo || 'Evento';
        setUltimoEvento(`Prevención actualizada: ${codigo}`);

        if (callbackActualizadaRef.current) {
          const esPayloadEnriquecidoH33 =
            'evento' in obj || 'mision' in obj || 'patrulla' in obj || 'recursos' in obj || 'asignadoEn' in obj;
          const payloadParaCallback = esPayloadEnriquecidoH33
            ? obj
            : ((dataObj || obj) as PrevencionActualizadaPayload);
          callbackActualizadaRef.current(payloadParaCallback);
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
    socket.on('prevencion:creada', handlePrevencionCreada);
    socket.on('prevencion:actualizada', handlePrevencionActualizada);
    socket.on('recurso:actualizado', handleRecursoActualizado);
    socket.on('patrulla:actualizada', handlePatrullaActualizada);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('prevencion:creada', handlePrevencionCreada);
      socket.off('prevencion:actualizada', handlePrevencionActualizada);
      socket.off('recurso:actualizado', handleRecursoActualizado);
      socket.off('patrulla:actualizada', handlePatrullaActualizada);
      socket.emit('salir', 'encargado');
      socket.emit('leave', 'encargado');
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
