'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { patrullasService, DEFAULT_ENCARGADO_ID } from '@/services/patrullasService';
import { getSocket } from '@/lib/socket/client';
import type {
  FiltrosPatrullas,
  PatrullaVerificadoraDTO,
  PaginacionMeta,
  PatrullaActualizadaSocketPayload,
  MisionAsignadaSocketPayload,
  PatrullaCreadaSocketPayload,
  EstadoPatrullaEnum,
} from '@/types/patrullas';

export const FILTROS_PATRULLAS_DEFECTO: FiltrosPatrullas = {
  busqueda: '',
  estado: 'TODOS',
  delegacion: 'TODAS',
  page: 1,
  limit: 20,
};

export const META_PATRULLAS_DEFECTO: PaginacionMeta = {
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
};

export interface UsePatrullasOptions {
  userId?: string;
  enabled?: boolean;
}

export function usePatrullas({
  userId = DEFAULT_ENCARGADO_ID,
  enabled = true,
}: UsePatrullasOptions = {}) {
  const [filtros, setFiltrosState] = useState<FiltrosPatrullas>(FILTROS_PATRULLAS_DEFECTO);
  const [patrullas, setPatrullas] = useState<PatrullaVerificadoraDTO[]>([]);
  const [meta, setMeta] = useState<PaginacionMeta>(META_PATRULLAS_DEFECTO);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [esForbidden, setEsForbidden] = useState<boolean>(false);
  const [conectado, setConectado] = useState<boolean>(false);
  const [ultimoEvento, setUltimoEvento] = useState<string | null>(null);

  const consultar = useCallback(
    async (filtrosActuales: FiltrosPatrullas) => {
      if (!enabled) return;
      setCargando(true);
      setError(null);
      setEsForbidden(false);

      try {
        const res = await patrullasService.listar(filtrosActuales, userId);
        if (res.exito) {
          setPatrullas(res.data);
          setMeta(res.meta);
        } else {
          setError(res.mensaje);
          if (res.esForbidden) {
            setEsForbidden(true);
          }
        }
      } catch {
        setError('Error al consultar el listado de patrullas verificadoras.');
      } finally {
        setCargando(false);
      }
    },
    [userId, enabled]
  );

  // Recarga al cambiar filtros
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

  // Manejo de eventos WebSocket en tiempo real
  const filtrosRef = useRef(filtros);
  filtrosRef.current = filtros;

  useEffect(() => {
    if (!enabled) return;

    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    const unirseSalas = () => {
      setConectado(true);
      socket.emit('join', 'encargado');
      socket.emit('unirse', 'sala:encargados');
      socket.emit('join', 'mapa');
      socket.emit('unirse', 'mapa');
    };

    const onConnect = () => {
      unirseSalas();
    };

    const onDisconnect = () => {
      setConectado(false);
    };

    if (socket.connected) {
      unirseSalas();
    }

    const handlePatrullaActualizada = (payload: PatrullaActualizadaSocketPayload) => {
      if (!payload?.patrullaId) return;

      const nombre = payload.nombre || 'Patrulla';
      const nuevoEstado: EstadoPatrullaEnum = payload.estado;
      setUltimoEvento(`Patrulla ${nombre}: estado actualizado a ${nuevoEstado}`);

      setPatrullas((prev) => {
        const index = prev.findIndex((p) => p.id === payload.patrullaId);
        if (index === -1) {
          return prev;
        }

        const actualizada: PatrullaVerificadoraDTO = {
          ...prev[index],
          estado: nuevoEstado,
          actualizadoEn: payload.actualizadoEn || new Date().toISOString(),
          misionActiva:
            nuevoEstado === 'DISPONIBLE'
              ? null
              : payload.misionActivaId
              ? prev[index].misionActiva || {
                  id: payload.misionActivaId,
                  codigo: `MIS-${payload.misionActivaId.slice(0, 4)}`,
                  titulo: 'Misión operativa en curso',
                  tipoMision: nuevoEstado === 'EN_VERIFICACION' ? 'VERIFICACION' : 'OPERATIVA',
                  estado: 'EN_CURSO',
                  prioridad: 'ALTA',
                  incidenteId: payload.incidenteId,
                }
              : prev[index].misionActiva,
        };

        const nuevaLista = [...prev];
        nuevaLista[index] = actualizada;
        return nuevaLista;
      });
    };

    const handleMisionAsignada = (payload: MisionAsignadaSocketPayload) => {
      if (!payload?.patrullaId) return;

      setUltimoEvento(`Misión ${payload.codigo || ''} asignada a patrulla`);

      setPatrullas((prev) => {
        const index = prev.findIndex((p) => p.id === payload.patrullaId);
        if (index === -1) {
          return prev;
        }

        const nuevoEstado: EstadoPatrullaEnum =
          payload.tipoMision === 'VERIFICACION' ? 'EN_VERIFICACION' : 'EN_MISION';

        const actualizada: PatrullaVerificadoraDTO = {
          ...prev[index],
          estado: nuevoEstado,
          actualizadoEn: payload.asignadoEn || new Date().toISOString(),
          misionActiva: {
            id: payload.misionId,
            codigo: payload.codigo,
            titulo: `Misión ${payload.codigo}`,
            tipoMision: payload.tipoMision,
            estado: 'EN_CURSO',
            prioridad: 'ALTA',
            incidenteId: payload.incidenteId,
          },
        };

        const nuevaLista = [...prev];
        nuevaLista[index] = actualizada;
        return nuevaLista;
      });
    };

    const handlePatrullaCreada = (payload: PatrullaCreadaSocketPayload) => {
      if (!payload?.patrullaId) return;
      const nombre = payload.nombre || payload.codigo || 'Nueva Patrulla';
      setUltimoEvento(`Nueva patrulla incorporada: ${nombre} (${payload.estado || 'DISPONIBLE'})`);
      consultar(filtrosRef.current);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('patrulla:actualizada', handlePatrullaActualizada);
    socket.on('mision:asignada', handleMisionAsignada);
    socket.on('patrulla:creada', handlePatrullaCreada);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('patrulla:actualizada', handlePatrullaActualizada);
      socket.off('mision:asignada', handleMisionAsignada);
      socket.off('patrulla:creada', handlePatrullaCreada);
      socket.emit('leave', 'encargado');
      socket.emit('salir', 'sala:encargados');
      socket.emit('leave', 'mapa');
      socket.emit('salir', 'mapa');
    };
  }, [enabled]);

  const setFiltros = useCallback((nuevosFiltros: Partial<FiltrosPatrullas>) => {
    setFiltrosState((prev) => ({
      ...prev,
      ...nuevosFiltros,
      page: 1, // Reset a página 1 al filtrar
    }));
  }, []);

  const cambiarPagina = useCallback((nuevaPagina: number) => {
    setFiltrosState((prev) => ({ ...prev, page: nuevaPagina }));
  }, []);

  const cambiarLimite = useCallback((nuevoLimite: number) => {
    setFiltrosState((prev) => ({ ...prev, limit: nuevoLimite, page: 1 }));
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltrosState(FILTROS_PATRULLAS_DEFECTO);
  }, []);

  const recargar = useCallback(() => {
    consultar(filtros);
  }, [consultar, filtros]);

  const hayFiltrosActivos = useMemo(() => {
    return Boolean(
      (filtros.busqueda && filtros.busqueda.trim() !== '') ||
        (filtros.estado && filtros.estado !== 'TODOS') ||
        (filtros.delegacion && filtros.delegacion !== 'TODAS') ||
        filtros.delegacionId
    );
  }, [filtros]);

  const dotacionResumen = useMemo(() => {
    const total = patrullas.length;
    const disponibles = patrullas.filter((p) => p.estado === 'DISPONIBLE').length;
    const enMision = patrullas.filter(
      (p) =>
        p.estado === 'EN_VERIFICACION' ||
        p.estado === 'EN_MISION' ||
        p.estado === 'EN_PREVENCION' ||
        p.estado === 'EN_RECUPERACION'
    ).length;
    const noDisponibles = patrullas.filter((p) => p.estado === 'NO_DISPONIBLE').length;

    return { total, disponibles, enMision, noDisponibles };
  }, [patrullas]);

  return {
    patrullas,
    meta,
    cargando,
    error,
    esForbidden,
    conectado,
    ultimoEvento,
    filtros,
    setFiltros,
    cambiarPagina,
    cambiarLimite,
    limpiarFiltros,
    recargar,
    hayFiltrosActivos,
    dotacionResumen,
  };
}
