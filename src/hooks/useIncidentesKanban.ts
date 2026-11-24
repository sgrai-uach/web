'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  type MisionRechazadaPayload,
  type MisionActualizadaPayload,
  type CuadrillaActualizadaPayload,
  type RecursoActualizadoPayload,
  type NotificacionTrazabilidadPayload,
} from './useEncargadoKanbanSocket';
import {
  getIncidentePorMision,
  getSnapshotTrazabilidadIncidentes,
  subscribeTrazabilidad,
  vincularMisionIncidente,
} from '@/lib/socket/trazabilidadStore';
import { obtenerConfigHito } from '@/lib/utils/misionHitos';
import { useOptionalToast } from '@/components/ui/Toast';
import type {
  MisionApoyoSolicitadoPayload,
  MisionHitoRegistradoPayload,
} from '@/types/misiones';

export const ESTADOS_KANBAN: EstadoIncidente[] = [
  'REPORTADO',
  'VERIFICANDO',
  'EN_ATENCION',
  'RESUELTO',
  'NO_ABORDABLE',
];

import { catalogosService } from '@/services/catalogosService';
import { useSimulatedSession } from '@/context/SimulatedSessionContext';
import { esReporteCierreCuadrilla, fueTipologiaModificada } from '@/lib/utils/estadoUtils';

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

export interface UseIncidentesKanbanOptions {
  initialUserId?: string;
  onMisionRechazada?: (payload: MisionRechazadaPayload) => void;
  onMisionAceptada?: (payload: MisionActualizadaPayload) => void;
  onMisionActualizada?: (payload: MisionActualizadaPayload) => void;
  onMisionApoyoSolicitado?: (payload: MisionApoyoSolicitadoPayload) => void;
  onCuadrillaActualizada?: (payload: CuadrillaActualizadaPayload) => void;
  onRecursoActualizado?: (payload: RecursoActualizadoPayload) => void;
  onReporteTerrenoRecibido?: (payload: IncidenteActualizadoPayload) => void;
  onIncidenteCreadoSocket?: (payload: IncidenteCreadoPayload) => void;
  onIncidenteActualizadoSocket?: (payload: IncidenteActualizadoPayload) => void;
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
  if (estado === 'EN_ATENCION') {
    return [...incidentes].sort((a, b) => {
      const aApoyo = a.apoyoSolicitado ? 1 : 0;
      const bApoyo = b.apoyoSolicitado ? 1 : 0;
      if (aApoyo !== bApoyo) {
        return bApoyo - aApoyo; // Solicitud de apoyo urgente primero (H44)
      }
      const aFin = a.faenasCuadrillaCompletadas ? 1 : 0;
      const bFin = b.faenasCuadrillaCompletadas ? 1 : 0;
      if (aFin !== bFin) {
        return bFin - aFin; // Faenas finalizadas (1) primero
      }
      return new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime();
    });
  }
  return incidentes;
}

