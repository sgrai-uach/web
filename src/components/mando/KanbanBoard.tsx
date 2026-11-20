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
import type {
  EventoPrevencionDTO,
  EventoPrevencionListItemDTO,
  DetalleEventoPrevencionResponse,
  RecursoAsignadoPrevencionDTO,
} from '@/types/evento-prevencion';
import type { EventoRecuperacionResponse } from '@/types/recuperacion';
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
import { listarEventosPrevencion } from '@/services/prevencionService';
import type { CuadrillaItem } from '@/types/cuadrilla';
import { Zap } from 'lucide-react';
import { usePuedeAsignarMision } from '@/hooks/usePuedeAsignarMision';
import { extraerEstadoInicialNotificacion } from '@/lib/socket/trazabilidadConfig';
import { setTrazabilidadEstado } from '@/lib/socket/trazabilidadStore';
import InlineNotice from '@/components/ui/InlineNotice';
import styles from '@/styles/mando.module.css';

const TITULOS_COLUMNAS = {
  REPORTADO: 'Pendiente / Reportado',
  VERIFICANDO: 'En Verificación',
  EN_ATENCION: 'En Atención',
  RESUELTO: 'Resuelto',
  NO_ABORDABLE: 'No Abordable',
} as const;

export const KanbanBoard: React.FC = () => {
  const { showInfo } = useToast();
  const searchParams = useSearchParams();
  const tabInicial: VistaCentroIncidentes = searchParams?.get('tab') === 'prevencion' ? 'prevencion' : 'kanban';
  const [vistaActiva, setVistaActiva] = useState<VistaCentroIncidentes>(tabInicial);
  const [misionesModalAbierto, setMisionesModalAbierto] = useState(false);
  const [patrullasModalAbierto, setPatrullasModalAbierto] = useState(false);
  const [misionSeleccionadaId, setMisionSeleccionadaId] = useState<string | null>(null);
  const [modalPrevencionAbierto, setModalPrevencionAbierto] = useState(false);
  const [modalRecuperacionAbierto, setModalRecuperacionAbierto] = useState(false);
  const [eventosPrevencion, setEventosPrevencion] = useState<
    (EventoPrevencionDTO | EventoPrevencionListItemDTO | DetalleEventoPrevencionResponse)[]
  >([]);
  const [eventosRecuperacion, setEventosRecuperacion] = useState<EventoRecuperacionResponse[]>([]);
  const [cuadrillaSeleccionadaId, setCuadrillaSeleccionadaId] = useState<string | null>(null);
  const [cuadrillasOperativas, setCuadrillasOperativas] = useState<CuadrillaItem[]>([]);
  const [incidenteParaAsignar, setIncidenteParaAsignar] = useState<IncidenteResumen | null>(null);
  const puedeAsignar = usePuedeAsignarMision();

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

  const cargarEventosPrevencion = useCallback(() => {
    let isMounted = true;
    listarEventosPrevencion({ page: 1, limit: 100 })
      .then((res) => {
        if (isMounted && res.data) {
          setEventosPrevencion(res.data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const cancelCuadrillas = cargarCuadrillas();
    const cancelPrevencion = cargarEventosPrevencion();
    return () => {
      cancelCuadrillas?.();
      cancelPrevencion?.();
    };
  }, [cargarCuadrillas, cargarEventosPrevencion]);

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
    conectado,
    ultimoEvento,
    totalIncidentesVisibles,
    incidenteSeleccionadoId,
    setIncidenteSeleccionadoId,
    trazabilidadPorIncidente,
  } = useIncidentesKanban();


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

  // Hook de tiempo real para eventos de prevención (HU-30 / HU-77 / HU-33)
  usePrevencionSocket({
    onPrevencionCreada: (nuevoEvento) => {
      setEventosPrevencion((prev) => {
        const existe = prev.some((e) => e.id === nuevoEvento.id);
        if (existe) return prev;
        return [nuevoEvento, ...prev];
      });
      showInfo(
        `Nuevo evento de prevención en ${nuevoEvento.sector || 'sector'}: ${nuevoEvento.codigo}`,
        'Operación Preventiva en Vivo'
      );
    },
    onPrevencionActualizada: (payload) => {
      const obj = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null;
      const eventoObj =
        obj && 'evento' in obj && typeof obj.evento === 'object' && obj.evento !== null
          ? (obj.evento as Partial<EventoPrevencionListItemDTO>)
          : null;
      const rawEv = (eventoObj || obj) as Partial<EventoPrevencionListItemDTO> | null;
      const evId = rawEv?.id || (obj?.id ? String(obj.id) : null);

      if (evId) {
        const rootMision = (obj?.mision ?? rawEv?.mision) as EventoPrevencionListItemDTO['mision'] | undefined;
        const rootPatrulla = (obj?.patrulla ?? rawEv?.patrulla) as EventoPrevencionListItemDTO['patrulla'] | undefined;
        const rootRecursos = (obj?.recursos ?? rawEv?.recursos) as RecursoAsignadoPrevencionDTO[] | undefined;

        const misionActualizada: EventoPrevencionListItemDTO['mision'] | undefined = rootMision
          ? {
              id: rootMision.id,
              codigo: rootMision.codigo,
              titulo: rootMision.titulo,
              estado: rootMision.estado,
              tipoMision: rootMision.tipoMision,
              fechaInicio: rootMision.fechaInicio ?? null,
              fechaCierre: rootMision.fechaCierre ?? null,
            }
          : undefined;

        setEventosPrevencion((prev) => {
          const existe = prev.some((item) => item.id === evId);
          if (!existe) {
            void cargarEventosPrevencion();
            return prev;
          }
          return prev.map((item) => {
            if (item.id !== evId) return item;
            const actualizado: EventoPrevencionListItemDTO = {
              id: item.id,
              codigo: rawEv?.codigo || item.codigo,
              nombre: rawEv?.nombre || item.nombre,
              descripcion: rawEv?.descripcion !== undefined ? rawEv.descripcion : item.descripcion,
              sector: rawEv?.sector !== undefined ? rawEv.sector : item.sector,
              direccionTexto:
                rawEv?.direccionTexto !== undefined ? rawEv.direccionTexto : item.direccionTexto,
              prioridad: rawEv?.prioridad || item.prioridad,
              estado: rawEv?.estado || item.estado,
              latitud: rawEv?.latitud ?? item.latitud,
              longitud: rawEv?.longitud ?? item.longitud,
              ubicacionGeoJson: 'ubicacionGeoJson' in item ? (item.ubicacionGeoJson ?? null) : null,
              delegacion: item.delegacion,
              puntoCritico: item.puntoCritico
                ? {
                    ...item.puntoCritico,
                    latitud: item.puntoCritico.latitud ?? item.latitud,
                    longitud: item.puntoCritico.longitud ?? item.longitud,
                  }
                : null,
              patrulla: (rootPatrulla !== undefined ? rootPatrulla : item.patrulla) ?? null,
              cuadrilla: 'cuadrilla' in item ? (item.cuadrilla ?? null) : null,
              mision:
                misionActualizada !== undefined
                  ? misionActualizada
                  : item.mision
                  ? {
                      id: item.mision.id,
                      codigo: item.mision.codigo,
                      titulo: item.mision.titulo,
                      estado: item.mision.estado,
                      tipoMision: item.mision.tipoMision,
                      fechaInicio: 'fechaInicio' in item.mision ? item.mision.fechaInicio : null,
                      fechaCierre: 'fechaCierre' in item.mision ? item.mision.fechaCierre : null,
                    }
                  : null,
              recursos: Array.isArray(rootRecursos) ? rootRecursos : item.recursos,
              fechaEstimadaFin:
                rawEv?.fechaEstimadaFin !== undefined
                  ? rawEv.fechaEstimadaFin
                  : item.fechaEstimadaFin,
              creadoPorId: item.creadoPorId,
              actualizadoPorId: item.actualizadoPorId,
              creadoEn: item.creadoEn,
              actualizadoEn: rawEv?.actualizadoEn || item.actualizadoEn,
            };
            return actualizado;
          });
        });
      }
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
        `Nuevo evento de recuperación en ${nuevoEvento.sector}: ${nuevoEvento.codigo}`,
        'Operación Territorial en Vivo'
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
    cargarEventosPrevencion();
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
          {vistaActiva !== 'prevencion' && (
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

              {ultimoEvento && (
                <div
                  style={{
                    backgroundColor: 'var(--color-info-bg, #E0F2F1)',
                    color: 'var(--color-primary-teal, #1B6F7D)',
                    padding: '0.5rem 1rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    borderBottom: '1px solid var(--border-color-neutral, #DFE3E8)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Zap size={14} color="var(--color-primary-teal, #1B6F7D)" />
                  <span>Actualización en vivo: {ultimoEvento}</span>
                </div>
              )}
            </>
          )}

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
              moverIncidenteAEstado(data.incidente.id, 'VERIFICANDO');
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
