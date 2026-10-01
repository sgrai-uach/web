'use client';

import React from 'react';
import { Truck, Package, Wrench, AlertTriangle } from 'lucide-react';
import type { RecursoItem } from '@/types/recurso';
import Modal from '@/components/common/Modal';
import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import InlineNotice from '@/components/ui/InlineNotice';
import { useRecursoEditForm } from '@/hooks/useRecursoEditForm';
import RecursoEspecificacionesSection from './RecursoEspecificacionesSection';
import RecursoUbicacionSection from './RecursoUbicacionSection';

interface RecursoEditarModalProps {
  isOpen: boolean;
  recurso: RecursoItem | null;
  usuarioActivoId: string;
  onCerrar: () => void;
  onGuardadoExitoso: (recursoActualizado: RecursoItem) => void;
}

export default function RecursoEditarModal({
  isOpen,
  recurso,
  usuarioActivoId,
  onCerrar,
  onGuardadoExitoso,
}: RecursoEditarModalProps) {
  const {
    formData,
    cargandoDetalle,
    touched,
    serverError,
    serverFieldErrors,
    isSubmitting,
    clientErrors,
    handleBlur,
    handleFieldChange,
    handleDetalleChange,
    handleCoordsChange,
    handleCenterValdivia,
    handleIntegerKeyDown,
    handleSubmit,
  } = useRecursoEditForm({
    recursoInicial: recurso,
    usuarioActivoId,
    onGuardadoExitoso,
    onCerrar,
  });

  if (!isOpen || !recurso) return null;

  const actions = (
    <>
      <Button
        type="button"
        variant="outline"
        size="md"
        onClick={onCerrar}
        disabled={isSubmitting}
      >
        Cancelar
      </Button>
      <Button
        type="button"
        variant="primary"
        size="md"
        onClick={handleSubmit}
        disabled={isSubmitting || cargandoDetalle}
        style={{
          backgroundColor: 'var(--color-accent-mint)',
          color: 'var(--color-white)',
          minWidth: '150px',
        }}
      >
        {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      title={`Editar Recurso: ${recurso.nombre}`}
      onClose={onCerrar}
      actions={actions}
      maxWidth="820px"
    >
      {cargandoDetalle ? (
        <div
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              border: '3px solid var(--color-bg-light)',
              borderTopColor: 'var(--color-primary-teal)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <span style={{ fontSize: '14px', color: 'var(--color-charcoal)' }}>
            Cargando especificaciones del recurso...
          </span>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : formData ? (
        <form
          onSubmit={handleSubmit}
          noValidate
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* Mensajes de Error del Servidor */}
          {serverError && (
            <InlineNotice variant="error" title="Error al actualizar el recurso">
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

          {/* SECCIÓN 1: Información Básica y Naturaleza Inmutable */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                borderBottom: '2px solid var(--color-primary-teal)',
                paddingBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ color: 'var(--color-primary-teal)', fontWeight: 'bold', fontSize: '18px' }}>
                1.
              </span>
              <Heading as="h2" variant="h3" color="teal-dark" noMargin>
                Información General
              </Heading>
            </div>

            {/* Badge de Inmutabilidad del Tipo de Recurso */}
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: 'var(--color-bg-light)',
                borderLeft: '4px solid var(--color-primary-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    backgroundColor: formData.esIndividual ? '#E0F2FE' : '#F3F4F6',
                    color: formData.esIndividual ? '#0369A1' : '#374151',
                  }}
                >
                  {formData.esIndividual ? <Truck size={16} /> : <Package size={16} />}
                </span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary-teal-dark)' }}>
                    Clasificación: {formData.tipo}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-charcoal)' }}>
                    La naturaleza del activo ({formData.esIndividual ? 'Activo Físico Individual' : 'Material Fungible / Granel'}) es inmutable.
                  </div>
                </div>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '4px 8px',
                  backgroundColor: '#DFE3E8',
                  color: '#2B2B2B',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                Solo Lectura
              </span>
            </div>

            {/* Nombre del Recurso */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label
                htmlFor="edit-nombre"
                style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-dark)' }}
              >
                Nombre del Recurso <span style={{ color: '#C81E1E' }}>*</span>
              </label>
              <input
                id="edit-nombre"
                type="text"
                required
                autoComplete="off"
                value={formData.nombre}
                onChange={(e) => handleFieldChange('nombre', e.target.value)}
                onBlur={() => handleBlur('nombre')}
                placeholder="Ej. Sacos de arena, Motobomba 3 HP, Camioneta Rescate 4x4"
                style={{
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: touched.nombre && clientErrors.nombre ? '2px solid #C81E1E' : '1px solid var(--color-charcoal)',
                  borderRadius: 0,
                  outline: 'none',
                  backgroundColor: 'var(--color-white)',
                  color: 'var(--color-text-dark)',
                }}
              />
              {touched.nombre && clientErrors.nombre && (
                <span style={{ fontSize: '12px', color: '#C81E1E', fontWeight: 500 }}>
                  {clientErrors.nombre}
                </span>
              )}
            </div>

            {/* Descripción */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label
                htmlFor="edit-descripcion"
                style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-dark)' }}
              >
                Descripción u Observaciones (Opcional)
              </label>
              <textarea
                id="edit-descripcion"
                rows={3}
                value={formData.descripcion}
                onChange={(e) => handleFieldChange('descripcion', e.target.value)}
                placeholder="Especificaciones adicionales, condiciones operativas..."
                style={{
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '1px solid var(--color-charcoal)',
                  borderRadius: 0,
                  outline: 'none',
                  backgroundColor: 'var(--color-white)',
                  color: 'var(--color-text-dark)',
                  resize: 'vertical',
                }}
              />
            </div>
          </section>

          {/* SECCIÓN 2: Inventario, Stock y Mantenimiento */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                borderBottom: '2px solid var(--color-primary-teal)',
                paddingBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ color: 'var(--color-primary-teal)', fontWeight: 'bold', fontSize: '18px' }}>
                2.
              </span>
              <Heading as="h2" variant="h3" color="teal-dark" noMargin>
                Inventario, Stock y Mantenimiento
              </Heading>
            </div>

            {formData.esIndividual ? (
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'var(--color-bg-light)',
                  borderLeft: '4px solid var(--color-accent-mint)',
                  fontSize: '14px',
                  color: 'var(--color-primary-teal-dark)',
                }}
              >
                <div>
                  <strong>Activo Físico Individual:</strong> Este recurso cuenta con{' '}
                  <strong>{formData.cantidadInventario}</strong> unidad{Number(formData.cantidadInventario) !== 1 ? 'es' : ''} registrada{Number(formData.cantidadInventario) !== 1 ? 's' : ''} en inventario.
                  {formData.cantidadEnUso > 0 && (
                    <div style={{ fontSize: '12px', color: '#D97706', marginTop: '4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={14} />
                      <span>{formData.cantidadEnUso} unidad{formData.cantidadEnUso !== 1 ? 'es' : ''} desplegada{formData.cantidadEnUso !== 1 ? 's' : ''} actualmente en terreno.</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '16px',
                }}
              >
                {/* Cantidad Total */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <label
                      htmlFor="edit-cantidadInventario"
                      style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-dark)' }}
                    >
                      Cantidad en Inventario <span style={{ color: '#C81E1E' }}>*</span>
                    </label>
                    {formData.cantidadEnUso > 0 && (
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#D97706' }}>
                        {formData.cantidadEnUso} en terreno
                      </span>
                    )}
                  </div>
                  <input
                    id="edit-cantidadInventario"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    autoComplete="off"
                    value={formData.cantidadInventario}
                    onKeyDown={handleIntegerKeyDown}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, '');
                      handleFieldChange(
                        'cantidadInventario',
                        digitsOnly === '' ? '' : parseInt(digitsOnly, 10)
                      );
                    }}
                    onBlur={() => handleBlur('cantidadInventario')}
                    placeholder="Ej. 100"
                    style={{
                      padding: '10px 12px',
                      fontSize: '14px',
                      border:
                        touched.cantidadInventario && clientErrors.cantidadInventario
                          ? '2px solid #C81E1E'
                          : '1px solid var(--color-charcoal)',
                      borderRadius: 0,
                      outline: 'none',
                    }}
                  />
                  {touched.cantidadInventario && clientErrors.cantidadInventario ? (
                    <span style={{ fontSize: '12px', color: '#C81E1E', fontWeight: 500 }}>
                      {clientErrors.cantidadInventario}
                    </span>
                  ) : formData.cantidadEnUso > 0 ? (
                    <span style={{ fontSize: '11px', color: 'var(--color-charcoal)' }}>
                      El stock no puede ser inferior a las {formData.cantidadEnUso} unidades actualmente en uso.
                    </span>
                  ) : null}
                </div>

                {/* Cantidad Mínima */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label
                    htmlFor="edit-cantidadMinima"
                    style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-dark)' }}
                  >
                    Cantidad Mínima (Umbral Bajo Stock)
                  </label>
                  <input
                    id="edit-cantidadMinima"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                    value={formData.cantidadMinima}
                    onKeyDown={handleIntegerKeyDown}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, '');
                      handleFieldChange(
                        'cantidadMinima',
                        digitsOnly === '' ? '' : parseInt(digitsOnly, 10)
                      );
                    }}
                    onBlur={() => handleBlur('cantidadMinima')}
                    placeholder="Ej. 10 (0 para desactivar)"
                    style={{
                      padding: '10px 12px',
                      fontSize: '14px',
                      border: '1px solid var(--color-charcoal)',
                      borderRadius: 0,
                      outline: 'none',
                    }}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--color-charcoal)' }}>
                    Al descender a esta cantidad, el recurso pasa automáticamente a alerta <code>BAJO_STOCK</code>.
                  </span>
                </div>
              </div>
            )}

            {/* Control Interactivo de Mantenimiento Preventivo / Correctivo */}
            <div
              style={{
                marginTop: '8px',
                padding: '16px',
                backgroundColor: formData.enMantencion ? '#FFF3E0' : 'var(--color-bg-light)',
                border: formData.enMantencion ? '1px solid #FFB74D' : '1px solid var(--border-color-neutral)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  id="enMantencion"
                  checked={formData.enMantencion}
                  onChange={(e) => handleFieldChange('enMantencion', e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: '#E65100',
                    cursor: 'pointer',
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wrench size={16} color={formData.enMantencion ? '#E65100' : 'var(--color-charcoal)'} />
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: formData.enMantencion ? '#E65100' : 'var(--color-text-dark)',
                    }}
                  >
                    {formData.enMantencion
                      ? 'Desmarcar recurso de mantenimiento técnico (Reintegrar al servicio)'
                      : 'Marcar recurso en mantenimiento técnico (Fuera de servicio)'}
                  </span>
                </div>
              </label>

              {formData.enMantencion ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    color: '#B45309',
                    paddingLeft: '30px',
                  }}
                >
                  <AlertTriangle size={14} />
                  <span>
                    El recurso se encuentra fuera de servicio. Al desmarcar esta casilla, volverá a estar operativo y disponible para asignaciones de emergencia en el Centro de Mando.
                  </span>
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--color-charcoal)', paddingLeft: '30px' }}>
                  Al marcar esta casilla, el recurso quedará fuera de servicio temporalmente y no estará disponible para asignaciones de emergencia en el Centro de Mando hasta desmarcarla.
                </div>
              )}
            </div>
          </section>

          {/* SECCIÓN 3: Especificaciones Técnicas (Solo si es individual) */}
          {formData.esIndividual && (
            <RecursoEspecificacionesSection
              subtipoDetalle={formData.subtipoDetalle}
              detalles={formData.detalles}
              onChangeSubtipo={(val) => handleFieldChange('subtipoDetalle', val)}
              onChangeDetalle={handleDetalleChange}
            />
          )}

          {/* SECCIÓN 4: Ubicación Geográfica */}
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
        </form>
      ) : null}
    </Modal>
  );
}
