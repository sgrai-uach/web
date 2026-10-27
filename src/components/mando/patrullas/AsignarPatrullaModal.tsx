'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  ShieldCheck,
  Send,
  RefreshCw,
  AlertTriangle,
  MapPin,
  User,
  Users,
} from 'lucide-react';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import InlineNotice from '@/components/ui/InlineNotice';
import { useToast } from '@/components/ui/Toast';
import { listarPatrullasDisponibles } from '@/services/patrullasService';
import { despacharPatrullaVerificadora } from '@/services/misionesService';
import type { PatrullaVerificadoraDTO } from '@/types/patrullas';
import type { DespacharPatrullaResponseData } from '@/types/misiones';
import styles from './AsignarPatrullaModal.module.css';

export interface IncidenteParaAsignacion {
  id: string;
  codigo: string;
  tipoAfectacion: string;
  direccion: string;
  prioridad: string;
}

export interface AsignarPatrullaModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidente: IncidenteParaAsignacion | null;
  userId?: string;
  onAsignacionExitosa: (data: DespacharPatrullaResponseData) => void;
}

export const AsignarPatrullaModal: React.FC<AsignarPatrullaModalProps> = ({
  isOpen,
  onClose,
  incidente,
  userId,
  onAsignacionExitosa,
}) => {
  const { showSuccess, showError } = useToast();
  const [patrullas, setPatrullas] = useState<PatrullaVerificadoraDTO[]>([]);
  const [patrullaSeleccionadaId, setPatrullaSeleccionadaId] = useState<string>('');
  const [cargandoPatrullas, setCargandoPatrullas] = useState<boolean>(false);
  const [despachando, setDespachando] = useState<boolean>(false);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [esConflicto, setEsConflicto] = useState<boolean>(false);
  const [esForbidden, setEsForbidden] = useState<boolean>(false);

  const cargarPatrullasDisponibles = useCallback(async () => {
    setCargandoPatrullas(true);
    setErrorMensaje(null);
    setEsConflicto(false);
    setEsForbidden(false);

    try {
      const res = await listarPatrullasDisponibles(userId);
      if (res.esForbidden) {
        setEsForbidden(true);
        setErrorMensaje(
          'No cuenta con los permisos necesarios para consultar patrullas verificadoras.'
        );
        setPatrullas([]);
      } else if (res.exito) {
        setPatrullas(res.data);
        if (res.data.length > 0) {
          // Pre-seleccionar la primera patrulla disponible si no hay una seleccionada
          setPatrullaSeleccionadaId((prev) => {
            const existe = res.data.some((p) => p.id === prev);
            return existe ? prev : res.data[0].id;
          });
        } else {
          setPatrullaSeleccionadaId('');
        }
      } else {
        setErrorMensaje(res.mensaje || 'Error al obtener patrullas disponibles.');
        setPatrullas([]);
      }
    } catch {
      setErrorMensaje('Error de conexión al consultar patrullas disponibles.');
      setPatrullas([]);
    } finally {
      setCargandoPatrullas(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen && incidente) {
      cargarPatrullasDisponibles();
    } else {
      setPatrullaSeleccionadaId('');
      setErrorMensaje(null);
      setEsConflicto(false);
      setEsForbidden(false);
    }
  }, [isOpen, incidente, cargarPatrullasDisponibles]);

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !despachando) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, despachando, onClose]);

  const patrullaSeleccionada = useMemo(() => {
    return patrullas.find((p) => p.id === patrullaSeleccionadaId) || null;
  }, [patrullas, patrullaSeleccionadaId]);

  const handleDespachar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidente || !patrullaSeleccionadaId || despachando) return;

    setDespachando(true);
    setErrorMensaje(null);
    setEsConflicto(false);

    try {
      const res = await despacharPatrullaVerificadora(
        {
          incidenteId: incidente.id,
          patrullaId: patrullaSeleccionadaId,
          titulo: `Verificación: ${incidente.tipoAfectacion} - ${incidente.codigo}`,
          prioridad: (incidente.prioridad as 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA') || 'MEDIA',
        },
        userId
      );

      if (res.esConflicto) {
        setEsConflicto(true);
        setErrorMensaje(
          'La patrulla seleccionada ya no se encuentra disponible. Por favor selecciona otra patrulla.'
        );
        showError(
          'La patrulla seleccionada ya no se encuentra disponible. Por favor selecciona otra patrulla.',
          'Conflicto de Disponibilidad'
        );
        // Refrescar lista de patrullas disponibles inmediatamente
        await cargarPatrullasDisponibles();
        return;
      }

      if (res.esForbidden) {
        setEsForbidden(true);
        setErrorMensaje(
          res.mensaje || 'No cuenta con el permiso requerido (misiones:asignar) para despachar patrullas.'
        );
        showError(
          'No cuenta con el permiso requerido (misiones:asignar) para despachar patrullas.',
          'Acceso Denegado'
        );
        return;
      }

      if (res.exito && res.data) {
        showSuccess(
          `Misión ${res.data.mision.codigo} creada. Patrulla "${res.data.patrulla.nombre}" despachada exitosamente.`,
          'Despacho Confirmado'
        );
        onAsignacionExitosa(res.data);
        onClose();
      } else {
        setErrorMensaje(res.mensaje || 'Error al despachar la patrulla.');
        showError(res.mensaje || 'No se pudo completar el despacho.', 'Error de Despacho');
      }
    } catch {
      setErrorMensaje('Error inesperado de comunicación con el servidor.');
      showError('Error inesperado al conectar con el servidor.', 'Error de Conexión');
    } finally {
      setDespachando(false);
    }
  };

  if (!isOpen || !incidente) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="asignar-patrulla-title"
      className={styles.backdrop}
      onClick={() => {
        if (!despachando) onClose();
      }}
    >
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleWrapper}>
            <ShieldCheck size={22} aria-hidden="true" />
            <Heading as="h3" variant="h3" color="white" noMargin id="asignar-patrulla-title">
              Asignar Patrulla Verificadora
            </Heading>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            disabled={despachando}
            aria-label="Cerrar ventana de asignación"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleDespachar}>
          <div className={styles.modalBody}>
            {/* Ficha resumen del incidente */}
            <div className={styles.incidenteResumenCard}>
              <div className={styles.incidenteHeaderRow}>
                <span className={styles.incidenteCodigo}>Incidente: {incidente.codigo}</span>
                <span className={styles.badgePrioridad}>Prioridad: {incidente.prioridad}</span>
              </div>
              <div className={styles.incidenteInfoGrid}>
                <div>
                  <span className={styles.incidenteLabel}>Tipo de Afectación</span>
                  <span>{incidente.tipoAfectacion}</span>
                </div>
                <div>
                  <span className={styles.incidenteLabel}>Ubicación</span>
                  <span title={incidente.direccion}>
                    {incidente.direccion || 'Sin dirección especificada'}
                  </span>
                </div>
              </div>
            </div>

            {/* Mensajes de error / conflicto / permisos */}
            {esConflicto && (
              <InlineNotice variant="error">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={18} aria-hidden="true" />
                  <span>
                    La patrulla seleccionada ya no se encuentra disponible. Por favor selecciona otra patrulla.
                  </span>
                </div>
              </InlineNotice>
            )}

            {esForbidden && (
              <InlineNotice variant="error">
                No cuenta con el permiso requerido (<code>misiones:asignar</code>) para despachar personal verificador.
              </InlineNotice>
            )}

            {!esConflicto && !esForbidden && errorMensaje && (
              <InlineNotice variant="error">{errorMensaje}</InlineNotice>
            )}

            {/* Selector de patrulla disponible */}
            <div className={styles.formGroup}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label htmlFor="selector-patrulla-verificadora" className={styles.formLabel}>
                  <Users size={16} aria-hidden="true" />
                  <span>Patrulla Verificadora Disponible:</span>
                </label>
                <button
                  type="button"
                  onClick={cargarPatrullasDisponibles}
                  disabled={cargandoPatrullas || despachando}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary-teal, #1B6F7D)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                  title="Refrescar listado de patrullas disponibles"
                >
                  <RefreshCw size={13} className={cargandoPatrullas ? 'animate-spin' : ''} />
                  <span>Actualizar</span>
                </button>
              </div>

              {cargandoPatrullas ? (
                <div
                  style={{
                    padding: '14px',
                    textAlign: 'center',
                    color: 'var(--color-text-muted, #5F676E)',
                    fontSize: '0.875rem',
                    backgroundColor: 'var(--color-bg-light, #ECEFF3)',
                  }}
                >
                  Consultando patrullas en servicio disponible...
                </div>
              ) : patrullas.length === 0 ? (
                <InlineNotice variant="info">
                  Actualmente no existen patrullas verificadoras en estado <strong>DISPONIBLE</strong>. Todas las unidades se encuentran asignadas o fuera de servicio.
                </InlineNotice>
              ) : (
                <select
                  id="selector-patrulla-verificadora"
                  className={styles.selectInput}
                  value={patrullaSeleccionadaId}
                  onChange={(e) => setPatrullaSeleccionadaId(e.target.value)}
                  disabled={despachando}
                  required
                >
                  {patrullas.map((patrulla) => (
                    <option key={patrulla.id} value={patrulla.id}>
                      {patrulla.nombre} — {patrulla.delegacion?.nombre || 'Sin delegación'}
                      {patrulla.lider ? ` (Líder: ${patrulla.lider.nombre})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Vista previa de datos de la patrulla seleccionada */}
            {patrullaSeleccionada && (
              <div className={styles.patrullaPreviewBox}>
                <div className={styles.patrullaPreviewTitle}>
                  <ShieldCheck size={15} />
                  <span>Detalles de la Dotación a Despachar:</span>
                </div>
                <div className={styles.patrullaPreviewRow}>
                  <MapPin size={14} color="var(--color-primary-teal)" />
                  <span>
                    <strong>Delegación:</strong>{' '}
                    {patrullaSeleccionada.delegacion?.nombre || 'No informada'}
                  </span>
                </div>
                <div className={styles.patrullaPreviewRow}>
                  <User size={14} color="var(--color-primary-teal)" />
                  <span>
                    <strong>Líder a cargo:</strong>{' '}
                    {patrullaSeleccionada.lider?.nombre || 'No asignado'}
                    {patrullaSeleccionada.lider?.telefono ? ` (${patrullaSeleccionada.lider.telefono})` : ''}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className={styles.modalFooter}>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={despachando}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={
                despachando ||
                cargandoPatrullas ||
                patrullas.length === 0 ||
                !patrullaSeleccionadaId ||
                esForbidden
              }
            >
              <Send size={15} aria-hidden="true" style={{ marginRight: '6px' }} />
              <span>{despachando ? 'Despachando...' : 'Confirmar y Despachar'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
