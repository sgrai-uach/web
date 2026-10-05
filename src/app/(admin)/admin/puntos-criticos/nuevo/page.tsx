'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import PageTitleCard from '@/components/common/PageTitleCard';
import CommonAccesoDenegadoState from '@/components/common/AccesoDenegadoState';
import { useSimulatedSession } from '@/context/SimulatedSessionContext';
import { DEFAULT_ADMIN_USER_ID } from '@/lib/api/client';
import PuntoCriticoForm from '@/components/admin/puntos-criticos/PuntoCriticoForm';

import { usePathname } from 'next/navigation';

export default function NuevoPuntoCriticoPage() {
  const pathname = usePathname() || '';
  const { usuarioActivo, hasPermission } = useSimulatedSession();

  const basePath = pathname.startsWith('/gestion')
    ? '/gestion/admin/puntos-criticos'
    : '/admin/puntos-criticos';

  const tienePermiso =
    usuarioActivo.rol === 'Administrador' ||
    Boolean(usuarioActivo.esAdmin) ||
    usuarioActivo.id === DEFAULT_ADMIN_USER_ID ||
    hasPermission('puntos_criticos:crear') ||
    hasPermission('eventos_atp:crear') ||
    hasPermission('puntos_criticos:gestionar');

  if (!tienePermiso) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6, 24px)' }}>
        <Breadcrumbs
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Administración' },
            { label: 'Puntos Críticos', href: basePath },
            { label: 'Nuevo Punto Crítico' },
          ]}
        />
        <CommonAccesoDenegadoState
          rolUsuario={usuarioActivo.rol}
          modulo="la Creación de Puntos Críticos"
          mensajePersonalizado="Se requieren privilegios de Administrador o el permiso 'puntos_criticos:crear' para dar de alta nuevos sectores territoriales en el catastro comunal."
          botonVolverHref={basePath}
          botonVolverTexto="Volver al Listado"
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6, 24px)' }}>
      {/* Breadcrumbs Institucionales */}
      <Breadcrumbs
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Administración' },
          { label: 'Puntos Críticos', href: basePath },
          { label: 'Nuevo Punto Crítico' },
        ]}
      />

      {/* Tarjeta de Título Institucional */}
      <PageTitleCard
        title="Crear Nuevo Punto Crítico"
        badge="Catastro Preventivo"
        description="Registre un nuevo sector vulnerable o área crítica con georreferenciación precisa para la atención y prevención de incidentes comunales en Valdivia."
      />

      {/* Formulario Integral con Mapa */}
      <PuntoCriticoForm />
    </div>
  );
}
