'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  listarOperativosRecuperacion,
  RecuperacionServiceError,
} from '@/services/recuperacionService';
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

const ESTADOS_VALIDOS = new Set<EstadoRecuperacion>([
  'PLANIFICADA',
  'EN_EJECUCION',
  'COMPLETADA',
  'CANCELADA',
]);

const PRIORIDADES_VALIDAS = new Set<PrioridadRecuperacion>([
  'BAJA',
  'MEDIA',
  'ALTA',
  'CRITICA',
]);

const ORDEN_CAMPOS_VALIDOS = new Set<OrdenarPorRecuperacion>([
  'codigo',
  'prioridad',
  'creadoEn',
  'familiasAfectadas',
]);

function leerEstadoInicialDesdeUrl(): {
  filtros: FiltrosOperativosRecuperacion;
  page: number;
  limit: number;
  ordenarPor: OrdenarPorRecuperacion;
  orden: DireccionOrdenRecuperacion;
} {
  if (typeof window === 'undefined') {
    return {
      filtros: FILTROS_RECUPERACION_INICIALES,
      page: 1,
      limit: 10,
      ordenarPor: 'creadoEn',
      orden: 'desc',
    };
  }

  const sp = new URLSearchParams(window.location.search);
  const estadoRaw = sp.get('estado') as EstadoRecuperacion | null;
  const prioridadRaw = sp.get('prioridad') as PrioridadRecuperacion | null;
  const ordenCampoRaw = sp.get('ordenarPor') as OrdenarPorRecuperacion | null;
  const ordenDirRaw = sp.get('orden');
  const pageRaw = Number(sp.get('page'));
  const limitRaw = Number(sp.get('limit'));

  return {
    filtros: {
      delegacionId: sp.get('delegacionId') || '',
      estado: estadoRaw && ESTADOS_VALIDOS.has(estadoRaw) ? estadoRaw : '',
      prioridad: prioridadRaw && PRIORIDADES_VALIDAS.has(prioridadRaw) ? prioridadRaw : '',
      busqueda: sp.get('busqueda') || '',
      fechaDesde: sp.get('fechaDesde') || '',
      fechaHasta: sp.get('fechaHasta') || '',
    },
    page: Number.isInteger(pageRaw) && pageRaw >= 1 ? pageRaw : 1,
    limit: [10, 25, 50].includes(limitRaw) ? limitRaw : 10,
    ordenarPor:
      ordenCampoRaw && ORDEN_CAMPOS_VALIDOS.has(ordenCampoRaw) ? ordenCampoRaw : 'creadoEn',
    orden: ordenDirRaw === 'asc' || ordenDirRaw === 'desc' ? ordenDirRaw : 'desc',
  };
}

export interface UseOperativosRecuperacionOptions {
  enabled?: boolean;
  refreshSignal?: number;
}

/**
 * Hook de gestión de estado, filtros, persistencia URL H34, paginación y tiempo real
 * para el listado de operativos de recuperación (HU-73).
 */
export function useOperativosRecuperacion({
  enabled = true,
  refreshSignal = 0,
}: UseOperativosRecuperacionOptions = {}) {
  const [inicial] = useState(leerEstadoInicialDesdeUrl);
  const [operativos, setOperativos] = useState<OperativoRecuperacionListadoItem[]>([]);
  const [meta, setMeta] = useState<PaginacionMetaH34>(META_INICIAL);
  const [filtros, setFiltrosState] = useState<FiltrosOperativosRecuperacion>(inicial.filtros);
  const [page, setPage] = useState<number>(inicial.page);
  const [limit, setLimitState] = useState<number>(inicial.limit);
  const [ordenarPor, setOrdenarPor] = useState<OrdenarPorRecuperacion>(inicial.ordenarPor);
  const [orden, setOrden] = useState<DireccionOrdenRecuperacion>(inicial.orden);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [esForbidden, setEsForbidden] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Sincronización bidireccional con URLSearchParams (estándar H34)
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const sp = new URLSearchParams(window.location.search);
    const setOrDelete = (key: string, value: string | number | undefined, defaultVal?: string | number) => {
      if (value !== undefined && value !== '' && value !== defaultVal) {
        sp.set(key, String(value));
      } else {
        sp.delete(key);
      }
    };

    setOrDelete('page', page, 1);
    setOrDelete('limit', limit, 10);
    setOrDelete('delegacionId', filtros.delegacionId);
    setOrDelete('estado', filtros.estado);
    setOrDelete('prioridad', filtros.prioridad);
    setOrDelete('busqueda', filtros.busqueda.trim());
    setOrDelete('fechaDesde', filtros.fechaDesde);
    setOrDelete('fechaHasta', filtros.fechaHasta);
    setOrDelete('ordenarPor', ordenarPor, 'creadoEn');
    setOrDelete('orden', orden, 'desc');

    const queryStr = sp.toString();
    const nuevaUrl = queryStr
      ? `${window.location.pathname}?${queryStr}`
      : window.location.pathname;
    window.history.replaceState(null, '', nuevaUrl);
  }, [enabled, page, limit, filtros, ordenarPor, orden]);

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
          busqueda: filtros.busqueda.trim() || undefined,
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
    filtros.busqueda,
    filtros.fechaDesde,
    filtros.fechaHasta,
    ordenarPor,
    orden,
    refreshTrigger,
    refreshSignal,
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
