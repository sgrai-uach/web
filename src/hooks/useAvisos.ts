import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { useCallCenterSocket } from '@/hooks/useCallCenterSocket';
import { listarAvisos } from '@/services/avisosService';
import { getErrorMessage } from '@/lib/utils/errorUtils';
import type {
  AvisoItem,
  FiltroDelegacion,
  FiltroEstado,
  FiltroOrigen,
  FiltroSemaforo,
  OperadorInfo,
  SocketAvisoDescartadoPayload,
  SocketAvisoNuevoPayload,
  SocketAvisoVerificadoPayload,
} from '@/types/avisos';
import { normalizarEstadoAviso, obtenerDelegacionAviso } from '@/types/avisos';
import { OPERADORES_PREDEFINIDOS } from '@/components/callcenter/AvisosHeader';

function mapearEstadoParaApi(
  filtro: FiltroEstado
): 'NO_VERIFICADO' | 'VERIFICADO' | 'DESCARTADO' | 'TODOS' {
  switch (filtro) {
    case 'VERIFICADO':
      return 'VERIFICADO';
    case 'RECHAZADO':
      return 'DESCARTADO';
    case 'TODOS':
      return 'TODOS';
    case 'PENDIENTE':
    default:
      return 'NO_VERIFICADO';
  }
}

