'use client';

import React, { useState } from 'react';
import Heading from '@/components/ui/Heading';
import EmpleadoBuscador from '@/components/admin/empleados/EmpleadoBuscador';
import EmpleadoFormulario from '@/components/admin/empleados/EmpleadoFormulario';
import NotificationBanner from '@/components/common/NotificationBanner';
import type { EmpleadoUsuario } from '@/types/empleados';
import { Users, UserX } from 'lucide-react';

export default function AdminEmpleadosPage() {
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<EmpleadoUsuario | null>(null);
  const [versionActualizacion, setVersionActualizacion] = useState(0);
  const [notificacion, setNotificacion] = useState<string | null>(null);

  const handleActualizado = (actualizado: EmpleadoUsuario) => {
    setNotificacion(`El funcionario ${actualizado.nombres} ${actualizado.apellidos} fue actualizado con éxito.`);
    setUsuarioSeleccionado(null);
    setVersionActualizacion((v) => v + 1);
    setTimeout(() => setNotificacion(null), 6000);
  };

  return (
    <div style={{ maxWidth: 'var(--container-max-width, 1400px)', width: '100%', margin: '0 auto' }}>
      {/* Título y descripción institucional */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <Users size={28} color="var(--color-primary-teal, #1B6F7D)" />
          <Heading as="h1" variant="h1" color="teal-dark" noMargin>
            Gestión de Personal y Cuentas de Usuario
          </Heading>
        </div>
        <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--color-text-muted, #5F676E)' }}>
          Búsqueda, auditoría y asignación de roles, delegaciones y especialidades para personal municipal y de terreno.
        </p>
      </div>

      {notificacion && (
        <div style={{ marginBottom: '1.25rem' }}>
          <NotificationBanner
            type="success"
            message={notificacion}
            onClose={() => setNotificacion(null)}
          />
        </div>
      )}

      {/* Buscador modular de usuarios */}
      <EmpleadoBuscador
        onSelectUsuario={(usr) => setUsuarioSeleccionado(usr)}
        usuarioSeleccionadoId={usuarioSeleccionado?.usuario_id}
        versionActualizacion={versionActualizacion}
      />

      {/* Formulario modular condicional */}
      {usuarioSeleccionado ? (
        <EmpleadoFormulario
          key={usuarioSeleccionado.usuario_id}
          usuario={usuarioSeleccionado}
          onEmpleadoActualizado={handleActualizado}
          onCancelar={() => setUsuarioSeleccionado(null)}
        />
      ) : (
        <div
          style={{
            backgroundColor: 'var(--color-white, #FFFFFF)',
            border: '1px dashed var(--border-color-neutral, #DFE3E8)',
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'inline-flex', marginBottom: '0.75rem', color: 'var(--color-text-muted, #5F676E)' }}>
            <UserX size={40} />
          </div>
          <Heading as="h2" variant="h4" color="charcoal" style={{ marginBottom: '0.35rem' }}>
            Ningún usuario seleccionado
          </Heading>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted, #5F676E)' }}>
            Utilice el buscador superior para seleccionar a un funcionario por RUT, nombre o correo institucional.
          </div>
        </div>
      )}
    </div>
  );
}
