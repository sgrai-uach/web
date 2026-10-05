import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getPuntosCriticos,
  getPuntoCriticoById,
  actualizarPuntoCritico,
  PuntoCriticoServiceError,
  filtrarPuntosCriticosMock,
  PUNTOS_CRITICOS_MOCK,
} from '../puntosCriticosService';
import apiClient from '@/lib/api/client';

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
});

