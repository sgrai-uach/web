'use client';

import React from 'react';
import Link from 'next/link';
import Heading from '@/components/ui/Heading';
import AccesoDenegadoState from '@/components/common/AccesoDenegadoState';
import { useAuth } from '@/context/AuthContext';
import CuadrillaForm from './CuadrillaForm';

export default function NuevaCuadrillaClient() {
  const { usuario, tienePermiso, cargando } = useAuth();

  // Verificación de acceso RBAC: requiere permiso 'recursos:crear' o rol de Administrador
  const esAdmin =
    usuario?.rolCodigo === 'ADMIN' ||
    usuario?.rolCodigo === 'ADMINISTRADOR' ||
    usuario?.rolNombre?.toLowerCase().includes('admin');

  const tienePermisoCrear = tienePermiso('recursos:crear') || esAdmin;

  if (cargando) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Cargando sesión y permisos...
      </div>
    );
  }

  if (!tienePermisoCrear) {
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
          <Link href="/gestion" style={{ color: 'var(--color-primary-teal)', fontWeight: 500, textDecoration: 'none' }}>
            Inicio
          </Link>
          <span>&rsaquo;</span>
          <span style={{ color: 'var(--color-charcoal)' }}>Administración</span>
          <span>&rsaquo;</span>
          <span style={{ fontWeight: 600, color: 'var(--color-primary-teal-dark)' }}>Cuadrillas Operativas</span>
        </nav>

        {/* Acceso Denegado por falta de permiso recursos:crear */}
        <AccesoDenegadoState
          rolUsuario={usuario?.rolNombre || usuario?.rolCodigo || 'Usuario'}
          modulo="el Registro de Cuadrillas Operativas"
          permisoRequerido="recursos:crear"
          botonVolverHref="/gestion/centro-incidentes"
          botonVolverTexto="Volver al Centro de Mando"
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
        <Link href="/gestion" style={{ color: 'var(--color-primary-teal)', fontWeight: 500, textDecoration: 'none' }}>
          Inicio
        </Link>
        <span>&rsaquo;</span>
        <span style={{ color: 'var(--color-charcoal)' }}>Administración</span>
        <span>&rsaquo;</span>
        <Link
          href="/gestion/centro-incidentes"
          style={{ color: 'var(--color-primary-teal)', fontWeight: 500, textDecoration: 'none' }}
        >
          Centro de Mando
        </Link>
        <span>&rsaquo;</span>
        <span style={{ fontWeight: 600, color: 'var(--color-primary-teal-dark)' }}>Nueva Cuadrilla</span>
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
          Registrar Nueva Cuadrilla Operativa
        </Heading>
        <p
          style={{
            margin: '8px 0 0 0',
            fontSize: '14px',
            color: 'var(--color-charcoal)',
            lineHeight: 1.5,
          }}
        >
          Definición de unidades pesadas de mitigación y despeje en la comuna de Valdivia. Cada cuadrilla queda asociada a una delegación municipal base y bajo el mando de un delegado responsable.
        </p>
      </div>

      {/* Formulario */}
      <CuadrillaForm />
    </div>
  );
}
