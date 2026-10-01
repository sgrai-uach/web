'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Heading from '@/components/ui/Heading';
import { UserCheck } from 'lucide-react';
import { obtenerNombreDelegacion } from '@/lib/utils/delegacionUtils';

export default function GestionWelcomeBanner() {
  const { usuario } = useAuth();

  const nombreDelegacion =
    usuario?.delegacionNombre || obtenerNombreDelegacion(usuario?.delegacionId);

  return (
    <div
      style={{
        backgroundColor: 'var(--color-primary-teal-dark, #14505A)',
        color: 'var(--color-text-light, #FFFFFF)',
        padding: '28px',
        borderLeft: '6px solid var(--color-accent-mint, #4FAE9B)',
        boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.08))',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div>
          <Heading as="h1" variant="h1" color="white" noMargin>
            Bienvenido/a, {usuario?.nombre || 'Funcionario Municipal'}
          </Heading>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '8px',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--color-accent-mint, #4FAE9B)',
              color: 'var(--color-charcoal-dark, #24272B)',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
            }}
          >
            <UserCheck size={15} />
            <span>Rol: {usuario?.rolNombre || 'Operador'}</span>
          </div>

          {nombreDelegacion && (
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-sage, #A9CBA4)' }}>
              Delegación Asignada: {nombreDelegacion}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
