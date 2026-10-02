import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '@/lib/api/client';
import { eliminarRecurso, RecursoServiceError } from '../recursosService';

describe('recursosService - eliminarRecurso (HU-9)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockRecursoId = '550e8400-e29b-41d4-a716-446655440000';
  const mockAdminId = '00000000-0000-4000-8000-000000000001';

  it('debe dar de baja lógicamente un recurso y retornar 200 OK cuando no tiene dependencias activas', async () => {
    const mockDelete = vi.spyOn(apiClient, 'DELETE').mockResolvedValueOnce({
      data: {
        message: 'Recurso dado de baja exitosamente.',
        id: mockRecursoId,
        nombre: 'Camioneta Rescate 4x4',
        eliminadoEn: '2026-09-30T20:00:00.000Z',
        eliminadoPorId: mockAdminId,
      },
      error: undefined,
      response: new Response(null, { status: 200 }),
    } as unknown as Awaited<ReturnType<typeof apiClient.DELETE>>);

    const resultado = await eliminarRecurso(mockRecursoId, mockAdminId);

    expect(mockDelete).toHaveBeenCalledWith('/api/recursos/{id}', {
      params: {
        path: { id: mockRecursoId },
        header: { 'x-user-id': mockAdminId },
      },
    });
    expect(resultado).toBeDefined();
    expect(resultado.id).toBe(mockRecursoId);
    expect(resultado.nombre).toBe('Camioneta Rescate 4x4');
    expect(resultado.eliminadoPorId).toBe(mockAdminId);
  });

  it('debe arrojar RecursoServiceError con código 409 cuando el recurso está en uso en terreno', async () => {
    vi.spyOn(apiClient, 'DELETE').mockResolvedValueOnce({
      data: undefined,
      error: {
        message: 'El recurso "Camioneta Rescate 4x4" tiene 2 unidades actualmente en uso en terreno y no puede ser eliminado.',
        statusCode: 409,
      },
      response: new Response(null, { status: 409 }),
    } as unknown as Awaited<ReturnType<typeof apiClient.DELETE>>);

    try {
      await eliminarRecurso(mockRecursoId, mockAdminId);
      expect.fail('Debería haber lanzado RecursoServiceError');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(RecursoServiceError);
      if (err instanceof RecursoServiceError) {
        expect(err.apiError.statusCode).toBe(409);
        expect(err.apiError.message).toContain('unidades actualmente en uso en terreno');
      }
    }
  });

  it('debe arrojar RecursoServiceError con código 403 cuando el usuario no tiene permisos de Administrador', async () => {
    vi.spyOn(apiClient, 'DELETE').mockResolvedValueOnce({
      data: undefined,
      error: {
        message: 'Acceso denegado: Se requiere perfil de Administrador.',
        statusCode: 403,
      },
      response: new Response(null, { status: 403 }),
    } as unknown as Awaited<ReturnType<typeof apiClient.DELETE>>);

    await expect(eliminarRecurso(mockRecursoId, 'callcenter-user-uuid')).rejects.toThrow(RecursoServiceError);
  });

  it('debe arrojar RecursoServiceError con código 404 cuando el recurso no existe o ya fue eliminado', async () => {
    vi.spyOn(apiClient, 'DELETE').mockResolvedValueOnce({
      data: undefined,
      error: {
        message: 'El recurso especificado no fue encontrado.',
        statusCode: 404,
      },
      response: new Response(null, { status: 404 }),
    } as unknown as Awaited<ReturnType<typeof apiClient.DELETE>>);

    await expect(eliminarRecurso('inexistente-id', mockAdminId)).rejects.toThrow(RecursoServiceError);
  });
});
