'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  listarOperativosRecuperacion,
  RecuperacionServiceError,
} from '@/services/recuperacionService';
import { useDebounce } from '@/hooks/useDebounce';
import { useRecuperacionSocket } from '@/hooks/useRecuperacionSocket';
import type {
  EstadoRecuperacion,
  PrioridadRecuperacion,
  OrdenarPorRecuperacion,
  DireccionOrdenRecuperacion,
  OperativoRecuperacionListadoItem,
  PaginacionMetaH34,
} from '@/types/recuperacion';

export interface FiltrosOperativosRecuperacion {
  delegacionId: string;
  estado: EstadoRecuperacion | '';
  prioridad: PrioridadRecuperacion | '';
  busqueda: string;
  fechaDesde: string;
  fechaHasta: string;
}

export const FILTROS_RECUPERACION_INICIALES: FiltrosOperativosRecuperacion = {
  delegacionId: '',
  estado: '',
  prioridad: '',
  busqueda: '',
  fechaDesde: '',
  fechaHasta: '',
};

const META_INICIAL: PaginacionMetaH34 = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
};

export interface UseOperativosRecuperacionOptions {
  enabled?: boolean;
}

/**
 * Hook de gestión de estado, filtros, paginación H34 y tiempo real
 * para el listado de operativos de recuperación (HU-73).
 */
export function useOperativosRecuperacion({
  enabled = true,
}: UseOperativosRecuperacionOptions = {}) {
  const [operativos, setOperativos] = useState<OperativoRecuperacionListadoItem[]>([]);
  const [meta, setMeta] = useState<PaginacionMetaH34>(META_INICIAL);
  const [filtros, setFiltrosState] = useState<FiltrosOperativosRecuperacion>(
    FILTROS_RECUPERACION_INICIALES
  );
  const [page, setPage] = useState<number>(1);
  const [limit, setLimitState] = useState<number>(10);
  const [ordenarPor, setOrdenarPor] = useState<OrdenarPorRecuperacion>('creadoEn');
  const [orden, setOrden] = useState<DireccionOrdenRecuperacion>('desc');
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [esForbidden, setEsForbidden] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const busquedaDebounced = useDebounce(filtros.busqueda, 350);

  useEffect(() => {
    if (!enabled) return;

    let activo = true;

    Promise.resolve()
      .then(() => {
        if (activo) {
          setCargando(true);
          setError(null);
          setEsForbidden(false);
        }
        return listarOperativosRecuperacion({
          page,
          limit,
          delegacionId: filtros.delegacionId || undefined,
          estado: filtros.estado || undefined,
          prioridad: filtros.prioridad || undefined,
          busqueda: busquedaDebounced || undefined,
          fechaDesde: filtros.fechaDesde || undefined,
          fechaHasta: filtros.fechaHasta || undefined,
          ordenarPor,
          orden,
        });
      })
      .then((response) => {
        if (!activo) return;
        setOperativos(response.data);
        setMeta(response.meta);
      })
      .catch((err: unknown) => {
        if (!activo) return;
        if (err instanceof RecuperacionServiceError && err.statusCode === 403) {
          setEsForbidden(true);
          setError(err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Error al cargar los operativos de recuperación.');
        }
        setOperativos([]);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [
    enabled,
    page,
    limit,
    filtros.delegacionId,
    filtros.estado,
    filtros.prioridad,
    busquedaDebounced,
    filtros.fechaDesde,
    filtros.fechaHasta,
    ordenarPor,
    orden,
    refreshTrigger,
  ]);

  useRecuperacionSocket({
    enabled,
    onRecuperacionCreada: () => {
      setRefreshTrigger((prev) => prev + 1);
    },
  });

  const setFiltros = useCallback(
    (
      updater:
        | FiltrosOperativosRecuperacion
        | ((prev: FiltrosOperativosRecuperacion) => FiltrosOperativosRecuperacion)
    ) => {
      setFiltrosState((prev) =>
        typeof updater === 'function' ? updater(prev) : updater
      );
      setPage(1);
    },
    []
  );

  const limpiarFiltros = useCallback(() => {
    setFiltrosState(FILTROS_RECUPERACION_INICIALES);
    setPage(1);
  }, []);

  const setLimit = useCallback((nuevoLimite: number) => {
    setLimitState(nuevoLimite);
    setPage(1);
  }, []);

  const toggleOrden = useCallback(
    (campo: OrdenarPorRecuperacion) => {
      if (ordenarPor === campo) {
        setOrden((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setOrdenarPor(campo);
        setOrden(campo === 'creadoEn' ? 'desc' : 'asc');
      }
      setPage(1);
    },
    [ordenarPor]
  );

  const recargar = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return {
    operativos,
    meta,
    filtros,
    setFiltros,
    limpiarFiltros,
    page,
    setPage,
    limit,
    setLimit,
    ordenarPor,
    orden,
    toggleOrden,
    cargando,
    error,
    esForbidden,
    recargar,
  };
}
