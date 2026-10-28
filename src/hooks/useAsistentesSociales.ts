'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  AsistenteSocialItem,
  FiltrosAsistentesSocialesState,
  MetaAsistentesSociales,
  RespuestaAsistentesSociales,
} from '@/types/asistenteSocialPersonal';
import {
  obtenerAsistentesSociales,
  AsistentesSocialesServiceError,
} from '@/services/asistentesSocialesService';

export interface UseAsistentesSocialesReturn {
  asistentes: AsistenteSocialItem[];
  meta: MetaAsistentesSociales;
  cargando: boolean;
  error: Error | null;
  statusCode: number | null;
  recargar: () => Promise<void>;
}

export function useAsistentesSociales(
  filtros: FiltrosAsistentesSocialesState
): UseAsistentesSocialesReturn {
  const [data, setData] = useState<RespuestaAsistentesSociales | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  const { pagina, limite, busqueda, delegacionId, estadoOperativo } = filtros;

  const fetchData = useCallback(async () => {
    setCargando(true);
    setError(null);
    setStatusCode(null);

    try {
      const response = await obtenerAsistentesSociales({
        pagina,
        limite,
        busqueda,
        delegacionId,
        estadoOperativo,
      });
      setData(response);
    } catch (err: unknown) {
      if (err instanceof AsistentesSocialesServiceError) {
        setError(err);
        setStatusCode(err.statusCode || 500);
      } else if (err instanceof Error) {
        setError(err);
        setStatusCode(500);
      }
    } finally {
      setCargando(false);
    }
  }, [pagina, limite, busqueda, delegacionId, estadoOperativo]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  return {
    asistentes: data?.data ?? [],
    meta: data?.meta ?? {
      total: 0,
      pagina: pagina || 1,
      limite: limite || 20,
      totalPaginas: 1,
    },
    cargando,
    error,
    statusCode,
    recargar: fetchData,
  };
}
