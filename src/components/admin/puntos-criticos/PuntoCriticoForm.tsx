'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { usePuntoCriticoForm } from '@/hooks/usePuntoCriticoForm';
import PuntoCriticoDatosSection from './PuntoCriticoDatosSection';
import PuntoCriticoLocationSection from './PuntoCriticoLocationSection';
import Button from '@/components/ui/Button';
import InlineNotice from '@/components/ui/InlineNotice';
import Heading from '@/components/ui/Heading';

export default function PuntoCriticoForm() {
  const router = useRouter();
  const {
    formData,
    touched,
    clientErrors,
    isValid,
    isSubmitting,
    serverError,
    createdPunto,
    delegaciones,
    cargandoCatalogos,
    handleFieldChange,
    handleBlur,
    handleCoordsChange,
    handleCenterValdivia,
    handleSubmit,
  } = usePuntoCriticoForm();

  if (createdPunto) {
    return (
      <div
        style={{
          backgroundColor: 'var(--color-white, #FFFFFF)',
          border: '1px solid var(--border-color-neutral, #DFE3E8)',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '20px',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            backgroundColor: 'var(--color-success-bg, #E8F5E9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-none, 0px)',
          }}
        >
          <CheckCircle2 size={36} color="var(--color-success, #2E7D32)" aria-hidden="true" />
        </div>

        <Heading as="h2" variant="h3" color="teal-dark">
          Punto Crítico Registrado Exitosamente
        </Heading>

        <p style={{ margin: 0, fontSize: '15px', color: 'var(--color-text-dark, #2B2B2B)', maxWidth: '520px' }}>
          El sector <strong>{createdPunto.nombre}</strong> ha sido persistido en la base de datos comunal con el código oficial{' '}
          <strong style={{ color: 'var(--color-primary-teal, #1B6F7D)' }}>{createdPunto.codigo}</strong> y ya se encuentra habilitado para la planificación de patrullas.
        </p>

        <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => router.push('/admin/puntos-criticos')}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Volver al Catálogo de Puntos Críticos</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      autoComplete="off"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {/* Alerta de Error de Servidor o Validación */}
      {serverError && (
        <InlineNotice variant="error" title="No fue posible guardar el punto crítico">
          <div>{serverError}</div>
        </InlineNotice>
      )}

      {/* SECCIÓN 1: Identificación y Clasificación */}
      <PuntoCriticoDatosSection
        nombre={formData.nombre}
        descripcion={formData.descripcion}
        tipoRiesgoSelect={formData.tipoRiesgoSelect}
        otroTipoRiesgo={formData.otroTipoRiesgo}
        nivelPrioridad={formData.nivelPrioridad}
        delegacionId={formData.delegacionId}
        activo={formData.activo}
        delegaciones={delegaciones}
        cargandoCatalogos={cargandoCatalogos}
        errorNombre={touched.nombre ? clientErrors.nombre : undefined}
        errorTipoRiesgo={touched.tipoRiesgoSelect || touched.otroTipoRiesgo ? clientErrors.tipoRiesgo : undefined}
        onChangeNombre={(val) => handleFieldChange('nombre', val)}
        onChangeDescripcion={(val) => handleFieldChange('descripcion', val)}
        onChangeTipoRiesgoSelect={(val) => handleFieldChange('tipoRiesgoSelect', val)}
        onChangeOtroTipoRiesgo={(val) => handleFieldChange('otroTipoRiesgo', val)}
        onChangeNivelPrioridad={(val) => handleFieldChange('nivelPrioridad', val)}
        onChangeDelegacionId={(val) => handleFieldChange('delegacionId', val)}
        onChangeActivo={(val) => handleFieldChange('activo', val)}
        onBlur={handleBlur}
      />

      {/* SECCIÓN 2: Ubicación Geográfica y Mapa Interactivo */}
      <PuntoCriticoLocationSection
        lat={formData.lat}
        lng={formData.lng}
        radioMetros={formData.radioMetros}
        errorLat={touched.lat ? clientErrors.lat : undefined}
        errorLng={touched.lng ? clientErrors.lng : undefined}
        errorRadio={touched.radioMetros ? clientErrors.radioMetros : undefined}
        onChangeCoords={handleCoordsChange}
        onChangeLat={(val) => handleFieldChange('lat', val)}
        onChangeLng={(val) => handleFieldChange('lng', val)}
        onChangeRadio={(val) => handleFieldChange('radioMetros', val)}
        onCenterValdivia={handleCenterValdivia}
        onBlur={handleBlur}
      />

      {/* Barra de Acciones del Formulario */}
      <div
        style={{
          backgroundColor: 'var(--color-white, #FFFFFF)',
          border: '1px solid var(--border-color-neutral, #DFE3E8)',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '12px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => router.push('/admin/puntos-criticos')}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isSubmitting}
        >
          <Save size={16} aria-hidden="true" />
          <span>{isSubmitting ? 'Guardando Registro...' : 'Guardar Punto Crítico'}</span>
        </Button>
      </div>
    </form>
  );
}
