'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ListarRecursosResponse, FiltrosRecursosState, RecursoItem } from '@/types/recurso';
import { DEFAULT_ADMIN_USER_ID } from '@/lib/api/client';
import { getRecursos, RecursoServiceError } from '@/services/recursosService';
import { getErrorMessage } from '@/lib/utils/errorUtils';
import { getSocket } from '@/lib/socket/client';
import { catalogosService, DELEGACIONES_FALLBACK } from '@/services/catalogosService';

export const DELEGACIONES_MUNICIPALES = DELEGACIONES_FALLBACK;

import { USUARIOS_SIMULADOS_SISTEMA } from '@/config/usuariosSimulados';
export const USUARIOS_PRUEBA = USUARIOS_SIMULADOS_SISTEMA;

export interface UseRecursosReturn {
  recursos: RecursoItem[];
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
  actualizarRecursoEnLista: (recursoActualizado: RecursoItem) => void;
}

export function useRecursos(
  filtros: FiltrosRecursosState,
  userId: string = DEFAULT_ADMIN_USER_ID
): UseRecursosReturn {
  const [data, setData] = useState<ListarRecursosResponse | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

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
      const delegacionId =
        filtros.delegacionId ||
        (filtros.delegacionNombre && filtros.delegacionNombre !== 'TODAS'
          ? catalogosService.resolverDelegacionId(filtros.delegacionNombre)
          : undefined);

      const response = await getRecursos(
        {
          ...filtros,
          delegacionId,
        },
        userId,
        controller.signal
      );
      setData(response);
      setStatusCode(200);
      setError(null);
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        return;
      }
      if (err instanceof RecursoServiceError) {
        setStatusCode(err.apiError.statusCode ?? 500);
        setError(new Error(err.apiError.message));
      } else {
        setStatusCode(500);
        setError(new Error(getErrorMessage(err)));
      }
    } finally {
      setCargando(false);
    }
  }, [
    filtros,
    userId,
  ]);

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

  const actualizarRecursoEnLista = useCallback((recursoActualizado: RecursoItem) => {
    if (!recursoActualizado || !recursoActualizado.id) return;
    setData((prev) => {
      if (!prev) return prev;
      const index = prev.data.findIndex((r) => r.id === recursoActualizado.id);
      if (index === -1) return prev;
      const updatedList = [...prev.data];
      updatedList[index] = {
        ...updatedList[index],
        ...recursoActualizado,
      };
      return {
        ...prev,
        data: updatedList,
      };
    });
  }, []);

  // Suscripción en tiempo real vía WebSockets (Socket.io)
  useEffect(() => {
    const socket = getSocket();

    function handleRecursoActualizado(recursoActualizado: RecursoItem) {
      actualizarRecursoEnLista(recursoActualizado);
    }

    socket.on('recurso:actualizado', handleRecursoActualizado);

    return () => {
      socket.off('recurso:actualizado', handleRecursoActualizado);
    };
  }, [actualizarRecursoEnLista]);

  const metaRaw = data?.meta as Record<string, unknown> | undefined;
  const metaNormalizado = {
    total: typeof metaRaw?.total === 'number' ? metaRaw.total : 0,
    pagina: typeof metaRaw?.page === 'number' ? metaRaw.page : (typeof metaRaw?.pagina === 'number' ? metaRaw.pagina : (filtros.pagina || 1)),
    limite: typeof metaRaw?.limit === 'number' ? metaRaw.limit : (typeof metaRaw?.limite === 'number' ? metaRaw.limite : (filtros.limite || 10)),
    totalPaginas: typeof metaRaw?.totalPages === 'number' ? metaRaw.totalPages : (typeof metaRaw?.totalPaginas === 'number' ? metaRaw.totalPaginas : 0),
  };

  return {
    recursos: data?.data ?? [],
    meta: metaNormalizado,
    cargando,
    error,
    statusCode,
    recargar: fetchData,
    actualizarRecursoEnLista,
  };
}
