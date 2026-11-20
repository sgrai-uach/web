import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  crearEventoPrevencion,
  listarEventosPrevencion,
  editarEventoPrevencion,
  obtenerEventoPrevencion,
  asignarRecursosPrevencion,
  PrevencionServiceError,
} from '../prevencionService';
import apiClient from '@/lib/api/client';
import { DEFAULT_ENCARGADO_ID } from '@/services/incidentesService';
import type {
  CrearEventoPrevencionPayload,
  EventoPrevencionDTO,
  EventoPrevencionListItemDTO,
  ListarEventosPrevencionResponse,
} from '@/types/evento-prevencion';

vi.mock('@/lib/api/client', () => ({
  default: {
    POST: vi.fn(),
    GET: vi.fn(),
    PATCH: vi.fn(),
  },
}));

vi.mock('@/lib/utils/cookieUtils', () => ({
  getAuthCookie: vi.fn(() => 'mock-jwt-token'),
}));

describe('prevencionService (HU-30)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPayload: CrearEventoPrevencionPayload = {
    nombre: 'Limpieza y monitoreo de sumideros en Angachilla',
    descripcion: 'Monitoreo preventivo del caudal e inspección de alcantarillas por frente de mal tiempo.',
    sector: 'Humedal Angachilla',
    direccionTexto: 'Av. Simpson con Los Robles',
    prioridad: 'ALTA',
    delegacionId: '30000000-0000-4000-8000-000000000001',
    puntoCriticoId: '40000000-0000-4000-8000-000000000001',
    latitud: -39.8456,
    longitud: -73.2389,
    patrullaId: 'f1000000-0000-4000-8000-000000000002',
    recursos: [
      {
        recursoId: '00000000-0000-4000-8000-000000000001',
        cantidad: 5,
      },
    ],
  };

  const mockResponseDTO: EventoPrevencionDTO = {
    id: '91d99083-b0a4-4a23-a269-1df58dd60dbb',
    codigo: 'PREV-2026-0001',
    nombre: 'Limpieza y monitoreo de sumideros en Angachilla',
    descripcion: 'Monitoreo preventivo del caudal e inspección de alcantarillas por frente de mal tiempo.',
    sector: 'Humedal Angachilla',
    direccionTexto: 'Av. Simpson con Los Robles',
    prioridad: 'ALTA',
    estado: 'PLANIFICADA',
    latitud: -39.8456,
    longitud: -73.2389,
    puntoCritico: {
      id: '40000000-0000-4000-8000-000000000001',
      codigo: 'PC-ANG-01',
      nombre: 'Sector Humedal Angachilla - Pasaje Los Robles',
    },
    delegacion: {
      id: '30000000-0000-4000-8000-000000000001',
      codigo: 'DEL_NORTE',
      nombre: 'Delegación Municipal Norte',
    },
    mision: {
      id: '17dbae23-d6c7-45c1-8850-d37cfd9ee7f6',
      codigo: 'MIS-2026-0006',
      titulo: 'Limpieza y monitoreo de sumideros en Angachilla',
      estado: 'DESPACHADA',
      tipoMision: 'PREVENCION',
    },
    patrulla: {
      id: 'f1000000-0000-4000-8000-000000000002',
      nombre: 'Patrulla Rápida Centro-Sur',
      estado: 'EN_PREVENCION',
    },
    recursos: [
      {
        recursoId: '00000000-0000-4000-8000-000000000001',
        nombre: 'Sacos de Arena 25kg',
        cantidadAsignada: 5,
      },
    ],
    creadoPorId: DEFAULT_ENCARGADO_ID,
    creadoEn: '2026-10-05T06:45:50.867Z',
    actualizadoEn: '2026-10-05T06:45:50.867Z',
  };

  it('debe registrar un evento de prevención exitosamente en 201 Created', async () => {
    vi.mocked(apiClient.POST).mockResolvedValueOnce({
      data: {
        message: 'Evento de prevención creado y patrulla despachada exitosamente.',
        data: mockResponseDTO,
      } as unknown as never,
      error: undefined,
      response: { ok: true, status: 201 } as Response,
    });

    const resultado = await crearEventoPrevencion(mockPayload, DEFAULT_ENCARGADO_ID);

    expect(apiClient.POST).toHaveBeenCalledWith('/api/eventos-atp/prevencion', {
      body: mockPayload,
      headers: {
        'x-user-id': DEFAULT_ENCARGADO_ID,
        Authorization: 'Bearer mock-jwt-token',
      },
    });
    expect(resultado).toEqual(mockResponseDTO);
    expect(resultado.codigo).toBe('PREV-2026-0001');
    expect(resultado.patrulla.estado).toBe('EN_PREVENCION');
  });

  it('debe arrojar PrevencionServiceError con tipoConflicto PATRULLA_OCUPADA en 409 Conflict', async () => {
    vi.mocked(apiClient.POST).mockResolvedValueOnce({
      data: undefined,
      error: {
        message: 'La patrulla "Patrulla Rápida Costa-1" no está disponible para asignación (estado actual: EN_VERIFICACION).',
      } as unknown as never,
      response: { ok: false, status: 409 } as Response,
    });

    try {
      await crearEventoPrevencion(mockPayload, DEFAULT_ENCARGADO_ID);
      expect.fail('Debería haber lanzado PrevencionServiceError');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(PrevencionServiceError);
      if (err instanceof PrevencionServiceError) {
        expect(err.statusCode).toBe(409);
        expect(err.tipoConflicto).toBe('PATRULLA_OCUPADA');
        expect(err.message).toContain('no está disponible para asignación');
      }
    }
  });

  it('debe arrojar PrevencionServiceError con tipoConflicto STOCK_INSUFICIENTE en 409 Conflict', async () => {
    vi.mocked(apiClient.POST).mockResolvedValueOnce({
      data: undefined,
      error: {
        message: 'Stock insuficiente para el recurso "Sacos de Arena 25kg". Solicitado: 50, Disponible: 10.',
      } as unknown as never,
      response: { ok: false, status: 409 } as Response,
    });

    try {
      await crearEventoPrevencion(mockPayload, DEFAULT_ENCARGADO_ID);
      expect.fail('Debería haber lanzado PrevencionServiceError');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(PrevencionServiceError);
      if (err instanceof PrevencionServiceError) {
        expect(err.statusCode).toBe(409);
        expect(err.tipoConflicto).toBe('STOCK_INSUFICIENTE');
        expect(err.message).toContain('Stock insuficiente');
      }
    }
  });

  it('debe mapear errores de validación de campos cuando la API retorna 400 Bad Request', async () => {
    vi.mocked(apiClient.POST).mockResolvedValueOnce({
      data: undefined,
      error: {
        message: 'Datos de entrada inválidos para el evento de prevención.',
        errors: [
          { campo: 'nombre', mensaje: 'El título debe tener al menos 3 caracteres' },
          { campo: 'descripcion', mensaje: 'Instrucciones tácticas obligatorias (mínimo 5 caracteres)' },
        ],
      } as unknown as never,
      response: { ok: false, status: 400 } as Response,
    });

    try {
      await crearEventoPrevencion(mockPayload, DEFAULT_ENCARGADO_ID);
      expect.fail('Debería haber lanzado error 400');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(PrevencionServiceError);
      if (err instanceof PrevencionServiceError) {
        expect(err.statusCode).toBe(400);
        expect(err.fieldErrors).toBeDefined();
        expect(err.fieldErrors?.nombre).toBe('El título debe tener al menos 3 caracteres');
        expect(err.fieldErrors?.descripcion).toBe('Instrucciones tácticas obligatorias (mínimo 5 caracteres)');
      }
    }
  });

  it('debe arrojar error específico en 401 Unauthorized', async () => {
    vi.mocked(apiClient.POST).mockResolvedValueOnce({
      data: undefined,
      error: {
        message: 'Token de sesión inválido o expirado.',
      } as unknown as never,
      response: { ok: false, status: 401 } as Response,
    });

    await expect(
      crearEventoPrevencion(mockPayload, DEFAULT_ENCARGADO_ID)
    ).rejects.toThrow('Token de sesión inválido o expirado.');
  });

  it('debe arrojar error de permisos en 403 Forbidden', async () => {
    vi.mocked(apiClient.POST).mockResolvedValueOnce({
      data: undefined,
      error: {
        message: 'Acceso denegado. Se requiere el permiso \'prevencion:eventos:crear\'.',
      } as unknown as never,
      response: { ok: false, status: 403 } as Response,
    });

    await expect(
      crearEventoPrevencion(mockPayload, 'callcenter-user-id')
    ).rejects.toThrow('Acceso denegado. Se requiere el permiso "prevencion:eventos:crear".');
  });

  it('debe arrojar error en 404 Not Found cuando la patrulla o delegación no existen', async () => {
    vi.mocked(apiClient.POST).mockResolvedValueOnce({
      data: undefined,
      error: {
        message: 'La patrulla verificadora indicada no fue encontrada.',
      } as unknown as never,
      response: { ok: false, status: 404 } as Response,
    });

    await expect(
      crearEventoPrevencion(mockPayload, DEFAULT_ENCARGADO_ID)
    ).rejects.toThrow('La patrulla verificadora indicada no fue encontrada.');
  });
});

