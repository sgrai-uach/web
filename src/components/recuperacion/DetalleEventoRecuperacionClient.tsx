'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import InlineNotice from '@/components/ui/InlineNotice';
import { useToast } from '@/components/ui/Toast';
import LocationPickerMap from '@/components/maps/LocationPickerMap';
import { usePuedeAsignarMision } from '@/hooks/usePuedeAsignarMision';
import { useRecuperacionSocket } from '@/hooks/useRecuperacionSocket';
import {
  obtenerEventoRecuperacion,
  asignarRecursosRecuperacion,
  RecuperacionServiceError,
} from '@/services/recuperacionService';
import { patrullasService, DEFAULT_ENCARGADO_ID } from '@/services/patrullasService';
import { getRecursos } from '@/services/recursosService';
import type {
  DetalleEventoRecuperacionResponse,
  MisionRecuperacionItem,
} from '@/types/recuperacion';
import type { PatrullaVerificadoraDTO } from '@/types/patrullas';
import type { RecursoItem } from '@/types/recurso';
import {
  ArrowLeft,
  MapPin,
  Truck,
  Boxes,
  PackagePlus,
  Trash2,
  Plus,
  AlertTriangle,
  Send,
  Loader2,
} from 'lucide-react';
import styles from './DetalleEventoRecuperacion.module.css';

interface FilaRecursoAsignar {
  idTemporal: string;
  recursoId: string;
  cantidad: number;
}

export interface DetalleEventoRecuperacionClientProps {
  id: string;
  userId?: string;
}

