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
  errorStatus: number | null;
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
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  // Referencia vigente de filtros para evitar re-consultas con estado obsoleto (H80)
  const filtrosRef = useRef(filtros);
  useEffect(() => {
    filtrosRef.current = filtros;
  }, [filtros]);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      setErrorStatus(null);
      const resultado = await cuadrillasService.obtenerCuadrillas(filtrosRef.current);
      setCuadrillas(resultado.cuadrillas);
      setMeta(resultado.meta);
    } catch (err: unknown) {
      const status =
        typeof (err as { status?: unknown })?.status === 'number'
          ? (err as { status: number }).status
          : null;
      setErrorStatus(status);
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

  const actualizarCuadrillaEnLista = useCallback(
    (cuadrillaActualizada: Partial<CuadrillaItem> & { id: string }) => {
      setCuadrillas((prev) => {
        const index = prev.findIndex((c) => c.id === cuadrillaActualizada.id);
        if (index === -1) {
          if (cuadrillaActualizada.delegacion && cuadrillaActualizada.delegado) {
            return [cuadrillaActualizada as CuadrillaItem, ...prev];
          }
          return prev;
        }
        const copia = [...prev];
        const actual = copia[index];
        const estadoNorm = (cuadrillaActualizada.estado || actual.estado || '').toUpperCase();
        copia[index] = {
          ...actual,
          ...cuadrillaActualizada,
          misionActiva:
            estadoNorm === 'DISPONIBLE'
              ? null
              : cuadrillaActualizada.misionActiva !== undefined
                ? cuadrillaActualizada.misionActiva
                : actual.misionActiva,
        };
        return copia;
      });
    },
    []
  );

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
      if (!socket || typeof socket.on !== 'function') return;

      const unirseSalas = () => {
        socket.emit('join', 'encargado');
        socket.emit('unirse', 'sala:encargados');
        socket.emit('join', 'mapa');
        socket.emit('unirse', 'mapa');
      };

      if (!socket.connected && typeof socket.connect === 'function') {
        socket.connect();
      }
      if (socket.connected) {
        unirseSalas();
      }

      const handleCuadrillaActualizada = (rawPayload: unknown) => {
        const p = rawPayload as Record<string, unknown> | null | undefined;
        const raw = (p?.datos || p?.data || rawPayload) as Record<string, unknown> | null | undefined;
        if (!raw || typeof raw !== 'object') return;

        const id =
          typeof raw.id === 'string'
            ? raw.id
            : typeof raw.cuadrillaId === 'string'
              ? raw.cuadrillaId
              : typeof raw.cuadrilla_id === 'string'
                ? raw.cuadrilla_id
                : '';
        if (!id) return;

        const parcial: Partial<CuadrillaItem> & { id: string } = {
          ...(raw as Partial<CuadrillaItem>),
          id,
        };
        if (typeof raw.estado === 'string') {
          parcial.estado = raw.estado as CuadrillaItem['estado'];
        }

        actualizarCuadrillaEnLista(parcial);

        const estadoNorm = typeof raw.estado === 'string' ? raw.estado.toUpperCase() : '';
        if (filtrosRef.current.estado || estadoNorm === 'DISPONIBLE') {
          void cargarDatos();
        }
      };

      const handleCuadrillaCreada = (cuadrilla: CuadrillaItem) => {
        if (cuadrilla && cuadrilla.id) {
          void cargarDatos();
        }
      };

      const handleCuadrillaDesactivada = (data: { id: string } | CuadrillaItem) => {
        if (data && data.id) {
          void cargarDatos();
        }
      };

      socket.on('connect', unirseSalas);
      socket.on('cuadrilla:actualizada', handleCuadrillaActualizada);
      socket.on('cuadrilla:creada', handleCuadrillaCreada);
      socket.on('cuadrilla:desactivada', handleCuadrillaDesactivada);

      return () => {
        socket.off('connect', unirseSalas);
        socket.off('cuadrilla:actualizada', handleCuadrillaActualizada);
        socket.off('cuadrilla:creada', handleCuadrillaCreada);
        socket.off('cuadrilla:desactivada', handleCuadrillaDesactivada);
        socket.emit('leave', 'encargado');
        socket.emit('salir', 'sala:encargados');
        socket.emit('leave', 'mapa');
        socket.emit('salir', 'mapa');
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
    errorStatus,
    recargar: cargarDatos,
    actualizarCuadrillaEnLista,
    removerCuadrillaDeLista,
  };
}
