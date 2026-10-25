'use client';

import React, { useEffect } from 'react';
import { ShieldCheck, X, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import InlineNotice from '@/components/ui/InlineNotice';
import { useNuevaPatrullaForm } from '@/hooks/useNuevaPatrullaForm';
import PatrullaIdentificacionSection from './PatrullaIdentificacionSection';
import PatrullaDelegacionSection from './PatrullaDelegacionSection';
import PatrullaVehiculoSection from './PatrullaVehiculoSection';
import PatrullaDotacionSection from './PatrullaDotacionSection';
import PatrullaConfirmModal from './PatrullaConfirmModal';
import type { PatrullaVerificadoraDTO } from '@/types/patrullas';
import styles from './PatrullaForm.module.css';

export interface PatrullaCrearModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatrullaCreada?: (patrulla: PatrullaVerificadoraDTO) => void;
}

export const PatrullaCrearModal: React.FC<PatrullaCrearModalProps> = ({
  isOpen,
  onClose,
  onPatrullaCreada,
}) => {
  const {
    formData,
    touched,
    delegaciones,
    vehiculosDisponibles,
    personalElegible,
    cargandoCatalogos,
    errorCatalogos,
    serverError,
    serverFieldErrors,
    createdPatrulla,
    isSubmitting,
    showConfirmModal,
    clientErrors,
    handleCodigoChange,
    handleNombreChange,
    handleDelegacionChange,
    handleVehiculoChange,
    handleTogglePersonal,
    handleLiderChange,
    handleBlur,
    handleOpenConfirmModal,
    handleCloseConfirmModal,
    handleConfirmSave,
    handleReset,
  } = useNuevaPatrullaForm();

  // Si la patrulla fue creada con éxito, notificar al callback y cerrar el modal
  useEffect(() => {
    if (createdPatrulla) {
      onPatrullaCreada?.(createdPatrulla);
      handleReset();
      onClose();
    }
  }, [createdPatrulla, onPatrullaCreada, handleReset, onClose]);

  // Manejar tecla Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showConfirmModal) {
        handleReset();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showConfirmModal, handleReset, onClose]);

  if (!isOpen) return null;

  const handleCerrar = () => {
    handleReset();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="patrulla-crear-modal-title"
      className={styles.modalBackdrop}
      onClick={handleCerrar}
    >
      <div className={styles.modalBoxCrear} onClick={(e) => e.stopPropagation()}>
        {/* Cabecera del Modal */}
        <header className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="var(--color-accent-mint, #4FAE9B)" aria-hidden="true" />
            <Heading as="h3" variant="h3" color="white" noMargin id="patrulla-crear-modal-title">
              Registrar Nueva Patrulla Verificadora
            </Heading>
          </div>

          <button
            type="button"
            onClick={handleCerrar}
            aria-label="Cerrar modal de alta de patrulla"
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
          onSubmit={handleOpenConfirmModal}
          noValidate
          autoComplete="off"
          style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
          <div className={styles.modalBodyScroll}>
            {/* Aviso de Advertencia en Carga de Catálogos */}
            {errorCatalogos && (
              <InlineNotice variant="warning" title="Advertencia de Catálogos">
                {errorCatalogos}
              </InlineNotice>
            )}

            {/* Alerta de Error de Servidor o Conflicto (409) */}
            {serverError && (
              <InlineNotice
                variant="error"
                title="No fue posible dar de alta la patrulla verificadora"
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

            {/* SECCIÓN 1: Identificación (Código identificador y nombre) */}
            <PatrullaIdentificacionSection
              codigo={formData.codigo}
              nombre={formData.nombre}
              errorCodigo={
                (touched.codigo ? clientErrors.codigo : undefined) ||
                serverFieldErrors.find((e) => e.campo === 'codigo')?.mensaje
              }
              errorNombre={touched.nombre ? clientErrors.nombre : undefined}
              onChangeCodigo={handleCodigoChange}
              onChangeNombre={handleNombreChange}
              onBlurCodigo={() => handleBlur('codigo')}
            />

            {/* SECCIÓN 2: Delegación Municipal Base */}
            <PatrullaDelegacionSection
              delegacionId={formData.delegacionId}
              delegaciones={delegaciones}
              cargando={cargandoCatalogos}
              errorDelegacion={touched.delegacionId ? clientErrors.delegacionId : undefined}
              onChangeDelegacion={handleDelegacionChange}
              onBlurDelegacion={() => handleBlur('delegacionId')}
            />

            {/* SECCIÓN 3: Vehículo Institucional Asignado */}
            <PatrullaVehiculoSection
              vehiculoId={formData.vehiculoId}
              vehiculos={vehiculosDisponibles}
              cargando={cargandoCatalogos}
              onChangeVehiculo={handleVehiculoChange}
            />

            {/* SECCIÓN 4: Dotación y Personal Asignado */}
            <PatrullaDotacionSection
              personalElegible={personalElegible}
              personalSeleccionadoIds={formData.personalIds}
              usuarioLiderId={formData.usuarioLiderId}
              cargando={cargandoCatalogos}
              errorPersonal={touched.personalIds ? clientErrors.personalIds : undefined}
              onTogglePersonal={handleTogglePersonal}
              onChangeLider={handleLiderChange}
            />
          </div>

          {/* Footer del Modal */}
          <footer className={styles.modalFooter}>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleCerrar}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={<Plus size={16} />}
            >
              Guardar Patrulla
            </Button>
          </footer>
        </form>

        {/* Modal de Confirmación Previa */}
        <PatrullaConfirmModal
          isOpen={showConfirmModal}
          isSubmitting={isSubmitting}
          formData={formData}
          delegaciones={delegaciones}
          vehiculos={vehiculosDisponibles}
          personal={personalElegible}
          onClose={handleCloseConfirmModal}
          onConfirm={handleConfirmSave}
        />
      </div>
    </div>
  );
};

export default PatrullaCrearModal;
