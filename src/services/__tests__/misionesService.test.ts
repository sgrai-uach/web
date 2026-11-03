import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { misionesService, despacharCuadrilla } from '../misionesService';
import type { DespacharCuadrillaDTO } from '@/types/misiones';

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
