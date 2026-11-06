import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  obtenerDetalleMision,
  despacharPatrullaVerificadora,
  DEFAULT_ENCARGADO_ID,
} from '../misionesService';
import apiClient from '@/lib/api/client';
import type { MisionDetalleCompleto } from '@/types/misiones';

vi.mock('@/lib/api/client', () => ({
  default: {
    GET: vi.fn(),
  },
}));

describe('Servicio API Misiones (HU-17: Detalle de Misión)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockMisionDetalle: MisionDetalleCompleto = {
    id: 'm1000000-0000-4000-8000-000000000001',
    codigo: 'MIS-2026-0001',
    titulo: 'Despeje de ramas en tendido eléctrico',
    descripcion: 'Poda de seguridad y retiro de escombros en sector Collico',
    tipoMision: 'ATENCION_CUADRILLA',
    estado: 'EN_CURSO',
    prioridad: 'ALTA',
    justificacionRechazo: null,
    fechaInicio: '2026-10-02T14:30:00.000Z',
    fechaCierre: null,
    creadoEn: '2026-10-02T14:00:00.000Z',
    actualizadoEn: '2026-10-02T15:00:00.000Z',
    creadoPor: {
      id: '00000000-0000-4000-8000-000000000003',
      nombre: 'Encargado Emergencias',
      email: 'encargado@valdivia.cl',
    },
    encargado: {
      id: '00000000-0000-4000-8000-000000000003',
      nombre: 'Encargado Emergencias',
      email: 'encargado@valdivia.cl',
    },
    incidente: {
      id: 'i1000000-0000-4000-8000-000000000001',
      codigo: 'INC-2026-0042',
      codigoSeguimiento: '82947102',
      tipoAfectacion: 'Caída de Árbol',
      descripcion: 'Árbol sobre cables eléctricos con riesgo inminente',
      direccion: 'Av. Balmaceda 450, Collico',
      latitud: -39.8142,
      longitud: -73.2459,
      estado: 'EN_ATENCION',
      prioridad: 'ALTA',
      requiereAsistenciaSocial: true,
      delegacionNombre: 'Collico',
    },
    prevencion: null,
    cuadrilla: {
      id: 'c1000000-0000-4000-8000-000000000001',
      nombre: 'Cuadrilla Alfa 1',
      estado: 'EN_MISION',
      delegacionNombre: 'Collico',
      delegado: {
        id: 'u1000000-0000-4000-8000-000000000001',
        nombre: 'Carlos Delegado',
        email: 'carlos@valdivia.cl',
      },
      recursos: [
        {
          id: 'r1000000-0000-4000-8000-000000000001',
          nombre: 'Camioneta Toyota Hilux 4x4',
          tipo: 'VEHICULO',
          cantidadAsignada: 1,
        },
        {
          id: 'r1000000-0000-4000-8000-000000000002',
          nombre: 'Motosierra Stihl MS 382',
          tipo: 'HERRAMIENTA',
          cantidadAsignada: 2,
        },
      ],
    },
    patrulla: null,
    bitacoraTiempos: [
      {
        hito: 'Misión Creada',
        fecha: '2026-10-02',
        hora: '14:00:00',
        timestamp: '2026-10-02T14:00:00.000Z',
        descripcion: 'Planificación y despacho de la cuadrilla Alfa 1',
      },
      {
        hito: 'En Terreno',
        fecha: '2026-10-02',
        hora: '14:30:00',
        timestamp: '2026-10-02T14:30:00.000Z',
        descripcion: 'Cuadrilla llega al lugar e inicia trabajos',
      },
    ],
    reportesTerreno: [
      {
        id: 'rep10000-0000-4000-8000-000000000001',
        misionId: 'm1000000-0000-4000-8000-000000000001',
        evaluador: {
          id: 'u1000000-0000-4000-8000-000000000001',
          nombre: 'Carlos Delegado',
          email: 'carlos@valdivia.cl',
          rut: '12.345.678-9',
        },
        resumenTecnico: 'Árbol de gran tamaño desgajó rama principal sobre cableado.',
        accionesRealizadas: 'Se procedió al corte de ramas con motosierra y despeje de vereda.',
        requiereApoyoAdicional: false,
        danosEstimados: 'Afectación a cable de alumbrado público',
        observaciones: 'Saesa fue notificada para reposición de empalme.',
        personasAfectadas: 0,
        estadoTerreno: 'TRABAJANDO',
        adjuntos: [
          {
            id: 'adj1000-0000-4000-8000-000000000001',
            nombreArchivo: 'evidencia_arbol_1.jpg',
            url: '/uploads/evidencia/evidencia_arbol_1.jpg',
            tipoMime: 'image/jpeg',
            tamanoBytes: 1542000,
            creadoEn: '2026-10-02T14:45:00.000Z',
          },
        ],
        creadoEn: '2026-10-02T14:45:00.000Z',
        actualizadoEn: '2026-10-02T14:45:00.000Z',
      },
    ],
  };

  it('debe consultar /api/misiones/{id} con x-user-id y retornar datos exitosos', async () => {
    vi.mocked(apiClient.GET).mockResolvedValueOnce({
      data: {
        message: 'Detalle de misión obtenido exitosamente.',
        data: mockMisionDetalle,
      },
      error: undefined,
      response: { ok: true, status: 200 } as Response,
    });

    const res = await obtenerDetalleMision('m1000000-0000-4000-8000-000000000001');

    expect(apiClient.GET).toHaveBeenCalledWith(
      '/api/misiones/{id}',
      expect.objectContaining({
        params: {
          path: { id: 'm1000000-0000-4000-8000-000000000001' },
          header: { 'x-user-id': DEFAULT_ENCARGADO_ID },
        },
        headers: { 'x-user-id': DEFAULT_ENCARGADO_ID },
      })
    );

    expect(res.exito).toBe(true);
    expect(res.datos?.codigo).toBe('MIS-2026-0001');
    expect(res.datos?.reportesTerreno).toHaveLength(1);
    expect(res.datos?.cuadrilla?.recursos).toHaveLength(2);
  });

  it('debe manejar error 403 Forbidden indicando falta de permisos de Encargado/Admin', async () => {
    vi.mocked(apiClient.GET).mockResolvedValueOnce({
      data: undefined,
      error: { message: 'Forbidden' },
      response: { ok: false, status: 403 } as Response,
    });

    const res = await obtenerDetalleMision(
      'm1000000-0000-4000-8000-000000000001',
      '00000000-0000-4000-8000-000000000002' // Call Center
    );

    expect(res.exito).toBe(false);
    expect(res.codigoError).toBe(403);
    expect(res.mensaje).toContain('No tienes permisos de Encargado o Administrador');
  });

  it('debe manejar error 404 cuando la misión no existe', async () => {
    vi.mocked(apiClient.GET).mockResolvedValueOnce({
      data: undefined,
      error: { message: 'Not found' },
      response: { ok: false, status: 404 } as Response,
    });

    const res = await obtenerDetalleMision('00000000-0000-4000-8000-999999999999');

    expect(res.exito).toBe(false);
    expect(res.codigoError).toBe(404);
    expect(res.mensaje).toContain('La misión solicitada no existe o fue eliminada.');
  });

  it('debe rechazar identificadores vacíos con código 400 sin consultar la API', async () => {
    const res = await obtenerDetalleMision('   ');

    expect(apiClient.GET).not.toHaveBeenCalled();
    expect(res.exito).toBe(false);
    expect(res.codigoError).toBe(400);
    expect(res.mensaje).toBe('Identificador de misión no válido.');
  });

  it('debe manejar errores de conexión o excepciones en el servidor', async () => {
    vi.mocked(apiClient.GET).mockRejectedValueOnce(new Error('Network error'));

    const res = await obtenerDetalleMision('m1000000-0000-4000-8000-000000000001');

    expect(res.exito).toBe(false);
    expect(res.codigoError).toBe(500);
    expect(res.mensaje).toContain('Error de conexión');
  });
});

