'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

interface EmpleadoSearchInputProps {
  termino: string;
  setTermino: (val: string) => void;
  cargando: boolean;
  onFocusInput: () => void;
}

export default function EmpleadoSearchInput({
  termino,
  setTermino,
  cargando,
  onFocusInput,
}: EmpleadoSearchInputProps) {
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <label
        htmlFor="buscar-empleado-input"
        style={{
          display: 'block',
          fontSize: '0.8125rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: 'var(--color-charcoal, #3B3F45)',
          marginBottom: '0.35rem',
        }}
      >
        Seleccionar Usuario / Empleado
      </label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '0.75rem',
            color: 'var(--color-text-muted, #5F676E)',
          }}
        />
        <input
          id="buscar-empleado-input"
          type="text"
          value={termino}
          onChange={(e) => setTermino(e.target.value)}
          onFocus={onFocusInput}
          placeholder="Buscar por RUT, Nombre, Apellidos o Correo..."
          style={{
            width: '100%',
            padding: '0.625rem 0.875rem 0.625rem 2.25rem',
            border: '1px solid var(--border-color-neutral, #DFE3E8)',
            fontSize: '0.875rem',
            color: 'var(--color-text-dark, #2B2B2B)',
            outline: 'none',
            borderRadius: 0,
            backgroundColor: 'var(--color-white, #FFFFFF)',
          }}
          autoComplete="off"
        />
        {termino && (
          <button
            type="button"
            onClick={() => setTermino('')}
            style={{
              position: 'absolute',
              right: cargando ? '6rem' : '0.75rem',
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted, #5F676E)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Limpiar búsqueda"
          >
            <X size={16} />
          </button>
        )}
        {cargando && (
          <span
            style={{
              position: 'absolute',
              right: '0.875rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--color-primary-teal, #1B6F7D)',
            }}
          >
            Buscando...
          </span>
        )}
      </div>
    </div>
  );
}
