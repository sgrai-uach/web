'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  ListarPuntosCriticosResponse,
  FiltrosPuntosCriticosState,
  PuntoCriticoItem,
  PuntoCriticoEliminadoSocketPayload,
} from '@/types/puntoCritico';
import { DEFAULT_ADMIN_USER_ID } from '@/lib/api/client';
import { getSocket } from '@/lib/socket/client';
import type { Socket } from 'socket.io-client';
import {
  getPuntosCriticos,
  PuntoCriticoServiceError,
} from '@/services/puntosCriticosService';
import { getErrorMessage } from '@/lib/utils/errorUtils';

export const DELEGACIONES_MUNICIPALES = [
  {
    id: '30000000-0000-4000-8000-000000000001',
    codigo: 'DEL_NORTE',
    nombre: 'Delegación Municipal Norte',
    descripcion: 'Las Ánimas, Cabo Blanco',
  },
  {
    id: '30000000-0000-4000-8000-000000000002',
    codigo: 'DEL_SUR',
    nombre: 'Delegación Municipal Sur',
    descripcion: 'Angachilla, Guacamayo',
  },
  {
    id: '30000000-0000-4000-8000-000000000003',
    codigo: 'DEL_COSTA',
    nombre: 'Delegación Municipal Costa',
    descripcion: 'Niebla, Los Molinos, Corral',
  },
  {
    id: '30000000-0000-4000-8000-000000000004',
    codigo: 'DEL_CALLE_CALLE',
    nombre: 'Delegación Municipal Calle Calle',
    descripcion: 'Collico, Corvi',
  },
];

export interface UsePuntosCriticosReturn {
  puntosCriticos: PuntoCriticoItem[];
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
  removerPuntoLocalmente: (id: string) => void;
  actualizarPuntoCriticoEnLista: (puntoActualizado: PuntoCriticoItem) => void;
}

export function usePuntosCriticos(
  filtros: FiltrosPuntosCriticosState,
  userId: string = DEFAULT_ADMIN_USER_ID
): UsePuntosCriticosReturn {
  const [data, setData] = useState<ListarPuntosCriticosResponse | null>(null);
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
      const response = await getPuntosCriticos(filtros, userId, controller.signal);
      setData(response);
      setStatusCode(200);
      setError(null);
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        return;
      }
      if (err instanceof PuntoCriticoServiceError) {
        setStatusCode(err.apiError.statusCode ?? 500);
        setError(new Error(err.apiError.message));
      } else {
        setStatusCode(500);
        setError(new Error(getErrorMessage(err)));
      }
    } finally {
      setCargando(false);
    }
  }, [filtros, userId]);

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

  // Actualizar un punto crítico en memoria sin recargar la lista
  const actualizarPuntoCriticoEnLista = useCallback((puntoActualizado: PuntoCriticoItem) => {
    if (!puntoActualizado || !puntoActualizado.id) return;
    setData((prev) => {
      if (!prev) return prev;
      const index = prev.data.findIndex((p) => p.id === puntoActualizado.id);
      if (index === -1) return prev;
      const updatedList = [...prev.data];
      updatedList[index] = {
        ...updatedList[index],
        ...puntoActualizado,
      };
      return {
        ...prev,
        data: updatedList,
      };
    });
  }, []);

  const removerPuntoLocalmente = useCallback((id: string) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        data: prev.data.filter((item) => item.id !== id),
        meta: {
          ...prev.meta,
          total: Math.max(0, prev.meta.total - 1),
        },
      };
    });
  }, []);

  // Suscripción reactiva en tiempo real vía WebSockets (Socket.io)
  useEffect(() => {
    let socketInstance: Socket | null = null;
    try {
      socketInstance = getSocket();
    } catch {
      return;
    }

    if (!socketInstance) return;

    const handlePuntoCriticoEliminado = (payload: PuntoCriticoEliminadoSocketPayload) => {
      setData((prev) => {
        if (!prev) return prev;
        const index = prev.data.findIndex((item) => item.id === payload.id);
        if (index === -1) return prev;

        const nuevosDatos = prev.data.filter((item) => item.id !== payload.id);
        return {
          ...prev,
          data: nuevosDatos,
          meta: {
            ...prev.meta,
            total: Math.max(0, prev.meta.total - 1),
          },
        };
      });
    };

    const handlePuntoActualizado = (puntoActualizado: PuntoCriticoItem) => {
      actualizarPuntoCriticoEnLista(puntoActualizado);
    };

    socketInstance.on('punto_critico:eliminado', handlePuntoCriticoEliminado);
    socketInstance.on('punto_critico:actualizado', handlePuntoActualizado);

    return () => {
      socketInstance?.off('punto_critico:eliminado', handlePuntoCriticoEliminado);
      socketInstance?.off('punto_critico:actualizado', handlePuntoActualizado);
    };
  }, [actualizarPuntoCriticoEnLista]);

  return {
    puntosCriticos: data?.data ?? [],
    meta: data?.meta ?? {
      total: 0,
      pagina: filtros.pagina || 1,
      limite: filtros.limite || 10,
      totalPaginas: 1,
    },
    cargando,
    error,
    statusCode,
    recargar: fetchData,
    removerPuntoLocalmente,
    actualizarPuntoCriticoEnLista,
  };
}
