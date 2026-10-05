'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  ListarPuntosCriticosResponse,
  FiltrosPuntosCriticosState,
  PuntoCriticoItem,
} from '@/types/puntoCritico';
import { DEFAULT_ADMIN_USER_ID } from '@/lib/api/client';
import {
  getPuntosCriticos,
  PuntoCriticoServiceError,
} from '@/services/puntosCriticosService';
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

  // Escucha Socket.io en tiempo real para reflejar nuevos puntos críticos sin recargar
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const socket = getSocket();
      const handlePuntoCreado = () => {
        fetchData();
      };

      socket.on('punto_critico:creado', handlePuntoCreado);
      return () => {
        socket.off('punto_critico:creado', handlePuntoCreado);
      };
    } catch {
      // Ignorar excepciones en entornos sin socket o pruebas jsdom
    }
  }, [fetchData]);

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
  };
}
