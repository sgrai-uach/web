'use client';

import React from 'react';

export default function AdminHeader() {
  return (
    <header style={{ width: '100%', marginBottom: '1.5rem' }}>
      {/* Barra superior de acento institucional */}
      <div
        style={{
          backgroundColor: 'var(--color-primary-teal-dark, #14505A)',
          color: 'var(--color-text-light, #FFFFFF)',
          padding: '0.625rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          borderBottom: '3px solid var(--color-accent-mint, #4FAE9B)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              backgroundColor: 'var(--color-accent-mint, #4FAE9B)',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1rem',
              color: '#FFFFFF',
            }}
          >
            V
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', letterSpacing: '0.5px', textTransform: 'uppercase', opacity: 0.9 }}>
              Municipalidad de Valdivia &bull; Gestión de Riesgos de Desastres
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.125rem', letterSpacing: '-0.2px' }}>
              SGRAI &mdash; Panel Administrador de Empleados y Usuarios
            </div>
          </div>
        </div>

        <div>
          <span
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '0.35rem 0.75rem',
              fontSize: '0.8125rem',
              color: 'var(--color-text-light, #FFFFFF)',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            Recursos y Seguridad
          </span>
        </div>
      </div>

      {/* Franja de contexto funcional */}
      <div
        style={{
          backgroundColor: 'var(--color-bg-light, #ECEFF3)',
          padding: '0.75rem 1.5rem',
          borderBottom: '1px solid #DFE3E8',
          fontSize: '0.875rem',
          color: 'var(--color-charcoal, #3B3F45)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <span>
          Módulo de asignación de roles, cuentas institucionales y especialización para personal operativo de terreno.
        </span>
        <span style={{ fontSize: '0.8rem', color: '#666' }}>
          Modo Administrador &bull; Conexión sgrai-api
        </span>
      </div>
    </header>
  );
}
