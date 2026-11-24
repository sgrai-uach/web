import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useEncargadoKanbanSocket,
  type NotificacionTrazabilidadPayload,
} from '../useEncargadoKanbanSocket';
import { getSocket } from '@/lib/socket/client';
import {
  clearTrazabilidadCache,
  getTrazabilidadEstado,
} from '@/lib/socket/trazabilidadStore';

vi.mock('@/lib/socket/client', () => {
  const listeners: Record<string, ((...args: unknown[]) => void)[]> = {};

  const mockSocket = {
    connected: false,
    connect: vi.fn(),
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
    // Helper para tests
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

describe('useEncargadoKanbanSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearTrazabilidadCache();
    const socket = getSocket() as unknown as { _clear: () => void; connected: boolean };
    socket._clear();
    socket.connected = false;
  });

  it('debe conectar el socket y unirse a sala:encargados al montar', () => {
    const socket = getSocket();

    renderHook(() => useEncargadoKanbanSocket());

    expect(socket.connect).toHaveBeenCalled();
    expect(socket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith('incidente:creado', expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith('incidente:actualizado', expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith('mision:rechazada', expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith('notificacion:trazabilidad_actualizada', expect.any(Function));

    // Simular evento connect
    act(() => {
      (socket as unknown as { _trigger: (ev: string) => void })._trigger('connect');
    });

    expect(socket.emit).toHaveBeenCalledWith('join', 'encargado');
    expect(socket.emit).toHaveBeenCalledWith('unirse', 'sala:encargados');
    expect(socket.emit).toHaveBeenCalledWith('join', 'mapa');
    expect(socket.emit).toHaveBeenCalledWith('unirse', 'mapa');
  });

  it('debe escuchar incidente:creado e invocar el callback onIncidenteCreado', () => {
    const socket = getSocket();
    const onIncidenteCreado = vi.fn();

    renderHook(() =>
      useEncargadoKanbanSocket({
        onIncidenteCreado,
      })
    );

    const payload = {
      evento: 'incidente:creado' as const,
      datos: {
        id: 'inc-123',
        codigo: 'INC-12345678',
        tipoAfectacion: 'Inundación',
        direccion: 'Calle Principal 100',
        latitud: -39.81,
        longitud: -73.24,
        estado: 'REPORTADO' as const,
        prioridad: 'ALTA' as const,
        creadoEn: '2026-09-22T10:00:00Z',
      },
      emitidoEn: '2026-09-22T10:00:00Z',
    };

    act(() => {
      (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger(
        'incidente:creado',
        payload
      );
    });

    expect(onIncidenteCreado).toHaveBeenCalledWith(payload);
  });

  it('debe escuchar incidente:actualizado e invocar el callback onIncidenteActualizado', () => {
    const socket = getSocket();
    const onIncidenteActualizado = vi.fn();

    renderHook(() =>
      useEncargadoKanbanSocket({
        onIncidenteActualizado,
      })
    );

    const payload = {
      evento: 'incidente:actualizado' as const,
      datos: {
        id: 'inc-123',
        codigo: 'INC-12345678',
        nuevoEstado: 'EN_ATENCION' as const,
        prioridad: 'CRITICA' as const,
        actualizadoEn: '2026-09-22T10:30:00Z',
      },
      emitidoEn: '2026-09-22T10:30:00Z',
    };

    act(() => {
      (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger(
        'incidente:actualizado',
        payload
      );
    });

    expect(onIncidenteActualizado).toHaveBeenCalledWith(payload);
  });

  it('debe procesar reclasificación de tipología en terreno emitiendo string amigable en ultimoEvento', () => {
    const socket = getSocket();
    const onIncidenteActualizado = vi.fn();

    const { result } = renderHook(() =>
      useEncargadoKanbanSocket({
        onIncidenteActualizado,
      })
    );

    const payloadReclasificado = {
      evento: 'incidente:actualizado' as const,
      datos: {
        id: '50000000-0000-4000-8000-000000000001',
        codigo: 'INC-2026-001',
        nuevoEstado: 'VERIFICANDO' as const,
        prioridad: 'ALTA' as const,
        tipoIncidenteId: '40000000-0000-4000-8000-000000000001',
        tipoAfectacion: 'Inundación',
        justificacion: 'Tras evaluación presencial se constata desborde de cauce con ingreso de agua.',
        actualizadoEn: '2026-11-10T03:30:00.000Z',
      },
      emitidoEn: '2026-11-10T03:30:00.000Z',
    };

    act(() => {
      (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger(
        'incidente:actualizado',
        payloadReclasificado
      );
    });

    expect(onIncidenteActualizado).toHaveBeenCalledWith(payloadReclasificado);
    expect(result.current.ultimoEvento).toContain('Tipología reclasificada: INC-2026-001 a Inundación (Prioridad: Alta)');
  });

  it('debe escuchar notificacion:trazabilidad_actualizada e invocar el callback onNotificacionTrazabilidadActualizada', () => {
    const socket = getSocket();
    const onNotificacionTrazabilidadActualizada = vi.fn();

    const { result } = renderHook(() =>
      useEncargadoKanbanSocket({
        onNotificacionTrazabilidadActualizada,
      })
    );

    const payload: NotificacionTrazabilidadPayload = {
      notificacionId: 'notif-987',
      misionId: 'mis-100',
      patrullaId: 'pat-001',
      estado: 'RECIBIDA',
      intentosEnvio: 1,
      creadaAt: '2026-11-10T15:00:00Z',
      enviadaAt: '2026-11-10T15:00:02Z',
      recibidaAt: '2026-11-10T15:00:05Z',
      leidaAt: null,
      actualizadoEn: '2026-11-10T15:00:05Z',
    };

    act(() => {
      (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger(
        'notificacion:trazabilidad_actualizada',
        payload
      );
    });

    expect(onNotificacionTrazabilidadActualizada).toHaveBeenCalledWith({
      ...payload,
      tipoUnidad: 'PATRULLA',
    });
    expect(result.current.ultimoEvento).toBe('Trazabilidad misión: RECIBIDA');
    expect(getTrazabilidadEstado('mis-100')).toBe('RECIBIDA');
  });

  it('debe escuchar mision:rechazada e invocar el callback onMisionRechazada', () => {
    const socket = getSocket();
    const onMisionRechazada = vi.fn();

    renderHook(() =>
      useEncargadoKanbanSocket({
        onMisionRechazada,
      })
    );

    const payload = {
      misionId: 'mis-100',
      codigo: 'MIS-2026-0001',
      tipoMision: 'VERIFICACION',
      motivo: 'Móvil en pana mecánica en ruta',
      justificacionRechazo: 'Móvil en pana mecánica en ruta',
      patrullaId: 'pat-1',
      patrullaNombre: 'Patrulla 02',
      incidenteId: 'inc-123',
      incidenteCodigo: 'INC-12345678',
      rechazadoPorId: null,
      rechazadoEn: '2026-09-22T10:45:00Z',
    };

    act(() => {
      (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger(
        'mision:rechazada',
        payload
      );
    });

    expect(onMisionRechazada).toHaveBeenCalledWith({
      ...payload,
      cuadrillaId: null,
      cuadrillaNombre: null,
    });
  });

  it('debe deduplicar eventos de mision:rechazada recibidos repetidamente dentro de la ventana de tiempo', () => {
    const socket = getSocket();
    const onMisionRechazada = vi.fn();

    renderHook(() =>
      useEncargadoKanbanSocket({
        onMisionRechazada,
      })
    );

    const payload = {
      misionId: 'mis-dup-1',
      codigo: 'MIS-2026-0002',
      tipoMision: 'VERIFICACION',
      motivo: 'Falla mecánica',
      patrullaNombre: 'Patrulla 01',
    };

    act(() => {
      const helper = socket as unknown as { _trigger: (ev: string, p: unknown) => void };
      helper._trigger('mision:rechazada', payload);
      helper._trigger('mision:rechazada', payload);
    });

    expect(onMisionRechazada).toHaveBeenCalledTimes(1);
  });

  it('debe limpiar listeners y emitir salir al desmontar', () => {
    const socket = getSocket();

    const { unmount } = renderHook(() => useEncargadoKanbanSocket());

    unmount();

    expect(socket.off).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(socket.off).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(socket.off).toHaveBeenCalledWith('incidente:creado', expect.any(Function));
    expect(socket.off).toHaveBeenCalledWith('incidente:actualizado', expect.any(Function));
    expect(socket.off).toHaveBeenCalledWith('mision:rechazada', expect.any(Function));
    expect(socket.off).toHaveBeenCalledWith('cuadrilla:actualizada', expect.any(Function));
    expect(socket.off).toHaveBeenCalledWith('notificacion:trazabilidad_actualizada', expect.any(Function));
    expect(socket.off).toHaveBeenCalledWith('mision:hito_registrado', expect.any(Function));
    expect(socket.off).toHaveBeenCalledWith('mision:actualizada', expect.any(Function));
    expect(socket.emit).toHaveBeenCalledWith('leave', 'encargado');
    expect(socket.emit).toHaveBeenCalledWith('salir', 'sala:encargados');
    expect(socket.emit).toHaveBeenCalledWith('leave', 'mapa');
    expect(socket.emit).toHaveBeenCalledWith('salir', 'mapa');
  });

  it('debe deduplicar eventos incidente:actualizado repetidos por múltiples salas', () => {
    const socket = getSocket();
    const onIncidenteActualizado = vi.fn();

    renderHook(() =>
      useEncargadoKanbanSocket({
        onIncidenteActualizado,
      })
    );

    const payload = {
      evento: 'incidente:actualizado' as const,
      datos: {
        id: 'inc-dup-1',
        codigo: 'INC-948888-846',
        nuevoEstado: 'VERIFICANDO' as const,
        prioridad: 'MEDIA' as const,
        actualizadoEn: '2026-11-13T12:00:00Z',
      },
      emitidoEn: '2026-11-13T12:00:00Z',
    };

    act(() => {
      const trigger = (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger;
      trigger('incidente:actualizado', payload);
      trigger('incidente:actualizado', payload);
      trigger('incidente:actualizado', payload);
    });

    expect(onIncidenteActualizado).toHaveBeenCalledTimes(1);
  });

  it('debe marcar esSintetico: true al sintetizar actualización desde mision:actualizada en EN_CURSO', () => {
    const socket = getSocket();
    const onIncidenteActualizado = vi.fn();

    renderHook(() =>
      useEncargadoKanbanSocket({
        onIncidenteActualizado,
      })
    );

    act(() => {
      const trigger = (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger;
      trigger('mision:actualizada', {
        incidenteId: 'inc-mision-1',
        estado: 'EN_CURSO',
        tipoMision: 'VERIFICACION',
        codigo: 'MIS-001',
      });
      trigger('mision:actualizada', {
        incidenteId: 'inc-mision-1',
        estado: 'EN_CURSO',
        tipoMision: 'VERIFICACION',
        codigo: 'MIS-001',
      });
    });

    expect(onIncidenteActualizado).toHaveBeenCalledTimes(1);
    expect(onIncidenteActualizado).toHaveBeenCalledWith(
      expect.objectContaining({
        esSintetico: true,
        datos: expect.objectContaining({
          id: 'inc-mision-1',
          nuevoEstado: 'VERIFICANDO',
        }),
      })
    );
  });

  it('debe reflejar en ultimoEvento cuando la tipología fue confirmada sin cambios', () => {
    const socket = getSocket();
    const onIncidenteActualizado = vi.fn();

    const { result } = renderHook(() =>
      useEncargadoKanbanSocket({
        onIncidenteActualizado,
      })
    );

    act(() => {
      const trigger = (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger;
      trigger('incidente:actualizado', {
        evento: 'incidente:actualizado',
        datos: {
          id: 'inc-rat-1',
          codigo: 'INC-948888-846',
          nuevoEstado: 'VERIFICANDO',
          prioridad: 'MEDIA',
          tipoAnterior: 'Deslizamiento',
          tipoAfectacion: 'Deslizamiento',
          justificacion: 'Tipología constatada y ratificada en terreno sin variaciones.',
          actualizadoEn: '2026-11-13T15:21:38Z',
        },
      });
    });

    expect(result.current.ultimoEvento).toContain('Tipología confirmada sin cambios: INC-948888-846 (Deslizamiento');
  });

  it('debe normalizar incidente:actualizado con dictamen NO_ABORDABLE, motivoNoAbordable y fechaCierre (H39)', () => {
    const socket = getSocket();
    const onIncidenteActualizado = vi.fn();

    const { result } = renderHook(() =>
      useEncargadoKanbanSocket({
        onIncidenteActualizado,
      })
    );

    act(() => {
      const trigger = (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger;
      trigger('incidente:actualizado', {
        evento: 'incidente:actualizado',
        datos: {
          id: 'inc-noab-1',
          codigo: 'INC-2026-860',
          nuevoEstado: 'NO_ABORDABLE',
          prioridad: 'BAJA',
          dictamen: 'NO_ABORDABLE',
          motivoNoAbordable: 'Predio privado cerrado sin acceso vehicular ni riesgo externo.',
          fechaCierre: '2026-11-15T14:20:00Z',
          verificado: true,
          actualizadoEn: '2026-11-15T14:20:00Z',
        },
      });
    });

    expect(onIncidenteActualizado).toHaveBeenCalledWith(
      expect.objectContaining({
        datos: expect.objectContaining({
          id: 'inc-noab-1',
          nuevoEstado: 'NO_ABORDABLE',
          dictamen: 'NO_ABORDABLE',
          motivoNoAbordable: 'Predio privado cerrado sin acceso vehicular ni riesgo externo.',
          fechaCierre: '2026-11-15T14:20:00Z',
          verificado: true,
        }),
      })
    );
    expect(result.current.ultimoEvento).toContain('declarado No Abordable en terreno');
  });

  it('debe normalizar informe de cierre REQUIERE_CUADRILLA con FIBE y NO sintetizar evento para mision COMPLETADA (H39)', () => {
    const socket = getSocket();
    const onIncidenteActualizado = vi.fn();

    const { result } = renderHook(() =>
      useEncargadoKanbanSocket({
        onIncidenteActualizado,
      })
    );

    act(() => {
      const trigger = (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger;
      // mision:actualizada COMPLETADA no debe disparar payload sintético que pise estados
      trigger('mision:actualizada', {
        incidenteId: 'inc-cierre-1',
        estado: 'COMPLETADA',
        tipoMision: 'VERIFICACION',
        codigo: 'MIS-2026-039',
      });
    });

    expect(onIncidenteActualizado).not.toHaveBeenCalled();

    act(() => {
      const trigger = (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger;
      trigger('incidente:actualizado', {
        evento: 'incidente:actualizado',
        datos: {
          id: 'inc-cierre-1',
          codigo: 'INC-2026-039',
          nuevoEstado: 'VERIFICANDO',
          prioridad: 'ALTA',
          verificado: true,
          requiereAsistenciaSocial: true,
          dictamen: 'REQUIERE_CUADRILLA',
          reporteTerreno: {
            id: 'rep-cierre-1',
            misionId: 'mis-039',
            tipoReporte: 'VERIFICACION_CIERRE',
            dictamen: 'REQUIERE_CUADRILLA',
            etiquetaReporte: 'Informe de Verificación y Cierre',
            requiereAsistenciaSocial: true,
            personasAfectadas: 4,
            estadoTerreno: 'CRITICO',
            resumenTecnico: 'Árbol obstruye calzada y compromete acceso a vivienda.',
          },
          actualizadoEn: '2026-11-15T15:00:00Z',
        },
      });
    });

    expect(onIncidenteActualizado).toHaveBeenCalledTimes(1);
    expect(onIncidenteActualizado).toHaveBeenCalledWith(
      expect.objectContaining({
        datos: expect.objectContaining({
          id: 'inc-cierre-1',
          nuevoEstado: 'VERIFICANDO',
          verificado: true,
          requiereAsistenciaSocial: true,
          dictamen: 'REQUIERE_CUADRILLA',
        }),
      })
    );
    expect(result.current.ultimoEvento).toContain('Verificación finalizada en INC-2026-039: Requiere Cuadrilla');
  });

  it('BUG-H35-WEB-07: ignora payloads malformados o con estado inválido en notificacion:trazabilidad_actualizada', () => {
    const socket = getSocket();
    const onNotificacionTrazabilidadActualizada = vi.fn();

    const { result } = renderHook(() =>
      useEncargadoKanbanSocket({
        onNotificacionTrazabilidadActualizada,
      })
    );

    const trigger = (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger;

    act(() => {
      trigger('notificacion:trazabilidad_actualizada', null);
      trigger('notificacion:trazabilidad_actualizada', { misionId: '', estado: 'RECIBIDA' });
      trigger('notificacion:trazabilidad_actualizada', {
        misionId: 'mis-invalido',
        estado: 'OTRO_ESTADO',
      });
    });

    expect(onNotificacionTrazabilidadActualizada).not.toHaveBeenCalled();
    expect(result.current.ultimoEvento).toBeNull();
    expect(getTrazabilidadEstado('mis-invalido')).toBeUndefined();
  });

  it('HU-42: escucha mision:hito_registrado y mision:actualizada actualizando misionesStore', async () => {
    const {
      clearMisionesRealtimeStore,
      getEstadoTiempoRealMision,
      getHitosTiempoRealMision,
    } = await import('@/lib/socket/misionesStore');
    clearMisionesRealtimeStore();

    const socket = getSocket();
    const onMisionHitoRegistrado = vi.fn();
    const onMisionActualizada = vi.fn();

    const { result } = renderHook(() =>
      useEncargadoKanbanSocket({
        onMisionHitoRegistrado,
        onMisionActualizada,
      })
    );

    const trigger = (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger;

    act(() => {
      trigger('mision:hito_registrado', {
        misionId: 'mis-h42-1',
        codigoMision: 'MIS-2026-0042',
        hito: 'LLEGADA_TERRENO',
        descripcion: 'Cuadrilla reportó llegada a terreno en coordenadas (-39.81422, -73.24589)',
        latitud: -39.81422,
        longitud: -73.24589,
        registradoPor: { id: 'usr-1', nombre: 'Juan Pérez' },
        registradoEn: '2026-11-17T22:00:00.000Z',
        nuevoEstadoMision: 'EN_CURSO',
      });
    });

    expect(onMisionHitoRegistrado).toHaveBeenCalledTimes(1);
    expect(result.current.ultimoEvento).toBe('Llegada a Terreno: MIS-2026-0042');
    expect(getEstadoTiempoRealMision('mis-h42-1')).toBe('EN_CURSO');
    const hitos = getHitosTiempoRealMision('mis-h42-1');
    expect(hitos).toHaveLength(1);
    expect(hitos[0].hito).toBe('Llegada a Terreno');
    expect(hitos[0].registradoPorNombre).toBe('Juan Pérez');

    act(() => {
      trigger('mision:actualizada', {
        misionId: 'mis-h42-1',
        codigo: 'MIS-2026-0042',
        estado: 'EN_PROCESO',
      });
    });

    expect(onMisionActualizada).toHaveBeenCalledTimes(1);
    expect(getEstadoTiempoRealMision('mis-h42-1')).toBe('EN_PROCESO');
  });

  it('HU-40: procesa mision:actualizada con hito MISION_ACEPTADA actualizando estado e hitos en misionesStore', async () => {
    const {
      clearMisionesRealtimeStore,
      getEstadoTiempoRealMision,
      getHitosTiempoRealMision,
    } = await import('@/lib/socket/misionesStore');
    clearMisionesRealtimeStore();

    const socket = getSocket();
    const onMisionActualizada = vi.fn();

    renderHook(() =>
      useEncargadoKanbanSocket({
        onMisionActualizada,
      })
    );

    const trigger = (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger;

    act(() => {
      trigger('mision:actualizada', {
        misionId: 'mis-h40-1',
        codigo: 'MIS-2026-0040',
        estado: 'EN_CURSO',
        tipoMision: 'ATENCION_CUADRILLA',
        cuadrillaId: 'cuad-1',
        incidenteId: 'inc-40',
        hito: {
          id: 'hito-h40-1',
          hito: 'MISION_ACEPTADA',
          descripcion: 'Misión Aceptada por Cuadrilla',
          registradoPorId: 'usr-del-40',
          creadoEn: '2026-11-22T15:00:00.000Z',
        },
        actualizadoEn: '2026-11-22T15:00:00.000Z',
      });
    });

    expect(onMisionActualizada).toHaveBeenCalledTimes(1);
    expect(getEstadoTiempoRealMision('mis-h40-1')).toBe('EN_CURSO');
    const hitos = getHitosTiempoRealMision('mis-h40-1');
    expect(hitos).toHaveLength(1);
    expect(hitos[0].hito).toBe('Misión Aceptada por Unidad');
    expect(hitos[0].descripcion).toBe('Misión Aceptada por Cuadrilla');
  });

  it('HU-41: escucha mision:rechazada de cuadrilla, normaliza payload y deduplica emisiones concurrentes', () => {
    const socket = getSocket();
    const onMisionRechazada = vi.fn();

    const { result } = renderHook(() =>
      useEncargadoKanbanSocket({
        onMisionRechazada,
      })
    );

    const payload = {
      misionId: '70000000-0000-4000-8000-000000000001',
      codigo: 'MIS-2026-0005',
      tipoMision: 'ATENCION_CUADRILLA',
      motivo: 'Camión tolva presenta falla hidráulica en ruta de salida desde base.',
      justificacionRechazo: 'Camión tolva presenta falla hidráulica en ruta de salida desde base.',
      cuadrillaId: '50000000-0000-4000-8000-000000000001',
      cuadrillaNombre: 'Cuadrilla Vías y Canales 1',
      patrullaId: null,
      patrullaNombre: null,
      incidenteId: '30000000-0000-4000-8000-000000000001',
      incidenteCodigo: 'INC-2026-0001',
      rechazadoPorId: 'd0000000-0000-4000-8000-000000000001',
      rechazadoEn: '2026-11-16T23:15:00.000Z',
    };

    act(() => {
      const trigger = (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger;
      trigger('mision:rechazada', payload);
      trigger('mision:rechazada', payload);
    });

    expect(onMisionRechazada).toHaveBeenCalledTimes(1);
    expect(onMisionRechazada).toHaveBeenCalledWith(payload);
    expect(result.current.ultimoEvento).toBe('Misión rechazada: MIS-2026-0005');
  });

  it('HU-41: escucha cuadrilla:actualizada e invoca onCuadrillaActualizada cuando la cuadrilla vuelve a DISPONIBLE', () => {
    const socket = getSocket();
    const onCuadrillaActualizada = vi.fn();

    renderHook(() =>
      useEncargadoKanbanSocket({
        onCuadrillaActualizada,
      })
    );

    const payload = {
      id: '50000000-0000-4000-8000-000000000001',
      nombre: 'Cuadrilla Vías y Canales 1',
      estado: 'DISPONIBLE',
      delegacionId: '30000000-0000-4000-8000-000000000001',
    };

    act(() => {
      (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger(
        'cuadrilla:actualizada',
        payload
      );
    });

    expect(onCuadrillaActualizada).toHaveBeenCalledWith(payload);
  });

  it('HU-68: normaliza incidente:actualizado con REPORTE_CUADRILLA manteniendo estado EN_ATENCION', () => {
    const socket = getSocket();
    const onIncidenteActualizado = vi.fn();

    const { result } = renderHook(() =>
      useEncargadoKanbanSocket({
        onIncidenteActualizado,
      })
    );

    act(() => {
      const trigger = (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger;
      trigger('incidente:actualizado', {
        evento: 'incidente:actualizado',
        datos: {
          id: 'inc-cuad-68',
          codigo: 'INC-2026-0068',
          nuevoEstado: 'EN_ATENCION',
          prioridad: 'ALTA',
          reporteTerreno: {
            id: 'rep-cuad-68',
            misionId: 'mis-cuad-68',
            tipoReporte: 'REPORTE_CUADRILLA',
            etiquetaReporte: 'Informe Técnico Final de Cuadrilla (Cierre de Misión)',
            resumenFaenas: 'Se despeja colector pluvial obstruido y se instalan sacos de arena.',
            horas_hombre: 6.5,
            estadoTerreno: 'CONTROLADO',
            materiales_consumidos: [
              { recurso_id: 'rec-sacos', nombre: 'Sacos de arena', cantidad: 30, unidad: 'sacos' },
            ],
          },
          actualizadoEn: '2026-11-18T18:00:00Z',
        },
      });
    });

    expect(onIncidenteActualizado).toHaveBeenCalledTimes(1);
    expect(onIncidenteActualizado).toHaveBeenCalledWith(
      expect.objectContaining({
        datos: expect.objectContaining({
          id: 'inc-cuad-68',
          nuevoEstado: 'EN_ATENCION',
          reporteTerreno: expect.objectContaining({
            tipoReporte: 'REPORTE_CUADRILLA',
            horasHombre: 6.5,
            estadoTerreno: 'CONTROLADO',
            materialesConsumidos: [
              {
                recursoId: 'rec-sacos',
                nombre: 'Sacos de arena',
                cantidad: 30,
                unidad: 'sacos',
                observacion: null,
              },
            ],
          }),
        }),
      })
    );
    expect(result.current.ultimoEvento).toContain(
      'Informe final de cuadrilla recibido en INC-2026-0068: Terreno Controlado'
    );
  });

  it('HU-68: emite onMisionActualizada en mision:actualizada COMPLETADA sin sintetizar incidente:actualizado y procesa recurso:actualizado', () => {
    const socket = getSocket();
    const onIncidenteActualizado = vi.fn();
    const onMisionActualizada = vi.fn();
    const onRecursoActualizado = vi.fn();

    renderHook(() =>
      useEncargadoKanbanSocket({
        onIncidenteActualizado,
        onMisionActualizada,
        onRecursoActualizado,
      })
    );

    act(() => {
      const trigger = (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger;
      trigger('mision:actualizada', {
        id: 'mis-cuad-68',
        codigo: 'MIS-2026-0068',
        tipoMision: 'ATENCION_CUADRILLA',
        estado: 'COMPLETADA',
        fechaCierre: '2026-11-18T18:05:00Z',
        hito: 'MISION_COMPLETADA',
        incidenteId: 'inc-cuad-68',
        cuadrillaId: 'cuad-68',
      });
      trigger('recurso:actualizado', {
        id: 'rec-sacos',
        nombre: 'Sacos de arena',
        estado: 'BAJO_STOCK',
        cantidad_inventario: 15,
        cantidad_en_uso: 0,
        cantidad_minima: 20,
      });
    });

    expect(onIncidenteActualizado).not.toHaveBeenCalled();
    expect(onMisionActualizada).toHaveBeenCalledWith(
      expect.objectContaining({
        misionId: 'mis-cuad-68',
        estado: 'COMPLETADA',
        hito: 'MISION_COMPLETADA',
      })
    );
    expect(onRecursoActualizado).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'rec-sacos',
        nombre: 'Sacos de arena',
        estado: 'BAJO_STOCK',
        cantidadInventario: 15,
        cantidadDisponible: 15,
      })
    );
  });

  it('HU-40: sintetiza incidente EN_ATENCION, normaliza hito MISION_ACEPTADA en mision:actualizada y refleja cuadrilla EN_MISION', () => {
    const socket = getSocket();
    const onIncidenteActualizado = vi.fn();
    const onMisionActualizada = vi.fn();
    const onCuadrillaActualizada = vi.fn();

    const { result } = renderHook(() =>
      useEncargadoKanbanSocket({
        onIncidenteActualizado,
        onMisionActualizada,
        onCuadrillaActualizada,
      })
    );

    act(() => {
      const trigger = (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger;
      trigger('mision:actualizada', {
        misionId: '70000000-0000-4000-8000-000000000001',
        codigo: 'MIS-2026-0005',
        estado: 'EN_CURSO',
        tipoMision: 'ATENCION_CUADRILLA',
        cuadrillaId: '50000000-0000-4000-8000-000000000001',
        cuadrillaNombre: 'Cuadrilla Vías y Canales 1',
        patrullaId: null,
        patrullaNombre: null,
        incidenteId: '30000000-0000-4000-8000-000000000001',
        incidenteCodigo: 'INC-2026-0001',
        prioridad: 'ALTA',
        fechaInicio: '2026-11-22T14:00:00.000Z',
        hito: {
          id: '80000000-0000-4000-8000-000000000010',
          hito: 'MISION_ACEPTADA',
          descripcion: 'Asignación Aceptada por Cuadrilla',
          registradoPorId: 'd0000000-0000-4000-8000-000000000001',
          creadoEn: '2026-11-22T14:00:00.000Z',
        },
        actualizadoEn: '2026-11-22T14:00:00.000Z',
      });

      trigger('cuadrilla:actualizada', {
        id: '50000000-0000-4000-8000-000000000001',
        nombre: 'Cuadrilla Vías y Canales 1',
        estado: 'EN_MISION',
        delegacionId: 'd1000000-0000-4000-8000-000000000001',
      });
    });

    expect(onIncidenteActualizado).toHaveBeenCalledWith(
      expect.objectContaining({
        esSintetico: true,
        datos: expect.objectContaining({
          id: '30000000-0000-4000-8000-000000000001',
          codigo: 'INC-2026-0001',
          nuevoEstado: 'EN_ATENCION',
          prioridad: 'ALTA',
        }),
      })
    );
    expect(onMisionActualizada).toHaveBeenCalledWith(
      expect.objectContaining({
        misionId: '70000000-0000-4000-8000-000000000001',
        codigo: 'MIS-2026-0005',
        estado: 'EN_CURSO',
        tipoMision: 'ATENCION_CUADRILLA',
        cuadrillaNombre: 'Cuadrilla Vías y Canales 1',
        incidenteCodigo: 'INC-2026-0001',
        prioridad: 'ALTA',
        hito: expect.objectContaining({
          hito: 'MISION_ACEPTADA',
          descripcion: 'Asignación Aceptada por Cuadrilla',
        }),
      })
    );
    expect(onCuadrillaActualizada).toHaveBeenCalledWith({
      id: '50000000-0000-4000-8000-000000000001',
      nombre: 'Cuadrilla Vías y Canales 1',
      estado: 'EN_MISION',
      delegacionId: 'd1000000-0000-4000-8000-000000000001',
    });
    expect(result.current.ultimoEvento).toBe(
      'Cuadrilla Cuadrilla Vías y Canales 1 en misión activa'
    );
  });

  it('HU-44: escucha mision:apoyo_solicitado, normaliza campos, deduplica emisiones y propaga apoyo en incidente:actualizado', () => {
    const socket = getSocket();
    const onMisionApoyoSolicitado = vi.fn();
    const onIncidenteActualizado = vi.fn();

    const { result } = renderHook(() =>
      useEncargadoKanbanSocket({
        onMisionApoyoSolicitado,
        onIncidenteActualizado,
      })
    );

    const trigger = (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger;

    const payloadApoyo = {
      reporteId: 'rep-apoyo-44',
      misionId: 'mis-44',
      misionCodigo: 'MIS-2026-0044',
      incidenteId: 'inc-44',
      incidenteCodigo: 'INC-2026-0044',
      cuadrillaId: 'cuad-44',
      cuadrillaNombre: 'Cuadrilla Norte 1',
      evaluadorId: 'usr-del-44',
      evaluadorNombre: 'Juan Pérez',
      requiereApoyoAdicional: true,
      requiereCuadrillaAdicional: true,
      detalleApoyoRequerido: 'Se solicita motoniveladora y cuadrilla adicional de despeje',
      prioridadAlerta: 'ALTA',
      solicitadoEn: '2026-11-23T20:15:00.000Z',
    };

    act(() => {
      trigger('mision:apoyo_solicitado', payloadApoyo);
      // Emisión duplicada desde segunda sala dentro de la ventana de deduplicación
      trigger('mision:apoyo_solicitado', {
        reporte_id: 'rep-apoyo-44',
        mision_id: 'mis-44',
        incidente_id: 'inc-44',
        requiere_cuadrilla_adicional: true,
        detalle_apoyo_requerido: 'Se solicita motoniveladora y cuadrilla adicional de despeje',
        solicitado_en: '2026-11-23T20:15:00.000Z',
      });
    });

    expect(onMisionApoyoSolicitado).toHaveBeenCalledTimes(1);
    expect(onMisionApoyoSolicitado).toHaveBeenCalledWith(
      expect.objectContaining({
        reporteId: 'rep-apoyo-44',
        misionId: 'mis-44',
        misionCodigo: 'MIS-2026-0044',
        incidenteId: 'inc-44',
        incidenteCodigo: 'INC-2026-0044',
        cuadrillaNombre: 'Cuadrilla Norte 1',
        evaluadorNombre: 'Juan Pérez',
        requiereApoyoAdicional: true,
        requiereCuadrillaAdicional: true,
        detalleApoyoRequerido: 'Se solicita motoniveladora y cuadrilla adicional de despeje',
        prioridadAlerta: 'ALTA',
      })
    );
    expect(result.current.ultimoEvento).toContain('Apoyo adicional solicitado en INC-2026-0044');

    act(() => {
      trigger('incidente:actualizado', {
        evento: 'incidente:actualizado',
        datos: {
          id: 'inc-44',
          codigo: 'INC-2026-0044',
          nuevoEstado: 'EN_ATENCION',
          prioridad: 'ALTA',
          apoyoSolicitado: true,
          requiereCuadrillaAdicional: true,
          detalleApoyoRequerido: 'Se solicita motoniveladora y cuadrilla adicional de despeje',
          actualizadoEn: '2026-11-23T20:15:00.000Z',
        },
      });
    });

    expect(onIncidenteActualizado).toHaveBeenCalledWith(
      expect.objectContaining({
        datos: expect.objectContaining({
          id: 'inc-44',
          apoyoSolicitado: true,
          requiereCuadrillaAdicional: true,
          detalleApoyoRequerido: 'Se solicita motoniveladora y cuadrilla adicional de despeje',
        }),
      })
    );
  });

  it('no deriva apoyoSolicitado=true cuando ultimoReporte en incidente:actualizado proviene de VERIFICACION_CIERRE', () => {
    const socket = getSocket();
    const onIncidenteActualizado = vi.fn();

    renderHook(() =>
      useEncargadoKanbanSocket({
        onIncidenteActualizado,
      })
    );

    const trigger = (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger;

    act(() => {
      trigger('incidente:actualizado', {
        evento: 'incidente:actualizado',
        datos: {
          id: 'inc-verif-1',
          codigo: 'INC-466106-503',
          nuevoEstado: 'VERIFICANDO',
          prioridad: 'ALTA',
          actualizadoEn: '2026-11-23T21:00:00.000Z',
          ultimoReporte: {
            origen: 'REPORTE_TERRENO',
            reporteId: 'rep-verif-1',
            misionId: 'mis-verif-1',
            misionCodigo: 'MIS-2026-0100',
            evaluadorNombre: 'Patrulla Costa 1',
            creadoEn: '2026-11-23T21:00:00.000Z',
            resumen: 'Cierre de verificación que requiere cuadrilla',
            prioridadAsignada: 'ALTA',
            tipoReporte: 'VERIFICACION_CIERRE',
            dictamen: 'REQUIERE_CUADRILLA',
            requiereApoyoAdicional: true,
            detalleApoyoRequerido: 'Requiere cuadrilla hidráulica',
          },
        },
      });
    });

    expect(onIncidenteActualizado).toHaveBeenCalledTimes(1);
    const payloadRecibido = onIncidenteActualizado.mock.calls[0]?.[0];
    expect(payloadRecibido?.datos?.apoyoSolicitado).toBeUndefined();
    expect(payloadRecibido?.datos?.detalleApoyoRequerido).toBeUndefined();
  });

  it('normaliza cuadrillaAceptada/cuadrilla_aceptada en incidente:actualizado y la incluye al sintetizar desde mision:actualizada de cuadrilla (HU-40)', () => {
    const socket = getSocket();
    const onIncidenteActualizado = vi.fn();

    renderHook(() =>
      useEncargadoKanbanSocket({
        onIncidenteActualizado,
      })
    );

    const trigger = (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger;

    act(() => {
      trigger('incidente:actualizado', {
        evento: 'incidente:actualizado',
        datos: {
          id: 'inc-desp-1',
          codigo: 'INC-2026-0700',
          nuevoEstado: 'EN_ATENCION',
          prioridad: 'ALTA',
          cuadrilla_aceptada: false,
          actualizadoEn: '2026-11-23T22:00:00.000Z',
        },
      });
    });

    expect(onIncidenteActualizado).toHaveBeenCalledWith(
      expect.objectContaining({
        datos: expect.objectContaining({
          id: 'inc-desp-1',
          cuadrillaAceptada: false,
        }),
      })
    );

    act(() => {
      trigger('mision:actualizada', {
        misionId: 'mis-cuad-700',
        codigo: 'MIS-2026-0700',
        tipoMision: 'ATENCION_CUADRILLA',
        estado: 'EN_CURSO',
        prioridad: 'ALTA',
        incidenteId: 'inc-desp-1',
        incidenteCodigo: 'INC-2026-0700',
        cuadrillaId: 'cuad-1',
        cuadrillaNombre: 'Cuadrilla Norte 1',
      });
    });

    expect(onIncidenteActualizado).toHaveBeenCalledWith(
      expect.objectContaining({
        esSintetico: true,
        datos: expect.objectContaining({
          id: 'inc-desp-1',
          nuevoEstado: 'EN_ATENCION',
          cuadrillaAceptada: true,
        }),
      })
    );
  });

  it('normaliza incidenteEstado/incidente_estado en mision:rechazada (HU-44 multi-cuadrilla)', () => {
    const socket = getSocket();
    const onMisionRechazada = vi.fn();

    renderHook(() =>
      useEncargadoKanbanSocket({
        onMisionRechazada,
      })
    );

    const trigger = (socket as unknown as { _trigger: (ev: string, p: unknown) => void })._trigger;

    act(() => {
      trigger('mision:rechazada', {
        misionId: 'mis-cuad-extra',
        codigo: 'MIS-2026-0888',
        tipoMision: 'ATENCION_CUADRILLA',
        incidenteId: 'inc-multi-1',
        incidente_estado: 'EN_ATENCION',
        justificacion: 'Ruta bloqueada',
        rechazadoEn: '2026-11-24T11:30:00.000Z',
      });
    });

    expect(onMisionRechazada).toHaveBeenCalledWith(
      expect.objectContaining({
        misionId: 'mis-cuad-extra',
        incidenteId: 'inc-multi-1',
        incidenteEstado: 'EN_ATENCION',
      })
    );
  });
});
