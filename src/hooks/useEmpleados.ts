'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { EmpleadoUsuario, PaginationMeta } from '@/types/empleados';
import { useCatalogos } from '@/hooks/useCatalogos';
import { empleadosService } from '@/services/empleadosService';
import { getErrorMessage } from '@/lib/utils/errorUtils';

interface UseEmpleadosProps {
  versionActualizacion?: number;
}

export type EstadoFiltro = 'todos' | 'activo' | 'inactivo';

const FILTROS_INICIALES = {
  termino: '',
  delegacionFiltro: '',
  rolFiltro: '',
  estadoFiltro: 'todos' as EstadoFiltro,
  estadoOperativoFiltro: '',
  especialidadFiltro: '',
  cargoFiltro: '',
  ordenarPor: 'apellidos',
  orden: 'asc' as 'asc' | 'desc',
  incluirInactivos: false,
};

/**
 * Custom Hook para gestionar el listado, filtros, paginación y orden del personal.
 *
 * H11: la paginación y los filtros se resuelven en el servidor (GET /api/personal);
 * la disponibilidad se filtra por `estadoOperativo` y se puede incluir el personal
 * dado de baja con el toggle `incluirInactivos`.
 */
export function useEmpleados({ versionActualizacion = 0 }: UseEmpleadosProps = {}) {
  const [termino, setTermino] = useState(FILTROS_INICIALES.termino);
  const [delegacionFiltro, setDelegacionFiltro] = useState(FILTROS_INICIALES.delegacionFiltro);
  const [rolFiltro, setRolFiltro] = useState(FILTROS_INICIALES.rolFiltro);
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>(FILTROS_INICIALES.estadoFiltro);
  const [estadoOperativoFiltro, setEstadoOperativoFiltro] = useState(
    FILTROS_INICIALES.estadoOperativoFiltro
  );
  const [especialidadFiltro, setEspecialidadFiltro] = useState(
    FILTROS_INICIALES.especialidadFiltro
  );
  const [cargoFiltro, setCargoFiltro] = useState(FILTROS_INICIALES.cargoFiltro);
  const [ordenarPor, setOrdenarPor] = useState(FILTROS_INICIALES.ordenarPor);
  const [orden, setOrden] = useState<'asc' | 'desc'>(FILTROS_INICIALES.orden);
  const [incluirInactivos, setIncluirInactivos] = useState(FILTROS_INICIALES.incluirInactivos);
  const [paginaActual, setPaginaActual] = useState(1);
  const [limite, setLimite] = useState(10);

  const { catalogos } = useCatalogos();

  const [resultados, setResultados] = useState<EmpleadoUsuario[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Handlers para filtros que resetean la página a 1 (estándar transversal de paginación)
  const handleSetTermino = useCallback((val: string | ((prev: string) => string)) => {
    setTermino(val);
    setPaginaActual(1);
  }, []);

  const handleSetDelegacionFiltro = useCallback((val: string | ((prev: string) => string)) => {
    setDelegacionFiltro(val);
    setPaginaActual(1);
  }, []);

  const handleSetRolFiltro = useCallback((val: string | ((prev: string) => string)) => {
    setRolFiltro(val);
    setPaginaActual(1);
  }, []);

  const handleSetEstadoFiltro = useCallback((val: EstadoFiltro | ((prev: EstadoFiltro) => EstadoFiltro)) => {
    setEstadoFiltro(val);
    setPaginaActual(1);
  }, []);

  const handleSetEstadoOperativoFiltro = useCallback((val: string | ((prev: string) => string)) => {
    setEstadoOperativoFiltro(val);
    setPaginaActual(1);
  }, []);

  const handleSetEspecialidadFiltro = useCallback((val: string | ((prev: string) => string)) => {
    setEspecialidadFiltro(val);
    setPaginaActual(1);
  }, []);

  const handleSetCargoFiltro = useCallback((val: string | ((prev: string) => string)) => {
    setCargoFiltro(val);
    setPaginaActual(1);
  }, []);

  const handleSetOrdenarPor = useCallback((val: string | ((prev: string) => string)) => {
    setOrdenarPor(val);
    setPaginaActual(1);
  }, []);

  const handleSetOrden = useCallback((val: ('asc' | 'desc') | ((prev: 'asc' | 'desc') => 'asc' | 'desc')) => {
    setOrden(val);
    setPaginaActual(1);
  }, []);

  const handleSetIncluirInactivos = useCallback((val: boolean | ((prev: boolean) => boolean)) => {
    setIncluirInactivos(val);
    setPaginaActual(1);
  }, []);

  const handleSetLimite = useCallback((val: number | ((prev: number) => number)) => {
    setLimite(val);
    setPaginaActual(1);
  }, []);

  // Consulta al servidor con paginación y filtros (H11)
  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current?.abort();
    abortControllerRef.current = controller;

    const timer = setTimeout(async () => {
      setCargando(true);
      setError(null);
      try {
        const respuesta = await empleadosService.getEmpleadosPaginado(
          {
            busqueda: termino || undefined,
            delegacion_id: delegacionFiltro || undefined,
            rol_id: rolFiltro || undefined,
            estadoOperativo: estadoOperativoFiltro || undefined,
            especialidad: especialidadFiltro || undefined,
            cargo: cargoFiltro || undefined,
            ordenar_por: ordenarPor,
            orden,
            incluirInactivos,
            estado: estadoFiltro === 'todos' ? undefined : estadoFiltro,
            page: paginaActual,
            limit: limite,
          },
          undefined,
          controller.signal
        );

        if (controller.signal.aborted) return;

        setResultados(respuesta.data);
        setMeta(respuesta.meta);
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(getErrorMessage(err, 'Error al buscar empleados'));
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [
    termino,
    delegacionFiltro,
    rolFiltro,
    estadoFiltro,
    estadoOperativoFiltro,
    especialidadFiltro,
    cargoFiltro,
    ordenarPor,
    orden,
    incluirInactivos,
    paginaActual,
    limite,
    versionActualizacion,
  ]);

  // Sincronización de filtros con la URL (estado compartible por enlace)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams();
    if (termino.trim()) params.set('busqueda', termino.trim());
    if (delegacionFiltro) params.set('delegacion_id', delegacionFiltro);
    if (rolFiltro) params.set('rol_id', rolFiltro);
    if (estadoFiltro !== 'todos') params.set('estado', estadoFiltro);
    if (estadoOperativoFiltro) params.set('estadoOperativo', estadoOperativoFiltro);
    if (especialidadFiltro) params.set('especialidad', especialidadFiltro);
    if (cargoFiltro) params.set('cargo', cargoFiltro);
    if (ordenarPor !== 'apellidos') params.set('ordenar_por', ordenarPor);
    if (orden !== 'asc') params.set('orden', orden);
    if (incluirInactivos) params.set('incluirInactivos', 'true');
    if (paginaActual > 1) params.set('page', String(paginaActual));
    if (limite !== 10) params.set('limit', String(limite));

    const query = params.toString();
    const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, '', url);
  }, [
    termino,
    delegacionFiltro,
    rolFiltro,
    estadoFiltro,
    estadoOperativoFiltro,
    especialidadFiltro,
    cargoFiltro,
    ordenarPor,
    orden,
    incluirInactivos,
    paginaActual,
    limite,
  ]);

  const limpiarFiltros = useCallback(() => {
    setTermino(FILTROS_INICIALES.termino);
    setDelegacionFiltro(FILTROS_INICIALES.delegacionFiltro);
    setRolFiltro(FILTROS_INICIALES.rolFiltro);
    setEstadoFiltro(FILTROS_INICIALES.estadoFiltro);
    setEstadoOperativoFiltro(FILTROS_INICIALES.estadoOperativoFiltro);
    setEspecialidadFiltro(FILTROS_INICIALES.especialidadFiltro);
    setCargoFiltro(FILTROS_INICIALES.cargoFiltro);
    setOrdenarPor(FILTROS_INICIALES.ordenarPor);
    setOrden(FILTROS_INICIALES.orden);
    setIncluirInactivos(FILTROS_INICIALES.incluirInactivos);
    setPaginaActual(1);
  }, []);

  // La paginación se resuelve en el servidor: la página actual es el resultado consultado
  const totalItems = meta?.total ?? resultados.length;
  const totalPaginas = meta?.totalPages ?? 1;

  const currentMeta: PaginationMeta = useMemo(() => {
    return {
      total: totalItems,
      page: paginaActual,
      limit: limite,
      totalPages: totalPaginas,
      hasNext: Boolean(meta?.hasNext) || paginaActual < totalPaginas,
      hasPrev: Boolean(meta?.hasPrev) || paginaActual > 1,
    };
  }, [meta, totalItems, paginaActual, limite, totalPaginas]);

  return {
    termino,
    setTermino: handleSetTermino,
    delegacionFiltro,
    setDelegacionFiltro: handleSetDelegacionFiltro,
    rolFiltro,
    setRolFiltro: handleSetRolFiltro,
    estadoFiltro,
    setEstadoFiltro: handleSetEstadoFiltro,
    estadoOperativoFiltro,
    setEstadoOperativoFiltro: handleSetEstadoOperativoFiltro,
    especialidadFiltro,
    setEspecialidadFiltro: handleSetEspecialidadFiltro,
    cargoFiltro,
    setCargoFiltro: handleSetCargoFiltro,
    ordenarPor,
    setOrdenarPor: handleSetOrdenarPor,
    orden,
    setOrden: handleSetOrden,
    incluirInactivos,
    setIncluirInactivos: handleSetIncluirInactivos,
    paginaActual,
    setPaginaActual,
    limite,
    setLimite: handleSetLimite,
    totalItems,
    totalPaginas,
    meta: currentMeta,
    catalogos,
    resultados,
    empleadosPaginados: resultados,
    cargando,
    error,
    limpiarFiltros,
  };
}
