import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  misionesService,
  despacharCuadrilla,
  despacharPatrullaVerificadora,
  DEFAULT_ENCARGADO_ID,
} from '../misionesService';
import apiClient from '@/lib/api/client';
import type { DespacharCuadrillaDTO } from '@/types/misiones';

vi.mock('@/lib/api/client', () => ({
  default: {
    GET: vi.fn(),
    POST: vi.fn(),
  },
}));

describe('misionesService - despacho de cuadrillas y liberación atómica (HU-21 / Regla ICS §3.2)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const mockPayload: DespacharCuadrillaDTO = {
    tipoMision: 'ATENCION_CUADRILLA',
    incidenteId: 'i1000000-0000-4000-8000-000000000001',
    cuadrillaId: 'c1000000-0000-4000-8000-000000000001',
    titulo: 'Atención táctica de inundación',
    descripcion: 'Despeje de sumidero',
    prioridad: 'ALTA',
  };

  it('despacha cuadrilla exitosamente y releva a la patrulla previa devolviéndola en DISPONIBLE', async () => {
    const mockRespuestaApi = {
      message:
        "Cuadrilla 'Cuadrilla Vías 1' asignada exitosamente. La patrulla verificadora previa ha sido liberada a estado DISPONIBLE.",
      data: {
        mision: {
          id: 'm-nueva-uuid',
          codigo: 'MIS-2026-0099',
          tipoMision: 'ATENCION_CUADRILLA',
          estado: 'DESPACHADA',
          fechaInicio: null,
        },
        cuadrilla: {
          id: 'c1000000-0000-4000-8000-000000000001',
          nombre: 'Cuadrilla Vías 1',
          estado: 'EN_MISION',
        },
        incidente: {
          id: 'i1000000-0000-4000-8000-000000000001',
          codigo: 'INC-2026-0042',
          estado: 'EN_ATENCION',
          prioridad: 'ALTA',
        },
        patrullaLiberada: {
          id: 'pat-01',
          nombre: 'Patrulla Rápida 1',
          estado: 'DISPONIBLE',
          misionPreviaId: 'm-verif-uuid',
        },
        hitoCuadrilla: {
          hito: 'CUADRILLA_DESPACHADA',
          descripcion: 'Cuadrilla despachada a terreno para resolución táctica del incidente',
        },
        hitoPatrulla: {
          hito: 'VERIFICACION_FINALIZADA',
          descripcion: 'Misión de verificación concluida automáticamente por asignación y relevo de cuadrilla operativa',
        },
      },
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => mockRespuestaApi,
    });

    const resultado = await despacharCuadrilla(mockPayload, 'user-encargado', 'mock-token');

    expect(resultado.exito).toBe(true);
    expect(resultado.datos?.patrullaLiberada).toBeDefined();
    expect(resultado.datos?.patrullaLiberada?.estado).toBe('DISPONIBLE');
    expect(resultado.datos?.cuadrilla.estado).toBe('EN_MISION');
    expect(resultado.datos?.incidente.estado).toBe('EN_ATENCION');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/misiones'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-User-Id': 'user-encargado',
          Authorization: 'Bearer mock-token',
        }),
        body: JSON.stringify(mockPayload),
      })
    );
  });

  it('despacha cuadrilla exitosamente en asignación directa sin patrulla previa (patrullaLiberada: null)', async () => {
    const mockRespuestaSinPatrulla = {
      message: 'Cuadrilla asignada exitosamente.',
      data: {
        mision: {
          id: 'm-directa',
          codigo: 'MIS-2026-0100',
          tipoMision: 'ATENCION_CUADRILLA',
          estado: 'DESPACHADA',
          fechaInicio: null,
        },
        cuadrilla: {
          id: 'c1000000-0000-4000-8000-000000000001',
          nombre: 'Cuadrilla Vías 1',
          estado: 'EN_MISION',
        },
        incidente: {
          id: 'i1000000-0000-4000-8000-000000000001',
          codigo: 'INC-2026-0042',
          estado: 'EN_ATENCION',
          prioridad: 'ALTA',
        },
        patrullaLiberada: null,
      },
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => mockRespuestaSinPatrulla,
    });

    const resultado = await misionesService.despacharCuadrilla(mockPayload);

    expect(resultado.exito).toBe(true);
    expect(resultado.datos?.patrullaLiberada).toBeNull();
    expect(resultado.datos?.incidente.estado).toBe('EN_ATENCION');
  });

  it('maneja rechazo 409 Conflict si la verificación técnica en terreno aún no ha finalizado', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({
        statusCode: 409,
        codigo: 'VERIFICACION_EN_CURSO',
        message: 'No es posible despachar una cuadrilla operativa: la patrulla verificadora aún se encuentra en terreno evaluando el incidente.',
      }),
    });

    const resultado = await despacharCuadrilla(mockPayload);

    expect(resultado.exito).toBe(false);
    expect(resultado.codigoError).toBe(409);
    expect(resultado.codigo).toBe('VERIFICACION_EN_CURSO');
    expect(resultado.mensaje).toContain('patrulla verificadora aún se encuentra en terreno');
  });

  it('maneja error 403 Forbidden cuando el usuario carece del permiso misiones:asignar', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({
        message: 'Permiso insuficiente. Requiere misiones:asignar.',
      }),
    });

    const resultado = await despacharCuadrilla(mockPayload);

    expect(resultado.exito).toBe(false);
    expect(resultado.codigoError).toBe(403);
    expect(resultado.mensaje).toContain('misiones:asignar');
  });

  it('maneja error de conexión con el servidor gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network failure'));

    const resultado = await despacharCuadrilla(mockPayload);

    expect(resultado.exito).toBe(false);
    expect(resultado.codigoError).toBe(500);
    expect(resultado.mensaje).toContain('Error de conexión');
  });
});

