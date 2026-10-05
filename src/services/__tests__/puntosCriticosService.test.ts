import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getPuntosCriticos,
  crearPuntoCritico,
  PuntoCriticoServiceError,
  filtrarPuntosCriticosMock,
  PUNTOS_CRITICOS_MOCK,
} from '../puntosCriticosService';
import apiClient from '@/lib/api/client';
import type { CrearPuntoCriticoInput } from '@/types/puntoCritico';

describe('puntosCriticosService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe filtrar correctamente los datos mock locales por búsqueda insensible a mayúsculas', () => {
    const res = filtrarPuntosCriticosMock({
      pagina: 1,
      limite: 10,
      busqueda: 'humedal',
    });

    expect(res.data.length).toBeGreaterThan(0);
    expect(res.data[0].nombre).toContain('Angachilla');
    expect(res.meta.total).toBe(1);
  });

  it('debe filtrar datos mock por prioridad y delegación', () => {
    const res = filtrarPuntosCriticosMock({
      pagina: 1,
      limite: 10,
      prioridad: 'CRITICA',
    });

    expect(res.data.every((p) => p.prioridad === 'CRITICA')).toBe(true);
    expect(res.data[0].codigo).toBe('PC-COL-02');
  });

  it('debe filtrar datos mock por estado activo / inactivo', () => {
    const activos = filtrarPuntosCriticosMock({
      pagina: 1,
      limite: 10,
      activo: false,
    });

    expect(activos.data.every((p) => p.activo === false)).toBe(true);
    expect(activos.data[0].estadoTexto).toBe('Inactivo');
  });

  it('debe llamar al endpoint /api/puntos-criticos con los parámetros correctos', async () => {
    const mockApiResponse = {
      data: PUNTOS_CRITICOS_MOCK.slice(0, 2),
      meta: { total: 2, pagina: 1, limite: 10, totalPaginas: 1 },
    };

    vi.spyOn(apiClient, 'GET').mockResolvedValueOnce({
      data: mockApiResponse,
      response: { status: 200 } as Response,
    } as never);

    const resultado = await getPuntosCriticos(
      {
        pagina: 1,
        limite: 10,
        busqueda: 'Angachilla',
        prioridad: 'ALTA',
      },
      '00000000-0000-4000-8000-000000000001'
    );

    expect(apiClient.GET).toHaveBeenCalledWith(
      '/api/puntos-criticos',
      expect.objectContaining({
        params: {
          query: {
            pagina: 1,
            limite: 10,
            delegacionId: undefined,
            activo: undefined,
            prioridad: 'ALTA',
            busqueda: 'Angachilla',
          },
          header: {
            'x-user-id': '00000000-0000-4000-8000-000000000001',
          },
        },
      })
    );
    expect(resultado.data).toHaveLength(2);
    expect(resultado.meta.total).toBe(2);
  });

  it('debe propagar PuntoCriticoServiceError con statusCode 403 ante rechazo de permisos RBAC', async () => {
    vi.spyOn(apiClient, 'GET').mockResolvedValueOnce({
      error: { message: 'Acceso no autorizado: requiere permiso puntos_criticos:leer' },
      response: { status: 403 } as Response,
    } as never);

    await expect(
      getPuntosCriticos(
        { pagina: 1, limite: 10 },
        '00000000-0000-4000-8000-000000000002' // Operador no admin
      )
    ).rejects.toThrow(PuntoCriticoServiceError);
  });

  /* ========================================================================
     Pruebas Unitarias para HU-58: crearPuntoCritico
     ======================================================================== */

  it('debe invocar POST /api/puntos-criticos con payload y retornar punto creado con 201', async () => {
    const payload: CrearPuntoCriticoInput = {
      nombre: 'Peligro Derrumbe Ribera',
      descripcion: 'Riesgo inminente por lluvias',
      tipo_riesgo: 'Remoción en Masa / Deslizamiento',
      nivel_prioridad: 'ALTA',
      lat: -39.82512,
      lng: -73.25143,
      radio_afectacion_metros: 100,
      delegacion_id: '30000000-0000-4000-8000-000000000002',
      activo: true,
    };

    const mockCreado = {
      id: 'e4f5a6b7-c8d9-0123-4567-89abcdef0123',
      codigo: 'PC-SUR-001',
      nombre: payload.nombre,
      descripcion: payload.descripcion ?? null,
      tipo_riesgo: payload.tipo_riesgo,
      nivel_prioridad: payload.nivel_prioridad,
      latitud: payload.lat,
      longitud: payload.lng,
      radio_afectacion_metros: 100,
      delegacion_id: payload.delegacion_id ?? null,
      delegacion_nombre: 'Delegación Sur',
      activo: true,
      creado_por_id: '00000000-0000-4000-8000-000000000001',
      creado_por_nombre: 'Administrador',
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
    };

    vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
      data: mockCreado,
      response: { status: 201 } as Response,
    } as never);

    const res = await crearPuntoCritico(payload, '00000000-0000-4000-8000-000000000001');

    expect(apiClient.POST).toHaveBeenCalledWith(
      '/api/puntos-criticos',
      expect.objectContaining({
        params: {
          header: {
            'x-user-id': '00000000-0000-4000-8000-000000000001',
          },
        },
        body: payload,
      })
    );
    expect(res.codigo).toBe('PC-SUR-001');
    expect(res.nombre).toBe('Peligro Derrumbe Ribera');
  });

  it('debe lanzar PuntoCriticoServiceError con código 400 ante validación fallida', async () => {
    vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
      error: { message: 'El campo nombre es obligatorio y debe tener al menos 3 caracteres' },
      response: { status: 400 } as Response,
    } as never);

    const payloadInvalido = {
      nombre: 'Ab',
      tipo_riesgo: 'Inundación',
      nivel_prioridad: 'MEDIA' as const,
      lat: -39.81,
      lng: -73.24,
    };

    await expect(crearPuntoCritico(payloadInvalido)).rejects.toThrow(PuntoCriticoServiceError);
  });

  it('debe lanzar PuntoCriticoServiceError con código 403 si el usuario carece de permiso', async () => {
    vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
      error: { message: 'Acceso no autorizado: requiere permiso puntos_criticos:crear' },
      response: { status: 403 } as Response,
    } as never);

    const payload = {
      nombre: 'Punto no autorizado',
      tipo_riesgo: 'Inundación',
      nivel_prioridad: 'BAJA' as const,
      lat: -39.81,
      lng: -73.24,
    };

    await expect(crearPuntoCritico(payload, 'usuario-sin-permisos')).rejects.toThrow(PuntoCriticoServiceError);
  });

  it('debe utilizar fallback mock ante fallo de conexión de red', async () => {
    vi.spyOn(apiClient, 'POST').mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const payload = {
      nombre: 'Punto en modo offline',
      tipo_riesgo: 'Remoción en masa',
      nivel_prioridad: 'ALTA' as const,
      lat: -39.82,
      lng: -73.25,
      radio_afectacion_metros: 60,
    };

    const res = await crearPuntoCritico(payload);
    expect(res.nombre).toBe('Punto en modo offline');
    expect(res.codigo).toMatch(/^PC-SUR-\d+$/);
    expect(res.latitud).toBe(-39.82);
    expect(res.longitud).toBe(-73.25);
  });
});