describe('Servicio API Misiones (HU-20: Despacho de Patrulla Verificadora)', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
  });

  it('debe rechazar la petición con código 400 si falta incidenteId o patrullaId', async () => {
    const res = await despacharPatrullaVerificadora({
      incidenteId: '',
      patrullaId: 'p-1',
    });

    expect(res.exito).toBe(false);
    expect(res.codigoError).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('debe despachar exitosamente la patrulla (HTTP 201)', async () => {
    const mockResponseData = {
      message: 'Misión de verificación creada y patrulla despachada exitosamente.',
      data: {
        mision: {
          id: 'mis-100',
          codigo: 'MIS-2026-8341',
          titulo: 'Verificación de anegamiento',
          estado: 'DESPACHADA' as const,
          tipoMision: 'VERIFICACION' as const,
        },
        incidente: {
          id: 'inc-100',
          codigo: 'INC-2026-1042',
          estado: 'VERIFICANDO' as const,
        },
        patrulla: {
          id: 'pat-100',
          nombre: 'Patrulla Ánimas Norte 1',
          estado: 'EN_VERIFICACION' as const,
        },
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => mockResponseData,
    });

    const res = await despacharPatrullaVerificadora({
      incidenteId: 'inc-100',
      patrullaId: 'pat-100',
      titulo: 'Verificación de anegamiento',
      prioridad: 'ALTA',
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/misiones',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-user-id': DEFAULT_ENCARGADO_ID,
        }),
        body: JSON.stringify({
          incidenteId: 'inc-100',
          patrullaId: 'pat-100',
          titulo: 'Verificación de anegamiento',
          prioridad: 'ALTA',
        }),
      })
    );
    expect(res.exito).toBe(true);
    expect(res.data?.mision.codigo).toBe('MIS-2026-8341');
    expect(res.data?.incidente.estado).toBe('VERIFICANDO');
    expect(res.data?.patrulla.estado).toBe('EN_VERIFICACION');
  });

  it('debe manejar error 409 Conflict si la patrulla ya fue asignada concurrentemente', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({
        message: 'La patrulla seleccionada ya no se encuentra disponible.',
      }),
    });

    const res = await despacharPatrullaVerificadora({
      incidenteId: 'inc-100',
      patrullaId: 'pat-100',
    });

    expect(res.exito).toBe(false);
    expect(res.esConflicto).toBe(true);
    expect(res.codigoError).toBe(409);
    expect(res.mensaje).toContain('no se encuentra disponible');
  });

  it('debe manejar error 403 Forbidden cuando el usuario carece de permiso misiones:asignar', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({}),
    });

    const res = await despacharPatrullaVerificadora({
      incidenteId: 'inc-100',
      patrullaId: 'pat-100',
    });

    expect(res.exito).toBe(false);
    expect(res.esForbidden).toBe(true);
    expect(res.codigoError).toBe(403);
    expect(res.mensaje).toContain('misiones:asignar');
  });

  it('debe capturar errores de conexión de red', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    const res = await despacharPatrullaVerificadora({
      incidenteId: 'inc-100',
      patrullaId: 'pat-100',
    });

    expect(res.exito).toBe(false);
    expect(res.codigoError).toBe(500);
    expect(res.mensaje).toContain('Error de conexión con el servidor');
  });
});
