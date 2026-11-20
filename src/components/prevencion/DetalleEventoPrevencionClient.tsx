'use client';

import React, { useState, useEffect, useMemo, useCallback, useContext, useRef } from 'react';
import Link from 'next/link';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import InlineNotice from '@/components/ui/InlineNotice';
import { useToast } from '@/components/ui/Toast';
import LocationPickerMap from '@/components/maps/LocationPickerMap';
import { BuscadorRecursosSelect } from '@/components/common/BuscadorRecursosSelect';
import { usePuedeAsignarMision } from '@/hooks/usePuedeAsignarMision';
import { usePrevencionSocket } from '@/hooks/usePrevencionSocket';
import { AuthContext } from '@/context/AuthContext';
import { SimulatedSessionContext } from '@/context/SimulatedSessionContext';
import {
  obtenerEventoPrevencion,
  asignarRecursosPrevencion,
  PrevencionServiceError,
} from '@/services/prevencionService';
import { patrullasService, DEFAULT_ENCARGADO_ID } from '@/services/patrullasService';
import { getRecursos } from '@/services/recursosService';
import { formatearEstado, formatearTipoMision } from '@/lib/utils/estadoUtils';
import {
  ESTADOS_PREVENCION,
  type DetalleEventoPrevencionResponse,
  type MisionPrevencionHistorialItem,
} from '@/types/evento-prevencion';
import type { PatrullaVerificadoraDTO } from '@/types/patrullas';
import type { RecursoItem } from '@/types/recurso';
import {
  ArrowLeft,
  ShieldAlert,
  MapPin,
  Truck,
  Users,
  Boxes,
  PackagePlus,
  Trash2,
  Plus,
  AlertTriangle,
  Send,
  Loader2,
} from 'lucide-react';
import styles from './DetalleEventoPrevencion.module.css';

interface FilaRecursoAsignar {
  idTemporal: string;
  recursoId: string;
  cantidad: number;
}

export interface DetalleEventoPrevencionClientProps {
  id: string;
  userId?: string;
}

