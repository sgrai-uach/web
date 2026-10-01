import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSidebarState, MANUAL_PREF_KEY, HOME_OVERRIDE_KEY } from '../useSidebarState';

let mockPathname = '/gestion';

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

describe('useSidebarState — Memoria de Estado y Colapso por Portal', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    mockPathname = '/gestion';
  });

  it('debe iniciar colapsada (true) en la página de inicio del portal de gestión (/gestion)', () => {
    mockPathname = '/gestion';
    const { result } = renderHook(() => useSidebarState());

    expect(result.current.collapsed).toBe(true);
  });

  it('debe permitir alternar estado en /gestion y recordar temporalmente en la sesión', () => {
    mockPathname = '/gestion';
    const { result } = renderHook(() => useSidebarState());

    expect(result.current.collapsed).toBe(true);

    act(() => {
      result.current.toggleCollapse();
    });

    expect(result.current.collapsed).toBe(false);
    expect(sessionStorage.getItem(HOME_OVERRIDE_KEY)).toBe('false');
  });

  it('debe iniciar expandida (false) al acceder a submódulos si el usuario no la ha colapsado a propósito', () => {
    mockPathname = '/gestion/callcenter';
    const { result } = renderHook(() => useSidebarState());

    expect(result.current.collapsed).toBe(false);
  });

  it('debe recordar la decisión deliberada del usuario si decide colapsarla en un submódulo', () => {
    mockPathname = '/gestion/callcenter';
    const { result, rerender } = renderHook(() => useSidebarState());

    expect(result.current.collapsed).toBe(false);

    // Usuario decide colapsarla a propósito
    act(() => {
      result.current.toggleCollapse();
    });

    expect(result.current.collapsed).toBe(true);
    expect(localStorage.getItem(MANUAL_PREF_KEY)).toBe('collapsed');

    // Navega a otro submódulo: la decisión debe recordarse y NO volver a expandirse automáticamente
    mockPathname = '/gestion/centro-incidentes';
    rerender();

    expect(result.current.collapsed).toBe(true);
  });

  it('debe expandirse y guardar preferencia si el usuario decide expandirla nuevamente', () => {
    localStorage.setItem(MANUAL_PREF_KEY, 'collapsed');
    mockPathname = '/gestion/admin/recursos';

    const { result } = renderHook(() => useSidebarState());
    expect(result.current.collapsed).toBe(true);

    // Usuario decide expandir
    act(() => {
      result.current.toggleCollapse();
    });

    expect(result.current.collapsed).toBe(false);
    expect(localStorage.getItem(MANUAL_PREF_KEY)).toBe('expanded');
  });
});
