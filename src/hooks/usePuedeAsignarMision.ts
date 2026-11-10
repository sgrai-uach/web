import { useContext } from 'react';
import { SimulatedSessionContext } from '@/context/SimulatedSessionContext';

/**
 * Hook para evaluar si el usuario activo cuenta con el permiso institucional 'misiones:asignar'
 * o privilegios de Administrador. Si se renderiza fuera de un SimulatedSessionProvider
 * (por ejemplo en pruebas unitarias aisladas), retorna true como fallback defensivo.
 */
export function usePuedeAsignarMision(): boolean {
  const context = useContext(SimulatedSessionContext);
  if (!context) return true;
  return context.hasPermission('misiones:asignar') || Boolean(context.usuarioActivo?.esAdmin);
}

