import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  crearRecurso,
  getRecursoById,
  actualizarRecurso,
  RecursoServiceError,
} from '../recursosService';
import apiClient, { DEFAULT_ADMIN_USER_ID } from '@/lib/api/client';
import type { EditarRecursoDTO, RecursoItem } from '@/types/recurso';

vi.mock('@/lib/api/client', () => ({
  default: {
    GET: vi.fn(),
    POST: vi.fn(),
    PUT: vi.fn(),
  },
  DEFAULT_ADMIN_USER_ID: '00000000-0000-4000-8000-000000000001',
}));

describe('recursosService (Edición y Consulta HU-8)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockRecurso: RecursoItem = {
    id: '11111111-1111-4000-8000-111111111111',
    nombre: 'Camioneta Rescate 4x4',
    tipo: 'Vehículo o Maquinaria',
    esIndividual: true,
    estado: 'DISPONIBLE',
    cantidadInventario: 1,
    cantidadEnUso: 0,
    cantidadDisponible: 1,
    cantidadMinima: 0,
    latitud: -39.8142,
    longitud: -73.2459,
    descripcion: 'Unidad de rescate',
    detalles: {
      patente: 'ABCD-12',
      marca: 'Toyota',
      modelo: 'Hilux',
      anio: 2023,
    },
    delegacion: null,
    creadoPorId: DEFAULT_ADMIN_USER_ID,
    creadoEn: '2026-09-29T10:00:00.000Z',
    actualizadoEn: '2026-09-29T10:00:00.000Z',
  };

  describe('getRecursoById', () => {
    it('debe enviar la cabecera x-user-id y retornar el recurso en 200 OK', async () => {
      vi.mocked(apiClient.GET).mockResolvedValueOnce({
        data: mockRecurso,
        error: undefined,
        response: { ok: true, status: 200 } as Response,
      } as any);

      const resultado = await getRecursoById('11111111-1111-4000-8000-111111111111');

      expect(apiClient.GET).toHaveBeenCalledWith('/api/recursos/{id}', {
        params: {
          path: { id: '11111111-1111-4000-8000-111111111111' },
          header: { 'x-user-id': DEFAULT_ADMIN_USER_ID },
        },
        signal: undefined,
      });
      expect(resultado).toEqual(mockRecurso);
    });

    it('debe lanzar RecursoServiceError con código 404 si el recurso no existe', async () => {
      vi.mocked(apiClient.GET).mockResolvedValueOnce({
        data: undefined,
        error: { message: 'Recurso no encontrado' },
        response: { ok: false, status: 404 } as Response,
      } as any);

      await expect(
        getRecursoById('00000000-0000-0000-0000-000000000000')
      ).rejects.toThrow(RecursoServiceError);
    });

    it('debe lanzar RecursoServiceError con código 403 si el usuario carece de permisos', async () => {
      vi.mocked(apiClient.GET).mockResolvedValueOnce({
        data: undefined,
        error: { message: 'Acceso denegado' },
        response: { ok: false, status: 403 } as Response,
      } as any);

      await expect(
        getRecursoById(mockRecurso.id, 'usuario-sin-permisos')
      ).rejects.toThrow(RecursoServiceError);
    });
  });

  describe('actualizarRecurso', () => {
    const payloadEdicion: EditarRecursoDTO = {
      nombre: 'Camioneta Rescate 4x4 - Actualizada',
      descripcion: 'En mantención preventiva',
      cantidadInventario: 1,
      cantidadMinima: 0,
      enMantencion: true,
      latitud: -39.8142,
      longitud: -73.2459,
      detalles: {
        patente: 'ABCD-12',
        kilometraje: 50000,
      },
    };

    it('debe enviar la petición PUT con cabecera y retornar el recurso actualizado en 200 OK', async () => {
      const recursoActualizado = {
        ...mockRecurso,
        nombre: payloadEdicion.nombre,
        estado: 'EN_MANTENCION' as const,
      };

      vi.mocked(apiClient.PUT).mockResolvedValueOnce({
        data: {
          message: 'Recurso actualizado exitosamente',
          data: recursoActualizado,
        },
        error: undefined,
        response: { ok: true, status: 200 } as Response,
      } as any);

      const resultado = await actualizarRecurso(
        mockRecurso.id,
        payloadEdicion,
        DEFAULT_ADMIN_USER_ID
      );

      expect(apiClient.PUT).toHaveBeenCalledWith('/api/recursos/{id}', {
        params: {
          path: { id: mockRecurso.id },
          header: { 'x-user-id': DEFAULT_ADMIN_USER_ID },
        },
        body: payloadEdicion,
      });
      expect(resultado).toEqual(recursoActualizado);
    });

    it('debe lanzar RecursoServiceError cuando la API retorna 400 por stock menor a unidades en uso', async () => {
      vi.mocked(apiClient.PUT).mockResolvedValueOnce({
        data: undefined,
        error: {
          message: 'La cantidad en inventario no puede ser inferior a las 5 unidades en uso',
        },
        response: { ok: false, status: 400 } as Response,
      } as any);

      await expect(
        actualizarRecurso(mockRecurso.id, {
          nombre: 'Sacos de arena',
          cantidadInventario: 2,
          latitud: -39.81,
          longitud: -73.24,
        })
      ).rejects.toThrow(RecursoServiceError);
    });
  });
});
