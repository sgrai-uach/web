'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import PageTitleCard from '@/components/common/PageTitleCard';
import AccesoDenegadoState from '@/components/common/AccesoDenegadoState';
import { useSimulatedSession } from '@/context/SimulatedSessionContext';
import EventoAsistenciaSocialForm from './EventoAsistenciaSocialForm';

interface NuevoEventoSocialClientProps {
  basePath?: string;
}

export default function NuevoEventoSocialClient({
  basePath = '/gestion/asistente-social',
}: NuevoEventoSocialClientProps) {
  const { usuarioActivo, hasPermission } = useSimulatedSession();

  const puedeCrear =
    usuarioActivo.rol === 'Administrador' ||
    usuarioActivo.rol === 'Encargado' ||
    Boolean(usuarioActivo.esAdmin) ||
    hasPermission('asistencia_social:crear');

  if (!puedeCrear) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6, 24px)' }}>
        <Breadcrumbs
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Operaciones' },
            { label: 'Asistencia Social', href: basePath },
            { label: 'Nuevo Evento Social' },
          ]}
        />
        <AccesoDenegadoState
          rolUsuario={usuarioActivo.rol}
          modulo="la Creación de Eventos de Asistencia Social"
          permisoRequerido="asistencia_social:crear"
          mensajePersonalizado="Se requieren privilegios de Encargado o Administrador para registrar casos excepcionales de asistencia social."
          botonVolverHref={basePath}
          botonVolverTexto="Volver a Asistencia Social"
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
          { label: 'Operaciones' },
          { label: 'Asistencia Social', href: basePath },
          { label: 'Nuevo Evento Social' },
        ]}
      />

      {/* Tarjeta de Título Institucional */}
      <PageTitleCard
        title="Nuevo Evento de Asistencia Social"
        badge="Caso Excepcional FIBE"
        description="Registre un caso urgente para levantamiento de Ficha Básica de Emergencia (FIBE) con georreferenciación y clasificación del daño, independiente de un incidente previo."
      />

      {/* Formulario Integral con Mapa */}
      <EventoAsistenciaSocialForm basePath={basePath} />
    </div>
  );
}
