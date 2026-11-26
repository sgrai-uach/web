import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { SimulatedSessionContext } from '@/context/SimulatedSessionContext';

/**
 * Hook para evaluar si el usuario activo cuenta con el permiso institucional
 * 'recuperacion:editar' o privilegios de Administrador (HU-74).
 * Política estrictamente Fail-Closed: ante ausencia de sesión o carga en curso, retorna false.
 */
export function usePuedeEditarRecuperacion(): boolean {
  const auth = useContext(AuthContext);
  const simulated = useContext(SimulatedSessionContext);

  if (auth) {
    if (auth.cargando) return false;
    if (auth.estaAutenticado && auth.usuario) {
      return (
        auth.tienePermiso('recuperacion:editar') ||
        auth.usuario.rolCodigo === 'ADMIN'
      );
    }
  }

  if (simulated?.usuarioActivo) {
    return (
      simulated.hasPermission('recuperacion:editar') ||
      Boolean(simulated.usuarioActivo.esAdmin)
    );
  }

  return false;
}
