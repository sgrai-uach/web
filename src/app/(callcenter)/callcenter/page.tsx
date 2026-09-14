'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AvisoDetalleModal from '@/components/callcenter/AvisoDetalleModal';
import AvisosFiltros, {
  FiltroOrigen,
  FiltroSemaforo,
} from '@/components/callcenter/AvisosFiltros';
import AvisosHeader, {
  OPERADORES_PREDEFINIDOS,
  OperadorInfo,
} from '@/components/callcenter/AvisosHeader';
import AvisosTable from '@/components/callcenter/AvisosTable';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { useCallCenterSocket } from '@/hooks/useCallCenterSocket';
import { ApiError, listarAvisos } from '@/lib/api/avisos';
import type {
  AvisoItem,
  SocketAvisoDescartadoPayload,
  SocketAvisoNuevoPayload,
  SocketAvisoVerificadoPayload,
} from '@/types/api';

function CallCenterContent() {
  const { showInfo, showWarning, showError } = useToast();

  // Estados de datos
  const [avisos, setAvisos] = useState<AvisoItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [limite, setLimite] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);

  // Operador y Modal
  const [operadorActivo, setOperadorActivo] = useState<OperadorInfo>(
    OPERADORES_PREDEFINIDOS[0]
  );
  const [avisoSeleccionado, setAvisoSeleccionado] = useState<AvisoItem | null>(null);

  // Filtros en vista
  const [busqueda, setBusqueda] = useState('');
  const [filtroOrigen, setFiltroOrigen] = useState<FiltroOrigen>('TODOS');
  const [filtroSemaforo, setFiltroSemaforo] = useState<FiltroSemaforo>('TODOS');

  // Función para cargar avisos desde la API
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
            err instanceof ApiError ? err.message : 'No se pudo conectar con sgrai-api',
            'Error al cargar avisos'
          );
        }
      } finally {
        if (!silent) setCargando(false);
      }
    },
    [paginaActual, limite, showError]
  );

  // Handler para refresco manual del botón
  const handleRefrescarManual = useCallback(async () => {
    setRefrescando(true);
    await cargarAvisos(true);
    setRefrescando(false);
  }, [cargarAvisos]);

  // Carga inicial y por cambio de página
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
            err instanceof ApiError ? err.message : 'No se pudo conectar con sgrai-api',
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

  // Handlers para eventos WebSocket en tiempo real
  const handleAvisoNuevo = useCallback(
    (nuevoAviso: SocketAvisoNuevoPayload) => {
      setAvisos((prev) => {
        const existe = prev.some((a) => a.id === nuevoAviso.id);
        if (existe) {
          return prev.map((a) => (a.id === nuevoAviso.id ? nuevoAviso : a));
        }
        setTotalItems((total) => total + 1);
        showInfo(
          `Nuevo reporte: ${nuevoAviso.tipoPreliminarNombre || 'Aviso de emergencia'} (${nuevoAviso.origenReporte})`,
          '🚨 Nuevo Aviso Entrante'
        );
        return [nuevoAviso, ...prev];
      });
    },
    [showInfo]
  );

  const handleAvisoVerificado = useCallback(
    (payload: SocketAvisoVerificadoPayload) => {
      setAvisos((prev) => prev.filter((a) => a.id !== payload.avisoId));
      setTotalItems((prev) => Math.max(0, prev - 1));

      // Si el operador tenía abierto este aviso en modal, cerrarlo
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

  // Conexión Socket.io
  const { isConnected } = useCallCenterSocket({
    onAvisoNuevo: handleAvisoNuevo,
    onAvisoVerificado: handleAvisoVerificado,
    onAvisoDescartado: handleAvisoDescartado,
  });

  // Métricas calculadas para el encabezado
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

  // Filtrado de avisos en cliente
  const avisosFiltrados = useMemo(() => {
    return avisos.filter((aviso) => {
      // Filtro texto
      if (busqueda.trim()) {
        const query = busqueda.toLowerCase().trim();
        const coincideDesc = aviso.descripcion?.toLowerCase().includes(query);
        const coincideTipo = aviso.tipoPreliminarNombre?.toLowerCase().includes(query);
        if (!coincideDesc && !coincideTipo) return false;
      }

      // Filtro canal origen
      if (filtroOrigen !== 'TODOS' && aviso.origenReporte !== filtroOrigen) {
        return false;
      }

      // Filtro semáforo
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

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-light, #ECEFF3)',
        paddingBottom: '3rem',
      }}
    >
      {/* Cabecera y KPIs */}
      <AvisosHeader
        socketConnected={isConnected}
        operadorActivo={operadorActivo}
        onCambiarOperador={setOperadorActivo}
        metricas={metricas}
      />

      {/* Contenedor central */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Barra de Filtros */}
        <AvisosFiltros
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          filtroOrigen={filtroOrigen}
          onFiltroOrigenChange={setFiltroOrigen}
          filtroSemaforo={filtroSemaforo}
          onFiltroSemaforoChange={setFiltroSemaforo}
          onRefrescar={handleRefrescarManual}
          cargando={refrescando}
        />

        {/* Tabla Paginada con Semáforo */}
        <AvisosTable
          avisos={avisosFiltrados}
          cargando={cargando}
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          totalItems={totalItems}
          limite={limite}
          onCambiarPagina={setPaginaActual}
          onCambiarLimite={(l) => {
            setLimite(l);
            setPaginaActual(1);
          }}
          onSeleccionarAviso={(aviso) => setAvisoSeleccionado(aviso)}
        />
      </main>

      {/* Modal de Detalle, Mapa, Verificación y Descarte */}
      <AvisoDetalleModal
        aviso={avisoSeleccionado}
        operadorId={operadorActivo.id}
        onClose={() => setAvisoSeleccionado(null)}
        onAccionCompletada={() => cargarAvisos(true)}
      />
    </div>
  );
}

export default function CallCenterPage() {
  return (
    <ToastProvider>
      <CallCenterContent />
    </ToastProvider>
  );
}
