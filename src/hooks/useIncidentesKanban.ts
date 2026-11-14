'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  listarIncidentes,
  DEFAULT_ENCARGADO_ID,
  type IncidenteResumen,
  type EstadoIncidente,
  type PrioridadIncidente,
  type PaginacionMeta,
  type ListarIncidentesQuery,
  type EstadoTrazabilidadNotificacion,
} from '@/services/incidentesService';
import { obtenerDetalleMision } from '@/services/misionesService';
import {
  useEncargadoKanbanSocket,
  type IncidenteCreadoPayload,
  type IncidenteActualizadoPayload,
  type NotificacionTrazabilidadPayload,
} from './useEncargadoKanbanSocket';
import {
  getIncidentePorMision,
  getSnapshotTrazabilidadIncidentes,
  subscribeTrazabilidad,
  vincularMisionIncidente,
} from '@/lib/socket/trazabilidadStore';

export const ESTADOS_KANBAN: EstadoIncidente[] = [
  'REPORTADO',
  'VERIFICANDO',
  'EN_ATENCION',
  'RESUELTO',
  'NO_ABORDABLE',
];

import { catalogosService } from '@/services/catalogosService';
import { useSimulatedSession } from '@/context/SimulatedSessionContext';

export interface FiltrosKanban {
  busqueda: string;
  delegacion: string; // Nombre: 'TODAS', 'Norte', 'Sur', 'Costa', 'Calle Calle'
  estado: string; // 'TODOS' o EstadoIncidente
  prioridad: PrioridadIncidente | '';
  tipoAfectacion: string;
  fuenteOrigen: string; // '', 'CHATBOT', 'LLAMADA_TELEFONICA', 'FUNCIONARIO_TERRENO', 'WEB'
  delegacionId?: string;
  soloHoy?: boolean;
}

/**
 * Ordena incidentes para una columna del Kanban.
 * En la columna 'VERIFICANDO', los incidentes ya verificados por patrulla
 * aparecen siempre primero en la parte superior.
 */
function ordenarIncidentesColumna(
  incidentes: IncidenteResumen[],
  estado: EstadoIncidente
): IncidenteResumen[] {
  if (estado === 'VERIFICANDO') {
    return [...incidentes].sort((a, b) => {
      const aVerif = a.verificado ? 1 : 0;
      const bVerif = b.verificado ? 1 : 0;
      if (aVerif !== bVerif) {
        return bVerif - aVerif; // Verificados (1) primero
      }
      return new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime();
    });
  }
  return incidentes;
}

