import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { SimulatedSessionContext } from '@/context/SimulatedSessionContext';

/**
 * Evalúa si el usuario activo cuenta con el permiso institucional 'asistencia_social:crear'
 * para derivar incidentes resueltos hacia Asistencia Social (DGRD — Ficha FIBE).
 * Si se renderiza fuera de ambos providers (ej. pruebas unitarias aisladas), retorna true como fallback defensivo.
 */
export function usePuedeDerivarAsistenciaSocial(): boolean {
  const auth = useContext(AuthContext);
  const simulated = useContext(SimulatedSessionContext);

  if (auth?.usuario) {
    return auth.tienePermiso('asistencia_social:crear');
  }

  if (simulated) {
    return (
      simulated.hasPermission('asistencia_social:crear') ||
      Boolean(simulated.usuarioActivo?.esAdmin)
    );
  }

  return true;
}
