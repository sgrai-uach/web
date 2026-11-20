import { useContext } from 'react';
import { SimulatedSessionContext } from '@/context/SimulatedSessionContext';
import { AuthContext } from '@/context/AuthContext';

/**
 * Hook para evaluar si el usuario activo cuenta con el permiso institucional 'misiones:asignar'
 * o privilegios de Administrador. Sigue una política estrictamente Fail-Closed:
 * ante estados de carga o falta de permisos confirmados, bloquea la acción retornando false.
 */
export function usePuedeAsignarMision(): boolean {
  const simulated = useContext(SimulatedSessionContext);
  const auth = useContext(AuthContext);

  if (auth) {
    if (auth.cargando) return false;
    if (auth.estaAutenticado) {
      return auth.tienePermiso('misiones:asignar');
    }
  }

  if (simulated) {
    return simulated.hasPermission('misiones:asignar') || Boolean(simulated.usuarioActivo?.esAdmin);
  }

  return false;
}
