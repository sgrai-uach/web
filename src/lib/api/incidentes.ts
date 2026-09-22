/**
 * Servicio cliente para el Tablero Kanban y Detalle de Incidentes (Encargado).
 *
 * Utiliza openapi-fetch con los tipos generados de sgrai-api v0.6.0.
 * Ver GEMINI.md § 4 y § 5.
 */

import apiClient from './client';
import type { components, paths } from '@/types/api-generated';

export const DEFAULT_ENCARGADO_ID = '00000000-0000-4000-8000-000000000003';

export type IncidenteResumen = components['schemas']['IncidenteResumen'];
export type IncidenteDetalle = components['schemas']['IncidenteDetalle'];
export type PaginacionMeta = components['schemas']['PaginacionMeta'];
export type EstadoIncidente = IncidenteResumen['estado'];
export type PrioridadIncidente = IncidenteResumen['prioridad'];
export type MisionDetalle = components['schemas']['MisionDetalle'];
export type RecursoAsociado = components['schemas']['RecursoAsociado'];

export type ListarIncidentesQuery = NonNullable<
  paths['/api/incidentes']['get']['parameters']['query']
>;

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

/**
 * Consulta el listado paginado y filtrado de incidentes para el tablero Kanban.
 * Envía la cabecera 'x-user-id' para la validación RBAC (permiso incidentes:kanban).
 */
export async function listarIncidentes(
  query: ListarIncidentesQuery = {},
  userId: string = DEFAULT_ENCARGADO_ID
): Promise<ResultadoListadoIncidentes> {
  try {
    const { data, error, response } = await apiClient.GET('/api/incidentes', {
      params: {
        query,
        header: {
          'x-user-id': userId,
        },
      },
      headers: {
        'x-user-id': userId,
      },
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
}

/**
 * Consulta la información exhaustiva de un incidente específico por su UUID.
 */
export async function obtenerDetalleIncidente(
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
        header: {
          'x-user-id': userId,
        },
      },
      headers: {
        'x-user-id': userId,
      },
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
}
