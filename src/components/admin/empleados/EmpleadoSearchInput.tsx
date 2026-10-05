'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import Button from '@/components/ui/Button';

interface EmpleadoSearchInputProps {
  termino: string;
  setTermino: (val: string) => void;
  cargando: boolean;
  onFocusInput?: () => void;
}

export default function EmpleadoSearchInput({
  termino,
  setTermino,
  cargando,
  onFocusInput,
}: EmpleadoSearchInputProps) {
  return (
    <div style={{ marginBottom: '0.25rem' }}>
      <label
        htmlFor="buscar-empleado-input"
        style={{
          display: 'block',
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: 'var(--color-primary-teal-dark, #14505A)',
          marginBottom: '0.25rem',
        }}
      >
        Buscar en Personal Municipal
      </label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search
          size={15}
          style={{
            position: 'absolute',
            left: '0.65rem',
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
            padding: '0.45rem 0.75rem 0.45rem 2rem',
            border: '1px solid var(--border-color-neutral, #DFE3E8)',
            fontSize: '0.8125rem',
            color: 'var(--color-text-dark, #2B2B2B)',
            outline: 'none',
            borderRadius: 0,
            backgroundColor: 'var(--color-white, #FFFFFF)',
            height: '36px',
            boxSizing: 'border-box',
          }}
          autoComplete="off"
        />
        {termino && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setTermino('')}
            style={{
              position: 'absolute',
              right: cargando ? '6rem' : '0.75rem',
              minHeight: 'auto',
              padding: '2px 4px',
              color: 'var(--color-text-muted, #5F676E)',
            }}
            title="Limpiar búsqueda"
            aria-label="Limpiar búsqueda"
          >
            <X size={16} />
          </Button>
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
