'use client';

import React, { useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import EmpleadoBuscador from '@/components/admin/EmpleadoBuscador';
import EmpleadoFormulario from '@/components/admin/EmpleadoFormulario';
import NotificationBanner from '@/components/common/NotificationBanner';
import EmpleadoBajaModal from '@/components/admin/empleados/EmpleadoBajaModal';
import { useSmartScroll } from '@/hooks/useSmartScroll';
import type { EmpleadoUsuario } from '@/types/empleados';
import type { NotificationState } from '@/types/common';
import { deletePersonal } from '@/services/empleadosService';
import { getErrorMessage } from '@/lib/utils/errorUtils';

export default function AdminEmpleadosPage() {
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<EmpleadoUsuario | null>(null);
  const [versionActualizacion, setVersionActualizacion] = useState(0);

  const [notificacion, setNotificacion] = useState<NotificationState | null>(null);
  const [empleadoAEliminar, setEmpleadoAEliminar] = useState<EmpleadoUsuario | null>(null);
  const [usuarioEliminadoId, setUsuarioEliminadoId] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState(false);

  // Hook reutilizable para desplazamiento inteligente basado en IntersectionObserver
  const { targetRef: formularioRef, scrollToTarget: scrollToFormulario } =
    useSmartScroll<HTMLDivElement>({
      threshold: 0.5,
      block: 'nearest',
      behavior: 'smooth',
    });

  const handleSelectUsuario = (usr: EmpleadoUsuario) => {
    setUsuarioSeleccionado(usr);
    scrollToFormulario();
  };

  const handleActualizado = (actualizado: EmpleadoUsuario) => {
    setNotificacion({
      tipo: 'exito',
      mensaje: `El empleado ${actualizado.nombres} ${actualizado.apellidos} fue actualizado con éxito.`,
    });
    setUsuarioSeleccionado(null);
    setVersionActualizacion((v) => v + 1);
    setTimeout(() => setNotificacion(null), 6000);
  };

  const handleConfirmarBaja = async () => {
    if (!empleadoAEliminar) return;

    setEliminando(true);
    try {
      const targetId = empleadoAEliminar.personal_id || empleadoAEliminar.usuario_id;
      await deletePersonal(targetId);

      setNotificacion({
        tipo: 'exito',
        mensaje: `El funcionario ${empleadoAEliminar.nombres} ${empleadoAEliminar.apellidos} ha sido dado de baja lógicamente del sistema.`,
      });

      setUsuarioEliminadoId(empleadoAEliminar.usuario_id);

      if (usuarioSeleccionado?.usuario_id === empleadoAEliminar.usuario_id) {
        setUsuarioSeleccionado(null);
      }
      setEmpleadoAEliminar(null);
      setVersionActualizacion((v) => v + 1);
      setTimeout(() => setNotificacion(null), 6000);
    } catch (err: unknown) {
      setNotificacion({
        tipo: 'error',
        mensaje: getErrorMessage(err, 'Error al procesar la baja del empleado.'),
      });
      setTimeout(() => setNotificacion(null), 6000);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-light, #ECEFF3)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header Institucional de Administrador */}
      <AdminHeader />

      {/* Contenido Modular */}
      <main style={{ maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '0 1.5rem', flex: 1 }}>
        <NotificationBanner
          notification={notificacion}
          onClose={() => setNotificacion(null)}
        />

        {/* Buscador modular de usuarios */}
        <EmpleadoBuscador
          onSelectUsuario={handleSelectUsuario}
          onEliminarUsuario={(usr) => setEmpleadoAEliminar(usr)}
          usuarioSeleccionadoId={usuarioSeleccionado?.usuario_id}
          usuarioEliminadoId={usuarioEliminadoId}
          versionActualizacion={versionActualizacion}
        />

        {/* Formulario modular condicional */}
        <div ref={formularioRef}>
          {usuarioSeleccionado ? (
            <EmpleadoFormulario
              usuario={usuarioSeleccionado}
              onEmpleadoActualizado={handleActualizado}
              onCancelar={() => setUsuarioSeleccionado(null)}
              onDarDeBaja={() => setEmpleadoAEliminar(usuarioSeleccionado)}
            />
          ) : (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px dashed #BAC7D5',
                padding: '3.5rem 1.5rem',
                textAlign: 'center',
                marginBottom: '2rem',
              }}
            >
              <div
                style={{
                  fontSize: '1.0625rem',
                  fontWeight: 700,
                  color: 'var(--color-charcoal, #3B3F45)',
                  marginBottom: '0.35rem',
                }}
              >
                Ningún usuario seleccionado
              </div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                Haga clic en cualquiera de los funcionarios del listado superior para editar su ficha técnica.
              </div>
            </div>
          )}
        </div>

        {/* Modal de confirmación de baja lógica */}
        <EmpleadoBajaModal
          empleado={empleadoAEliminar}
          eliminando={eliminando}
          onConfirmar={handleConfirmarBaja}
          onCancelar={() => setEmpleadoAEliminar(null)}
        />
      </main>

      {/* Footer Institucional */}
      <footer
        style={{
          backgroundColor: 'var(--color-charcoal-dark, #24272B)',
          color: 'var(--color-text-light, #FFFFFF)',
          padding: '1.25rem 2rem',
          textAlign: 'center',
          fontSize: '0.8125rem',
          marginTop: 'auto',
        }}
      >
        Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) &bull; Municipalidad de Valdivia &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
