/**
 * Capa DAL (Data Access Layer) para el Centro de Mando e Incidentes del Encargado.
 * Conforme a docs/architecture/architecture.md.
 */

import apiClient from '@/lib/api/client';
import type { components, paths } from '@/types/api-generated';
import type {
  IncidentesKpisData,
  DelegacionOpcion,
} from '@/types/incidentesKpis';
import { DELEGACIONES_VALDIVIA_DEFAULT } from '@/types/incidentesKpis';

export const DEFAULT_ENCARGADO_ID = '00000000-0000-4000-8000-000000000003';

export type ListarIncidentesResponse = components['schemas']['ListarIncidentesResponse'];
export type IncidenteDetalleResponse = components['schemas']['IncidenteDetalleResponse'];
export type IncidenteResumen = ListarIncidentesResponse['data'][number];
export type IncidenteDetalle = IncidenteDetalleResponse['data'];
export type PaginacionMeta = ListarIncidentesResponse['paginacion'];
export type EstadoIncidente = IncidenteResumen['estado'];
export type PrioridadIncidente = IncidenteResumen['prioridad'];
export type MisionDetalle = IncidenteDetalle['misiones'][number];
export type RecursoAsociado = IncidenteDetalle['recursosAsociados'][number];

export type ListarIncidentesQuery = NonNullable<
  paths['/api/incidentes']['get']['parameters']['query']
> & {
  soloHoy?: boolean;
  fecha?: string;
  delegacionId?: string;
};

export interface ObtenerKpisQuery {
  fecha?: string;
  delegacionId?: string;
}

export interface ResultadoKpisIncidentes {
  exito: boolean;
  datos?: IncidentesKpisData;
  mensaje: string;
  codigoError?: number;
}

export interface ResultadoListadoIncidentes {
  exito: boolean;
  incidentes: IncidenteResumen[];
  paginacion?: PaginacionMeta;
  mensaje: string;
  codigoError?: number;
}

export interface ResultadoDetalleIncidente {
  exito: boolean;
  datos?: IncidenteDetalle;
  mensaje: string;
  codigoError?: number;
}

