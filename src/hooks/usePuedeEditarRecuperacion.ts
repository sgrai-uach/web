import { useContext } from 'react';
import { SimulatedSessionContext } from '@/context/SimulatedSessionContext';

/**
 * Hook para evaluar si el usuario activo cuenta con el permiso institucional
 * 'recuperacion:editar' o privilegios de Administrador (HU-74).
 * Si se renderiza fuera de un SimulatedSessionProvider (ej. pruebas unitarias aisladas),
 * retorna true como fallback defensivo.
 */
export function usePuedeEditarRecuperacion(): boolean {
  const context = useContext(SimulatedSessionContext);
  if (!context) return true;
  return context.hasPermission('recuperacion:editar') || Boolean(context.usuarioActivo?.esAdmin);
}
