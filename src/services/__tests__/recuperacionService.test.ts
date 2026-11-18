import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  crearEventoRecuperacion,
  listarOperativosRecuperacion,
  obtenerDetalleOperativoRecuperacion,
  editarOperativoRecuperacion,
  RecuperacionServiceError,
} from '../recuperacionService';
import apiClient from '@/lib/api/client';
import { DEFAULT_ENCARGADO_ID } from '@/services/incidentesService';
import type {
  CrearEventoRecuperacionInput,
  EventoRecuperacionResponse,
} from '@/types/recuperacion';

vi.mock('@/lib/api/client', () => ({
  default: {
    POST: vi.fn(),
    GET: vi.fn(),
    PATCH: vi.fn(),
  },
}));

describe('recuperacionService (HU-29)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockInput: CrearEventoRecuperacionInput = {
    nombre: 'Entrega de planchas de zinc y frazadas',
    descripcion: 'Familias afectadas por anegamiento',
    sector: 'Collico',
    direccionTexto: 'Pasaje Los Cipreses 450',
    prioridad: 'ALTA',
    contactoNombre: 'Sra. María González (JJVV)',
    contactoTelefono: '+56987654321',
    latitud: -39.8142,
    longitud: -73.2459,
    delegacionId: '30000000-0000-4000-8000-000000000001',
    patrullaId: 'f1000000-0000-4000-8000-000000000002',
    familiasAfectadas: 3,
    recursos: [
      {
        recursoId: 'e1000000-0000-4000-8000-000000000004',
        cantidad: 10,
      },
    ],
  };

  const mockResponseData: EventoRecuperacionResponse = {
    id: '7a35b120-1a2b-4c3d-8e4f-0123456789ab',
    codigo: 'REC-2026-0001',
    nombre: 'Entrega de planchas de zinc y frazadas',
    descripcion: 'Familias afectadas por anegamiento',
    sector: 'Collico',
    direccionTexto: 'Pasaje Los Cipreses 450',
    prioridad: 'ALTA',
    contactoNombre: 'Sra. María González (JJVV)',
    contactoTelefono: '+56987654321',
    latitud: -39.8142,
    longitud: -73.2459,
    estado: 'PLANIFICADA',
    familiasAfectadas: 3,
    delegacion: {
      id: '30000000-0000-4000-8000-000000000001',
      codigo: 'DEL-SUR',
      nombre: 'Delegación Municipal Sur',
    },
    mision: {
      id: '6b45c230-2b3c-4d5e-9f0a-1234567890bc',
      codigo: 'MIS-2026-0001',
      titulo: 'Entrega de planchas de zinc y frazadas',
      estado: 'DESPACHADA',
      tipoMision: 'RECUPERACION',
    },
    patrulla: {
      id: 'f1000000-0000-4000-8000-000000000002',
      nombre: 'Patrulla Rápida Centro-Sur',
      estado: 'EN_RECUPERACION',
    },
    recursos: [
      {
        recursoId: 'e1000000-0000-4000-8000-000000000004',
        nombre: 'Sacos de Arena 25kg',
        cantidadAsignada: 10,
      },
    ],
    creadoPorId: DEFAULT_ENCARGADO_ID,
    creadoEn: '2026-10-04T22:30:00.000Z',
    actualizadoEn: '2026-10-04T22:30:00.000Z',
  };

  it('debe registrar un evento de recuperación exitosamente en 201 Created', async () => {
    vi.mocked(apiClient.POST).mockResolvedValueOnce({
      data: {
        message: 'Evento de recuperación registrado y patrulla despachada exitosamente.',
        data: mockResponseData,
      } as unknown as never,
      error: undefined,
      response: { ok: true, status: 201 } as Response,
    });

    const resultado = await crearEventoRecuperacion(mockInput, DEFAULT_ENCARGADO_ID);

    expect(apiClient.POST).toHaveBeenCalledWith('/api/eventos-atp/recuperacion', {
      params: {
        header: { 'x-user-id': DEFAULT_ENCARGADO_ID },
      },
      body: mockInput,
    });
    expect(resultado).toEqual(mockResponseData);
    expect(resultado.codigo).toBe('REC-2026-0001');
    expect(resultado.patrulla.estado).toBe('EN_RECUPERACION');
  });

  it('debe arrojar RecuperacionServiceError con tipoConflicto PATRULLA_OCUPADA en 409 Conflict', async () => {
    vi.mocked(apiClient.POST).mockResolvedValueOnce({
      data: undefined,
      error: {
        message: 'La patrulla "Patrulla Rápida Costa-1" no está disponible para asignación (estado actual: EN_VERIFICACION).',
      } as unknown as never,
      response: { ok: false, status: 409 } as Response,
    });

    try {
      await crearEventoRecuperacion(mockInput, DEFAULT_ENCARGADO_ID);
      expect.fail('Debería haber lanzado RecuperacionServiceError');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(RecuperacionServiceError);
      if (err instanceof RecuperacionServiceError) {
        expect(err.statusCode).toBe(409);
        expect(err.tipoConflicto).toBe('PATRULLA_OCUPADA');
        expect(err.message).toContain('no está disponible para asignación');
      }
    }
  });

  it('debe arrojar RecuperacionServiceError con tipoConflicto STOCK_INSUFICIENTE en 409 Conflict', async () => {
    vi.mocked(apiClient.POST).mockResolvedValueOnce({
      data: undefined,
      error: {
        message: 'Stock insuficiente para el recurso "Sacos de Arena 25kg". Solicitado: 500, Disponible: 200.',
      } as unknown as never,
      response: { ok: false, status: 409 } as Response,
    });

    try {
      await crearEventoRecuperacion(mockInput, DEFAULT_ENCARGADO_ID);
      expect.fail('Debería haber lanzado RecuperacionServiceError');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(RecuperacionServiceError);
      if (err instanceof RecuperacionServiceError) {
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
        message: 'Datos de entrada inválidos',
        errors: [
          { campo: 'nombre', mensaje: 'El título debe tener al menos 3 caracteres' },
          { campo: 'recursos', mensaje: 'Debe ingresar al menos un recurso' },
        ],
      } as unknown as never,
      response: { ok: false, status: 400 } as Response,
    });

    try {
      await crearEventoRecuperacion(mockInput, DEFAULT_ENCARGADO_ID);
      expect.fail('Debería haber lanzado error 400');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(RecuperacionServiceError);
      if (err instanceof RecuperacionServiceError) {
        expect(err.statusCode).toBe(400);
        expect(err.fieldErrors).toBeDefined();
        expect(err.fieldErrors?.nombre).toBe('El título debe tener al menos 3 caracteres');
        expect(err.fieldErrors?.recursos).toBe('Debe ingresar al menos un recurso');
      }
    }
  });

  it('debe arrojar error específico de permisos en 403 Forbidden', async () => {
    vi.mocked(apiClient.POST).mockResolvedValueOnce({
      data: undefined,
      error: {
        message: 'No posee el permiso requerido: recuperacion:crear',
      } as unknown as never,
      response: { ok: false, status: 403 } as Response,
    });

    await expect(
      crearEventoRecuperacion(mockInput, 'callcenter-uuid')
    ).rejects.toThrow('No posee el permiso requerido: recuperacion:crear');
  });

  it('debe arrojar error en 404 Not Found cuando la patrulla o recurso no existen', async () => {
    vi.mocked(apiClient.POST).mockResolvedValueOnce({
      data: undefined,
      error: {
        message: 'La patrulla verificadora indicada no fue encontrada.',
      } as unknown as never,
      response: { ok: false, status: 404 } as Response,
    });

    await expect(
      crearEventoRecuperacion(mockInput, DEFAULT_ENCARGADO_ID)
    ).rejects.toThrow('La patrulla verificadora indicada no fue encontrada.');
  });
});

