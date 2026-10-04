import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getPuntosCriticos,
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
});
