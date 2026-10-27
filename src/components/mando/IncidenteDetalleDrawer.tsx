'use client';

import React, { useEffect, useState } from 'react';
import {
  obtenerDetalleIncidente,
  type IncidenteDetalle,
} from '@/services/incidentesService';
import { IncidenteDetalleHeader } from './drawer/IncidenteDetalleHeader';
import { IncidenteResumenSection } from './drawer/IncidenteResumenSection';
import { IncidenteUbicacionSection } from './drawer/IncidenteUbicacionSection';
import { IncidenteInformanteSection } from './drawer/IncidenteInformanteSection';
import { IncidenteMisionesSection } from './drawer/IncidenteMisionesSection';
import { IncidenteRecursosSection } from './drawer/IncidenteRecursosSection';
import { MisionDetalleModal } from './mision/MisionDetalleModal';
import { AsignarPatrullaModal } from './patrullas/AsignarPatrullaModal';
import type { DespacharPatrullaResponseData } from '@/types/misiones';
import InlineNotice from '@/components/ui/InlineNotice';
import styles from '@/styles/mando.module.css';

interface IncidenteDetalleDrawerProps {
  incidenteId: string | null;
  userId: string;
  onCerrar: () => void;
}

export const IncidenteDetalleDrawer: React.FC<IncidenteDetalleDrawerProps> = ({
  incidenteId,
  userId,
  onCerrar,
}) => {
  const [detalle, setDetalle] = useState<IncidenteDetalle | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [misionSeleccionadaId, setMisionSeleccionadaId] = useState<string | null>(null);
  const [modalAsignarPatrullaAbierto, setModalAsignarPatrullaAbierto] = useState<boolean>(false);

  useEffect(() => {
    if (!incidenteId) return;

    let isMounted = true;
    queueMicrotask(() => {
      if (isMounted) {
        setCargando(true);
        setError(null);
      }
    });

    obtenerDetalleIncidente(incidenteId, userId).then((res) => {
      if (!isMounted) return;
      if (res.exito && res.datos) {
        setDetalle(res.datos);
      } else {
        setError(res.mensaje);
      }
      setCargando(false);
    });

    return () => {
      isMounted = false;
    };
  }, [incidenteId, userId]);

  const handleAsignacionExitosa = (data: DespacharPatrullaResponseData) => {
    setDetalle((prev) => {
      if (!prev) return prev;
      const nuevaMision = {
        id: data.mision.id,
        codigo: data.mision.codigo,
        titulo: data.mision.titulo,
        tipoMision: data.mision.tipoMision,
        estado: data.mision.estado,
        prioridad: prev.prioridad,
        justificacionRechazo: null,
        patrulla: {
          id: data.patrulla.id,
          nombre: data.patrulla.nombre,
          estado: data.patrulla.estado,
        },
        cuadrilla: null,
      };
      return {
        ...prev,
        estado: 'VERIFICANDO',
        misiones: [nuevaMision, ...prev.misiones],
      };
    });
  };

  if (!incidenteId) return null;

  return (
    <>
      <div className={styles.drawerOverlay} onClick={onCerrar} role="dialog" aria-modal="true">
        <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
          <IncidenteDetalleHeader
            detalle={detalle}
            onCerrar={onCerrar}
            onAsignarPatrulla={() => setModalAsignarPatrullaAbierto(true)}
          />

          <div className={styles.drawerBody}>
            {cargando && (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-muted, #5F676E)' }}>
                Cargando información detallada del incidente...
              </div>
            )}

            {error && (
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <InlineNotice variant="error">
                  {error}
                </InlineNotice>
              </div>
            )}

            {!cargando && detalle && (
              <>
                <IncidenteResumenSection detalle={detalle} />
                <IncidenteUbicacionSection detalle={detalle} />
                <IncidenteInformanteSection detalle={detalle} />
                <IncidenteMisionesSection
                  misiones={detalle.misiones}
                  incidenteEstado={detalle.estado}
                  onVerDetalleMision={(misionId) => setMisionSeleccionadaId(misionId)}
                  onAsignarPatrulla={() => setModalAsignarPatrullaAbierto(true)}
                />
                <IncidenteRecursosSection recursos={detalle.recursosAsociados} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Detalle de Misión (HU-17) con preservación del contexto del incidente y tablero */}
      <MisionDetalleModal
        misionId={misionSeleccionadaId}
        userId={userId}
        onCerrar={() => setMisionSeleccionadaId(null)}
      />

      {/* Modal de Asignación de Patrulla Verificadora (HU-20) */}
      <AsignarPatrullaModal
        isOpen={modalAsignarPatrullaAbierto}
        onClose={() => setModalAsignarPatrullaAbierto(false)}
        incidente={
          detalle
            ? {
                id: detalle.id,
                codigo: detalle.codigo,
                tipoAfectacion: detalle.tipoAfectacion,
                direccion: detalle.direccion,
                prioridad: detalle.prioridad,
              }
            : null
        }
        userId={userId}
        onAsignacionExitosa={handleAsignacionExitosa}
      />
    </>
  );
};
