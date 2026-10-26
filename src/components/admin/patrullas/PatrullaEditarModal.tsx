'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, X, Save, Check, MapPin, Truck, Users } from 'lucide-react';
import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import InlineNotice from '@/components/ui/InlineNotice';
import { useEditarPatrullaForm } from '@/hooks/useEditarPatrullaForm';
import PatrullaDelegacionSection from './PatrullaDelegacionSection';
import PatrullaVehiculoSection from './PatrullaVehiculoSection';
import PatrullaDotacionSection from './PatrullaDotacionSection';
import type { PatrullaVerificadoraDTO } from '@/types/patrullas';
import styles from './PatrullaForm.module.css';

export interface PatrullaEditarModalProps {
  isOpen: boolean;
  patrulla: PatrullaVerificadoraDTO | null;
  onClose: () => void;
  onPatrullaActualizada?: (patrulla: PatrullaVerificadoraDTO) => void;
}

export const PatrullaEditarModal: React.FC<PatrullaEditarModalProps> = ({
  isOpen,
  patrulla,
  onClose,
  onPatrullaActualizada,
}) => {
  if (!isOpen || !patrulla) return null;

  return (
    <PatrullaEditarModalInner
      patrulla={patrulla}
      onClose={onClose}
      onPatrullaActualizada={onPatrullaActualizada}
    />
  );
};

interface PatrullaEditarModalInnerProps {
  patrulla: PatrullaVerificadoraDTO;
  onClose: () => void;
  onPatrullaActualizada?: (patrulla: PatrullaVerificadoraDTO) => void;
}

