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
  const [cargando, setCargando] = useState<boolean>(false);
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

  const cargarEventos = useCallback(
    async (
      f: FiltrosEventosPrevencionState,
      searchTerm: string
    ) => {
      setCargando(true);
      setError(null);
      try {
        const respuesta = await listarEventosPrevencion({
          page: f.pagina,
          limit: f.limite,
          delegacionId: f.delegacionId,
          estado: f.estado,
          busqueda: searchTerm.trim() ? searchTerm.trim() : undefined,
        });

        setEventos(respuesta.data || []);
        setMeta(
          respuesta.meta || {
            total: respuesta.data?.length || 0,
            page: f.pagina,
            limit: f.limite,
            totalPages: Math.max(1, Math.ceil((respuesta.data?.length || 0) / f.limite)),
            hasNext: false,
            hasPrev: f.pagina > 1,
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
        if (err instanceof PrevencionServiceError && err.statusCode === 403) {
          setEsForbidden(true);
          setError('No posee permisos suficientes para consultar eventos preventivos.');
        } else {
          const mensaje = err instanceof Error ? err.message : 'Error al consultar los eventos preventivos';
          setError(mensaje);
        }
      } finally {
        setCargando(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!autoLoad) return;

    let activo = true;
    const timer = setTimeout(() => {
      if (activo) {
        cargarEventos(filtros, busquedaDebounced);
      }
    }, 0);

    return () => {
      activo = false;
      clearTimeout(timer);
    };
  }, [autoLoad, cargarEventos, filtros, busquedaDebounced]);

  // Recarga manual
  const recargar = useCallback(async () => {
    await cargarEventos(filtros, busquedaDebounced);
  }, [cargarEventos, filtros, busquedaDebounced]);

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
