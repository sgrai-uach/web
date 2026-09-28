'use client';

import React, { useState } from 'react';
import Heading from '@/components/ui/Heading';
import EmpleadoBuscador from '@/components/admin/empleados/EmpleadoBuscador';
import EmpleadoFormulario from '@/components/admin/empleados/EmpleadoFormulario';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import PageTitleCard from '@/components/common/PageTitleCard';
import { useToast } from '@/components/ui/Toast';
import type { EmpleadoUsuario } from '@/types/empleados';
import { UserX } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';

export default function AdminEmpleadosPage() {
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<EmpleadoUsuario | null>(null);
  const [versionActualizacion, setVersionActualizacion] = useState(0);
  const { showSuccess } = useToast();

  const handleActualizado = (actualizado: EmpleadoUsuario) => {
    showSuccess(`El funcionario ${actualizado.nombres} ${actualizado.apellidos} fue actualizado con éxito.`);
    setUsuarioSeleccionado(null);
    setVersionActualizacion((v) => v + 1);
  };

  return (
    <div style={{ maxWidth: 'var(--container-max-width, 1400px)', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6, 24px)' }}>
      {/* Breadcrumbs Institucionales */}
      <Breadcrumbs
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Administración' },
          { label: 'Gestión de Personal' },
        ]}
      />

      {/* Tarjeta de Título Institucional */}
      <PageTitleCard
        title="Gestión de Personal"
        description="Búsqueda, auditoría y asignación de roles, delegaciones y especialidades para personal municipal y de terreno."
      />


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
        <EmptyState
          icon={<UserX size={28} />}
          title="Ningún usuario seleccionado"
          description="Utilice el buscador superior para seleccionar a un funcionario por RUT, nombre o correo institucional."
        />
      )}
    </div>
  );
}
