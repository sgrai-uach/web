'use client';

import React from 'react';
import type { EmpleadoUsuario } from '@/types/empleados';

interface EmpleadoListaProps {
  resultados: EmpleadoUsuario[];
  cargando: boolean;
  usuarioSeleccionadoId?: string;
  onSelectUsuario: (usuario: EmpleadoUsuario) => void;
  onEliminarUsuario?: (usuario: EmpleadoUsuario) => void;
}

export default function EmpleadoLista({
  resultados,
  cargando,
  usuarioSeleccionadoId,
  onSelectUsuario,
  onEliminarUsuario,
}: EmpleadoListaProps) {
  return (
    <div
      style={{
        marginTop: '1.25rem',
        backgroundColor: '#FFFFFF',
        border: '1px solid #DFE3E8',
        maxHeight: '380px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          padding: '0.625rem 1rem',
          backgroundColor: '#F8FAFC',
          borderBottom: '1px solid #DFE3E8',
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: '#64748B',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>Listado de Personal ({resultados.length})</span>
        {cargando && <span style={{ color: 'var(--color-primary-teal, #1B6F7D)' }}>Actualizando...</span>}
      </div>

      {resultados.length === 0 ? (
        <div
          style={{
            padding: '2rem 1rem',
            color: '#64748B',
            fontSize: '0.875rem',
            textAlign: 'center',
          }}
        >
          {cargando ? 'Consultando base de datos...' : 'No se encontraron funcionarios con los filtros aplicados.'}
        </div>
      ) : (
        resultados.map((usr) => {
          const estaSeleccionado = usr.usuario_id === usuarioSeleccionadoId;
          return (
            <div
              key={usr.usuario_id}
              onClick={() => onSelectUsuario(usr)}
              style={{
                padding: '0.875rem 1rem',
                borderBottom: '1px solid #ECEFF3',
                cursor: 'pointer',
                backgroundColor: estaSeleccionado
                  ? 'var(--color-bg-light, #ECEFF3)'
                  : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!estaSeleccionado) {
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = estaSeleccionado
                  ? 'var(--color-bg-light, #ECEFF3)'
                  : 'transparent';
              }}
            >
              {/* Información del funcionario */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-dark, #2B2B2B)' }}>
                    {usr.nombres} {usr.apellidos}
                  </span>
                  {usr.rol_nombre && (
                    <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                      &bull; {usr.rol_nombre}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: '0.8125rem',
                    color: '#666',
                    marginTop: '0.25rem',
                    display: 'flex',
                    gap: '1.25rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <span>RUT: <strong>{usr.rut}</strong></span>
                  <span>Email: {usr.email}</span>
                  {usr.delegacion_nombre && <span>Delegación: {usr.delegacion_nombre}</span>}
                </div>
              </div>

              {/* Acciones de fila */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {onEliminarUsuario && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEliminarUsuario(usr);
                    }}
                    title={`Dar de baja a ${usr.nombres} ${usr.apellidos}`}
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.25rem 0.5rem',
                      backgroundColor: 'transparent',
                      color: '#991B1B',
                      border: '1px solid #E5E7EB',
                      borderRadius: 0,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#FEF2F2';
                      e.currentTarget.style.borderColor = '#FCA5A5';
                      e.currentTarget.style.color = '#B91C1C';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.color = '#991B1B';
                    }}
                  >
                    <span style={{ fontSize: '0.7rem' }}>🗑</span>
                    <span>Dar de baja</span>
                  </button>
                )}
                {estaSeleccionado && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--color-primary-teal, #1B6F7D)',
                    }}
                  >
                    ✓ En edición
                  </span>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
