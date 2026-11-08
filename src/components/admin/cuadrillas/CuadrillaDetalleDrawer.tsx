'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  X,
  HardHat,
  Users,
  Wrench,
  Pencil,
  AlertCircle,
  AlertTriangle,
  Trash2,
  Phone,
  Clock,
  ExternalLink,
  ShieldAlert,
  MapPin,
  Mail,
  Calendar,
} from 'lucide-react';
import type { CuadrillaItem, CuadrillaDetalle, EstadoCuadrilla } from '@/types/cuadrilla';
import { cuadrillasService, CuadrillaServiceError } from '@/services/cuadrillasService';
import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import styles from './CuadrillaDetalleDrawer.module.css';

export interface CuadrillaDetalleDrawerProps {
  cuadrilla?: CuadrillaItem | null;
  cuadrillaId?: string | null;
  isOpen: boolean;
  onCerrar: () => void;
  onEditar?: (cuadrilla: CuadrillaItem) => void;
  onDesactivar?: (cuadrilla: CuadrillaItem) => void;
  onSelectIncidente?: (incidenteId: string) => void;
  puedeEditar?: boolean;
  puedeEliminar?: boolean;
}

/**
 * Formatea minutos transcurridos en una cadena legible ("X h Y min" o "Y min").
 */
function formatearTiempoTranscurrido(minutos?: number | null, fechaDespacho?: string | null): string {
  let mins = minutos;
  if ((mins === undefined || mins === null) && fechaDespacho) {
    const despachoTime = new Date(fechaDespacho).getTime();
    const ahora = Date.now();
    if (!isNaN(despachoTime) && ahora >= despachoTime) {
      mins = Math.floor((ahora - despachoTime) / (1000 * 60));
    }
  }

  if (mins === undefined || mins === null || isNaN(mins)) {
    return 'Reciente';
  }

  if (mins < 1) return 'Menos de 1 min';
  if (mins < 60) return `${mins} min`;

  const horas = Math.floor(mins / 60);
  const residuo = mins % 60;
  return residuo > 0 ? `${horas} h ${residuo} min` : `${horas} h`;
}

/**
 * Badge del estado operativo de la cuadrilla.
 */
function BadgeEstado({ estado }: { estado?: EstadoCuadrilla }) {
  const est = (estado || '').toUpperCase();

  if (est === 'DISPONIBLE') {
    return (
      <span className={`${styles.badgeEstado} ${styles.badgeDisponible}`} data-testid="cuadrilla-badge-disponible">
        <span className={styles.statusDot} />
        DISPONIBLE
      </span>
    );
  }

  if (est === 'EN_MISION' || est === 'EN_TRANSITO' || est === 'EN_OPERACION') {
    return (
      <span className={`${styles.badgeEstado} ${styles.badgeEnMision}`} data-testid="cuadrilla-badge-en-mision">
        <Clock size={12} />
        EN MISIÓN
      </span>
    );
  }

  return (
    <span className={`${styles.badgeEstado} ${styles.badgeNoDisponible}`} data-testid="cuadrilla-badge-no-disponible">
      <span className={styles.statusDot} />
      NO DISPONIBLE
    </span>
  );
}

