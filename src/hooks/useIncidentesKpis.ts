'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  obtenerKpisIncidentes,
  obtenerDelegaciones,
  DEFAULT_ENCARGADO_ID,
} from '@/services/incidentesService';
import type { IncidentesKpisData, DelegacionOpcion } from '@/types/incidentesKpis';
import { DELEGACIONES_VALDIVIA_DEFAULT } from '@/types/incidentesKpis';
import { getSocket } from '@/lib/socket/client';
import { useSimulatedSession } from '@/context/SimulatedSessionContext';

export interface UseIncidentesKpisOptions {
  initialDelegacionId?: string;
  fecha?: string;
  userId?: string;
  enabled?: boolean;
}

export function useIncidentesKpis(options: UseIncidentesKpisOptions = {}) {
  const { initialDelegacionId = '', fecha, userId: propUserId, enabled = true } = options;

  let sessionUserId: string | undefined;
  try {
    const session = useSimulatedSession();
    sessionUserId = session?.usuarioActivo?.id;
  } catch {
    // Modo fallback si se usa fuera del provider en pruebas unitarias
  }

  const userId = propUserId || sessionUserId || DEFAULT_ENCARGADO_ID;

  const [kpis, setKpis] = useState<IncidentesKpisData | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [esForbidden, setEsForbidden] = useState<boolean>(false);
  const [delegacionId, setDelegacionId] = useState<string>(initialDelegacionId);
  const [delegaciones, setDelegaciones] = useState<DelegacionOpcion[]>(DELEGACIONES_VALDIVIA_DEFAULT);
  const [conectado, setConectado] = useState<boolean>(false);
  const [ultimoRefresco, setUltimoRefresco] = useState<Date | null>(null);

  // Cargar lista de delegaciones desde catálogo municipal
  useEffect(() => {
    let activo = true;
    obtenerDelegaciones().then((lista) => {
      if (activo && lista && lista.length > 0) {
        setDelegaciones(lista);
      }
    });
    return () => {
      activo = false;
    };
  }, []);

  // Función de consulta de KPIs
  const refrescarKpis = useCallback(
    async (mostrarCargando: boolean = false) => {
      if (!enabled) return;

      if (mostrarCargando) {
        setCargando(true);
      }

      try {
        const res = await obtenerKpisIncidentes(
          {
            fecha: fecha || undefined,
            delegacionId: delegacionId.trim() ? delegacionId.trim() : undefined,
          },
          userId
        );

        if (res.codigoError === 403) {
          setEsForbidden(true);
          setError(res.mensaje);
          setCargando(false);
          return;
        }

        if (res.exito && res.datos) {
          setKpis(res.datos);
          setError(null);
          setEsForbidden(false);
          setUltimoRefresco(new Date());
        } else {
          setError(res.mensaje || 'Error al obtener indicadores.');
        }
      } catch {
        setError('Error de comunicación con el servidor municipal.');
      } finally {
        setCargando(false);
      }
    },
    [enabled, fecha, delegacionId, userId]
  );

  // Consulta inicial y ante cambios de delegacionId o fecha
  useEffect(() => {
    const timer = setTimeout(() => {
      refrescarKpis(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [refrescarKpis]);

  // Manejo de conexión reactiva vía WebSockets (Socket.io)
  const refrescarRef = useRef(refrescarKpis);
  useEffect(() => {
    refrescarRef.current = refrescarKpis;
  }, [refrescarKpis]);

  useEffect(() => {
    if (!enabled) return;

    const socket = getSocket();

    const unirseSala = () => {
      setConectado(true);
      // Enfoque defensivo: emitir tanto 'join' como 'unirse' para asegurar compatibilidad
      socket.emit('join', 'sala:encargados');
      socket.emit('unirse', 'sala:encargados');
    };

    const handleConnect = () => {
      unirseSala();
    };

    const handleDisconnect = () => {
      setConectado(false);
    };

    const handleActualizacionIncidente = () => {
      // Invalidación reactiva: refresca contadores silenciosamente
      if (refrescarRef.current) {
        refrescarRef.current(false);
      }
    };

    if (socket.connected) {
      unirseSala();
    } else {
      socket.connect();
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('incidente:creado', handleActualizacionIncidente);
    socket.on('incidente:actualizado', handleActualizacionIncidente);

    return () => {
      socket.emit('leave', 'sala:encargados');
      socket.emit('salir', 'sala:encargados');
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('incidente:creado', handleActualizacionIncidente);
      socket.off('incidente:actualizado', handleActualizacionIncidente);
    };
  }, [enabled]);

  return {
    kpis,
    cargando,
    error,
    esForbidden,
    delegacionId,
    setDelegacionId,
    delegaciones,
    refrescarKpis,
    conectado,
    ultimoRefresco,
  };
}
