import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useEventosAsistenciaSocial } from '../useEventosAsistenciaSocial';
import { getSocket } from '@/lib/socket/client';
import * as asistenciaSocialService from '@/services/asistenciaSocialService';
import type { EventoAsistenciaSocialItem } from '@/types/asistenciaSocial';

vi.mock('@/lib/socket/client', () => {
  const listeners: Record<string, ((...args: unknown[]) => void)[]> = {};

  const mockSocket = {
    connected: false,
    connect: vi.fn(() => {
      mockSocket.connected = true;
    }),
    emit: vi.fn(),
    on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(handler);
      return mockSocket;
    }),
    off: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter((h) => h !== handler);
      }
      return mockSocket;
    }),
    _trigger: (event: string, payload?: unknown) => {
      if (listeners[event]) {
        listeners[event].forEach((cb) => cb(payload));
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

describe('useEventosAsistenciaSocial', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const socket = getSocket() as unknown as { _clear: () => void };
    socket._clear();
  });

  const mockItem: EventoAsistenciaSocialItem = {
    id: '70000000-0000-4000-8000-000000000001',
    codigo: 'AS-2026-0001',
    descripcion: 'Anegamiento patio',
    tipoAfectacion: 'VIVIENDA_ANEGADA',
    personasAfectadas: 3,
    familiasAfectadas: 1,
    direccionTexto: 'Calle Los Alerces 1420',
    latitud: -39.8234,
    longitud: -73.2189,
    prioridad: 'ALTA',
    estado: 'PENDIENTE',
    contactoNombre: 'María',
    contactoTelefono: null,
    contactoRut: null,
    delegacionId: null,
    delegacionNombre: null,
    incidenteId: null,
    asistenteSocialId: null,
    asistenteSocialNombre: null,
    creadoPor: { id: 'user-1', nombre: 'Encargado' },
    creadoEn: new Date().toISOString(),
    actualizadoEn: new Date().toISOString(),
  };

  it('debe cargar la lista de eventos inicialmente', async () => {
    vi.spyOn(asistenciaSocialService, 'obtenerEventosAsistenciaSocial').mockResolvedValueOnce({
      data: [mockItem],
      total: 1,
      pagina: 1,
      limite: 10,
      totalPaginas: 1,
    });

    const { result } = renderHook(() =>
      useEventosAsistenciaSocial({ pagina: 1, limite: 10, estado: 'PENDIENTE' })
    );

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    expect(result.current.eventos).toHaveLength(1);
    expect(result.current.eventos[0].codigo).toBe('AS-2026-0001');
  });

  it('debe agregar reactivamente un nuevo evento cuando se recibe por Socket.io', async () => {
    vi.spyOn(asistenciaSocialService, 'obtenerEventosAsistenciaSocial').mockResolvedValueOnce({
      data: [mockItem],
      total: 1,
      pagina: 1,
      limite: 10,
      totalPaginas: 1,
    });

    const { result } = renderHook(() =>
      useEventosAsistenciaSocial({ pagina: 1, limite: 10, estado: 'PENDIENTE' })
    );

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    const socket = getSocket() as unknown as {
      _trigger: (event: string, payload?: unknown) => void;
    };

    const nuevoEvento: EventoAsistenciaSocialItem = {
      ...mockItem,
      id: '70000000-0000-4000-8000-000000000002',
      codigo: 'AS-2026-0002',
      descripcion: 'Derrumbe ladera menor',
    };

    act(() => {
      socket._trigger('asistencia_social:creada', nuevoEvento);
    });

    expect(result.current.eventos).toHaveLength(2);
    expect(result.current.eventos[0].codigo).toBe('AS-2026-0002');
  });
});
