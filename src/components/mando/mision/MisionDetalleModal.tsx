'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, ShieldAlert, FileQuestion } from 'lucide-react';
import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import {
  obtenerDetalleMision,
  DEFAULT_ENCARGADO_ID,
} from '@/services/misionesService';
import { getSocket } from '@/lib/socket/client';
import {
  esPayloadAdjuntoCreadoValido,
  type AdjuntoEvidencia,
  type MisionDetalleCompleto,
} from '@/types/misiones';
import { MisionSkeletonLoader } from './MisionSkeletonLoader';
import { MisionDetalleHeader } from './MisionDetalleHeader';
import { MisionContextoSection } from './MisionContextoSection';
import { MisionEquipoSection } from './MisionEquipoSection';
import { MisionBitacoraSection } from './MisionBitacoraSection';
import { MisionReportesSection } from './MisionReportesSection';
import styles from '@/styles/mision-detalle.module.css';

interface MisionDetalleModalProps {
  misionId: string | null;
  userId?: string;
  onCerrar: () => void;
}

export const MisionDetalleModal: React.FC<MisionDetalleModalProps> = ({
  misionId,
  userId = DEFAULT_ENCARGADO_ID,
  onCerrar,
}) => {
  const [mision, setMision] = useState<MisionDetalleCompleto | null>(null);
  const [cargando, setCargando] = useState<boolean>(Boolean(misionId));
  const [error, setError] = useState<string | null>(null);
  const [codigoError, setCodigoError] = useState<number | undefined>(undefined);

  useEffect(() => {
    let activo = true;
    if (!misionId) return;

    queueMicrotask(() => {
      if (!activo) return;
      setCargando(true);
      setError(null);
      setCodigoError(undefined);
    });

    void (async () => {
      const res = await obtenerDetalleMision(misionId, userId);
      if (!activo) return;

      if (res.exito && res.datos) {
        setMision(res.datos);
      } else {
        setError(res.mensaje);
        setCodigoError(res.codigoError);
      }
      setCargando(false);
    })();

    return () => {
      activo = false;
    };
  }, [misionId, userId]);

  // Suscripción en tiempo real a adjunto:creado (HU-43)
  useEffect(() => {
    if (!misionId) return;

    const socket = getSocket();

    const asegurarSalasEncargado = () => {
      socket.emit('join', 'encargado');
      socket.emit('unirse', 'sala:encargados');
    };

    if (!socket.connected && typeof socket.connect === 'function') {
      socket.connect();
    }
    if (socket.connected) {
      asegurarSalasEncargado();
    }

    const handleAdjuntoCreado = (rawPayload: unknown) => {
      const p = rawPayload as Record<string, unknown> | null | undefined;
      const candidato = (p?.datos || p?.data || rawPayload) as unknown;
      if (!esPayloadAdjuntoCreadoValido(candidato)) return;

      const nuevoAdjunto: AdjuntoEvidencia = {
        id: candidato.id,
        nombreArchivo: candidato.nombreArchivo,
        url: candidato.url,
        tipoMime: candidato.tipoMime,
        tamanoBytes: candidato.tamanoBytes,
        creadoEn: candidato.creadoEn,
      };

      let requiereRecarga = false;

      setMision((prev) => {
        if (!prev || prev.id !== misionId) return prev;

        if (candidato.reporteTerrenoId) {
          const existeReporte = (prev.reportesTerreno || []).some(
            (r) => r.id === candidato.reporteTerrenoId
          );
          if (existeReporte) {
            return {
              ...prev,
              reportesTerreno: prev.reportesTerreno.map((rep) => {
                if (rep.id !== candidato.reporteTerrenoId) return rep;
                if (rep.adjuntos.some((a) => a.id === nuevoAdjunto.id)) return rep;
                return {
                  ...rep,
                  adjuntos: [...rep.adjuntos, nuevoAdjunto],
                };
              }),
            };
          }
          requiereRecarga = true;
          return prev;
        }

        if (candidato.incidenteId && prev.incidente?.id === candidato.incidenteId) {
          requiereRecarga = true;
        }
        return prev;
      });

      if (requiereRecarga) {
        void obtenerDetalleMision(misionId, userId).then((res) => {
          if (res.exito && res.datos) {
            setMision(res.datos);
          }
        });
      }
    };

    socket.on('connect', asegurarSalasEncargado);
    socket.on('adjunto:creado', handleAdjuntoCreado);

    return () => {
      socket.off('connect', asegurarSalasEncargado);
      socket.off('adjunto:creado', handleAdjuntoCreado);
    };
  }, [misionId, userId]);

  // Manejo de tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCerrar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCerrar]);

  if (!misionId) return null;

  return (
    <div
      className={styles.modalOverlay}
      onClick={onCerrar}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mision-detalle-titulo"
    >
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {cargando && (
          <div style={{ padding: 'var(--space-6, 24px)' }}>
            <div style={{ marginBottom: 'var(--space-4, 16px)' }}>
              <Heading as="h3" variant="h3" color="teal">
                Cargando información detallada de la misión...
              </Heading>
            </div>
            <MisionSkeletonLoader />
          </div>
        )}

        {!cargando && error && (
          <div style={{ padding: 'var(--space-6, 24px)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4, 16px)' }}>
            <div className={styles.emptyStateContainer}>
              {codigoError === 403 ? (
                <ShieldAlert size={48} color="var(--color-danger, #D32F2F)" />
              ) : codigoError === 404 ? (
                <FileQuestion size={48} color="var(--color-warning, #E65100)" />
              ) : (
                <AlertTriangle size={48} color="var(--color-danger, #D32F2F)" />
              )}

              <Heading as="h3" variant="h3" color="charcoal">
                {codigoError === 403
                  ? 'Acceso Restringido'
                  : codigoError === 404
                  ? 'Misión No Encontrada'
                  : 'Error al consultar la misión'}
              </Heading>

              <p className={styles.emptyStateSubtitle}>{error}</p>

              <div style={{ marginTop: 'var(--space-2, 8px)' }}>
                <Button variant="secondary" size="md" onClick={onCerrar}>
                  Volver al listado
                </Button>
              </div>
            </div>
          </div>
        )}

        {!cargando && !error && mision && (
          <>
            <MisionDetalleHeader mision={mision} onCerrar={onCerrar} />

            <div className={styles.modalBody}>
              {/* Banner de Rechazo si aplica */}
              {mision.estado === 'RECHAZADA' && mision.justificacionRechazo && (
                <div className={styles.bannerRechazo} role="alert">
                  <AlertTriangle className={styles.bannerRechazoIcon} size={20} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '14px', marginBottom: '2px' }}>
                      Misión Rechazada por la Unidad en Terreno
                    </strong>
                    <span style={{ fontSize: '13px' }}>
                      <strong>Motivo indicado:</strong> {mision.justificacionRechazo}
                    </span>
                  </div>
                </div>
              )}

              {/* Contexto: Incidente o Prevención */}
              <MisionContextoSection
                incidente={mision.incidente}
                prevencion={mision.prevencion}
                descripcionMision={mision.descripcion}
              />

              {/* Unidad y Recursos Asignados */}
              <MisionEquipoSection
                cuadrilla={mision.cuadrilla}
                patrulla={mision.patrulla}
              />

              {/* Bitácora de Tiempos */}
              <MisionBitacoraSection bitacora={mision.bitacoraTiempos || []} />

              {/* Reportes de Terreno y Evidencia */}
              <MisionReportesSection reportes={mision.reportesTerreno || []} />
            </div>

            <footer className={styles.modalFooter}>
              <Button variant="secondary" size="md" onClick={onCerrar}>
                Cerrar Detalle
              </Button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};
