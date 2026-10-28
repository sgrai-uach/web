'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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

  const filtrosRef = useRef(filtros);
  useEffect(() => {
    filtrosRef.current = filtros;
  }, [filtros]);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const resultado = await cuadrillasService.obtenerCuadrillas(filtrosRef.current);
      setCuadrillas(resultado.cuadrillas);
      setMeta(resultado.meta);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar las cuadrillas operativas.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      cargarDatos();
    }, 0);
    return () => clearTimeout(timer);
  }, [cargarDatos, filtros.pagina, filtros.limite, filtros.busqueda, filtros.delegacionId, filtros.estado]);

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

  // Suscripción WebSocket para reflejar cuadrillas creadas o actualizadas en vivo
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

      socket.on('cuadrilla:actualizada', handleCuadrillaActualizada);
      socket.on('cuadrilla:creada', handleCuadrillaCreada);

      return () => {
        socket.off('cuadrilla:actualizada', handleCuadrillaActualizada);
        socket.off('cuadrilla:creada', handleCuadrillaCreada);
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
  };
}
