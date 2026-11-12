'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import PageTitleCard from '@/components/common/PageTitleCard';
import CommonAccesoDenegadoState from '@/components/common/AccesoDenegadoState';
import { useSimulatedSession } from '@/context/SimulatedSessionContext';
import { DEFAULT_ADMIN_USER_ID } from '@/lib/api/client';
import EventoAtpForm from '@/components/admin/eventos-atp/EventoAtpForm';

export default function NuevoEventoAtpPage() {
  const pathname = usePathname() || '';
  const { usuarioActivo, hasPermission } = useSimulatedSession();

  const panelPath = pathname.startsWith('/gestion')
    ? '/gestion/admin'
    : '/admin';

  const tienePermiso =
    usuarioActivo.rol === 'Administrador' ||
    Boolean(usuarioActivo.esAdmin) ||
    usuarioActivo.id === DEFAULT_ADMIN_USER_ID ||
    hasPermission('eventos_atp:crear');

  if (!tienePermiso) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6, 24px)',
        }}
      >
        <Breadcrumbs
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Administración' },
            { label: 'Eventos ATP' },
            { label: 'Nuevo Evento ATP' },
          ]}
        />
        <CommonAccesoDenegadoState
          rolUsuario={usuarioActivo.rol}
          modulo="la Creación de Eventos ATP"
          mensajePersonalizado="Se requieren privilegios de Administrador o el permiso 'eventos_atp:crear' para registrar un Evento de Alerta Temprana Preventiva."
          botonVolverHref={panelPath}
          botonVolverTexto="Volver al Panel de Administración"
        />
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6, 24px)',
      }}
    >
      <Breadcrumbs
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Administración' },
          { label: 'Eventos ATP' },
          { label: 'Nuevo Evento ATP' },
        ]}
      />

      <PageTitleCard
        title="Crear Evento de Alerta Temprana Preventiva"
        badge="Evento ATP"
        description="Registre el marco oficial del fenómeno, su nivel de alerta y las delegaciones afectadas. El evento se activará inmediatamente y notificará a los equipos operativos y al mapa comunal."
      />

      <EventoAtpForm />
    </div>
  );
}