describe('recuperacionService (HU-73)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('listarOperativosRecuperacion debe enviar filtros limpios y retornar data + meta H34', async () => {
    const mockLista = {
      data: [
        {
          id: 'e4f8b9a1-0000-4000-8000-000000000001',
          codigo: 'REC-2026-0001',
          nombre: 'Entrega de Materiales y Remoción',
          descripcion: 'Operativo de entrega de planchas',
          estado: 'EN_EJECUCION',
          prioridad: 'ALTA',
          sector: 'Sector Niebla Alto',
          direccionTexto: null,
          familiasAfectadas: 4,
          creadoEn: '2026-11-14T02:00:00.000Z',
          actualizadoEn: '2026-11-14T02:30:00.000Z',
          fechaCierre: null,
          delegacion: { id: 'a0000000-0000-4000-8000-000000000001', codigo: 'COSTA', nombre: 'Delegación de la Costa' },
          cantidadInsumosAsignados: 130,
          totalTiposInsumos: 2,
          recursosResumen: [{ recursoId: 'r-1', nombre: 'Planchas de Zinc', cantidadAsignada: 120 }],
        },
      ],
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };

    const mockGet = vi.mocked((apiClient as unknown as { GET: ReturnType<typeof vi.fn> }).GET);
    mockGet.mockResolvedValueOnce({
      data: mockLista,
      error: undefined,
      response: { ok: true, status: 200 } as Response,
    });

    const result = await listarOperativosRecuperacion({
      page: 1,
      limit: 10,
      estado: 'EN_EJECUCION',
      busqueda: '  REC-2026  ',
    });

    expect(mockGet).toHaveBeenCalledWith('/api/eventos-atp/recuperacion', {
      params: {
        query: {
          page: 1,
          limit: 10,
          estado: 'EN_EJECUCION',
          busqueda: 'REC-2026',
        },
      },
    });
    expect(result).toEqual(mockLista);
  });

  it('listarOperativosRecuperacion debe lanzar RecuperacionServiceError 403 si falta recuperacion:leer', async () => {
    const mockGet = vi.mocked((apiClient as unknown as { GET: ReturnType<typeof vi.fn> }).GET);
    mockGet.mockResolvedValueOnce({
      data: undefined,
      error: { message: 'Forbidden' },
      response: { ok: false, status: 403 } as Response,
    });

    await expect(listarOperativosRecuperacion()).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it('obtenerDetalleOperativoRecuperacion debe retornar el detalle del operativo', async () => {
    const mockDetalle = {
      id: 'e4f8b9a1-0000-4000-8000-000000000001',
      codigo: 'REC-2026-0001',
      nombre: 'Entrega de Materiales y Remoción',
      descripcion: 'Operativo de entrega de planchas',
      estado: 'EN_EJECUCION',
      prioridad: 'ALTA',
      sector: 'Sector Niebla Alto',
      direccionTexto: null,
      contactoNombre: null,
      contactoTelefono: null,
      latitud: -39.8142,
      longitud: -73.2459,
      familiasAfectadas: 4,
      creadoEn: '2026-11-14T02:00:00.000Z',
      actualizadoEn: '2026-11-14T02:30:00.000Z',
      fechaCierre: null,
      observacionesCierre: null,
      creadoPor: { id: 'u1', nombre: 'Juan Pérez' },
      delegacion: { id: 'd1', codigo: 'COSTA', nombre: 'Delegación de la Costa' },
      recursos: [],
      cantidadInsumosAsignados: 0,
      totalTiposInsumos: 0,
      mision: null,
      patrulla: null,
      historial: [],
    };

    const mockGet = vi.mocked((apiClient as unknown as { GET: ReturnType<typeof vi.fn> }).GET);
    mockGet.mockResolvedValueOnce({
      data: { data: mockDetalle },
      error: undefined,
      response: { ok: true, status: 200 } as Response,
    });

    const result = await obtenerDetalleOperativoRecuperacion('e4f8b9a1-0000-4000-8000-000000000001');
    expect(result).toEqual(mockDetalle);
  });

  it('obtenerDetalleOperativoRecuperacion debe lanzar RecuperacionServiceError 404 si no existe', async () => {
    const mockGet = vi.mocked((apiClient as unknown as { GET: ReturnType<typeof vi.fn> }).GET);
    mockGet.mockResolvedValueOnce({
      data: undefined,
      error: { message: 'Operativo no encontrado' },
      response: { ok: false, status: 404 } as Response,
    });

    await expect(
      obtenerDetalleOperativoRecuperacion('no-existe')
    ).rejects.toMatchObject({
      statusCode: 404,
      message: 'Operativo no encontrado',
    });
  });
});

