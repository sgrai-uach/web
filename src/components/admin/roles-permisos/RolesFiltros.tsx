'use client';

import React from 'react';

export type FiltroTipoRol = 'TODOS' | 'SISTEMA' | 'PERSONALIZADO';
export type FiltroEstadoPermisos = 'TODOS' | 'CON_PERMISOS' | 'SIN_PERMISOS';

interface RolesFiltrosProps {
  busqueda: string;
  onBusquedaChange: (valor: string) => void;
  filtroTipo: FiltroTipoRol;
  onFiltroTipoChange: (filtro: FiltroTipoRol) => void;
  filtroEstado: FiltroEstadoPermisos;
  onFiltroEstadoChange: (filtro: FiltroEstadoPermisos) => void;
  onRefrescar: () => void;
  cargando: boolean;
}

export default function RolesFiltros({
  busqueda,
  onBusquedaChange,
  filtroTipo,
  onFiltroTipoChange,
  filtroEstado,
  onFiltroEstadoChange,
  onRefrescar,
  cargando,
}: RolesFiltrosProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-white, #FFFFFF)',
        border: '1px solid #DFE3E8',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}
    >
      {/* Buscador de texto */}
      <div style={{ flex: '1 1 300px', minWidth: '260px', position: 'relative' }}>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          placeholder="Buscar perfil por nombre, descripción o módulo..."
          style={{
            width: '100%',
            padding: '0.625rem 0.875rem',
            border: '1px solid #CCD2D9',
            borderRadius: 0,
            fontSize: '0.875rem',
            color: 'var(--color-charcoal, #3B3F45)',
            backgroundColor: '#FFFFFF',
            outline: 'none',
          }}
        />
        {busqueda && (
          <button
            type="button"
            onClick={() => onBusquedaChange('')}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: '1rem',
              color: '#888',
            }}
            title="Limpiar búsqueda"
          >
            &times;
          </button>
        )}
      </div>

      {/* Controles de Filtros */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        {/* Filtro Tipo de Perfil */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.8125rem', color: '#666', fontWeight: 600 }}>
            Tipo:
          </span>
          <div style={{ display: 'inline-flex', border: '1px solid #CCD2D9' }}>
            {(
              [
                { clave: 'TODOS', label: 'Todos' },
                { clave: 'SISTEMA', label: 'Sistema' },
                { clave: 'PERSONALIZADO', label: 'Personalizado' },
              ] as const
            ).map((opt) => {
              const activo = filtroTipo === opt.clave;
              return (
                <button
                  key={opt.clave}
                  type="button"
                  onClick={() => onFiltroTipoChange(opt.clave)}
                  style={{
                    border: 'none',
                    borderRadius: 0,
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: activo ? 700 : 500,
                    backgroundColor: activo
                      ? 'var(--color-primary-teal, #1B6F7D)'
                      : '#FFFFFF',
                    color: activo ? '#FFFFFF' : 'var(--color-charcoal, #3B3F45)',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtro Estado Permisos */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.8125rem', color: '#666', fontWeight: 600 }}>
            Permisos:
          </span>
          <div style={{ display: 'inline-flex', border: '1px solid #CCD2D9' }}>
            {(
              [
                { clave: 'TODOS', label: 'Todos' },
                { clave: 'CON_PERMISOS', label: 'Con Permisos' },
                { clave: 'SIN_PERMISOS', label: 'Sin Permisos' },
              ] as const
            ).map((opt) => {
              const activo = filtroEstado === opt.clave;
              return (
                <button
                  key={opt.clave}
                  type="button"
                  onClick={() => onFiltroEstadoChange(opt.clave)}
                  style={{
                    border: 'none',
                    borderRadius: 0,
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: activo ? 700 : 500,
                    backgroundColor: activo
                      ? 'var(--color-primary-teal, #1B6F7D)'
                      : '#FFFFFF',
                    color: activo ? '#FFFFFF' : 'var(--color-charcoal, #3B3F45)',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Botón Refrescar */}
        <button
          type="button"
          onClick={onRefrescar}
          disabled={cargando}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            border: '1px solid #CCD2D9',
            borderRadius: 0,
            padding: '0.45rem 0.85rem',
            fontSize: '0.8125rem',
            fontWeight: 600,
            backgroundColor: '#FFFFFF',
            color: 'var(--color-charcoal, #3B3F45)',
            cursor: cargando ? 'not-allowed' : 'pointer',
            opacity: cargando ? 0.7 : 1,
          }}
          title="Refrescar listado de roles"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              animation: cargando ? 'spin 1s linear infinite' : 'none',
            }}
          >
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          <span>{cargando ? 'Cargando...' : 'Refrescar'}</span>
        </button>
      </div>

      <style jsx>{`
        @keyframes spin {
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
