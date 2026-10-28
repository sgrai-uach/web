'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import Button from '@/components/ui/Button';
import InlineNotice from '@/components/ui/InlineNotice';
import { useNuevaPatrullaForm } from '@/hooks/useNuevaPatrullaForm';
import PatrullaIdentificacionSection from './PatrullaIdentificacionSection';
import PatrullaDelegacionSection from './PatrullaDelegacionSection';
import PatrullaVehiculoSection from './PatrullaVehiculoSection';
import PatrullaDotacionSection from './PatrullaDotacionSection';
import PatrullaConfirmModal from './PatrullaConfirmModal';
import PatrullaSuccessActions from './PatrullaSuccessActions';
import styles from './PatrullaForm.module.css';

export default function PatrullaForm() {
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
    isValid,
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

  // Si ya fue creada exitosamente, desplegar pantalla de confirmación
  if (createdPatrulla) {
    return <PatrullaSuccessActions patrulla={createdPatrulla} onReset={handleReset} />;
  }

  return (
    <form
      onSubmit={handleOpenConfirmModal}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
          e.preventDefault();
        }
      }}
      autoComplete="off"
      noValidate
      className={styles.formContainer}
    >
      {/* Alerta de Carga de Datos Auxiliares */}
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

      {/* Botonera de Acciones del Formulario */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-color-neutral, #DFE3E8)',
        }}
      >
        <Button
          type="button"
          variant="outline"
          size="md"
          href="/gestion"
        >
          Cancelar y Volver
        </Button>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={handleReset}
          >
            Limpiar Formulario
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={<ShieldCheck size={18} />}
          >
            Guardar Patrulla
          </Button>
        </div>
      </div>

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
    </form>
  );
}
