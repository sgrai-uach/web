'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ListarRecursosResponse, FiltrosRecursosState, RecursoItem } from '@/types/recurso';
import { DEFAULT_ADMIN_USER_ID } from '@/lib/api/client';
import { getRecursos, RecursoServiceError } from '@/services/recursosService';
import { getErrorMessage } from '@/lib/utils/errorUtils';
import { getSocket } from '@/lib/socket/client';
import { suscribirSalasSocket } from '@/lib/socket/roomManager';
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
  removerRecursoDeLista: (id: string) => void;
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
  const filtrosRef = useRef(filtros);
  const fetchDataRef = useRef<() => Promise<void>>(async () => {});
  useEffect(() => {
    filtrosRef.current = filtros;
  }, [filtros]);

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

  useEffect(() => {
    fetchDataRef.current = fetchData;
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

  const removerRecursoDeLista = useCallback((id: string) => {
    if (!id) return;
    setData((prev) => {
      if (!prev) return prev;
      const index = prev.data.findIndex((r) => r.id === id);
      if (index === -1) return prev;
      const updatedList = prev.data.filter((r) => r.id !== id);
      return {
        ...prev,
        data: updatedList,
        meta: {
          ...prev.meta,
          total: Math.max(0, prev.meta.total - 1),
        },
      };
    });
  }, []);

  // Suscripción en tiempo real vía WebSockets (Socket.io) a salas encargado y supervisor (H68)
  useEffect(() => {
    try {
      const socket = getSocket();
      if (!socket || typeof socket.on !== 'function') return;

      if (!socket.connected && typeof socket.connect === 'function') {
        socket.connect();
      }

      const desuscribirSalas = suscribirSalasSocket(socket, [
        { sala: 'encargado', eventosJoin: ['join', 'unirse'], eventosLeave: ['leave', 'salir'] },
        { sala: 'supervisor', eventosJoin: ['join', 'unirse'], eventosLeave: ['leave', 'salir'] },
      ]);

      const handleRecursoActualizado = (rawPayload: unknown) => {
        const p = rawPayload as Record<string, unknown> | null | undefined;
        const raw = (p?.datos || p?.data || rawPayload) as Record<string, unknown> | null | undefined;
        if (!raw || typeof raw !== 'object') return;

        const id =
          typeof raw.id === 'string'
            ? raw.id
            : typeof raw.recursoId === 'string'
              ? raw.recursoId
              : typeof raw.recurso_id === 'string'
                ? raw.recurso_id
                : '';
        if (!id) return;

        const cantInv = raw.cantidadInventario ?? raw.cantidad_inventario;
        const cantUso = raw.cantidadEnUso ?? raw.cantidad_en_uso;
        const cantDisp = raw.cantidadDisponible ?? raw.cantidad_disponible;
        const cantMin = raw.cantidadMinima ?? raw.cantidad_minima;

        const cantidadInventario = typeof cantInv === 'number' ? cantInv : undefined;
        const cantidadEnUso = typeof cantUso === 'number' ? cantUso : undefined;
        const cantidadDisponible =
          typeof cantDisp === 'number'
            ? cantDisp
            : cantidadInventario !== undefined && cantidadEnUso !== undefined
              ? Math.max(0, cantidadInventario - cantidadEnUso)
              : undefined;

        const parcial: Partial<RecursoItem> & { id: string } = { id };
        if (typeof raw.nombre === 'string') parcial.nombre = raw.nombre;
        if (typeof raw.estado === 'string') parcial.estado = raw.estado as RecursoItem['estado'];
        if (cantidadInventario !== undefined) parcial.cantidadInventario = cantidadInventario;
        if (cantidadEnUso !== undefined) parcial.cantidadEnUso = cantidadEnUso;
        if (cantidadDisponible !== undefined) parcial.cantidadDisponible = cantidadDisponible;
        if (typeof cantMin === 'number') parcial.cantidadMinima = cantMin;

        setData((prev) => {
          if (!prev) return prev;
          const index = prev.data.findIndex((r) => r.id === id);
          if (index === -1) return prev;
          const updatedList = [...prev.data];
          const actual = updatedList[index];
          const nuevoInv = parcial.cantidadInventario ?? actual.cantidadInventario;
          const nuevoUso = parcial.cantidadEnUso ?? actual.cantidadEnUso;
          const nuevoDisp =
            parcial.cantidadDisponible ?? Math.max(0, nuevoInv - nuevoUso);
          updatedList[index] = {
            ...actual,
            ...parcial,
            cantidadDisponible: nuevoDisp,
          };
          return {
            ...prev,
            data: updatedList,
          };
        });

        if (filtrosRef.current.estado && parcial.estado && parcial.estado !== filtrosRef.current.estado) {
          void fetchDataRef.current();
        }
      };

      const handleRecursoEliminado = (payload: { id: string; nombre?: string }) => {
        if (payload?.id) {
          removerRecursoDeLista(payload.id);
        }
      };

      socket.on('recurso:actualizado', handleRecursoActualizado);
      socket.on('recurso:eliminado', handleRecursoEliminado);

      return () => {
        socket.off('recurso:actualizado', handleRecursoActualizado);
        socket.off('recurso:eliminado', handleRecursoEliminado);
        desuscribirSalas();
      };
    } catch {
      // Ignorar fallo de inicialización de socket en entornos de prueba
    }
  }, [removerRecursoDeLista]);

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
    removerRecursoDeLista,
  };
}
