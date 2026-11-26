'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  useIncidentesKanban,
} from '@/hooks/useIncidentesKanban';
import { useIncidentesKpis } from '@/hooks/useIncidentesKpis';
import { usePrevencionSocket } from '@/hooks/usePrevencionSocket';
import { useRecuperacionSocket } from '@/hooks/useRecuperacionSocket';
import { useToast } from '@/components/ui/Toast';
import type { EstadoIncidente, IncidenteResumen } from '@/services/incidentesService';
import type { EventoPrevencionDTO } from '@/types/evento-prevencion';
import type {
  EventoRecuperacionResponse,
  DetalleEventoRecuperacionResponse,
  RecursoAsignadoItem,
} from '@/types/recuperacion';
import {
  MisionRechazadaPayload,
  IncidenteActualizadoPayload,
  IncidenteCreadoPayload,
} from '@/hooks/useEncargadoKanbanSocket';
import {
  esJustificacionSinCambios,
  formatearPrioridad,
  formatearCompromisoVivienda,
  formatearEstado,
  fueTipologiaModificada,
} from '@/lib/utils/estadoUtils';
import { KanbanHeader } from './KanbanHeader';
import { KanbanFiltros } from './KanbanFiltros';
import { KanbanColumn } from './KanbanColumn';
import { IncidentesKpiCards } from './IncidentesKpiCards';
import { IncidenteDetalleDrawer } from './IncidenteDetalleDrawer';
import { AccesoDenegado } from './AccesoDenegado';
import { MisionesModal } from './misiones/MisionesModal';
import { MisionDetalleModal } from './mision/MisionDetalleModal';
import { AsignarPatrullaModal } from './patrullas/AsignarPatrullaModal';
import { PanelPatrullasModal } from './patrullas/PanelPatrullasModal';
import { ModalCrearEventoPrevencion } from './ModalCrearEventoPrevencion';
import { ModalCrearEventoRecuperacion } from './ModalCrearEventoRecuperacion';
import { MapaOperativoMando } from './MapaOperativoMando';
import { KanbanViewSwitcher, type VistaCentroIncidentes } from './KanbanViewSwitcher';
import EventosPrevencionView from './prevencion/EventosPrevencionView';
import CuadrillaDetalleDrawer from '@/components/admin/cuadrillas/CuadrillaDetalleDrawer';
import { cuadrillasService } from '@/services/cuadrillasService';
import { listarEventosRecuperacion } from '@/services/recuperacionService';
import type { CuadrillaItem } from '@/types/cuadrilla';
import { usePuedeAsignarMision } from '@/hooks/usePuedeAsignarMision';
import { usePuedeCrearEventoAtp } from '@/hooks/usePuedeCrearEventoAtp';
import { extraerEstadoInicialNotificacion } from '@/lib/socket/trazabilidadConfig';
import { setTrazabilidadEstado } from '@/lib/socket/trazabilidadStore';
import InlineNotice from '@/components/ui/InlineNotice';
import styles from '@/styles/mando.module.css';

const TITULOS_COLUMNAS = {
  REPORTADO: 'Reportado',
  VERIFICANDO: 'En Verificación',
  EN_ATENCION: 'En Atención',
  RESUELTO: 'Resuelto',
  NO_ABORDABLE: 'No Abordable',
} as const;

