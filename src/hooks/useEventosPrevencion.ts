'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { listarEventosPrevencion, PrevencionServiceError } from '@/services/prevencionService';
import { usePrevencionSocket } from '@/hooks/usePrevencionSocket';
import type {
  EventoPrevencionListItemDTO,
  FiltrosEventosPrevencionState,
  PaginacionMetaH34,
  EstadoEventoPrevencion,
} from '@/types/evento-prevencion';

export interface UseEventosPrevencionOptions {
  initialFiltros?: Partial<FiltrosEventosPrevencionState>;
  autoLoad?: boolean;
}

const META_INICIAL: PaginacionMetaH34 = {
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
};

export function useEventosPrevencion(options: UseEventosPrevencionOptions = {}) {
  const { initialFiltros, autoLoad = true } = options;

  const [filtros, setFiltros] = useState<FiltrosEventosPrevencionState>({
    busqueda: initialFiltros?.busqueda ?? '',
    delegacionId: initialFiltros?.delegacionId,
    estado: initialFiltros?.estado,
    pagina: initialFiltros?.pagina ?? 1,
    limite: initialFiltros?.limite ?? 20,
  });

  const [eventos, setEventos] = useState<EventoPrevencionListItemDTO[]>([]);
  const [meta, setMeta] = useState<PaginacionMetaH34>(META_INICIAL);
  const [cargando, setCargando] = useState<boolean>(autoLoad);
  const [error, setError] = useState<string | null>(null);
  const [esForbidden, setEsForbidden] = useState<boolean>(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<EventoPrevencionListItemDTO | null>(null);

  // Debounce para búsqueda textual
  const [busquedaDebounced, setBusquedaDebounced] = useState<string>(filtros.busqueda);
  const timerDebounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerDebounceRef.current) {
      clearTimeout(timerDebounceRef.current);
    }
    timerDebounceRef.current = setTimeout(() => {
      setBusquedaDebounced(filtros.busqueda);
    }, 300);

    return () => {
      if (timerDebounceRef.current) {
        clearTimeout(timerDebounceRef.current);
      }
    };
  }, [filtros.busqueda]);

  // Referencia de secuencia para evitar race conditions en llamadas asíncronas
  const requestIdRef = useRef<number>(0);

  const cargarEventos = useCallback(
    async (
      pag: number,
      lim: number,
      delId: string | undefined,
      est: EstadoEventoPrevencion | undefined,
      searchTerm: string
    ) => {
      const currentRequestId = ++requestIdRef.current;
      setCargando(true);
      setError(null);
      try {
        const respuesta = await listarEventosPrevencion({
          page: pag,
          limit: lim,
          delegacionId: delId,
          estado: est,
          busqueda: searchTerm.trim() ? searchTerm.trim() : undefined,
        });

        if (currentRequestId !== requestIdRef.current) return;

        setEventos(respuesta.data || []);
        setMeta(
          respuesta.meta || {
            total: respuesta.data?.length || 0,
            page: pag,
            limit: lim,
            totalPages: Math.max(1, Math.ceil((respuesta.data?.length || 0) / lim)),
            hasNext: false,
            hasPrev: pag > 1,
          }
        );
        setEsForbidden(false);

        // Si hay un evento seleccionado en el drawer, sincronizarlo con el nuevo listado si sigue existiendo
        setEventoSeleccionado((prev) => {
          if (!prev) return null;
          const actualizado = (respuesta.data || []).find((ev) => ev.id === prev.id);
          return actualizado || prev;
        });
      } catch (err: unknown) {
        if (currentRequestId !== requestIdRef.current) return;

        if (err instanceof PrevencionServiceError && err.statusCode === 403) {
          setEsForbidden(true);
          setError('No posee permisos suficientes para consultar eventos preventivos.');
        } else {
          const mensaje = err instanceof Error ? err.message : 'Error al consultar los eventos preventivos';
          setError(mensaje);
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setCargando(false);
        }
      }
    },
    []
  );

  const { pagina, limite, delegacionId, estado } = filtros;

  useEffect(() => {
    if (!autoLoad) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarEventos(pagina, limite, delegacionId, estado, busquedaDebounced);
  }, [autoLoad, cargarEventos, pagina, limite, delegacionId, estado, busquedaDebounced]);

  // Recarga manual
  const recargar = useCallback(async () => {
    await cargarEventos(pagina, limite, delegacionId, estado, busquedaDebounced);
  }, [cargarEventos, pagina, limite, delegacionId, estado, busquedaDebounced]);

  // Soporte reactivo WebSocket
  usePrevencionSocket({
    onEventoCreado: () => {
      recargar();
    },
    enabled: autoLoad,
  });

  // Mutadores de filtros
  const cambiarBusqueda = useCallback((busqueda: string) => {
    setFiltros((prev) => ({
      ...prev,
      busqueda,
      pagina: 1, // Reset a primera página en nueva búsqueda
    }));
  }, []);

  const cambiarDelegacion = useCallback((delegacionId?: string) => {
    setFiltros((prev) => ({
      ...prev,
      delegacionId: delegacionId || undefined,
      pagina: 1,
    }));
  }, []);

  const cambiarEstado = useCallback((estado?: EstadoEventoPrevencion) => {
    setFiltros((prev) => ({
      ...prev,
      estado: estado || undefined,
      pagina: 1,
    }));
  }, []);

  const cambiarPagina = useCallback((pagina: number) => {
    setFiltros((prev) => ({
      ...prev,
      pagina,
    }));
  }, []);

  const cambiarLimite = useCallback((limite: number) => {
    setFiltros((prev) => ({
      ...prev,
      limite,
      pagina: 1,
    }));
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros({
      busqueda: '',
      delegacionId: undefined,
      estado: undefined,
      pagina: 1,
      limite: 20,
    });
  }, []);

  const hayFiltrosActivos = useMemo(() => {
    return Boolean(
      filtros.busqueda.trim() ||
        filtros.delegacionId ||
        filtros.estado ||
        filtros.pagina > 1
    );
  }, [filtros]);

  return {
    eventos,
    meta,
    cargando,
    error,
    esForbidden,
    eventoSeleccionado,
    setEventoSeleccionado,
    filtros,
    setFiltros,
    cambiarBusqueda,
    cambiarDelegacion,
    cambiarEstado,
    cambiarPagina,
    cambiarLimite,
    limpiarFiltros,
    recargar,
    hayFiltrosActivos,
  };
}
