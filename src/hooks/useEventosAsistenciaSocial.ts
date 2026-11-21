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
import type { Socket } from 'socket.io-client';

type EventoSocialSocketPayload = EventoAsistenciaSocialItem & {
  detalles_evaluacion?: unknown;
};

function normalizarEventoDesdeSocket(
  evento: EventoSocialSocketPayload
): EventoAsistenciaSocialItem {
  const { detalles_evaluacion, ...resto } = evento;
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
      const eventoNormalizado = normalizarEventoDesdeSocket(
        nuevoEvento as EventoSocialSocketPayload
      );
      if (estado && eventoNormalizado.estado !== estado) {
        return;
      }

      setData((prev) => {
        if (!prev) {
          return {
            data: [eventoNormalizado],
            total: 1,
            pagina: 1,
            limite: 10,
            totalPaginas: 1,
          };
        }

        // Evitar duplicados
        if (
          prev.data.some(
            (e) => e.id === eventoNormalizado.id || e.codigo === eventoNormalizado.codigo
          )
        ) {
          return prev;
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

    const unirseASalas = () => {
      const salas = ['asistente_social', 'sala:encargados', 'encargado', 'centro_mando'];
      salas.forEach((sala) => {
        socketInstance?.emit('join', sala);
        socketInstance?.emit('unirse', sala);
      });
    };

    if (socketInstance.connected) {
      unirseASalas();
    }

    const handleAsistenciaSocialCreada = (nuevoEvento: EventoAsistenciaSocialItem) => {
      if (nuevoEvento && nuevoEvento.id) {
        agregarEventoLocalmente(nuevoEvento);
      } else {
        fetchData();
      }
    };

    const handleAsistenciaSocialActualizada = (eventoActualizado: EventoAsistenciaSocialItem) => {
      if (eventoActualizado && eventoActualizado.id) {
        actualizarEventoLocalmente(eventoActualizado);
      } else {
        fetchData();
      }
    };

    socketInstance.on('connect', unirseASalas);
    socketInstance.on('asistencia_social:creada', handleAsistenciaSocialCreada);
    socketInstance.on('asistencia_social:actualizada', handleAsistenciaSocialActualizada);

    return () => {
      socketInstance?.off('connect', unirseASalas);
      socketInstance?.off('asistencia_social:creada', handleAsistenciaSocialCreada);
      socketInstance?.off('asistencia_social:actualizada', handleAsistenciaSocialActualizada);
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
