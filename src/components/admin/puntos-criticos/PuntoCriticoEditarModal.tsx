'use client';

import React from 'react';
import {
  AlertCircle,
  RotateCcw,
  Navigation,
  Info,
  Lock,
} from 'lucide-react';
import type { PuntoCriticoItem, PrioridadPuntoCritico } from '@/types/puntoCritico';
import { CATALOGO_TIPOS_RIESGO } from '@/types/puntoCritico';
import Modal from '@/components/common/Modal';
import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import LocationPickerMap from '@/components/maps/LocationPickerMap';
import { usePuntoCriticoEditForm } from '@/hooks/usePuntoCriticoEditForm';

export interface PuntoCriticoEditarModalProps {
  isOpen: boolean;
  punto: PuntoCriticoItem | null;
  usuarioActivoId: string;
  onCerrar: () => void;
  onGuardadoExitoso: (puntoActualizado: PuntoCriticoItem) => void;
}

const OPCIONES_PRIORIDAD: { valor: PrioridadPuntoCritico; etiqueta: string; color: string }[] = [
  { valor: 'BAJA', etiqueta: 'Baja', color: 'var(--color-success, #2E7D32)' },
  { valor: 'MEDIA', etiqueta: 'Media', color: '#B45309' },
  { valor: 'ALTA', etiqueta: 'Alta', color: 'var(--color-warning, #E65100)' },
  { valor: 'CRITICA', etiqueta: 'Crítica', color: 'var(--color-danger, #D32F2F)' },
];

