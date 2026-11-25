'use client';

import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { SimulatedSessionContext } from '@/context/SimulatedSessionContext';

/**
 * Hook para evaluar si el usuario activo puede registrar un Evento de Alerta
 * Temprana Preventiva (H61).
 *
 * Aplica política Fail-Closed: mientras la sesión o los permisos no estén
 * resueltos, o cuando no existe contexto de sesión, el acceso se deniega.
 * Se admiten tanto la sesión real (`AuthContext`) como la sesión simulada
 * (`SimulatedSessionContext`) de los despliegues de demostración.
 */
export function usePuedeCrearEventoAtp(): boolean {
  const auth = useContext(AuthContext);
  const session = useContext(SimulatedSessionContext);

  if (!session?.isMounted || auth?.cargando || session?.cargandoPermisos) {
    return false;
  }

  if (auth?.usuario) {
    return (
      auth.usuario.rolCodigo === 'ADMIN' ||
      auth.tienePermiso('eventos_atp:crear')
    );
  }

  return Boolean(
    session?.usuarioActivo &&
      (session.usuarioActivo.rol === 'Administrador' ||
        Boolean(session.usuarioActivo.esAdmin) ||
        session.hasPermission('eventos_atp:crear'))
  );
}
