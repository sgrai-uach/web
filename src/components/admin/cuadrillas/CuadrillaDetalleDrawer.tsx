'use client';

import React, { useEffect, useState, useMemo } from 'react';
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
} from 'lucide-react';
import type { CuadrillaItem, EstadoCuadrilla } from '@/types/cuadrilla';
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

function BadgeEstado({ estado }: { estado: EstadoCuadrilla }) {
  const estadoUpper = (estado || '').toUpperCase();

  switch (estadoUpper) {
    case 'DISPONIBLE':
      return (
        <span
          className={`${styles.badgeEstado} ${styles.badgeDisponible}`}
          data-testid="cuadrilla-badge-disponible"
        >
          <span className={styles.statusDot} aria-hidden="true" />
          DISPONIBLE
        </span>
      );
    case 'EN_MISION':
      return (
        <span
          className={`${styles.badgeEstado} ${styles.badgeEnMision}`}
          data-testid="cuadrilla-badge-en-mision"
        >
          <span className={styles.statusDot} aria-hidden="true" />
          EN MISIÓN
        </span>
      );
    case 'NO_DISPONIBLE':
    default:
      return (
        <span
          className={`${styles.badgeEstado} ${styles.badgeNoDisponible}`}
          data-testid="cuadrilla-badge-no-disponible"
        >
          <span className={styles.statusDot} aria-hidden="true" />
          NO DISPONIBLE
        </span>
      );
  }
}

function formatearTiempoTranscurrido(
  minutos?: number | null,
  fechaDespacho?: string | null
): string {
  let mins = minutos;

  if ((mins === undefined || mins === null) && fechaDespacho) {
    const diffMs = Date.now() - new Date(fechaDespacho).getTime();
    mins = Math.max(0, Math.floor(diffMs / (1000 * 60)));
  }

  if (mins === undefined || mins === null || isNaN(mins)) {
    return 'Reciente';
  }

  if (mins < 60) {
    return `${mins} min`;
  }

  const horas = Math.floor(mins / 60);
  const restMins = mins % 60;
  return `${horas} h ${restMins} min`;
}

interface CuadrillaDetalleContentProps {
  targetId: string;
  cuadrillaProp?: CuadrillaItem | null;
  onCerrar: () => void;
  onEditar?: (cuadrilla: CuadrillaItem) => void;
  onDesactivar?: (cuadrilla: CuadrillaItem) => void;
  onSelectIncidente?: (incidenteId: string) => void;
  puedeEditar?: boolean;
  puedeEliminar?: boolean;
}

