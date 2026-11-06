'use client';

import React, { useMemo } from 'react';
import { ShieldCheck, X, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import { obtenerNombreDelegacion } from '@/lib/utils/delegacionUtils';
import { formatearEstado } from '@/lib/utils/estadoUtils';
import type { CatalogoItem } from '@/types/catalogos';
import type { RecursoItem } from '@/types/recurso';
import type { EmpleadoUsuario } from '@/types/empleados';
import type { NuevaPatrullaFormState } from '@/hooks/useNuevaPatrullaForm';
import type { PatrullaResumenAsignacion } from './PatrullaVehiculoSection';
import styles from './PatrullaForm.module.css';

interface PatrullaConfirmModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  formData: NuevaPatrullaFormState;
  delegaciones: CatalogoItem[];
  vehiculos: RecursoItem[];
  personal: EmpleadoUsuario[];
  mapaPatrullasPorVehiculo?: Record<string, PatrullaResumenAsignacion[]>;
  mapaPatrullasPorPersonal?: Record<string, PatrullaResumenAsignacion[]>;
  onClose: () => void;
  onConfirm: () => void;
}

export const PatrullaConfirmModal: React.FC<PatrullaConfirmModalProps> = ({
  isOpen,
  isSubmitting,
  formData,
  delegaciones,
  vehiculos,
  personal,
  mapaPatrullasPorVehiculo = {},
  mapaPatrullasPorPersonal = {},
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const delegacionSeleccionada = delegaciones.find((d) => d.id === formData.delegacionId);
  const vehiculoSeleccionado = vehiculos.find((v) => v.id === formData.vehiculoId);
  const liderSeleccionado = personal.find((p) => p.usuario_id === formData.usuarioLiderId);
  const nombreDisplay = formData.nombre.trim() || formData.codigo.trim().toUpperCase();

  // Advertencias de recursos y personal compartido (deduplicadas por ID)
  const otrasPatrullasVehiculo = useMemo(() => {
    if (!formData.vehiculoId) return [];
    const list = mapaPatrullasPorVehiculo[formData.vehiculoId] || [];
    const seen = new Set<string>();
    return list.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }, [formData.vehiculoId, mapaPatrullasPorVehiculo]);

  const integrantesConOtrasPatrullas = useMemo(() => {
    return formData.personalIds
      .map((pId) => {
        const funcionario = personal.find((p) => p.personal_id === pId);
        const list = mapaPatrullasPorPersonal[pId] || [];
        const seen = new Set<string>();
        const otrasPat = list.filter((p) => {
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });
        return { funcionario, otrasPat };
      })
      .filter((item) => item.otrasPat.length > 0);
  }, [formData.personalIds, personal, mapaPatrullasPorPersonal]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className={styles.modalBackdrop}
      onClick={onClose}
    >
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="var(--color-accent-mint, #4FAE9B)" />
            <Heading as="h3" variant="h3" color="white" noMargin id="confirm-modal-title">
              Confirmar Alta de Patrulla Verificadora
            </Heading>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal de confirmación"
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-dark, #2B2B2B)' }}>
            Revise los datos de la unidad antes de formalizar su registro en el sistema:
          </p>

          <div
            style={{
              backgroundColor: 'var(--color-bg-light, #ECEFF3)',
              padding: '16px',
              border: '1px solid var(--border-color-neutral, #DFE3E8)',
            }}
          >
            <div className={styles.resumenItem}>
              <span className={styles.resumenLabel}>Código Identificador:</span>
              <span className={styles.resumenValue}>{formData.codigo.toUpperCase()}</span>
            </div>

            <div className={styles.resumenItem}>
              <span className={styles.resumenLabel}>Nombre de Unidad:</span>
              <span className={styles.resumenValue}>{nombreDisplay}</span>
            </div>

            <div className={styles.resumenItem}>
              <span className={styles.resumenLabel}>Delegación Territorial:</span>
              <span className={styles.resumenValue}>
                {delegacionSeleccionada
                  ? obtenerNombreDelegacion(
                      delegacionSeleccionada.nombre || delegacionSeleccionada.id,
                      delegacionSeleccionada.nombre
                    )
                  : 'No especificada'}
              </span>
            </div>

            <div className={styles.resumenItem}>
              <span className={styles.resumenLabel}>Vehículo Asignado:</span>
              <span className={styles.resumenValue}>
                {vehiculoSeleccionado
                  ? `${vehiculoSeleccionado.nombre} ${
                      vehiculoSeleccionado.detalles?.patente
                        ? `(${vehiculoSeleccionado.detalles.patente})`
                        : ''
                    }`
                  : 'Despliegue a pie / Sin vehículo'}
              </span>
            </div>

            <div className={styles.resumenItem}>
              <span className={styles.resumenLabel}>Dotación Total:</span>
              <span className={styles.resumenValue}>
                {formData.personalIds.length}{' '}
                {formData.personalIds.length === 1 ? 'funcionario' : 'funcionarios'}
              </span>
            </div>

            <div className={styles.resumenItem}>
              <span className={styles.resumenLabel}>Líder Responsable:</span>
              <span className={styles.resumenValue}>
                {liderSeleccionado
                  ? `${liderSeleccionado.nombres} ${liderSeleccionado.apellidos}`
                  : 'Primer integrante'}
              </span>
            </div>

            <div className={styles.resumenItem} style={{ borderBottom: 'none' }}>
              <span className={styles.resumenLabel}>Estado Operativo Inicial:</span>
              <span
                className={styles.resumenValue}
                style={{ color: 'var(--color-success, #2E7D32)' }}
              >
                Disponible
              </span>
            </div>
          </div>

          {/* Avisos si hay vehículo o personal compartido */}
          {(otrasPatrullasVehiculo.length > 0 || integrantesConOtrasPatrullas.length > 0) && (
            <div
              style={{
                marginTop: '12px',
                padding: '10px 14px',
                backgroundColor: 'var(--color-warning-bg, #FFF3E0)',
                border: '1px solid rgba(230, 81, 0, 0.3)',
                fontSize: '13px',
                color: 'var(--color-charcoal, #3B3F45)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--color-warning, #E65100)' }}>
                <AlertTriangle size={15} />
                <span>Asignaciones compartidas detectadas:</span>
              </div>
              {otrasPatrullasVehiculo.length > 0 && (
                <div>
                  • <strong>Vehículo:</strong> asignado también en {otrasPatrullasVehiculo.map((p) => p.nombre).join(', ')}.
                </div>
              )}
              {integrantesConOtrasPatrullas.length > 0 && (
                <div>
                  • <strong>Dotación:</strong> {integrantesConOtrasPatrullas.map((item) => `${item.funcionario?.nombres || 'Funcionario'} (en ${item.otrasPat.map((p) => p.nombre).join(', ')})`).join('; ')}.
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onConfirm}
            loading={isSubmitting}
          >
            Confirmar y Dar de Alta
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PatrullaConfirmModal;
