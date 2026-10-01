import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSidebarState, MANUAL_PREF_KEY, SIDEBAR_STATE_KEY } from '../useSidebarState';

let mockPathname = '/gestion';

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

describe('useSidebarState — Memoria Persistente Global de Estado', () => {
  beforeEach(() => {
    localStorage.clear();
    mockPathname = '/gestion';
  });

  it('debe iniciar colapsada (true) en la página de inicio (/gestion) si no hay preferencia previa', () => {
    mockPathname = '/gestion';
    const { result } = renderHook(() => useSidebarState());

    expect(result.current.collapsed).toBe(true);
  });

  it('debe iniciar expandida (false) al acceder a submódulos si no hay preferencia previa', () => {
    mockPathname = '/gestion/callcenter';
    const { result } = renderHook(() => useSidebarState());

    expect(result.current.collapsed).toBe(false);
  });

  it('debe permitir alternar estado en /gestion y recordar el estado al navegar a cualquier submódulo', () => {
    mockPathname = '/gestion';
    const { result, rerender } = renderHook(() => useSidebarState());

    expect(result.current.collapsed).toBe(true);

    act(() => {
      result.current.toggleCollapse();
    });

    expect(result.current.collapsed).toBe(false);
    expect(localStorage.getItem(SIDEBAR_STATE_KEY)).toBe('expanded');

    // Navega a un submódulo operativo: debe recordar que se expandió
    mockPathname = '/gestion/callcenter';
    rerender();
    expect(result.current.collapsed).toBe(false);

    // Vuelve a /gestion: debe recordar que continúa expandida
    mockPathname = '/gestion';
    rerender();
    expect(result.current.collapsed).toBe(false);
  });

  it('debe recordar la decisión del usuario si colapsa la barra en un submódulo y mantenerla colapsada en /gestion y otros submódulos', () => {
    mockPathname = '/gestion/callcenter';
    const { result, rerender } = renderHook(() => useSidebarState());

    expect(result.current.collapsed).toBe(false);

    // Usuario decide colapsarla en el submódulo
    act(() => {
      result.current.toggleCollapse();
    });

    expect(result.current.collapsed).toBe(true);
    expect(localStorage.getItem(MANUAL_PREF_KEY)).toBe('collapsed');

    // Navega a otro submódulo: debe permanecer colapsada
    mockPathname = '/gestion/centro-incidentes';
    rerender();
    expect(result.current.collapsed).toBe(true);

    // Navega a la página de inicio de gestión: debe permanecer colapsada
    mockPathname = '/gestion';
    rerender();
    expect(result.current.collapsed).toBe(true);
  });

  it('debe expandirse y persistir el estado cuando se modifica desde cualquier módulo', () => {
    localStorage.setItem(SIDEBAR_STATE_KEY, 'collapsed');
    mockPathname = '/gestion/admin/recursos';

    const { result, rerender } = renderHook(() => useSidebarState());
    expect(result.current.collapsed).toBe(true);

    // Usuario decide expandir
    act(() => {
      result.current.toggleCollapse();
    });

    expect(result.current.collapsed).toBe(false);
    expect(localStorage.getItem(SIDEBAR_STATE_KEY)).toBe('expanded');

    // Navega a /gestion: debe mantenerse expandida
    mockPathname = '/gestion';
    rerender();
    expect(result.current.collapsed).toBe(false);
  });
});
