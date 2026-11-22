'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  EventoAsistenciaSocialItem,
  FiltrosEventosAsistenciaSocialState,
  ListarEventosAsistenciaSocialResponse,
} from '@/types/asistenciaSocial';
import {
  obtenerEventosAsistenciaSocial,
  AsistenciaSocialServiceError,
} from '@/services/asistenciaSocialService';
import { normalizarDetallesEvaluacionSocial } from '@/lib/utils/asistenciaSocialIncidenteUtils';
import { getSocket } from '@/lib/socket/client';
import { suscribirSalasSocket } from '@/lib/socket/roomManager';
import type { Socket } from 'socket.io-client';

type EventoSocialSocketPayload = EventoAsistenciaSocialItem & {
  detalles_evaluacion?: unknown;
  evento?: EventoSocialSocketPayload;
  datos?: EventoSocialSocketPayload;
  data?: EventoSocialSocketPayload;
};

function extraerPayloadEventoSocial(raw: unknown): EventoSocialSocketPayload | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const nested =
    obj.evento && typeof obj.evento === 'object'
      ? (obj.evento as EventoSocialSocketPayload)
      : obj.datos && typeof obj.datos === 'object'
        ? (obj.datos as EventoSocialSocketPayload)
        : obj.data && typeof obj.data === 'object'
          ? (obj.data as EventoSocialSocketPayload)
          : (obj as unknown as EventoSocialSocketPayload);
  return nested && typeof nested.id === 'string' && nested.id ? nested : null;
}

function normalizarEventoDesdeSocket(
  evento: EventoSocialSocketPayload
): EventoAsistenciaSocialItem {
  const { detalles_evaluacion, evento: _ev, datos: _dt, data: _da, ...resto } = evento;
  void _ev;
  void _dt;
  void _da;
  return {
    ...resto,
    detallesEvaluacion: normalizarDetallesEvaluacionSocial(
      evento.detallesEvaluacion ?? detalles_evaluacion
    ),
  };
}

export interface UseEventosAsistenciaSocialReturn {
  eventos: EventoAsistenciaSocialItem[];
  meta: {
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  };
  cargando: boolean;
  error: Error | null;
  statusCode: number | null;
  recargar: () => Promise<void>;
  agregarEventoLocalmente: (evento: EventoAsistenciaSocialItem) => void;
  actualizarEventoLocalmente: (eventoActualizado: EventoAsistenciaSocialItem) => void;
}

