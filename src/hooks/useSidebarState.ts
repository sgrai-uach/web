'use client';

import { useSyncExternalStore, useCallback } from 'react';
import { usePathname } from 'next/navigation';

export const SIDEBAR_STATE_KEY = 'sgrai_sidebar_manual_preference';
export const MANUAL_PREF_KEY = SIDEBAR_STATE_KEY;
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

    // 1. Si existe preferencia manual guardada en cualquier módulo, respetarla siempre
    const manualPref = localStorage.getItem(SIDEBAR_STATE_KEY);
    if (manualPref === 'collapsed') {
      return true;
    }
    if (manualPref === 'expanded') {
      return false;
    }

    // 2. Si aún no hay preferencia guardada:
    // En la página de inicio del portal de gestión (/gestion), la barra inicia colapsada
    // En submódulos operativos, inicia expandida por defecto
    return isGestionHome;
  }, [isGestionHome]);

  const getServerSnapshot = useCallback((): boolean => {
    return isGestionHome;
  }, [isGestionHome]);

  const collapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleCollapse = useCallback(() => {
    if (typeof window === 'undefined') return;

    const next = !collapsed;
    // Guardar siempre el último estado en localStorage sin importar en qué módulo se haya modificado
    localStorage.setItem(SIDEBAR_STATE_KEY, next ? 'collapsed' : 'expanded');

    window.dispatchEvent(new Event('sgrai_sidebar_change'));
  }, [collapsed]);

  return { collapsed, toggleCollapse };
}
