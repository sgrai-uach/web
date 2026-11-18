'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  Info,
  MapPin,
  Package,
  Clock,
  Loader2,
} from 'lucide-react';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import InlineNotice from '@/components/ui/InlineNotice';
import { useOptionalToast } from '@/components/ui/Toast';
import {
  obtenerDetalleOperativoRecuperacion,
  RecuperacionServiceError,
} from '@/services/recuperacionService';
import type { OperativoRecuperacionDetalle } from '@/types/recuperacion';
import {
  ETIQUETA_ESTADO_RECUPERACION,
  ETIQUETA_PRIORIDAD_RECUPERACION,
  formatearFechaChilena,
} from './recuperacionLabels';
import styles from './OperativoRecuperacionDrawer.module.css';

export interface OperativoRecuperacionDrawerProps {
  operativoId: string | null;
  onCerrar: () => void;
}

export const OperativoRecuperacionDrawer: React.FC<OperativoRecuperacionDrawerProps> = ({
  operativoId,
  onCerrar,
}) => {
  const toast = useOptionalToast();
  const [estadoCarga, setEstadoCarga] = useState<{
    id: string | null;
    detalle: OperativoRecuperacionDetalle | null;
    error: string | null;
  }>({ id: null, detalle: null, error: null });

  const cargando = Boolean(operativoId) && estadoCarga.id !== operativoId;
  const detalle =
    operativoId && estadoCarga.id === operativoId ? estadoCarga.detalle : null;
  const error =
    operativoId && estadoCarga.id === operativoId ? estadoCarga.error : null;

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
          toast?.showError(
            err.message || 'El operativo de recuperación solicitado no fue encontrado.'
          );
          onCerrar();
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
  }, [operativoId, onCerrar, toast]);

  useEffect(() => {
    if (!operativoId) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCerrar();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [operativoId, onCerrar]);

  if (!operativoId) return null;

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label="Detalle de operativo de recuperación"
      onClick={onCerrar}
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
            onClick={onCerrar}
            aria-label="Cerrar panel de detalle"
            style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)' }}
          >
            <X size={16} />
          </Button>
        </header>

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
                    <span className={styles.infoLabel}>Fecha de cierre</span>
                    <span className={styles.infoValue}>
                      {formatearFechaChilena(detalle.fechaCierre)}
                    </span>
                  </div>
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
                    Recursos e insumos asignados ({detalle.recursos.length})
                  </Heading>
                </div>

                {detalle.recursos.length === 0 ? (
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
                      {detalle.recursos.map((rec) => (
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
                    Historial del operativo ({detalle.historial.length})
                  </Heading>
                </div>

                {detalle.historial.length === 0 ? (
                  <p className={styles.infoLabel}>Sin hitos registrados.</p>
                ) : (
                  <div className={styles.timeline}>
                    {detalle.historial.map((hito) => (
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
    </div>
  );
};
