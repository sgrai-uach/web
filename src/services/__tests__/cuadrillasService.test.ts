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

    it('debe mapear estado INACTIVAS a NO_DISPONIBLE y enviar incluirInactivas true al consultar la API', async () => {
      const getSpy = vi.spyOn(apiClient, 'GET').mockResolvedValueOnce({
        data: { message: 'OK', data: [], meta: { total: 0, pagina: 1, limite: 10, paginasTotales: 1 } },
        error: null,
        response: new Response(null, { status: 200 }),
      } as unknown as Awaited<ReturnType<typeof apiClient.GET>>);

      await cuadrillasService.obtenerCuadrillas({ estado: 'INACTIVAS' });

      expect(getSpy).toHaveBeenCalledWith(
        '/api/cuadrillas',
        expect.objectContaining({
          params: expect.objectContaining({
            query: expect.objectContaining({
              estado: 'NO_DISPONIBLE',
              incluirInactivas: true,
            }),
          }),
        })
      );
    });

    it('debe mapear estado TODAS omitiendo estado y enviando incluirInactivas true al consultar la API', async () => {
      const getSpy = vi.spyOn(apiClient, 'GET').mockResolvedValueOnce({
        data: { message: 'OK', data: [], meta: { total: 0, pagina: 1, limite: 10, paginasTotales: 1 } },
        error: null,
        response: new Response(null, { status: 200 }),
      } as unknown as Awaited<ReturnType<typeof apiClient.GET>>);

      await cuadrillasService.obtenerCuadrillas({ estado: 'TODAS' });

      expect(getSpy).toHaveBeenCalledWith(
        '/api/cuadrillas',
        expect.objectContaining({
          params: expect.objectContaining({
            query: expect.objectContaining({
              estado: undefined,
              incluirInactivas: true,
            }),
          }),
        })
      );
    });
  });

  describe('desactivarCuadrilla (HU-82)', () => {
    const mockCuadrillaId = '50000000-0000-4000-8000-000000000001';

    it('debe desactivar exitosamente la cuadrilla cuando la API responde 200 OK', async () => {
      const mockSuccessResponse = {
        message: 'Cuadrilla operativa desactivada exitosamente',
        data: {
          id: mockCuadrillaId,
          nombre: 'Cuadrilla Vías y Despeje Urbano',
          activo: false,
          estado: 'NO_DISPONIBLE',
          recursosDesvinculados: 2,
          trabajadoresDesvinculados: 2,
          delegadoRevertido: true,
          eliminadoEn: '2026-10-26T12:30:00.000Z',
          eliminadoPorId: '00000000-0000-4000-8000-000000000001',
        },
      };

      vi.spyOn(apiClient, 'DELETE').mockResolvedValueOnce({
        data: mockSuccessResponse,
        error: null,
        response: new Response(null, { status: 200 }),
      } as unknown as Awaited<ReturnType<typeof apiClient.DELETE>>);

      const resultado = await cuadrillasService.desactivarCuadrilla(mockCuadrillaId);

      expect(resultado.id).toBe(mockCuadrillaId);
      expect(resultado.activo).toBe(false);
      expect(resultado.estado).toBe('NO_DISPONIBLE');
      expect(resultado.recursosDesvinculados).toBe(2);
      expect(resultado.trabajadoresDesvinculados).toBe(2);
      expect(resultado.delegadoRevertido).toBe(true);
    });

    it('debe lanzar CuadrillaServiceError con código CUADRILLA_EN_MISION ante 409 Conflict', async () => {
      vi.spyOn(apiClient, 'DELETE').mockResolvedValueOnce({
        data: null,
        error: {
          message:
            'No es posible desactivar la cuadrilla porque posee misiones activas en curso (PLANIFICADA, DESPACHADA o EN_CURSO)',
        },
        response: new Response(null, { status: 409 }),
      } as unknown as Awaited<ReturnType<typeof apiClient.DELETE>>);

      try {
        await cuadrillasService.desactivarCuadrilla(mockCuadrillaId);
        expect.unreachable('Debería haber lanzado 409 Conflict');
      } catch (err: unknown) {
        const error = err as CuadrillaServiceError;
        expect(error).toBeInstanceOf(CuadrillaServiceError);
        expect(error.status).toBe(409);
        expect(error.codigo).toBe('CUADRILLA_EN_MISION');
        expect(error.message).toContain('misiones activas');
      }
    });

    it('debe lanzar CuadrillaServiceError con status 401 si la sesión ha expirado', async () => {
      vi.spyOn(apiClient, 'DELETE').mockResolvedValueOnce({
        data: null,
        error: { message: 'Unauthorized' },
        response: new Response(null, { status: 401 }),
      } as unknown as Awaited<ReturnType<typeof apiClient.DELETE>>);

      try {
        await cuadrillasService.desactivarCuadrilla(mockCuadrillaId);
        expect.unreachable('Debería haber lanzado 401');
      } catch (err: unknown) {
        const error = err as CuadrillaServiceError;
        expect(error).toBeInstanceOf(CuadrillaServiceError);
        expect(error.status).toBe(401);
        expect(error.codigo).toBe('NO_AUTENTICADO');
      }
    });

    it('debe lanzar CuadrillaServiceError con status 403 ante permisos insuficientes', async () => {
      vi.spyOn(apiClient, 'DELETE').mockResolvedValueOnce({
        data: null,
        error: { message: 'Permisos insuficientes' },
        response: new Response(null, { status: 403 }),
      } as unknown as Awaited<ReturnType<typeof apiClient.DELETE>>);

      try {
        await cuadrillasService.desactivarCuadrilla(mockCuadrillaId);
        expect.unreachable('Debería haber lanzado 403');
      } catch (err: unknown) {
        const error = err as CuadrillaServiceError;
        expect(error).toBeInstanceOf(CuadrillaServiceError);
        expect(error.status).toBe(403);
        expect(error.codigo).toBe('PERMISOS_INSUFICIENTES');
      }
    });

    it('debe lanzar CuadrillaServiceError con status 404 si la cuadrilla no existe', async () => {
      vi.spyOn(apiClient, 'DELETE').mockResolvedValueOnce({
        data: null,
        error: { message: 'Cuadrilla no encontrada' },
        response: new Response(null, { status: 404 }),
      } as unknown as Awaited<ReturnType<typeof apiClient.DELETE>>);

      try {
        await cuadrillasService.desactivarCuadrilla('id-inexistente-1234');
        expect.unreachable('Debería haber lanzado 404');
      } catch (err: unknown) {
        const error = err as CuadrillaServiceError;
        expect(error).toBeInstanceOf(CuadrillaServiceError);
        expect(error.status).toBe(404);
        expect(error.codigo).toBe('RECURSO_NO_ENCONTRADO');
      }
    });

    it('debe lanzar error de conexión y no mutar estado local si la llamada a la API falla con error de red o 500', async () => {
      vi.spyOn(apiClient, 'DELETE').mockRejectedValueOnce(new Error('Network offline'));

      try {
        await cuadrillasService.desactivarCuadrilla(mockCuadrillaId);
        expect.unreachable('Debería haber lanzado error ante fallo de red');
      } catch (err: unknown) {
        const error = err as CuadrillaServiceError;
        expect(error).toBeInstanceOf(CuadrillaServiceError);
        expect(error.status).toBe(500);
        expect(error.message).toContain('Error de conexión');
      }
    });
  });

  describe('obtenerCuadrillaPorId (HU-22)', () => {
    it('debe retornar la cuadrilla con dotación completa de integrantes, teléfono, recursos con especificaciones y misión activa cuando la API responde 200', async () => {
      const mockDetalle = {
        message: 'Detalle de cuadrilla obtenido exitosamente',
        data: {
          id: 'c-100',
          nombre: 'Cuadrilla Emergencia Central',
          estado: 'EN_MISION',
          delegacion: { id: 'd-1', nombre: 'Delegación Norte', codigo: 'DEL_NORTE' },
          delegado: {
            id: 'u-1',
            nombre: 'Carlos Gómez',
            email: 'carlos@valdivia.cl',
            rut: '12.345.678-9',
            telefono: '+56 9 1111 2222',
          },
          trabajadores: [
            {
              id: 't-1',
              personalId: 'p-1',
              usuarioId: 'u-2',
              nombre: 'Juan Pérez',
              rut: '14.567.890-1',
              cargo: 'Operario',
              especialidad: 'Motosierrista',
              telefono: '+56 9 9999 8888',
              asignadoEn: '2026-11-01T08:00:00Z',
            },
          ],
          recursos: [
            {
              id: 'r-1',
              recursoId: 'rec-1',
              nombre: 'Camioneta de Rescate 4x4',
              cantidadAsignada: 1,
              esIndividual: true,
              descripcion: 'Vehículo de traslado',
              especificaciones: { patente: 'XX-1122', marca: 'Toyota', modelo: 'Hilux' },
            },
          ],
          misionActiva: {
            id: 'm-1',
            codigo: 'MIS-2026-001',
            titulo: 'Despeje de árbol caído',
            tipoMision: 'DESPEJE',
            estado: 'EN_CURSO',
            fechaDespacho: '2026-11-08T09:00:00Z',
            tiempoTranscurridoMinutos: 45,
            incidente: {
              id: 'inc-1',
              codigo: 'INC-2026-101',
              tipo: 'Caída de Árbol',
              direccion: 'Av. Alemania 450',
              latitud: -39.81,
              longitud: -73.24,
            },
          },
          creadoEn: '2026-10-24T12:00:00.000Z',
          actualizadoEn: null,
          activo: true,
        },
      };

      vi.spyOn(apiClient, 'GET').mockResolvedValueOnce({
        data: mockDetalle,
        error: null,
        response: new Response(null, { status: 200 }),
      } as unknown as Awaited<ReturnType<typeof apiClient.GET>>);

      const resultado = await cuadrillasService.obtenerCuadrillaPorId('c-100');

      expect(resultado.id).toBe('c-100');
      expect(resultado.nombre).toBe('Cuadrilla Emergencia Central');
      expect(resultado.trabajadores[0].telefono).toBe('+56 9 9999 8888');
      expect(resultado.recursos[0].especificaciones?.patente).toBe('XX-1122');
      expect(resultado.misionActiva?.codigo).toBe('MIS-2026-001');
      expect(resultado.misionActiva?.tiempoTranscurridoMinutos).toBe(45);
      expect(resultado.misionActiva?.incidente?.codigo).toBe('INC-2026-101');
    });

    it('debe lanzar CuadrillaServiceError con código PERMISOS_INSUFICIENTES y status 403 ante 403 Forbidden', async () => {
      vi.spyOn(apiClient, 'GET').mockResolvedValueOnce({
        data: null,
        error: { message: 'Forbidden' },
        response: new Response(null, { status: 403 }),
      } as unknown as Awaited<ReturnType<typeof apiClient.GET>>);

      try {
        await cuadrillasService.obtenerCuadrillaPorId('c-forbidden-123');
        expect.unreachable('Debería haber lanzado error 403');
      } catch (err: unknown) {
        const error = err as CuadrillaServiceError;
        expect(error).toBeInstanceOf(CuadrillaServiceError);
        expect(error.status).toBe(403);
        expect(error.codigo).toBe('PERMISOS_INSUFICIENTES');
        expect(error.message).toContain('No cuenta con privilegios suficientes');
      }
    });

    it('debe lanzar CuadrillaServiceError con código RECURSO_NO_ENCONTRADO y status 404 si la cuadrilla no existe', async () => {
      vi.spyOn(apiClient, 'GET').mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
        response: new Response(null, { status: 404 }),
      } as unknown as Awaited<ReturnType<typeof apiClient.GET>>);

      try {
        await cuadrillasService.obtenerCuadrillaPorId('id-totalmente-inexistente-999');
        expect.unreachable('Debería haber lanzado error 404');
      } catch (err: unknown) {
        const error = err as CuadrillaServiceError;
        expect(error).toBeInstanceOf(CuadrillaServiceError);
        expect(error.status).toBe(404);
        expect(error.codigo).toBe('RECURSO_NO_ENCONTRADO');
        expect(error.message).toContain('no existe');
      }
    });

    it('debe resolver cuadrilla local desde CUADRILLAS_FALLBACK con misión activa y teléfono si la red falla', async () => {
      vi.spyOn(apiClient, 'GET').mockRejectedValueOnce(new Error('Network error'));

      const resultado = await cuadrillasService.obtenerCuadrillaPorId('50000000-0000-4000-8000-000000000002');

      expect(resultado.nombre).toBe('Cuadrilla Mitigación Costera');
      expect(resultado.estado).toBe('EN_MISION');
      expect(resultado.misionActiva).not.toBeNull();
      expect(resultado.misionActiva?.incidente?.codigo).toBe('INC-2026-042');
      expect(resultado.trabajadores[0].telefono).toBe('+56 9 7654 3210');
      expect(resultado.recursos[0].especificaciones?.patente).toBe('GHJK-78');
    });
  });
});
