import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { useCallCenterSocket } from '@/hooks/useCallCenterSocket';
import { listarAvisos } from '@/services/avisosService';
import { getErrorMessage } from '@/lib/utils/errorUtils';
import type {
  AvisoItem,
  FiltroOrigen,
  FiltroSemaforo,
  OperadorInfo,
  SocketAvisoDescartadoPayload,
  SocketAvisoNuevoPayload,
  SocketAvisoVerificadoPayload,
} from '@/types/avisos';
import { OPERADORES_PREDEFINIDOS } from '@/components/callcenter/AvisosHeader';

export function useAvisos() {
  const { showInfo, showWarning, showError } = useToast();

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

  const [busqueda, setBusqueda] = useState('');
  const [filtroOrigen, setFiltroOrigen] = useState<FiltroOrigen>('TODOS');
  const [filtroSemaforo, setFiltroSemaforo] = useState<FiltroSemaforo>('TODOS');

  const cargarAvisos = useCallback(
    async (silent = false) => {
      if (!silent) setCargando(true);
      try {
        const respuesta = await listarAvisos({
          page: paginaActual,
          limit: limite,
          estado: 'NO_VERIFICADO',
        });

        setAvisos(respuesta.data || []);
        setTotalItems(respuesta.pagination.total || 0);
        setTotalPaginas(respuesta.pagination.totalPages || 1);
      } catch (err: unknown) {
        if (!silent) {
          showError(
            getErrorMessage(err),
            'Error al cargar avisos'
          );
        }
      } finally {
        if (!silent) setCargando(false);
      }
    },
    [paginaActual, limite, showError]
  );

  const handleRefrescarManual = useCallback(async () => {
    setRefrescando(true);
    await cargarAvisos(true);
    setRefrescando(false);
  }, [cargarAvisos]);

  useEffect(() => {
    let activo = true;

    async function fetchData() {
      try {
        const respuesta = await listarAvisos({
          page: paginaActual,
          limit: limite,
          estado: 'NO_VERIFICADO',
        });

        if (activo) {
          setAvisos(respuesta.data || []);
          setTotalItems(respuesta.pagination.total || 0);
          setTotalPaginas(respuesta.pagination.totalPages || 1);
          setCargando(false);
        }
      } catch (err: unknown) {
        if (activo) {
          showError(
            getErrorMessage(err),
            'Error al cargar avisos'
          );
          setCargando(false);
        }
      }
    }

    fetchData();

    return () => {
      activo = false;
    };
  }, [paginaActual, limite, showError]);

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
          '🚨 Nuevo Aviso Entrante'
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

  const avisosFiltrados = useMemo(() => {
    return avisos.filter((aviso) => {
      if (busqueda.trim()) {
        const query = busqueda.toLowerCase().trim();
        const coincideDesc = aviso.descripcion?.toLowerCase().includes(query);
        const coincideTipo = aviso.tipoPreliminarNombre?.toLowerCase().includes(query);
        if (!coincideDesc && !coincideTipo) return false;
      }

      if (filtroOrigen !== 'TODOS' && aviso.origenReporte !== filtroOrigen) {
        return false;
      }

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

      return true;
    });
  }, [avisos, busqueda, filtroOrigen, filtroSemaforo]);

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
    setBusqueda,
    filtroOrigen,
    setFiltroOrigen,
    filtroSemaforo,
    setFiltroSemaforo,
    cargarAvisos,
    handleRefrescarManual,
    isConnected,
    metricas,
  };
}
