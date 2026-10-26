import { describe, it, expect, vi, beforeEach } from 'vitest';
import { patrullasService, DEFAULT_ENCARGADO_ID } from '../patrullasService';
import { catalogosService } from '@/services/catalogosService';
import type { PatrullaVerificadoraDTO } from '@/types/patrullas';

describe('Servicio de Patrullas Verificadoras (HU-16: Visualizar Patrullas)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPatrulla: PatrullaVerificadoraDTO = {
    id: 'f1000000-0000-4000-8000-000000000001',
    nombre: 'Patrulla Rápida Costa-1',
    estado: 'EN_VERIFICACION',
    latitud: -39.86523,
    longitud: -73.39841,
    ultimaActualizacionUbicacion: '2026-10-20T22:00:00.000Z',
    delegacion: {
      id: '30000000-0000-4000-8000-000000000003',
      nombre: 'Costa',
      codigo: 'DEL_COSTA',
    },
    lider: {
      id: '00000000-0000-4000-8000-000000000003',
      nombre: 'Encargado de Operaciones',
      email: 'encargado@valdivia.cl',
      telefono: '+56911112222',
      rut: '33333333-3',
    },
    integrantes: [
      {
        id: 'b1000000-0000-4000-8000-000000000001',
        usuarioId: 'c1000000-0000-4000-8000-000000000001',
        nombre: 'Juan Brigadista',
        cargo: 'Evaluador Rápido',
        rolEnPatrulla: 'OPERATIVO',
        estadoOperativo: 'en_patrulla',
      },
    ],
    misionActiva: {
      id: 'd1000000-0000-4000-8000-000000000001',
      codigo: 'MIS-2026-0001',
      titulo: 'Evaluación preliminar de riesgo',
      tipoMision: 'VERIFICACION',
      estado: 'EN_CURSO',
      prioridad: 'CRITICA',
      incidenteId: 'a1000000-0000-4000-8000-000000000003',
      incidenteCodigo: 'INC-2026-0003',
    },
    creadoEn: '2026-10-20T10:00:00.000Z',
    actualizadoEn: '2026-10-20T22:30:00.000Z',
  };

  it('debe consultar el listado de patrullas exitosamente con parámetros por defecto', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        message: 'Listado obtenido',
        data: [mockPatrulla],
        meta: {
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const resultado = await patrullasService.listar({}, DEFAULT_ENCARGADO_ID);

    expect(resultado.exito).toBe(true);
    expect(resultado.data).toHaveLength(1);
    expect(resultado.data[0].nombre).toBe('Patrulla Rápida Costa-1');
    expect(resultado.meta.total).toBe(1);

    const llamadaUrl = mockFetch.mock.calls[0][0];
    expect(llamadaUrl).toContain('/api/patrullas?');
    expect(llamadaUrl).toContain('page=1');
    expect(llamadaUrl).toContain('limit=20');
  });

  it('debe aplicar filtros de búsqueda, estado y resolver delegación por nombre', async () => {
    vi.spyOn(catalogosService, 'resolverDelegacionId').mockReturnValue('30000000-0000-4000-8000-000000000003');

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: [mockPatrulla],
        meta: { total: 1, page: 2, limit: 10, totalPages: 1, hasNext: false, hasPrev: true },
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const resultado = await patrullasService.listar({
      page: 2,
      limit: 10,
      busqueda: 'Costa',
      estado: 'EN_VERIFICACION',
      delegacion: 'Costa',
    });

    expect(resultado.exito).toBe(true);
    const llamadaUrl = mockFetch.mock.calls[0][0];
    expect(llamadaUrl).toContain('page=2');
    expect(llamadaUrl).toContain('limit=10');
    expect(llamadaUrl).toContain('busqueda=Costa');
    expect(llamadaUrl).toContain('estado=EN_VERIFICACION');
    expect(llamadaUrl).toContain('delegacionId=30000000-0000-4000-8000-000000000003');
  });

  it('debe retornar esForbidden=true cuando la API responde con 403 Forbidden', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ message: 'No tiene permiso misiones:leer' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const resultado = await patrullasService.listar();

    expect(resultado.exito).toBe(false);
    expect(resultado.esForbidden).toBe(true);
    expect(resultado.codigoError).toBe(403);
    expect(resultado.data).toEqual([]);
    expect(resultado.mensaje).toContain('misiones:leer');
  });

  it('debe manejar errores de red capturados en catch y retornar error 500 controlado', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Fallo de red'));
    vi.stubGlobal('fetch', mockFetch);

    const resultado = await patrullasService.listar();

    expect(resultado.exito).toBe(false);
    expect(resultado.codigoError).toBe(500);
    expect(resultado.mensaje).toContain('Error de conexión');
  });

  it('debe obtener el detalle unitario de una patrulla por ID', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: mockPatrulla,
        message: 'Patrulla obtenida',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const resultado = await patrullasService.obtenerPorId('f1000000-0000-4000-8000-000000000001');

    expect(resultado.exito).toBe(true);
    expect(resultado.data?.id).toBe('f1000000-0000-4000-8000-000000000001');
    expect(mockFetch.mock.calls[0][0]).toContain('/api/patrullas/f1000000-0000-4000-8000-000000000001');
  });

  it('debe validar el ID al obtener por ID y retornar 400 si está vacío', async () => {
    const resultado = await patrullasService.obtenerPorId('   ');
    expect(resultado.exito).toBe(false);
    expect(resultado.codigoError).toBe(400);
  });

  describe('patrullasService.crear (HU-83)', () => {
    const mockPayload = {
      codigo: 'PV-NORTE-01',
      nombre: 'Patrulla Rápida Norte 1',
      delegacionId: '30000000-0000-4000-8000-000000000001',
      vehiculoId: 'e1000000-0000-4000-8000-000000000002',
      personalIds: ['b1000000-0000-4000-8000-000000000001'],
      usuarioLiderId: 'b1000000-0000-4000-8000-000000000001',
    };

    it('debe registrar una patrulla exitosamente (201 Created)', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({
          message: 'Patrulla verificadora registrada exitosamente.',
          data: {
            ...mockPatrulla,
            codigo: 'PV-NORTE-01',
            nombre: 'Patrulla Rápida Norte 1',
            estado: 'DISPONIBLE',
          },
        }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const res = await patrullasService.crear(mockPayload, DEFAULT_ENCARGADO_ID);

      expect(res.exito).toBe(true);
      expect(res.data?.codigo).toBe('PV-NORTE-01');
      expect(res.data?.estado).toBe('DISPONIBLE');
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/patrullas',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockPayload),
        })
      );
    });

    it('debe manejar error de código duplicado (409 Conflict)', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({
          message: 'Ya existe una patrulla registrada con el código PV-NORTE-01.',
        }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const res = await patrullasService.crear(mockPayload);

      expect(res.exito).toBe(false);
      expect(res.esConflicto).toBe(true);
      expect(res.codigoError).toBe(409);
      expect(res.mensaje).toContain('PV-NORTE-01');
    });

    it('debe manejar error de permisos insuficientes (403 Forbidden)', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
      });
      vi.stubGlobal('fetch', mockFetch);

      const res = await patrullasService.crear(mockPayload);

      expect(res.exito).toBe(false);
      expect(res.esForbidden).toBe(true);
      expect(res.codigoError).toBe(403);
      expect(res.mensaje).toContain('recursos:crear');
    });

    it('debe manejar error de validación de campos (400 Bad Request)', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          message: 'Parámetros inválidos.',
          errors: [{ campo: 'codigo', mensaje: 'El código identificador es obligatorio.' }],
        }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const res = await patrullasService.crear({ ...mockPayload, codigo: '' });

      expect(res.exito).toBe(false);
      expect(res.codigoError).toBe(400);
      expect(res.erroresValidacion?.length).toBe(1);
      expect(res.erroresValidacion?.[0].campo).toBe('codigo');
    });

    it('debe capturar errores de red o excepciones (500)', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
      vi.stubGlobal('fetch', mockFetch);

      const res = await patrullasService.crear(mockPayload);

      expect(res.exito).toBe(false);
      expect(res.codigoError).toBe(500);
      expect(res.mensaje).toContain('Error de conexión');
    });
  });

  describe('Edición de Patrulla Verificadora (HU-84: PUT /api/patrullas/:id)', () => {
    const patrullaId = 'f1000000-0000-4000-8000-000000000001';
    const mockEditPayload = {
      nombre: 'Patrulla Costa 01 - Reforzada',
      delegacionId: '30000000-0000-4000-8000-000000000003',
      vehiculoId: 'e1000000-0000-4000-8000-000000000005',
      personalIds: ['b1000000-0000-4000-8000-000000000001'],
      usuarioLiderId: 'c1000000-0000-4000-8000-000000000001',
    };

    it('debe validar que el identificador de patrulla no esté vacío', async () => {
      const res = await patrullasService.editar('', mockEditPayload);
      expect(res.exito).toBe(false);
      expect(res.codigoError).toBe(400);
      expect(res.mensaje).toContain('no válido');
    });

    it('debe modificar exitosamente una patrulla verificadora (200 OK)', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          message: 'Patrulla verificadora modificada exitosamente.',
          data: {
            ...mockPatrulla,
            nombre: 'Patrulla Costa 01 - Reforzada',
            actualizadoEn: '2026-10-26T12:00:00.000Z',
          },
        }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const res = await patrullasService.editar(patrullaId, mockEditPayload, DEFAULT_ENCARGADO_ID);

      expect(res.exito).toBe(true);
      expect(res.data?.nombre).toBe('Patrulla Costa 01 - Reforzada');
      expect(res.mensaje).toContain('modificada exitosamente');

      const urlLlamada = mockFetch.mock.calls[0][0];
      const opciones = mockFetch.mock.calls[0][1];
      expect(urlLlamada).toBe(`/api/patrullas/${patrullaId}`);
      expect(opciones.method).toBe('PUT');
      expect(opciones.headers['Content-Type']).toBe('application/json');
      expect(opciones.headers['x-user-id']).toBe(DEFAULT_ENCARGADO_ID);
      expect(JSON.parse(opciones.body)).toEqual(mockEditPayload);
    });

    it('debe bloquear la modificación ante estado EN_VERIFICACION o misión activa (409 Conflict)', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({
          message:
            'No es posible modificar la patrulla verificadora mientras se encuentre en misión activa o en verificación.',
        }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const res = await patrullasService.editar(patrullaId, mockEditPayload);

      expect(res.exito).toBe(false);
      expect(res.esConflicto).toBe(true);
      expect(res.codigoError).toBe(409);
      expect(res.mensaje).toContain('No es posible modificar');
    });

    it('debe manejar denegación por falta de permisos (403 Forbidden)', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({
          message: 'Forbidden',
        }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const res = await patrullasService.editar(patrullaId, mockEditPayload);

      expect(res.exito).toBe(false);
      expect(res.esForbidden).toBe(true);
      expect(res.codigoError).toBe(403);
      expect(res.mensaje).toContain('recursos:editar');
    });

    it('debe manejar error 404 cuando la patrulla no existe', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({
          message: 'Patrulla no encontrada.',
        }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const res = await patrullasService.editar(patrullaId, mockEditPayload);

      expect(res.exito).toBe(false);
      expect(res.codigoError).toBe(404);
      expect(res.mensaje).toBe('Patrulla no encontrada.');
    });

    it('debe procesar errores de validación de campos (400 Bad Request)', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          message: 'Datos inválidos.',
          errors: [{ campo: 'personalIds', mensaje: 'Debe asignar al menos un funcionario.' }],
        }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const res = await patrullasService.editar(patrullaId, { ...mockEditPayload, personalIds: [] });

      expect(res.exito).toBe(false);
      expect(res.codigoError).toBe(400);
      expect(res.erroresValidacion?.length).toBe(1);
      expect(res.erroresValidacion?.[0].campo).toBe('personalIds');
    });

    it('debe capturar errores de red o excepciones (500)', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
      vi.stubGlobal('fetch', mockFetch);

      const res = await patrullasService.editar(patrullaId, mockEditPayload);

      expect(res.exito).toBe(false);
      expect(res.codigoError).toBe(500);
      expect(res.mensaje).toContain('Error de conexión');
    });
  });
});