function formatearFecha(fechaIso?: string | null): string {
  if (!fechaIso) return 'No especificada';
  try {
    const fecha = new Date(fechaIso);
    if (Number.isNaN(fecha.getTime())) return fechaIso;
    return new Intl.DateTimeFormat('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(fecha);
  } catch {
    return fechaIso;
  }
}

export const DetalleEventoPrevencionClient: React.FC<DetalleEventoPrevencionClientProps> = ({
  id,
  userId: propUserId,
}) => {
  const { showSuccess, showError, showInfo } = useToast();
  const auth = useContext(AuthContext);
  const session = useContext(SimulatedSessionContext);
  const userId = propUserId || auth?.usuario?.id || session?.usuarioActivo?.id || DEFAULT_ENCARGADO_ID;
  const puedeAsignar = usePuedeAsignarMision();

  // Estados del evento principal
  const [evento, setEvento] = useState<DetalleEventoPrevencionResponse | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Estados para dotación e inventario disponible
  const [patrullas, setPatrullas] = useState<PatrullaVerificadoraDTO[]>([]);
  const [inventario, setInventario] = useState<RecursoItem[]>([]);

  // Formulario de asignación
  const [patrullaId, setPatrullaId] = useState<string>('');
  const [filasRecursos, setFilasRecursos] = useState<FilaRecursoAsignar[]>([
    { idTemporal: 'recurso-1', recursoId: '', cantidad: 1 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [bannerConflicto, setBannerConflicto] = useState<string | null>(null);

  const recursoDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ultimoEnvioPropioRef = useRef<number>(0);

  // Carga/refresco del detalle del evento de prevención
  const cargarDetalleEvento = useCallback(async () => {
    try {
      const data = await obtenerEventoPrevencion(id);
      setEvento(data);
      setErrorCarga(null);
    } catch (err: unknown) {
      if (err instanceof PrevencionServiceError) {
        setErrorCarga(err.message);
      } else {
        setErrorCarga('No fue posible cargar el detalle del evento de prevención.');
      }
    }
  }, [id]);

  // Carga/refresco de patrullas disponibles e inventario logístico
  const cargarCatalogosOperativos = useCallback(async () => {
    try {
      const [resPatrullas, resRecursos] = await Promise.all([
        patrullasService.listar({ estado: 'DISPONIBLE', limit: 100 }, userId),
        getRecursos({ limite: 100, pagina: 1 }, userId),
      ]);

      if (resPatrullas && !resPatrullas.exito) {
        showError(resPatrullas.mensaje || 'Error al consultar la disponibilidad de patrullas verificadoras.');
      }

      setPatrullas(resPatrullas?.data || []);
      setInventario(resRecursos?.data || []);
    } catch {
      // Fallback silencioso para no bloquear la vista de lectura
    }
  }, [userId, showError]);

  useEffect(() => {
    let isMounted = true;

    const inicializar = async () => {
      try {
        const [data, resPatrullas, resRecursos] = await Promise.all([
          obtenerEventoPrevencion(id),
          patrullasService.listar({ estado: 'DISPONIBLE', limit: 100 }, userId),
          getRecursos({ limite: 100, pagina: 1 }, userId),
        ]);

        if (!isMounted) return;
        if (resPatrullas && !resPatrullas.exito) {
          showError(resPatrullas.mensaje || 'Error al consultar la disponibilidad de patrullas verificadoras.');
        }

        setEvento(data);
        setPatrullas(resPatrullas?.data || []);
        setInventario(resRecursos?.data || []);
        setErrorCarga(null);
      } catch (err: unknown) {
        if (!isMounted) return;
        if (err instanceof PrevencionServiceError) {
          setErrorCarga(err.message);
        } else {
          setErrorCarga('No fue posible cargar el detalle del evento de prevención.');
        }
      } finally {
        if (isMounted) {
          setCargando(false);
        }
      }
    };

    void inicializar();

    return () => {
      isMounted = false;
      if (recursoDebounceRef.current) {
        clearTimeout(recursoDebounceRef.current);
      }
    };
  }, [id, userId, showError]);

  // Sincronización en tiempo real vía WebSockets (HU-33)
  usePrevencionSocket({
    eventoId: id,
    onPrevencionActualizada: () => {
      void cargarDetalleEvento();
      void cargarCatalogosOperativos();
      if (Date.now() - ultimoEnvioPropioRef.current > 2000) {
        showInfo('El evento de prevención fue actualizado en vivo con una nueva asignación.');
      }
    },
    onRecursoActualizado: () => {
      if (recursoDebounceRef.current) {
        clearTimeout(recursoDebounceRef.current);
      }
      recursoDebounceRef.current = setTimeout(() => {
        void cargarCatalogosOperativos();
      }, 300);
    },
    onPatrullaActualizada: () => {
      void cargarCatalogosOperativos();
    },
  });

  // Filtrar solo patrullas en estado DISPONIBLE deduplicadas por ID
  const patrullasDisponibles = useMemo(() => {
    const unicas = new Map<string, PatrullaVerificadoraDTO>();
    for (const p of patrullas) {
      if (p?.id && p.estado === 'DISPONIBLE' && !unicas.has(p.id)) {
        unicas.set(p.id, p);
      }
    }
    return Array.from(unicas.values());
  }, [patrullas]);

  // Mapeo rápido de inventario por ID para cálculos de stock
  const inventarioMap = useMemo(() => {
    const map = new Map<string, RecursoItem>();
    for (const item of inventario) {
      map.set(item.id, item);
    }
    return map;
  }, [inventario]);

  // Manejo de filas dinámicas de recursos
  const handleAgregarFila = () => {
    setFilasRecursos((prev) => [
      ...prev,
      {
        idTemporal: `recurso-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        recursoId: '',
        cantidad: 1,
      },
    ]);
  };

  const handleEliminarFila = (idTemporal: string) => {
    if (filasRecursos.length <= 1) return;
    setFilasRecursos((prev) => prev.filter((f) => f.idTemporal !== idTemporal));
  };

  const handleCambiarRecurso = (idTemporal: string, nuevoRecursoId: string) => {
    setFilasRecursos((prev) =>
      prev.map((f) => {
        if (f.idTemporal !== idTemporal) return f;
        return {
          ...f,
          recursoId: nuevoRecursoId,
          cantidad: 1,
        };
      })
    );
    setBannerConflicto(null);
    setErrorForm(null);
  };

  const handleCambiarCantidad = (idTemporal: string, cantidadTexto: string) => {
    const val = parseInt(cantidadTexto, 10);
    const cantValida = Number.isNaN(val) || val < 1 ? 1 : val;

    setFilasRecursos((prev) =>
      prev.map((f) => {
        if (f.idTemporal !== idTemporal) return f;
        const item = inventarioMap.get(f.recursoId);
        if (item?.esIndividual) {
          return { ...f, cantidad: 1 };
        }
        return { ...f, cantidad: cantValida };
      })
    );
    setBannerConflicto(null);
    setErrorForm(null);
  };

  // Pre-validaciones UX del formulario (fuente de verdad en sgrai-api con FOR UPDATE §3.6)
  const calcularValidacionFormulario = (): { valido: boolean; mensaje: string | null } => {
    if (!patrullaId) {
      return { valido: false, mensaje: 'Selecciona una patrulla verificadora disponible' };
    }

    const recursosSeleccionados = filasRecursos.filter((f) => f.recursoId.trim() !== '');
    if (recursosSeleccionados.length === 0) {
      return { valido: false, mensaje: 'Debes agregar al menos un insumo o herramienta a despachar' };
    }

    const ids = new Set<string>();
    for (const fila of recursosSeleccionados) {
      if (ids.has(fila.recursoId)) {
        return {
          valido: false,
          mensaje: 'No puedes agregar el mismo insumo más de una vez en el despacho',
        };
      }
      ids.add(fila.recursoId);

      const recursoInfo = inventarioMap.get(fila.recursoId);
      if (!recursoInfo) continue;

      if (recursoInfo.esIndividual) {
        if (
          recursoInfo.estado === 'EN_MANTENCION' ||
          recursoInfo.estado === 'NO_DISPONIBLE' ||
          recursoInfo.estado === 'ASIGNADO'
        ) {
          return {
            valido: false,
            mensaje: `El activo individual "${recursoInfo.nombre}" no está disponible, se encuentra asignado o en mantención`,
          };
        }
        if (fila.cantidad !== 1) {
          return { valido: false, mensaje: 'Los activos individuales solo admiten 1 unidad' };
        }
      } else {
        const stockVisible = recursoInfo.cantidadInventario - recursoInfo.cantidadEnUso;
        if (fila.cantidad > stockVisible) {
          return {
            valido: false,
            mensaje: `La cantidad solicitada para "${recursoInfo.nombre}" (${fila.cantidad}) supera el stock disponible en bodega (${stockVisible})`,
          };
        }
      }
    }

    return { valido: true, mensaje: null };
  };

  const validacionFormulario = calcularValidacionFormulario();

  // Envío de asignación preventiva (POST /api/eventos-atp/prevencion/{id}/recursos)
  const handleSubmitAsignar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validacionFormulario.valido || !evento) return;

    setErrorForm(null);
    setBannerConflicto(null);
    setIsSubmitting(true);
    ultimoEnvioPropioRef.current = Date.now();

    try {
      const payload = {
        patrullaId,
        recursos: filasRecursos
          .filter((f) => f.recursoId.trim() !== '')
          .map((f) => ({
            recursoId: f.recursoId,
            cantidad: f.cantidad,
          })),
      };

      const respuesta = await asignarRecursosPrevencion(evento.id, payload);
      const codigoMision = respuesta.data?.mision?.codigo || 'MIS-OK';
      const nombrePatrulla = respuesta.data?.patrulla?.nombre || 'Patrulla';

      showSuccess(
        `Misión de prevención despachada exitosamente: ${codigoMision} (${nombrePatrulla} → En prevención)`
      );

      // Reiniciar formulario
      setPatrullaId('');
      setFilasRecursos([{ idTemporal: 'recurso-1', recursoId: '', cantidad: 1 }]);

      // Refrescar ficha e inventario/patrullas
      await Promise.all([cargarDetalleEvento(), cargarCatalogosOperativos()]);
    } catch (err: unknown) {
      if (err instanceof PrevencionServiceError) {
        if (err.statusCode === 409) {
          if (err.tipoConflicto === 'STOCK_INSUFICIENTE') {
            setBannerConflicto(
              'El stock en bodega cambió concurrentemente. Por favor actualiza la lista de insumos.'
            );
            showError('Stock insuficiente en bodega para los insumos solicitados.');
          } else if (err.tipoConflicto === 'PATRULLA_OCUPADA') {
            setBannerConflicto('La patrulla verificadora seleccionada ya no se encuentra disponible.');
            showError('La patrulla fue tomada por otra misión en terreno.');
          } else if (err.tipoConflicto === 'ACTIVO_NO_DISPONIBLE') {
            setBannerConflicto(
              'El activo individual seleccionado no está disponible, se encuentra asignado o en mantención.'
            );
            showError('Activo individual no apto para despacho operativo.');
          } else if (err.tipoConflicto === 'EVENTO_CERRADO') {
            setBannerConflicto(
              'No se pueden asignar misiones ni recursos a un evento de prevención cerrado o inactivo.'
            );
            showError('Evento de prevención completado, cancelado o inactivo.');
            void cargarDetalleEvento();
          } else {
            setBannerConflicto(err.message);
            showError(err.message);
          }
          void cargarCatalogosOperativos();
        } else if (err.statusCode === 403) {
          setErrorForm('No cuentas con el permiso institucional requerido (misiones:asignar).');
          showError('Permisos insuficientes para despachar misiones preventivas.');
        } else {
          setErrorForm(err.message);
          showError(err.message);
        }
      } else {
        setErrorForm('Ocurrió un error inesperado al procesar la asignación preventiva.');
        showError('Error de comunicación con el servidor.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cargando) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingBox}>
          <Loader2 size={36} className="animate-spin" color="var(--color-primary-teal, #1B6F7D)" />
          <p>Cargando información consolidada del evento de prevención...</p>
        </div>
      </div>
    );
  }

  if (errorCarga || !evento) {
    return (
      <div className={styles.container}>
        <div className={styles.topBar}>
          <Link href="/gestion/centro-incidentes?tab=prevencion" className={styles.backLink}>
            <ArrowLeft size={16} /> Volver a Eventos de Prevención
          </Link>
        </div>
        <div className={styles.errorBox}>
          <AlertTriangle size={36} color="var(--color-danger, #D32F2F)" />
          <Heading as="h2" variant="h3" color="charcoal-dark">
            No se pudo cargar el evento de prevención
          </Heading>
          <p>{errorCarga || 'El evento solicitado no existe o no se encuentra disponible.'}</p>
          <Button variant="outline" href="/gestion/centro-incidentes?tab=prevencion">
            Regresar a Eventos de Prevención
          </Button>
        </div>
      </div>
    );
  }

  const estaCerrado = evento.estado === 'COMPLETADA' || evento.estado === 'CANCELADA';
  const estadoCfg = ESTADOS_PREVENCION.find((e) => e.valor === evento.estado);
  const labelEstado = estadoCfg?.label || formatearEstado(evento.estado);
  const todosRecursos = evento.recursosAsignados || evento.recursos || [];

  return (
    <div className={styles.container}>
      {/* Barra superior de navegación y título */}
      <div className={styles.topBar}>
        <Link href="/gestion/centro-incidentes?tab=prevencion" className={styles.backLink}>
          <ArrowLeft size={16} /> Volver a Eventos de Prevención
        </Link>
        <div className={styles.headerTitleRow}>
          <div>
            <div className={styles.badgesRow}>
              <span className={styles.codigoBadge}>{evento.codigo}</span>
              <span className={`${styles.badgePrioridad} ${styles[`prioridad${evento.prioridad}`]}`}>
                Prioridad {evento.prioridad}
              </span>
              <span className={`${styles.badgeEstado} ${styles[`estado${evento.estado}`]}`}>
                <span
                  className={styles.badgeDot}
                  style={{ backgroundColor: estadoCfg?.color || 'currentColor' }}
                  aria-hidden="true"
                />
                {labelEstado}
              </span>
            </div>
            <Heading as="h1" variant="h2" color="teal">
              {evento.nombre}
            </Heading>
          </div>
        </div>
      </div>

      {/* Grid Principal: Ficha a la izquierda, Asignación a la derecha */}
      <div className={styles.mainGrid}>
        {/* Columna Izquierda: Contexto Preventivo, Punto Crítico y Visor PostGIS */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderTitle}>
              <ShieldAlert size={20} color="var(--color-primary-teal, #1B6F7D)" />
              <Heading as="h2" variant="h4" color="teal">
                Contexto Preventivo y Punto Crítico
              </Heading>
            </div>
          </div>

          {evento.puntoCritico ? (
            <div className={styles.puntoCriticoBox}>
              <div className={styles.puntoCriticoHeader}>
                <strong style={{ color: '#92400E', fontSize: '14px' }}>
                  {evento.puntoCritico.nombre}
                </strong>
                <span className={styles.puntoCriticoCodigo}>{evento.puntoCritico.codigo}</span>
              </div>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Tipo de Riesgo</span>
                  <span className={styles.infoValue}>
                    {evento.puntoCritico.tipoRiesgo || 'No especificado'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Prioridad del Punto</span>
                  <span className={styles.infoValue}>
                    {evento.puntoCritico.prioridad || 'Media'}
                  </span>
                </div>
              </div>
              {evento.puntoCritico.descripcion && (
                <div style={{ fontSize: '13px', color: 'var(--color-text-dark, #2B2B2B)' }}>
                  <strong>Vulnerabilidad:</strong> {evento.puntoCritico.descripcion}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.alertaFallback}>
              <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                <strong>Evento con coordenadas libres:</strong> Esta operación preventiva se
                planificó directamente en terreno sin punto crítico formal asociado.
              </span>
            </div>
          )}

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Sector / Localidad</span>
              <span className={styles.infoValue}>{evento.sector || 'No especificado'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Delegación Municipal</span>
              <span className={styles.infoValue}>{evento.delegacion?.nombre || 'Central Valdivia'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Dirección de Referencia</span>
              <span className={styles.infoValue}>{evento.direccionTexto || 'No especificada'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Fecha Estimada de Fin</span>
              <span className={styles.infoValue}>{formatearFecha(evento.fechaEstimadaFin)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Coordenadas (EPSG:4326)</span>
              <span className={styles.infoValue}>
                {evento.latitud.toFixed(4)}, {evento.longitud.toFixed(4)}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Geometría PostGIS</span>
              <span className={styles.infoValue}>
                {evento.ubicacionGeoJson?.type || 'Point'} WGS84
              </span>
            </div>
          </div>

          {evento.descripcion && (
            <div className={styles.descripcionBox}>
              <strong>Instrucciones de Mitigación:</strong>
              <p style={{ margin: '4px 0 0 0' }}>{evento.descripcion}</p>
            </div>
          )}

          {/* Visor cartográfico Leaflet de solo lectura */}
          <div className={styles.mapContainer}>
            <LocationPickerMap
              latitud={evento.latitud}
              longitud={evento.longitud}
              readOnly={true}
              height="240px"
              ariaLabel={`Ubicación del evento de prevención ${evento.codigo}`}
            />
          </div>
        </div>

        {/* Columna Derecha: Panel de Asignación de Patrullas y Recursos */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderTitle}>
              <PackagePlus size={20} color="var(--color-primary-teal, #1B6F7D)" />
              <Heading as="h2" variant="h4" color="teal">
                Asignar Patrulla y Recursos Preventivos
              </Heading>
            </div>
          </div>

          {estaCerrado ? (
            <InlineNotice variant="info">
              Este evento de prevención se encuentra en estado <strong>{formatearEstado(evento.estado)}</strong>. No es
              posible asignar nuevas patrullas ni materiales a una operación cerrada.
            </InlineNotice>
          ) : !puedeAsignar ? (
            <InlineNotice variant="warning">
              Se requiere el permiso institucional <strong>misiones:asignar</strong> para despachar
              patrullas y asignar recursos logísticos a eventos de prevención.
            </InlineNotice>
          ) : (
            <form onSubmit={handleSubmitAsignar} className={styles.formSection}>
              {bannerConflicto && (
                <InlineNotice variant="error">
                  <strong>Conflicto de asignación:</strong> {bannerConflicto}
                </InlineNotice>
              )}

              {errorForm && <InlineNotice variant="error">{errorForm}</InlineNotice>}

              {/* Selector de Patrulla Verificadora */}
              <div className={styles.fieldGroup}>
                <label htmlFor="selector-patrulla" className={styles.label}>
                  Patrulla Verificadora Disponible (*)
                </label>
                <Select
                  id="selector-patrulla"
                  value={patrullaId}
                  onChange={(e) => {
                    setPatrullaId(e.target.value);
                    setBannerConflicto(null);
                    setErrorForm(null);
                  }}
                  disabled={isSubmitting}
                  required
                >
                  <option value="">-- Seleccionar Patrulla Verificadora --</option>
                  {patrullasDisponibles.map((p) => {
                    const nombreDelegacion = p.delegacion?.nombre || 'Valdivia';
                    return (
                      <option key={p.id} value={p.id}>
                        {p.nombre} ({nombreDelegacion})
                      </option>
                    );
                  })}
                </Select>
                {patrullasDisponibles.length === 0 && (
                  <p style={{ color: 'var(--color-warning, #E65100)', fontSize: '12px', margin: 0 }}>
                    No hay patrullas verificadoras con disponibilidad en terreno actualmente.
                  </p>
                )}
              </div>

              {/* Tabla Dinámica de Insumos Logísticos */}
              <div className={styles.fieldGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className={styles.label}>Materiales e Insumos Logísticos (*)</label>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted, #5F676E)' }}>
                    Control de disponibilidad en bodega
                  </span>
                </div>

                <div className={styles.recursosTableContainer}>
                  <table className={styles.recursosTable}>
                    <thead>
                      <tr>
                        <th style={{ width: '55%' }}>Insumo o Equipamiento</th>
                        <th style={{ width: '25%' }}>Stock Bodega</th>
                        <th style={{ width: '15%' }}>Cantidad</th>
                        <th style={{ width: '5%' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filasRecursos.map((fila) => {
                        const recursoSeleccionado = inventarioMap.get(fila.recursoId);
                        const stockVisible = recursoSeleccionado
                          ? recursoSeleccionado.cantidadInventario - recursoSeleccionado.cantidadEnUso
                          : 0;
                        const esIndividual = Boolean(recursoSeleccionado?.esIndividual);

                        return (
                          <tr key={fila.idTemporal} className={styles.filaRecurso}>
                            <td>
                              <BuscadorRecursosSelect
                                recursos={inventario}
                                value={fila.recursoId}
                                onChange={(nuevoId) => handleCambiarRecurso(fila.idTemporal, nuevoId)}
                                disabled={isSubmitting}
                                placeholder="Buscar insumo (ej: sacos de arena, motobomba)..."
                                ariaLabel="Buscar o seleccionar insumo del inventario"
                              />
                            </td>
                            <td>
                              {recursoSeleccionado ? (
                                esIndividual ? (
                                  <span className={styles.recursoIndividualTag}>1 Activo</span>
                                ) : (
                                  <span
                                    className={`${styles.stockBadge} ${
                                      stockVisible <= 5 ? styles.stockWarning : ''
                                    }`}
                                  >
                                    {stockVisible} disponibles
                                  </span>
                                )
                              ) : (
                                <span style={{ color: 'var(--color-text-muted, #5F676E)', fontSize: '12px' }}>
                                  —
                                </span>
                              )}
                            </td>
                            <td>
                              <Input
                                type="number"
                                min={1}
                                max={esIndividual ? 1 : Math.max(1, stockVisible)}
                                value={fila.cantidad}
                                onChange={(e) => handleCambiarCantidad(fila.idTemporal, e.target.value)}
                                disabled={isSubmitting || esIndividual || !fila.recursoId}
                                aria-label={`Cantidad para ${recursoSeleccionado?.nombre || 'insumo'}`}
                                style={{ width: '70px', padding: '6px', textAlign: 'center' }}
                              />
                              {fila.recursoId && !esIndividual && fila.cantidad > stockVisible && (
                                <span
                                  style={{
                                    color: 'var(--color-danger, #D32F2F)',
                                    fontSize: '11px',
                                    display: 'block',
                                    marginTop: '2px',
                                  }}
                                >
                                  Supera el stock disponible en bodega (máx. {stockVisible})
                                </span>
                              )}
                            </td>
                            <td>
                              <button
                                type="button"
                                className={styles.btnEliminarFila}
                                onClick={() => handleEliminarFila(fila.idTemporal)}
                                disabled={filasRecursos.length <= 1 || isSubmitting}
                                title="Eliminar insumo"
                                aria-label="Eliminar insumo"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className={styles.tableActionsRow}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAgregarFila}
                    disabled={isSubmitting}
                  >
                    <Plus size={14} style={{ marginRight: '4px' }} /> Agregar Otro Insumo
                  </Button>
                </div>
              </div>

              {/* Botón de Confirmar Despacho */}
              <div className={styles.confirmActionsRow}>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!validacionFormulario.valido || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" style={{ marginRight: '6px' }} />
                      Despachando Patrulla...
                    </>
                  ) : (
                    <>
                      <Send size={16} style={{ marginRight: '6px' }} />
                      Confirmar y Despachar Misión Preventiva
                    </>
                  )}
                </Button>
              </div>

              {!validacionFormulario.valido && validacionFormulario.mensaje && (
                <p style={{ color: 'var(--color-danger, #D32F2F)', fontSize: '12px', margin: '4px 0 0 0' }}>
                  * {validacionFormulario.mensaje}
                </p>
              )}
            </form>
          )}
        </div>

        {/* Sección Inferior: Historial Consolidado de Misiones y Recursos */}
        <div className={styles.historyCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderTitle}>
              <Truck size={20} color="var(--color-primary-teal, #1B6F7D)" />
              <Heading as="h2" variant="h4" color="teal">
                Historial de Misiones Preventivas y Recursos Asignados
              </Heading>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted, #5F676E)' }}>
              Total: {evento.misiones?.length || 0} misión(es)
            </span>
          </div>

          {!evento.misiones || evento.misiones.length === 0 ? (
            <div className={styles.emptyHistory}>
              <Boxes size={32} style={{ margin: '0 auto 8px auto', display: 'block', opacity: 0.5 }} />
              No se han despachado patrullas ni asignado materiales preventivos previamente para este evento.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(evento.misiones || []).map((mision: MisionPrevencionHistorialItem) => {
                const recursosDeEstaMision = todosRecursos.filter((rec) => rec.misionId === mision.id);
                const recursosAMostrar =
                  recursosDeEstaMision.length > 0 ? recursosDeEstaMision : mision.recursos || [];

                return (
                  <div key={mision.id} className={styles.misionItem}>
                    <div className={styles.misionHeader}>
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <span className={styles.misionCodigo}>{mision.codigo}</span>
                        <span style={{ color: '#CCD2D9' }}>|</span>
                        <strong>{mision.titulo || 'Operación preventiva en terreno'}</strong>
                        <span className={styles.misionTipoBadge}>
                          {formatearTipoMision(mision.tipoMision)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {mision.patrulla ? (
                          <span className={styles.misionUnidad}>
                            <Truck size={14} color="var(--color-primary-teal, #1B6F7D)" />
                            {mision.patrulla.nombre} ({formatearEstado(mision.patrulla.estado)})
                          </span>
                        ) : mision.cuadrilla ? (
                          <span className={styles.misionUnidad}>
                            <Users size={14} color="var(--color-primary-teal, #1B6F7D)" />
                            {mision.cuadrilla.nombre} ({formatearEstado(mision.cuadrilla.estado)})
                          </span>
                        ) : (
                          <span className={styles.misionUnidad}>Unidad no especificada</span>
                        )}
                        <span className={styles.misionEstadoBadge}>
                          {formatearEstado(mision.estado)}
                        </span>
                      </div>
                    </div>

                    {recursosAMostrar.length > 0 && (
                      <div>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: 'var(--color-text-muted, #5F676E)',
                            display: 'block',
                            marginBottom: '6px',
                          }}
                        >
                          Materiales y equipamiento entregado:
                        </span>
                        <div className={styles.misionRecursosList}>
                          {recursosAMostrar.map((rec, i) => (
                            <span key={`${mision.id}-${rec.recursoId}-${i}`} className={styles.misionRecursoChip}>
                              <Boxes size={12} color="var(--color-primary-teal, #1B6F7D)" />
                              <strong>{rec.nombre}</strong>: {rec.cantidadAsignada} un.
                              {rec.esIndividual && <span className={styles.recursoIndividualTag}>Activo</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetalleEventoPrevencionClient;
