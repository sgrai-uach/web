import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePatrullas } from '../usePatrullas';
import { patrullasService } from '@/services/patrullasService';
import { getSocket } from '@/lib/socket/client';
import type { PatrullaVerificadoraDTO } from '@/types/patrullas';

vi.mock('@/services/patrullasService', () => ({
  DEFAULT_ENCARGADO_ID: '00000000-0000-4000-8000-000000000003',
  patrullasService: {
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

describe('Hook usePatrullas (HU-16: Patrullas en Tiempo Real)', () => {
  const mockPatrullas: PatrullaVerificadoraDTO[] = [
    {
      id: 'p-1',
      nombre: 'Patrulla Rápida Costa-1',
      estado: 'DISPONIBLE',
      delegacion: { id: 'd-1', nombre: 'Costa', codigo: 'DEL_COSTA' },
      lider: { id: 'u-1', nombre: 'Líder Uno', email: 'lider1@valdivia.cl', rut: '11111111-1' },
      integrantes: [],
      misionActiva: null,
      actualizadoEn: '2026-10-21T10:00:00.000Z',
    },
    {
      id: 'p-2',
      nombre: 'Patrulla Centro-Sur',
      estado: 'EN_VERIFICACION',
      delegacion: { id: 'd-2', nombre: 'Sur', codigo: 'DEL_SUR' },
      lider: { id: 'u-2', nombre: 'Líder Dos', email: 'lider2@valdivia.cl', rut: '22222222-2' },
      integrantes: [],
      misionActiva: {
        id: 'm-1',
        codigo: 'MIS-2026-0001',
        titulo: 'Verificación en terreno',
        tipoMision: 'VERIFICACION',
        estado: 'EN_CURSO',
        prioridad: 'ALTA',
        incidenteId: 'inc-1',
      },
      actualizadoEn: '2026-10-21T10:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (getSocket() as unknown as { _clear: () => void })._clear();
  });

  it('debe cargar la dotación inicial de patrullas exitosamente', async () => {
    vi.mocked(patrullasService.listar).mockResolvedValueOnce({
      exito: true,
      data: mockPatrullas,
      meta: { total: 2, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false },
      mensaje: 'OK',
    });

    const { result } = renderHook(() => usePatrullas());

    expect(result.current.cargando).toBe(true);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(result.current.cargando).toBe(false);
    expect(result.current.patrullas).toHaveLength(2);
    expect(result.current.dotacionResumen.total).toBe(2);
    expect(result.current.dotacionResumen.disponibles).toBe(1);
    expect(result.current.dotacionResumen.enMision).toBe(1);
  });

  it('debe manejar error 403 Forbidden y activar esForbidden', async () => {
    vi.mocked(patrullasService.listar).mockResolvedValueOnce({
      exito: false,
      esForbidden: true,
      codigoError: 403,
      data: [],
      meta: { total: 0, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false },
      mensaje: 'No tiene permiso misiones:leer',
    });

    const { result } = renderHook(() => usePatrullas());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(result.current.esForbidden).toBe(true);
    expect(result.current.error).toContain('misiones:leer');
    expect(result.current.patrullas).toEqual([]);
  });

  it('debe actualizar filtros y resetear página a 1', async () => {
    vi.mocked(patrullasService.listar).mockResolvedValue({
      exito: true,
      data: [mockPatrullas[0]],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false },
      mensaje: 'OK',
    });

    const { result } = renderHook(() => usePatrullas());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    act(() => {
      result.current.setFiltros({ estado: 'DISPONIBLE' });
    });

    expect(result.current.filtros.estado).toBe('DISPONIBLE');
    expect(result.current.filtros.page).toBe(1);
    expect(result.current.hayFiltrosActivos).toBe(true);

    act(() => {
      result.current.limpiarFiltros();
    });

    expect(result.current.filtros.estado).toBe('TODOS');
    expect(result.current.hayFiltrosActivos).toBe(false);
  });

  it('debe suscribirse a salas de WebSocket y unirse a "encargado"', async () => {
    const socket = getSocket();
    vi.mocked(patrullasService.listar).mockResolvedValueOnce({
      exito: true,
      data: mockPatrullas,
      meta: { total: 2, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false },
      mensaje: 'OK',
    });

    renderHook(() => usePatrullas());

    expect(socket.emit).toHaveBeenCalledWith('join', 'encargado');
    expect(socket.emit).toHaveBeenCalledWith('unirse', 'sala:encargados');
  });

  it('debe reaccionar a evento patrulla:actualizada modificando el estado in-place', async () => {
    vi.mocked(patrullasService.listar).mockResolvedValueOnce({
      exito: true,
      data: mockPatrullas,
      meta: { total: 2, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false },
      mensaje: 'OK',
    });

    const { result } = renderHook(() => usePatrullas());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(result.current.patrullas[0].estado).toBe('DISPONIBLE');

    // Simular evento WebSocket de patrulla:actualizada
    act(() => {
      (getSocket() as unknown as { _trigger: (ev: string, data: unknown) => void })._trigger(
        'patrulla:actualizada',
        {
          patrullaId: 'p-1',
          nombre: 'Patrulla Rápida Costa-1',
          estado: 'EN_VERIFICACION',
          misionActivaId: 'm-99',
          incidenteId: 'inc-99',
          actualizadoEn: '2026-10-21T11:00:00.000Z',
        }
      );
    });

    expect(result.current.patrullas[0].estado).toBe('EN_VERIFICACION');
    expect(result.current.patrullas[0].misionActiva?.id).toBe('m-99');
    expect(result.current.ultimoEvento).toContain('EN_VERIFICACION');
  });

  it('debe reaccionar a evento mision:asignada asignando la misión a la patrulla correspondiente', async () => {
    vi.mocked(patrullasService.listar).mockResolvedValueOnce({
      exito: true,
      data: mockPatrullas,
      meta: { total: 2, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false },
      mensaje: 'OK',
    });

    const { result } = renderHook(() => usePatrullas());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(result.current.patrullas[0].estado).toBe('DISPONIBLE');

    // Simular evento WebSocket de mision:asignada
    act(() => {
      (getSocket() as unknown as { _trigger: (ev: string, data: unknown) => void })._trigger(
        'mision:asignada',
        {
          misionId: 'm-500',
          codigo: 'MIS-2026-0500',
          tipoMision: 'VERIFICACION',
          patrullaId: 'p-1',
          incidenteId: 'inc-500',
          asignadoEn: '2026-10-21T11:15:00.000Z',
        }
      );
    });

    expect(result.current.patrullas[0].estado).toBe('EN_VERIFICACION');
    expect(result.current.patrullas[0].misionActiva?.codigo).toBe('MIS-2026-0500');
    expect(result.current.ultimoEvento).toContain('MIS-2026-0500');
  });
});
