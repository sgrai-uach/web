'use client';

import React from 'react';
import Heading from '@/components/ui/Heading';
import type { EmpleadoUsuario } from '@/types/empleados';

interface EmpleadoFormHeaderProps {
  usuario: EmpleadoUsuario;
  esRolTerreno: boolean;
}

export default function EmpleadoFormHeader({ usuario, esRolTerreno }: EmpleadoFormHeaderProps) {
  return (
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
        <Heading as="h2" variant="h3" color="teal-dark" noMargin>
          Ficha de Modificación: {usuario.nombres} {usuario.apellidos}
        </Heading>
        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted, #5F676E)', marginTop: '0.25rem' }}>
          ID de Usuario: <code>{usuario.usuario_id}</code> &bull; RUT: {usuario.rut}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span
          style={{
            backgroundColor: usuario.usuario_activo
              ? 'var(--color-success-bg, #E8F5E9)'
              : 'var(--color-danger-bg, #FFEBEE)',
            color: usuario.usuario_activo
              ? 'var(--color-success, #2E7D32)'
              : 'var(--color-danger, #D32F2F)',
            padding: '0.25rem 0.625rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          {usuario.usuario_activo ? 'Cuenta Activa' : 'Cuenta Inactiva'}
        </span>
        {esRolTerreno && (
          <span
            style={{
              backgroundColor: 'var(--color-info-bg, #E0F2F1)',
              color: 'var(--color-primary-teal, #1B6F7D)',
              padding: '0.25rem 0.625rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            Personal Operativo Terreno
          </span>
        )}
      </div>
    </div>
  );
}
