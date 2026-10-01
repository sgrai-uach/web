'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Heading from '@/components/ui/Heading';
import { ShieldCheck, UserCheck, Calendar } from 'lucide-react';

export default function GestionWelcomeBanner() {
  const { usuario } = useAuth();

  const fechaHoy = new Intl.DateTimeFormat('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const fechaFormateada = fechaHoy.charAt(0).toUpperCase() + fechaHoy.slice(1);

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
          alignItems: 'flex-start',
          gap: '16px',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              color: 'var(--color-sage, #A9CBA4)',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '10px',
            }}
          >
            <ShieldCheck size={14} />
            <span>Portal de Gestión de Recursos e Incidentes</span>
          </div>

          <Heading as="h1" variant="h1" color="white" noMargin>
            Bienvenido/a, {usuario?.nombre || 'Funcionario Municipal'}
          </Heading>

          <p
            style={{
              margin: '6px 0 0 0',
              fontSize: '14px',
              color: 'var(--color-bg-light, #ECEFF3)',
            }}
          >
            Dirección de Gestión de Riesgos de Desastres (DGRD) &bull; Municipalidad de Valdivia
          </p>
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

          {usuario?.delegacionId && (
            <span style={{ fontSize: '12px', color: 'var(--color-sage, #A9CBA4)' }}>
              Delegación Asignada: {usuario.delegacionId}
            </span>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--color-bg-light, #ECEFF3)',
              marginTop: '4px',
            }}
          >
            <Calendar size={13} />
            <span>{fechaFormateada}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
