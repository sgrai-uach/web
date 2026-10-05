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
import { getSocket } from '@/lib/socket/client';
import type { Socket } from 'socket.io-client';

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

  const agregarEventoLocalmente = useCallback((nuevoEvento: EventoAsistenciaSocialItem) => {
    setData((prev) => {
      if (!prev) {
        return {
          data: [nuevoEvento],
          total: 1,
          pagina: 1,
          limite: 10,
          totalPaginas: 1,
        };
      }

      // Evitar duplicados
      if (prev.data.some((e) => e.id === nuevoEvento.id || e.codigo === nuevoEvento.codigo)) {
        return prev;
      }

      return {
        ...prev,
        data: [nuevoEvento, ...prev.data],
        total: prev.total + 1,
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

    const handleAsistenciaSocialCreada = (nuevoEvento: EventoAsistenciaSocialItem) => {
      if (nuevoEvento && nuevoEvento.id) {
        agregarEventoLocalmente(nuevoEvento);
      } else {
        fetchData();
      }
    };

    socketInstance.on('asistencia_social:creada', handleAsistenciaSocialCreada);

    return () => {
      socketInstance?.off('asistencia_social:creada', handleAsistenciaSocialCreada);
    };
  }, [agregarEventoLocalmente, fetchData]);

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
  };
}
