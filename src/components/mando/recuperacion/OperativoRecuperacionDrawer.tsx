'use client';

import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  X,
  Info,
  MapPin,
  Package,
  Clock,
  Loader2,
  Pencil,
} from 'lucide-react';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import InlineNotice from '@/components/ui/InlineNotice';
import { useOptionalToast } from '@/components/ui/Toast';
import { AuthContext } from '@/context/AuthContext';
import { SimulatedSessionContext } from '@/context/SimulatedSessionContext';
import { usePuedeEditarRecuperacion } from '@/hooks/usePuedeEditarRecuperacion';
import { useRecuperacionSocket } from '@/hooks/useRecuperacionSocket';
import {
  obtenerDetalleOperativoRecuperacion,
  RecuperacionServiceError,
} from '@/services/recuperacionService';
import type {
  EditarOperativoRecuperacionData,
  OperativoRecuperacionDetalle,
} from '@/types/recuperacion';
import { ModalEditarOperativoRecuperacion } from './ModalEditarOperativoRecuperacion';
import {
  ETIQUETA_ESTADO_RECUPERACION,
  ETIQUETA_PRIORIDAD_RECUPERACION,
  formatearFechaChilena,
} from './recuperacionLabels';
import styles from './OperativoRecuperacionDrawer.module.css';

export interface OperativoRecuperacionDrawerProps {
  operativoId: string | null;
  onCerrar: () => void;
  onOperativoActualizado?: () => void;
}

