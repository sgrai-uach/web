'use client';

import { useState, useCallback, useContext } from 'react';
import type { EmpleadoUsuario } from '@/types/empleados';
import { empleadosService } from '@/services/empleadosService';
import { toUserFriendlyErrorMessage } from '@/lib/utils/errorUtils';
import { useToast } from '@/components/ui/Toast';
import { SimulatedSessionContext } from '@/context/SimulatedSessionContext';
import { AuthContext } from '@/context/AuthContext';

/**
 * Custom Hook para orquestar la vista de administración de empleados.
 * Conforme a docs/ARCHITECTURE.md (Separación de Responsabilidades y Vistas Delgadas).
 */
export function useAdminEmpleados() {
  const auth = useContext(AuthContext);
  const session = useContext(SimulatedSessionContext);
  const usuarioActivoId = auth?.usuario?.id || session?.usuarioActivo?.id;
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<EmpleadoUsuario | null>(null);
  const [versionActualizacion, setVersionActualizacion] = useState(0);
  const [empleadoAEliminar, setEmpleadoAEliminar] = useState<EmpleadoUsuario | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const { showSuccess, showError } = useToast();

  const formularioRef = { current: null };

  const seleccionarUsuario = useCallback((usr: EmpleadoUsuario) => {
    setUsuarioSeleccionado(usr);
  }, []);

  const cancelarSeleccion = useCallback(() => {
    setUsuarioSeleccionado(null);
  }, []);

  const solicitarBaja = useCallback((usr: EmpleadoUsuario) => {
    if (!usr.usuario_activo) return;
    setEmpleadoAEliminar(usr);
  }, []);

  const cancelarBaja = useCallback(() => {
    setEmpleadoAEliminar(null);
  }, []);

  const confirmarActualizacion = useCallback(
    (actualizado: EmpleadoUsuario) => {
      showSuccess(`El funcionario ${actualizado.nombres} ${actualizado.apellidos} fue actualizado con éxito.`);
      setUsuarioSeleccionado(null);
      setVersionActualizacion((v) => v + 1);
    },
    [showSuccess]
  );

  const confirmarBaja = useCallback(async () => {
    if (!empleadoAEliminar) return;

    setEliminando(true);
    try {
      const targetId = empleadoAEliminar.personal_id || empleadoAEliminar.usuario_id;
      await empleadosService.deleteEmpleado(targetId, usuarioActivoId);

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
  }, [empleadoAEliminar, usuarioSeleccionado, usuarioActivoId, showSuccess, showError]);

  return {
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
  };
}
