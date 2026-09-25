'use client';

import React from 'react';
import type { EmpleadoUsuario } from '@/types/empleados';
import { useEmpleadoForm } from '@/hooks/useEmpleadoForm';
import DatosPersonalesFields from './empleados/DatosPersonalesFields';
import DatosTerrenoFields from './empleados/DatosTerrenoFields';

interface EmpleadoFormularioProps {
  usuario: EmpleadoUsuario;
  onEmpleadoActualizado: (empleado: EmpleadoUsuario) => void;
  onCancelar: () => void;
  onDarDeBaja?: () => void;
}

export default function EmpleadoFormulario({
  usuario,
  onEmpleadoActualizado,
  onCancelar,
  onDarDeBaja,
}: EmpleadoFormularioProps) {
  const {
    formData,
    updateField,
    catalogos,
    esRolTerreno,
    guardando,
    mensajeExito,
    errorMsg,
    handleSubmit,
  } = useEmpleadoForm({
    usuario,
    onEmpleadoActualizado,
  });

  const handleActivoChange = (checked: boolean) => {
    updateField('activo', checked);
    if (!checked && !formData.fechaSalida) {
      updateField('fechaSalida', new Date().toISOString().slice(0, 10));
    } else if (checked) {
      updateField('fechaSalida', '');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    border: '1px solid #BAC7D5',
    fontSize: '0.875rem',
    color: 'var(--color-text-dark, #2B2B2B)',
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.8125rem',
    fontWeight: 700,
    color: 'var(--color-charcoal, #3B3F45)',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    marginBottom: '0.35rem',
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        backgroundColor: 'var(--color-white, #FFFFFF)',
        border: '1px solid #DFE3E8',
        padding: '1.5rem',
        marginBottom: '2rem',
      }}
    >
      {/* Cabecera de la ficha */}
      <div
        style={{
          borderBottom: '2px solid var(--color-bg-light, #ECEFF3)',
          paddingBottom: '1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.1875rem',
              fontWeight: 800,
              color: 'var(--color-primary-teal-dark, #14505A)',
              margin: 0,
            }}
          >
            Ficha de Modificación: {usuario.nombres} {usuario.apellidos}
          </h2>
          <div style={{ fontSize: '0.8125rem', color: '#666', marginTop: '0.2rem' }}>
            RUT: <strong>{usuario.rut}</strong> &bull; ID Usuario: {usuario.usuario_id}
          </div>
        </div>

        <div>
          <span
            style={{
              backgroundColor: esRolTerreno
                ? 'var(--color-accent-mint, #4FAE9B)'
                : 'var(--color-charcoal, #3B3F45)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.75rem',
              padding: '0.35rem 0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              borderRadius: 0,
            }}
          >
            {esRolTerreno ? 'Personal de Terreno' : 'Usuario General'}
          </span>
        </div>
      </div>

      {/* Alertas de resultado */}
      {mensajeExito && (
        <div
          style={{
            backgroundColor: '#E6F6ED',
            color: '#12633E',
            borderLeft: '4px solid var(--color-accent-mint, #4FAE9B)',
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
          }}
        >
          {mensajeExito}
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            backgroundColor: '#FDF1F1',
            color: '#A92525',
            borderLeft: '4px solid #D32F2F',
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* SECCIÓN 1: DATOS DE USUARIO GENERAL */}
      <DatosPersonalesFields
        formData={formData}
        updateField={updateField}
        onActivoChange={handleActivoChange}
        roles={catalogos.roles}
        delegaciones={catalogos.delegaciones}
        inputStyle={inputStyle}
        labelStyle={labelStyle}
      />

      {/* SECCIÓN 2: DATOS CONDICIONALES PARA PERSONAL DE TERRENO */}
      <DatosTerrenoFields
        esRolTerreno={esRolTerreno}
        formData={formData}
        updateField={updateField}
        especialidades={catalogos.especialidades}
        cargos={catalogos.cargos}
        inputStyle={inputStyle}
        labelStyle={labelStyle}
      />

      {/* Botones de acción del formulario */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.75rem',
          borderTop: '1px solid #DFE3E8',
          paddingTop: '1rem',
        }}
      >
        <div>
          {onDarDeBaja && (
            <button
              type="button"
              onClick={onDarDeBaja}
              disabled={guardando}
              style={{
                backgroundColor: '#C53030',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.625rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: guardando ? 'not-allowed' : 'pointer',
                borderRadius: 0,
              }}
            >
              Dar de Baja
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onCancelar}
            disabled={guardando}
            style={{
              backgroundColor: 'var(--color-charcoal, #3B3F45)',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.625rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: guardando ? 'not-allowed' : 'pointer',
              borderRadius: 0,
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            style={{
              backgroundColor: 'var(--color-accent-mint, #4FAE9B)',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.625rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: guardando ? 'not-allowed' : 'pointer',
              opacity: guardando ? 0.65 : 1,
              borderRadius: 0,
            }}
          >
            {guardando ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </form>
  );
}
