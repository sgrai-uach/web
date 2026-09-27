'use client';

import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'sgrai_sidebar_collapsed';

function getSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

function getServerSnapshot(): boolean {
  return false;
}

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
  const collapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleCollapse = () => {
    const next = !getSnapshot();
    localStorage.setItem(STORAGE_KEY, String(next));
    window.dispatchEvent(new Event('sgrai_sidebar_change'));
  };

  return { collapsed, toggleCollapse };
}
