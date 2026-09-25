'use client';

import React from 'react';
import type { CatalogoItem } from '@/types/catalogos';

interface EmpleadoFiltrosProps {
  termino: string;
  onTerminoChange: (valor: string) => void;
  onLimpiarTermino: () => void;
  cargando: boolean;
  delegaciones: CatalogoItem[];
  delegacionFiltro: string;
  onDelegacionChange: (valor: string) => void;
  roles: CatalogoItem[];
  rolFiltro: string;
  onRolChange: (valor: string) => void;
  ordenarPor: string;
  onOrdenarPorChange: (valor: string) => void;
  orden: 'asc' | 'desc';
  onToggleOrden: () => void;
}

export default function EmpleadoFiltros({
  termino,
  onTerminoChange,
  onLimpiarTermino,
  cargando,
  delegaciones,
  delegacionFiltro,
  onDelegacionChange,
  roles,
  rolFiltro,
  onRolChange,
  ordenarPor,
  onOrdenarPorChange,
  orden,
  onToggleOrden,
}: EmpleadoFiltrosProps) {
  return (
    <div>
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
          <input
            id="buscar-empleado-input"
            type="text"
            value={termino}
            onChange={(e) => onTerminoChange(e.target.value)}
            placeholder="Buscar por RUT, Nombre, Apellidos o Correo Electrónico..."
            style={{
              width: '100%',
              padding: '0.625rem 0.875rem',
              border: '1px solid #BAC7D5',
              fontSize: '0.875rem',
              color: 'var(--color-text-dark, #2B2B2B)',
              outline: 'none',
              borderRadius: 0,
              backgroundColor: '#FFFFFF',
            }}
            autoComplete="off"
          />
          {termino && (
            <button
              type="button"
              onClick={onLimpiarTermino}
              style={{
                position: 'absolute',
                right: cargando ? '6rem' : '0.75rem',
                background: 'none',
                border: 'none',
                color: '#888',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.875rem',
              }}
              title="Limpiar búsqueda"
            >
              ✕
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

      {/* Controles de Filtros y Ordenamiento */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '0.75rem',
          marginTop: '0.875rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid #ECEFF3',
        }}
      >
        <div>
          <label htmlFor="filtro-delegacion" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#555', marginBottom: '0.2rem' }}>
            Filtrar por Delegación
          </label>
          <select
            id="filtro-delegacion"
            value={delegacionFiltro}
            onChange={(e) => onDelegacionChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.6rem',
              fontSize: '0.8125rem',
              border: '1px solid #BAC7D5',
              borderRadius: 0,
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="">Todas las delegaciones</option>
            {delegaciones.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filtro-rol" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#555', marginBottom: '0.2rem' }}>
            Filtrar por Rol
          </label>
          <select
            id="filtro-rol"
            value={rolFiltro}
            onChange={(e) => onRolChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.6rem',
              fontSize: '0.8125rem',
              border: '1px solid #BAC7D5',
              borderRadius: 0,
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="">Todos los roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="ordenar-por" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#555', marginBottom: '0.2rem' }}>
            Ordenar lista por
          </label>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <select
              id="ordenar-por"
              value={ordenarPor}
              onChange={(e) => onOrdenarPorChange(e.target.value)}
              style={{
                flex: 1,
                padding: '0.45rem 0.6rem',
                fontSize: '0.8125rem',
                border: '1px solid #BAC7D5',
                borderRadius: 0,
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="apellidos">Apellidos</option>
              <option value="nombres">Nombres</option>
              <option value="rut">RUT</option>
            </select>
            <button
              type="button"
              onClick={onToggleOrden}
              style={{
                padding: '0.45rem 0.65rem',
                border: '1px solid #BAC7D5',
                background: '#F1F4F8',
                borderRadius: 0,
                cursor: 'pointer',
                fontSize: '0.8125rem',
                fontWeight: 700,
              }}
              title={
                ordenarPor === 'rut'
                  ? `Orden: ${orden === 'asc' ? 'Menor a Mayor (0-9)' : 'Mayor a Menor (9-0)'}`
                  : `Orden: ${orden === 'asc' ? 'Ascendente (A-Z)' : 'Descendente (Z-A)'}`
              }
            >
              {ordenarPor === 'rut'
                ? orden === 'asc'
                  ? '▲ 0-9'
                  : '▼ 9-0'
                : orden === 'asc'
                  ? '▲ A-Z'
                  : '▼ Z-A'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
