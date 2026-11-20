import { useContext } from 'react';
import { SimulatedSessionContext } from '@/context/SimulatedSessionContext';

/**
 * Hook para evaluar si el usuario activo cuenta con el permiso institucional
 * 'recuperacion:cerrar' o privilegios de Administrador (HU-75).
 * Si se renderiza fuera de un SimulatedSessionProvider (ej. pruebas unitarias aisladas),
 * retorna true como fallback defensivo.
 */
export function usePuedeCerrarRecuperacion(): boolean {
  const context = useContext(SimulatedSessionContext);
  if (!context) return true;
  return context.hasPermission('recuperacion:cerrar') || Boolean(context.usuarioActivo?.esAdmin);
}
