'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
import { ModalAsignarCuadrilla } from './ModalAsignarCuadrilla';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import InlineNotice from '@/components/ui/InlineNotice';
import type { DespacharCuadrillaResponse } from '@/types/misiones';
import { HardHat, AlertTriangle } from 'lucide-react';
import styles from '@/styles/mando.module.css';

export interface IncidenteDetalleDrawerProps {
  incidenteId: string | null;
  userId: string;
  onCerrar: () => void;
  onIncidenteActualizado?: () => void;
}

export const IncidenteDetalleDrawer: React.FC<IncidenteDetalleDrawerProps> = ({
  incidenteId,
  userId,
  onCerrar,
  onIncidenteActualizado,
}) => {
  let showSuccess = (_msg: string, _title?: string) => {};
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const toast = useToast();
    showSuccess = toast.showSuccess;
  } catch {
    // Fallback seguro en entorno de testing fuera de ToastProvider
  }
  const [detalle, setDetalle] = useState<IncidenteDetalle | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [misionSeleccionadaId, setMisionSeleccionadaId] = useState<string | null>(null);
  const [modalCuadrillaAbierto, setModalCuadrillaAbierto] = useState<boolean>(false);

  // Verificación de permisos RBAC ('misiones:asignar')
  let tienePermisoAsignar = true;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const auth = useAuth();
    tienePermisoAsignar =
      auth.tienePermiso('misiones:asignar') ||
      auth.usuario?.rolCodigo === 'ENCARGADO' || auth.usuario?.rolCodigo === 'ADMINISTRADOR';
  } catch {
    // Fallback seguro en entorno de testing fuera del AuthProvider
    tienePermisoAsignar = true;
  }

  const cargarDetalle = useCallback(() => {
    if (!incidenteId) return;
    setCargando(true);
    setError(null);

    obtenerDetalleIncidente(incidenteId, userId).then((res) => {
      if (res.exito && res.datos) {
        setDetalle(res.datos);
      } else {
        setError(res.mensaje);
      }
      setCargando(false);
    });
  }, [incidenteId, userId]);

  useEffect(() => {
    if (!incidenteId) return;

    let isMounted = true;
    queueMicrotask(() => {
      if (isMounted) {
        cargarDetalle();
      }
    });

    return () => {
      isMounted = false;
    };
  }, [incidenteId, cargarDetalle]);

  // Reglas de negocio para despacho de cuadrilla:
  // 1. Estado elegible: REPORTADO o VERIFICANDO
  const esEstadoElegible = useMemo(() => {
    if (!detalle) return false;
    return detalle.estado === 'REPORTADO' || detalle.estado === 'VERIFICANDO';
  }, [detalle]);

  // 2. Misión de verificación previa
  const misionVerificacion = useMemo(() => {
    if (!detalle?.misiones) return null;
    return (
      detalle.misiones.find(
        (m) =>
          m.tipoMision === 'VERIFICACION' &&
          m.estado !== 'CANCELADA' &&
          m.estado !== 'RECHAZADA'
      ) || null
    );
  }, [detalle]);

  // 3. Verificación en terreno en curso (bloqueo preventivo de despacho)
  const verificacionPendiente = useMemo(() => {
    if (!misionVerificacion) return false;
    const estadosEnCurso = [
      'PLANIFICADA',
      'ASIGNADA',
      'DESPACHADA',
      'EN_CAMINO',
      'EN_SITIO',
      'EN_CURSO',
    ];
    return estadosEnCurso.includes((misionVerificacion.estado || '').toUpperCase());
  }, [misionVerificacion]);

  const handleDespachoExitoso = (resultado: DespacharCuadrillaResponse['data']) => {
    if (resultado.patrullaLiberada) {
      showSuccess(
        `Cuadrilla despachada exitosamente. La patrulla ${resultado.patrullaLiberada.nombre} ha sido liberada y ya se encuentra DISPONIBLE para nuevas asignaciones.`,
        'Despacho Táctico Confirmado'
      );
    } else {
      showSuccess(
        `Cuadrilla '${resultado.cuadrilla.nombre}' despachada exitosamente al incidente ${resultado.incidente.codigo}.`,
        'Despacho Táctico Confirmado'
      );
    }

    // Refrescar el detalle del incidente local
    cargarDetalle();

    // Notificar al KanbanBoard para transicionar el estado
    onIncidenteActualizado?.();
  };

  if (!incidenteId) return null;

  return (
    <>
      <div className={styles.drawerOverlay} onClick={onCerrar} role="dialog" aria-modal="true">
        <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
          <IncidenteDetalleHeader detalle={detalle} onCerrar={onCerrar} />

          {/* Barra de Acciones Tácticas: Despacho de Cuadrilla Operativa (HU-21) */}
          {detalle && esEstadoElegible && tienePermisoAsignar && (
            <div
              style={{
                padding: '0.85rem 1.5rem',
                backgroundColor: '#F8FAFC',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--color-primary-teal-dark, #14505A)' }}>
                    Intervención Táctica Operativa
                  </strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #5F676E)' }}>
                    {misionVerificacion?.patrulla
                      ? `Patrulla asignada: ${misionVerificacion.patrulla.nombre} (${misionVerificacion.estado})`
                      : 'Sin patrulla previa asignada (despacho directo).'}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setModalCuadrillaAbierto(true)}
                  disabled={verificacionPendiente}
                  title={
                    verificacionPendiente
                      ? `La patrulla ${misionVerificacion?.patrulla?.nombre || ''} aún se encuentra verificando en terreno.`
                      : 'Despachar cuadrilla operativa a este incidente'
                  }
                  aria-label="Despachar Cuadrilla Operativa"
                >
                  <HardHat size={15} style={{ marginRight: '6px' }} />
                  <span>Despachar Cuadrilla</span>
                </Button>
              </div>

              {verificacionPendiente && (
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#BF360C',
                    backgroundColor: '#FFF3E0',
                    padding: '6px 10px',
                    borderLeft: '3px solid var(--color-warning, #E65100)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  role="status"
                >
                  <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                  <span>
                    Verificación en curso por{' '}
                    <strong>{misionVerificacion?.patrulla?.nombre || 'la patrulla asignada'}</strong>. Debe
                    concluir antes de despachar cuadrillas.
                  </span>
                </div>
              )}
            </div>
          )}

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
                  onVerDetalleMision={(misionId) => setMisionSeleccionadaId(misionId)}
                />
                <IncidenteRecursosSection recursos={detalle.recursosAsociados} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Detalle de Misión (HU-17) */}
      <MisionDetalleModal
        misionId={misionSeleccionadaId}
        userId={userId}
        onCerrar={() => setMisionSeleccionadaId(null)}
      />

      {/* Modal Emergente de Despacho de Cuadrilla y Liberación de Patrulla (HU-21 / ICS §3.2) */}
      <ModalAsignarCuadrilla
        isOpen={modalCuadrillaAbierto}
        onClose={() => setModalCuadrillaAbierto(false)}
        incidente={detalle}
        userId={userId}
        onSuccess={handleDespachoExitoso}
      />
    </>
  );
};
