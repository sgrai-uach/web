import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getPuntosCriticos,
  eliminarPuntoCritico,
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
        '40000000-0000-4000-8000-000000000002',
        '00000000-0000-4000-8000-000000000001'
      );

      expect(resultado.activo).toBe(false);
      expect(resultado.id).toBe('40000000-0000-4000-8000-000000000002');
    });
  });
});
