import { useContext } from 'react';
import { SimulatedSessionContext } from '@/context/SimulatedSessionContext';
import { AuthContext } from '@/context/AuthContext';

function useTieneAlgunPermiso(permisos: string[]): boolean {
  const simulated = useContext(SimulatedSessionContext);
  const auth = useContext(AuthContext);

  if (auth) {
    if (auth.cargando) return false;
    if (auth.estaAutenticado) {
      return permisos.some((p) => auth.tienePermiso(p));
    }
  }

  if (simulated) {
    if (simulated.usuarioActivo?.esAdmin) return true;
    return permisos.some((p) => simulated.hasPermission(p));
  }

  return false;
}

/**
 * Evalúa si el usuario activo tiene acceso al tablero Kanban / mapa de incidentes.
 */
export function usePuedeVerKanban(): boolean {
  return useTieneAlgunPermiso(['incidentes:kanban', 'misiones:asignar']);
}

/**
 * Evalúa si el usuario activo cuenta con permiso para consultar operativos de recuperación (HU-73).
 */
export function usePuedeLeerRecuperacion(): boolean {
  return useTieneAlgunPermiso(['recuperacion:leer']);
}