describe('Servicio API Misiones (HU-20: Despacho de Patrulla Verificadora)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe rechazar la petición con código 400 si falta incidenteId o patrullaId', async () => {
    const res = await despacharPatrullaVerificadora({
      incidenteId: '',
      patrullaId: 'p-1',
    });

    expect(res.exito).toBe(false);
    expect(res.codigoError).toBe(400);
    expect(apiClient.POST).not.toHaveBeenCalled();
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

    vi.mocked(apiClient.POST).mockResolvedValueOnce({
      data: mockResponseData,
      error: undefined,
      response: { ok: true, status: 201 } as Response,
    });

    const res = await despacharPatrullaVerificadora({
      incidenteId: 'inc-100',
      patrullaId: 'pat-100',
      tipoMision: 'VERIFICACION',
      titulo: 'Verificación de anegamiento',
      prioridad: 'ALTA',
    });

    expect(apiClient.POST).toHaveBeenCalledWith(
      '/api/misiones',
      expect.objectContaining({
        body: expect.objectContaining({
          incidenteId: 'inc-100',
          patrullaId: 'pat-100',
          tipoMision: 'VERIFICACION',
          titulo: 'Verificación de anegamiento',
          prioridad: 'ALTA',
        }),
        params: expect.objectContaining({
          header: expect.objectContaining({
            'x-user-id': DEFAULT_ENCARGADO_ID,
          }),
        }),
      })
    );
    expect(res.exito).toBe(true);
    expect(res.data?.mision.codigo).toBe('MIS-2026-8341');
    expect(res.data?.incidente.estado).toBe('VERIFICANDO');
    expect(res.data?.patrulla?.estado).toBe('EN_VERIFICACION');
  });

  it('debe manejar error 409 Conflict si la patrulla ya fue asignada concurrentemente', async () => {
    vi.mocked(apiClient.POST).mockResolvedValueOnce({
      data: undefined,
      error: { message: 'La patrulla seleccionada ya no se encuentra disponible.' },
      response: { ok: false, status: 409 } as Response,
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
    vi.mocked(apiClient.POST).mockResolvedValueOnce({
      data: undefined,
      error: { message: 'No cuenta con el permiso requerido (misiones:asignar)' },
      response: { ok: false, status: 403 } as Response,
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
    vi.mocked(apiClient.POST).mockRejectedValueOnce(new Error('Network error'));

    const res = await despacharPatrullaVerificadora({
      incidenteId: 'inc-100',
      patrullaId: 'pat-100',
    });

    expect(res.exito).toBe(false);
    expect(res.codigoError).toBe(500);
    expect(res.mensaje).toContain('Error de conexión con el servidor');
  });
});
