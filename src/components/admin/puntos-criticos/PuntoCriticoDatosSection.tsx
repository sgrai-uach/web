'use client';

import React from 'react';
import { AlertTriangle, Tag, Layers, FileText } from 'lucide-react';
import Heading from '@/components/ui/Heading';
import { TIPOS_RIESGO_CANONICOS } from '@/types/puntoCritico';
import type { PrioridadPuntoCritico } from '@/types/puntoCritico';
import { obtenerNombreDelegacion } from '@/lib/utils/delegacionUtils';

interface DelegacionOption {
  id: string;
  codigo?: string;
  nombre: string;
}

interface PuntoCriticoDatosSectionProps {
  nombre: string;
  descripcion: string;
  tipoRiesgoSelect: string;
  otroTipoRiesgo: string;
  nivelPrioridad: PrioridadPuntoCritico;
  delegacionId: string;
  activo: boolean;
  delegaciones: DelegacionOption[];
  cargandoCatalogos?: boolean;
  errorNombre?: string;
  errorTipoRiesgo?: string;
  errorPrioridad?: string;
  errorDelegacion?: string;
  errorDescripcion?: string;
  onChangeNombre: (val: string) => void;
  onChangeDescripcion: (val: string) => void;
  onChangeTipoRiesgoSelect: (val: string) => void;
  onChangeOtroTipoRiesgo: (val: string) => void;
  onChangeNivelPrioridad: (val: PrioridadPuntoCritico) => void;
  onChangeDelegacionId: (val: string) => void;
  onChangeActivo: (val: boolean) => void;
  onBlur: (field: 'nombre' | 'tipoRiesgo') => void;
}