export function useAvisos() {
  const { showInfo, showWarning, showError } = useToast();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Inicialización a partir de query parameters en la URL
  const initialParams = useMemo(() => {
    const q = searchParams?.get('q') || '';
    const origenRaw = searchParams?.get('origen');
    const origen: FiltroOrigen =
      origenRaw === 'WEB' || origenRaw === 'CHATBOT' || origenRaw === 'TELEFONO'
        ? origenRaw
        : 'TODOS';
    const prioridadRaw = searchParams?.get('prioridad');
    const prioridad: FiltroSemaforo =
      prioridadRaw === 'EN_TIEMPO' || prioridadRaw === 'PRECAUCION' || prioridadRaw === 'URGENTE'
        ? prioridadRaw
        : 'TODOS';
    const delegacionRaw = searchParams?.get('delegacion');
    const delegacion: FiltroDelegacion =
      delegacionRaw === 'Norte' ||
      delegacionRaw === 'Sur' ||
      delegacionRaw === 'Costa' ||
      delegacionRaw === 'Calle Calle' ||
      delegacionRaw === 'Calle-Calle'
        ? (delegacionRaw === 'Calle-Calle' ? 'Calle Calle' : (delegacionRaw as FiltroDelegacion))
        : 'TODAS';
    const estadoRaw = searchParams?.get('estado')?.toUpperCase();
    const estado: FiltroEstado =
      estadoRaw === 'TODOS' || estadoRaw === 'VERIFICADO' || estadoRaw === 'RECHAZADO'
        ? (estadoRaw as FiltroEstado)
        : 'PENDIENTE';

    return { q, origen, prioridad, delegacion, estado };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [avisos, setAvisos] = useState<AvisoItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [limite, setLimite] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const [operadorActivo, setOperadorActivo] = useState<OperadorInfo>(
    OPERADORES_PREDEFINIDOS[0]
  );
  const [avisoSeleccionado, setAvisoSeleccionado] = useState<AvisoItem | null>(null);

  // Estados locales de filtrado
  const [busqueda, setBusqueda] = useState(initialParams.q);
  const [filtroOrigen, setFiltroOrigen] = useState<FiltroOrigen>(initialParams.origen);
  const [filtroSemaforo, setFiltroSemaforo] = useState<FiltroSemaforo>(initialParams.prioridad);
  const [filtroDelegacion, setFiltroDelegacion] = useState<FiltroDelegacion>(initialParams.delegacion);
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>(initialParams.estado);

  // Sincronización de filtros con los Query Strings de la URL
  const primerRenderRef = useRef(true);
  useEffect(() => {
    if (primerRenderRef.current) {
      primerRenderRef.current = false;
      return;
    }

    if (typeof window === 'undefined') return;

    const params = new URLSearchParams();
    if (busqueda.trim()) params.set('q', busqueda.trim());
    if (filtroOrigen !== 'TODOS') params.set('origen', filtroOrigen);
    if (filtroSemaforo !== 'TODOS') params.set('prioridad', filtroSemaforo);
    if (filtroDelegacion !== 'TODAS') params.set('delegacion', filtroDelegacion);
    if (filtroEstado !== 'PENDIENTE') params.set('estado', filtroEstado);

    const queryString = params.toString();
    const nuevaUrl = queryString ? `${pathname || '/callcenter'}?${queryString}` : (pathname || '/callcenter');

    window.history.replaceState(null, '', nuevaUrl);
  }, [busqueda, filtroOrigen, filtroSemaforo, filtroDelegacion, filtroEstado, pathname]);

  useEffect(() => {
    let activo = true;

    async function fetchData() {
      try {
        const estadoApi = mapearEstadoParaApi(filtroEstado);
        const respuesta = await listarAvisos({
          page: paginaActual,
          limit: limite,
          estado: estadoApi,
          delegacion: filtroDelegacion !== 'TODAS' ? filtroDelegacion : undefined,
        });

        if (activo) {
          setAvisos(respuesta.data || []);
          setTotalItems(respuesta.pagination.total || 0);
          setTotalPaginas(respuesta.pagination.totalPages || 1);
          setCargando(false);
        }
      } catch (err: unknown) {
        if (activo) {
          showError(getErrorMessage(err), 'Error al cargar avisos');
          setCargando(false);
        }
      }
    }

    fetchData();

    return () => {
      activo = false;
    };
  }, [paginaActual, limite, filtroEstado, filtroDelegacion, showError]);

  const cargarAvisos = useCallback(
    async (silent = false) => {
      if (!silent) setCargando(true);
      try {
        const estadoApi = mapearEstadoParaApi(filtroEstado);
        const respuesta = await listarAvisos({
          page: paginaActual,
          limit: limite,
          estado: estadoApi,
          delegacion: filtroDelegacion !== 'TODAS' ? filtroDelegacion : undefined,
        });

        setAvisos(respuesta.data || []);
        setTotalItems(respuesta.pagination.total || 0);
        setTotalPaginas(respuesta.pagination.totalPages || 1);
      } catch (err: unknown) {
        if (!silent) {
          showError(getErrorMessage(err), 'Error al cargar avisos');
        }
      } finally {
        if (!silent) setCargando(false);
      }
    },
    [paginaActual, limite, filtroEstado, filtroDelegacion, showError]
  );

  const handleRefrescarManual = useCallback(async () => {
    setRefrescando(true);
    await cargarAvisos(true);
    setRefrescando(false);
  }, [cargarAvisos]);

  const handleAvisoNuevo = useCallback(
    (nuevoAviso: SocketAvisoNuevoPayload) => {
      let esNuevo = false;

      setAvisos((prev) => {
        const existe = prev.some((a) => a.id === nuevoAviso.id);
        if (existe) {
          return prev.map((a) => (a.id === nuevoAviso.id ? nuevoAviso : a));
        }
        esNuevo = true;
        return [nuevoAviso, ...prev];
      });

      if (esNuevo) {
        setTotalItems((total) => total + 1);
        showInfo(
          `Nuevo reporte: ${nuevoAviso.tipoPreliminarNombre || 'Aviso de emergencia'} (${nuevoAviso.origenReporte})`,
          'Nuevo Aviso Entrante'
        );
      }
    },
    [showInfo]
  );

  const handleAvisoVerificado = useCallback(
    (payload: SocketAvisoVerificadoPayload) => {
      setAvisos((prev) => prev.filter((a) => a.id !== payload.avisoId));
      setTotalItems((prev) => Math.max(0, prev - 1));

      if (avisoSeleccionado?.id === payload.avisoId) {
        setAvisoSeleccionado(null);
        showWarning(
          `El aviso fue promovido a Incidente con folio ${payload.folio} por otro operador.`,
          'Aviso Atendido'
        );
      } else {
        showInfo(
          `Aviso promovido a Incidente (Folio: ${payload.folio})`,
          'Derivado a Operaciones'
        );
      }
    },
    [avisoSeleccionado, showInfo, showWarning]
  );

  const handleAvisoDescartado = useCallback(
    (payload: SocketAvisoDescartadoPayload) => {
      setAvisos((prev) => prev.filter((a) => a.id !== payload.avisoId));
      setTotalItems((prev) => Math.max(0, prev - 1));

      if (avisoSeleccionado?.id === payload.avisoId) {
        setAvisoSeleccionado(null);
        showWarning(
          `Este aviso fue descartado por otro operador: "${payload.motivoDescarte}".`,
          'Aviso Descartado'
        );
      }
    },
    [avisoSeleccionado, showWarning]
  );

  const { isConnected } = useCallCenterSocket({
    onAvisoNuevo: handleAvisoNuevo,
    onAvisoVerificado: handleAvisoVerificado,
    onAvisoDescartado: handleAvisoDescartado,
  });

  const metricas = useMemo(() => {
    let enTiempo = 0;
    let precaucion = 0;
    let urgentes = 0;

    avisos.forEach((a) => {
      if (a.minutosEnEspera > 30) {
        urgentes += 1;
      } else if (a.minutosEnEspera >= 15) {
        precaucion += 1;
      } else {
        enTiempo += 1;
      }
    });

    return {
      total: totalItems,
      enTiempo,
      precaucion,
      urgentes,
    };
  }, [avisos, totalItems]);

  // Filtrado multicriterio reactivo
  const avisosFiltrados = useMemo(() => {
    return avisos.filter((aviso) => {
      // 1. Filtro por término de búsqueda
      if (busqueda.trim()) {
        const query = busqueda.toLowerCase().trim();
        const coincideDesc = aviso.descripcion?.toLowerCase().includes(query);
        const coincideTipo = aviso.tipoPreliminarNombre?.toLowerCase().includes(query);
        const coincideDir = aviso.direccionTexto?.toLowerCase().includes(query);
        const coincideInf = aviso.informanteNombre?.toLowerCase().includes(query);
        const coincideSeg = aviso.codigoSeguimiento?.toLowerCase().includes(query);
        if (!coincideDesc && !coincideTipo && !coincideDir && !coincideInf && !coincideSeg) {
          return false;
        }
      }

      // 2. Filtro por canal de origen
      if (filtroOrigen !== 'TODOS' && aviso.origenReporte !== filtroOrigen) {
        return false;
      }

      // 3. Filtro por prioridad/semáforo de antigüedad
      if (filtroSemaforo === 'EN_TIEMPO' && aviso.minutosEnEspera >= 15) {
        return false;
      }
      if (
        filtroSemaforo === 'PRECAUCION' &&
        (aviso.minutosEnEspera < 15 || aviso.minutosEnEspera > 30)
      ) {
        return false;
      }
      if (filtroSemaforo === 'URGENTE' && aviso.minutosEnEspera <= 30) {
        return false;
      }

      // 4. Filtro por delegación territorial
      if (filtroDelegacion !== 'TODAS') {
        const delegacionAviso = obtenerDelegacionAviso(aviso);
        if (!delegacionAviso || delegacionAviso.toLowerCase() !== filtroDelegacion.toLowerCase()) {
          return false;
        }
      }

      // 5. Filtro por estado del aviso
      if (filtroEstado !== 'TODOS') {
        const estadoNorm = normalizarEstadoAviso(aviso.estado);
        if (estadoNorm !== filtroEstado) {
          return false;
        }
      }

      return true;
    });
  }, [avisos, busqueda, filtroOrigen, filtroSemaforo, filtroDelegacion, filtroEstado]);

  // Indicador si hay filtros activos más allá de los valores por defecto
  const hayFiltrosActivos = useMemo(() => {
    return (
      Boolean(busqueda.trim()) ||
      filtroOrigen !== 'TODOS' ||
      filtroSemaforo !== 'TODOS' ||
      filtroDelegacion !== 'TODAS' ||
      filtroEstado !== 'PENDIENTE'
    );
  }, [busqueda, filtroOrigen, filtroSemaforo, filtroDelegacion, filtroEstado]);

  // Restablecer todos los filtros a su estado original
  const limpiarFiltros = useCallback(() => {
    setBusqueda('');
    setFiltroOrigen('TODOS');
    setFiltroSemaforo('TODOS');
    setFiltroDelegacion('TODAS');
    setFiltroEstado('PENDIENTE');
    setPaginaActual(1);
  }, []);

  const handleSetBusqueda = useCallback((val: string) => {
    setBusqueda(val);
    setPaginaActual(1);
  }, []);

  const handleSetFiltroOrigen = useCallback((val: FiltroOrigen) => {
    setFiltroOrigen(val);
    setPaginaActual(1);
  }, []);

  const handleSetFiltroSemaforo = useCallback((val: FiltroSemaforo) => {
    setFiltroSemaforo(val);
    setPaginaActual(1);
  }, []);

  const handleSetFiltroDelegacion = useCallback((val: FiltroDelegacion) => {
    setFiltroDelegacion(val);
    setPaginaActual(1);
  }, []);

  const handleSetFiltroEstado = useCallback((val: FiltroEstado) => {
    setFiltroEstado(val);
    setPaginaActual(1);
  }, []);

  return {
    avisos: avisosFiltrados,
    cargando,
    refrescando,
    paginaActual,
    setPaginaActual,
    limite,
    setLimite,
    totalItems,
    totalPaginas,
    operadorActivo,
    setOperadorActivo,
    avisoSeleccionado,
    setAvisoSeleccionado,
    busqueda,
    setBusqueda: handleSetBusqueda,
    filtroOrigen,
    setFiltroOrigen: handleSetFiltroOrigen,
    filtroSemaforo,
    setFiltroSemaforo: handleSetFiltroSemaforo,
    filtroDelegacion,
    setFiltroDelegacion: handleSetFiltroDelegacion,
    filtroEstado,
    setFiltroEstado: handleSetFiltroEstado,
    hayFiltrosActivos,
    limpiarFiltros,
    cargarAvisos,
    handleRefrescarManual,
    isConnected,
    metricas,
  };
}
