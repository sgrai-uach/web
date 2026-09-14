import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../client';
import {
  obtenerTiposAfectacion,
  verificarDuplicado,
  crearIncidenteManual,
} from '../incidentes-manuales';
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
          data: {
            hayDuplicados: true,
            coincidencias: [
              {
                id: 'dup-1',
                codigo: 'INC-0001',
                tipoAfectacion: 'Anegamiento',
                direccion: 'Av. Alemania 550',
                estado: 'SIN_ATENDER',
                distanciaMetros: 25.4,
                creadoEn: '2026-09-13T12:00:00Z',
                origen: 'incidente',
              },
            ],
          },
        },
        error: undefined,
        response: new Response(null, { status: 200 }),
      } as unknown as Awaited<ReturnType<typeof apiClient.POST>>);

      const res = await verificarDuplicado(
        { tipoAfectacion: 'Anegamiento', direccion: 'Av. Alemania 550' },
        'operador-uuid-123'
      );

      expect(mockPost).toHaveBeenCalledWith(
        '/api/incidentes/verificar-duplicado',
        expect.objectContaining({
          headers: { 'X-User-Id': 'operador-uuid-123' },
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
      });

      expect(res.hayDuplicados).toBe(false);
      expect(res.coincidencias).toEqual([]);
    });
  });

  describe('crearIncidenteManual', () => {
    const payloadValido = {
      origenReporte: 'LLAMADA_TELEFONICA' as const,
      tipoAfectacion: 'Anegamiento',
      descripcion: 'Agua sube 20 cm en la calzada',
      direccion: 'Av. Alemania 550',
      informanteNombre: 'Juan Pérez',
      informanteRut: '11.111.111-1',
      prioridad: 'MEDIA' as const,
      requiereAsistenciaSocial: false,
    };

    it('debe manejar 201 Created exitosamente retornando códigos de incidente y aviso', async () => {
      vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
        data: {
          message: 'Incidente y aviso creados con éxito',
          data: {
            incidente: {
              id: 'inc-123',
              codigo: 'INC-0089',
              tipoAfectacion: 'Anegamiento',
              direccion: 'Av. Alemania 550',
              estado: 'SIN_ATENDER',
              prioridad: 'MEDIA',
              requiereAsistenciaSocial: false,
              creadoEn: '2026-09-13T14:00:00Z',
            },
            aviso: {
              id: 'av-456',
              codigoSeguimiento: '84920194',
              origenReporte: 'LLAMADA_TELEFONICA',
            },
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
        expect(resultado.datos.estado).toBe('SIN_ATENDER');
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