export const incidentesService = {
  /**
   * Consulta el listado paginado y filtrado de incidentes para el tablero Kanban.
   */
  async listar(
    query: ListarIncidentesQuery = {},
    userId: string = DEFAULT_ENCARGADO_ID
  ): Promise<ResultadoListadoIncidentes> {
    try {
      const { data, error, response } = await apiClient.GET('/api/incidentes', {
        params: {
          query: query as unknown as NonNullable<
            paths['/api/incidentes']['get']['parameters']['query']
          >,
          header: { 'x-user-id': userId },
        },
        headers: { 'x-user-id': userId },
      });

      if (response?.status === 403) {
        return {
          exito: false,
          incidentes: [],
          codigoError: 403,
          mensaje: 'No posees permisos de Encargado para visualizar el tablero de incidentes.',
        };
      }

      if (response?.status === 401) {
        return {
          exito: false,
          incidentes: [],
          codigoError: 401,
          mensaje: 'Sesión no válida o no autenticada.',
        };
      }

      if (error || !response?.ok) {
        return {
          exito: false,
          incidentes: [],
          codigoError: response?.status || 500,
          mensaje: 'No fue posible cargar el listado de incidentes.',
        };
      }

      if (data?.data) {
        return {
          exito: true,
          incidentes: data.data,
          paginacion: data.paginacion,
          mensaje: data.message || 'Listado obtenido exitosamente.',
        };
      }

      return {
        exito: false,
        incidentes: [],
        codigoError: 500,
        mensaje: 'Respuesta inesperada del servidor municipal.',
      };
    } catch {
      return {
        exito: false,
        incidentes: [],
        codigoError: 500,
        mensaje: 'Error de conexión con el servidor municipal.',
      };
    }
  },

  /**
   * Consulta el detalle completo de un incidente por su UUID.
   */
  async obtenerDetalle(
    id: string,
    userId: string = DEFAULT_ENCARGADO_ID
  ): Promise<ResultadoDetalleIncidente> {
    if (!id || !id.trim()) {
      return {
        exito: false,
        codigoError: 400,
        mensaje: 'Identificador de incidente no válido.',
      };
    }

    try {
      const { data, error, response } = await apiClient.GET('/api/incidentes/{id}', {
        params: {
          path: { id: id.trim() },
          header: { 'x-user-id': userId },
        },
        headers: { 'x-user-id': userId },
      });

      if (response?.status === 403) {
        return {
          exito: false,
          codigoError: 403,
          mensaje: 'Acceso denegado al detalle del caso.',
        };
      }

      if (response?.status === 404) {
        return {
          exito: false,
          codigoError: 404,
          mensaje: 'El incidente solicitado no existe o fue dado de baja.',
        };
      }

      if (error || !response?.ok) {
        return {
          exito: false,
          codigoError: response?.status || 500,
          mensaje: 'Error al consultar el detalle del incidente.',
        };
      }

      if (data?.data) {
        return {
          exito: true,
          datos: data.data,
          mensaje: data.message || 'Detalle obtenido exitosamente.',
        };
      }

      return {
        exito: false,
        codigoError: 500,
        mensaje: 'Respuesta inesperada del servidor.',
      };
    } catch {
      return {
        exito: false,
        codigoError: 500,
        mensaje: 'Error de conexión al obtener el detalle del incidente.',
      };
    }
  },

  /**
   * Consulta los contadores y KPIs de incidentes del día (HU-18).
   * Endpoint optimizado en sgrai-api con agregación condicional SQL y horario chileno.
   */
  async obtenerKpis(
    query: ObtenerKpisQuery = {},
    userId: string = DEFAULT_ENCARGADO_ID
  ): Promise<ResultadoKpisIncidentes> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const url = new URL('/api/incidentes/kpis', baseUrl);
      if (query.fecha && query.fecha.trim()) {
        url.searchParams.set('fecha', query.fecha.trim());
      }
      if (query.delegacionId && query.delegacionId.trim()) {
        url.searchParams.set('delegacionId', query.delegacionId.trim());
      }

      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
      });

      if (res.status === 403) {
        return {
          exito: false,
          codigoError: 403,
          mensaje: 'No posees permisos de Encargado para visualizar los KPIs de incidentes.',
        };
      }

      if (res.status === 401) {
        return {
          exito: false,
          codigoError: 401,
          mensaje: 'Sesión no válida o no autenticada.',
        };
      }

      if (!res.ok) {
        return {
          exito: false,
          codigoError: res.status,
          mensaje: 'No fue posible cargar los contadores de incidentes del día.',
        };
      }

      const json = await res.json();
      if (json?.data) {
        return {
          exito: true,
          datos: json.data,
          mensaje: json.message || 'Contadores obtenidos exitosamente.',
        };
      }

      return {
        exito: false,
        codigoError: 500,
        mensaje: 'Respuesta inesperada del servidor municipal al obtener KPIs.',
      };
    } catch {
      return {
        exito: false,
        codigoError: 500,
        mensaje: 'Error de conexión con el servidor al consultar los KPIs.',
      };
    }
  },

  /**
   * Obtiene la lista de delegaciones desde el catálogo municipal con fallback.
   */
  async obtenerDelegaciones(): Promise<DelegacionOpcion[]> {
    try {
      const { data, response } = await apiClient.GET('/api/catalogos');
      if (response?.ok && data?.data?.delegaciones && Array.isArray(data.data.delegaciones)) {
        return data.data.delegaciones.map((d: { id: string; codigo: string; nombre: string }) => ({
          id: d.id,
          codigo: d.codigo,
          nombre: d.nombre,
        }));
      }
    } catch {
      // Ignorar error y usar fallback
    }
    return DELEGACIONES_VALDIVIA_DEFAULT;
  },
};

// Aliases para compatibilidad directa
export const listarIncidentes = incidentesService.listar;
export const obtenerDetalleIncidente = incidentesService.obtenerDetalle;
export const obtenerKpisIncidentes = incidentesService.obtenerKpis;
export const obtenerDelegaciones = incidentesService.obtenerDelegaciones;
