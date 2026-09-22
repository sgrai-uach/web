import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  listarIncidentes,
  obtenerDetalleIncidente,
  DEFAULT_ENCARGADO_ID,
} from '../incidentes';
import apiClient from '../client';

vi.mock('../client', () => ({
  default: {
    GET: vi.fn(),
  },
}));

describe('Servicio API Incidentes (Encargado)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listarIncidentes', () => {
    it('debe enviar la cabecera x-user-id y retornar incidentes con paginación en respuesta exitosa 200', async () => {
      const mockData = {
        message: 'Listado obtenido exitosamente',
        data: [
          {
            id: 'a0000000-0000-4000-8000-000000000001',
            codigo: 'INC-58291045',
            codigoSeguimiento: '58291045',
            tipoAfectacion: 'Inundación',
            descripcion: 'Agua acumulada en calzada',
            direccion: 'Av. Ramón Picarte 1200',
            latitud: -39.8142,
            longitud: -73.2459,
            estado: 'REPORTADO' as const,
            prioridad: 'ALTA' as const,
            requiereAsistenciaSocial: false,
            fuenteOrigen: 'CHATBOT',
            informanteNombre: 'Juan Pérez',
            delegacionNombre: 'Sur',
            totalMisiones: 0,
            creadoEn: '2026-09-22T10:00:00.000Z',
            actualizadoEn: '2026-09-22T10:00:00.000Z',
          },
        ],
        paginacion: {
          total: 1,
          pagina: 1,
          limite: 20,
          totalPaginas: 1,
          tieneSiguiente: false,
          tieneAnterior: false,
        },
      };

      vi.mocked(apiClient.GET).mockResolvedValueOnce({
        data: mockData,
        error: undefined,
        response: { ok: true, status: 200 } as Response,
      });

      const res = await listarIncidentes({ page: 1, estado: 'REPORTADO' });

      expect(apiClient.GET).toHaveBeenCalledWith(
        '/api/incidentes',
        expect.objectContaining({
          params: {
            query: { page: 1, estado: 'REPORTADO' },
            header: { 'x-user-id': DEFAULT_ENCARGADO_ID },
          },
          headers: {
            'x-user-id': DEFAULT_ENCARGADO_ID,
          },
        })
      );
      expect(res.exito).toBe(true);
      expect(res.incidentes).toHaveLength(1);
      expect(res.incidentes[0].codigo).toBe('INC-58291045');
      expect(res.paginacion?.total).toBe(1);
    });

    it('debe identificar error 403 Forbidden cuando el usuario no tiene permisos', async () => {
      vi.mocked(apiClient.GET).mockResolvedValueOnce({
        data: undefined,
        error: { message: 'Permiso denegado' } as unknown as never,
        response: { ok: false, status: 403 } as Response,
      });

      const res = await listarIncidentes({}, 'user-no-autorizado');

      expect(res.exito).toBe(false);
      expect(res.codigoError).toBe(403);
      expect(res.mensaje).toContain('No posees permisos de Encargado');
    });

    it('debe manejar error de conexión capturado en el bloque catch', async () => {
      vi.mocked(apiClient.GET).mockRejectedValueOnce(new Error('Network error'));

      const res = await listarIncidentes();

      expect(res.exito).toBe(false);
      expect(res.codigoError).toBe(500);
      expect(res.mensaje).toContain('Error de conexión');
    });
  });

  describe('obtenerDetalleIncidente', () => {
    it('debe retornar 400 si el ID es vacío', async () => {
      const res = await obtenerDetalleIncidente('   ');
      expect(res.exito).toBe(false);
      expect(res.codigoError).toBe(400);
      expect(apiClient.GET).not.toHaveBeenCalled();
    });

    it('debe consultar /api/incidentes/{id} y retornar la información detallada con misiones y recursos', async () => {
      const mockDetalle = {
        message: 'Detalle de incidente obtenido exitosamente.',
        data: {
          id: 'a0000000-0000-4000-8000-000000000001',
          codigo: 'INC-58291045',
          codigoSeguimiento: '58291045',
          tipoAfectacion: 'Caída de árbol',
          descripcion: 'Árbol sobre tendido eléctrico',
          direccion: 'Los Robles 300',
          latitud: -39.8089,
          longitud: -73.2534,
          estado: 'EN_ATENCION' as const,
          prioridad: 'CRITICA' as const,
          requiereAsistenciaSocial: false,
          fuenteOrigen: 'LLAMADA_TELEFONICA',
          asteriskCallId: null,
          asteriskCallerPhone: null,
          informante: {
            id: 'b0000000-0000-4000-8000-000000000001',
            rut: '12.345.678-5',
            nombre: 'María González',
            telefono: '+56998877665',
          },
          delegacion: {
            id: '30000000-0000-4000-8000-000000000003',
            nombre: 'Costa',
            descripcion: 'Sector costero',
          },
          creadoPor: null,
          encargado: null,
          misiones: [
            {
              id: 'c0000000-0000-4000-8000-000000000001',
              codigo: 'MIS-2026-0001',
              titulo: 'Despeje de ramas',
              descripcion: 'Coordinación con brigada',
              tipoMision: 'ATENCION_CUADRILLA',
              estado: 'EN_CURSO',
              prioridad: 'CRITICA',
              justificacionRechazo: null,
              patrulla: null,
              cuadrilla: {
                id: 'd0000000-0000-4000-8000-000000000001',
                nombre: 'Cuadrilla Eléctrica',
                estado: 'EN_MISION',
              },
              fechaInicio: '2026-09-22T10:15:00.000Z',
              fechaCierre: null,
              creadoEn: '2026-09-22T10:05:00.000Z',
            },
          ],
          recursosAsociados: [
            {
              recursoId: 'r0000000-0000-4000-8000-000000000001',
              nombre: 'Camioneta 4x4',
              esIndividual: true,
              cantidadAsignadaTotal: 1,
              estadoRecurso: 'DISPONIBLE',
              cuadrillaNombre: 'Cuadrilla Eléctrica',
            },
          ],
          creadoEn: '2026-09-22T10:00:00.000Z',
          actualizadoEn: '2026-09-22T10:20:00.000Z',
        },
      };

      vi.mocked(apiClient.GET).mockResolvedValueOnce({
        data: mockDetalle,
        error: undefined,
        response: { ok: true, status: 200 } as Response,
      });

      const res = await obtenerDetalleIncidente('a0000000-0000-4000-8000-000000000001');

      expect(apiClient.GET).toHaveBeenCalledWith(
        '/api/incidentes/{id}',
        expect.objectContaining({
          params: {
            path: { id: 'a0000000-0000-4000-8000-000000000001' },
            header: { 'x-user-id': DEFAULT_ENCARGADO_ID },
          },
        })
      );
      expect(res.exito).toBe(true);
      expect(res.datos?.codigo).toBe('INC-58291045');
      expect(res.datos?.misiones).toHaveLength(1);
      expect(res.datos?.recursosAsociados).toHaveLength(1);
    });

    it('debe manejar error 404 cuando el incidente no existe', async () => {
      vi.mocked(apiClient.GET).mockResolvedValueOnce({
        data: undefined,
        error: { message: 'No encontrado' } as unknown as never,
        response: { ok: false, status: 404 } as Response,
      });

      const res = await obtenerDetalleIncidente('a0000000-0000-4000-8000-000000000099');

      expect(res.exito).toBe(false);
      expect(res.codigoError).toBe(404);
      expect(res.mensaje).toContain('no existe o fue dado de baja');
    });
  });
});
