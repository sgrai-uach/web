'use client';

import { useContext } from 'react';
import { SimulatedSessionContext } from '@/context/SimulatedSessionContext';

/**
 * Hook para evaluar si el usuario activo cuenta con el permiso institucional
 * `eventos_atp:vincular` o privilegios de Administrador (H60).
 */
export function usePuedeVincularEventoAtp(): boolean {
  const context = useContext(SimulatedSessionContext);
  if (!context) return true;
  return (
    context.hasPermission('eventos_atp:vincular') ||
    Boolean(context.usuarioActivo?.esAdmin)
  );
}