describe('listarEventosPrevencion (HU-76)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockItem: EventoPrevencionListItemDTO = {
    id: 'ev-prev-1',
    codigo: 'PREV-2026-0001',
    nombre: 'Limpieza preventiva canal Angachilla',
    descripcion: 'Despeje de rejillas',
    sector: 'Angachilla',
    direccionTexto: 'Av. Simpson 1234',
    prioridad: 'ALTA',
    estado: 'EN_CURSO',
    latitud: -39.8456,
    longitud: -73.2389,
    ubicacionGeoJson: {
      type: 'Point',
      coordinates: [-73.2389, -39.8456],
    },
    delegacion: {
      id: 'del-sur',
      codigo: 'SUR',
      nombre: 'Delegación Sur',
    },
    puntoCritico: {
      id: 'pc-1',
      codigo: 'PC-ANG-01',
      nombre: 'Humedal Angachilla',
      descripcion: 'Acumulación de sedimentos',
      tipoRiesgo: 'Inundación',
      prioridad: 'ALTA',
      latitud: -39.8456,
      longitud: -73.2389,
      ubicacionGeoJson: {
        type: 'Point',
        coordinates: [-73.2389, -39.8456],
      },
    },
    patrulla: {
      id: 'pat-1',
      nombre: 'Patrulla Rápida Sur',
      estado: 'EN_PREVENCION',
    },
    cuadrilla: null,
    mision: {
      id: 'mis-1',
      codigo: 'MIS-2026-0001',
      titulo: 'Limpieza preventiva canal Angachilla',
      estado: 'EN_EJECUCION',
      tipoMision: 'PREVENCION',
      fechaInicio: '2026-11-19T08:00:00.000Z',
      fechaCierre: null,
    },
    creadoEn: '2026-11-19T07:30:00.000Z',
    actualizadoEn: '2026-11-19T08:00:00.000Z',
  };

  const mockSuccessResponse: ListarEventosPrevencionResponse = {
    message: 'Eventos de prevención listados exitosamente',
    data: [mockItem],
    meta: {
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };

  it('debe listar eventos preventivos exitosamente con parámetros H34', async () => {
    vi.mocked(apiClient.GET).mockResolvedValueOnce({
      data: mockSuccessResponse as unknown as never,
      error: undefined,
      response: { ok: true, status: 200 } as Response,
    });

    const res = await listarEventosPrevencion({
      page: 1,
      limit: 20,
      delegacionId: 'del-sur',
      estado: 'EN_CURSO',
      busqueda: 'Angachilla',
    });

    expect(apiClient.GET).toHaveBeenCalledWith('/api/eventos-atp/prevencion', {
      params: {
        query: {
          page: 1,
          limit: 20,
          delegacionId: 'del-sur',
          estado: 'EN_CURSO',
          busqueda: 'Angachilla',
        },
      },
      headers: {
        Authorization: 'Bearer mock-jwt-token',
      },
    });

    expect(res.data).toHaveLength(1);
    expect(res.data[0].codigo).toBe('PREV-2026-0001');
    expect(res.meta.total).toBe(1);
  });

  it('debe normalizar valores nulos cuando puntoCritico, cuadrilla o patrulla son null', async () => {
    const rawData = [
      {
        id: 'ev-libre-2',
        codigo: 'PREV-2026-0002',
        nombre: 'Evento en coordenadas libres',
        descripcion: null,
        sector: null,
        direccionTexto: null,
        prioridad: 'MEDIA',
        estado: 'PLANIFICADA',
        latitud: -39.82,
        longitud: -73.25,
        delegacion: null,
        puntoCritico: null,
        patrulla: null,
        cuadrilla: null,
        mision: null,
        creadoEn: '2026-11-19T09:00:00.000Z',
        actualizadoEn: '2026-11-19T09:00:00.000Z',
      },
    ];

    vi.mocked(apiClient.GET).mockResolvedValueOnce({
      data: {
        message: 'Eventos listados',
        data: rawData,
        meta: { total: 1, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false },
      } as unknown as never,
      error: undefined,
      response: { ok: true, status: 200 } as Response,
    });

    const res = await listarEventosPrevencion();

    expect(res.data[0].puntoCritico).toBeNull();
    expect(res.data[0].patrulla).toBeNull();
    expect(res.data[0].cuadrilla).toBeNull();
    expect(res.data[0].mision).toBeNull();
  });

  it('debe arrojar PrevencionServiceError en 403 Forbidden cuando falta el permiso prevencion:eventos:leer', async () => {
    vi.mocked(apiClient.GET).mockResolvedValueOnce({
      data: undefined,
      error: {
        message: "Acceso denegado. Se requiere el permiso 'prevencion:eventos:leer'.",
      } as unknown as never,
      response: { ok: false, status: 403 } as Response,
    });

    await expect(listarEventosPrevencion()).rejects.toThrow(
      'Acceso denegado. Se requiere el permiso "prevencion:eventos:leer".'
    );
  });

  it('debe arrojar PrevencionServiceError en 401 Unauthorized cuando el token expira', async () => {
    vi.mocked(apiClient.GET).mockResolvedValueOnce({
      data: undefined,
      error: {
        message: 'Token de sesión inválido o expirado.',
      } as unknown as never,
      response: { ok: false, status: 401 } as Response,
    });

    await expect(listarEventosPrevencion()).rejects.toThrow(
      'Token de sesión inválido o expirado.'
    );
  });

  it('debe arrojar PrevencionServiceError en 400 Bad Request ante parámetros inválidos', async () => {
    vi.mocked(apiClient.GET).mockResolvedValueOnce({
      data: undefined,
      error: {
        message: 'El parámetro delegacionId debe ser un UUID válido.',
      } as unknown as never,
      response: { ok: false, status: 400 } as Response,
    });

    await expect(
      listarEventosPrevencion({ delegacionId: 'invalido' })
    ).rejects.toThrow('El parámetro delegacionId debe ser un UUID válido.');
  });
});

