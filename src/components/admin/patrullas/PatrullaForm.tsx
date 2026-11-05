'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import Button from '@/components/ui/Button';
import InlineNotice from '@/components/ui/InlineNotice';
import { traducirNombreCampo } from '@/lib/utils/errorUtils';
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
    mapaPatrullasPorPersonal,
    mapaPatrullasPorVehiculo,
    cargandoCatalogos,
    errorCatalogos,
    serverError,
    clientFormError,
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

      {/* Aviso de Error General de Formulario */}
      {clientFormError && (
        <InlineNotice variant="error" title="Formulario incompleto">
          {clientFormError}
        </InlineNotice>
      )}

      {/* Alerta de Error de Servidor o Conflicto (409) */}
      {serverError && (
        <InlineNotice
          variant="error"
          title="No fue posible dar de alta la patrulla verificadora"
        >
          <div>
            {serverFieldErrors && serverFieldErrors.length > 0 ? (
              <span>
                Se detectaron inconsistencias en la sección:{' '}
                <strong>
                  {Array.from(
                    new Set(
                      serverFieldErrors
                        .map((err) => traducirNombreCampo(err.campo))
                        .filter(Boolean)
                    )
                  ).join(', ')}
                </strong>
                . Por favor revise el campo señalado a continuación.
              </span>
            ) : (
              <span>{serverError}</span>
            )}
          </div>
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
        errorDelegacion={
          (touched.delegacionId ? clientErrors.delegacionId : undefined) ||
          serverFieldErrors.find((e) => e.campo === 'delegacionId')?.mensaje
        }
        onChangeDelegacion={handleDelegacionChange}
        onBlurDelegacion={() => handleBlur('delegacionId')}
      />

      {/* SECCIÓN 3: Vehículo Institucional Asignado */}
      <PatrullaVehiculoSection
        vehiculoId={formData.vehiculoId}
        vehiculos={vehiculosDisponibles}
        cargando={cargandoCatalogos}
        mapaPatrullasPorVehiculo={mapaPatrullasPorVehiculo}
        errorVehiculo={serverFieldErrors.find((e) => e.campo === 'vehiculoId')?.mensaje}
        onChangeVehiculo={handleVehiculoChange}
      />

      {/* SECCIÓN 4: Dotación y Personal Asignado */}
      <PatrullaDotacionSection
        personalElegible={personalElegible}
        personalSeleccionadoIds={formData.personalIds}
        usuarioLiderId={formData.usuarioLiderId}
        cargando={cargandoCatalogos}
        mapaPatrullasPorPersonal={mapaPatrullasPorPersonal}
        errorPersonal={
          (touched.personalIds ? clientErrors.personalIds : undefined) ||
          serverFieldErrors.find((e) => e.campo === 'personalIds')?.mensaje
        }
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
        mapaPatrullasPorVehiculo={mapaPatrullasPorVehiculo}
        mapaPatrullasPorPersonal={mapaPatrullasPorPersonal}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmSave}
      />
    </form>
  );
}
