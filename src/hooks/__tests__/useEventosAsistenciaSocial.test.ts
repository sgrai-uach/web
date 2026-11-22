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

  it('debe actualizar reactivamente el estado a ASIGNADO cuando recibe asistencia_social:actualizada por Socket.io', async () => {
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

    const eventoActualizado: EventoAsistenciaSocialItem = {
      ...mockItem,
      estado: 'ASIGNADO',
      asistenteSocialId: '50000000-0000-4000-8000-000000000001',
      asistenteSocialNombre: 'Camila Valenzuela Castro',
    };

    act(() => {
      socket._trigger('asistencia_social:actualizada', eventoActualizado);
    });

    expect(result.current.eventos).toHaveLength(1);
    expect(result.current.eventos[0].estado).toBe('ASIGNADO');
    expect(result.current.eventos[0].asistenteSocialNombre).toBe('Camila Valenzuela Castro');
  });

  it('no inserta en la bandeja PENDIENTE un evento recibido por asistencia_social:creada con estado ASIGNADO', async () => {
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

    const eventoAsignadoAlCrear: EventoAsistenciaSocialItem = {
      ...mockItem,
      id: '70000000-0000-4000-8000-000000000099',
      codigo: 'AS-2026-0099',
      estado: 'ASIGNADO',
      asistenteSocialId: '50000000-0000-4000-8000-000000000001',
      asistenteSocialNombre: 'Camila Valenzuela Castro',
    };

    act(() => {
      socket._trigger('asistencia_social:creada', eventoAsignadoAlCrear);
    });

    expect(result.current.eventos).toHaveLength(1);
    expect(result.current.eventos[0].codigo).toBe('AS-2026-0001');
  });

  it('normaliza detallesEvaluacion al recibir asistencia_social:creada por Socket.io (caso 5 integrantes, 2 niños, 1 discapacidad)', async () => {
    vi.spyOn(asistenciaSocialService, 'obtenerEventosAsistenciaSocial').mockResolvedValueOnce({
      data: [],
      total: 0,
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

    const payloadConSnakeCase = {
      ...mockItem,
      id: '70000000-0000-4000-8000-000000000150',
      codigo: 'AS-2026-0150',
      personasAfectadas: 5,
      familiasAfectadas: 1,
      detalles_evaluacion: {
        nivel_compromiso_vivienda: 'MODERADO',
        familias: [
          {
            referencia: 'Hogar Beneficencia',
            nucleo_familiar_total: 5,
            cantidad_ninos: 2,
            personas_discapacitadas: 1,
          },
        ],
      },
    };

    act(() => {
      socket._trigger('asistencia_social:creada', payloadConSnakeCase);
    });

    expect(result.current.eventos).toHaveLength(1);
    expect(result.current.eventos[0].detallesEvaluacion?.familias).toHaveLength(1);
    expect(result.current.eventos[0].detallesEvaluacion?.nucleoFamiliarTotal).toBe(5);
    expect(result.current.eventos[0].detallesEvaluacion?.cantidadNinos).toBe(2);
    expect(result.current.eventos[0].detallesEvaluacion?.personasDiscapacitadas).toBe(1);
  });

  it('preserva detallesEvaluacion existente si asistencia_social:actualizada omite el campo', async () => {
    const itemConDetalles: EventoAsistenciaSocialItem = {
      ...mockItem,
      personasAfectadas: 5,
      familiasAfectadas: 1,
      detallesEvaluacion: {
        familiasAfectadas: 1,
        nucleoFamiliarTotal: 5,
        cantidadNinos: 2,
        personasDiscapacitadas: 1,
        familias: [
          {
            nucleoFamiliarTotal: 5,
            cantidadNinos: 2,
            personasDiscapacitadas: 1,
          },
        ],
      },
    };

    vi.spyOn(asistenciaSocialService, 'obtenerEventosAsistenciaSocial').mockResolvedValueOnce({
      data: [itemConDetalles],
      total: 1,
      pagina: 1,
      limite: 10,
      totalPaginas: 1,
    });

    const { result } = renderHook(() =>
      useEventosAsistenciaSocial({ pagina: 1, limite: 10 })
    );

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    const socket = getSocket() as unknown as {
      _trigger: (event: string, payload?: unknown) => void;
    };

    act(() => {
      socket._trigger('asistencia_social:actualizada', {
        ...mockItem,
        personasAfectadas: 5,
        familiasAfectadas: 1,
        estado: 'ASIGNADO',
        asistenteSocialId: '50000000-0000-4000-8000-000000000001',
        asistenteSocialNombre: 'Camila Valenzuela Castro',
      });
    });

    expect(result.current.eventos[0].estado).toBe('ASIGNADO');
    expect(result.current.eventos[0].detallesEvaluacion?.familias).toHaveLength(1);
    expect(result.current.eventos[0].detallesEvaluacion?.cantidadNinos).toBe(2);
    expect(result.current.eventos[0].detallesEvaluacion?.personasDiscapacitadas).toBe(1);
  });

  it('HU-25: soporta payload envuelto { evento } en asistencia_social:creada y actualiza/remueve evento PENDIENTE al pasar a ASIGNADO', async () => {
    vi.mocked(asistenciaSocialService.obtenerEventosAsistenciaSocial).mockResolvedValueOnce({
      data: [
        {
          ...mockItem,
          id: 'ev-pendiente-1',
          codigo: 'AS-2026-0050',
          estado: 'PENDIENTE',
        },
      ],
      total: 1,
      pagina: 1,
      limite: 10,
      totalPaginas: 1,
    });

    const { result } = renderHook(() =>
      useEventosAsistenciaSocial({
        pagina: 1,
        limite: 10,
        busqueda: '',
        delegacionId: '',
        prioridad: '',
        estado: 'PENDIENTE',
      })
    );

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });
    expect(result.current.eventos).toHaveLength(1);

    const { getSocket } = await import('@/lib/socket/client');
    const socket = getSocket() as unknown as {
      _trigger: (event: string, payload?: unknown) => void;
    };

    act(() => {
      socket._trigger('asistencia_social:creada', {
        evento: {
          ...mockItem,
          id: 'ev-pendiente-1',
          codigo: 'AS-2026-0050',
          estado: 'ASIGNADO',
          asistenteSocialId: 'asoc-1',
          asistenteSocialNombre: 'Camila Soto',
        },
      });
    });

    // Al estar filtrado por PENDIENTE, el upsert a ASIGNADO debe removerlo de la lista actual
    expect(result.current.eventos).toHaveLength(0);
    expect(result.current.meta.total).toBe(0);
  });
});