describe('prevencionService - editarEventoPrevencion (HU-77)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const eventoId = '91d99083-b0a4-4a23-a269-1df58dd60dbb';

  it('debe enviar PATCH /api/eventos-atp/prevencion/{id} y retornar el evento actualizado en 200 OK', async () => {
    const mockActualizado = {
      id: eventoId,
      codigo: 'PREV-2026-0001',
      nombre: 'Limpieza urgente de colectores',
      descripcion: 'Despeje prioritario de rejillas antes del frente de lluvia.',
      prioridad: 'CRITICA',
      estado: 'EN_CURSO',
      fechaEstimadaFin: '2026-11-26T20:00:00.000Z',
      actualizadoPorId: DEFAULT_ENCARGADO_ID,
    } as unknown as EventoPrevencionDTO;

    vi.mocked(apiClient.PATCH).mockResolvedValueOnce({
      data: {
        message: 'Evento de prevención actualizado exitosamente.',
        data: mockActualizado,
      } as unknown as never,
      error: undefined,
      response: { ok: true, status: 200 } as Response,
    });

    const resultado = await editarEventoPrevencion(eventoId, {
      descripcion: 'Despeje prioritario de rejillas antes del frente de lluvia.',
      prioridad: 'CRITICA',
      fechaEstimadaFin: '2026-11-26T20:00:00.000Z',
    });

    expect(apiClient.PATCH).toHaveBeenCalledWith('/api/eventos-atp/prevencion/{id}', {
      params: { path: { id: eventoId } },
      body: {
        descripcion: 'Despeje prioritario de rejillas antes del frente de lluvia.',
        prioridad: 'CRITICA',
        fechaEstimadaFin: '2026-11-26T20:00:00.000Z',
      },
      headers: {
        'x-user-id': DEFAULT_ENCARGADO_ID,
        Authorization: 'Bearer mock-jwt-token',
      },
    });
    expect(resultado.prioridad).toBe('CRITICA');
    expect(resultado.fechaEstimadaFin).toBe('2026-11-26T20:00:00.000Z');
  });

  it('debe clasificar 409 Conflict como ESTADO_BLOQUEADO cuando el evento está COMPLETADA o CANCELADA', async () => {
    vi.mocked(apiClient.PATCH).mockResolvedValueOnce({
      data: undefined,
      error: {
        message: 'No se puede editar un evento de prevención en estado COMPLETADA.',
      } as unknown as never,
      response: { ok: false, status: 409 } as Response,
    });

    await expect(
      editarEventoPrevencion(eventoId, { descripcion: 'Nueva descripción de tareas.' })
    ).rejects.toMatchObject({
      statusCode: 409,
      tipoConflicto: 'ESTADO_BLOQUEADO',
      message: 'No se puede editar un evento de prevención en estado COMPLETADA.',
    });
  });

  it('debe clasificar 409 Conflict como STOCK_INSUFICIENTE cuando no hay stock en bodega', async () => {
    vi.mocked(apiClient.PATCH).mockResolvedValueOnce({
      data: undefined,
      error: {
        message: 'Stock insuficiente en bodega para el recurso Sacos de Arena.',
      } as unknown as never,
      response: { ok: false, status: 409 } as Response,
    });

    await expect(
      editarEventoPrevencion(eventoId, {
        recursos: [{ recursoId: 'rec-1', cantidad: 500 }],
      })
    ).rejects.toMatchObject({
      statusCode: 409,
      tipoConflicto: 'STOCK_INSUFICIENTE',
    });
  });

  it('debe arrojar PrevencionServiceError 403 cuando falta el permiso prevencion:eventos:crear', async () => {
    vi.mocked(apiClient.PATCH).mockResolvedValueOnce({
      data: undefined,
      error: { message: 'Forbidden' } as unknown as never,
      response: { ok: false, status: 403 } as Response,
    });

    await expect(
      editarEventoPrevencion(eventoId, { nombre: 'Nuevo nombre válido' })
    ).rejects.toMatchObject({
      statusCode: 403,
      message: 'Acceso denegado. Se requiere el permiso "prevencion:eventos:crear".',
    });
  });
});