export default function PuntoCriticoEditarModal({
  isOpen,
  punto,
  usuarioActivoId,
  onCerrar,
  onGuardadoExitoso,
}: PuntoCriticoEditarModalProps) {
  const {
    formData,
    initialCoords,
    delegaciones,
    clientErrors,
    serverError,
    isSubmitting,
    cargandoDetalle,
    handleFieldChange,
    handleCoordsChange,
    handleCenterValdivia,
    handleResetCoords,
    handleSubmit,
  } = usePuntoCriticoEditForm({
    puntoInicial: punto,
    usuarioActivoId,
    onGuardadoExitoso,
    onCerrar,
  });

  const opcionesTipoRiesgo = React.useMemo(() => {
    const list = [...CATALOGO_TIPOS_RIESGO];
    if (formData.tipoRiesgo && !list.includes(formData.tipoRiesgo)) {
      list.unshift(formData.tipoRiesgo);
    }
    return list;
  }, [formData.tipoRiesgo]);

  if (!isOpen || !punto) return null;

  const latNum = typeof formData.latitud === 'number' ? formData.latitud : parseFloat(formData.latitud);
  const lngNum = typeof formData.longitud === 'number' ? formData.longitud : parseFloat(formData.longitud);

  const coordsModificadas =
    Math.abs(latNum - initialCoords.latitud) > 0.0001 ||
    Math.abs(lngNum - initialCoords.longitud) > 0.0001;

  const actions = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', width: '100%' }}>
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
          backgroundColor: 'var(--color-accent-mint, #4FAE9B)',
          color: 'var(--color-white, #FFFFFF)',
          minWidth: '150px',
        }}
      >
        {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      title={`Editar Punto Crítico: ${punto.codigo}`}
      onClose={onCerrar}
      actions={actions}
      maxWidth="780px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} noValidate>
        {/* Banner de Identificación y Código Inmutable */}
        <div
          style={{
            borderLeft: '4px solid var(--color-primary-teal, #1B6F7D)',
            backgroundColor: 'var(--color-bg-light, #ECEFF3)',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--color-primary-teal, #1B6F7D)',
                  backgroundColor: 'var(--color-info-bg, #E0F2F1)',
                  padding: '3px 8px',
                  border: '1px solid #B2DFDB',
                }}
              >
                {punto.codigo}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-text-muted, #5F676E)' }}>
                <Lock size={12} aria-hidden="true" />
                Código institucional inmutable
              </span>
            </div>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 600,
                padding: '2px 8px',
                backgroundColor: punto.activo ? 'var(--color-success-bg, #E8F5E9)' : '#F3F4F6',
                color: punto.activo ? 'var(--color-success, #2E7D32)' : '#4B5563',
                border: `1px solid ${punto.activo ? '#C8E6C9' : '#E5E7EB'}`,
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: 'var(--radius-round, 9999px)',
                  backgroundColor: punto.activo ? 'var(--color-success, #2E7D32)' : '#9CA3AF',
                }}
                aria-hidden="true"
              />
              <span>{punto.estadoTexto || (punto.activo ? 'Activo' : 'Inactivo')}</span>
            </span>
          </div>

          <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted, #5F676E)' }}>
            Modifique las características descriptivas, la prioridad o mueva el marcador interactivo en el mapa para actualizar las coordenadas geoespaciales.
          </p>
        </div>

        {/* Mensaje de Error del Servidor (ej. 409 o 403) */}
        {serverError && (
          <div
            role="alert"
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--color-danger-bg, #FFEBEE)',
              border: '1px solid var(--color-danger, #D32F2F)',
              color: 'var(--color-danger, #D32F2F)',
              fontSize: '13px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} aria-hidden="true" />
            <div>
              <strong>Error al guardar:</strong> {serverError}
            </div>
          </div>
        )}

        {/* Sección: Datos Descriptivos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Heading as="h3" variant="h4" color="teal">
            1. Características Generales
          </Heading>

          {/* Nombre / Sector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label
              htmlFor="edit-punto-nombre"
              style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-dark, #2B2B2B)' }}
            >
              Nombre o Sector <span style={{ color: 'var(--color-danger, #D32F2F)' }}>*</span>
            </label>
            <input
              id="edit-punto-nombre"
              type="text"
              value={formData.nombre}
              onChange={(e) => handleFieldChange('nombre', e.target.value)}
              placeholder="Ej: Sector Humedal Angachilla - Pasaje Los Robles"
              maxLength={150}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '13px',
                fontFamily: 'inherit',
                border: `1px solid ${clientErrors.nombre ? 'var(--color-danger, #D32F2F)' : 'var(--border-color-neutral, #DFE3E8)'}`,
                borderRadius: 'var(--radius-none, 0px)',
                backgroundColor: 'var(--color-white, #FFFFFF)',
                outline: 'none',
              }}
            />
            {clientErrors.nombre && (
              <span style={{ fontSize: '12px', color: 'var(--color-danger, #D32F2F)' }}>
                {clientErrors.nombre}
              </span>
            )}
          </div>

          {/* Grilla: Tipo de Riesgo y Prioridad */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            {/* Tipo de Riesgo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label
                htmlFor="edit-punto-tipoRiesgo"
                style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-dark, #2B2B2B)' }}
              >
                Tipo de Riesgo
              </label>
              <select
                id="edit-punto-tipoRiesgo"
                value={formData.tipoRiesgo}
                onChange={(e) => handleFieldChange('tipoRiesgo', e.target.value)}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  border: `1px solid ${clientErrors.tipoRiesgo ? 'var(--color-danger, #D32F2F)' : 'var(--border-color-neutral, #DFE3E8)'}`,
                  borderRadius: 'var(--radius-none, 0px)',
                  backgroundColor: 'var(--color-white, #FFFFFF)',
                }}
              >
                <option value="">Seleccione tipo de riesgo...</option>
                {opcionesTipoRiesgo.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
              {clientErrors.tipoRiesgo && (
                <span style={{ fontSize: '12px', color: 'var(--color-danger, #D32F2F)' }}>
                  {clientErrors.tipoRiesgo}
                </span>
              )}
            </div>

            {/* Nivel de Prioridad */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label
                htmlFor="edit-punto-prioridad"
                style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-dark, #2B2B2B)' }}
              >
                Nivel de Prioridad <span style={{ color: 'var(--color-danger, #D32F2F)' }}>*</span>
              </label>
              <select
                id="edit-punto-prioridad"
                value={formData.prioridad}
                onChange={(e) => handleFieldChange('prioridad', e.target.value as PrioridadPuntoCritico)}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  border: `1px solid ${clientErrors.prioridad ? 'var(--color-danger, #D32F2F)' : 'var(--border-color-neutral, #DFE3E8)'}`,
                  borderRadius: 'var(--radius-none, 0px)',
                  backgroundColor: 'var(--color-white, #FFFFFF)',
                }}
              >
                {OPCIONES_PRIORIDAD.map((opcion) => (
                  <option key={opcion.valor} value={opcion.valor}>
                    {opcion.etiqueta}
                  </option>
                ))}
              </select>
              {clientErrors.prioridad && (
                <span style={{ fontSize: '12px', color: 'var(--color-danger, #D32F2F)' }}>
                  {clientErrors.prioridad}
                </span>
              )}
            </div>
          </div>

          {/* Delegación Asociada */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label
              htmlFor="edit-punto-delegacion"
              style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-dark, #2B2B2B)' }}
            >
              Delegación Municipal Territorial
            </label>
            <select
              id="edit-punto-delegacion"
              value={formData.delegacionId}
              onChange={(e) => handleFieldChange('delegacionId', e.target.value)}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '13px',
                fontFamily: 'inherit',
                border: '1px solid var(--border-color-neutral, #DFE3E8)',
                borderRadius: 'var(--radius-none, 0px)',
                backgroundColor: 'var(--color-white, #FFFFFF)',
              }}
            >
              <option value="">Central Comunal (Sin delegación asignada)</option>
              {delegaciones.map((del) => (
                <option key={del.id} value={del.id}>
                  {del.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Descripción Técnica */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label
                htmlFor="edit-punto-descripcion"
                style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-dark, #2B2B2B)' }}
              >
                Descripción y Factores de Vulnerabilidad
              </label>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #5F676E)' }}>
                {formData.descripcion.length} / 1000
              </span>
            </div>
            <textarea
              id="edit-punto-descripcion"
              value={formData.descripcion}
              onChange={(e) => handleFieldChange('descripcion', e.target.value)}
              placeholder="Detalle los factores de riesgo observados, antecedentes históricos de desborde o remoción..."
              maxLength={1000}
              rows={3}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '13px',
                fontFamily: 'inherit',
                border: `1px solid ${clientErrors.descripcion ? 'var(--color-danger, #D32F2F)' : 'var(--border-color-neutral, #DFE3E8)'}`,
                borderRadius: 'var(--radius-none, 0px)',
                backgroundColor: 'var(--color-white, #FFFFFF)',
                resize: 'vertical',
              }}
            />
            {clientErrors.descripcion && (
              <span style={{ fontSize: '12px', color: 'var(--color-danger, #D32F2F)' }}>
                {clientErrors.descripcion}
              </span>
            )}
          </div>
        </div>

        {/* Sección: Ubicación Geoespacial y Mapa Leaflet */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid var(--border-color-neutral, #DFE3E8)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <Heading as="h3" variant="h4" color="teal">
              2. Ubicación Geográfica en Mapa
            </Heading>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCenterValdivia}
                disabled={isSubmitting}
                icon={<Navigation size={13} aria-hidden="true" />}
              >
                Centrar Valdivia
              </Button>

              {coordsModificadas && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleResetCoords}
                  disabled={isSubmitting}
                  icon={<RotateCcw size={13} aria-hidden="true" />}
                >
                  Restablecer
                </Button>
              )}
            </div>
          </div>

          <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted, #5F676E)' }}>
            Arrastre el pin en el mapa o ajuste directamente los valores numéricos de latitud y longitud. Los cambios se sincronizan de forma bidireccional.
          </p>

          {/* Componente de Mapa Leaflet */}
          <LocationPickerMap
            latitud={formData.latitud}
            longitud={formData.longitud}
            onChange={handleCoordsChange}
            height="270px"
            ariaLabel={`Mapa interactivo para editar coordenadas del punto ${punto.codigo}`}
          />

          {/* Inputs Numéricos de Latitud y Longitud */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label
                htmlFor="edit-punto-latitud"
                style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-dark, #2B2B2B)' }}
              >
                Latitud (GPS) <span style={{ color: 'var(--color-danger, #D32F2F)' }}>*</span>
              </label>
              <input
                id="edit-punto-latitud"
                type="number"
                step="0.000001"
                value={formData.latitud}
                onChange={(e) => handleFieldChange('latitud', e.target.value)}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  border: `1px solid ${clientErrors.latitud ? 'var(--color-danger, #D32F2F)' : 'var(--border-color-neutral, #DFE3E8)'}`,
                  borderRadius: 'var(--radius-none, 0px)',
                  backgroundColor: 'var(--color-white, #FFFFFF)',
                }}
              />
              {clientErrors.latitud && (
                <span style={{ fontSize: '12px', color: 'var(--color-danger, #D32F2F)' }}>
                  {clientErrors.latitud}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label
                htmlFor="edit-punto-longitud"
                style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-dark, #2B2B2B)' }}
              >
                Longitud (GPS) <span style={{ color: 'var(--color-danger, #D32F2F)' }}>*</span>
              </label>
              <input
                id="edit-punto-longitud"
                type="number"
                step="0.000001"
                value={formData.longitud}
                onChange={(e) => handleFieldChange('longitud', e.target.value)}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  border: `1px solid ${clientErrors.longitud ? 'var(--color-danger, #D32F2F)' : 'var(--border-color-neutral, #DFE3E8)'}`,
                  borderRadius: 'var(--radius-none, 0px)',
                  backgroundColor: 'var(--color-white, #FFFFFF)',
                }}
              />
              {clientErrors.longitud && (
                <span style={{ fontSize: '12px', color: 'var(--color-danger, #D32F2F)' }}>
                  {clientErrors.longitud}
                </span>
              )}
            </div>
          </div>

          {/* Nota Informativa sobre sincronización en tiempo real */}
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--color-info-bg, #E0F2F1)',
              border: '1px solid #B2DFDB',
              fontSize: '12px',
              color: 'var(--color-primary-teal, #1B6F7D)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Info size={16} style={{ flexShrink: 0 }} aria-hidden="true" />
            <span>
              La actualización espacial se reflejará en tiempo real en los visores del Encargado y Supervisor, así como en las aplicaciones de terreno de las patrullas.
            </span>
          </div>
        </div>
      </form>
    </Modal>
  );
}
