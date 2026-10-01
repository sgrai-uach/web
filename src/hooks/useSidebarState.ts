'use client';

import { useSyncExternalStore, useCallback } from 'react';
import { usePathname } from 'next/navigation';

export const MANUAL_PREF_KEY = 'sgrai_sidebar_manual_preference';
export const HOME_OVERRIDE_KEY = 'sgrai_sidebar_home_override';

function subscribe(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('sgrai_sidebar_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('sgrai_sidebar_change', callback);
  };
}

export function useSidebarState() {
  const pathname = usePathname();
  const isGestionHome = pathname === '/gestion' || pathname === '/gestion/';

  const getSnapshot = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;

    // 1. En la página de inicio del portal de gestión (/gestion), la barra inicia colapsada
    if (isGestionHome) {
      const homeOverride = sessionStorage.getItem(HOME_OVERRIDE_KEY);
      if (homeOverride !== null) {
        return homeOverride === 'true';
      }
      return true; // Inicialmente colapsada en el home del portal de gestión
    }

    // 2. En submódulos operativos: verificar si el usuario la colapsó a propósito previamente
    const manualPref = localStorage.getItem(MANUAL_PREF_KEY);
    if (manualPref === 'collapsed') {
      return true; // Decisión deliberada de colapsar recordada: no volver a expandir automáticamente
    }

    // 3. Por defecto en submódulos, la barra lateral se muestra expandida
    return false;
  }, [isGestionHome]);

  const getServerSnapshot = useCallback((): boolean => {
    return isGestionHome;
  }, [isGestionHome]);

  const collapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleCollapse = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (isGestionHome) {
      const next = !collapsed;
      sessionStorage.setItem(HOME_OVERRIDE_KEY, String(next));
    } else {
      const next = !collapsed;
      // Guardar la preferencia expresa del operador: 'collapsed' o 'expanded'
      localStorage.setItem(MANUAL_PREF_KEY, next ? 'collapsed' : 'expanded');
    }

    window.dispatchEvent(new Event('sgrai_sidebar_change'));
  }, [collapsed, isGestionHome]);

  return { collapsed, toggleCollapse };
}