export function useIncidentesKanban(options?: UseIncidentesKanbanOptions | string) {
  const toast = useOptionalToast();
  const optionsObj: UseIncidentesKanbanOptions = useMemo(
    () => (typeof options === 'string' ? { initialUserId: options } : options || {}),
    [options]
  );
  const initialUserId = optionsObj.initialUserId;

  const onMisionRechazadaRef = useRef(optionsObj.onMisionRechazada);
  useEffect(() => {
    onMisionRechazadaRef.current = optionsObj.onMisionRechazada;
  }, [optionsObj.onMisionRechazada]);

  const onMisionAceptadaRef = useRef(optionsObj.onMisionAceptada);
  useEffect(() => {
    onMisionAceptadaRef.current = optionsObj.onMisionAceptada;
  }, [optionsObj.onMisionAceptada]);

  const toastAceptacionRef = useRef<Map<string, number>>(new Map());

  const onCuadrillaActualizadaRef = useRef(optionsObj.onCuadrillaActualizada);
  useEffect(() => {
    onCuadrillaActualizadaRef.current = optionsObj.onCuadrillaActualizada;
  }, [optionsObj.onCuadrillaActualizada]);

  const onMisionActualizadaRef = useRef(optionsObj.onMisionActualizada);
  useEffect(() => {
    onMisionActualizadaRef.current = optionsObj.onMisionActualizada;
  }, [optionsObj.onMisionActualizada]);

  const onMisionApoyoSolicitadoRef = useRef(optionsObj.onMisionApoyoSolicitado);
  useEffect(() => {
    onMisionApoyoSolicitadoRef.current = optionsObj.onMisionApoyoSolicitado;
  }, [optionsObj.onMisionApoyoSolicitado]);

  const onRecursoActualizadoRef = useRef(optionsObj.onRecursoActualizado);
  useEffect(() => {
    onRecursoActualizadoRef.current = optionsObj.onRecursoActualizado;
  }, [optionsObj.onRecursoActualizado]);
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

  const columnasRef = useRef(columnas);
  useEffect(() => {
    columnasRef.current = columnas;
  }, [columnas]);

  const reportesContadosRef = useRef<Set<string>>(new Set());

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

        // Verificar si hubo errores de servidor/red (evitar mostrar tablero vacío silenciosamente)
        const fallidos = resultados.filter((r) => !r.exito);
        if (fallidos.length > 0) {
          setError(
            fallidos[0].mensaje ||
              'Error al cargar los incidentes del tablero. Intente nuevamente.'
          );
          if (fallidos.length === resultados.length) {
            return;
          }
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
            nuevasColumnas[estado] = res.incidentes;
            nuevasPaginaciones[estado] = res.paginacion || null;
          }
        });

        // Sanitización defensiva: Si un incidente posee una misión EN_CURSO (aceptada en terreno),
        // debe ubicarse inequívocamente en la columna VERIFICANDO (En Verificación)
        if (nuevasColumnas.REPORTADO && nuevasColumnas.REPORTADO.length > 0) {
          const aMoverAVerificando: IncidenteResumen[] = [];
          nuevasColumnas.REPORTADO = nuevasColumnas.REPORTADO.filter((inc) => {
            if (
              inc.tieneMisionEnCurso &&
              inc.estado !== 'NO_ABORDABLE' &&
              inc.estado !== 'RESUELTO'
            ) {
              aMoverAVerificando.push({ ...inc, estado: 'VERIFICANDO' });
              return false;
            }
            return true;
          });
          if (aMoverAVerificando.length > 0) {
            nuevasColumnas.VERIFICANDO = [...aMoverAVerificando, ...nuevasColumnas.VERIFICANDO];
          }
        }

        // Preservar la marca local de misión despachada mientras el backend la propaga
        setColumnas((prev) => {
          const preservadas: Record<EstadoIncidente, IncidenteResumen[]> = { ...nuevasColumnas };
          columnasAConsultar.forEach((estado) => {
            preservadas[estado] = ordenarIncidentesColumna(
              nuevasColumnas[estado].map((inc) => {
                const previo = prev[estado]?.find((p) => p.id === inc.id);
                return previo?.tieneMisionDespachada
                  ? { ...inc, tieneMisionDespachada: true }
                  : inc;
              }),
              estado
            );
          });
          return preservadas;
        });
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

      optionsObj.onIncidenteCreadoSocket?.(payload);
    },
    [optionsObj]
  );

  const handleIncidenteActualizado = useCallback(
    (payload: IncidenteActualizadoPayload) => {
      const { datos } = payload;
      if (!datos || !datos.id) return;

      const reporteIdClave = datos.reporteTerreno?.id
        ? `${datos.id}:${datos.reporteTerreno.id}`
        : null;
      const yaContado = reporteIdClave
        ? reportesContadosRef.current.has(reporteIdClave)
        : false;
      if (reporteIdClave) {
        reportesContadosRef.current.add(reporteIdClave);
      }

      let columnaOrigenDetectada: EstadoIncidente | null = null;
      let tipoAnteriorDetectado: string | undefined;

      for (const est of ESTADOS_KANBAN) {
        const incExistente = columnasRef.current[est].find((i) => i.id === datos.id);
        if (incExistente) {
          columnaOrigenDetectada = est;
          tipoAnteriorDetectado = incExistente.tipoAfectacion;
          break;
        }
      }

      setColumnas((prev) => {
        let incidenteEncontrado: IncidenteResumen | null = null;
        let columnaOrigen: EstadoIncidente | null = null;

        // Localizar el incidente en alguna de las columnas
        for (const est of ESTADOS_KANBAN) {
          const idx = prev[est].findIndex((i) => i.id === datos.id);
          if (idx !== -1) {
            columnaOrigen = est;
            columnaOrigenDetectada = est;
            const incActual = prev[est][idx];
            tipoAnteriorDetectado = incActual.tipoAfectacion;
            const nuevaPrioridad = datos.prioridad || incActual.prioridad;
            const nuevaPrioridadSugerida =
              datos.prioridadSugerida !== undefined
                ? datos.prioridadSugerida
                : incActual.prioridadSugerida;
            const nuevaJustificacionPrioridad =
              datos.justificacionPrioridad !== undefined
                ? datos.justificacionPrioridad
                : incActual.justificacionPrioridad;
            const nuevoTipo = datos.tipoAfectacion || incActual.tipoAfectacion;
            const huboCambioPrioridad = Boolean(
              (datos.prioridad && datos.prioridad !== incActual.prioridad) ||
              (nuevaPrioridadSugerida && nuevaPrioridad !== nuevaPrioridadSugerida)
            );
            const huboCambioTipologia = fueTipologiaModificada(
              incActual.tipoAfectacion,
              datos.tipoAfectacion
            );
            const reclasificado = Boolean(
              huboCambioTipologia ||
              incActual.reclasificadoEnTerreno
            );

            const totalReportesPrevios = Number(incActual.totalReportesTerreno ?? 0);
            const nuevoTotalReportes = datos.reporteTerreno
              ? yaContado
                ? Math.max(
                    Number(datos.reporteTerreno.versionReporte || 1),
                    totalReportesPrevios
                  )
                : Math.max(
                    Number(datos.reporteTerreno.versionReporte || 1),
                    totalReportesPrevios + 1
                  )
              : totalReportesPrevios;

            const esCierreNoAbordable = datos.nuevoEstado === 'NO_ABORDABLE';
            const esCierreCuadrilla = esReporteCierreCuadrilla(datos.reporteTerreno);
            const esDespachoPendienteCuadrilla = datos.cuadrillaAceptada === false;
            // H68: El cierre de cuadrilla nunca cierra automáticamente el incidente a RESUELTO (espera H86)
            const estadoDestinoResuelto: EstadoIncidente =
              esCierreCuadrilla && datos.nuevoEstado === 'RESUELTO'
                ? (incActual.estado === 'EN_ATENCION' ? 'EN_ATENCION' : incActual.estado)
                : datos.nuevoEstado;
            const esInicioNuevaMision =
              !esCierreCuadrilla &&
              !esCierreNoAbordable &&
              !esDespachoPendienteCuadrilla &&
              (Boolean(payload.esSintetico) ||
                (datos.cuadrillaAceptada === true && !incActual.cuadrillaAceptada) ||
                (estadoDestinoResuelto === 'EN_ATENCION' && est !== 'EN_ATENCION') ||
                (estadoDestinoResuelto === 'VERIFICANDO' && est === 'REPORTADO'));
            const dictamenResuelto =
              datos.dictamen ??
              datos.reporteTerreno?.dictamen ??
              incActual.dictamenTerreno ??
              (esCierreNoAbordable ? 'NO_ABORDABLE' : undefined);
            const motivoNoAbordableResuelto =
              datos.motivoNoAbordable !== undefined
                ? datos.motivoNoAbordable
                : datos.reporteTerreno?.motivoNoAbordable !== undefined
                  ? datos.reporteTerreno.motivoNoAbordable
                  : incActual.motivoNoAbordable;
            const fechaCierreResuelta =
              esCierreCuadrilla
                ? incActual.fechaCierre
                : datos.fechaCierre !== undefined
                  ? datos.fechaCierre
                  : incActual.fechaCierre;

            incidenteEncontrado = {
              ...incActual,
              estado: estadoDestinoResuelto,
              prioridad: nuevaPrioridad,
              prioridadSugerida: nuevaPrioridadSugerida,
              justificacionPrioridad: nuevaJustificacionPrioridad,
              totalReportesTerreno: nuevoTotalReportes,
              requiereAsistenciaSocial:
                datos.requiereAsistenciaSocial !== undefined
                  ? datos.requiereAsistenciaSocial
                  : datos.reporteTerreno?.requiereAsistenciaSocial !== undefined
                    ? datos.reporteTerreno.requiereAsistenciaSocial
                    : incActual.requiereAsistenciaSocial,
              tipoAfectacion: nuevoTipo,
              tipoIncidenteId: datos.tipoIncidenteId || incActual.tipoIncidenteId,
              verificado:
                datos.verificado !== undefined
                  ? datos.verificado
                  : payload.esSintetico
                    ? Boolean(incActual.verificado)
                    : true,
              faenasCuadrillaCompletadas: esCierreCuadrilla
                ? true
                : esInicioNuevaMision
                  ? false
                  : incActual.faenasCuadrillaCompletadas,
              estadoTerrenoFinal: esCierreCuadrilla
                ? datos.reporteTerreno?.estadoTerreno ?? incActual.estadoTerrenoFinal
                : incActual.estadoTerrenoFinal,
              horasHombreRegistradas: esCierreCuadrilla
                ? datos.reporteTerreno?.horasHombre ?? incActual.horasHombreRegistradas
                : incActual.horasHombreRegistradas,
              dictamenTerreno: dictamenResuelto,
              motivoNoAbordable: motivoNoAbordableResuelto,
              fechaCierre: fechaCierreResuelta,
              tieneMisionEnCurso:
                esCierreNoAbordable || esCierreCuadrilla || esDespachoPendienteCuadrilla
                  ? false
                  : esInicioNuevaMision
                    ? true
                    : incActual.tieneMisionEnCurso,
              tieneMisionDespachada:
                esCierreNoAbordable || esInicioNuevaMision
                  ? false
                  : esDespachoPendienteCuadrilla
                    ? true
                    : incActual.tieneMisionDespachada,
              cuadrillaAceptada:
                datos.cuadrillaAceptada !== undefined
                  ? datos.cuadrillaAceptada
                  : esCierreCuadrilla ||
                      (esInicioNuevaMision && estadoDestinoResuelto === 'EN_ATENCION')
                    ? true
                    : incActual.cuadrillaAceptada,
              apoyoSolicitado:
                datos.apoyoSolicitado !== undefined
                  ? datos.apoyoSolicitado
                  : datos.reporteTerreno?.requiereApoyoAdicional !== undefined
                    ? Boolean(datos.reporteTerreno.requiereApoyoAdicional) ||
                      Boolean(incActual.apoyoSolicitado)
                    : incActual.apoyoSolicitado,
              detalleApoyoRequerido:
                datos.detalleApoyoRequerido !== undefined
                  ? datos.detalleApoyoRequerido
                  : datos.reporteTerreno?.detalleApoyoRequerido !== undefined
                    ? datos.reporteTerreno.detalleApoyoRequerido
                    : incActual.detalleApoyoRequerido,
              reclasificadoEnTerreno: reclasificado,
              justificacionReclasificacion:
                datos.justificacion || incActual.justificacionReclasificacion,
              cambioPrioridadMotivo: huboCambioPrioridad
                ? nuevaJustificacionPrioridad ||
                  datos.justificacion ||
                  'Ajustada tras verificación presencial en terreno'
                : incActual.cambioPrioridadMotivo,
              totalMisiones:
                estadoDestinoResuelto === 'VERIFICANDO' && est === 'REPORTADO'
                  ? Math.max(1, (incActual.totalMisiones || 0) + 1)
                  : esInicioNuevaMision && estadoDestinoResuelto === 'EN_ATENCION'
                    ? Math.max(1, incActual.totalMisiones || 0)
                    : incActual.totalMisiones,
              actualizadoEn: datos.actualizadoEn || new Date().toISOString(),
            };
            break;
          }
        }

        if (!incidenteEncontrado) {
          return prev;
        }

        const estadoFinalColumna = incidenteEncontrado.estado;

        // Si el estado no cambió de columna, solo actualizarlo in situ y mantener orden de verificación
        if (columnaOrigen === estadoFinalColumna) {
          return {
            ...prev,
            [columnaOrigen]: ordenarIncidentesColumna(
              prev[columnaOrigen].map((i) =>
                i.id === datos.id ? incidenteEncontrado! : i
              ),
              columnaOrigen
            ),
          };
        }

        // Remover de la columna origen y agregar al inicio de la nueva columna
        return {
          ...prev,
          [columnaOrigen!]: prev[columnaOrigen!].filter((i) => i.id !== datos.id),
          [estadoFinalColumna]: ordenarIncidentesColumna([incidenteEncontrado, ...prev[estadoFinalColumna]], estadoFinalColumna),
        };
      });

      // Actualizar dinámicamente paginacionColumna si cambió de columna
      const estadoObjetivo =
        esReporteCierreCuadrilla(datos.reporteTerreno) && datos.nuevoEstado === 'RESUELTO'
          ? 'EN_ATENCION'
          : datos.nuevoEstado;
      if (columnaOrigenDetectada && columnaOrigenDetectada !== estadoObjetivo) {
        setPaginacionColumna((prev) => {
          const metaOrigen = prev[columnaOrigenDetectada!];
          const metaDestino = prev[estadoObjetivo];
          return {
            ...prev,
            [columnaOrigenDetectada!]: metaOrigen
              ? { ...metaOrigen, total: Math.max(0, metaOrigen.total - 1) }
              : null,
            [estadoObjetivo]: metaDestino
              ? { ...metaDestino, total: metaDestino.total + 1 }
              : null,
          };
        });
      }

      const payloadEnriquecido: IncidenteActualizadoPayload =
        datos.tipoAnterior || !tipoAnteriorDetectado
          ? payload
          : {
              ...payload,
              datos: {
                ...datos,
                tipoAnterior: tipoAnteriorDetectado,
              },
            };

      if (datos.reporteTerreno) {
        optionsObj.onReporteTerrenoRecibido?.(payloadEnriquecido);
      } else {
        optionsObj.onIncidenteActualizadoSocket?.(payloadEnriquecido);
      }
    },
    [optionsObj]
  );

  // Función para mover un incidente de columna de forma inmediata e imperativa
  const moverIncidenteAEstado = useCallback(
    (
      incidenteId: string,
      nuevoEstado: EstadoIncidente,
      prioridad?: PrioridadIncidente,
      updatesParciales?: Partial<IncidenteResumen>
    ) => {
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
              tieneMisionDespachada:
                nuevoEstado === 'REPORTADO' ? prev[est][idx].tieneMisionDespachada : false,
              totalMisiones:
                nuevoEstado === 'VERIFICANDO' && est === 'REPORTADO'
                  ? Math.max(1, (prev[est][idx].totalMisiones || 0) + 1)
                  : prev[est][idx].totalMisiones,
              ...updatesParciales,
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
            : {
                total: 1,
                pagina: 1,
                limite: 20,
                totalPaginas: 1,
                tieneSiguiente: false,
                tieneAnterior: false,
              },
        };
      });
    },
    []
  );

  const handleMisionRechazada = useCallback(
    (payload: MisionRechazadaPayload) => {
      if (payload.incidenteId) {
        let columnaOrigenDetectada: EstadoIncidente | null = null;
        let columnaDestinoDetectada: EstadoIncidente = 'REPORTADO';

        setColumnas((prev) => {
          let incidenteEncontrado: IncidenteResumen | null = null;
          let columnaOrigen: EstadoIncidente | null = null;

          for (const est of ESTADOS_KANBAN) {
            const idx = prev[est].findIndex((i) => i.id === payload.incidenteId);
            if (idx !== -1) {
              const actual = prev[est][idx];
              const esRechazoCuadrilla =
                payload.tipoMision === 'ATENCION_CUADRILLA' ||
                Boolean(payload.cuadrillaId || payload.cuadrillaNombre);

              const estadoDestino: EstadoIncidente =
                esRechazoCuadrilla && actual.verificado ? 'VERIFICANDO' : 'REPORTADO';

              columnaDestinoDetectada = estadoDestino;
              incidenteEncontrado = {
                ...actual,
                estado: estadoDestino,
                tieneMisionDespachada: false,
                ...(esRechazoCuadrilla
                  ? { cuadrillaAceptada: false, tieneMisionEnCurso: false }
                  : {}),
                actualizadoEn: payload.rechazadoEn || new Date().toISOString(),
              };
              columnaOrigen = est;
              columnaOrigenDetectada = est;
              break;
            }
          }

          if (!incidenteEncontrado || !columnaOrigen) return prev;

          if (columnaOrigen === columnaDestinoDetectada) {
            return {
              ...prev,
              [columnaDestinoDetectada]: prev[columnaDestinoDetectada].map((i) =>
                i.id === payload.incidenteId ? incidenteEncontrado! : i
              ),
            };
          }

          return {
            ...prev,
            [columnaOrigen]: prev[columnaOrigen].filter((i) => i.id !== payload.incidenteId),
            [columnaDestinoDetectada]: ordenarIncidentesColumna(
              [incidenteEncontrado, ...prev[columnaDestinoDetectada]],
              columnaDestinoDetectada
            ),
          };
        });

        setPaginacionColumna((prev) => {
          if (!columnaOrigenDetectada || columnaOrigenDetectada === columnaDestinoDetectada) {
            return prev;
          }

          return {
            ...prev,
            [columnaDestinoDetectada]: prev[columnaDestinoDetectada]
              ? {
                  ...prev[columnaDestinoDetectada]!,
                  total: prev[columnaDestinoDetectada]!.total + 1,
                }
              : null,
            [columnaOrigenDetectada]: prev[columnaOrigenDetectada]
              ? {
                  ...prev[columnaOrigenDetectada]!,
                  total: Math.max(0, prev[columnaOrigenDetectada]!.total - 1),
                }
              : null,
          };
        });
      }

      onMisionRechazadaRef.current?.(payload);
    },
    []
  );

  const handleCuadrillaActualizada = useCallback(
    (payload: CuadrillaActualizadaPayload) => {
      onCuadrillaActualizadaRef.current?.(payload);
    },
    []
  );

  const notificarToastAceptacionCuadrilla = useCallback(
    (misionId: string, codigo?: string) => {
      const clave = misionId.trim();
      const ahora = Date.now();
      if (clave) {
        const ultimaVez = toastAceptacionRef.current.get(clave);
        if (ultimaVez && ahora - ultimaVez < 5000) {
          return;
        }
        toastAceptacionRef.current.set(clave, ahora);
      }

      const etiquetaMision = codigo?.trim() || misionId;
      toast?.showInfo(
        `La cuadrilla ha aceptado la asignación de la misión ${etiquetaMision}. El equipo se encuentra Ocupado y el incidente pasa a En Atención.`,
        'Asignación Aceptada por Cuadrilla'
      );
    },
    [toast]
  );

  const handleMisionActualizada = useCallback(
    (payload: MisionActualizadaPayload) => {
      if (
        payload.estado?.toUpperCase() === 'COMPLETADA' &&
        payload.tipoMision === 'ATENCION_CUADRILLA' &&
        payload.incidenteId
      ) {
        const repIdClave = payload.reporteTerreno?.id
          ? `${payload.incidenteId}:${payload.reporteTerreno.id}`
          : null;
        const yaContado = repIdClave
          ? reportesContadosRef.current.has(repIdClave)
          : false;
        if (repIdClave) {
          reportesContadosRef.current.add(repIdClave);
        }

        setColumnas((prev) => {
          const idx = prev.EN_ATENCION.findIndex(
            (i) => i.id === payload.incidenteId
          );
          if (idx === -1) return prev;
          const actual = prev.EN_ATENCION[idx];
          const prevReportes = Number(actual.totalReportesTerreno ?? 0);
          const actualizado: IncidenteResumen = {
            ...actual,
            faenasCuadrillaCompletadas: true,
            tieneMisionEnCurso: false,
            cuadrillaAceptada: true,
            estadoTerrenoFinal:
              payload.reporteTerreno?.estadoTerreno ?? actual.estadoTerrenoFinal,
            horasHombreRegistradas:
              typeof payload.reporteTerreno?.horasHombre === 'number'
                ? payload.reporteTerreno.horasHombre
                : actual.horasHombreRegistradas,
            totalReportesTerreno: yaContado
              ? Math.max(1, prevReportes)
              : actual.faenasCuadrillaCompletadas
                ? prevReportes
                : Math.max(1, prevReportes + 1),
            actualizadoEn: payload.fechaCierre || new Date().toISOString(),
          };
          const nuevaLista = prev.EN_ATENCION.map((item, i) =>
            i === idx ? actualizado : item
          );
          return {
            ...prev,
            EN_ATENCION: ordenarIncidentesColumna(nuevaLista, 'EN_ATENCION'),
          };
        });
        onMisionActualizadaRef.current?.(payload);
        return;
      }

      const esMisionCuadrilla =
        Boolean(payload.cuadrillaId) || payload.tipoMision === 'ATENCION_CUADRILLA';
      const hitoCodigo =
        typeof payload.hito === 'string'
          ? payload.hito
          : payload.hito && typeof payload.hito === 'object'
            ? payload.hito.hito
            : undefined;
      const hitoConfig = hitoCodigo ? obtenerConfigHito(hitoCodigo) : null;
      const esAceptacion =
        Boolean(hitoConfig?.esAceptacion) ||
        (payload.estado === 'EN_CURSO' && esMisionCuadrilla);

      if (esAceptacion) {
        if (payload.incidenteId && esMisionCuadrilla) {
          moverIncidenteAEstado(payload.incidenteId, 'EN_ATENCION', undefined, {
            cuadrillaAceptada: true,
            tieneMisionEnCurso: true,
            tieneMisionDespachada: false,
            faenasCuadrillaCompletadas: false,
          });
        }
        if (esMisionCuadrilla && !onMisionActualizadaRef.current) {
          notificarToastAceptacionCuadrilla(payload.misionId, payload.codigo);
        }
        onMisionAceptadaRef.current?.(payload);
      }

      onMisionActualizadaRef.current?.(payload);
    },
    [moverIncidenteAEstado, notificarToastAceptacionCuadrilla]
  );

  const handleRecursoActualizado = useCallback(
    (payload: RecursoActualizadoPayload) => {
      onRecursoActualizadoRef.current?.(payload);
    },
    []
  );

  const marcarIncidenteMisionDespachada = useCallback(
    (incidenteId: string, despachada: boolean = true) => {
      setColumnas((prev) => ({
        ...prev,
        REPORTADO: prev.REPORTADO.map((inc) =>
          inc.id === incidenteId ? { ...inc, tieneMisionDespachada: despachada } : inc
        ),
      }));
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

  const handleMisionHitoRegistrado = useCallback(
    (payload: MisionHitoRegistradoPayload) => {
      const config = obtenerConfigHito(payload.hito);
      const etiquetaMision = payload.codigoMision?.trim() || payload.misionId;

      if (config.esLlegadaTerreno) {
        const incidenteIdResuelto =
          (payload as { incidenteId?: string }).incidenteId ||
          getIncidentePorMision(payload.misionId);
        if (incidenteIdResuelto) {
          setColumnas((prev) => ({
            ...prev,
            EN_ATENCION: prev.EN_ATENCION.map((inc) =>
              inc.id === incidenteIdResuelto
                ? {
                    ...inc,
                    cuadrillaEnTerreno: true,
                    tieneMisionEnCurso: true,
                    cuadrillaAceptada: true,
                  }
                : inc
            ),
          }));
        }
        toast?.showInfo(
          `La cuadrilla ha reportado su llegada a terreno para la misión ${etiquetaMision}.`,
          'Llegada a Terreno'
        );
        return;
      }

      if (config.esAceptacion) {
        notificarToastAceptacionCuadrilla(payload.misionId, payload.codigoMision);
      }
    },
    [notificarToastAceptacionCuadrilla, toast]
  );

  const handleMisionApoyoSolicitado = useCallback(
    (payload: MisionApoyoSolicitadoPayload) => {
      const incidenteIdResuelto =
        payload.incidenteId || getIncidentePorMision(payload.misionId);

      if (incidenteIdResuelto) {
        setColumnas((prev) => {
          let huboCambio = false;
          const siguientes = { ...prev };

          for (const est of ESTADOS_KANBAN) {
            const idx = prev[est].findIndex((i) => i.id === incidenteIdResuelto);
            if (idx !== -1) {
              huboCambio = true;
              const actual = prev[est][idx];
              const actualizado: IncidenteResumen = {
                ...actual,
                apoyoSolicitado: Boolean(payload.requiereApoyoAdicional ?? true),
                detalleApoyoRequerido:
                  payload.detalleApoyoRequerido ?? actual.detalleApoyoRequerido ?? null,
                actualizadoEn: payload.solicitadoEn || new Date().toISOString(),
              };
              const nuevaLista = prev[est].map((item, i) =>
                i === idx ? actualizado : item
              );
              siguientes[est] = ordenarIncidentesColumna(nuevaLista, est);
              break;
            }
          }

          return huboCambio ? siguientes : prev;
        });
      }

      onMisionApoyoSolicitadoRef.current?.(payload);
    },
    []
  );

  const { conectado, ultimoEvento } = useEncargadoKanbanSocket({
    onIncidenteCreado: handleIncidenteCreado,
    onIncidenteActualizado: handleIncidenteActualizado,
    onMisionRechazada: handleMisionRechazada,
    onMisionActualizada: handleMisionActualizada,
    onMisionApoyoSolicitado: handleMisionApoyoSolicitado,
    onCuadrillaActualizada: handleCuadrillaActualizada,
    onRecursoActualizado: handleRecursoActualizado,
    onNotificacionTrazabilidadActualizada: handleTrazabilidadActualizada,
    onMisionHitoRegistrado: handleMisionHitoRegistrado,
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
    marcarIncidenteMisionDespachada,
    conectado,
    ultimoEvento,
    totalIncidentesVisibles,
    incidenteSeleccionadoId,
    setIncidenteSeleccionadoId,
    trazabilidadPorIncidente,
  };
}
