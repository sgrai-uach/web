'use client';

import React, { useState, useEffect } from 'react';
import EmpleadoBuscador from '@/components/admin/empleados/EmpleadoBuscador';
import EmpleadoFormulario from '@/components/admin/empleados/EmpleadoFormulario';
import EmpleadoBajaModal from '@/components/admin/empleados/EmpleadoBajaModal';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import PageTitleCard from '@/components/common/PageTitleCard';
import { useToast } from '@/components/ui/Toast';
import { useSmartScroll } from '@/hooks/useSmartScroll';
import type { EmpleadoUsuario } from '@/types/empleados';
import { empleadosService } from '@/services/empleadosService';
import { toUserFriendlyErrorMessage } from '@/lib/utils/errorUtils';
import { UserX } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';

export default function AdminEmpleadosPage() {
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<EmpleadoUsuario | null>(null);
  const [versionActualizacion, setVersionActualizacion] = useState(0);
  const [empleadoAEliminar, setEmpleadoAEliminar] = useState<EmpleadoUsuario | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const { showSuccess, showError } = useToast();

  const { targetRef: formularioRef, scrollToTarget: scrollToFormulario } =
    useSmartScroll<HTMLDivElement>({
      threshold: 0.5,
      block: 'nearest',
      behavior: 'smooth',
    });

  // Desplazamiento suave al montar el formulario al seleccionar un usuario
  useEffect(() => {
    if (usuarioSeleccionado) {
      const frameId = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToFormulario(true);
        });
      });
      return () => cancelAnimationFrame(frameId);
    }
  }, [usuarioSeleccionado, scrollToFormulario]);

  const handleActualizado = (actualizado: EmpleadoUsuario) => {
    showSuccess(`El funcionario ${actualizado.nombres} ${actualizado.apellidos} fue actualizado con éxito.`);
    setUsuarioSeleccionado(null);
    setVersionActualizacion((v) => v + 1);
  };

  const handleConfirmarBaja = async () => {
    if (!empleadoAEliminar) return;

    setEliminando(true);
    try {
      const targetId = empleadoAEliminar.personal_id || empleadoAEliminar.usuario_id;
      await empleadosService.deleteEmpleado(targetId);

      showSuccess(
        `El funcionario ${empleadoAEliminar.nombres} ${empleadoAEliminar.apellidos} ha sido dado de baja lógicamente del sistema.`
      );

      if (usuarioSeleccionado?.usuario_id === empleadoAEliminar.usuario_id) {
        setUsuarioSeleccionado(null);
      }
      setEmpleadoAEliminar(null);
      setVersionActualizacion((v) => v + 1);
    } catch (err: unknown) {
      showError(toUserFriendlyErrorMessage(err));
    } finally {
      setEliminando(false);
    }
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
      <div ref={formularioRef}>
        {usuarioSeleccionado ? (
          <EmpleadoFormulario
            key={usuarioSeleccionado.usuario_id}
            usuario={usuarioSeleccionado}
            onEmpleadoActualizado={handleActualizado}
            onCancelar={() => setUsuarioSeleccionado(null)}
            onDarDeBaja={() => setEmpleadoAEliminar(usuarioSeleccionado)}
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
        onConfirmar={handleConfirmarBaja}
        onCancelar={() => setEmpleadoAEliminar(null)}
      />
    </div>
  );
}
