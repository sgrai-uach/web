import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getPuntosCriticos,
  crearPuntoCritico,
  getPuntoCriticoById,
  actualizarPuntoCritico,
  eliminarPuntoCritico,
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
        body: expect.objectContaining(payload),
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

  describe('getPuntoCriticoById', () => {
    it('debe obtener el detalle consolidado del punto crítico exitosamente', async () => {
      const mockDetalle = {
        ...PUNTOS_CRITICOS_MOCK[0],
        actualizadoEn: '2026-10-04T12:00:00Z',
      };

      vi.spyOn(apiClient, 'GET').mockResolvedValueOnce({
        data: { data: mockDetalle },
        response: { status: 200 } as Response,
      } as never);

      const res = await getPuntoCriticoById('40000000-0000-4000-8000-000000000001');

      expect(res.codigo).toBe('PC-ANG-01');
      expect(res.nombre).toBe(mockDetalle.nombre);
    });

    it('debe lanzar PuntoCriticoServiceError 404 si el punto no existe', async () => {
      vi.spyOn(apiClient, 'GET').mockResolvedValueOnce({
        error: { message: 'Not Found' },
        response: { status: 404 } as Response,
      } as never);

      await expect(getPuntoCriticoById('inexistente-id')).rejects.toThrow(
        'El punto crítico solicitado no fue encontrado en el sistema.'
      );
    });

    it('debe usar fallback mock si hay error de red', async () => {
      vi.spyOn(apiClient, 'GET').mockRejectedValueOnce(new TypeError('Failed to fetch'));

      const res = await getPuntoCriticoById('40000000-0000-4000-8000-000000000001');
      expect(res.codigo).toBe('PC-ANG-01');
    });
  });

  describe('actualizarPuntoCritico', () => {
    it('debe enviar payload PUT y retornar el punto actualizado', async () => {
      const payload = {
        nombre: 'Sector Humedal Angachilla - Editado',
        prioridad: 'CRITICA' as const,
        latitud: -39.8457,
        longitud: -73.239,
      };

      const mockActualizado = {
        ...PUNTOS_CRITICOS_MOCK[0],
        ...payload,
      };

      vi.spyOn(apiClient, 'PUT').mockResolvedValueOnce({
        data: { data: mockActualizado },
        response: { status: 200 } as Response,
      } as never);

      const res = await actualizarPuntoCritico('40000000-0000-4000-8000-000000000001', payload);

      expect(res.nombre).toBe('Sector Humedal Angachilla - Editado');
      expect(res.prioridad).toBe('CRITICA');
      expect(apiClient.PUT).toHaveBeenCalledWith(
        '/api/puntos-criticos/{id}',
        expect.objectContaining({
          params: expect.objectContaining({
            path: { id: '40000000-0000-4000-8000-000000000001' },
          }),
          body: payload,
        })
      );
    });

    it('debe lanzar PuntoCriticoServiceError 409 si el punto está inactivo', async () => {
      vi.spyOn(apiClient, 'PUT').mockResolvedValueOnce({
        error: { message: 'El punto crítico se encuentra inactivo' },
        response: { status: 409 } as Response,
      } as never);

      await expect(
        actualizarPuntoCritico('40000000-0000-4000-8000-000000000005', {
          nombre: 'Población Corvi Actualizada',
          prioridad: 'BAJA',
          latitud: -39.8277,
          longitud: -73.2245,
        })
      ).rejects.toThrow('El punto crítico se encuentra inactivo');
    });

    it('debe lanzar PuntoCriticoServiceError 403 si el usuario carece de permisos de admin', async () => {
      vi.spyOn(apiClient, 'PUT').mockResolvedValueOnce({
        error: { message: 'Forbidden' },
        response: { status: 403 } as Response,
      } as never);

      await expect(
        actualizarPuntoCritico('40000000-0000-4000-8000-000000000001', {
          nombre: 'Sin permiso',
          prioridad: 'MEDIA',
          latitud: -39.8,
          longitud: -73.2,
        })
      ).rejects.toThrow('Acceso denegado: solo usuarios con rol Administrador tienen permiso');
    });

    it('debe actualizar el mock local ante desconexión de red si el punto está activo', async () => {
      vi.spyOn(apiClient, 'PUT').mockRejectedValueOnce(new TypeError('Failed to fetch'));

      const res = await actualizarPuntoCritico('40000000-0000-4000-8000-000000000001', {
        nombre: 'Nombre vía Mock Fallback',
        prioridad: 'ALTA',
        latitud: -39.8459,
        longitud: -73.2385,
      });

      expect(res.nombre).toBe('Nombre vía Mock Fallback');
    });
  });

  describe('eliminarPuntoCritico (HU-56)', () => {
    it('debe ejecutar petición DELETE con los parámetros correctos y retornar éxito 200 OK', async () => {
      const mockSuccessResponse = {
        message: 'Punto crítico desactivado exitosamente del sistema.',
        id: '40000000-0000-4000-8000-000000000001',
        codigo: 'PC-ANG-01',
        nombre: 'Sector Humedal Angachilla - Pasaje Los Robles',
        activo: false,
        eliminadoEn: '2026-10-04T00:30:00.000Z',
        eliminadoPorId: '00000000-0000-4000-8000-000000000001',
      };

      vi.spyOn(apiClient, 'DELETE').mockResolvedValueOnce({
        data: mockSuccessResponse,
        response: { status: 200 } as Response,
      } as never);

      const resultado = await eliminarPuntoCritico(
        '40000000-0000-4000-8000-000000000001',
        '00000000-0000-4000-8000-000000000001'
      );

      expect(apiClient.DELETE).toHaveBeenCalledWith(
        '/api/puntos-criticos/{id}',
        expect.objectContaining({
          params: {
            path: { id: '40000000-0000-4000-8000-000000000001' },
            header: {
              'x-user-id': '00000000-0000-4000-8000-000000000001',
            },
          },
        })
      );
      expect(resultado.activo).toBe(false);
      expect(resultado.codigo).toBe('PC-ANG-01');
    });

    it('debe capturar error 409 Conflict y propagar mensaje detallado de bloqueo por misiones activas', async () => {
      const mensajeBloqueo =
        "No es posible eliminar el punto crítico 'Sector Humedal Angachilla' porque cuenta con 1 misión(es) preventivas activas o patrullas asignadas en terreno (Misiones asociadas: MIS-2026-004).";

      vi.spyOn(apiClient, 'DELETE').mockResolvedValueOnce({
        error: { message: mensajeBloqueo },
        response: { status: 409 } as Response,
      } as never);

      try {
        await eliminarPuntoCritico(
          '40000000-0000-4000-8000-000000000001',
          '00000000-0000-4000-8000-000000000001'
        );
        expect.unreachable('Se esperaba que lanzara PuntoCriticoServiceError');
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(PuntoCriticoServiceError);
        const servicioError = err as PuntoCriticoServiceError;
        expect(servicioError.apiError.statusCode).toBe(409);
        expect(servicioError.apiError.message).toBe(mensajeBloqueo);
      }
    });

    it('debe rechazar con 403 Forbidden si el usuario carece de permisos de administrador', async () => {
      vi.spyOn(apiClient, 'DELETE').mockResolvedValueOnce({
        error: { message: 'Acceso no autorizado: requiere perfil Administrador' },
        response: { status: 403 } as Response,
      } as never);

      await expect(
        eliminarPuntoCritico(
          '40000000-0000-4000-8000-000000000001',
          '00000000-0000-4000-8000-000000000002' // No admin
        )
      ).rejects.toThrow(PuntoCriticoServiceError);
    });

    it('debe manejar fallback ante error de conexión de red actualizando el catálogo mock local', async () => {
      vi.spyOn(apiClient, 'DELETE').mockRejectedValueOnce(
        new TypeError('Failed to fetch')
      );

      const resultado = await eliminarPuntoCritico(
        '40000000-0000-4000-8000-000000000001',
        '00000000-0000-4000-8000-000000000001'
      );

      expect(resultado.activo).toBe(false);
      expect(resultado.id).toBe('40000000-0000-4000-8000-000000000001');
    });
  });
});