export function useEventosAsistenciaSocial(
  filtros: FiltrosEventosAsistenciaSocialState,
  userId?: string
): UseEventosAsistenciaSocialReturn {
  const [data, setData] = useState<ListarEventosAsistenciaSocialResponse | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const { pagina, limite, busqueda, delegacionId, prioridad, estado } = filtros;

  const fetchData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setCargando(true);
    setError(null);
    setStatusCode(null);

    try {
      const response = await obtenerEventosAsistenciaSocial(
        { pagina, limite, busqueda, delegacionId, prioridad, estado },
        userId
      );
      setData(response);
    } catch (err: unknown) {
      if (err instanceof AsistenciaSocialServiceError) {
        setError(err);
        setStatusCode(err.statusCode || 500);
      } else if (err instanceof Error) {
        setError(err);
        setStatusCode(500);
      }
    } finally {
      setCargando(false);
    }
  }, [pagina, limite, busqueda, delegacionId, prioridad, estado, userId]);

  useEffect(() => {
    let activo = true;

    const timer = setTimeout(() => {
      if (activo) {
        fetchData();
      }
    }, 0);

    return () => {
      activo = false;
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  const agregarEventoLocalmente = useCallback(
    (nuevoEvento: EventoAsistenciaSocialItem) => {
      const unwrapped = extraerPayloadEventoSocial(nuevoEvento) ?? (nuevoEvento as EventoSocialSocketPayload);
      const eventoNormalizado = normalizarEventoDesdeSocket(unwrapped);

      setData((prev) => {
        if (!prev) {
          if (estado && eventoNormalizado.estado !== estado) {
            return prev;
          }
          return {
            data: [eventoNormalizado],
            total: 1,
            pagina: 1,
            limite: 10,
            totalPaginas: 1,
          };
        }

        const existe = prev.data.some(
          (e) => e.id === eventoNormalizado.id || e.codigo === eventoNormalizado.codigo
        );

        // Si hay filtro de estado activo y el nuevo estado ya no coincide, remover si existía (upsert PENDIENTE -> ASIGNADO)
        if (estado && eventoNormalizado.estado !== estado) {
          if (!existe) return prev;
          const filtrados = prev.data.filter(
            (e) => e.id !== eventoNormalizado.id && e.codigo !== eventoNormalizado.codigo
          );
          return {
            ...prev,
            data: filtrados,
            total: Math.max(0, prev.total - 1),
          };
        }

        if (existe) {
          return {
            ...prev,
            data: prev.data.map((e) =>
              e.id === eventoNormalizado.id || e.codigo === eventoNormalizado.codigo
                ? { ...e, ...eventoNormalizado }
                : e
            ),
          };
        }

        return {
          ...prev,
          data: [eventoNormalizado, ...prev.data],
          total: prev.total + 1,
        };
      });
    },
    [estado]
  );

  const actualizarEventoLocalmente = useCallback((eventoActualizado: EventoAsistenciaSocialItem) => {
    const payloadSocket = eventoActualizado as EventoSocialSocketPayload;
    const traeDetallesEnPayload =
      payloadSocket.detallesEvaluacion !== undefined ||
      payloadSocket.detalles_evaluacion !== undefined;
    const eventoNormalizado = normalizarEventoDesdeSocket(payloadSocket);

    setData((prev) => {
      if (!prev) return prev;
      const existe = prev.data.some(
        (e) => e.id === eventoNormalizado.id || e.codigo === eventoNormalizado.codigo
      );
      if (!existe) return prev;

      return {
        ...prev,
        data: prev.data.map((e) => {
          if (e.id !== eventoNormalizado.id && e.codigo !== eventoNormalizado.codigo) {
            return e;
          }
          return {
            ...e,
            ...eventoNormalizado,
            detallesEvaluacion: traeDetallesEnPayload
              ? eventoNormalizado.detallesEvaluacion
              : e.detallesEvaluacion ?? null,
          };
        }),
      };
    });
  }, []);

  // Suscripción reactiva en tiempo real vía WebSockets (Socket.io)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let socketInstance: Socket | null = null;
    try {
      socketInstance = getSocket();
    } catch {
      return;
    }

    if (!socketInstance) return;

    const desuscribirSalas = suscribirSalasSocket(socketInstance, [
      { sala: 'asistente_social', eventosJoin: ['join', 'unirse'], eventosLeave: ['leave', 'salir'] },
      { sala: 'sala:encargados', eventosJoin: ['join', 'unirse'], eventosLeave: ['leave', 'salir'] },
      { sala: 'encargado', eventosJoin: ['join', 'unirse'], eventosLeave: ['leave', 'salir'] },
      { sala: 'centro_mando', eventosJoin: ['join', 'unirse'], eventosLeave: ['leave', 'salir'] },
    ]);

    const handleAsistenciaSocialCreada = (payload: unknown) => {
      const evento = extraerPayloadEventoSocial(payload);
      if (evento) {
        agregarEventoLocalmente(evento);
      } else {
        fetchData();
      }
    };

    const handleAsistenciaSocialActualizada = (payload: unknown) => {
      const evento = extraerPayloadEventoSocial(payload);
      if (evento) {
        actualizarEventoLocalmente(evento);
      } else {
        fetchData();
      }
    };

    socketInstance.on('asistencia_social:creada', handleAsistenciaSocialCreada);
    socketInstance.on('asistencia_social:actualizada', handleAsistenciaSocialActualizada);

    return () => {
      socketInstance?.off('asistencia_social:creada', handleAsistenciaSocialCreada);
      socketInstance?.off('asistencia_social:actualizada', handleAsistenciaSocialActualizada);
      desuscribirSalas();
    };
  }, [agregarEventoLocalmente, actualizarEventoLocalmente, fetchData]);

  return {
    eventos: data?.data ?? [],
    meta: {
      total: data?.total ?? 0,
      pagina: data?.pagina ?? filtros.pagina,
      limite: data?.limite ?? filtros.limite,
      totalPaginas: data?.totalPaginas ?? 1,
    },
    cargando,
    error,
    statusCode,
    recargar: fetchData,
    agregarEventoLocalmente,
    actualizarEventoLocalmente,
  };
}
