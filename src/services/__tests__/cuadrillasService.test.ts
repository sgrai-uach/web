import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cuadrillasService, CuadrillaServiceError } from '../cuadrillasService';
import apiClient from '@/lib/api/client';
import { catalogosService } from '@/services/catalogosService';
import { empleadosService } from '@/services/empleadosService';
import type { CrearCuadrillaDTO } from '@/types/cuadrilla';

describe('cuadrillasService (H79)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPayload: CrearCuadrillaDTO = {
    nombre: 'Cuadrilla Vías y Calles',
    delegacionId: '30000000-0000-4000-8000-000000000001',
    usuarioDelegadoId: '00000000-0000-4000-8000-000000000005',
  };

  describe('crearCuadrilla', () => {
    it('debe registrar exitosamente la cuadrilla cuando la API retorna 201', async () => {
      const mockSuccessResponse = {
        message: 'Cuadrilla operativa creada exitosamente',
        data: {
          id: '50000000-0000-4000-8000-000000000001',
          nombre: 'Cuadrilla Vías y Calles',
          estado: 'DISPONIBLE',
          delegacion: {
            id: '30000000-0000-4000-8000-000000000001',
            nombre: 'Delegación Municipal Calle Calle',
          },
          delegado: {
            id: '00000000-0000-4000-8000-000000000005',
            nombre: 'Carlos Operativo',
            email: 'carlos@valdivia.cl',
            rut: '15.123.456-7',
          },
          creadoEn: '2026-10-24T12:00:00.000Z',
          creadoPorId: '00000000-0000-4000-8000-000000000001',
        },
      };

      vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
        data: mockSuccessResponse,
        error: null,
        response: new Response(null, { status: 201 }),
      } as unknown as Awaited<ReturnType<typeof apiClient.POST>>);

      const resultado = await cuadrillasService.crearCuadrilla(mockPayload);

      expect(resultado.id).toBe('50000000-0000-4000-8000-000000000001');
      expect(resultado.nombre).toBe('Cuadrilla Vías y Calles');
      expect(resultado.estado).toBe('DISPONIBLE');
      expect(resultado.delegado.nombre).toBe('Carlos Operativo');
    });

    it('debe lanzar CuadrillaServiceError con código NOMBRE_DUPLICADO ante 409 Conflict', async () => {
      vi.spyOn(apiClient, 'POST').mockResolvedValue({
        data: null,
        error: { message: 'El nombre de la cuadrilla ya está en uso' },
        response: new Response(null, { status: 409 }),
      } as unknown as Awaited<ReturnType<typeof apiClient.POST>>);

      try {
        await cuadrillasService.crearCuadrilla(mockPayload);
        expect.unreachable('Debería haber lanzado un error');
      } catch (err: unknown) {
        const error = err as CuadrillaServiceError;
        expect(error).toBeInstanceOf(CuadrillaServiceError);
        expect(error.status).toBe(409);
        expect(error.campo).toBe('nombre');
        expect(error.codigo).toBe('NOMBRE_DUPLICADO');
        expect(error.message).toContain('Ya existe una cuadrilla operativa con este nombre');
      }
    });

    it('debe lanzar CuadrillaServiceError con código PERMISOS_INSUFICIENTES ante 403 Forbidden', async () => {
      vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
        data: null,
        error: { message: 'Forbidden' },
        response: new Response(null, { status: 403 }),
      } as unknown as Awaited<ReturnType<typeof apiClient.POST>>);

      try {
        await cuadrillasService.crearCuadrilla(mockPayload);
      } catch (err: unknown) {
        const error = err as CuadrillaServiceError;
        expect(error.status).toBe(403);
        expect(error.codigo).toBe('PERMISOS_INSUFICIENTES');
      }
    });

    it('debe lanzar CuadrillaServiceError con código DATOS_INVALIDOS ante 400 Bad Request', async () => {
      vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
        data: null,
        error: { message: 'El nombre debe contener al menos 3 caracteres' },
        response: new Response(null, { status: 400 }),
      } as unknown as Awaited<ReturnType<typeof apiClient.POST>>);

      try {
        await cuadrillasService.crearCuadrilla(mockPayload);
      } catch (err: unknown) {
        const error = err as CuadrillaServiceError;
        expect(error.status).toBe(400);
        expect(error.codigo).toBe('DATOS_INVALIDOS');
      }
    });
  });

  describe('obtenerDelegaciones', () => {
    it('debe retornar la lista de delegaciones desde catalogosService', async () => {
      vi.spyOn(catalogosService, 'getCatalogos').mockResolvedValueOnce({
        roles: [],
        delegaciones: [
          { id: 'del-1', nombre: 'Norte', codigo: 'DEL_NORTE' },
          { id: 'del-2', nombre: 'Sur', codigo: 'DEL_SUR' },
        ],
        cargos: [],
        especialidades: [],
      });

      const delegaciones = await cuadrillasService.obtenerDelegaciones();
      expect(delegaciones).toHaveLength(2);
      expect(delegaciones[0].nombre).toBe('Norte');
    });
  });

  describe('obtenerCandidatosDelegados', () => {
    it('debe filtrar al personal activo operativo de terreno', async () => {
      vi.spyOn(empleadosService, 'getEmpleados').mockResolvedValueOnce({
        data: [
          {
            usuario_id: 'u-1',
            rut: '11.111.111-1',
            nombres: 'Juan',
            apellidos: 'Pérez',
            email: 'juan@valdivia.cl',
            telefono: '+56911111111',
            usuario_activo: true,
            fecha_ingreso: '2025-01-01',
            fecha_salida: null,
            rol_id: 'r-1',
            rol_codigo: 'OPERARIO',
            rol_nombre: 'Operario',
            delegacion_id: 'd-1',
            delegacion_codigo: 'DEL_NORTE',
            delegacion_nombre: 'Norte',
            es_personal: true,
            personal_id: 'p-1',
            especialidad: 'Mantenimiento',
            cargo: 'Operario de Vías',
            estado_operativo: 'disponible',
            disponible_terreno: true,
            observaciones: null,
          },
          {
            usuario_id: 'u-2',
            rut: '22.222.222-2',
            nombres: 'María',
            apellidos: 'González',
            email: 'maria@valdivia.cl',
            telefono: null,
            usuario_activo: false, // inactivo
            fecha_ingreso: null,
            fecha_salida: null,
            rol_id: 'r-2',
            rol_codigo: 'OPERARIO',
            rol_nombre: 'Operario',
            delegacion_id: null,
            delegacion_codigo: null,
            delegacion_nombre: null,
            es_personal: true,
            personal_id: 'p-2',
            especialidad: null,
            cargo: null,
            estado_operativo: null,
            disponible_terreno: false,
            observaciones: null,
          },
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 100,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });

      const candidatos = await cuadrillasService.obtenerCandidatosDelegados();
      expect(candidatos).toHaveLength(1);
      expect(candidatos[0].id).toBe('u-1');
      expect(candidatos[0].nombreCompleto).toBe('Juan Pérez');
    });
  });
});
