import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoRedirectTimer } from '../useAutoRedirectTimer';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('useAutoRedirectTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockPush.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('inicia con los valores por defecto y calcula segundos y porcentaje', () => {
    const { result } = renderHook(() =>
      useAutoRedirectTimer({
        durationMs: 5000,
        tickMs: 100,
        redirectPath: '/admin/recursos',
      })
    );

    expect(result.current.isCancelled).toBe(false);
    expect(result.current.secondsRemaining).toBe(5);
    expect(result.current.progressPercent).toBe(100);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('decrementa el tiempo con cada tick sin disparar redirección antes de llegar a 0', () => {
    const { result } = renderHook(() =>
      useAutoRedirectTimer({
        durationMs: 1000,
        tickMs: 100,
        redirectPath: '/admin/recursos',
      })
    );

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.secondsRemaining).toBe(1);
    expect(result.current.progressPercent).toBe(50);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('redirige automáticamente a través de router.push cuando el tiempo expira', () => {
    renderHook(() =>
      useAutoRedirectTimer({
        durationMs: 1000,
        tickMs: 100,
        redirectPath: '/admin/recursos',
      })
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/admin/recursos');
  });

  it('no redirige si cancel() es invocado antes de expirar', () => {
    const { result } = renderHook(() =>
      useAutoRedirectTimer({
        durationMs: 1000,
        tickMs: 100,
        redirectPath: '/admin/recursos',
      })
    );

    act(() => {
      vi.advanceTimersByTime(500);
      result.current.cancel();
    });

    expect(result.current.isCancelled).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('redirige de inmediato cuando triggerRedirectNow() es invocado', () => {
    const { result } = renderHook(() =>
      useAutoRedirectTimer({
        durationMs: 5000,
        tickMs: 100,
        redirectPath: '/admin/recursos',
      })
    );

    act(() => {
      result.current.triggerRedirectNow();
    });

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/admin/recursos');
  });
});
