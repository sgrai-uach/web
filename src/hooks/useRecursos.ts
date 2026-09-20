'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ListarRecursosResponse, FiltrosRecursosState, RecursoItem } from '@/types/recurso';
import { DEFAULT_ADMIN_USER_ID } from '@/lib/api/client';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
    // Cancelar cualquier petición anterior aún en vuelo
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setCargando(true);
    setError(null);
    setStatusCode(null);

    const params = new URLSearchParams();
    params.set('pagina', String(filtros.pagina || 1));
    params.set('limite', String(filtros.limite || 10));

    if (filtros.delegacionId) {
      params.set('delegacionId', filtros.delegacionId);
    }
    if (filtros.estado) {
      params.set('estado', filtros.estado);
    }
    if (filtros.esIndividual !== undefined && filtros.esIndividual !== null) {
      params.set('esIndividual', String(filtros.esIndividual));
    }
    if (filtros.busqueda && filtros.busqueda.trim() !== '') {
      params.set('busqueda', filtros.busqueda.trim());
    }

    const url = `${API_BASE_URL}/api/recursos?${params.toString()}`;

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'X-User-Id': userId,
          Authorization: `Bearer ${userId}`,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      setStatusCode(res.status);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const err = new Error(
          errorData.message || `Error HTTP ${res.status}: Fallo al obtener inventario`
        );
        (err as unknown as { status: number }).status = res.status;
        throw err;
      }

      const json: ListarRecursosResponse = await res.json();
      setData(json);
      setError(null);
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        // Ignorar cancelaciones manuales
        return;
      }
      console.error('[useRecursos] Error al consultar API de recursos:', err);
      setError(err as Error);
    } finally {
      setCargando(false);
    }
  }, [
    filtros.pagina,
    filtros.limite,
    filtros.delegacionId,
    filtros.estado,
    filtros.esIndividual,
    filtros.busqueda,
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
  };
}
