'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ListarRecursosResponse, FiltrosRecursosState, RecursoItem } from '@/types/recurso';
import { DEFAULT_ADMIN_USER_ID } from '@/lib/api/client';
import { getRecursos, RecursoServiceError } from '@/services/recursosService';
import { getErrorMessage } from '@/lib/utils/errorUtils';
import { getSocket } from '@/lib/socket/client';

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

export const USUARIOS_PRUEBA = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    nombre: 'Administrador General',
    email: 'admin@valdivia.cl',
    rol: 'Administrador',
    permitido: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    nombre: 'Operador Call Center',
    email: 'callcenter@valdivia.cl',
    rol: 'Call Center',
    permitido: false,
  },
];

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
      const response = await getRecursos(filtros, userId, controller.signal);
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

  // Suscripción en tiempo real vía WebSockets (Socket.io)
  useEffect(() => {
    const socket = getSocket();

    function handleRecursoEliminado(payload: { id: string; nombre?: string }) {
      if (payload?.id) {
        removerRecursoDeLista(payload.id);
      }
    }

    socket.on('recurso:eliminado', handleRecursoEliminado);

    return () => {
      socket.off('recurso:eliminado', handleRecursoEliminado);
    };
  }, [removerRecursoDeLista]);

  return {
    recursos: data?.data ?? [],
    meta: data?.meta ?? {
      total: 0,
      pagina: filtros.pagina || 1,
      limite: filtros.limite || 10,
      totalPaginas: 0,
    },
    cargando,
    error,
    statusCode,
    recargar: fetchData,
    removerRecursoDeLista,
  };
}