export default function CuadrillaDetalleDrawer({
  cuadrilla: cuadrillaProp,
  cuadrillaId: cuadrillaIdProp,
  isOpen,
  onCerrar,
  onEditar,
  onDesactivar,
  onSelectIncidente,
  puedeEditar = true,
  puedeEliminar = true,
}: CuadrillaDetalleDrawerProps) {
  const [cuadrillaData, setCuadrillaData] = useState<CuadrillaDetalle | null>(cuadrillaProp || null);
  const [cargando, setCargando] = useState<boolean>(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [esForbidden, setEsForbidden] = useState<boolean>(false);

  const targetId = useMemo(() => {
    return cuadrillaIdProp || cuadrillaProp?.id || null;
  }, [cuadrillaIdProp, cuadrillaProp]);

  // Cargar información completa desde el endpoint GET /api/cuadrillas/{id}
  useEffect(() => {
    if (!isOpen || !targetId) {
      if (!isOpen) {
        setCuadrillaData(null);
        setErrorCarga(null);
        setEsForbidden(false);
      }
      return;
    }

    let isMounted = true;
    setCargando(true);
    setErrorCarga(null);
    setEsForbidden(false);

    // Si ya teníamos datos iniciales del item de la lista, asignarlos temporalmente
    if (cuadrillaProp && cuadrillaProp.id === targetId) {
      setCuadrillaData(cuadrillaProp);
    }

    cuadrillasService
      .obtenerCuadrillaPorId(targetId)
      .then((data) => {
        if (!isMounted) return;
        setCuadrillaData(data);
        setCargando(false);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setCargando(false);
        if (err instanceof CuadrillaServiceError && err.status === 403) {
          setEsForbidden(true);
          setErrorCarga(err.message);
        } else {
          setErrorCarga(
            err instanceof Error ? err.message : 'Error al consultar la composición de la cuadrilla.'
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, targetId, cuadrillaProp]);

  // Manejo de teclado tecla Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onCerrar();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCerrar]);

  if (!isOpen) return null;

  const cuadrilla = cuadrillaData || cuadrillaProp;
  const estadoNorm = (cuadrilla?.estado || '').toUpperCase();
  const estaInactiva = cuadrilla?.activo === false || estadoNorm === 'NO_DISPONIBLE';
  const bloqueadaPorMision =
    estadoNorm === 'EN_MISION' ||
    estadoNorm === 'EN_TRANSITO' ||
    estadoNorm === 'EN_OPERACION' ||
    Boolean(cuadrilla?.misionActiva);
  const misionActiva = cuadrilla?.misionActiva;

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-cuadrilla-title"
      data-testid="cuadrilla-detalle-drawer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <aside className={styles.drawer}>
        {/* Cabecera del Drawer */}
        <header className={styles.header}>
          <div className={styles.headerTitleGroup}>
            <HardHat size={26} className={styles.headerIcon} aria-hidden="true" />
            <div className={styles.headerTitles}>
              <Heading as="h3" variant="h3" color="white" noMargin id="drawer-cuadrilla-title">
                {cuadrilla?.nombre || 'Ficha Técnica de Cuadrilla'}
              </Heading>
              {cuadrilla?.delegacion && (
                <span className={styles.headerSubtitle}>
                  Delegación {cuadrilla.delegacion.nombre}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar panel de detalle de cuadrilla"
            className={styles.closeButton}
          >
            <X size={20} />
          </button>
        </header>

        {/* Cuerpo del Drawer */}
        <div className={styles.body}>
          {/* Estado de carga */}
          {cargando && !cuadrilla && (
            <div className={styles.loadingState}>
              <HardHat size={36} color="var(--color-primary-teal, #1B6F7D)" />
              <p>Consultando dotación y recursos de la cuadrilla...</p>
            </div>
          )}

          {/* Estado de Acceso Denegado (403 Forbidden) */}
          {esForbidden && (
            <div className={styles.errorBox} data-testid="cuadrilla-forbidden-notice">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                <ShieldAlert size={18} />
                <span>Acceso Restringido (403 Forbidden)</span>
              </div>
              <div>{errorCarga || 'No cuenta con los privilegios necesarios para consultar la composición de cuadrillas.'}</div>
            </div>
          )}

          {/* Error general de carga */}
          {errorCarga && !esForbidden && !cuadrilla && (
            <div className={styles.errorBox}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                <AlertCircle size={18} />
                <span>Error de Consulta</span>
              </div>
              <div>{errorCarga}</div>
            </div>
          )}

          {cuadrilla && (
            <>
              {/* Tarjeta de Estado Operativo Actual */}
              <div className={styles.card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-charcoal, #3B3F45)' }}>
                    Estado Operativo Actual:
                  </span>
                  <BadgeEstado estado={cuadrilla.estado} />
                </div>
              </div>

              {/* Advertencia si la unidad está inactiva */}
              {estaInactiva && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '12px 16px',
                    backgroundColor: '#F1F3F5',
                    border: '1px solid #DFE3E8',
                    borderLeft: '4px solid var(--color-text-muted, #5F676E)',
                    color: 'var(--color-text-muted, #5F676E)',
                    fontSize: '13px',
                  }}
                  data-testid="cuadrilla-inactiva-notice"
                >
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <div>
                    <strong>Unidad Inactiva / No Disponible:</strong> Esta cuadrilla ha sido dada de baja o no se encuentra disponible para asignaciones operativas en terreno.
                  </div>
                </div>
              )}

              {/* Misión Activa en Ejecución (si la cuadrilla está EN_MISION) */}
              {bloqueadaPorMision && (
                <div className={styles.misionActivaCard} data-testid="cuadrilla-mision-activa-card">
                  <div className={styles.misionActivaHeader}>
                    <div className={styles.misionBadge}>
                      <AlertTriangle size={15} />
                      <span>Cuadrilla en Misión Activa</span>
                    </div>

                    <div className={styles.misionTiempo}>
                      <Clock size={13} />
                      <span>
                        Despachada hace: {formatearTiempoTranscurrido(misionActiva?.tiempoTranscurridoMinutos, misionActiva?.fechaDespacho)}
                      </span>
                    </div>
                  </div>

                  {misionActiva ? (
                    <>
                      <div className={styles.misionTitulo}>
                        {misionActiva.codigo}: {misionActiva.titulo}
                      </div>

                      {misionActiva.incidente && (
                        <div className={styles.incidenteRow}>
                          <div className={styles.incidenteInfo}>
                            <strong>Incidente:</strong> {misionActiva.incidente.codigo}
                            {misionActiva.incidente.tipo && ` — ${misionActiva.incidente.tipo}`}
                            {misionActiva.incidente.direccion && (
                              <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #5F676E)', marginTop: '2px' }}>
                                <MapPin size={11} style={{ display: 'inline', marginRight: '3px' }} />
                                {misionActiva.incidente.direccion}
                              </div>
                            )}
                          </div>

                          {onSelectIncidente ? (
                            <button
                              type="button"
                              className={styles.incidenteBotonLink}
                              onClick={() => {
                                if (misionActiva.incidente?.id) {
                                  onCerrar();
                                  onSelectIncidente(misionActiva.incidente.id);
                                }
                              }}
                              data-testid="btn-ver-incidente-mision"
                            >
                              <span>Ver Incidente</span>
                              <ExternalLink size={13} />
                            </button>
                          ) : (
                            <Link
                              href={`/gestion/centro-incidentes?incidenteId=${misionActiva.incidente.id}`}
                              className={styles.incidenteBotonLink}
                              onClick={onCerrar}
                              data-testid="link-ver-incidente-mision"
                            >
                              <span>Ver Incidente</span>
                              <ExternalLink size={13} />
                            </Link>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ fontSize: '12px', color: 'var(--color-warning, #E65100)' }}>
                      La cuadrilla se encuentra despachada a una misión activa en terreno. Sus datos y recursos están protegidos contra modificaciones operativas.
                    </div>
                  )}
                </div>
              )}

              {/* Delegado Responsable */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>
                    <Users size={15} />
                    <span>Delegado a Cargo en Terreno</span>
                  </div>
                </div>

                <div className={styles.delegadoContainer}>
                  <div className={styles.delegadoAvatar} aria-hidden="true">
                    {cuadrilla.delegado?.nombre ? cuadrilla.delegado.nombre.charAt(0).toUpperCase() : 'D'}
                  </div>
                  <div className={styles.delegadoDetails}>
                    <span className={styles.delegadoNombre}>
                      {cuadrilla.delegado?.nombre || 'Sin delegado asignado'}
                    </span>
                    <div className={styles.delegadoMeta}>
                      {cuadrilla.delegado?.email && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Mail size={12} />
                          {cuadrilla.delegado.email}
                        </span>
                      )}
                      {cuadrilla.delegado?.rut && (
                        <span className={styles.rutBadge}>RUT: {cuadrilla.delegado.rut}</span>
                      )}
                      {cuadrilla.delegado?.telefono && (
                        <a
                          href={`tel:${cuadrilla.delegado.telefono}`}
                          className={styles.telefonoLink}
                          title={`Llamar a ${cuadrilla.delegado.nombre}`}
                        >
                          <Phone size={12} />
                          <span>{cuadrilla.delegado.telefono}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Nómina de Integrantes (cuadrilla_integrante) */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>
                    <Users size={15} />
                    <span>Nómina de Integrantes ({cuadrilla.trabajadores?.length || 0})</span>
                  </div>
                </div>

                {cuadrilla.trabajadores && cuadrilla.trabajadores.length > 0 ? (
                  <div className={styles.trabajadoresList} data-testid="cuadrilla-trabajadores-lista">
                    {cuadrilla.trabajadores.map((t) => (
                      <div key={t.id} className={styles.trabajadorRow} data-testid={`integrante-row-${t.personalId}`}>
                        <div className={styles.trabajadorMain}>
                          <span className={styles.trabajadorNombre}>{t.nombre}</span>
                          <div className={styles.trabajadorCargoGroup}>
                            <span className={styles.cargoBadge}>{t.cargo || 'Operario'}</span>
                            {t.especialidad && (
                              <span className={styles.especialidadText}>• {t.especialidad}</span>
                            )}
                          </div>
                        </div>

                        <div className={styles.trabajadorContact}>
                          {t.rut && <span className={styles.rutBadge}>{t.rut}</span>}
                          {t.telefono ? (
                            <a
                              href={`tel:${t.telefono}`}
                              className={styles.telefonoLink}
                              title={`Llamar a ${t.nombre}`}
                              data-testid={`tel-link-${t.personalId}`}
                            >
                              <Phone size={12} />
                              <span>{t.telefono}</span>
                            </a>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #5F676E)' }}>
                              Sin teléfono
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyText}>
                    No hay funcionarios operativos asignados a la nómina de esta cuadrilla.
                  </p>
                )}
              </div>

              {/* Recursos Materiales, Vehículos y Herramientas (cuadrilla_recurso) */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>
                    <Wrench size={15} />
                    <span>Equipamiento y Vehículos ({cuadrilla.recursos?.length || 0})</span>
                  </div>
                </div>

                {cuadrilla.recursos && cuadrilla.recursos.length > 0 ? (
                  <div className={styles.recursosList} data-testid="cuadrilla-recursos-lista">
                    {cuadrilla.recursos.map((r) => {
                      const especificaciones = r.especificaciones || null;
                      const tieneSpecs = especificaciones && Object.keys(especificaciones).length > 0;

                      return (
                        <div key={r.id} className={styles.recursoCard} data-testid={`recurso-card-${r.recursoId}`}>
                          <div className={styles.recursoHeaderRow}>
                            <div>
                              <div className={styles.recursoNombre}>{r.nombre}</div>
                              <div className={styles.recursoTipo}>
                                {r.esIndividual ? 'Vehículo / Activo Individual' : 'Insumo / Herramienta a Granel'}
                              </div>
                            </div>
                            <span className={styles.recursoCantidadBadge}>
                              {r.cantidadAsignada} {r.cantidadAsignada === 1 ? 'unidad' : 'unidades'}
                            </span>
                          </div>

                          {r.descripcion && (
                            <p className={styles.recursoDescripcion}>{r.descripcion}</p>
                          )}

                          {tieneSpecs && (
                            <div className={styles.especificacionesContainer} data-testid="especificaciones-container">
                              {Object.entries(especificaciones).map(([clave, valor]) => (
                                <div key={clave} className={styles.especificacionItem}>
                                  <span className={styles.especificacionClave}>{clave}:</span>{' '}
                                  <span>{String(valor)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className={styles.emptyText}>
                    No hay recursos materiales, vehículos ni herramientas asignadas a esta unidad.
                  </p>
                )}
              </div>

              {/* Metadatos de Auditoría */}
              <div className={styles.auditFooter}>
                <span>
                  <strong>Creado:</strong>{' '}
                  {cuadrilla.creadoEn ? new Date(cuadrilla.creadoEn).toLocaleString('es-CL') : 'N/D'}
                </span>
                {cuadrilla.actualizadoEn && (
                  <span>
                    <strong>Última actualización:</strong>{' '}
                    {new Date(cuadrilla.actualizadoEn).toLocaleString('es-CL')}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Pie del Drawer con Acciones */}
        <footer className={styles.footer}>
          <Button variant="outline" size="md" onClick={onCerrar}>
            Cerrar
          </Button>

          {puedeEliminar && onDesactivar && cuadrilla && !estaInactiva && (
            <Button
              variant="destructive"
              size="md"
              disabled={bloqueadaPorMision}
              onClick={() => {
                onDesactivar(cuadrilla);
              }}
              icon={<Trash2 size={15} />}
              title={
                bloqueadaPorMision
                  ? 'No se puede desactivar una cuadrilla que se encuentra actualmente en misión activa'
                  : 'Desactivar cuadrilla operativa'
              }
            >
              Desactivar
            </Button>
          )}

          {puedeEditar && onEditar && cuadrilla && !estaInactiva && (
            <Button
              variant="primary"
              size="md"
              disabled={bloqueadaPorMision}
              onClick={() => {
                onCerrar();
                onEditar(cuadrilla);
              }}
              icon={<Pencil size={15} />}
              title={
                bloqueadaPorMision
                  ? 'No se puede editar una cuadrilla que se encuentra actualmente en misión activa'
                  : 'Modificar datos y dotación'
              }
            >
              Editar Cuadrilla
            </Button>
          )}
        </footer>
      </aside>
    </div>
  );
}
