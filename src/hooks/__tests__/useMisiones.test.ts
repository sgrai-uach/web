import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMisiones } from '../useMisiones';
import { misionesService } from '@/services/misionesService';
import { getSocket } from '@/lib/socket/client';

vi.mock('@/services/misionesService', () => ({
  misionesService: {
    listar: vi.fn(),
  },
}));

vi.mock('@/lib/socket/client', () => {
  const listeners: Record<string, ((data: unknown) => void)[]> = {};
  const mockSocket = {
    connected: true,
    connect: vi.fn(),
    emit: vi.fn(),
    on: vi.fn((event: string, cb: (data: unknown) => void) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(cb);
    }),
    off: vi.fn((event: string, cb: (data: unknown) => void) => {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter((c) => c !== cb);
    }),
    _trigger: (event: string, data: unknown) => {
      if (listeners[event]) {
        listeners[event].forEach((cb) => cb(data));
      }
    },
    _clear: () => {
      Object.keys(listeners).forEach((k) => delete listeners[k]);
    },
  };
  return {
    getSocket: () => mockSocket,
  };
});

describe('useMisiones hook (H68)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getSocket() as unknown as { _clear: () => void })._clear();
  });

  it('actualiza estado a COMPLETADA y fechaCierre en vivo al recibir mision:actualizada', async () => {
    vi.mocked(misionesService.listar).mockResolvedValue({
      exito: true,
      data: [
        {
          id: 'mis-cuad-68',
          codigo: 'MIS-2026-0068',
          titulo: 'Atención de cuadrilla',
          tipoMision: 'ATENCION_CUADRILLA',
          estado: 'EN_CURSO',
          prioridad: 'ALTA',
          creadoEn: '2026-11-18T10:00:00Z',
        },
      ],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrev: false },
      mensaje: 'OK',
    });

    const { result } = renderHook(() => useMisiones());

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    expect(result.current.misiones[0].estado).toBe('EN_CURSO');

    const socket = getSocket() as unknown as { _trigger: (ev: string, data: unknown) => void };
    act(() => {
      socket._trigger('mision:actualizada', {
        id: 'mis-cuad-68',
        estado: 'COMPLETADA',
        fechaCierre: '2026-11-18T18:30:00Z',
      });
    });

    expect(result.current.misiones[0].estado).toBe('COMPLETADA');
    expect(result.current.misiones[0].fechaCierre).toBe('2026-11-18T18:30:00Z');
  });
});
