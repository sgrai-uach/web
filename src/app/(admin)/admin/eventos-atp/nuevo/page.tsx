'use client';

import React, { useContext } from 'react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import PageTitleCard from '@/components/common/PageTitleCard';
import CommonAccesoDenegadoState from '@/components/common/AccesoDenegadoState';
import { AuthContext } from '@/context/AuthContext';
import { SimulatedSessionContext } from '@/context/SimulatedSessionContext';
import { RUTA_INICIO_GESTION } from '@/lib/constants/routes';
import EventoAtpForm from '@/components/admin/eventos-atp/EventoAtpForm';

export default function NuevoEventoAtpPage() {
  const auth = useContext(AuthContext);
  const session = useContext(SimulatedSessionContext);

  // Política Fail-Closed: durante SSR, la hidratación de la sesión o la carga
  // de permisos no se expone el formulario. Se renderiza sólo cuando la
  // sesión y los permisos ya están resueltos.
  const sesionResuelta =
    Boolean(session?.isMounted) &&
    !auth?.cargando &&
    !session?.cargandoPermisos;

  if (!sesionResuelta) {
    return null;
  }

  const tienePermiso = auth?.usuario
    ? auth.usuario.rolCodigo === 'ADMIN' ||
      auth.tienePermiso('eventos_atp:crear')
    : session?.usuarioActivo
      ? session.usuarioActivo.rol === 'Administrador' ||
        Boolean(session.usuarioActivo.esAdmin) ||
        session.hasPermission('eventos_atp:crear')
      : false;

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
          rolUsuario={session?.usuarioActivo.rol ?? 'Usuario'}
          modulo="la Creación de Eventos ATP"
          mensajePersonalizado="Se requieren privilegios de Administrador o el permiso 'eventos_atp:crear' para registrar un Evento de Alerta Temprana Preventiva."
          botonVolverHref={RUTA_INICIO_GESTION}
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
