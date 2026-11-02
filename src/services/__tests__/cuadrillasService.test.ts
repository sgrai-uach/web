import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cuadrillasService, CuadrillaServiceError } from '../cuadrillasService';
import apiClient from '@/lib/api/client';
import { catalogosService } from '@/services/catalogosService';
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
      vi.spyOn(apiClient, 'GET').mockResolvedValueOnce({
        data: {
          data: [
            {
              usuario_id: 'u-1',
              rut: '11.111.111-1',
              nombres: 'Juan',
              apellidos: 'Pérez',
              email: 'juan@valdivia.cl',
              telefono: '+56911111111',
              usuario_activo: true,
              rol_id: 'r-1',
              rol_codigo: 'BRIGADISTA',
              rol_nombre: 'Brigadista',
              delegacion_id: 'd-1',
              delegacion_codigo: 'DEL_NORTE',
              delegacion_nombre: 'Norte',
              es_personal: true,
              personal_id: 'p-1',
              especialidad: 'Mantenimiento',
              cargo: 'Operario de Vías',
              estado_operativo: 'disponible',
              disponible_terreno: true,
            },
            {
              usuario_id: 'u-2',
              rut: '22.222.222-2',
              nombres: 'María',
              apellidos: 'González',
              email: 'maria@valdivia.cl',
              telefono: null,
              usuario_activo: false, // inactivo
              rol_id: 'r-2',
              rol_codigo: 'OPERARIO',
              rol_nombre: 'Operario',
              delegacion_id: null,
              delegacion_codigo: null,
              delegacion_nombre: null,
              es_personal: true,
              personal_id: 'p-2',
            },
            {
              usuario_id: 'u-3',
              rut: '33.333.333-3',
              nombres: 'Pedro',
              apellidos: 'Ciudadano',
              email: 'pedro@gmail.com',
              telefono: null,
              usuario_activo: true,
              rol_id: 'r-3',
              rol_codigo: 'INFORMANTE', // informante externo excluido
              rol_nombre: 'Informante',
            },
          ],
        },
        error: null,
        response: new Response(null, { status: 200 }),
      } as unknown as Awaited<ReturnType<typeof apiClient.GET>>);

      const candidatos = await cuadrillasService.obtenerCandidatosDelegados();
      expect(candidatos).toHaveLength(1);
      expect(candidatos[0].id).toBe('u-1');
      expect(candidatos[0].nombreCompleto).toBe('Juan Pérez');
    });
  });

  describe('actualizarCuadrilla (H81)', () => {
    const mockEditPayload = {
      nombre: 'Cuadrilla Vías y Despeje Urbano Modificada',
      delegacionId: '30000000-0000-4000-8000-000000000001',
      usuarioDelegadoId: '00000000-0000-4000-8000-000000000005',
      recursos: [
        {
          recursoId: 'e1000000-0000-4000-8000-000000000001',
          cantidad: 1,
        },
      ],
      trabajadores: [
        {
          personalId: '40000000-0000-4000-8000-000000000001',
        },
      ],
    };

    it('debe actualizar exitosamente la cuadrilla y dotación cuando la API retorna 200', async () => {
      const mockSuccessResponse = {
        message: 'Cuadrilla operativa actualizada exitosamente',
        data: {
          id: '50000000-0000-4000-8000-000000000001',
          nombre: 'Cuadrilla Vías y Despeje Urbano Modificada',
          estado: 'DISPONIBLE',
          delegacion: {
            id: '30000000-0000-4000-8000-000000000001',
            nombre: 'Delegación Municipal Norte',
          },
          delegado: {
            id: '00000000-0000-4000-8000-000000000005',
            nombre: 'Carlos Delegado',
            email: 'carlos@valdivia.cl',
            rut: '15.111.222-3',
          },
          recursos: [
            {
              id: 'cd100000-0000-4000-8000-000000000001',
              recursoId: 'e1000000-0000-4000-8000-000000000001',
              nombre: 'Camioneta de Rescate 4x4',
              cantidadAsignada: 1,
              esIndividual: true,
            },
          ],
          trabajadores: [
            {
              id: 'cp100000-0000-4000-8000-000000000001',
              personalId: '40000000-0000-4000-8000-000000000001',
              usuarioId: '00000000-0000-4000-8000-000000000009',
              nombre: 'Pedro Obrero',
              rut: '16.222.333-4',
              cargo: 'Motosierrista',
              especialidad: 'Poda de Altura',
              asignadoEn: '2026-10-26T01:30:00.000Z',
            },
          ],
          creadoEn: '2026-10-24T12:00:00.000Z',
          actualizadoEn: '2026-10-26T01:30:00.000Z',
        },
      };

      vi.spyOn(apiClient, 'PUT').mockResolvedValueOnce({
        data: mockSuccessResponse,
        error: null,
        response: new Response(null, { status: 200 }),
      } as unknown as Awaited<ReturnType<typeof apiClient.PUT>>);

      const resultado = await cuadrillasService.actualizarCuadrilla(
        '50000000-0000-4000-8000-000000000001',
        mockEditPayload
      );

      expect(resultado.id).toBe('50000000-0000-4000-8000-000000000001');
      expect(resultado.nombre).toBe('Cuadrilla Vías y Despeje Urbano Modificada');
      expect(resultado.recursos).toHaveLength(1);
      expect(resultado.trabajadores).toHaveLength(1);
      expect(resultado.trabajadores[0].nombre).toBe('Pedro Obrero');
    });

    it('debe lanzar CuadrillaServiceError con código CUADRILLA_EN_MISION ante 409 Conflict por misión activa', async () => {
      vi.spyOn(apiClient, 'PUT').mockResolvedValueOnce({
        data: null,
        error: { message: 'No es posible modificar los datos ni la dotación de una cuadrilla que se encuentra actualmente en misión activa.' },
        response: new Response(null, { status: 409 }),
      } as unknown as Awaited<ReturnType<typeof apiClient.PUT>>);

      try {
        await cuadrillasService.actualizarCuadrilla('cuadrilla-1', mockEditPayload);
        expect.fail('Debería haber lanzado CuadrillaServiceError');
      } catch (err) {
        const error = err as CuadrillaServiceError;
        expect(error).toBeInstanceOf(CuadrillaServiceError);
        expect(error.status).toBe(409);
        expect(error.codigo).toBe('CUADRILLA_EN_MISION');
        expect(error.message).toContain('misión activa');
      }
    });

    it('debe lanzar CuadrillaServiceError con código NOMBRE_DUPLICADO ante 409 Conflict por nombre repetido', async () => {
      vi.spyOn(apiClient, 'PUT').mockResolvedValueOnce({
        data: null,
        error: { message: 'Ya existe otra cuadrilla operativa con el nombre ingresado.' },
        response: new Response(null, { status: 409 }),
      } as unknown as Awaited<ReturnType<typeof apiClient.PUT>>);

      try {
        await cuadrillasService.actualizarCuadrilla('cuadrilla-1', mockEditPayload);
        expect.fail('Debería haber lanzado CuadrillaServiceError');
      } catch (err) {
        const error = err as CuadrillaServiceError;
        expect(error.codigo).toBe('NOMBRE_DUPLICADO');
        expect(error.campo).toBe('nombre');
      }
    });

    it('debe lanzar CuadrillaServiceError con código RECURSO_EN_USO ante 409 Conflict por recurso asignado a otra cuadrilla', async () => {
      vi.spyOn(apiClient, 'PUT').mockResolvedValueOnce({
        data: null,
        error: { message: 'El recurso individual Camioneta 4x4 ya se encuentra asignado a otra cuadrilla activa.' },
        response: new Response(null, { status: 409 }),
      } as unknown as Awaited<ReturnType<typeof apiClient.PUT>>);

      try {
        await cuadrillasService.actualizarCuadrilla('cuadrilla-1', mockEditPayload);
        expect.fail('Debería haber lanzado CuadrillaServiceError');
      } catch (err) {
        const error = err as CuadrillaServiceError;
        expect(error.codigo).toBe('RECURSO_EN_USO');
        expect(error.campo).toBe('recursos');
      }
    });

    it('debe lanzar CuadrillaServiceError con código PERMISOS_INSUFICIENTES ante 403 Forbidden', async () => {
      vi.spyOn(apiClient, 'PUT').mockResolvedValueOnce({
        data: null,
        error: { message: 'Permisos insuficientes' },
        response: new Response(null, { status: 403 }),
      } as unknown as Awaited<ReturnType<typeof apiClient.PUT>>);

      try {
        await cuadrillasService.actualizarCuadrilla('cuadrilla-1', mockEditPayload);
        expect.fail('Debería haber lanzado CuadrillaServiceError');
      } catch (err) {
        const error = err as CuadrillaServiceError;
        expect(error.status).toBe(403);
        expect(error.codigo).toBe('PERMISOS_INSUFICIENTES');
      }
    });

    it('debe lanzar CuadrillaServiceError con código DATOS_INVALIDOS ante 400 Bad Request', async () => {
      vi.spyOn(apiClient, 'PUT').mockResolvedValueOnce({
        data: null,
        error: { message: 'Datos inválidos', errors: [{ campo: 'nombre', mensaje: 'Muy corto' }] },
        response: new Response(null, { status: 400 }),
      } as unknown as Awaited<ReturnType<typeof apiClient.PUT>>);

      try {
        await cuadrillasService.actualizarCuadrilla('cuadrilla-1', mockEditPayload);
        expect.fail('Debería haber lanzado CuadrillaServiceError');
      } catch (err) {
        const error = err as CuadrillaServiceError;
        expect(error.status).toBe(400);
        expect(error.codigo).toBe('DATOS_INVALIDOS');
      }
    });

    it('debe actualizar y preservar la dotación en fallback local cuando el backend responde 404', async () => {
      vi.spyOn(apiClient, 'PUT').mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
        response: new Response(null, { status: 404 }),
      } as unknown as Awaited<ReturnType<typeof apiClient.PUT>>);

      const resultado = await cuadrillasService.actualizarCuadrilla(
        '50000000-0000-4000-8000-000000000003',
        mockEditPayload
      );

      expect(resultado.id).toBe('50000000-0000-4000-8000-000000000003');
      expect(resultado.nombre).toBe(mockEditPayload.nombre);
      expect(resultado.recursos).toHaveLength(1);
      expect(resultado.trabajadores).toHaveLength(1);
      expect(resultado.totalTrabajadores).toBe(1);
      expect(resultado.totalRecursos).toBe(1);
    });
  });

  describe('obtenerCuadrillas', () => {
    it('debe retornar lista de cuadrillas cuando la API responde correctamente', async () => {
      const mockListResp = {
        message: 'Listado obtenido',
        data: [
          {
            id: 'c-1',
            nombre: 'Cuadrilla Test',
            estado: 'DISPONIBLE',
            delegacion: { id: 'd-1', nombre: 'Norte' },
            delegado: { id: 'u-1', nombre: 'Juan', email: 'juan@valdivia.cl' },
            recursos: [],
            trabajadores: [],
            creadoEn: '2026-10-24T12:00:00.000Z',
          },
        ],
        meta: { total: 1, pagina: 1, limite: 10, paginasTotales: 1 },
      };

      vi.spyOn(apiClient, 'GET').mockResolvedValueOnce({
        data: mockListResp,
        error: null,
        response: new Response(null, { status: 200 }),
      } as unknown as Awaited<ReturnType<typeof apiClient.GET>>);

      const resultado = await cuadrillasService.obtenerCuadrillas();
      expect(resultado.cuadrillas).toHaveLength(1);
      expect(resultado.cuadrillas[0].nombre).toBe('Cuadrilla Test');
    });

    it('debe utilizar datos de fallback cuando la llamada a la API falla o responde 404', async () => {
      vi.spyOn(apiClient, 'GET').mockRejectedValueOnce(new Error('Network error'));

      const resultado = await cuadrillasService.obtenerCuadrillas({ pagina: 1, limite: 10 });
      expect(resultado.cuadrillas.length).toBeGreaterThan(0);
      expect(resultado.meta.total).toBeGreaterThan(0);
    });
  });
});
