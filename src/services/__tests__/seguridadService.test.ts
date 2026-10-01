import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  listarRolesYPermisos,
  obtenerDetalleRol,
  obtenerCatalogoPermisos,
  actualizarPermisosRol,
  agruparPermisosPorModulo,
  agruparCatalogoPorModulo,
  SeguridadServiceError,
} from '../seguridadService';
import apiClient from '@/lib/api/client';
import type { PermisoAsignado, PermisoCatalogoItem } from '@/types/seguridad';

vi.mock('@/lib/api/client', () => ({
  default: {
    GET: vi.fn(),
    PUT: vi.fn(),
  },
}));

describe('Servicio de Seguridad (Roles y Permisos)', () => {
  const userId = '00000000-0000-4000-8000-000000000001';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listarRolesYPermisos', () => {
    it('debe retornar listado de roles con status 200', async () => {
      const mockRoles = {
        data: [{ id: 'rol-1', nombre: 'Administrador', permisos: [] }],
        total: 1,
      };

      vi.mocked(apiClient.GET).mockResolvedValueOnce({
        data: mockRoles,
        error: undefined,
        response: { ok: true, status: 200 } as Response,
      });

      const res = await listarRolesYPermisos(userId);
      expect(res.data).toHaveLength(1);
      expect(res.data[0].nombre).toBe('Administrador');
    });

    it('debe lanzar SeguridadServiceError con status 403 en acceso denegado', async () => {
      vi.mocked(apiClient.GET).mockResolvedValueOnce({
        data: undefined,
        error: { message: 'Forbidden' },
        response: { ok: false, status: 403 } as Response,
      });

      await expect(listarRolesYPermisos(userId)).rejects.toThrow(SeguridadServiceError);
    });
  });

  describe('obtenerDetalleRol', () => {
    it('debe retornar el detalle de un rol existente', async () => {
      const mockDetalle = {
        data: {
          id: 'rol-1',
          nombre: 'Encargado',
          permisos: [],
          cantidadPermisos: 0,
        },
      };

      vi.mocked(apiClient.GET).mockResolvedValueOnce({
        data: mockDetalle,
        error: undefined,
        response: { ok: true, status: 200 } as Response,
      });

      const res = await obtenerDetalleRol('rol-1', userId);
      expect(res.data.nombre).toBe('Encargado');
    });

    it('debe lanzar SeguridadServiceError con status 404 si el rol no existe', async () => {
      vi.mocked(apiClient.GET).mockResolvedValueOnce({
        data: undefined,
        error: { message: 'Not found' },
        response: { ok: false, status: 404 } as Response,
      });

      await expect(obtenerDetalleRol('rol-inexistente', userId)).rejects.toThrow(
        SeguridadServiceError
      );
    });
  });

  describe('obtenerCatalogoPermisos (HU-5)', () => {
    it('debe obtener y retornar el array de permisos disponibles', async () => {
      const mockCatalogo: PermisoCatalogoItem[] = [
        {
          id: 'p-1',
          codigo: 'recursos:crear',
          nombre: 'Crear Recursos',
          descripcion: 'Permite crear recursos',
          modulo: 'Recursos',
        },
        {
          id: 'p-2',
          codigo: 'misiones:asignar',
          nombre: 'Asignar Misiones',
          descripcion: 'Permite asignar misiones',
          modulo: 'Misiones',
        },
      ];

      vi.mocked(apiClient.GET).mockResolvedValueOnce({
        data: { data: mockCatalogo },
        error: undefined,
        response: { ok: true, status: 200 } as Response,
      });

      const items = await obtenerCatalogoPermisos(userId);
      expect(items).toHaveLength(2);
      expect(items[0].codigo).toBe('recursos:crear');
    });

    it('debe soportar respuestas donde data sea directamente el array', async () => {
      const mockCatalogo: PermisoCatalogoItem[] = [
        {
          id: 'p-1',
          codigo: 'recursos:crear',
          nombre: 'Crear Recursos',
          descripcion: null,
          modulo: 'Recursos',
        },
      ];

      vi.mocked(apiClient.GET).mockResolvedValueOnce({
        data: mockCatalogo,
        error: undefined,
        response: { ok: true, status: 200 } as Response,
      });

      const items = await obtenerCatalogoPermisos(userId);
      expect(items).toHaveLength(1);
    });

    it('debe lanzar SeguridadServiceError si la API retorna 403 Forbidden', async () => {
      vi.mocked(apiClient.GET).mockResolvedValueOnce({
        data: undefined,
        error: { message: 'No autorizado' },
        response: { ok: false, status: 403 } as Response,
      });

      await expect(obtenerCatalogoPermisos(userId)).rejects.toThrow(
        SeguridadServiceError
      );
    });
  });

  describe('actualizarPermisosRol (HU-5)', () => {
    it('debe enviar PUT con los permisoIds y retornar mensaje de éxito', async () => {
      const mockResponse = {
        message: 'Permisos actualizados correctamente',
      };

      vi.mocked(apiClient.PUT).mockResolvedValueOnce({
        data: mockResponse,
        error: undefined,
        response: { ok: true, status: 200 } as Response,
      });

      const res = await actualizarPermisosRol('rol-1', ['p-1', 'p-2'], userId);
      expect(res.message).toBe('Permisos actualizados correctamente');
      expect(apiClient.PUT).toHaveBeenCalledWith(
        '/api/seguridad/roles/{id}/permisos',
        expect.objectContaining({
          params: expect.objectContaining({
            path: { id: 'rol-1' },
            header: { 'x-user-id': userId },
          }),
          body: {
            permisoIds: ['p-1', 'p-2'],
          },
        })
      );
    });

    it('debe lanzar SeguridadServiceError con status 400 si los IDs son inválidos', async () => {
      vi.mocked(apiClient.PUT).mockResolvedValueOnce({
        data: undefined,
        error: { message: 'UUIDs de permisos inválidos' },
        response: { ok: false, status: 400 } as Response,
      });

      await expect(
        actualizarPermisosRol('rol-1', ['invalido'], userId)
      ).rejects.toThrow(SeguridadServiceError);
    });
  });

  describe('agrupadores por módulo', () => {
    it('agruparPermisosPorModulo debe agrupar permisos por su propiedad modulo', () => {
      const permisos: PermisoAsignado[] = [
        {
          id: '1',
          codigo: 'a',
          nombre: 'A',
          modulo: 'Módulo 1',
          descripcion: '',
          asignadoEn: '',
          asignadoPorId: null,
        },
        {
          id: '2',
          codigo: 'b',
          nombre: 'B',
          modulo: 'Módulo 1',
          descripcion: '',
          asignadoEn: '',
          asignadoPorId: null,
        },
        {
          id: '3',
          codigo: 'c',
          nombre: 'C',
          modulo: 'Módulo 2',
          descripcion: '',
          asignadoEn: '',
          asignadoPorId: null,
        },
      ];

      const agrupados = agruparPermisosPorModulo(permisos);
      expect(Object.keys(agrupados)).toEqual(['Módulo 1', 'Módulo 2']);
      expect(agrupados['Módulo 1']).toHaveLength(2);
      expect(agrupados['Módulo 2']).toHaveLength(1);
    });

    it('agruparCatalogoPorModulo debe clasificar ítems del catálogo correctamente', () => {
      const catalogo: PermisoCatalogoItem[] = [
        { id: '1', codigo: 'a', nombre: 'A', modulo: 'Seguridad', descripcion: null },
        { id: '2', codigo: 'b', nombre: 'B', modulo: 'Incidentes', descripcion: null },
      ];

      const agrupados = agruparCatalogoPorModulo(catalogo);
      expect(agrupados['Seguridad']).toHaveLength(1);
      expect(agrupados['Incidentes']).toHaveLength(1);
    });
  });
});
