'use client';

import React from 'react';
import type { RolItem } from '@/types/api';
import RolCard from './RolCard';

interface RolesGridProps {
  roles: RolItem[];
  onSeleccionarRol: (rol: RolItem) => void;
  busquedaActiva: boolean;
  onLimpiarFiltros: () => void;
}

export default function RolesGrid({
  roles,
  onSeleccionarRol,
  busquedaActiva,
  onLimpiarFiltros,
}: RolesGridProps) {
  if (roles.length === 0) {
    return (
      <div
        style={{
          backgroundColor: 'var(--color-white, #FFFFFF)',
          border: '1px solid #DFE3E8',
          padding: '3.5rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ECEFF3',
            color: 'var(--color-charcoal, #3B3F45)',
            width: '48px',
            height: '48px',
            marginBottom: '1rem',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <h3
          style={{
            fontSize: '1.125rem',
            fontWeight: 800,
            color: 'var(--color-charcoal, #3B3F45)',
            marginBottom: '0.35rem',
          }}
        >
          No se encontraron perfiles coincidentes
        </h3>

        <p
          style={{
            fontSize: '0.875rem',
            color: '#666',
            marginBottom: '1.25rem',
          }}
        >
          {busquedaActiva
            ? 'Ningún rol coincide con el texto o los filtros seleccionados.'
            : 'No hay perfiles registrados en el sistema.'}
        </p>

        {busquedaActiva && (
          <button
            type="button"
            onClick={onLimpiarFiltros}
            style={{
              backgroundColor: 'var(--color-primary-teal, #1B6F7D)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 0,
              padding: '0.5rem 1.25rem',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Restablecer Filtros
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.25rem',
      }}
    >
      {roles.map((rol) => (
        <RolCard key={rol.id} rol={rol} onSeleccionar={onSeleccionarRol} />
      ))}
    </div>
  );
}