function CuadrillaDetalleDrawerContent({
  targetId,
  cuadrillaProp,
  onCerrar,
  onEditar,
  onDesactivar,
  onSelectIncidente,
  puedeEditar = false,
  puedeEliminar = false,
}: CuadrillaDetalleContentProps) {
  const [cuadrillaData, setCuadrillaData] = useState<CuadrillaItem | null>(
    cuadrillaProp && cuadrillaProp.id === targetId ? cuadrillaProp : null
  );
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [esForbidden, setEsForbidden] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

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
        setCuadrillaData(null);
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
  }, [targetId]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onCerrar();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCerrar]);

  const cuadrilla = esForbidden ? null : (cuadrillaData || (!errorCarga ? cuadrillaProp : null));
  const estadoNorm = (cuadrilla?.estado || '').toUpperCase();
  const estaInactiva = cuadrilla?.activo === false || estadoNorm === 'NO_DISPONIBLE';
  const bloqueadaPorMision =
    estadoNorm === 'EN_MISION' ||
    cuadrilla?.misionActiva?.estado === 'EN_CURSO' ||
    cuadrilla?.misionActiva?.estado === 'DESPACHADA';

  const misionActiva = useMemo(() => {
    if (!cuadrilla?.misionActiva) return null;
    return cuadrilla.misionActiva;
  }, [cuadrilla]);

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCerrar();
        }
      }}
    >
      <div
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cuadrilla-detalle-titulo"
        data-testid="cuadrilla-detalle-drawer"
      >
        {/* Cabecera Institucional */}
        <header className={styles.header}>
          <div className={styles.headerTitleGroup}>
            <HardHat size={22} className={styles.headerIcon} aria-hidden="true" />
            <div className={styles.headerTitles}>
              <Heading as="h2" variant="h3" color="white" noMargin id="cuadrilla-detalle-titulo">
                {cuadrilla?.nombre || 'Ficha Técnica de Cuadrilla'}
              </Heading>
              <span className={styles.headerSubtitle}>
                {cuadrilla?.delegacion?.nombre
                  ? `Delegación ${cuadrilla.delegacion.nombre}`
                  : 'Dotación operativa y recursos municipales'}
              </span>
            </div>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onCerrar}
            aria-label="Cerrar panel de detalle"
            title="Cerrar panel"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        {/* Cuerpo del Drawer */}
        <div className={styles.body}>
          {/* Skeleton o spinner durante la carga inicial */}
          {cargando && !cuadrilla && !errorCarga && (
            <div className={styles.loadingState} data-testid="cuadrilla-loading-state">
              <div className={styles.spinner} aria-hidden="true" />
              <span>Consultando composición y recursos en tiempo real...</span>
            </div>
          )}

          {/* Aviso de Error 403 Forbidden (RBAC) */}
          {esForbidden && (
            <div className={styles.errorBox} data-testid="cuadrilla-forbidden-notice">
              <div className={styles.errorBoxHeader}>
                <ShieldAlert size={18} />
                <span>Acceso Restringido (403 Forbidden)</span>
              </div>
              <div>{errorCarga || 'No cuenta con los privilegios necesarios para consultar la composición de cuadrillas.'}</div>
            </div>
          )}

          {/* Error general de carga */}
          {errorCarga && !esForbidden && !cuadrilla && (
            <div className={styles.errorBox}>
              <div className={styles.errorBoxHeader}>
                <AlertCircle size={18} />
                <span>Error de Consulta</span>
              </div>
              <div>{errorCarga}</div>
            </div>
          )}

          {/* Renderizado condicional protegido: NUNCA fugar datos si hay 403 o error */}
          {!esForbidden && !errorCarga && cuadrilla && (
            <>
              {/* Tarjeta de Estado Operativo Actual */}
              <div className={styles.card}>
                <div className={styles.estadoRow}>
                  <span className={styles.estadoLabel}>
                    Estado Operativo Actual:
                  </span>
                  <BadgeEstado estado={cuadrilla.estado} />
                </div>
              </div>

              {/* Advertencia si la unidad está inactiva */}
              {estaInactiva && (
                <div className={styles.inactivaNotice} data-testid="cuadrilla-inactiva-notice">
                  <AlertCircle size={18} className={styles.inactivaIcon} />
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
                              <div className={styles.incidenteDireccion}>
                                <MapPin size={11} className={styles.incidenteDireccionIcon} />
                                {misionActiva.incidente.direccion}
                              </div>
                            )}
                          </div>

                          {onSelectIncidente ? (
                            <Button
                              type="button"
                              variant="teal"
                              size="sm"
                              onClick={() => {
                                if (misionActiva.incidente?.id) {
                                  onCerrar();
                                  onSelectIncidente(misionActiva.incidente.id);
                                }
                              }}
                              data-testid="btn-ver-incidente-mision"
                            >
                              <ExternalLink size={13} style={{ marginRight: '4px' }} />
                              <span>Ver Incidente</span>
                            </Button>
                          ) : (
                            <Button
                              href={`/gestion/centro-incidentes?incidenteId=${misionActiva.incidente.id}`}
                              variant="teal"
                              size="sm"
                              onClick={onCerrar}
                              data-testid="link-ver-incidente-mision"
                            >
                              <ExternalLink size={13} style={{ marginRight: '4px' }} />
                              <span>Ver Incidente</span>
                            </Button>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className={styles.misionAdvertenciaProtegida}>
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
                        <span className={styles.delegadoEmail}>
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
                            <span className={styles.sinTelefono}>
                              Sin teléfono
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyText}>
                    No hay trabajadores operativos asignados a esta cuadrilla.
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
                    No hay recursos logísticos ni vehículos asignados a esta cuadrilla.
                  </p>
                )}
              </div>

              {/* Metadatos de Auditoría con soporte para eliminadoEn (HU-82 / BUG-H22-WEB-05) */}
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
                {cuadrilla.eliminadoEn && (
                  <span className={styles.auditEliminado} data-testid="cuadrilla-audit-eliminado">
                    <strong>Eliminado / Dado de baja:</strong>{' '}
                    {new Date(cuadrilla.eliminadoEn).toLocaleString('es-CL')}
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
              title={
                bloqueadaPorMision
                  ? 'No se puede desactivar una cuadrilla asignada a una misión activa'
                  : 'Desactivar esta cuadrilla'
              }
              aria-label="Desactivar Cuadrilla"
            >
              <Trash2 size={16} aria-hidden="true" style={{ marginRight: '6px' }} />
              <span>Desactivar</span>
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
              title={
                bloqueadaPorMision
                  ? 'No se puede editar una cuadrilla que se encuentra en misión activa'
                  : 'Editar composición de la cuadrilla'
              }
              aria-label="Editar Cuadrilla"
            >
              <Pencil size={16} aria-hidden="true" style={{ marginRight: '6px' }} />
              <span>Editar Cuadrilla</span>
            </Button>
          )}
        </footer>
      </div>
    </div>
  );
}

export default function CuadrillaDetalleDrawer({
  cuadrilla,
  cuadrillaId,
  isOpen,
  ...restProps
}: CuadrillaDetalleDrawerProps) {
  if (!isOpen || (!cuadrilla && !cuadrillaId)) {
    return null;
  }

  const targetId = cuadrillaId || cuadrilla?.id || '';

  return (
    <CuadrillaDetalleDrawerContent
      key={targetId}
      targetId={targetId}
      cuadrillaProp={cuadrilla}
      {...restProps}
    />
  );
}
