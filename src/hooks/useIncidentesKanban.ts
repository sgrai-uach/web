'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  listarIncidentes,
  DEFAULT_ENCARGADO_ID,
  type IncidenteResumen,
  type EstadoIncidente,
  type PrioridadIncidente,
  type PaginacionMeta,
} from '@/services/incidentesService';
import {
  useEncargadoKanbanSocket,
  type IncidenteCreadoPayload,
  type IncidenteActualizadoPayload,
} from './useEncargadoKanbanSocket';

export const ESTADOS_KANBAN: EstadoIncidente[] = [
  'REPORTADO',
  'VERIFICANDO',
  'EN_ATENCION',
  'RESUELTO',
  'NO_ABORDABLE',
];

export interface FiltrosKanban {
  busqueda: string;
  prioridad: PrioridadIncidente | '';
  tipoAfectacion: string;
}

export function useIncidentesKanban(initialUserId: string = DEFAULT_ENCARGADO_ID) {
  const [userId, setUserId] = useState<string>(initialUserId);
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
    prioridad: '',
    tipoAfectacion: '',
  });

  const [incidenteSeleccionadoId, setIncidenteSeleccionadoId] = useState<string | null>(null);

  // Carga inicial o recarga completa por columnas
  const ejecutarConsulta = useCallback(
    async (mostrarCargando: boolean = false) => {
      if (mostrarCargando) {
        setCargando(true);
        setError(null);
        setEsForbidden(false);
      }

      try {
        const promesas = ESTADOS_KANBAN.map((estado) =>
          listarIncidentes(
            {
              page: 1,
              limit: 20,
              estado,
              prioridad: filtros.prioridad || undefined,
              tipoAfectacion: filtros.tipoAfectacion || undefined,
              busqueda: filtros.busqueda.trim() || undefined,
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

        ESTADOS_KANBAN.forEach((estado, idx) => {
          const res = resultados[idx];
          if (res.exito) {
            nuevasColumnas[estado] = res.incidentes;
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
        const res = await listarIncidentes(
          {
            page: meta.pagina + 1,
            limit: meta.limite,
            estado,
            prioridad: filtros.prioridad || undefined,
            tipoAfectacion: filtros.tipoAfectacion || undefined,
            busqueda: filtros.busqueda.trim() || undefined,
          },
          userId
        );

        if (res.exito) {
          setColumnas((prev) => ({
            ...prev,
            [estado]: [...prev[estado], ...res.incidentes],
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

      setColumnas((prev) => {
        let incidenteEncontrado: IncidenteResumen | null = null;
        let columnaOrigen: EstadoIncidente | null = null;

        // Localizar el incidente en alguna de las columnas
        for (const est of ESTADOS_KANBAN) {
          const idx = prev[est].findIndex((i) => i.id === datos.id);
          if (idx !== -1) {
            incidenteEncontrado = {
              ...prev[est][idx],
              estado: datos.nuevoEstado,
              prioridad: datos.prioridad || prev[est][idx].prioridad,
              actualizadoEn: datos.actualizadoEn || new Date().toISOString(),
            };
            columnaOrigen = est;
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
          [datos.nuevoEstado]: [incidenteEncontrado, ...prev[datos.nuevoEstado]],
        };
      });
    },
    []
  );

  const { conectado, ultimoEvento } = useEncargadoKanbanSocket({
    onIncidenteCreado: handleIncidenteCreado,
    onIncidenteActualizado: handleIncidenteActualizado,
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
    cargarMas,
    recargar: cargarTablero,
    conectado,
    ultimoEvento,
    totalIncidentesVisibles,
    incidenteSeleccionadoId,
    setIncidenteSeleccionadoId,
  };
}
