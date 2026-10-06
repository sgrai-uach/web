import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '@/lib/api/client';
import {
  obtenerTiposAfectacion,
  verificarDuplicado,
  crearIncidenteManual,
} from '../incidentesManualesService';
import { TIPOS_AFECTACION_FALLBACK } from '@/types/incidente-manual';

describe('Servicio incidentes-manuales', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('obtenerTiposAfectacion', () => {
    it('debe retornar la lista de la API cuando la respuesta es exitosa', async () => {
      vi.spyOn(apiClient, 'GET').mockResolvedValueOnce({
        data: { message: 'OK', data: ['Anegamiento', 'Derrumbe'] },
        error: undefined,
        response: new Response(),
      } as unknown as Awaited<ReturnType<typeof apiClient.GET>>);

      const tipos = await obtenerTiposAfectacion();
      expect(tipos).toEqual(['Anegamiento', 'Derrumbe']);
    });

    it('debe retornar TIPOS_AFECTACION_FALLBACK cuando la API falla o responde vacío', async () => {
      vi.spyOn(apiClient, 'GET').mockRejectedValueOnce(new Error('Network error'));

      const tipos = await obtenerTiposAfectacion();
      expect(tipos).toEqual(TIPOS_AFECTACION_FALLBACK);
    });
  });

  describe('verificarDuplicado', () => {
    it('debe enviar X-User-Id y retornar coincidencias si existen', async () => {
      const mockPost = vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
        data: {
          hayDuplicados: true,
          coincidencias: [
            {
              id: 'dup-1',
              codigo: 'INC-0001',
              tipoAfectacion: 'Anegamiento',
              direccion: 'Av. Alemania 550',
              estado: 'REPORTADO',
              distanciaMetros: 25.4,
              creadoEn: '2026-09-13T12:00:00Z',
              origen: 'incidente',
            },
          ],
        },
        error: undefined,
        response: new Response(null, { status: 200 }),
      } as unknown as Awaited<ReturnType<typeof apiClient.POST>>);

      const res = await verificarDuplicado(
        { tipoAfectacion: 'Anegamiento', direccion: 'Av. Alemania 550', radioMetros: 300, horasVentana: 24 },
        'operador-uuid-123'
      );

      expect(mockPost).toHaveBeenCalledWith(
        '/api/incidentes/verificar-duplicado',
        expect.objectContaining({
          params: expect.objectContaining({
            header: { 'x-user-id': 'operador-uuid-123' },
          }),
        })
      );
      expect(res.hayDuplicados).toBe(true);
      expect(res.coincidencias).toHaveLength(1);
      expect(res.coincidencias[0].codigo).toBe('INC-0001');
    });

    it('debe retornar { hayDuplicados: false } si la petición falla', async () => {
      vi.spyOn(apiClient, 'POST').mockRejectedValueOnce(new Error('API caída'));

      const res = await verificarDuplicado({
        tipoAfectacion: 'Caída de árbol',
        direccion: 'Picarte 1000',
        radioMetros: 300,
        horasVentana: 24,
      });

      expect(res.hayDuplicados).toBe(false);
      expect(res.coincidencias).toEqual([]);
    });
  });

  describe('crearIncidenteManual', () => {
    const payloadValido = {
      origenReporte: 'LLAMADA_TELEFONICA' as const,
      tipoAfectacion: 'Anegamiento' as const,
      descripcion: 'Agua sube 20 cm en la calzada',
      direccion: 'Av. Alemania 550',
      informanteNombre: 'Juan Pérez',
      informanteRut: '11.111.111-1',
      prioridad: 'MEDIA' as const,
      requiereAsistenciaSocial: false,
      forzarCreacion: false,
    };

    it('debe manejar 201 Created exitosamente retornando códigos de incidente y aviso', async () => {
      vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
        data: {
          mensaje: 'Incidente y aviso creados con éxito',
          incidente: {
            id: 'inc-123',
            codigo: 'INC-0089',
            tipoAfectacion: 'Anegamiento',
            descripcion: 'Agua sube 20 cm en la calzada',
            direccion: 'Av. Alemania 550',
            latitud: -39.81,
            longitud: -73.24,
            estado: 'REPORTADO',
            prioridad: 'MEDIA',
            requiereAsistenciaSocial: false,
            creadoEn: '2026-09-13T14:00:00Z',
          },
          aviso: {
            id: 'av-456',
            codigoSeguimiento: '84920194',
            esDuplicado: false,
            mensaje: 'Aviso registrado',
            tipoAfectacion: 'Anegamiento',
            direccion: 'Av. Alemania 550',
            estado: 'PENDIENTE_VERIFICACION',
            creadoEn: '2026-09-13T14:00:00Z',
          },
        },
        error: undefined,
        response: new Response(null, { status: 201 }),
      } as unknown as Awaited<ReturnType<typeof apiClient.POST>>);

      const resultado = await crearIncidenteManual(payloadValido, 'op-123');

      expect(resultado.tipo).toBe('EXITO');
      if (resultado.tipo === 'EXITO') {
        expect(resultado.datos.codigoIncidente).toBe('INC-0089');
        expect(resultado.datos.codigoAviso).toBe('84920194');
        expect(resultado.datos.estado).toBe('REPORTADO');
      }
    });

    it('debe capturar 409 Conflict y retornar tipo DUPLICADO con coincidencias', async () => {
      vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
        data: undefined,
        error: {
          message: 'Incidente duplicado detectado',
          requiereConfirmacion: true,
          data: {
            coincidencias: [
              {
                id: 'dup-88',
                codigo: 'INC-0080',
                tipoAfectacion: 'Anegamiento',
                direccion: 'Av. Alemania 500',
                estado: 'SIN_ATENDER',
                distanciaMetros: 50,
                creadoEn: '2026-09-13T10:00:00Z',
                origen: 'incidente',
              },
            ],
          },
        },
        response: new Response(null, { status: 409 }),
      } as unknown as Awaited<ReturnType<typeof apiClient.POST>>);

      const resultado = await crearIncidenteManual(payloadValido, 'op-123');

      expect(resultado.tipo).toBe('DUPLICADO');
      if (resultado.tipo === 'DUPLICADO') {
        expect(resultado.coincidencias).toHaveLength(1);
        expect(resultado.coincidencias[0].codigo).toBe('INC-0080');
      }
    });

    it('debe manejar 201 Created cuando la respuesta viene envuelta en { data: { incidente: ... } } sin objeto aviso', async () => {
      vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
        data: {
          data: {
            incidente: {
              id: 'inc-999',
              codigo: 'INC-9999',
              tipoAfectacion: 'Anegamiento',
              descripcion: 'Agua en calle',
              direccion: 'Av. Francia 123',
              estado: 'REPORTADO',
              prioridad: 'ALTA',
            },
          },
        },
        error: undefined,
        response: new Response(null, { status: 201 }),
      } as unknown as Awaited<ReturnType<typeof apiClient.POST>>);

      const resultado = await crearIncidenteManual(payloadValido, 'op-123');

      expect(resultado.tipo).toBe('EXITO');
      if (resultado.tipo === 'EXITO') {
        expect(resultado.datos.codigoIncidente).toBe('INC-9999');
        expect(resultado.datos.codigoAviso).toBe('INC-9999');
      }
    });

    it('debe capturar 409 Conflict con coincidencias en la raíz del objeto de error', async () => {
      vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
        data: undefined,
        error: {
          message: 'Incidente duplicado',
          coincidencias: [
            {
              id: 'dup-root',
              codigo: 'INC-ROOT',
              tipoAfectacion: 'Anegamiento',
              direccion: 'Picarte 200',
              estado: 'REPORTADO',
              distanciaMetros: 100,
            },
          ],
        },
        response: new Response(null, { status: 409 }),
      } as unknown as Awaited<ReturnType<typeof apiClient.POST>>);

      const resultado = await crearIncidenteManual(payloadValido, 'op-123');

      expect(resultado.tipo).toBe('DUPLICADO');
      if (resultado.tipo === 'DUPLICADO') {
        expect(resultado.coincidencias).toHaveLength(1);
        expect(resultado.coincidencias[0].codigo).toBe('INC-ROOT');
      }
    });

    it('debe capturar 400 Bad Request y retornar tipo ERROR_VALIDACION', async () => {
      vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
        data: undefined,
        error: {
          message: 'Error de validación',
          errors: [{ campo: 'informanteRut', mensaje: 'RUT inválido' }],
        },
        response: new Response(null, { status: 400 }),
      } as unknown as Awaited<ReturnType<typeof apiClient.POST>>);

      const resultado = await crearIncidenteManual(payloadValido, 'op-123');

      expect(resultado.tipo).toBe('ERROR_VALIDACION');
      if (resultado.tipo === 'ERROR_VALIDACION') {
        expect(resultado.errores).toHaveLength(1);
        expect(resultado.errores[0]).toBe('RUT inválido');
      }
    });

    it('debe capturar 403 Forbidden y retornar tipo NO_AUTORIZADO', async () => {
      vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
        data: undefined,
        error: { message: 'Acceso denegado' },
        response: new Response(null, { status: 403 }),
      } as unknown as Awaited<ReturnType<typeof apiClient.POST>>);

      const resultado = await crearIncidenteManual(payloadValido, 'op-sin-rol');
      expect(resultado.tipo).toBe('NO_AUTORIZADO');
    });

    it('debe capturar fallos de red y retornar tipo ERROR_CONEXION', async () => {
      vi.spyOn(apiClient, 'POST').mockRejectedValueOnce(new Error('Network error'));

      const resultado = await crearIncidenteManual(payloadValido, 'op-123');
      expect(resultado.tipo).toBe('ERROR_CONEXION');
    });
  });
});