export const DetalleEventoRecuperacionClient: React.FC<DetalleEventoRecuperacionClientProps> = ({
  id,
  userId = DEFAULT_ENCARGADO_ID,
}) => {
  const { showSuccess, showError, showInfo } = useToast();
  const puedeAsignar = usePuedeAsignarMision();

  // Estados del evento principal
  const [evento, setEvento] = useState<DetalleEventoRecuperacionResponse | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Estados para dotación e inventario disponible
  const [patrullas, setPatrullas] = useState<PatrullaVerificadoraDTO[]>([]);
  const [inventario, setInventario] = useState<RecursoItem[]>([]);
  const [cargandoCatalogos, setCargandoCatalogos] = useState<boolean>(false);

  // Formulario de asignación
  const [patrullaId, setPatrullaId] = useState<string>('');
  const [filasRecursos, setFilasRecursos] = useState<FilaRecursoAsignar[]>([
    { idTemporal: 'recurso-1', recursoId: '', cantidad: 1 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [bannerConflicto, setBannerConflicto] = useState<string | null>(null);

  // Carga inicial y refresco del evento
  const cargarDetalleEvento = useCallback(async () => {
    try {
      const data = await obtenerEventoRecuperacion(id, userId);
      setEvento(data);
      setErrorCarga(null);
    } catch (err: unknown) {
      if (err instanceof RecuperacionServiceError) {
        setErrorCarga(err.message);
      } else {
        setErrorCarga('No fue posible cargar el detalle del evento de recuperación.');
      }
    }
  }, [id, userId]);

  // Carga de patrullas e inventario disponible
  const cargarCatalogosOperativos = useCallback(async () => {
    try {
      const [resPatrullas, resRecursos] = await Promise.all([
        patrullasService.listar({ estado: 'DISPONIBLE', limit: 100 }, userId),
        getRecursos({ estado: 'DISPONIBLE', limite: 100, pagina: 1 }, userId),
      ]);

      const listaPatrullas = resPatrullas.data || [];
      const listaRecursos = resRecursos.data || [];

      setPatrullas(listaPatrullas);
      setInventario(listaRecursos);
    } catch {
      // Fallback silencioso para no bloquear la vista de lectura
    }
  }, [userId]);

  useEffect(() => {
    let isMounted = true;

    const inicializar = async () => {
      try {
        const [data, resPatrullas, resRecursos] = await Promise.all([
          obtenerEventoRecuperacion(id, userId),
          patrullasService.listar({ estado: 'DISPONIBLE', limit: 100 }, userId),
          getRecursos({ estado: 'DISPONIBLE', limite: 100, pagina: 1 }, userId),
        ]);

        if (!isMounted) return;
        setEvento(data);
        setPatrullas(resPatrullas.data || []);
        setInventario(resRecursos.data || []);
      } catch (err: unknown) {
        if (!isMounted) return;
        if (err instanceof RecuperacionServiceError) {
          setErrorCarga(err.message);
        } else {
          setErrorCarga('No fue posible cargar el detalle del evento de recuperación.');
        }
      } finally {
        if (isMounted) {
          setCargando(false);
          setCargandoCatalogos(false);
        }
      }
    };

    inicializar();

    return () => {
      isMounted = false;
    };
  }, [id, userId]);

  // Sincronización en tiempo real vía WebSockets (HU-32)
  useRecuperacionSocket({
    eventoId: id,
    onRecuperacionActualizada: () => {
      cargarDetalleEvento();
      cargarCatalogosOperativos();
      showInfo('El evento de recuperación fue actualizado en vivo con una nueva misión.');
    },
    onRecursoActualizado: () => {
      cargarCatalogosOperativos();
    },
    onPatrullaActualizada: () => {
      cargarCatalogosOperativos();
    },
  });

  // Filtrar solo patrullas en estado DISPONIBLE
  const patrullasDisponibles = useMemo(() => {
    return patrullas.filter((p) => p.estado === 'DISPONIBLE');
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
    const item = inventarioMap.get(nuevoRecursoId);
    setFilasRecursos((prev) =>
      prev.map((f) => {
        if (f.idTemporal !== idTemporal) return f;
        return {
          ...f,
          recursoId: nuevoRecursoId,
          // Si es activo individual, se fija estrictamente en 1
          cantidad: item?.esIndividual ? 1 : 1,
        };
      })
    );
    setBannerConflicto(null);
  };

  const handleCambiarCantidad = (idTemporal: string, cantidadTexto: string) => {
    const val = parseInt(cantidadTexto, 10);
    const cantValida = isNaN(val) || val < 1 ? 1 : val;

    setFilasRecursos((prev) =>
      prev.map((f) => {
        if (f.idTemporal !== idTemporal) return f;
        const item = inventarioMap.get(f.recursoId);
        // Si es individual, no se permite cambiar de 1
        if (item?.esIndividual) {
          return { ...f, cantidad: 1 };
        }
        return { ...f, cantidad: cantValida };
      })
    );
    setBannerConflicto(null);
  };

  // Validaciones del formulario
  const calcularValidacionFormulario = (): { valido: boolean; mensaje: string | null } => {
    if (!patrullaId) {
      return { valido: false, mensaje: 'Selecciona una patrulla verificadora disponible' };
    }

    const recursosSeleccionados = filasRecursos.filter((f) => f.recursoId.trim() !== '');
    if (recursosSeleccionados.length === 0) {
      return { valido: false, mensaje: 'Debes agregar al menos un insumo o herramienta a despachar' };
    }

    // Verificar duplicidad de recursos
    const ids = new Set<string>();
    for (const fila of recursosSeleccionados) {
      if (ids.has(fila.recursoId)) {
        return { valido: false, mensaje: 'No puedes agregar el mismo insumo más de una vez en el despacho' };
      }
      ids.add(fila.recursoId);

      const recursoInfo = inventarioMap.get(fila.recursoId);
      if (!recursoInfo) continue;

      // Si es individual, prohibir si está en mantención o no disponible
      if (recursoInfo.esIndividual) {
        if (recursoInfo.estado === 'EN_MANTENCION' || recursoInfo.estado === 'NO_DISPONIBLE') {
          return {
            valido: false,
            mensaje: `El activo individual "${recursoInfo.nombre}" no está disponible o se encuentra en mantención`,
          };
        }
        if (fila.cantidad !== 1) {
          return { valido: false, mensaje: 'Los activos individuales solo admiten 1 unidad' };
        }
      } else {
        // Insumo a granel: stock visible = cantidadInventario - cantidadEnUso
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

  // Envío del despacho (POST .../asignar)
  const handleSubmitAsignar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validacionFormulario.valido || !evento) return;

    setErrorForm(null);
    setBannerConflicto(null);
    setIsSubmitting(true);

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

      const respuesta = await asignarRecursosRecuperacion(evento.id, payload, userId);

      showSuccess(
        `Misión de recuperación despachada exitosamente: ${respuesta.data?.mision?.codigo || 'MIS-OK'}`
      );

      // Reiniciar formulario
      setPatrullaId('');
      setFilasRecursos([{ idTemporal: 'recurso-1', recursoId: '', cantidad: 1 }]);

      // Refrescar datos
      await Promise.all([cargarDetalleEvento(), cargarCatalogosOperativos()]);
    } catch (err: unknown) {
      if (err instanceof RecuperacionServiceError) {
        if (err.statusCode === 409) {
          if (err.tipoConflicto === 'STOCK_INSUFICIENTE') {
            setBannerConflicto('El stock en bodega cambió concurrentemente. Por favor actualiza la lista de insumos.');
            showError('Stock insuficiente en bodega para los insumos solicitados.');
          } else if (err.tipoConflicto === 'PATRULLA_OCUPADA') {
            setBannerConflicto('La patrulla verificadora seleccionada ya no se encuentra disponible.');
            showError('La patrulla fue tomada por otra misión en terreno.');
          } else if (err.tipoConflicto === 'ACTIVO_NO_DISPONIBLE') {
            setBannerConflicto('El activo individual seleccionado no está disponible o se encuentra en mantención.');
            showError('Activo individual no apto para despacho operativo.');
          } else if (err.tipoConflicto === 'EVENTO_CERRADO') {
            setBannerConflicto('No se pueden asignar misiones ni recursos a un evento de recuperación cerrado.');
            showError('Evento de recuperación completado o cancelado.');
          } else {
            setBannerConflicto(err.message);
            showError(err.message);
          }
          cargarCatalogosOperativos();
        } else if (err.statusCode === 403) {
          setErrorForm('No cuentas con el permiso institucional requerido (misiones:asignar).');
          showError('Permisos insuficientes para despachar misiones.');
        } else {
          setErrorForm(err.message);
          showError(err.message);
        }
      } else {
        setErrorForm('Ocurrió un error inesperado al procesar la asignación.');
        showError('Error de comunicación con el servidor.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Estado de carga inicial
  if (cargando) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingBox}>
          <Loader2 size={36} className="animate-spin text-teal" />
          <p>Cargando información consolidada del evento de recuperación...</p>
        </div>
      </div>
    );
  }

  // Estado de error en carga
  if (errorCarga || !evento) {
    return (
      <div className={styles.container}>
        <div className={styles.topBar}>
          <Link href="/gestion/centro-incidentes" className={styles.backLink}>
            <ArrowLeft size={16} /> Volver a Centro de Mando
          </Link>
        </div>
        <div className={styles.errorBox}>
          <AlertTriangle size={36} color="var(--color-danger, #D32F2F)" />
          <Heading as="h2" variant="h3" color="charcoal-dark">
            No se pudo cargar el evento de recuperación
          </Heading>
          <p>{errorCarga || 'El evento solicitado no existe o no se encuentra disponible.'}</p>
          <Button variant="outline" href="/gestion/centro-incidentes">
            Regresar al Centro de Mando
          </Button>
        </div>
      </div>
    );
  }

  const estaCerrado = evento.estado === 'COMPLETADA' || evento.estado === 'CANCELADA';

  return (
    <div className={styles.container}>
      {/* Barra superior de navegación y títulos */}
      <div className={styles.topBar}>
        <Link href="/gestion/centro-incidentes" className={styles.backLink}>
          <ArrowLeft size={16} /> Volver a Centro de Mando
        </Link>
        <div className={styles.headerTitleRow}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className={styles.codigoBadge}>{evento.codigo}</span>
              <span className={`${styles.badgePrioridad} ${styles[`prioridad${evento.prioridad}`]}`}>
                Prioridad {evento.prioridad}
              </span>
              <span className={`${styles.badgeEstado} ${styles[`estado${evento.estado}`]}`}>
                {evento.estado.replace('_', ' ')}
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
        {/* Columna Izquierda: Ficha y Visor Territorial */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderTitle}>
              <MapPin size={20} color="var(--color-primary-teal, #1B6F7D)" />
              <Heading as="h2" variant="h4" color="teal">
                Contexto Territorial y Afectación
              </Heading>
            </div>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Sector / Localidad</span>
              <span className={styles.infoValue}>{evento.sector}</span>
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
              <span className={styles.infoLabel}>Familias / Viviendas</span>
              <span className={styles.infoValue}>{evento.familiasAfectadas} familias</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Contacto Referente</span>
              <span className={styles.infoValue}>{evento.contactoNombre || 'Sin referente vecinal'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Teléfono Contacto</span>
              <span className={styles.infoValue}>{evento.contactoTelefono || 'No registrado'}</span>
            </div>
          </div>

          {evento.descripcion && (
            <div className={styles.descripcionBox}>
              <strong>Instrucciones y Antecedentes:</strong>
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
              ariaLabel={`Ubicación del evento de recuperación ${evento.codigo}`}
            />
          </div>
        </div>

        {/* Columna Derecha: Panel de Asignación y Despacho Operativo */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderTitle}>
              <PackagePlus size={20} color="var(--color-primary-teal, #1B6F7D)" />
              <Heading as="h2" variant="h4" color="teal">
                Equipar y Despachar Misión de Recuperación
              </Heading>
            </div>
          </div>

          {estaCerrado ? (
            <InlineNotice variant="info">
              Este evento de recuperación se encuentra en estado <strong>{evento.estado}</strong>. No es posible
              asignar nuevas patrullas ni materiales a una operación cerrada.
            </InlineNotice>
          ) : !puedeAsignar ? (
            <InlineNotice variant="warning">
              Se requiere el permiso institucional <strong>misiones:asignar</strong> para despachar dotaciones de
              patrullas y materiales logísticos.
            </InlineNotice>
          ) : (
            <form onSubmit={handleSubmitAsignar} className={styles.formSection}>
              {bannerConflicto && (
                <InlineNotice variant="error">
                  <strong>Conflicto de asignación:</strong> {bannerConflicto}
                </InlineNotice>
              )}

              {errorForm && (
                <InlineNotice variant="error">
                  {errorForm}
                </InlineNotice>
              )}

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
                  }}
                  disabled={isSubmitting || cargandoCatalogos}
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
                {patrullasDisponibles.length === 0 && !cargandoCatalogos && (
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
                    Regla §3.6: Control de stock transaccional
                  </span>
                </div>

                <div className={styles.recursosTableContainer}>
                  <table className={styles.recursosTable}>
                    <thead>
                      <tr>
                        <th style={{ width: '55%' }}>Insumo o Maquinaria</th>
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
                              <Select
                                value={fila.recursoId}
                                onChange={(e) => handleCambiarRecurso(fila.idTemporal, e.target.value)}
                                disabled={isSubmitting}
                                style={{ width: '100%', fontSize: '13px' }}
                              >
                                <option value="">-- Seleccionar del inventario --</option>
                                {inventario.map((r) => {
                                  const stock = r.cantidadInventario - r.cantidadEnUso;
                                  const estaDeshabilitado =
                                    r.esIndividual && (r.estado === 'EN_MANTENCION' || r.estado === 'NO_DISPONIBLE');

                                  return (
                                    <option
                                      key={r.id}
                                      value={r.id}
                                      disabled={estaDeshabilitado || (!r.esIndividual && stock <= 0)}
                                    >
                                      {r.nombre} {r.esIndividual ? '[Activo Único]' : `(Disp: ${stock})`}
                                    </option>
                                  );
                                })}
                              </Select>
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
                                style={{ width: '70px', padding: '6px', textAlign: 'center' }}
                              />
                              {fila.recursoId && !esIndividual && fila.cantidad > stockVisible && (
                                <span style={{ color: 'var(--color-danger, #D32F2F)', fontSize: '11px', display: 'block', marginTop: '2px' }}>
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
                      Confirmar y Despachar Misión
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

        {/* Sección Inferior: Historial Consolidado de Misiones y Materiales */}
        <div className={styles.historyCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderTitle}>
              <Truck size={20} color="var(--color-primary-teal, #1B6F7D)" />
              <Heading as="h2" variant="h4" color="teal">
                Historial de Misiones Operativas y Despachos Previos
              </Heading>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted, #5F676E)' }}>
              Total: {evento.misiones?.length || 0} misión(es)
            </span>
          </div>

          {!evento.misiones || evento.misiones.length === 0 ? (
            <div className={styles.emptyHistory}>
              <Boxes size={32} style={{ margin: '0 auto 8px auto', display: 'block', opacity: 0.5 }} />
              No se han despachado patrullas ni materiales adicionales previamente para este evento.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {evento.misiones.map((mision: MisionRecuperacionItem) => (
                <div key={mision.id} className={styles.misionItem}>
                  <div className={styles.misionHeader}>
                    <div>
                      <span className={styles.misionCodigo}>{mision.codigo}</span>
                      <span style={{ margin: '0 8px', color: '#CCD2D9' }}>|</span>
                      <strong>{mision.titulo || 'Atención en terreno'}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={styles.misionPatrulla}>
                        <Truck size={14} color="var(--color-primary-teal, #1B6F7D)" />
                        {mision.patrulla?.nombre || 'Patrulla no asignada'}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          backgroundColor: '#E0F2F1',
                          color: '#1B6F7D',
                        }}
                      >
                        {mision.estado}
                      </span>
                    </div>
                  </div>

                  {mision.recursos && mision.recursos.length > 0 && (
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
                        {mision.recursos.map((rec, i) => (
                          <span key={`${rec.recursoId}-${i}`} className={styles.misionRecursoChip}>
                            <Boxes size={12} color="var(--color-primary-teal, #1B6F7D)" />
                            <strong>{rec.nombre}</strong>: {rec.cantidadAsignada} un.
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetalleEventoRecuperacionClient;
