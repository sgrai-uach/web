'use client';

import { useState, useEffect, useCallback } from 'react';
import { cuadrillasService } from '@/services/cuadrillasService';
import { getSocket } from '@/lib/socket/client';
import type {
  CuadrillaItem,
  FiltrosCuadrillasState,
  MetaPaginacionCuadrillas,
} from '@/types/cuadrilla';

export interface UseCuadrillasReturn {
  cuadrillas: CuadrillaItem[];
  meta: MetaPaginacionCuadrillas;
  cargando: boolean;
  error: string | null;
  recargar: () => Promise<void>;
  actualizarCuadrillaEnLista: (cuadrillaActualizada: CuadrillaItem) => void;
  removerCuadrillaDeLista: (id: string) => void;
}

export function useCuadrillas(filtros: FiltrosCuadrillasState): UseCuadrillasReturn {
  const [cuadrillas, setCuadrillas] = useState<CuadrillaItem[]>([]);
  const [meta, setMeta] = useState<MetaPaginacionCuadrillas>({
    total: 0,
    pagina: filtros.pagina || 1,
    limite: filtros.limite || 10,
    paginasTotales: 1,
  });
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const resultado = await cuadrillasService.obtenerCuadrillas(filtros);
      setCuadrillas(resultado.cuadrillas);
      setMeta(resultado.meta);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar las cuadrillas operativas.');
    } finally {
      setCargando(false);
    }
  }, [filtros]);

  const { pagina, limite, busqueda, delegacionId, estado } = filtros;

  useEffect(() => {
    let ignore = false;
    cuadrillasService
      .obtenerCuadrillas({ pagina, limite, busqueda, delegacionId, estado })
      .then((resultado) => {
        if (!ignore) {
          setCuadrillas(resultado.cuadrillas);
          setMeta(resultado.meta);
          setCargando(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Error al cargar las cuadrillas operativas.');
          setCargando(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [pagina, limite, busqueda, delegacionId, estado]);

  const actualizarCuadrillaEnLista = useCallback((cuadrillaActualizada: CuadrillaItem) => {
    setCuadrillas((prev) => {
      const index = prev.findIndex((c) => c.id === cuadrillaActualizada.id);
      if (index === -1) {
        return [cuadrillaActualizada, ...prev];
      }
      const copia = [...prev];
      copia[index] = { ...copia[index], ...cuadrillaActualizada };
      return copia;
    });
  }, []);

  const removerCuadrillaDeLista = useCallback((id: string) => {
    setCuadrillas((prev) => prev.filter((c) => c.id !== id));
    setMeta((prev) => ({
      ...prev,
      total: Math.max(0, prev.total - 1),
    }));
  }, []);

  // Suscripción WebSocket para reflejar cuadrillas creadas, actualizadas o desactivadas en vivo
  useEffect(() => {
    try {
      const socket = getSocket();
      if (!socket) return;

      const handleCuadrillaActualizada = (cuadrilla: CuadrillaItem) => {
        if (cuadrilla && cuadrilla.id) {
          actualizarCuadrillaEnLista(cuadrilla);
        }
      };

      const handleCuadrillaCreada = (cuadrilla: CuadrillaItem) => {
        if (cuadrilla && cuadrilla.id) {
          cargarDatos();
        }
      };

      const handleCuadrillaDesactivada = (data: { id: string } | CuadrillaItem) => {
        if (data && data.id) {
          cargarDatos();
        }
      };

      socket.on('cuadrilla:actualizada', handleCuadrillaActualizada);
      socket.on('cuadrilla:creada', handleCuadrillaCreada);
      socket.on('cuadrilla:desactivada', handleCuadrillaDesactivada);

      return () => {
        socket.off('cuadrilla:actualizada', handleCuadrillaActualizada);
        socket.off('cuadrilla:creada', handleCuadrillaCreada);
        socket.off('cuadrilla:desactivada', handleCuadrillaDesactivada);
      };
    } catch {
      // Ignorar fallo de inicialización de socket en entornos de prueba
    }
  }, [actualizarCuadrillaEnLista, cargarDatos]);

  return {
    cuadrillas,
    meta,
    cargando,
    error,
    recargar: cargarDatos,
    actualizarCuadrillaEnLista,
    removerCuadrillaDeLista,
  };
}
