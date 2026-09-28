'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useRecursoForm } from '@/hooks/useRecursoForm';
import InlineNotice from '@/components/ui/InlineNotice';
import SuccessActions from './SuccessActions';
import RecursoDatosBasicosSection from './recursos/RecursoDatosBasicosSection';
import RecursoInventarioSection from './recursos/RecursoInventarioSection';
import RecursoEspecificacionesSection from './recursos/RecursoEspecificacionesSection';
import RecursoUbicacionSection from './recursos/RecursoUbicacionSection';
import RecursoConfirmModal from './recursos/RecursoConfirmModal';
import RecursoFormActions from './recursos/RecursoFormActions';

export default function RecursoForm() {
  const router = useRouter();
  const {
    formData,
    touched,
    serverError,
    serverFieldErrors,
    createdResourceName,
    isSubmitting,
    showConfirmModal,
    isValid,
    clientErrors,
    handleIntegerKeyDown,
    handleBlur,
    handleFieldChange,
    handleEsIndividualChange,
    handleDetalleChange,
    handleCoordsChange,
    handleCenterValdivia,
    handleOpenConfirmModal,
    handleCloseConfirmModal,
    handleConfirmSave,
    handleReset,
  } = useRecursoForm();

  if (createdResourceName) {
    return (
      <SuccessActions
        recursoNombre={createdResourceName}
        onReset={handleReset}
        listPath="/recursos"
      />
    );
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
      style={{
        backgroundColor: 'var(--color-white)',
        border: '1px solid var(--color-bg-light)',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
      }}
    >
      {/* Alerta de Error de Servidor o Red */}
      {serverError && (
        <InlineNotice
          variant="error"
          title="No fue posible registrar el recurso"
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

      {/* SECCIÓN 1: Información General */}
      <RecursoDatosBasicosSection
        nombre={formData.nombre}
        descripcion={formData.descripcion}
        esIndividual={formData.esIndividual}
        errorNombre={touched.nombre ? clientErrors.nombre : undefined}
        onChangeNombre={(val) => handleFieldChange('nombre', val)}
        onChangeDescripcion={(val) => handleFieldChange('descripcion', val)}
        onChangeEsIndividual={handleEsIndividualChange}
        onBlurNombre={() => handleBlur('nombre')}
      />

      {/* SECCIÓN 2: Control de Inventario y Stock */}
      <RecursoInventarioSection
        esIndividual={formData.esIndividual}
        cantidadInventario={formData.cantidadInventario}
        cantidadMinima={formData.cantidadMinima}
        errorCantidadInventario={touched.cantidadInventario ? clientErrors.cantidadInventario : undefined}
        onChangeCantidadInventario={(val) => handleFieldChange('cantidadInventario', val)}
        onChangeCantidadMinima={(val) => handleFieldChange('cantidadMinima', val)}
        onKeyDownNumeric={handleIntegerKeyDown}
        onBlur={handleBlur}
      />

      {/* SECCIÓN 3: Detalles Técnicos (Solo si es individual) */}
      {formData.esIndividual && (
        <RecursoEspecificacionesSection
          subtipoDetalle={formData.subtipoDetalle}
          detalles={formData.detalles}
          onChangeSubtipo={(val) => handleFieldChange('subtipoDetalle', val)}
          onChangeDetalle={handleDetalleChange}
        />
      )}

      {/* SECCIÓN 4: Geolocalización y Ubicación Inicial */}
      <RecursoUbicacionSection
        sectionNumber={formData.esIndividual ? '4.' : '3.'}
        latitud={formData.latitud}
        longitud={formData.longitud}
        errorLatitud={touched.latitud ? clientErrors.latitud : undefined}
        errorLongitud={touched.longitud ? clientErrors.longitud : undefined}
        onChangeCoords={handleCoordsChange}
        onChangeLatitud={(val) => handleFieldChange('latitud', val)}
        onChangeLongitud={(val) => handleFieldChange('longitud', val)}
        onCenterValdivia={handleCenterValdivia}
        onBlur={handleBlur}
      />

      {/* Barra de Acciones */}
      <RecursoFormActions
        isValid={isValid}
        isSubmitting={isSubmitting}
        onCancel={() => router.push('/recursos')}
      />

      {/* Recuadro Modal de Confirmación */}
      <RecursoConfirmModal
        isOpen={showConfirmModal}
        formData={formData}
        isSubmitting={isSubmitting}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmSave}
      />
    </form>
  );
}
