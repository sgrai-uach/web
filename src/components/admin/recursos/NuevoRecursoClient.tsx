'use client';

import React from 'react';
import Link from 'next/link';
import RecursoForm from '@/components/admin/RecursoForm';
import Heading from '@/components/ui/Heading';
import AccesoDenegadoState from '@/components/common/AccesoDenegadoState';
import { useSimulatedSession } from '@/context/SimulatedSessionContext';

export default function NuevoRecursoClient() {
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
            color: 'var(--color-charcoal)',
          }}
        >
          <Link href="/" style={{ color: 'var(--color-primary-teal)', fontWeight: 500, textDecoration: 'none' }}>
            Inicio
          </Link>
          <span>&rsaquo;</span>
          <span style={{ color: 'var(--color-charcoal)' }}>Administración</span>
          <span>&rsaquo;</span>
          <Link href="/admin/recursos" style={{ color: 'var(--color-primary-teal)', fontWeight: 500, textDecoration: 'none' }}>
            Inventario Logístico
          </Link>
          <span>&rsaquo;</span>
          <span style={{ fontWeight: 600, color: 'var(--color-primary-teal-dark)' }}>Nuevo Recurso</span>
        </nav>

        {/* Acceso Denegado por falta de permiso recursos:crear */}
        <AccesoDenegadoState
          rolUsuario={usuarioActivo.rol}
          modulo="el Registro de Recursos"
          permisoRequerido="recursos:crear"
          botonVolverHref="/admin/recursos"
          botonVolverTexto="Volver al Inventario"
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
          color: 'var(--color-charcoal)',
        }}
      >
        <Link href="/" style={{ color: 'var(--color-primary-teal)', fontWeight: 500, textDecoration: 'none' }}>
          Inicio
        </Link>
        <span>&rsaquo;</span>
        <span style={{ color: 'var(--color-charcoal)' }}>Administración</span>
        <span>&rsaquo;</span>
        <Link href="/admin/recursos" style={{ color: 'var(--color-primary-teal)', fontWeight: 500, textDecoration: 'none' }}>
          Inventario Logístico
        </Link>
        <span>&rsaquo;</span>
        <span style={{ fontWeight: 600, color: 'var(--color-primary-teal-dark)' }}>Nuevo Recurso</span>
      </nav>

      {/* Encabezado de Página */}
      <div
        style={{
          backgroundColor: 'var(--color-white)',
          padding: '24px',
          borderLeft: '5px solid var(--color-primary-teal)',
          borderBottom: '1px solid var(--color-bg-light)',
        }}
      >
        <Heading as="h1" variant="h1" color="teal-dark" noMargin>
          Registrar Nuevo Recurso
        </Heading>
        <p
          style={{
            margin: '8px 0 0 0',
            fontSize: '14px',
            color: 'var(--color-charcoal)',
            maxWidth: '800px',
          }}
        >
          Completa el formulario para dar de alta un recurso fungible a granel o un activo físico
          individual en el inventario logístico municipal de Valdivia.
        </p>
      </div>

      {/* Formulario de Alta */}
      <RecursoForm />
    </div>
  );
}
