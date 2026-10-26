'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Trash2,
  AlertTriangle,
  X,
  Truck,
  Users,
  ShieldCheck,
  FileText,
  UserCheck,
  MapPin,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import InlineNotice from '@/components/ui/InlineNotice';
import { patrullasService, DEFAULT_ENCARGADO_ID } from '@/services/patrullasService';
import type { PatrullaVerificadoraDTO } from '@/types/patrullas';
import styles from './PatrullaDesactivarModal.module.css';

export interface PatrullaDesactivarModalProps {
  isOpen: boolean;
  patrulla: PatrullaVerificadoraDTO | null;
  usuarioActivoId?: string;
  onClose: () => void;
  onPatrullaDesactivada: (patrulla: PatrullaVerificadoraDTO) => void;
}

export const PatrullaDesactivarModal: React.FC<PatrullaDesactivarModalProps> = ({
  isOpen,
  patrulla,
  usuarioActivoId = DEFAULT_ENCARGADO_ID,
  onClose,
  onPatrullaDesactivada,
}) => {
  const [desactivando, setDesactivando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [esConflicto, setEsConflicto] = useState(false);

  const handleCerrar = useCallback(() => {
    if (desactivando) return;
    setErrorMensaje(null);
    setEsConflicto(false);
    onClose();
  }, [desactivando, onClose]);

  // Manejo de teclado (tecla Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !desactivando) {
        handleCerrar();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, desactivando, handleCerrar]);

  if (!isOpen || !patrulla) {
    return null;
  }

  const estaBloqueadaPorOperacion =
    patrulla.estado === 'EN_VERIFICACION' || Boolean(patrulla.misionActiva);

  const cantIntegrantes = patrulla.integrantes?.length || 0;
  const tieneVehiculo = Boolean(patrulla.vehiculo?.nombre);

  const handleConfirmarDesactivacion = async () => {
    if (estaBloqueadaPorOperacion) return;

    setDesactivando(true);
    setErrorMensaje(null);
    setEsConflicto(false);

    try {
      const res = await patrullasService.desactivar(patrulla.id, usuarioActivoId);

      if (res.exito) {
        onPatrullaDesactivada(patrulla);
        handleCerrar();
      } else {
        if (res.esConflicto) {
          setEsConflicto(true);
          setErrorMensaje(
            res.mensaje ||
              'No es posible desactivar la patrulla mientras se encuentre en verificación o con misiones activas.'
          );
        } else if (res.esForbidden) {
          setErrorMensaje(
            res.mensaje ||
              'No cuenta con los privilegios requeridos (recursos:eliminar) para desactivar patrullas.'
          );
        } else {
          setErrorMensaje(res.mensaje || 'Error al procesar la baja lógica de la patrulla.');
        }
      }
    } catch {
      setErrorMensaje('Ocurrió un error de conexión al comunicarse con el servidor municipal.');
    } finally {
      setDesactivando(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-desactivar-patrulla-titulo"
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCerrar();
        }
      }}
      data-testid="patrulla-desactivar-modal"
    >
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        {/* Cabecera institucional */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleWrapper}>
            <Trash2 size={20} aria-hidden="true" />
            <Heading
              as="h3"
              variant="h3"
              color="white"
              noMargin
              id="modal-desactivar-patrulla-titulo"
            >
              Desactivar Patrulla Verificadora
            </Heading>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleCerrar}
            disabled={desactivando}
            aria-label="Cerrar modal de desactivación"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Cuerpo del modal */}
        <div className={styles.modalBody}>
          {/* Advertencia principal de baja lógica */}
          <div className={styles.warningBanner}>
            <AlertTriangle size={18} color="var(--color-danger, #D32F2F)" aria-hidden="true" />
            <div>
              <strong>Baja Lógica de Unidad Operativa:</strong> Al desactivar esta patrulla
              verificadora, se marcará como no disponible y se impedirá su selección para nuevos
              despachos o asignaciones en terreno.
            </div>
          </div>

          {/* Bloqueo preventivo en interfaz si se encuentra en operación */}
          {estaBloqueadaPorOperacion && (
            <div className={styles.warningBannerBlock} data-testid="bloqueo-operativo-alerta">
              <AlertTriangle size={18} color="var(--color-warning, #E65100)" aria-hidden="true" />
              <div>
                <strong>Acción Bloqueada por Estado Operativo:</strong> La patrulla se encuentra
                actualmente en estado <em>{patrulla.estado}</em>
                {patrulla.misionActiva?.codigo
                  ? ` atendiendo la misión ${patrulla.misionActiva.codigo}`
                  : ''}
                . Debe finalizar o liberar la misión activa en el Centro de Mando antes de darla de baja.
              </div>
            </div>
          )}

          {/* Mensaje de error / conflicto retornado por el backend */}
          {errorMensaje && (
            <InlineNotice
              variant={esConflicto ? 'warning' : 'error'}
              title={esConflicto ? 'Conflicto Operativo (HTTP 409)' : 'Error de Solicitud'}
              onClose={() => setErrorMensaje(null)}
            >
              {errorMensaje}
            </InlineNotice>
          )}

          {/* Ficha Resumen de la Patrulla */}
          <div className={styles.resumenCard} aria-label="Resumen de la patrulla a dar de baja">
            <div className={styles.resumenRow}>
              <ShieldCheck size={16} className={styles.resumenIcon} aria-hidden="true" />
              <span className={styles.resumenLabel}>Patrulla:</span>
              <span className={styles.resumenValue}>
                <strong>{patrulla.nombre}</strong> {patrulla.codigo ? `(${patrulla.codigo})` : ''}
              </span>
            </div>

            <div className={styles.resumenRow}>
              <MapPin size={16} className={styles.resumenIcon} aria-hidden="true" />
              <span className={styles.resumenLabel}>Delegación:</span>
              <span className={styles.resumenValue}>
                {patrulla.delegacion?.nombre || 'Sin delegación asignada'}
              </span>
            </div>

            <div className={styles.resumenRow}>
              <UserCheck size={16} className={styles.resumenIcon} aria-hidden="true" />
              <span className={styles.resumenLabel}>Funcionario Líder:</span>
              <span className={styles.resumenValue}>
                {patrulla.lider?.nombre || 'Sin funcionario líder asignado'}
              </span>
            </div>
          </div>

          {/* Liberación Inmediata de Recursos */}
          <div className={styles.liberacionBox} aria-label="Liberación inmediata de recursos">
            <div className={styles.liberacionHeader}>
              <Truck size={16} aria-hidden="true" />
              <span>Liberación Inmediata al Inventario Comunal:</span>
            </div>
            <ul className={styles.liberacionList}>
              <li>
                <strong>Vehículo institucional:</strong>{' '}
                {tieneVehiculo
                  ? `${patrulla.vehiculo?.nombre} quedará liberado a disponibilidad inmediata.`
                  : 'Sin vehículo asignado (no aplica liberación).'}
              </li>
              <li>
                <strong>Dotación de personal:</strong>{' '}
                {cantIntegrantes > 0
                  ? `${cantIntegrantes} ${
                      cantIntegrantes === 1 ? 'funcionario quedará liberado' : 'funcionarios quedarán liberados'
                    } a disponibilidad en el inventario municipal.`
                  : 'Sin integrantes adicionales asignados.'}
              </li>
            </ul>
          </div>

          {/* Nota de Auditoría Inmutable SENAPRED (§3.7) */}
          <div className={styles.auditoriaNote}>
            <FileText size={16} color="var(--color-primary-teal, #1B6F7D)" aria-hidden="true" />
            <span>
              <strong>Auditoría Inmutable:</strong> Toda la información histórica, los reportes
              técnicos emitidos en terreno y las misiones previas se conservarán intactos para
              auditorías del Sistema Nacional de Prevención y Respuesta ante Desastres (SENAPRED)
              e informes institucionales.
            </span>
          </div>
        </div>

        {/* Footer de acciones */}
        <div className={styles.modalFooter}>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleCerrar}
            disabled={desactivando}
            data-testid="btn-cancelar-desactivar-patrulla"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="md"
            onClick={handleConfirmarDesactivacion}
            disabled={desactivando || estaBloqueadaPorOperacion}
            loading={desactivando}
            icon={<Trash2 size={16} />}
            data-testid="btn-confirmar-desactivar-patrulla"
          >
            {desactivando ? 'Desactivando...' : 'Sí, Desactivar Patrulla'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PatrullaDesactivarModal;
