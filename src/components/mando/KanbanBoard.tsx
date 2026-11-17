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
import type { EventoRecuperacionResponse } from '@/types/recuperacion';
import {
  MisionRechazadaPayload,
  IncidenteActualizadoPayload,
  IncidenteCreadoPayload,
} from '@/hooks/useEncargadoKanbanSocket';
import {
  esJustificacionSinCambios,
  esReporteVerificacionCierre,
  formatearDictamenTerreno,
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
import { KanbanViewSwitcher } from './KanbanViewSwitcher';
import CuadrillaDetalleDrawer from '@/components/admin/cuadrillas/CuadrillaDetalleDrawer';
import { cuadrillasService } from '@/services/cuadrillasService';
import type { CuadrillaItem } from '@/types/cuadrilla';
import { Zap } from 'lucide-react';
import { usePuedeAsignarMision } from '@/hooks/usePuedeAsignarMision';
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
  const [vistaActiva, setVistaActiva] = useState<'kanban' | 'mapa'>('kanban');
  const [misionesModalAbierto, setMisionesModalAbierto] = useState(false);
  const [patrullasModalAbierto, setPatrullasModalAbierto] = useState(false);
  const [misionSeleccionadaId, setMisionSeleccionadaId] = useState<string | null>(null);
  const [modalPrevencionAbierto, setModalPrevencionAbierto] = useState(false);
  const [modalRecuperacionAbierto, setModalRecuperacionAbierto] = useState(false);
  const [eventosPrevencion, setEventosPrevencion] = useState<EventoPrevencionDTO[]>([]);
  const [eventosRecuperacion, setEventosRecuperacion] = useState<EventoRecuperacionResponse[]>([]);
  const [cuadrillaSeleccionadaId, setCuadrillaSeleccionadaId] = useState<string | null>(null);
  const [cuadrillasOperativas, setCuadrillasOperativas] = useState<CuadrillaItem[]>([]);
  const [incidenteParaAsignar, setIncidenteParaAsignar] = useState<IncidenteResumen | null>(null);
  const puedeAsignar = usePuedeAsignarMision();

  const refrescarKpisRef = React.useRef<(silent?: boolean) => void>(() => {});
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
                onClick: () => setIncidenteSeleccionadoId(payload.incidenteId!),
              }
            : undefined,
        }
      );

      refrescarKpisRef.current(false);
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
      const esCierre =
        esReporteVerificacionCierre(rep) ||
        payload.datos.nuevoEstado === 'NO_ABORDABLE' ||
        Boolean(payload.datos.dictamen);
      const dictamenCierre =
        payload.datos.dictamen ??
        rep.dictamen ??
        (payload.datos.nuevoEstado === 'NO_ABORDABLE' ? 'NO_ABORDABLE' : 'REQUIERE_CUADRILLA');

      const prioridadTexto = formatearPrioridad(payload.datos.prioridad);
      const tituloToast = esCierre
        ? dictamenCierre === 'NO_ABORDABLE'
          ? 'Incidente Declarado No Abordable'
          : 'Informe de Verificación y Cierre'
        : esRect
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

      if (esCierre) {
        detallesToast.push({
          label: 'Dictamen',
          value: formatearDictamenTerreno(dictamenCierre),
        });
        const motivoNoAbordable =
          payload.datos.motivoNoAbordable || rep.motivoNoAbordable;
        if (dictamenCierre === 'NO_ABORDABLE' && motivoNoAbordable) {
          detallesToast.push({
            label: 'Motivo técnico',
            value: motivoNoAbordable,
          });
        }
        if (personas !== null) {
          detallesToast.push({
            label: 'Personas afectadas',
            value: `${personas} persona(s)`,
          });
        }
        const requiereFibeCierre = Boolean(
          payload.datos.requiereAsistenciaSocial ?? rep.requiereAsistenciaSocial
        );
        if (requiereFibeCierre) {
          detallesToast.push({
            label: 'Asistencia social',
            value: 'Requiere levantamiento de Ficha FIBE',
          });
        }
      } else {
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
      }

      const mensajeBase = esCierre
        ? dictamenCierre === 'NO_ABORDABLE'
          ? `La patrulla cerró el incidente ${payload.datos.codigo || ''} declarándolo No Abordable.`
          : `La patrulla finalizó la verificación en ${payload.datos.codigo || ''}. Listo para despacho de cuadrilla.`
        : `Se registró una ${
            esRect ? 'rectificación' : 'evaluación inicial'
          } para el incidente ${payload.datos.codigo || ''}.`;

      const toastOptions = {
        icon: 'reporte' as const,
        codeBadge: payload.datos.codigo,
        priorityBadge: payload.datos.prioridad,
        details: detallesToast,
        action: {
          label: 'Ver incidente',
          onClick: () => setIncidenteSeleccionadoId(payload.datos.id),
        },
      };

      if (dictamenCierre === 'NO_ABORDABLE' || payload.datos.prioridad === 'CRITICA') {
        showWarning(mensajeBase, tituloToast, toastOptions);
      } else {
        showInfo(mensajeBase, tituloToast, toastOptions);
      }

      refrescarKpisRef.current(false);
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
            onClick: () => setIncidenteSeleccionadoId(datos.id),
          },
        }
      );

      refrescarKpisRef.current(false);
    },
    [showInfo, esToastIncidenteDuplicado]
  );

  const handleIncidenteActualizadoSocket = React.useCallback(
    (payload: IncidenteActualizadoPayload) => {
      const { datos } = payload;
      if (!datos) return;

      if (payload.esSintetico) {
        refrescarKpisRef.current(false);
        return;
      }

      const claveDedup = `act:${datos.id}:${datos.nuevoEstado}:${datos.tipoAfectacion || ''}:${datos.dictamen || ''}`;
      if (esToastIncidenteDuplicado(claveDedup)) return;

      const esNoAbordable =
        datos.nuevoEstado === 'NO_ABORDABLE' || datos.dictamen === 'NO_ABORDABLE';
      const esEventoTipologia = Boolean(datos.tipoAfectacion && datos.justificacion);

      if (esNoAbordable) {
        showWarning(
          `El incidente ${datos.codigo || ''} fue declarado No Abordable en terreno.`,
          'Incidente Declarado No Abordable',
          {
            icon: 'reporte',
            codeBadge: datos.codigo,
            priorityBadge: datos.prioridad,
            dedupKey: claveDedup,
            details: [
              { label: 'Dictamen', value: 'No Abordable' },
              ...(datos.motivoNoAbordable
                ? [{ label: 'Motivo técnico', value: datos.motivoNoAbordable }]
                : []),
            ],
            action: {
              label: 'Ver incidente',
              onClick: () => setIncidenteSeleccionadoId(datos.id),
            },
          }
        );
      } else if (esEventoTipologia) {
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
              onClick: () => setIncidenteSeleccionadoId(datos.id),
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
              onClick: () => setIncidenteSeleccionadoId(datos.id),
            },
          }
        );
      }

      refrescarKpisRef.current(false);
    },
    [showInfo, showWarning, esToastIncidenteDuplicado]
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

  useEffect(() => {
    cargarCuadrillas();
  }, [cargarCuadrillas]);

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

  const [estadoEnfocado, setEstadoEnfocado] = useState<EstadoIncidente | null>(null);

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
      cargarCuadrillas();
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

  refrescarKpisRef.current = refrescarKpis;

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

  // Hook de tiempo real para eventos de recuperación (HU-29)
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
          ) : (
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
                moverIncidenteAEstado(incId, nuevoEstado);
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