export const OperativoRecuperacionDrawer: React.FC<OperativoRecuperacionDrawerProps> = ({
  operativoId,
  onCerrar,
  onOperativoActualizado,
}) => {
  const toast = useOptionalToast();
  const auth = useContext(AuthContext);
  const simulated = useContext(SimulatedSessionContext);
  const activeUserId = auth?.estaAutenticado
    ? auth.usuario?.id
    : simulated?.usuarioActivo?.id;
  const puedeEditar = usePuedeEditarRecuperacion();
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [reloadNonce, setReloadNonce] = useState(0);
  const [estadoCarga, setEstadoCarga] = useState<{
    id: string | null;
    detalle: OperativoRecuperacionDetalle | null;
    error: string | null;
  }>({ id: null, detalle: null, error: null });

  const onCerrarRef = useRef(onCerrar);
  const toastRef = useRef(toast);

  useEffect(() => {
    onCerrarRef.current = onCerrar;
  }, [onCerrar]);

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const handleCerrarDrawer = useCallback(() => {
    setModalEditarAbierto(false);
    onCerrarRef.current();
  }, []);

  const cargando = Boolean(operativoId) && estadoCarga.id !== operativoId;
  const detalle =
    operativoId && estadoCarga.id === operativoId ? estadoCarga.detalle : null;
  const error =
    operativoId && estadoCarga.id === operativoId ? estadoCarga.error : null;

  const esEstadoBloqueado =
    detalle?.estado === 'COMPLETADA' || detalle?.estado === 'CANCELADA';

  useEffect(() => {
    queueMicrotask(() => {
      setModalEditarAbierto(false);
    });
  }, [operativoId]);

  useEffect(() => {
    if (!operativoId) return;

    let activo = true;

    obtenerDetalleOperativoRecuperacion(operativoId)
      .then((data) => {
        if (!activo) return;
        setEstadoCarga({ id: operativoId, detalle: data, error: null });
      })
      .catch((err: unknown) => {
        if (!activo) return;
        if (err instanceof RecuperacionServiceError && err.statusCode === 404) {
          toastRef.current?.showError(
            err.message || 'El operativo de recuperación solicitado no fue encontrado.'
          );
          setModalEditarAbierto(false);
          onCerrarRef.current();
          return;
        }
        setEstadoCarga({
          id: operativoId,
          detalle: null,
          error:
            err instanceof Error
              ? err.message
              : 'No fue posible cargar el detalle del operativo de recuperación.',
        });
      });

    return () => {
      activo = false;
    };
  }, [operativoId, reloadNonce]);

  useRecuperacionSocket({
    enabled: Boolean(operativoId),
    onRecuperacionActualizada: useCallback(
      (actualizado: EditarOperativoRecuperacionData) => {
        if (actualizado.id === operativoId) {
          setReloadNonce((prev) => prev + 1);
        }
      },
      [operativoId]
    ),
  });

  useEffect(() => {
    if (!operativoId) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !modalEditarAbierto) {
        handleCerrarDrawer();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [operativoId, modalEditarAbierto, handleCerrarDrawer]);

  const handleEdicionExitosa = (actualizado: EditarOperativoRecuperacionData) => {
    setEstadoCarga((prev) => {
      if (!prev.detalle || prev.id !== actualizado.id) return prev;
      return {
        ...prev,
        detalle: {
          ...prev.detalle,
          descripcion: actualizado.descripcion,
          fechaEstimadaFin: actualizado.fechaEstimadaFin,
          actualizadoPorId: actualizado.actualizadoPorId,
          actualizadoEn: actualizado.actualizadoEn,
          patrulla: actualizado.patrulla,
          mision: actualizado.mision,
          recursos: actualizado.recursos,
        },
      };
    });
    setReloadNonce((prev) => prev + 1);
    onOperativoActualizado?.();
  };

  if (!operativoId) return null;

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label="Detalle de operativo de recuperación"
      onClick={handleCerrarDrawer}
    >
      <aside className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <div className={styles.headerMeta}>
            <span className={styles.codigoTag}>
              {detalle?.codigo || 'OPERATIVO DE RECUPERACIÓN'}
            </span>
            <Heading as="h2" variant="h3" color="white">
              {detalle?.nombre || 'Cargando detalle...'}
            </Heading>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCerrarDrawer}
            aria-label="Cerrar panel de detalle"
            style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)' }}
          >
            <X size={16} />
          </Button>
        </header>

        {!cargando && !error && detalle && puedeEditar && (
          <div className={styles.actionBar}>
            <span className={styles.actionBarHint}>
              {esEstadoBloqueado
                ? 'Edición bloqueada: el operativo está finalizado o cancelado.'
                : 'Planificación activa editable'}
            </span>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={esEstadoBloqueado}
              title={
                esEstadoBloqueado
                  ? 'No se permite editar operativos en estado COMPLETADA o CANCELADA.'
                  : 'Editar planificación del operativo'
              }
              onClick={() => setModalEditarAbierto(true)}
            >
              <Pencil size={14} style={{ marginRight: '6px' }} />
              <span>Editar Planificación</span>
            </Button>
          </div>
        )}

        <div className={styles.body}>
          {cargando && (
            <div className={styles.loadingCenter}>
              <Loader2 size={28} className={styles.spinIcon} />
              <span>Cargando información del operativo...</span>
            </div>
          )}

          {!cargando && error && (
            <InlineNotice variant="error">{error}</InlineNotice>
          )}

          {!cargando && !error && detalle && (
            <>
              {/* Bloque 1: Detalles generales */}
              <section className={styles.section}>
                <div className={styles.sectionTitleRow}>
                  <Info size={16} />
                  <Heading as="h3" variant="h4" color="teal">
                    Detalles generales
                  </Heading>
                </div>

                {detalle.descripcion && (
                  <div className={styles.descripcionBox}>{detalle.descripcion}</div>
                )}

                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Estado</span>
                    <span className={styles.infoValue}>
                      {ETIQUETA_ESTADO_RECUPERACION[detalle.estado] || detalle.estado}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Prioridad</span>
                    <span className={styles.infoValue}>
                      {ETIQUETA_PRIORIDAD_RECUPERACION[detalle.prioridad] || detalle.prioridad}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Sector</span>
                    <span className={styles.infoValue}>{detalle.sector}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Registrado por</span>
                    <span className={styles.infoValue}>
                      {detalle.creadoPor ? detalle.creadoPor.nombre : '—'}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Fecha de registro</span>
                    <span className={styles.infoValue}>
                      {formatearFechaChilena(detalle.creadoEn)}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Fecha estimada de término</span>
                    <span className={styles.infoValue}>
                      {formatearFechaChilena(detalle.fechaEstimadaFin)}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Fecha de cierre</span>
                    <span className={styles.infoValue}>
                      {formatearFechaChilena(detalle.fechaCierre)}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Última actualización</span>
                    <span className={styles.infoValue}>
                      {formatearFechaChilena(detalle.actualizadoEn)}
                    </span>
                  </div>
                  {detalle.actualizadoPorId && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Actualizado por (ID)</span>
                      <span className={styles.infoValue}>{detalle.actualizadoPorId}</span>
                    </div>
                  )}
                </div>

                {detalle.observacionesCierre && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Observaciones de cierre</span>
                    <span className={styles.infoValue}>{detalle.observacionesCierre}</span>
                  </div>
                )}
              </section>

              {/* Bloque 2: Delegación y Misión asignada */}
              <section className={styles.section}>
                <div className={styles.sectionTitleRow}>
                  <MapPin size={16} />
                  <Heading as="h3" variant="h4" color="teal">
                    Delegación y Misión asignada
                  </Heading>
                </div>

                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Delegación Municipal</span>
                    <span className={styles.infoValue}>
                      {detalle.delegacion?.nombre || 'Sin delegación asignada'}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Misión asociada</span>
                    <span className={styles.infoValue}>
                      {detalle.mision
                        ? `${detalle.mision.codigo} (${detalle.mision.estado})`
                        : 'Sin misión asociada'}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Patrulla asignada</span>
                    <span className={styles.infoValue}>
                      {detalle.patrulla
                        ? `${detalle.patrulla.nombre} (${detalle.patrulla.estado})`
                        : 'Sin patrulla asignada'}
                    </span>
                  </div>
                </div>
              </section>

              {/* Bloque 3: Listado tabular de recursos/insumos */}
              <section className={styles.section}>
                <div className={styles.sectionTitleRow}>
                  <Package size={16} />
                  <Heading as="h3" variant="h4" color="teal">
                    Recursos e insumos asignados ({(detalle.recursos ?? []).length})
                  </Heading>
                </div>

                {(detalle.recursos ?? []).length === 0 ? (
                  <p className={styles.infoLabel}>No hay insumos registrados en este operativo.</p>
                ) : (
                  <table className={styles.recursosTable}>
                    <thead>
                      <tr>
                        <th>Recurso</th>
                        <th>Cantidad asignada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(detalle.recursos ?? []).map((rec) => (
                        <tr key={rec.recursoId}>
                          <td>{rec.nombre}</td>
                          <td>{rec.cantidadAsignada}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>

              {/* Bloque 4: Línea de tiempo cronológica */}
              <section className={styles.section}>
                <div className={styles.sectionTitleRow}>
                  <Clock size={16} />
                  <Heading as="h3" variant="h4" color="teal">
                    Historial del operativo ({(detalle.historial ?? []).length})
                  </Heading>
                </div>

                {(detalle.historial ?? []).length === 0 ? (
                  <p className={styles.infoLabel}>Sin hitos registrados.</p>
                ) : (
                  <div className={styles.timeline}>
                    {(detalle.historial ?? []).map((hito) => (
                      <div key={hito.id} className={styles.timelineItem}>
                        <div className={styles.timelineHeader}>
                          <span className={styles.timelineTitle}>{hito.titulo}</span>
                          <span className={styles.timelineDate}>
                            {formatearFechaChilena(hito.creadoEn)}
                          </span>
                        </div>
                        {hito.descripcion && (
                          <span className={styles.timelineDesc}>{hito.descripcion}</span>
                        )}
                        <span className={styles.timelineAutor}>
                          Por: {hito.registradoPor?.nombre || 'Sistema'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </aside>

      {detalle && (
        <ModalEditarOperativoRecuperacion
          key={operativoId}
          isOpen={modalEditarAbierto}
          operativo={detalle}
          userId={activeUserId}
          onClose={() => setModalEditarAbierto(false)}
          onSuccess={handleEdicionExitosa}
        />
      )}
    </div>
  );
};
