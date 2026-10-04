'use client';

import React, { useContext, useState } from 'react';
import EmpleadoBuscador from '@/components/admin/empleados/EmpleadoBuscador';
import EmpleadoFormulario from '@/components/admin/empleados/EmpleadoFormulario';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import PageTitleCard from '@/components/common/PageTitleCard';
import { useToast } from '@/components/ui/Toast';
import type { EmpleadoUsuario } from '@/types/empleados';
import { UserX, UserPlus } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';
import Button from '@/components/ui/Button';
import RegistrarEmpleadoModal from '@/components/admin/empleados/RegistrarEmpleadoModal';
import { AuthContext } from '@/context/AuthContext';
import { SimulatedSessionContext } from '@/context/SimulatedSessionContext';
import AccesoDenegadoState from '@/components/common/AccesoDenegadoState';

export default function AdminEmpleadosPage() {
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<EmpleadoUsuario | null>(null);
  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false);
  const [versionActualizacion, setVersionActualizacion] = useState(0);
  const { showSuccess } = useToast();

  const auth = useContext(AuthContext);
  const session = useContext(SimulatedSessionContext);

  // Control de acceso granular RBAC: acción de registro depende de personal:crear o personal:gestionar
  const puedeRegistrar =
    auth?.usuario
      ? auth.tieneAlgunPermiso(['personal:crear', 'personal:gestionar']) || auth.usuario.rolCodigo === 'ADMIN'
      : session?.usuarioActivo
      ? session.hasAnyPermission(['personal:crear', 'personal:gestionar']) || session.usuarioActivo.esAdmin
      : true;

  // Consulta del módulo depende de personal:leer, personal:gestionar o personal:crear
  const puedeVerDirectorio =
    auth?.usuario
      ? auth.tieneAlgunPermiso(['personal:leer', 'personal:gestionar', 'personal:crear']) || auth.usuario.rolCodigo === 'ADMIN'
      : session?.usuarioActivo
      ? session.hasAnyPermission(['personal:leer', 'personal:gestionar', 'personal:crear']) || session.usuarioActivo.esAdmin
      : true;

  const handleActualizado = (actualizado: EmpleadoUsuario) => {
    showSuccess(`El funcionario ${actualizado.nombres} ${actualizado.apellidos} fue actualizado con éxito.`);
    setUsuarioSeleccionado(null);
    setVersionActualizacion((v) => v + 1);
  };

  const handleRegistrado = (nuevo: EmpleadoUsuario) => {
    showSuccess(`Funcionario ${nuevo.nombres} ${nuevo.apellidos} registrado exitosamente.`);
    setModalRegistroAbierto(false);
    setVersionActualizacion((v) => v + 1);
  };

  // Bloqueo de acceso si el usuario no tiene permisos para consultar el módulo
  if (!puedeVerDirectorio) {
    const rolActual = auth?.usuario?.rolNombre || session?.usuarioActivo?.rol || 'Usuario';
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6, 24px)' }}>
        <Breadcrumbs
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Administración' },
            { label: 'Gestión de Personal' },
          ]}
        />
        <AccesoDenegadoState
          rolUsuario={rolActual}
          modulo="Gestión de Personal"
          permisoRequerido="personal:leer"
          mensajePersonalizado="No dispone de los privilegios requeridos para consultar el directorio de personal del SGRAI. Solicite a un Administrador la asignación del permiso correspondiente."
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
          { label: 'Gestión de Personal' },
        ]}
      />

      {/* Tarjeta de Título Institucional */}
      <PageTitleCard
        title="Gestión de Personal"
        description="Búsqueda, auditoría y asignación de roles, delegaciones y especialidades para personal municipal y de terreno."
        actionSlot={
          puedeRegistrar ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => setModalRegistroAbierto(true)}
              icon={<UserPlus size={16} />}
            >
              + Nuevo Funcionario
            </Button>
          ) : undefined
        }
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
          description="Utilice el buscador superior para seleccionar a un funcionario por RUT, nombre o correo."
        />
      )}

      {/* Modal Institucional de Registro de Nuevo Funcionario */}
      <RegistrarEmpleadoModal
        isOpen={modalRegistroAbierto}
        onClose={() => setModalRegistroAbierto(false)}
        onEmpleadoRegistrado={handleRegistrado}
      />
    </div>
  );
}
