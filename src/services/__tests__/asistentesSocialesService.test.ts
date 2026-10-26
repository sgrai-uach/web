import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  obtenerAsistentesSociales,
  AsistentesSocialesServiceError,
  ASISTENTES_SOCIALES_MOCK,
} from '../asistentesSocialesService';
import apiClient from '@/lib/api/client';

describe('asistentesSocialesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe consultar GET /api/personal con rolCodigo=ASISTENTE_SOCIAL y mapear los datos correctamente', async () => {
    const mockApiData = {
      data: [
        {
          usuario_id: '50000000-0000-4000-8000-000000000010',
          rut: '12.345.678-9',
          nombres: 'Laura',
          apellidos: 'Pérez Silva',
          email: 'lperez@valdivia.cl',
          telefono: '+56 9 1234 5678',
          usuario_activo: true,
          rol_id: 'rol-1',
          rol_codigo: 'ASISTENTE_SOCIAL',
          rol_nombre: 'Asistente Social',
          delegacion_id: '30000000-0000-4000-8000-000000000001',
          delegacion_codigo: 'COSTA',
          delegacion_nombre: 'Delegación Municipal Costa',
          personal_id: 'pers-1',
          estado_operativo: 'disponible',
          casos_fibe_asignados: 2,
        },
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    };

    const getSpy = vi.spyOn(apiClient, 'GET').mockResolvedValueOnce({
      data: mockApiData,
      error: null,
      response: new Response(JSON.stringify(mockApiData), { status: 200 }),
    });

    const respuesta = await obtenerAsistentesSociales({
      pagina: 1,
      limite: 20,
      delegacionId: '30000000-0000-4000-8000-000000000001',
      estadoOperativo: 'disponible',
    });

    expect(getSpy).toHaveBeenCalledWith(
      '/api/personal',
      expect.objectContaining({
        params: expect.objectContaining({
          query: expect.objectContaining({
            rolCodigo: 'ASISTENTE_SOCIAL',
            delegacion_id: '30000000-0000-4000-8000-000000000001',
            estadoOperativo: 'disponible',
            page: 1,
            limit: 20,
          }),
        }),
      })
    );

    expect(respuesta.data).toHaveLength(1);
    expect(respuesta.data[0].nombreCompleto).toBe('Laura Pérez Silva');
    expect(respuesta.data[0].estadoOperativo).toBe('disponible');
    expect(respuesta.data[0].casosFibeAsignados).toBe(2);
    expect(respuesta.meta.total).toBe(1);
  });

  it('debe lanzar AsistentesSocialesServiceError con status 401 si la sesión no es válida', async () => {
    vi.spyOn(apiClient, 'GET').mockResolvedValueOnce({
      data: null,
      error: { error: 'No autenticado' },
      response: new Response(null, { status: 401 }),
    });

    await expect(
      obtenerAsistentesSociales({ pagina: 1, limite: 20 })
    ).rejects.toThrow(AsistentesSocialesServiceError);
  });

  it('debe lanzar AsistentesSocialesServiceError con status 403 si no tiene permiso asistencia_social:leer', async () => {
    vi.spyOn(apiClient, 'GET').mockResolvedValueOnce({
      data: null,
      error: { error: 'Permisos insuficientes' },
      response: new Response(null, { status: 403 }),
    });

    await expect(
      obtenerAsistentesSociales({ pagina: 1, limite: 20 })
    ).rejects.toThrow(AsistentesSocialesServiceError);
  });

  it('debe retornar mock filtrado en caso de error de red o desconexión', async () => {
    vi.spyOn(apiClient, 'GET').mockRejectedValueOnce(new Error('Network error'));

    const respuesta = await obtenerAsistentesSociales({
      pagina: 1,
      limite: 10,
      estadoOperativo: 'en_mision',
    });

    expect(respuesta.data.length).toBeGreaterThan(0);
    expect(respuesta.data.every((a) => a.estadoOperativo === 'en_mision')).toBe(true);
  });

  it('debe filtrar correctamente por búsqueda textual en el mock de contingencia', async () => {
    vi.spyOn(apiClient, 'GET').mockRejectedValueOnce(new Error('Network error'));

    const respuesta = await obtenerAsistentesSociales({
      pagina: 1,
      limite: 10,
      busqueda: 'Camila',
    });

    expect(respuesta.data).toHaveLength(1);
    expect(respuesta.data[0].nombres).toContain('Camila');
  });
});
