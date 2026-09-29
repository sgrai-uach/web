'use client';

import React from 'react';
import EmpleadoBuscador from '@/components/admin/empleados/EmpleadoBuscador';
import EmpleadoFormulario from '@/components/admin/empleados/EmpleadoFormulario';
import EmpleadoBajaModal from '@/components/admin/empleados/EmpleadoBajaModal';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import PageTitleCard from '@/components/common/PageTitleCard';
import EmptyState from '@/components/common/EmptyState';
import { UserX } from 'lucide-react';
import { useAdminEmpleados } from '@/hooks/useAdminEmpleados';

/**
 * Vista de Gestión de Personal (Administración).
 * Conforme a docs/ARCHITECTURE.md: Vista delgada orquestadora sin llamadas directas a APIs.
 */
export default function AdminEmpleadosPage() {
  const {
    usuarioSeleccionado,
    versionActualizacion,
    empleadoAEliminar,
    eliminando,
    formularioRef,
    seleccionarUsuario,
    cancelarSeleccion,
    solicitarBaja,
    cancelarBaja,
    confirmarBaja,
    confirmarActualizacion,
  } = useAdminEmpleados();

  return (
    <div
      style={{
        maxWidth: 'var(--container-max-width, 1400px)',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6, 24px)',
      }}
    >
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
        onSelectUsuario={seleccionarUsuario}
        usuarioSeleccionadoId={usuarioSeleccionado?.usuario_id}
        versionActualizacion={versionActualizacion}
      />

      {/* Formulario modular condicional */}
      <div ref={formularioRef}>
        {usuarioSeleccionado ? (
          <EmpleadoFormulario
            key={usuarioSeleccionado.usuario_id}
            usuario={usuarioSeleccionado}
            onEmpleadoActualizado={confirmarActualizacion}
            onCancelar={cancelarSeleccion}
            onDarDeBaja={() => solicitarBaja(usuarioSeleccionado)}
          />
        ) : (
          <EmptyState
            icon={<UserX size={28} />}
            title="Ningún usuario seleccionado"
            description="Utilice el buscador superior para seleccionar a un funcionario por RUT, nombre o correo institucional."
          />
        )}
      </div>

      {/* Modal de confirmación de baja lógica */}
      <EmpleadoBajaModal
        empleado={empleadoAEliminar}
        eliminando={eliminando}
        onConfirmar={confirmarBaja}
        onCancelar={cancelarBaja}
      />
    </div>
  );
}
