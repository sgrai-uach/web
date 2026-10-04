'use client';

import React from 'react';
import type { EmpleadoUsuario } from '@/types/empleados';
import { obtenerNombreDelegacion } from '@/lib/utils/delegacionUtils';

interface EmpleadoResultadoItemProps {
  usuario: EmpleadoUsuario;
  estaSeleccionado: boolean;
  onSelect: () => void;
}

export default function EmpleadoResultadoItem({
  usuario: usr,
  estaSeleccionado,
  onSelect,
}: EmpleadoResultadoItemProps) {
  return (
    <div
      onClick={onSelect}
      style={{
        padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--color-bg-light, #ECEFF3)',
        cursor: 'pointer',
        backgroundColor: estaSeleccionado ? 'var(--color-bg-light, #ECEFF3)' : 'transparent',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-bg-light, #ECEFF3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = estaSeleccionado
          ? 'var(--color-bg-light, #ECEFF3)'
          : 'transparent';
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-dark, #2B2B2B)' }}>
          {usr.nombres} {usr.apellidos}
        </span>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {usr.es_personal ? (
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '0.2rem 0.5rem',
                backgroundColor: 'var(--color-accent-mint, #4FAE9B)',
                color: 'var(--color-text-light, #FFFFFF)',
                textTransform: 'uppercase',
                borderRadius: 0,
              }}
            >
              Personal Terreno
            </span>
          ) : (
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '0.2rem 0.5rem',
                backgroundColor: 'var(--color-text-muted, #5F676E)',
                color: 'var(--color-text-light, #FFFFFF)',
                textTransform: 'uppercase',
                borderRadius: 0,
              }}
            >
              Oficina / General
            </span>
          )}
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              padding: '0.2rem 0.5rem',
              backgroundColor: 'var(--color-charcoal, #3B3F45)',
              color: 'var(--color-text-light, #FFFFFF)',
              textTransform: 'uppercase',
              borderRadius: 0,
            }}
          >
            {usr.rol_nombre || usr.rol_codigo}
          </span>
        </div>
      </div>
      <div
        style={{
          fontSize: '0.8125rem',
          color: 'var(--color-text-muted, #5F676E)',
          marginTop: '0.25rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <span>RUT: <strong>{usr.rut}</strong></span>
        <span>Email: {usr.email}</span>
        {(usr.delegacion_nombre || usr.delegacion_id) && (
          <span>
            Delegación: {usr.delegacion_nombre || obtenerNombreDelegacion(usr.delegacion_id)}
          </span>
        )}
      </div>
    </div>
  );
}
