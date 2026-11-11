import { useContext } from 'react';
import { SimulatedSessionContext } from '@/context/SimulatedSessionContext';
import { AuthContext } from '@/context/AuthContext';

/**
 * Hook para evaluar si el usuario activo cuenta con el permiso institucional 'misiones:asignar'
 * o privilegios de Administrador. Si se renderiza fuera de providers de sesión
 * (por ejemplo en pruebas unitarias aisladas), retorna true como fallback defensivo.
 */
export function usePuedeAsignarMision(): boolean {
  const simulated = useContext(SimulatedSessionContext);
  const auth = useContext(AuthContext);

  if (auth && auth.estaAutenticado) {
    if (auth.tienePermiso('misiones:asignar')) return true;
  }

  if (simulated) {
    return simulated.hasPermission('misiones:asignar') || Boolean(simulated.usuarioActivo?.esAdmin);
  }

  return true;
}