const PatrullaEditarModalInner: React.FC<PatrullaEditarModalInnerProps> = ({
  patrulla,
  onClose,
  onPatrullaActualizada,
}) => {
  const [modalConfirmarAbierto, setModalConfirmarAbierto] = useState(false);

  const {
    formData,
    touched,
    delegaciones,
    vehiculosDisponibles,
    personalElegible,
    cargandoCatalogos,
    errorCatalogos,
    serverError,
    esConflicto,
    serverFieldErrors,
    isSubmitting,
    isValid,
    clientErrors,
    estaBloqueada,
    mensajeBloqueo,
    handleNombreChange,
    handleDelegacionChange,
    handleVehiculoChange,
    handleTogglePersonal,
    handleLiderChange,
    handleBlur,
    handleConfirmSave,
  } = useEditarPatrullaForm(patrulla, (actualizada) => {
    onPatrullaActualizada?.(actualizada);
    setModalConfirmarAbierto(false);
    onClose();
  });

  // Manejo de tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !modalConfirmarAbierto) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalConfirmarAbierto, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || estaBloqueada) return;
    setModalConfirmarAbierto(true);
  };

  const delegacionSeleccionada = delegaciones.find((d) => d.id === formData.delegacionId);
  const vehiculoSeleccionado = vehiculosDisponibles.find((v) => v.id === formData.vehiculoId);
  const liderSeleccionado = personalElegible.find((p) => p.usuario_id === formData.usuarioLiderId);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="patrulla-editar-modal-title"
      className={styles.modalBackdrop}
      onClick={onClose}
    >
      <div
        className={styles.modalBoxCrear}
        onClick={(e) => e.stopPropagation()}
        data-testid="modal-editar-patrulla"
      >
        {/* Cabecera del Modal */}
        <header className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="var(--color-accent-mint, #4FAE9B)" aria-hidden="true" />
            <Heading as="h3" variant="h3" color="white" noMargin id="patrulla-editar-modal-title">
              Editar Patrulla Verificadora: {patrulla.codigo || patrulla.nombre}
            </Heading>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal de edición de patrulla"
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={20} />
          </button>
        </header>

        {/* Formulario en el Cuerpo Scrolleable */}
        <form
          onSubmit={handleSubmit}
          noValidate
          autoComplete="off"
          style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
          <div className={styles.modalBodyScroll}>
            {/* Bloqueo Operativo Preventivo */}
            {estaBloqueada && (
              <InlineNotice
                variant="error"
                title="Modificación Bloqueada por Estado Operativo"
              >
                <div data-testid="bloqueo-aviso-edicion">
                  {mensajeBloqueo ||
                    'No es posible editar la patrulla mientras se encuentre en verificación o en misión activa.'}
                </div>
              </InlineNotice>
            )}

            {/* Advertencia de Carga de Catálogos */}
            {errorCatalogos && (
              <InlineNotice variant="warning" title="Advertencia de Catálogos">
                {errorCatalogos}
              </InlineNotice>
            )}

            {/* Error de Servidor o Conflicto (409) */}
            {serverError && (
              <InlineNotice
                variant="error"
                title={
                  esConflicto
                    ? 'Bloqueo Operativo: Conflicto al Modificar'
                    : 'No fue posible guardar los cambios de la patrulla'
                }
              >
                <div>{serverError}</div>
                {serverFieldErrors && serverFieldErrors.length > 0 && (
                  <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px' }}>
                    {serverFieldErrors.map((err, index) => (
                      <li key={index}>
                        {err.campo ? <strong>{err.campo}: </strong> : null}
                        {err.mensaje}
                      </li>
                    ))}
                  </ul>
                )}
              </InlineNotice>
            )}

            {/* SECCIÓN 1: Identificación y Código Fijo */}
            <section className={styles.section} aria-labelledby="seccion-identificacion-edit">
              <div className={styles.sectionHeader}>
                <ShieldCheck size={20} color="var(--color-primary-teal, #1B6F7D)" aria-hidden="true" />
                <h2 id="seccion-identificacion-edit" className={styles.sectionTitle}>
                  Identificación de la Patrulla
                </h2>
              </div>

              <div className={styles.fieldGrid}>
                {/* Código Táctico (Inmutable) */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="patrulla-codigo-fijo" className={styles.fieldLabel}>
                    Código Identificador (Inmutable)
                  </label>
                  <input
                    id="patrulla-codigo-fijo"
                    type="text"
                    value={patrulla.codigo || patrulla.id.slice(0, 8).toUpperCase()}
                    readOnly
                    disabled
                    className={styles.inputField}
                    style={{
                      backgroundColor: 'var(--color-bg-light, #ECEFF3)',
                      color: 'var(--color-charcoal, #3B3F45)',
                      cursor: 'not-allowed',
                      fontWeight: 700,
                    }}
                    aria-describedby="help-codigo-fijo"
                  />
                  <span id="help-codigo-fijo" className={styles.helperText}>
                    El código táctico es inmutable para asegurar la trazabilidad histórica de las
                    misiones.
                  </span>
                </div>

                {/* Nombre Descriptivo */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="patrulla-nombre-edit" className={styles.fieldLabel}>
                    Nombre de la Patrulla
                  </label>
                  <input
                    id="patrulla-nombre-edit"
                    type="text"
                    value={formData.nombre}
                    disabled={estaBloqueada}
                    onChange={(e) => handleNombreChange(e.target.value)}
                    onBlur={() => handleBlur('nombre')}
                    placeholder="Ej. Patrulla Costa 01 - Reforzada"
                    className={`${styles.inputField} ${
                      touched.nombre && clientErrors.nombre ? styles.inputFieldError : ''
                    }`}
                    aria-describedby="help-nombre-edit"
                  />
                  {touched.nombre && clientErrors.nombre && (
                    <span className={styles.errorText} role="alert">
                      {clientErrors.nombre}
                    </span>
                  )}
                  <span id="help-nombre-edit" className={styles.helperText}>
                    Denominación legible de la unidad operativa (máx. 100 caracteres).
                  </span>
                </div>
              </div>
            </section>

            {/* SECCIÓN 2: Delegación Municipal Base */}
            <PatrullaDelegacionSection
              delegacionId={formData.delegacionId}
              delegaciones={delegaciones}
              cargando={cargandoCatalogos || estaBloqueada}
              errorDelegacion={touched.delegacionId ? clientErrors.delegacionId : undefined}
              onChangeDelegacion={handleDelegacionChange}
              onBlurDelegacion={() => handleBlur('delegacionId')}
            />

            {/* SECCIÓN 3: Vehículo Institucional Asignado */}
            <PatrullaVehiculoSection
              vehiculoId={formData.vehiculoId}
              vehiculos={vehiculosDisponibles}
              cargando={cargandoCatalogos || estaBloqueada}
              onChangeVehiculo={handleVehiculoChange}
            />

            {/* SECCIÓN 4: Dotación y Personal Asignado */}
            <PatrullaDotacionSection
              personalElegible={personalElegible}
              personalSeleccionadoIds={formData.personalIds}
              usuarioLiderId={formData.usuarioLiderId}
              cargando={cargandoCatalogos || estaBloqueada}
              errorPersonal={touched.personalIds ? clientErrors.personalIds : undefined}
              onTogglePersonal={estaBloqueada ? () => {} : handleTogglePersonal}
              onChangeLider={estaBloqueada ? () => {} : handleLiderChange}
            />
          </div>

          {/* Footer del Modal */}
          <footer className={styles.modalFooter}>
            <Button type="button" variant="outline" size="md" onClick={onClose}>
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!isValid || isSubmitting || estaBloqueada}
              icon={<Save size={16} />}
              data-testid="btn-guardar-cambios-patrulla"
              title={
                estaBloqueada
                  ? 'No es posible editar la patrulla mientras se encuentre en verificación o en misión activa'
                  : undefined
              }
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </footer>
        </form>

        {/* Modal de Confirmación de Edición */}
        {modalConfirmarAbierto && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-editar-modal-title"
            className={styles.modalBackdrop}
            onClick={() => setModalConfirmarAbierto(false)}
          >
            <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} color="var(--color-accent-mint, #4FAE9B)" />
                  <Heading as="h3" variant="h3" color="white" noMargin id="confirm-editar-modal-title">
                    Confirmar Modificación de Patrulla
                  </Heading>
                </div>
                <button
                  type="button"
                  onClick={() => setModalConfirmarAbierto(false)}
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
                <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--color-text-dark, #2B2B2B)' }}>
                  ¿Está seguro de que desea aplicar las modificaciones a la patrulla{' '}
                  <strong>{patrulla.codigo || patrulla.nombre}</strong>?
                </p>

                <div className={styles.confirmSummaryBox}>
                  <div className={styles.confirmItem}>
                    <span className={styles.confirmLabel}>Nombre:</span>
                    <span className={styles.confirmValue}>
                      {formData.nombre.trim() || patrulla.codigo || patrulla.nombre}
                    </span>
                  </div>

                  <div className={styles.confirmItem}>
                    <span className={styles.confirmLabel}>
                      <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      Delegación Base:
                    </span>
                    <span className={styles.confirmValue}>
                      {delegacionSeleccionada?.nombre || 'Delegación no seleccionada'}
                    </span>
                  </div>

                  <div className={styles.confirmItem}>
                    <span className={styles.confirmLabel}>
                      <Truck size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      Vehículo:
                    </span>
                    <span className={styles.confirmValue}>
                      {vehiculoSeleccionado
                        ? vehiculoSeleccionado.nombre
                        : 'Sin vehículo (despliegue pedestre / a pie)'}
                    </span>
                  </div>

                  <div className={styles.confirmItem}>
                    <span className={styles.confirmLabel}>
                      <Users size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      Dotación:
                    </span>
                    <span className={styles.confirmValue}>
                      {formData.personalIds.length}{' '}
                      {formData.personalIds.length === 1 ? 'funcionario' : 'funcionarios'}
                    </span>
                  </div>

                  <div className={styles.confirmItem}>
                    <span className={styles.confirmLabel}>Líder Táctico:</span>
                    <span className={styles.confirmValue}>
                      {liderSeleccionado
                        ? `${liderSeleccionado.nombres} ${liderSeleccionado.apellidos}`
                        : 'No asignado'}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--color-bg-light, #ECEFF3)',
                    borderLeft: '4px solid var(--color-primary-teal, #1B6F7D)',
                    padding: '10px 12px',
                    fontSize: '12px',
                    color: 'var(--color-charcoal, #3B3F45)',
                    marginTop: '16px',
                  }}
                >
                  Esta acción quedará registrada en el historial de auditoría de la plataforma municipal.
                </div>
              </div>

              <div className={styles.modalFooter}>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setModalConfirmarAbierto(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  icon={<Check size={16} />}
                  onClick={handleConfirmSave}
                  disabled={isSubmitting}
                  data-testid="btn-confirmar-guardar-edicion"
                >
                  {isSubmitting ? 'Guardando Cambios...' : 'Confirmar y Guardar'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatrullaEditarModal;