describe('recuperacionService (HU-74: editarOperativoRecuperacion)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const operativoId = 'e4f8b9a1-0000-4000-8000-000000000001';

  it('debe retornar 200 OK con el operativo actualizado cuando PATCH es exitoso', async () => {
    const mockPatch = vi.mocked(
      (apiClient as unknown as { PATCH: ReturnType<typeof vi.fn> }).PATCH
    );
    const mockResponseData = {
      message: 'Planificación actualizada.',
      data: {
        id: operativoId,
        codigo: 'REC-2026-0001',
        nombre: 'Operativo Collico',
        descripcion: 'Nueva descripción operativa',
        sector: 'Collico',
        direccionTexto: null,
        prioridad: 'ALTA',
        contactoNombre: null,
        contactoTelefono: null,
        latitud: -39.8142,
        longitud: -73.2459,
        estado: 'EN_EJECUCION',
        familiasAfectadas: 4,
        delegacion: null,
        mision: {
          id: 'm1',
          codigo: 'MIS-2026-0001',
          titulo: 'Operativo Collico',
          estado: 'DESPACHADA',
          tipoMision: 'RECUPERACION',
        },
        patrulla: {
          id: 'p2',
          nombre: 'Patrulla Costa-2',
          estado: 'EN_RECUPERACION',
        },
        recursos: [
          {
            recursoId: '80000000-0000-4000-8000-000000000001',
            nombre: 'Kit Techumbre',
            cantidadAsignada: 12,
          },
        ],
        creadoPorId: DEFAULT_ENCARGADO_ID,
        fechaEstimadaFin: '2026-11-20T18:00:00.000Z',
        actualizadoPorId: DEFAULT_ENCARGADO_ID,
        creadoEn: '2026-11-18T01:00:00.000Z',
        actualizadoEn: '2026-11-18T03:00:00.000Z',
      },
    };

    mockPatch.mockResolvedValueOnce({
      data: mockResponseData,
      error: undefined,
      response: { ok: true, status: 200 } as Response,
    });

    const result = await editarOperativoRecuperacion(operativoId, {
      descripcion: 'Nueva descripción operativa',
      patrullaId: 'p2',
    });

    expect(mockPatch).toHaveBeenCalledWith('/api/eventos-atp/recuperacion/{id}', {
      params: {
        path: { id: operativoId },
        header: { 'x-user-id': DEFAULT_ENCARGADO_ID },
      },
      body: {
        descripcion: 'Nueva descripción operativa',
        patrullaId: 'p2',
      },
    });
    expect(result).toEqual(mockResponseData);
  });

  it('debe lanzar RecuperacionServiceError 409 ESTADO_BLOQUEADO en operativo COMPLETADA o CANCELADA', async () => {
    const mockPatch = vi.mocked(
      (apiClient as unknown as { PATCH: ReturnType<typeof vi.fn> }).PATCH
    );

    mockPatch.mockResolvedValueOnce({
      data: undefined,
      error: {
        message: 'No se puede editar un operativo en estado COMPLETADA.',
      },
      response: { ok: false, status: 409 } as Response,
    });

    await expect(
      editarOperativoRecuperacion(operativoId, { descripcion: 'Intento de edición' })
    ).rejects.toMatchObject({
      statusCode: 409,
      tipoConflicto: 'ESTADO_BLOQUEADO',
      message: 'No se puede editar un operativo en estado COMPLETADA.',
    });
  });

  it('debe lanzar RecuperacionServiceError 409 STOCK_INSUFICIENTE cuando falta stock en bodega', async () => {
    const mockPatch = vi.mocked(
      (apiClient as unknown as { PATCH: ReturnType<typeof vi.fn> }).PATCH
    );

    mockPatch.mockResolvedValueOnce({
      data: undefined,
      error: {
        message: 'Stock insuficiente en bodega para el recurso solicitado.',
      },
      response: { ok: false, status: 409 } as Response,
    });

    await expect(
      editarOperativoRecuperacion(operativoId, {
        recursos: [{ recursoId: '80000000-0000-4000-8000-000000000001', cantidad: 999 }],
      })
    ).rejects.toMatchObject({
      statusCode: 409,
      tipoConflicto: 'STOCK_INSUFICIENTE',
    });
  });

  it('debe lanzar RecuperacionServiceError 403 cuando falta el permiso recuperacion:editar', async () => {
    const mockPatch = vi.mocked(
      (apiClient as unknown as { PATCH: ReturnType<typeof vi.fn> }).PATCH
    );

    mockPatch.mockResolvedValueOnce({
      data: undefined,
      error: { message: 'Forbidden' },
      response: { ok: false, status: 403 } as Response,
    });

    await expect(
      editarOperativoRecuperacion(operativoId, { descripcion: 'Cambio' })
    ).rejects.toMatchObject({
      statusCode: 403,
      message: expect.stringContaining('recuperacion:editar'),
    });
  });
});
