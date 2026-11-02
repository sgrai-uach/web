import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  empleadosService,
  createEmpleado,
  getEmpleadosPaginado,
  EmpleadosServiceError,
} from '../empleadosService';
import type { RegistrarEmpleadoPayload } from '@/types/empleados';
import apiClient from '@/lib/api/client';

describe('empleadosService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getCatalogos', () => {
    it('debe obtener los catálogos del sistema exitosamente', async () => {
      const mockData = {
        data: {
          roles: [{ id: 'rol-1', codigo: 'ADMIN', nombre: 'Administrador' }],
          delegaciones: [{ id: 'del-1', codigo: 'NORTE', nombre: 'Delegación Norte' }],
          especialidades: ['Motosierrista'],
          cargos: ['Delegado de Cuadrilla'],
        },
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      const catalogos = await empleadosService.getCatalogos();
      expect(catalogos.roles).toHaveLength(1);
      expect(catalogos.delegaciones).toHaveLength(1);
      expect(catalogos.especialidades).toContain('Motosierrista');
    });

    it('debe lanzar EmpleadosServiceError si la respuesta no es ok', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Error del servidor' }),
      } as Response);

      await expect(empleadosService.getCatalogos()).rejects.toThrow(
        EmpleadosServiceError
      );
    });
  });

  describe('createEmpleado', () => {
    const payloadValido: RegistrarEmpleadoPayload = {
      rut: '12.345.678-5',
      nombres: 'Carlos',
      apellidos: 'Muñoz',
      email: 'cmunoz@valdivia.cl',
      telefono: '+56912345678',
      password: 'PasswordSegura2026!',
      rol_id: 'rol-uuid-1',
      delegacion_id: 'del-uuid-1',
      cargo: 'Delegado de Cuadrilla',
      especialidad: 'Motosierrista',
      disponible_terreno: true,
      observaciones: 'Registro inicial de prueba',
    };

    it('debe registrar un nuevo empleado exitosamente (201 Created)', async () => {
      const mockEmpleado = {
        usuario_id: 'usr-new-uuid',
        rut: '12.345.678-5',
        nombres: 'Carlos',
        apellidos: 'Muñoz',
        email: 'cmunoz@valdivia.cl',
        usuario_activo: true,
        rol_id: 'rol-uuid-1',
        rol_codigo: 'DELEGADO_CUADRILLA',
        rol_nombre: 'Delegado de Cuadrilla',
        delegacion_id: 'del-uuid-1',
        delegacion_nombre: 'Delegación Costa',
        es_personal: true,
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ data: mockEmpleado }),
      } as Response);

      const resultado = await createEmpleado(payloadValido, 'test-jwt-token');

      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/personal',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-jwt-token',
          }),
          body: JSON.stringify(payloadValido),
        })
      );
      expect(resultado.usuario_id).toBe('usr-new-uuid');
      expect(resultado.nombres).toBe('Carlos');
    });

    it('debe capturar colisión de RUT (409 Conflict) y asignar detalle de campo rut', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({
          error: 'El RUT ingresado ya pertenece a un funcionario registrado',
        }),
      } as Response);

      await expect(createEmpleado(payloadValido)).rejects.toSatisfy((err) => {
        expect(err).toBeInstanceOf(EmpleadosServiceError);
        const serviceErr = err as EmpleadosServiceError;
        expect(serviceErr.status).toBe(409);
        expect(serviceErr.detalles).toEqual([
          {
            campo: 'rut',
            mensaje: 'El RUT ingresado ya pertenece a un funcionario registrado',
          },
        ]);
        return true;
      });
    });

    it('debe capturar colisión de Email (409 Conflict) y asignar detalle de campo email', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({
          error: 'El correo electrónico ya está en uso por otra cuenta',
        }),
      } as Response);

      await expect(createEmpleado(payloadValido)).rejects.toSatisfy((err) => {
        expect(err).toBeInstanceOf(EmpleadosServiceError);
        const serviceErr = err as EmpleadosServiceError;
        expect(serviceErr.status).toBe(409);
        expect(serviceErr.detalles).toEqual([
          {
            campo: 'email',
            mensaje: 'El correo electrónico ya está en uso por otra cuenta',
          },
        ]);
        return true;
      });
    });

    it('debe formatear errores de validación de Zod (422 Unprocessable Entity)', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => ({
          error: 'Datos inválidos',
          detalles: [
            { campo: 'password', mensaje: 'Debe tener al menos 8 caracteres' },
            { campo: 'telefono', mensaje: 'Formato inválido' },
          ],
        }),
      } as Response);

      await expect(createEmpleado(payloadValido)).rejects.toSatisfy((err) => {
        expect(err).toBeInstanceOf(EmpleadosServiceError);
        const serviceErr = err as EmpleadosServiceError;
        expect(serviceErr.status).toBe(422);
        expect(serviceErr.detalles).toHaveLength(2);
        expect(serviceErr.message).toContain('Contraseña: Debe tener al menos 8 caracteres');
        expect(serviceErr.message).toContain('Teléfono: Formato inválido');
        return true;
      });
    });

    it('debe manejar error de autenticación (401 Unauthorized)', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          error: 'Sesión expirada o no autenticada. Se requiere iniciar sesión con permisos de gestión de personal.',
        }),
      } as Response);

      await expect(createEmpleado(payloadValido)).rejects.toSatisfy((err) => {
        expect(err).toBeInstanceOf(EmpleadosServiceError);
        const serviceErr = err as EmpleadosServiceError;
        expect(serviceErr.status).toBe(401);
        expect(serviceErr.message).toContain('permisos de gestión de personal');
        return true;
      });
    });

    it('debe manejar error de permisos insuficientes (403 Forbidden)', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          error: 'Acceso denegado. No dispone del permiso requerido (personal:crear) para registrar funcionarios en el sistema.',
        }),
      } as Response);

      await expect(createEmpleado(payloadValido)).rejects.toSatisfy((err) => {
        expect(err).toBeInstanceOf(EmpleadosServiceError);
        const serviceErr = err as EmpleadosServiceError;
        expect(serviceErr.status).toBe(403);
        expect(serviceErr.message).toContain('personal:crear');
        return true;
      });
    });

    it('debe manejar error genérico cuando el servidor falla (500)', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: 'Error interno en la base de datos',
        }),
      } as Response);

      await expect(createEmpleado(payloadValido)).rejects.toThrow(
        'Error interno en la base de datos'
      );
    });
  });

  describe('getEmpleados y getEmpleadosPaginado (H34 + HU-13 + H11)', () => {
    const mockPersonal = [
      {
        usuario_id: 'usr-1',
        rut: '11.111.111-1',
        nombres: 'Ana',
        apellidos: 'Silva',
        email: 'asilva@valdivia.cl',
        usuario_activo: true,
        estado_operativo: 'disponible' as const,
        rol_id: 'rol-1',
        rol_codigo: 'PATRULLA',
        rol_nombre: 'Patrulla Verificadora',
        delegacion_id: 'del-1',
        delegacion_codigo: 'DEL_NORTE',
        delegacion_nombre: 'Norte',
        es_personal: true,
        disponible_terreno: true,
      },
    ];

    const mockGet = (payload: unknown) =>
      vi.spyOn(apiClient, 'GET').mockResolvedValue({
        data: payload,
        response: new Response(null, { status: 200 }),
      } as unknown as ReturnType<typeof apiClient.GET>);

    it('debe procesar respuesta estandarizada con objeto meta (total, page, limit, totalPages)', async () => {
      const mockMeta = {
        total: 45,
        page: 2,
        limit: 20,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      };

      mockGet({ data: mockPersonal, meta: mockMeta });

      const res = await getEmpleadosPaginado({ page: 2, limit: 20 });

      expect(res.data).toHaveLength(1);
      expect(res.data[0].nombres).toBe('Ana');
      expect(res.data[0].estado_operativo).toBe('disponible');
      expect(res.meta.total).toBe(45);
      expect(res.meta.page).toBe(2);
      expect(res.meta.limit).toBe(20);
      expect(res.meta.totalPages).toBe(3);
      expect(res.meta.hasNext).toBe(true);
      expect(res.meta.hasPrev).toBe(true);
    });

    it('debe soportar fallback defensivo si la API devuelve estructura provisoria paginacion', async () => {
      mockGet({
        data: mockPersonal,
        paginacion: {
          pagina: 1,
          limite: 10,
          total_retornados: 25,
        },
      });

      const res = await getEmpleadosPaginado({ pagina: 1, limite: 10 });

      expect(res.data).toHaveLength(1);
      expect(res.meta.total).toBe(25);
      expect(res.meta.page).toBe(1);
      expect(res.meta.limit).toBe(10);
      expect(res.meta.totalPages).toBe(3);
    });

    it('getEmpleados debe retornar array de funcionarios con meta adjunto', async () => {
      mockGet({
        data: mockPersonal,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });

      const res = await empleadosService.getEmpleados({ q: 'Ana' });

      expect(Array.isArray(res)).toBe(true);
      expect(res).toHaveLength(1);
      expect(res.meta).toBeDefined();
      expect(res.meta?.total).toBe(1);
      expect(res.meta?.page).toBe(1);
    });

    it('H11: debe enviar paginación y filtros (estado operativo, inactivos, rol, búsqueda) a la API', async () => {
      const spy = mockGet({ data: mockPersonal, meta: { total: 1, page: 3, limit: 15, totalPages: 1 } });

      await getEmpleadosPaginado({
        page: 3,
        limit: 15,
        busqueda: 'Ana',
        delegacion_id: 'del-1',
        rol_id: 'rol-1',
        estadoOperativo: 'disponible',
        incluirInactivos: true,
        ordenar_por: 'nombres',
        orden: 'desc',
      });

      const opciones = spy.mock.calls[0]?.[1] as {
        params: { query: Record<string, unknown> };
      };

      expect(opciones.params.query).toMatchObject({
        page: 3,
        limit: 15,
        busqueda: 'Ana',
        delegacion_id: 'del-1',
        rol_id: 'rol-1',
        estadoOperativo: 'disponible',
        incluirInactivos: true,
        ordenar_por: 'nombres',
        orden: 'desc',
      });
    });

    it('H11: debe resolver la delegación por UUID cuando se entrega el nombre legible', async () => {
      const spy = mockGet({ data: mockPersonal, meta: { total: 1, page: 1, limit: 10, totalPages: 1 } });

      await getEmpleadosPaginado({ delegacionNombre: 'Norte' });

      const opciones = spy.mock.calls[0]?.[1] as {
        params: { query: Record<string, unknown> };
      };

      expect(opciones.params.query.delegacion_id).toBeDefined();
      expect(String(opciones.params.query.delegacion_id)).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it('debe lanzar EmpleadosServiceError si la API responde con error', async () => {
      vi.spyOn(apiClient, 'GET').mockResolvedValue({
        error: { message: 'Acceso denegado' },
        response: new Response(null, { status: 403 }),
      } as unknown as ReturnType<typeof apiClient.GET>);

      await expect(getEmpleadosPaginado({})).rejects.toThrow(EmpleadosServiceError);
    });
  });
});