export const KanbanBoard: React.FC = () => {
  const { showInfo, showWarning } = useToast();
  const searchParams = useSearchParams();
  const tabInicial: VistaCentroIncidentes = searchParams?.get('tab') === 'prevencion' ? 'prevencion' : 'kanban';
  const [vistaActiva, setVistaActiva] = useState<VistaCentroIncidentes>(tabInicial);
  const [misionesModalAbierto, setMisionesModalAbierto] = useState(false);
  const [patrullasModalAbierto, setPatrullasModalAbierto] = useState(false);
  const [misionSeleccionadaId, setMisionSeleccionadaId] = useState<string | null>(null);
  const [modalPrevencionAbierto, setModalPrevencionAbierto] = useState(false);
  const [modalRecuperacionAbierto, setModalRecuperacionAbierto] = useState(false);
  const [eventosPrevencion, setEventosPrevencion] = useState<EventoPrevencionDTO[]>([]);
  const [eventosRecuperacion, setEventosRecuperacion] = useState<
    (EventoRecuperacionResponse | DetalleEventoRecuperacionResponse)[]
  >([]);
  const [cuadrillaSeleccionadaId, setCuadrillaSeleccionadaId] = useState<string | null>(null);
  const [cuadrillasOperativas, setCuadrillasOperativas] = useState<CuadrillaItem[]>([]);
  const [incidenteParaAsignar, setIncidenteParaAsignar] = useState<IncidenteResumen | null>(null);
  const puedeAsignar = usePuedeAsignarMision();
  const puedeCrearEventoAtp = usePuedeCrearEventoAtp();

  const [estadoEnfocado, setEstadoEnfocado] = useState<EstadoIncidente | null>(null);
  const refrescarKpisRef = React.useRef<((mostrarCargando?: boolean) => void) | null>(null);
  const setIncidenteSeleccionadoIdRef = React.useRef<((id: string | null) => void) | null>(null);

  const ultimosToastsRechazoRef = React.useRef<Map<string, number>>(new Map());

  const handleMisionRechazadaSocket = React.useCallback(
    (payload: MisionRechazadaPayload) => {
      const ahora = Date.now();
      if (payload.misionId) {
        const ultimaVez = ultimosToastsRechazoRef.current.get(payload.misionId);
        if (ultimaVez && ahora - ultimaVez < 5000) {
          return;
        }
        ultimosToastsRechazoRef.current.set(payload.misionId, ahora);
      }

      const patrullaTexto = payload.patrullaNombre
        ? `La patrulla ${payload.patrullaNombre}`
        : 'La patrulla verificadora';
      const motivoTexto = payload.motivo || payload.justificacionRechazo || 'Sin justificación especificada';

      showWarning(
        `${patrullaTexto} rechazó la misión asignada. El incidente retorna a estado Reportado para su reasignación táctica.`,
        'Misión Rechazada por Patrulla',
        {
          icon: 'rechazo',
          codeBadge: payload.codigo,
          details: [
            { label: 'Motivo de rechazo', value: motivoTexto },
            ...(payload.incidenteCodigo ? [{ label: 'Incidente', value: payload.incidenteCodigo }] : []),
          ],
          action: payload.incidenteId
            ? {
                label: 'Ver incidente',
                onClick: () => setIncidenteSeleccionadoIdRef.current?.(payload.incidenteId!),
              }
            : undefined,
        }
      );

      refrescarKpisRef.current?.(false);
    },
    [showWarning]
  );

  const ultimosToastsReporteRef = React.useRef<Map<string, number>>(new Map());

  const handleReporteTerrenoRecibido = React.useCallback(
    (payload: IncidenteActualizadoPayload) => {
      const rep = payload.datos.reporteTerreno;
      if (!rep) return;

      const ahora = Date.now();
      const claveDedup = `${payload.datos.id}-${rep.id || rep.versionReporte || 1}`;
      const ultimaVez = ultimosToastsReporteRef.current.get(claveDedup);
      if (ultimaVez && ahora - ultimaVez < 4000) {
        return;
      }
      ultimosToastsReporteRef.current.set(claveDedup, ahora);

      const numVersion = Number(rep.versionReporte || 1);
      const esRect = Boolean(rep.esRectificacion || numVersion > 1);
      const prioridadTexto = formatearPrioridad(payload.datos.prioridad);
      const tituloToast = esRect
        ? `Reporte #${numVersion} (Rectificación en Terreno)`
        : 'Reporte #1 (Evaluación en Terreno)';

      const detallesToast: Array<{ label: string; value: string }> = [];

      // Afectación registrada
      const evalData = (rep.evaluacion || {}) as Record<string, unknown>;
      const familiasRaw = Array.isArray(evalData.familias)
        ? (evalData.familias as Record<string, unknown>[])
        : undefined;
      const familiasCount =
        familiasRaw && familiasRaw.length > 0
          ? familiasRaw.length
          : typeof evalData.familiasAfectadas === 'number'
            ? evalData.familiasAfectadas
            : null;
      const personas = rep.personasAfectadas !== null && rep.personasAfectadas !== undefined
        ? Number(rep.personasAfectadas)
        : null;
      const viviendas = rep.evaluacion?.viviendasAfectadas !== null && rep.evaluacion?.viviendasAfectadas !== undefined
        ? Number(rep.evaluacion.viviendasAfectadas)
        : null;

      if (personas !== null || viviendas !== null || familiasCount !== null) {
        const partesAfectacion: string[] = [];
        if (familiasCount !== null) {
          partesAfectacion.push(`${familiasCount} ${familiasCount === 1 ? 'familia' : 'familias'}`);
        }
        if (personas !== null) {
          partesAfectacion.push(`${personas} persona(s)`);
        }
        if (viviendas !== null) {
          const compromisoTexto = rep.evaluacion?.nivelCompromisoVivienda
            ? ` (${formatearCompromisoVivienda(String(rep.evaluacion.nivelCompromisoVivienda))})`
            : '';
          partesAfectacion.push(`${viviendas} vivienda(s)${compromisoTexto}`);
        }
        detallesToast.push({
          label: 'Afectación',
          value: partesAfectacion.join(' | '),
        });
      }

      // Asistencia Social / FIBE
      const requiereFibe = Boolean(
        evalData.requiereAsistenciaSocial ||
          (familiasRaw && familiasRaw.some((f) => f.requiereAsistenciaSocial))
      );
      if (requiereFibe) {
        detallesToast.push({
          label: 'Asistencia social',
          value: 'Requiere levantamiento de Ficha FIBE',
        });
      }

      // Prioridad evaluada / sugerida
      if (
        payload.datos.prioridadSugerida &&
        payload.datos.prioridadSugerida !== payload.datos.prioridad
      ) {
        detallesToast.push({
          label: 'Ajuste de prioridad',
          value: `Asignada: ${prioridadTexto} (Sugerida por sistema: ${formatearPrioridad(payload.datos.prioridadSugerida)})`,
        });
      }

      // Acciones realizadas (sin duplicar el string generado de personas/viviendas)
      if (rep.accionesRealizadas && rep.accionesRealizadas.trim()) {
        detallesToast.push({
          label: 'Acciones realizadas',
          value: rep.accionesRealizadas.trim(),
        });
      } else if (payload.datos.justificacion && payload.datos.justificacion.trim()) {
        detallesToast.push({
          label: 'Observación en terreno',
          value: payload.datos.justificacion.trim(),
        });
      }

      const mensajeBase = `Se registró una ${
        esRect ? 'rectificación' : 'evaluación inicial'
      } para el incidente ${payload.datos.codigo || ''}.`;

      const toastOptions = {
        icon: 'reporte' as const,
        codeBadge: payload.datos.codigo,
        priorityBadge: payload.datos.prioridad,
        details: detallesToast,
        action: {
          label: 'Ver incidente',
          onClick: () => setIncidenteSeleccionadoIdRef.current?.(payload.datos.id),
        },
      };

      if (payload.datos.prioridad === 'CRITICA') {
        showWarning(mensajeBase, tituloToast, toastOptions);
      } else {
        showInfo(mensajeBase, tituloToast, toastOptions);
      }

      refrescarKpisRef.current?.(false);
    },
    [showInfo, showWarning]
  );

  const ultimosToastsIncidenteRef = React.useRef<Map<string, number>>(new Map());

  const esToastIncidenteDuplicado = React.useCallback((clave: string, ventanaMs = 4000): boolean => {
    const ahora = Date.now();
    const ultimaVez = ultimosToastsIncidenteRef.current.get(clave);
    if (ultimaVez && ahora - ultimaVez < ventanaMs) {
      return true;
    }
    ultimosToastsIncidenteRef.current.set(clave, ahora);
    return false;
  }, []);

  const handleIncidenteCreadoSocket = React.useCallback(
    (payload: IncidenteCreadoPayload) => {
      const { datos } = payload;
      if (!datos) return;
      if (esToastIncidenteDuplicado(`creado:${datos.id}`)) return;

      showInfo(
        `Nuevo incidente ${datos.codigo} ingresado en ${datos.direccion || 'sector sin dirección'}.`,
        'Nuevo Incidente Reportado',
        {
          icon: 'incidente',
          codeBadge: datos.codigo,
          priorityBadge: datos.prioridad,
          dedupKey: `incidente-creado:${datos.id}`,
          details: [
            { label: 'Tipología', value: datos.tipoAfectacion || 'No clasificada' },
            ...(datos.direccion ? [{ label: 'Ubicación', value: datos.direccion }] : []),
          ],
          action: {
            label: 'Ver incidente',
            onClick: () => setIncidenteSeleccionadoIdRef.current?.(datos.id),
          },
        }
      );

      refrescarKpisRef.current?.(false);
    },
    [showInfo, esToastIncidenteDuplicado]
  );

  const handleIncidenteActualizadoSocket = React.useCallback(
    (payload: IncidenteActualizadoPayload) => {
      const { datos } = payload;
      if (!datos) return;

      if (payload.esSintetico) {
        refrescarKpisRef.current?.(false);
        return;
      }

      const claveDedup = `act:${datos.id}:${datos.nuevoEstado}:${datos.tipoAfectacion || ''}`;
      if (esToastIncidenteDuplicado(claveDedup)) return;

      const esEventoTipologia = Boolean(datos.tipoAfectacion && datos.justificacion);

      if (esEventoTipologia) {
        const sinCambiosTipologia = datos.tipoAnterior
          ? !fueTipologiaModificada(datos.tipoAnterior, datos.tipoAfectacion)
          : esJustificacionSinCambios(datos.justificacion);

        showInfo(
          sinCambiosTipologia
            ? `La patrulla ratificó la tipología ${datos.tipoAfectacion} sin modificaciones.`
            : `Tipología reclasificada a ${datos.tipoAfectacion}.`,
          sinCambiosTipologia ? 'Tipología Confirmada en Terreno' : 'Reclasificación en Terreno',
          {
            icon: sinCambiosTipologia ? 'patrulla' : 'reclasificacion',
            codeBadge: datos.codigo,
            priorityBadge: datos.prioridad,
            dedupKey: claveDedup,
            details: [
              {
                label: sinCambiosTipologia ? 'Tipología constatada' : 'Nueva tipología',
                value: datos.tipoAfectacion || 'No especificada',
              },
              ...(datos.justificacion ? [{ label: 'Justificación', value: datos.justificacion }] : []),
            ],
            action: {
              label: 'Ver incidente',
              onClick: () => setIncidenteSeleccionadoIdRef.current?.(datos.id),
            },
          }
        );
      } else {
        showInfo(
          `Incidente ${datos.codigo || ''} actualizado a estado ${formatearEstado(datos.nuevoEstado)}.`,
          'Actualización de Incidente',
          {
            icon: 'incidente',
            codeBadge: datos.codigo,
            priorityBadge: datos.prioridad,
            dedupKey: claveDedup,
            action: {
              label: 'Ver incidente',
              onClick: () => setIncidenteSeleccionadoIdRef.current?.(datos.id),
            },
          }
        );
      }

      refrescarKpisRef.current?.(false);
    },
    [showInfo, esToastIncidenteDuplicado]
  );

  const cargarCuadrillas = useCallback(() => {
    let isMounted = true;
    cuadrillasService
      .obtenerCuadrillas({ pagina: 1, limite: 100 })
      .then((res) => {
        if (isMounted && res.cuadrillas) {
          setCuadrillasOperativas(res.cuadrillas);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const cargarEventosRecuperacion = useCallback(() => {
    let isMounted = true;
    listarEventosRecuperacion({ limite: 100 })
      .then((res) => {
        if (isMounted && res.data) {
          setEventosRecuperacion(res.data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const cancelCuadrillas = cargarCuadrillas();
    const cancelRecuperacion = cargarEventosRecuperacion();
    return () => {
      cancelCuadrillas?.();
      cancelRecuperacion?.();
    };
  }, [cargarCuadrillas, cargarEventosRecuperacion]);

  const {
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
    recargar,
    moverIncidenteAEstado,
    marcarIncidenteMisionDespachada,
    conectado,
    ultimoEvento,
    totalIncidentesVisibles,
    incidenteSeleccionadoId,
    setIncidenteSeleccionadoId,
    trazabilidadPorIncidente,
  } = useIncidentesKanban({
    onMisionRechazada: handleMisionRechazadaSocket,
    onReporteTerrenoRecibido: handleReporteTerrenoRecibido,
    onIncidenteCreadoSocket: handleIncidenteCreadoSocket,
    onIncidenteActualizadoSocket: handleIncidenteActualizadoSocket,
  });

  useEffect(() => {
    setIncidenteSeleccionadoIdRef.current = setIncidenteSeleccionadoId;
  }, [setIncidenteSeleccionadoId]);

  // CA-5 (BUG-H22-WEB-03): Abrir incidente automáticamente si se accede con ?incidenteId=...
  const incidenteIdParam = searchParams?.get('incidenteId');
  useEffect(() => {
    if (incidenteIdParam) {
      setIncidenteSeleccionadoId(incidenteIdParam);
    }
  }, [incidenteIdParam, setIncidenteSeleccionadoId]);

  // Actualizar cuadrillas operativas ante eventos socket en tiempo real (BUG-H22-WEB-04)
  useEffect(() => {
    if (ultimoEvento) {
      return cargarCuadrillas();
    }
  }, [ultimoEvento, cargarCuadrillas]);

  const {
    kpis,
    cargando: cargandoKpis,
    delegacionId,
    setDelegacionId,
    delegaciones,
    refrescarKpis,
    conectado: conectadoKpis,
  } = useIncidentesKpis({ userId });

  useEffect(() => {
    refrescarKpisRef.current = refrescarKpis;
  }, [refrescarKpis]);

  // Hook de tiempo real para eventos de prevención (HU-30)
  usePrevencionSocket({
    onPrevencionCreada: (nuevoEvento) => {
      setEventosPrevencion((prev) => {
        const existe = prev.some((e) => e.id === nuevoEvento.id);
        if (existe) return prev;
        return [nuevoEvento, ...prev];
      });
      showInfo(
        `Nuevo operativo preventivo registrado en ${nuevoEvento.sector || 'sector asignado'}.`,
        'Operación Preventiva en Vivo',
        {
          icon: 'operativo',
          codeBadge: nuevoEvento.codigo,
          details: [
            { label: 'Sector', value: nuevoEvento.sector || 'No especificado' },
            ...(nuevoEvento.puntoCritico?.nombre ? [{ label: 'Punto crítico', value: nuevoEvento.puntoCritico.nombre }] : []),
          ],
        }
      );
    },
  });

  // Hook de tiempo real para eventos de recuperación (HU-29 / HU-32)
  useRecuperacionSocket({
    onRecuperacionCreada: (nuevoEvento) => {
      setEventosRecuperacion((prev) => {
        const existe = prev.some((e) => e.id === nuevoEvento.id);
        if (existe) return prev;
        return [nuevoEvento, ...prev];
      });
      showInfo(
        `Nuevo operativo de recuperación en ${nuevoEvento.sector}.`,
        'Operación Territorial en Vivo',
        {
          icon: 'operativo',
          codeBadge: nuevoEvento.codigo,
          details: [
            { label: 'Sector', value: nuevoEvento.sector },
            ...(nuevoEvento.nombre ? [{ label: 'Operativo', value: nuevoEvento.nombre }] : []),
          ],
        }
      );
    },
    onRecuperacionActualizada: (payload) => {
      const obj = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null;
      const eventoObj =
        obj && 'evento' in obj && typeof obj.evento === 'object' && obj.evento !== null
          ? (obj.evento as Record<string, unknown>)
          : null;
      const dataObj =
        obj && 'data' in obj && typeof obj.data === 'object' && obj.data !== null
          ? (obj.data as Record<string, unknown>)
          : null;
      const ev = (eventoObj || dataObj || obj) as EventoRecuperacionResponse | null;
      if (ev?.id) {
        const rootMision = obj?.mision ?? (dataObj?.mision as unknown);
        const rootPatrulla = obj?.patrulla ?? (dataObj?.patrulla as unknown);
        const rootRecursos = (obj?.recursos ?? dataObj?.recursos ?? obj?.recursosAsignados) as RecursoAsignadoItem[] | undefined;

        setEventosRecuperacion((prev) =>
          prev.map((item) => {
            if (item.id !== ev.id) return item;
            const updated = { ...item, ...ev };
            if (rootMision !== undefined) {
              updated.mision = rootMision as EventoRecuperacionResponse['mision'];
            }
            if (rootPatrulla !== undefined) {
              updated.patrulla = rootPatrulla as EventoRecuperacionResponse['patrulla'];
            }
            if (rootRecursos !== undefined && Array.isArray(rootRecursos)) {
              updated.recursos = rootRecursos;
              updated.recursosAsignados = rootRecursos;
            }
            return updated;
          })
        );
      }
    },
  });

  // Lista plana de incidentes para visualizar en el mapa táctico
  const todosLosIncidentes = useMemo(() => {
    return Object.values(columnas).flat();
  }, [columnas]);

  // Manejo de cambio de delegación sincronizado entre KPIs y Kanban
  const handleDelegacionChange = (nuevaDelegacionId: string) => {
    setDelegacionId(nuevaDelegacionId);
    setFiltros({
      ...filtros,
      delegacionId: nuevaDelegacionId || undefined,
    });
  };

  // Manejo de clic en tarjeta de estado
  const handleSelectEstado = (estado: EstadoIncidente) => {
    if (estadoEnfocado === estado) {
      setEstadoEnfocado(null);
      if (filtros.estado === estado) {
        setFiltros({
          ...filtros,
          estado: 'TODOS',
        });
      }
    } else {
      setEstadoEnfocado(estado);
      if (filtros.estado && filtros.estado !== 'TODOS' && filtros.estado !== estado) {
        setFiltros({
          ...filtros,
          estado,
          soloHoy: true,
        });
      } else if (!filtros.soloHoy) {
        setFiltros({
          ...filtros,
          soloHoy: true,
        });
      }

      setTimeout(() => {
        const colEl = document.getElementById(`kanban-col-${estado}`);
        if (colEl) {
          colEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }, 50);
    }
  };

  const handleRefrescoCompleto = () => {
    refrescarKpis(true);
    recargar();
    cargarCuadrillas();
    cargarEventosRecuperacion();
  };

  const contadoresPorEstado = useMemo(() => {
    const mapa: Record<string, number> = {
      TODOS: totalIncidentesVisibles,
    };
    Object.entries(columnas).forEach(([estado, items]) => {
      mapa[estado] = items.length;
    });
    return mapa;
  }, [columnas, totalIncidentesVisibles]);

  return (
    <div className={styles.pageContainer}>
      <KanbanHeader
        totalIncidentesVisibles={totalIncidentesVisibles}
        conectado={conectado}
        userId={userId}
        setUserId={setUserId}
        onAbrirMisiones={() => setMisionesModalAbierto(true)}
        onAbrirPatrullas={() => setPatrullasModalAbierto(true)}
        onOpenCrearPrevencion={() => setModalPrevencionAbierto(true)}
        onOpenCrearRecuperacion={() => setModalRecuperacionAbierto(true)}
        puedeCrearEventoAtp={puedeCrearEventoAtp}
      />

      {esForbidden ? (
        <AccesoDenegado />
      ) : (
        <>
          <IncidentesKpiCards
            kpis={kpis}
            cargando={cargandoKpis}
            delegacionId={delegacionId}
            onDelegacionChange={handleDelegacionChange}
            delegaciones={delegaciones}
            onRefrescar={handleRefrescoCompleto}
            estadoSeleccionado={estadoEnfocado}
            onSelectEstado={handleSelectEstado}
            conectado={conectadoKpis || conectado}
          />

          <KanbanFiltros
            filtros={filtros}
            onFiltrosChange={setFiltros}
            onLimpiarFiltros={limpiarFiltros}
            onRecargar={handleRefrescoCompleto}
            contadoresPorEstado={contadoresPorEstado}
            cargando={cargando}
          />

          {/* Selector de visualización entre filtros y tablero */}
          <KanbanViewSwitcher
            vistaActiva={vistaActiva}
            onCambiarVista={setVistaActiva}
          />

          {error && !esForbidden && (
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <InlineNotice variant="error">
                {error}
              </InlineNotice>
            </div>
          )}

          {vistaActiva === 'kanban' ? (
            <main className={styles.kanbanArea}>
              <div className={styles.kanbanBoard}>
                {estadosVisibles.map((estado) => (
                  <KanbanColumn
                    key={estado}
                    id={`kanban-col-${estado}`}
                    estado={estado}
                    titulo={TITULOS_COLUMNAS[estado]}
                    incidentes={columnas[estado]}
                    paginacion={paginacionColumna[estado]}
                    cargandoMas={cargandoColumna[estado]}
                    resaltada={estadoEnfocado === estado}
                    onCargarMas={cargarMas}
                    onSeleccionarIncidente={(inc) => setIncidenteSeleccionadoId(inc.id)}
                    onAsignarPatrulla={(inc) => setIncidenteParaAsignar(inc)}
                    puedeAsignarPatrulla={puedeAsignar}
                    trazabilidadPorIncidente={trazabilidadPorIncidente}
                  />
                ))}
              </div>
            </main>
          ) : vistaActiva === 'mapa' ? (
            <main style={{ marginTop: 'var(--space-4, 16px)' }}>
              <MapaOperativoMando
                incidentes={todosLosIncidentes}
                eventosPrevencion={eventosPrevencion}
                eventosRecuperacion={eventosRecuperacion}
                cuadrillas={cuadrillasOperativas}
                onSelectIncidente={(incId) => setIncidenteSeleccionadoId(incId)}
                onSelectCuadrilla={(cuadrillaId) => setCuadrillaSeleccionadaId(cuadrillaId)}
                onCrearPrevencion={() => setModalPrevencionAbierto(true)}
                onCrearRecuperacion={() => setModalRecuperacionAbierto(true)}
              />
            </main>
          ) : (
            <main style={{ marginTop: 'var(--space-4, 16px)' }}>
              <EventosPrevencionView
                onAbrirCrearPrevencion={() => setModalPrevencionAbierto(true)}
              />
            </main>
          )}

          <IncidenteDetalleDrawer
            incidenteId={incidenteSeleccionadoId}
            incidenteCodigo={
              todosLosIncidentes.find((i) => i.id === incidenteSeleccionadoId)?.codigo ?? null
            }
            userId={userId}
            onCerrar={() => setIncidenteSeleccionadoId(null)}
            onSelectCuadrilla={(cuadrillaId) => setCuadrillaSeleccionadaId(cuadrillaId)}
            onIncidenteActualizado={(incId, nuevoEstado) => {
              if (incId && nuevoEstado) {
                if (nuevoEstado === 'REPORTADO') {
                  marcarIncidenteMisionDespachada(incId, true);
                } else {
                  moverIncidenteAEstado(incId, nuevoEstado);
                }
              }
              recargar();
              refrescarKpis();
              cargarCuadrillas();
            }}
          />

          {/* Modal de Asignación de Patrulla desde tarjeta Kanban */}
          <AsignarPatrullaModal
            isOpen={!!incidenteParaAsignar}
            onClose={() => setIncidenteParaAsignar(null)}
            incidente={incidenteParaAsignar}
            userId={userId}
            onAsignacionExitosa={(data) => {
              const estadoInicial = extraerEstadoInicialNotificacion(data);
              setTrazabilidadEstado(data.mision.id, estadoInicial, data.incidente.id);
              marcarIncidenteMisionDespachada(data.incidente.id, true);
              recargar();
              refrescarKpis();
              cargarCuadrillas();
              setIncidenteParaAsignar(null);
            }}
          />

          <MisionesModal
            isOpen={misionesModalAbierto}
            onClose={() => setMisionesModalAbierto(false)}
            userId={userId}
          />

          <PanelPatrullasModal
            isOpen={patrullasModalAbierto}
            onClose={() => setPatrullasModalAbierto(false)}
            userId={userId}
            onSelectMision={(misionId) => {
              setMisionSeleccionadaId(misionId);
              setMisionesModalAbierto(true);
            }}
            onSelectIncidente={(incidenteId) => {
              setIncidenteSeleccionadoId(incidenteId);
            }}
          />

          <MisionDetalleModal
            misionId={misionSeleccionadaId}
            onCerrar={() => setMisionSeleccionadaId(null)}
            userId={userId}
          />

          <ModalCrearEventoPrevencion
            isOpen={modalPrevencionAbierto}
            onClose={() => setModalPrevencionAbierto(false)}
            userId={userId}
            onSuccess={(eventoCreado) => {
              setEventosPrevencion((prev) => [eventoCreado, ...prev]);
              handleRefrescoCompleto();
            }}
          />

          <ModalCrearEventoRecuperacion
            isOpen={modalRecuperacionAbierto}
            onClose={() => setModalRecuperacionAbierto(false)}
            userId={userId}
            onSuccess={(eventoCreado) => {
              setEventosRecuperacion((prev) => [eventoCreado, ...prev]);
              setVistaActiva('mapa');
              handleRefrescoCompleto();
            }}
          />

          {/* Drawer de Detalle y Composición de Cuadrilla (HU-22) */}
          <CuadrillaDetalleDrawer
            cuadrillaId={cuadrillaSeleccionadaId}
            isOpen={Boolean(cuadrillaSeleccionadaId)}
            onCerrar={() => setCuadrillaSeleccionadaId(null)}
            onSelectIncidente={(incId) => {
              setCuadrillaSeleccionadaId(null);
              setIncidenteSeleccionadoId(incId);
            }}
            puedeEditar={false}
            puedeEliminar={false}
          />
        </>
      )}
    </div>
  );
};
