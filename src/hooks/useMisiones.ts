'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { misionesService } from '@/services/misionesService';
import type { FiltrosMisiones, MisionItem } from '@/types/misiones';
import { DEFAULT_ENCARGADO_ID } from '@/services/incidentesService';

export const FILTROS_MISIONES_DEFECTO: FiltrosMisiones = {
  busqueda: '',
  estado: 'TODOS',
  tipoMision: 'TODOS',
  prioridad: '',
  delegacion: 'TODAS',
  page: 1,
  limit: 10,
};

export function useMisiones(userId: string = DEFAULT_ENCARGADO_ID) {
  const [filtros, setFiltrosState] = useState<FiltrosMisiones>(FILTROS_MISIONES_DEFECTO);
  const [misiones, setMisiones] = useState<MisionItem[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const consultar = useCallback(
    async (filtrosActuales: FiltrosMisiones) => {
      setCargando(true);
      setError(null);
      try {
        const res = await misionesService.listar(filtrosActuales, userId);
        if (res.exito) {
          setMisiones(res.data);
          setMeta(res.meta);
        } else {
          setError(res.mensaje);
        }
      } catch {
        setError('Error al consultar misiones.');
      } finally {
        setCargando(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    let activo = true;

    const timer = setTimeout(() => {
      if (activo) {
        consultar(filtros);
      }
    }, 0);

    return () => {
      activo = false;
      clearTimeout(timer);
    };
  }, [consultar, filtros]);

  // Actualizar filtros reseteando siempre a página 1 (coherencia en paginación)
  const setFiltros = useCallback((actualizador: Partial<FiltrosMisiones> | ((prev: FiltrosMisiones) => FiltrosMisiones)) => {
    setFiltrosState((prev) => {
      const nuevos = typeof actualizador === 'function' ? actualizador(prev) : { ...prev, ...actualizador };
      // Si cambió algún criterio de filtro que no sea la página, resetear a página 1
      if (
        nuevos.busqueda !== prev.busqueda ||
        nuevos.estado !== prev.estado ||
        nuevos.tipoMision !== prev.tipoMision ||
        nuevos.prioridad !== prev.prioridad ||
        nuevos.delegacion !== prev.delegacion ||
        nuevos.limit !== prev.limit
      ) {
        return { ...nuevos, page: 1 };
      }
      return nuevos;
    });
  }, []);

  const cambiarPagina = useCallback((nuevaPagina: number) => {
    setFiltrosState((prev) => ({ ...prev, page: nuevaPagina }));
  }, []);

  const cambiarLimite = useCallback((nuevoLimite: number) => {
    setFiltrosState((prev) => ({ ...prev, limit: nuevoLimite, page: 1 }));
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltrosState(FILTROS_MISIONES_DEFECTO);
  }, []);

  const recargar = useCallback(async () => {
    await consultar(filtros);
  }, [consultar, filtros]);

  const hayFiltrosActivos = useMemo(() => {
    return (
      Boolean(filtros.busqueda.trim()) ||
      filtros.estado !== 'TODOS' ||
      filtros.tipoMision !== 'TODOS' ||
      Boolean(filtros.prioridad) ||
      filtros.delegacion !== 'TODAS'
    );
  }, [filtros]);

  return {
    misiones,
    meta,
    cargando,
    error,
    filtros,
    setFiltros,
    cambiarPagina,
    cambiarLimite,
    limpiarFiltros,
    recargar,
    hayFiltrosActivos,
  };
}
