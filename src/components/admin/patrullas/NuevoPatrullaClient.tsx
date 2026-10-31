'use client';

import React from 'react';
import Link from 'next/link';
import Heading from '@/components/ui/Heading';
import AccesoDenegadoState from '@/components/common/AccesoDenegadoState';
import { useSimulatedSession } from '@/context/SimulatedSessionContext';
import PatrullaForm from './PatrullaForm';

export default function NuevoPatrullaClient() {
  const { hasPermission, usuarioActivo, isMounted } = useSimulatedSession();

  const puedeCrear = isMounted === false ? false : hasPermission('recursos:crear');

  if (isMounted === false) {
    return null;
  }

  if (!puedeCrear) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Breadcrumb Institucional */}
        <nav
          aria-label="Breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: 'var(--color-charcoal, #3B3F45)',
          }}
        >
          <Link
            href="/"
            style={{
              color: 'var(--color-primary-teal, #1B6F7D)',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Inicio
          </Link>
          <span>&rsaquo;</span>
          <span style={{ color: 'var(--color-charcoal, #3B3F45)' }}>Administración</span>
          <span>&rsaquo;</span>
          <Link
            href="/gestion/centro-incidentes"
            style={{
              color: 'var(--color-primary-teal, #1B6F7D)',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Patrullas Verificadoras
          </Link>
          <span>&rsaquo;</span>
          <span style={{ fontWeight: 600, color: 'var(--color-primary-teal-dark, #14505A)' }}>
            Nueva Patrulla
          </span>
        </nav>

        {/* Acceso Denegado por falta de permiso recursos:crear */}
        <AccesoDenegadoState
          rolUsuario={usuarioActivo?.rol || 'Usuario'}
          modulo="el Registro de Patrullas Verificadoras"
          permisoRequerido="recursos:crear"
          botonVolverHref="/gestion"
          botonVolverTexto="Volver a Gestión"
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Breadcrumb Institucional */}
      <nav
        aria-label="Breadcrumb"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          color: 'var(--color-charcoal, #3B3F45)',
        }}
      >
        <Link
          href="/"
          style={{
            color: 'var(--color-primary-teal, #1B6F7D)',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          Inicio
        </Link>
        <span>&rsaquo;</span>
        <span style={{ color: 'var(--color-charcoal, #3B3F45)' }}>Administración</span>
        <span>&rsaquo;</span>
        <Link
          href="/gestion/centro-incidentes"
          style={{
            color: 'var(--color-primary-teal, #1B6F7D)',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          Patrullas Verificadoras
        </Link>
        <span>&rsaquo;</span>
        <span style={{ fontWeight: 600, color: 'var(--color-primary-teal-dark, #14505A)' }}>
          Nueva Patrulla
        </span>
      </nav>

      {/* Encabezado de Página */}
      <div
        style={{
          backgroundColor: 'var(--color-white, #FFFFFF)',
          padding: '24px',
          borderLeft: '5px solid var(--color-primary-teal, #1B6F7D)',
          borderBottom: '1px solid var(--color-bg-light, #ECEFF3)',
        }}
      >
        <Heading as="h1" variant="h1" color="teal-dark" noMargin>
          Registrar Nueva Patrulla Verificadora
        </Heading>
        <p
          style={{
            margin: '8px 0 0 0',
            fontSize: '14px',
            color: 'var(--color-charcoal, #3B3F45)',
            lineHeight: 1.5,
          }}
        >
          Complete el formulario para dar de alta una unidad de respuesta rápida y evaluación
          primaria (triage) en terreno. Al registrarse, la patrulla quedará en estado DISPONIBLE y
          visible de inmediato en el Centro de Mando.
        </p>
      </div>

      {/* Formulario */}
      <PatrullaForm />
    </div>
  );
}