export function useIncidentesKanban(initialUserId?: string) {
  let sessionUserId: string | undefined;
  let sessionSetUser: ((id: string) => void) | undefined;
  try {
    const session = useSimulatedSession();
    sessionUserId = session.usuarioActivo.id;
    sessionSetUser = session.cambiarUsuarioPorId;
  } catch {
    // Modo fallback en pruebas unitarias fuera del provider
  }

  const [localUserId, setLocalUserId] = useState<string>(
    initialUserId || sessionUserId || DEFAULT_ENCARGADO_ID
  );

  const userId = sessionUserId || localUserId;
  const setUserId = sessionSetUser || setLocalUserId;
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [esForbidden, setEsForbidden] = useState<boolean>(false);

  const [columnas, setColumnas] = useState<Record<EstadoIncidente, IncidenteResumen[]>>({
    REPORTADO: [],
    VERIFICANDO: [],
    EN_ATENCION: [],
    RESUELTO: [],
    NO_ABORDABLE: [],
  });

  const [paginacionColumna, setPaginacionColumna] = useState<
    Record<EstadoIncidente, PaginacionMeta | null>
  >({
    REPORTADO: null,
    VERIFICANDO: null,
    EN_ATENCION: null,
    RESUELTO: null,
    NO_ABORDABLE: null,
  });

  const [cargandoColumna, setCargandoColumna] = useState<Record<EstadoIncidente, boolean>>({
    REPORTADO: false,
    VERIFICANDO: false,
    EN_ATENCION: false,
    RESUELTO: false,
    NO_ABORDABLE: false,
  });

  const [filtros, setFiltros] = useState<FiltrosKanban>({
    busqueda: '',
    delegacion: 'TODAS',
    estado: 'TODOS',
    prioridad: '',
    tipoAfectacion: '',
    fuenteOrigen: '',
  });

  const [incidenteSeleccionadoId, setIncidenteSeleccionadoId] = useState<string | null>(null);
  const [trazabilidadPorIncidente, setTrazabilidadPorIncidente] = useState<
    Record<string, EstadoTrazabilidadNotificacion>
  >({});

  useEffect(() => {
    let activo = true;
    queueMicrotask(() => {
      if (activo) {
        setTrazabilidadPorIncidente(getSnapshotTrazabilidadIncidentes());
      }
    });
    const unsubscribe = subscribeTrazabilidad(() => {
      if (activo) {
        setTrazabilidadPorIncidente(getSnapshotTrazabilidadIncidentes());
      }
    });
    return () => {
      activo = false;
      unsubscribe();
    };
  }, []);

  // Columnas visibles según el filtro de Estado (permite ocultar columnas)
  const estadosVisibles: EstadoIncidente[] = useMemo(() => {
    if (filtros.estado && filtros.estado !== 'TODOS') {
      const match = ESTADOS_KANBAN.find((e) => e === filtros.estado);
      if (match) return [match];
    }
    return ESTADOS_KANBAN;
  }, [filtros.estado]);

  // Carga inicial o recarga completa por columnas
  const ejecutarConsulta = useCallback(
    async (mostrarCargando: boolean = false) => {
      if (mostrarCargando) {
        setCargando(true);
        setError(null);
        setEsForbidden(false);
      }

      try {
        const delegacionIdResuelta =
          filtros.delegacionId?.trim() ||
          catalogosService.resolverDelegacionId(filtros.delegacion) ||
          undefined;

        const columnasAConsultar = filtros.estado && filtros.estado !== 'TODOS'
          ? [filtros.estado as EstadoIncidente]
          : ESTADOS_KANBAN;

        const promesas = columnasAConsultar.map((estado) =>
          listarIncidentes(
            {
              page: 1,
              limit: 20,
              estado,
              delegacionId: delegacionIdResuelta,
              fuenteOrigen: (filtros.fuenteOrigen as ListarIncidentesQuery['fuenteOrigen']) || undefined,
              prioridad: filtros.prioridad || undefined,
              tipoAfectacion: filtros.tipoAfectacion || undefined,
              busqueda: filtros.busqueda.trim() || undefined,
              soloHoy: filtros.soloHoy ? true : undefined,
            },
            userId
          )
        );

        const resultados = await Promise.all(promesas);

        // Verificar si hubo 403 en alguna petición
        const prohibido = resultados.find((r) => r.codigoError === 403);
        if (prohibido) {
          setEsForbidden(true);
          setError(prohibido.mensaje);
          setCargando(false);
          return;
        }

        const nuevasColumnas: Record<EstadoIncidente, IncidenteResumen[]> = {
          REPORTADO: [],
          VERIFICANDO: [],
          EN_ATENCION: [],
          RESUELTO: [],
          NO_ABORDABLE: [],
        };

        const nuevasPaginaciones: Record<EstadoIncidente, PaginacionMeta | null> = {
          REPORTADO: null,
          VERIFICANDO: null,
          EN_ATENCION: null,
          RESUELTO: null,
          NO_ABORDABLE: null,
        };

        columnasAConsultar.forEach((estado, idx) => {
          const res = resultados[idx];
          if (res.exito) {
            nuevasColumnas[estado] = ordenarIncidentesColumna(res.incidentes, estado);
            nuevasPaginaciones[estado] = res.paginacion || null;
          }
        });

        setColumnas(nuevasColumnas);
        setPaginacionColumna(nuevasPaginaciones);
      } catch {
        setError('Error al conectar con el servidor.');
      } finally {
        setCargando(false);
      }
    },
    [filtros, userId]
  );

  const cargarTablero = useCallback(() => {
    return ejecutarConsulta(true);
  }, [ejecutarConsulta]);

  useEffect(() => {
    const timer = setTimeout(() => {
      ejecutarConsulta(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [ejecutarConsulta]);

  // Cargar más registros en una columna específica (Paginación histórica)
  const cargarMas = useCallback(
    async (estado: EstadoIncidente) => {
      const meta = paginacionColumna[estado];
      if (!meta || !meta.tieneSiguiente || cargandoColumna[estado]) return;

      setCargandoColumna((prev) => ({ ...prev, [estado]: true }));

      try {
        const delegacionIdResuelta =
          filtros.delegacionId?.trim() ||
          catalogosService.resolverDelegacionId(filtros.delegacion) ||
          undefined;

        const res = await listarIncidentes(
          {
            page: meta.pagina + 1,
            limit: meta.limite,
            estado,
            delegacionId: delegacionIdResuelta,
            fuenteOrigen: (filtros.fuenteOrigen as ListarIncidentesQuery['fuenteOrigen']) || undefined,
            prioridad: filtros.prioridad || undefined,
            tipoAfectacion: filtros.tipoAfectacion || undefined,
            busqueda: filtros.busqueda.trim() || undefined,
            soloHoy: filtros.soloHoy ? true : undefined,
          },
          userId
        );

        if (res.exito) {
          setColumnas((prev) => ({
            ...prev,
            [estado]: ordenarIncidentesColumna([...prev[estado], ...res.incidentes], estado),
          }));
          setPaginacionColumna((prev) => ({
            ...prev,
            [estado]: res.paginacion || null,
          }));
        }
      } finally {
        setCargandoColumna((prev) => ({ ...prev, [estado]: false }));
      }
    },
    [cargandoColumna, filtros, paginacionColumna, userId]
  );

  const limpiarFiltros = useCallback(() => {
    setFiltros({
      busqueda: '',
      delegacion: 'TODAS',
      estado: 'TODOS',
      prioridad: '',
      tipoAfectacion: '',
      fuenteOrigen: '',
      delegacionId: undefined,
      soloHoy: false,
    });
  }, []);

  // Manejo de eventos de Socket en tiempo real
  const handleIncidenteCreado = useCallback(
    (payload: IncidenteCreadoPayload) => {
      const { datos } = payload;
      if (!datos || !datos.id) return;

      // Resumen sintético para añadir a la columna REPORTADO
      const nuevoResumen: IncidenteResumen = {
        id: datos.id,
        codigo: datos.codigo,
        codigoSeguimiento: datos.codigo.replace('INC-', ''),
        tipoAfectacion: datos.tipoAfectacion,
        descripcion: null,
        direccion: datos.direccion,
        latitud: datos.latitud,
        longitud: datos.longitud,
        estado: 'REPORTADO',
        prioridad: datos.prioridad,
        requiereAsistenciaSocial: false,
        fuenteOrigen: 'CHATBOT',
        informanteNombre: null,
        delegacionNombre: null,
        totalMisiones: 0,
        verificado: false,
        creadoEn: datos.creadoEn,
        actualizadoEn: datos.creadoEn,
      };

      setColumnas((prev) => {
        // Evitar duplicados si ya existe
        const yaExiste = prev.REPORTADO.some((i) => i.id === nuevoResumen.id);
        if (yaExiste) return prev;
        return {
          ...prev,
          REPORTADO: [nuevoResumen, ...prev.REPORTADO],
        };
      });

      setPaginacionColumna((prev) => {
        const metaActual = prev.REPORTADO;
        if (!metaActual) return prev;
        return {
          ...prev,
          REPORTADO: {
            ...metaActual,
            total: metaActual.total + 1,
          },
        };
      });
    },
    []
  );

  const handleIncidenteActualizado = useCallback(
    (payload: IncidenteActualizadoPayload) => {
      const { datos } = payload;
      if (!datos || !datos.id) return;

      let columnaOrigenDetectada: EstadoIncidente | null = null;

      setColumnas((prev) => {
        let incidenteEncontrado: IncidenteResumen | null = null;
        let columnaOrigen: EstadoIncidente | null = null;

        // Localizar el incidente en alguna de las columnas
        for (const est of ESTADOS_KANBAN) {
          const idx = prev[est].findIndex((i) => i.id === datos.id);
          if (idx !== -1) {
            columnaOrigen = est;
            columnaOrigenDetectada = est;
            incidenteEncontrado = {
              ...prev[est][idx],
              estado: datos.nuevoEstado,
              prioridad: datos.prioridad || prev[est][idx].prioridad,
              totalMisiones:
                datos.nuevoEstado === 'VERIFICANDO' && est === 'REPORTADO'
                  ? Math.max(1, (prev[est][idx].totalMisiones || 0) + 1)
                  : prev[est][idx].totalMisiones,
              actualizadoEn: datos.actualizadoEn || new Date().toISOString(),
            };
            break;
          }
        }

        if (!incidenteEncontrado) {
          return prev;
        }

        // Si el estado no cambió de columna, solo actualizarlo in situ
        if (columnaOrigen === datos.nuevoEstado) {
          return {
            ...prev,
            [columnaOrigen]: prev[columnaOrigen].map((i) =>
              i.id === datos.id ? incidenteEncontrado! : i
            ),
          };
        }

        // Remover de la columna origen y agregar al inicio de la nueva columna
        return {
          ...prev,
          [columnaOrigen!]: prev[columnaOrigen!].filter((i) => i.id !== datos.id),
          [datos.nuevoEstado]: ordenarIncidentesColumna([incidenteEncontrado, ...prev[datos.nuevoEstado]], datos.nuevoEstado),
        };
      });

      // Actualizar dinámicamente paginacionColumna si cambió de columna
      if (columnaOrigenDetectada && columnaOrigenDetectada !== datos.nuevoEstado) {
        setPaginacionColumna((prev) => {
          const metaOrigen = prev[columnaOrigenDetectada!];
          const metaDestino = prev[datos.nuevoEstado];
          return {
            ...prev,
            [columnaOrigenDetectada!]: metaOrigen
              ? { ...metaOrigen, total: Math.max(0, metaOrigen.total - 1) }
              : null,
            [datos.nuevoEstado]: metaDestino
              ? { ...metaDestino, total: metaDestino.total + 1 }
              : null,
          };
        });
      }
    },
    []
  );

  // Función para mover un incidente de columna de forma inmediata e imperativa
  const moverIncidenteAEstado = useCallback(
    (incidenteId: string, nuevoEstado: EstadoIncidente, prioridad?: PrioridadIncidente) => {
      let columnaOrigenDetectada: EstadoIncidente | null = null;

      setColumnas((prev) => {
        let incidenteEncontrado: IncidenteResumen | null = null;
        let columnaOrigen: EstadoIncidente | null = null;

        for (const est of ESTADOS_KANBAN) {
          const idx = prev[est].findIndex((i) => i.id === incidenteId);
          if (idx !== -1) {
            columnaOrigen = est;
            columnaOrigenDetectada = est;
            incidenteEncontrado = {
              ...prev[est][idx],
              estado: nuevoEstado,
              prioridad: prioridad || prev[est][idx].prioridad,
              totalMisiones:
                nuevoEstado === 'VERIFICANDO' && est === 'REPORTADO'
                  ? Math.max(1, (prev[est][idx].totalMisiones || 0) + 1)
                  : prev[est][idx].totalMisiones,
              actualizadoEn: new Date().toISOString(),
            };
            break;
          }
        }

        if (!incidenteEncontrado) return prev;

        if (columnaOrigen === nuevoEstado) {
          return {
            ...prev,
            [columnaOrigen]: prev[columnaOrigen].map((i) =>
              i.id === incidenteId ? incidenteEncontrado! : i
            ),
          };
        }

        return {
          ...prev,
          [columnaOrigen!]: prev[columnaOrigen!].filter((i) => i.id !== incidenteId),
          [nuevoEstado]: [incidenteEncontrado, ...prev[nuevoEstado]],
        };
      });

      // Actualizar contadores locales de paginación dinámicamente según origen y destino
      setPaginacionColumna((prev) => {
        const origen = columnaOrigenDetectada || ('REPORTADO' as EstadoIncidente);
        if (origen === nuevoEstado) return prev;

        const metaOrigen = prev[origen];
        const metaDestino = prev[nuevoEstado];

        return {
          ...prev,
          [origen]: metaOrigen
            ? { ...metaOrigen, total: Math.max(0, metaOrigen.total - 1) }
            : null,
          [nuevoEstado]: metaDestino
            ? { ...metaDestino, total: metaDestino.total + 1 }
            : null,
        };
      });
    },
    []
  );

  const handleTrazabilidadActualizada = useCallback(
    (payload: NotificacionTrazabilidadPayload) => {
      if (!payload?.misionId || getIncidentePorMision(payload.misionId)) {
        return;
      }
      void obtenerDetalleMision(payload.misionId, userId)
        .then((res) => {
          const incId = res.exito ? res.datos?.incidente?.id : undefined;
          if (incId) {
            vincularMisionIncidente(payload.misionId, incId);
          }
        })
        .catch(() => {
          // Ignorar fallo auxiliar de resolución de vínculo misión-incidente
        });
    },
    [userId]
  );

  const { conectado, ultimoEvento } = useEncargadoKanbanSocket({
    onIncidenteCreado: handleIncidenteCreado,
    onIncidenteActualizado: handleIncidenteActualizado,
    onNotificacionTrazabilidadActualizada: handleTrazabilidadActualizada,
    enabled: !esForbidden,
  });

  // Métricas y totales
  const totalIncidentesVisibles = useMemo(() => {
    return Object.values(columnas).reduce((acc, col) => acc + col.length, 0);
  }, [columnas]);

  return {
    userId,
    setUserId,
    columnas,
    paginacionColumna,
    cargando,
    cargandoColumna,
    error,
    esForbidden,
    filtros,
    setFiltros,
    estadosVisibles,
    limpiarFiltros,
    cargarMas,
    recargar: cargarTablero,
    moverIncidenteAEstado,
    conectado,
    ultimoEvento,
    totalIncidentesVisibles,
    incidenteSeleccionadoId,
    setIncidenteSeleccionadoId,
    trazabilidadPorIncidente,
  };
}