export default function PuntoCriticoDatosSection({
  nombre,
  descripcion,
  tipoRiesgoSelect,
  otroTipoRiesgo,
  nivelPrioridad,
  delegacionId,
  activo,
  delegaciones,
  cargandoCatalogos = false,
  errorNombre,
  errorTipoRiesgo,
  errorPrioridad,
  errorDelegacion,
  errorDescripcion,
  onChangeNombre,
  onChangeDescripcion,
  onChangeTipoRiesgoSelect,
  onChangeOtroTipoRiesgo,
  onChangeNivelPrioridad,
  onChangeDelegacionId,
  onChangeActivo,
  onBlur,
}: PuntoCriticoDatosSectionProps) {
  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    padding: '8px 12px',
    fontSize: '14px',
    borderWidth: hasError ? '2px' : '1px',
    borderStyle: 'solid',
    borderColor: hasError ? 'var(--color-danger, #D32F2F)' : 'var(--border-color-neutral-dark, #CCD2D9)',
    borderRadius: 'var(--radius-none, 0px)',
    outline: 'none',
    backgroundColor: 'var(--color-white, #FFFFFF)',
    color: 'var(--color-text-dark, #2B2B2B)',
    fontFamily: 'inherit',
    width: '100%',
    boxSizing: 'border-box',
  });

  const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 700,
    color: 'var(--color-primary-teal-dark, #14505A)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-white, #FFFFFF)',
        border: '1px solid var(--border-color-neutral, #DFE3E8)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <div
        style={{
          borderBottom: '2px solid var(--color-primary-teal, #1B6F7D)',
          paddingBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <Tag size={20} color="var(--color-primary-teal, #1B6F7D)" aria-hidden="true" />
        <Heading as="h2" variant="h3" color="teal-dark" noMargin>
          1. Identificación y Clasificación Operativa
        </Heading>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Nombre del Punto Crítico */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: '1 / -1' }}>
          <label htmlFor="input-nombre" style={labelStyle}>
            Nombre del Sector / Punto Crítico <span style={{ color: 'var(--color-danger, #D32F2F)' }}>*</span>
          </label>
          <input
            id="input-nombre"
            type="text"
            value={nombre}
            onChange={(e) => onChangeNombre(e.target.value)}
            onBlur={() => onBlur('nombre')}
            placeholder="Ej: Humedal Angachilla - Pasaje Los Robles"
            maxLength={150}
            style={inputStyle(Boolean(errorNombre))}
            required
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {errorNombre ? (
              <span style={{ fontSize: '12px', color: 'var(--color-danger, #D32F2F)', fontWeight: 600 }}>
                {errorNombre}
              </span>
            ) : (
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #5F676E)' }}>
                Identificación clara del lugar para despacho de patrullas y cuadrillas.
              </span>
            )}
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #5F676E)' }}>
              {nombre.length}/150
            </span>
          </div>
        </div>

        {/* Tipo de Riesgo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="select-tipo-riesgo" style={labelStyle}>
            Tipo de Amenaza / Riesgo <span style={{ color: 'var(--color-danger, #D32F2F)' }}>*</span>
          </label>
          <select
            id="select-tipo-riesgo"
            value={tipoRiesgoSelect}
            onChange={(e) => onChangeTipoRiesgoSelect(e.target.value)}
            style={inputStyle(Boolean(errorTipoRiesgo))}
          >
            {TIPOS_RIESGO_CANONICOS.map((tr) => (
              <option key={tr} value={tr}>
                {tr}
              </option>
            ))}
          </select>
        </div>

        {/* Input condicional si selecciona "Otro" */}
        {tipoRiesgoSelect === 'Otro' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label htmlFor="input-otro-tipo-riesgo" style={labelStyle}>
              Especifique el Tipo de Riesgo <span style={{ color: 'var(--color-danger, #D32F2F)' }}>*</span>
            </label>
            <input
              id="input-otro-tipo-riesgo"
              type="text"
              value={otroTipoRiesgo}
              onChange={(e) => onChangeOtroTipoRiesgo(e.target.value)}
              onBlur={() => onBlur('tipoRiesgo')}
              placeholder="Ej: Socavón Fluvial Ribereño"
              maxLength={100}
              style={inputStyle(Boolean(errorTipoRiesgo))}
              required
            />
            {errorTipoRiesgo && (
              <span style={{ fontSize: '12px', color: 'var(--color-danger, #D32F2F)', fontWeight: 600 }}>
                {errorTipoRiesgo}
              </span>
            )}
          </div>
        )}

        {/* Nivel de Prioridad */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="select-prioridad" style={labelStyle}>
            Prioridad Operativa <span style={{ color: 'var(--color-danger, #D32F2F)' }}>*</span>
          </label>
          <select
            id="select-prioridad"
            value={nivelPrioridad}
            onChange={(e) => onChangeNivelPrioridad(e.target.value as PrioridadPuntoCritico)}
            style={inputStyle(Boolean(errorPrioridad))}
          >
            <option value="BAJA">Baja - Monitoreo preventivo ordinario</option>
            <option value="MEDIA">Media - Vigilancia regular por eventos climáticos</option>
            <option value="ALTA">Alta - Riesgo significativo de anegamiento/corte</option>
            <option value="CRITICA">Crítica - Impacto directo e inminente en vidas o bienes</option>
          </select>
          {errorPrioridad && (
            <span style={{ fontSize: '12px', color: 'var(--color-danger, #D32F2F)', fontWeight: 600 }}>
              {errorPrioridad}
            </span>
          )}
        </div>

        {/* Delegación Territorial */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="select-delegacion" style={labelStyle}>
            Delegación Territorial Asociada
          </label>
          <select
            id="select-delegacion"
            value={delegacionId}
            onChange={(e) => onChangeDelegacionId(e.target.value)}
            disabled={cargandoCatalogos}
            style={inputStyle(Boolean(errorDelegacion))}
          >
            <option value="">-- General Comunal / Sin Delegación --</option>
            {delegaciones.map((d) => (
              <option key={d.id} value={d.id}>
                {obtenerNombreDelegacion(d.nombre || d.codigo, d.nombre)}
              </option>
            ))}
          </select>
          {errorDelegacion && (
            <span style={{ fontSize: '12px', color: 'var(--color-danger, #D32F2F)', fontWeight: 600 }}>
              {errorDelegacion}
            </span>
          )}
        </div>
      </div>

      {/* Descripción Operativa */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label htmlFor="textarea-descripcion" style={labelStyle}>
          <FileText size={16} aria-hidden="true" />
          <span>Descripción y Antecedentes Operativos</span>
        </label>
        <textarea
          id="textarea-descripcion"
          rows={3}
          value={descripcion}
          onChange={(e) => onChangeDescripcion(e.target.value)}
          placeholder="Antecedentes históricos, vulnerabilidad del entorno, accesos o recomendaciones para patrullas en terreno..."
          maxLength={1000}
          style={{
            ...inputStyle(Boolean(errorDescripcion)),
            resize: 'vertical',
            lineHeight: '1.4',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {errorDescripcion ? (
            <span style={{ fontSize: '12px', color: 'var(--color-danger, #D32F2F)', fontWeight: 600 }}>
              {errorDescripcion}
            </span>
          ) : <span />}
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #5F676E)' }}>
            {descripcion.length}/1000 caracteres
          </span>
        </div>
      </div>

      {/* Switch / Checkbox de Estado Activo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          paddingTop: '6px',
        }}
      >
        <input
          id="checkbox-activo"
          type="checkbox"
          checked={activo}
          onChange={(e) => onChangeActivo(e.target.checked)}
          style={{
            width: '18px',
            height: '18px',
            accentColor: 'var(--color-primary-teal, #1B6F7D)',
            cursor: 'pointer',
            borderRadius: 0,
          }}
        />
        <label
          htmlFor="checkbox-activo"
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--color-text-dark, #2B2B2B)',
            cursor: 'pointer',
          }}
        >
          Punto Crítico Activo (disponible para vigilancia, prevención y despacho de patrullas)
        </label>
      </div>
    </div>
  );
}