describe('prevencionService - obtenerEventoPrevencion y asignarRecursosPrevencion (HU-33)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const eventoId = '80000000-0000-4000-8000-000000000001';
  const patrullaId = '50000000-0000-4000-8000-000000000001';
  const recursoId = '00000000-0000-4000-8000-000000000001';

  it('debe consultar GET /api/eventos-atp/prevencion/{id} y normalizar detalle, misiones y recursos', async () => {
    const rawDetalle = {
      id: eventoId,
      codigo: 'PREV-2026-0001',
      nombre: 'Limpieza preventiva de colectores en Angachilla',
      descripcion: 'Despeje preventivo de rejillas',
      sector: 'Humedal Angachilla',
      direccionTexto: 'Pasaje Los Robles s/n',
      prioridad: 'ALTA' as const,
      estado: 'PLANIFICADA' as const,
      latitud: -39.8456,
      longitud: -73.2389,
      ubicacionGeoJson: { type: 'Point', coordinates: [-73.2389, -39.8456] },
      puntoCritico: {
        id: '40000000-0000-4000-8000-000000000001',
        codigo: 'PC-VAL-001',
        nombre: 'Colector Humedal Angachilla',
        descripcion: 'Zona baja propensa a anegamiento',
        tipoRiesgo: 'Inundación',
        prioridad: 'ALTA' as const,
        latitud: -39.8456,
        longitud: -73.2389,
        ubicacionGeoJson: { type: 'Point', coordinates: [-73.2389, -39.8456] },
      },
      delegacion: { id: '30000000-0000-4000-8000-000000000001', codigo: 'SUR', nombre: 'Delegación Sur' },
      misiones: [
        {
          id: '60000000-0000-4000-8000-000000000001',
          codigo: 'MIS-2026-0045',
          titulo: 'Inspección preventiva',
          estado: 'DESPACHADA',
          tipoMision: 'PREVENCION',
          patrulla: { id: patrullaId, nombre: 'Patrulla Verificadora Alfa', estado: 'EN_PREVENCION' },
          cuadrilla: null,
          fechaInicio: null,
          fechaCierre: null,
          creadoEn: '2026-11-19T12:00:00.000Z',
        },
      ],
      recursosAsignados: [
        {
          id: 'epr-1',
          recursoId,
          nombre: 'Sacos de Arena 25kg',
          esIndividual: false,
          cantidadAsignada: 10,
          misionId: '60000000-0000-4000-8000-000000000001',
          creadoEn: '2026-11-19T12:00:00.000Z',
        },
      ],
      fechaEstimadaFin: null,
      creadoPorId: DEFAULT_ENCARGADO_ID,
      actualizadoPorId: null,
      creadoEn: '2026-11-19T10:00:00.000Z',
      actualizadoEn: '2026-11-19T12:00:00.000Z',
    };

    vi.mocked(apiClient.GET).mockResolvedValueOnce({
      data: { message: 'Detalle obtenido', data: rawDetalle } as unknown as never,
      error: undefined,
      response: { ok: true, status: 200 } as Response,
    });

    const res = await obtenerEventoPrevencion(eventoId);

    expect(apiClient.GET).toHaveBeenCalledWith('/api/eventos-atp/prevencion/{id}', {
      params: { path: { id: eventoId } },
      headers: { Authorization: 'Bearer mock-jwt-token' },
    });
    expect(res.codigo).toBe('PREV-2026-0001');
    expect(res.misiones).toHaveLength(1);
    expect(res.patrulla?.estado).toBe('EN_PREVENCION');
    expect(res.recursosAsignados[0].misionId).toBe('60000000-0000-4000-8000-000000000001');
  });

  it('debe mapear 404 y 403 en obtenerEventoPrevencion', async () => {
    vi.mocked(apiClient.GET).mockResolvedValueOnce({
      data: undefined,
      error: { message: 'Evento no encontrado' } as unknown as never,
      response: { ok: false, status: 404 } as Response,
    });

    await expect(obtenerEventoPrevencion(eventoId)).rejects.toMatchObject({
      statusCode: 404,
      message: 'Evento no encontrado',
    });

    vi.mocked(apiClient.GET).mockResolvedValueOnce({
      data: undefined,
      error: { message: 'Forbidden' } as unknown as never,
      response: { ok: false, status: 403 } as Response,
    });

    await expect(obtenerEventoPrevencion(eventoId)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it('debe enviar POST /api/eventos-atp/prevencion/{id}/recursos y retornar misión PREVENCION y patrulla EN_PREVENCION', async () => {
    const mockAsignacion = {
      message: 'Patrulla y recursos logísticos asignados exitosamente al evento de prevención.',
      data: {
        evento: {
          id: eventoId,
          codigo: 'PREV-2026-0001',
          nombre: 'Limpieza preventiva de colectores en Angachilla',
          estado: 'PLANIFICADA' as const,
        },
        mision: {
          id: '60000000-0000-4000-8000-000000000002',
          codigo: 'MIS-2026-0050',
          titulo: 'Limpieza preventiva de colectores en Angachilla',
          estado: 'DESPACHADA',
          tipoMision: 'PREVENCION',
        },
        patrulla: {
          id: patrullaId,
          nombre: 'Patrulla Verificadora Alfa',
          estado: 'EN_PREVENCION',
        },
        recursos: [
          {
            recursoId,
            nombre: 'Sacos de Arena 25kg',
            esIndividual: false,
            cantidadAsignada: 10,
            cantidadEnUso: 10,
            estadoRecurso: 'DISPONIBLE',
          },
        ],
        asignadoEn: '2026-11-19T21:00:00.000Z',
      },
    };

    vi.mocked(apiClient.POST).mockResolvedValueOnce({
      data: mockAsignacion as unknown as never,
      error: undefined,
      response: { ok: true, status: 200 } as Response,
    });

    const payload = { patrullaId, recursos: [{ recursoId, cantidad: 10 }] };
    const res = await asignarRecursosPrevencion(eventoId, payload);

    expect(apiClient.POST).toHaveBeenCalledWith('/api/eventos-atp/prevencion/{id}/recursos', {
      params: { path: { id: eventoId } },
      body: payload,
      headers: { Authorization: 'Bearer mock-jwt-token' },
    });
    expect(res.data.mision.tipoMision).toBe('PREVENCION');
    expect(res.data.patrulla.estado).toBe('EN_PREVENCION');
    expect(res.data.recursos[0].cantidadEnUso).toBe(10);
  });

  it('debe clasificar correctamente conflictos 409 en asignarRecursosPrevencion', async () => {
    const casos = [
      { msg: 'Stock insuficiente en bodega para el recurso solicitado.', esperado: 'STOCK_INSUFICIENTE' },
      { msg: 'La patrulla seleccionada no está disponible o está ocupada.', esperado: 'PATRULLA_OCUPADA' },
      { msg: 'El activo individual está en mantención o asignado a otra misión.', esperado: 'ACTIVO_NO_DISPONIBLE' },
      { msg: 'El evento de prevención está COMPLETADA y no admite nuevas asignaciones.', esperado: 'EVENTO_CERRADO' },
    ] as const;

    for (const caso of casos) {
      vi.mocked(apiClient.POST).mockResolvedValueOnce({
        data: undefined,
        error: { message: caso.msg } as unknown as never,
        response: { ok: false, status: 409 } as Response,
      });

      await expect(
        asignarRecursosPrevencion(eventoId, { patrullaId, recursos: [{ recursoId, cantidad: 1 }] })
      ).rejects.toMatchObject({
        statusCode: 409,
        tipoConflicto: caso.esperado,
      });
    }
  });

  it('debe mapear 400 (individual != 1), 401, 403 (misiones:asignar) y 404 en asignarRecursosPrevencion', async () => {
    vi.mocked(apiClient.POST).mockResolvedValueOnce({
      data: undefined,
      error: {
        message: 'Activo individual requiere cantidad igual a 1.',
        errors: [{ campo: 'recursos', mensaje: 'Un activo individual solo permite cantidad 1' }],
      } as unknown as never,
      response: { ok: false, status: 400 } as Response,
    });

    try {
      await asignarRecursosPrevencion(eventoId, { patrullaId, recursos: [{ recursoId, cantidad: 2 }] });
      expect.fail('Debió lanzar 400');
    } catch (err) {
      expect(err).toBeInstanceOf(PrevencionServiceError);
      if (err instanceof PrevencionServiceError) {
        expect(err.statusCode).toBe(400);
        expect(err.fieldErrors?.recursos).toContain('cantidad 1');
      }
    }

    vi.mocked(apiClient.POST).mockResolvedValueOnce({
      data: undefined,
      error: { message: 'Forbidden' } as unknown as never,
      response: { ok: false, status: 403 } as Response,
    });

    await expect(
      asignarRecursosPrevencion(eventoId, { patrullaId, recursos: [{ recursoId, cantidad: 1 }] })
    ).rejects.toMatchObject({
      statusCode: 403,
      message: 'No posee el permiso requerido: misiones:asignar. Requiere rol de Encargado o Administrador.',
    });

    vi.mocked(apiClient.POST).mockResolvedValueOnce({
      data: undefined,
      error: { message: 'Recurso no encontrado' } as unknown as never,
      response: { ok: false, status: 404 } as Response,
    });

    await expect(
      asignarRecursosPrevencion(eventoId, { patrullaId, recursos: [{ recursoId, cantidad: 1 }] })
    ).rejects.toMatchObject({
      statusCode: 404,
      message: 'Recurso no encontrado',
    });
  });
});
