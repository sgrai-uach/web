/**
 * Capa DAL (Data Access Layer) para el módulo de Misiones Operativas (Centro de Mando / Despacho).
 * Soporta listado paginado y filtrado táctico (HU-34) y consulta detallada (HU-17).
 * Conforme a docs/architecture/architecture.md.
 */

import apiClient from '@/lib/api/client';
import { catalogosService } from '@/services/catalogosService';
import type {
  FiltrosMisiones,
  MisionItem,
  MisionDetalleCompleto,
  MisionDetalleResponse,
} from '@/types/misiones';

export const DEFAULT_ENCARGADO_ID = '00000000-0000-4000-8000-000000000003';

export interface ResultadoListarMisiones {
  exito: boolean;
  data: MisionItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  mensaje: string;
}

export interface ResultadoDetalleMision {
  exito: boolean;
  datos?: MisionDetalleCompleto;
  mensaje: string;
  codigoError?: number;
}

export const misionesService = {
  /**
   * Consulta el listado paginado y filtrado de misiones operativas.
   */
  async listar(
    filtros: FiltrosMisiones,
    userId: string = DEFAULT_ENCARGADO_ID
  ): Promise<ResultadoListarMisiones> {
    const searchParams = new URLSearchParams();
    searchParams.set('page', String(filtros.page || 1));
    searchParams.set('limit', String(filtros.limit || 10));

    if (filtros.busqueda?.trim()) {
      searchParams.set('busqueda', filtros.busqueda.trim());
    }

    if (filtros.estado && filtros.estado !== 'TODOS') {
      searchParams.set('estado', filtros.estado);
    }

    if (filtros.tipoMision && filtros.tipoMision !== 'TODOS') {
      searchParams.set('tipoMision', filtros.tipoMision);
    }

    if (filtros.prioridad) {
      searchParams.set('prioridad', filtros.prioridad);
    }

    // Traducción transparente del nombre legible de delegación a UUID
    if (filtros.delegacion && filtros.delegacion !== 'TODAS') {
      const delegacionId = catalogosService.resolverDelegacionId(filtros.delegacion);
      if (delegacionId) {
        searchParams.set('delegacionId', delegacionId);
      }
    }

    try {
      const headers: Record<string, string> = {
        'x-user-id': userId,
      };

      const res = await fetch(`/api/misiones?${searchParams.toString()}`, {
        headers,
      });

      if (!res.ok) {
        return {
          exito: false,
          data: [],
          meta: {
            total: 0,
            page: filtros.page,
            limit: filtros.limit,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
          mensaje: `Error ${res.status} al consultar misiones.`,
        };
      }

      const json = await res.json();
      const meta = json.meta || {
        total: (json.data || []).length,
        page: filtros.page,
        limit: filtros.limit,
        totalPages: Math.ceil(((json.data || []).length || 1) / filtros.limit),
        hasNext: false,
        hasPrev: false,
      };

      return {
        exito: true,
        data: json.data || [],
        meta: {
          total: meta.total ?? 0,
          page: meta.page ?? filtros.page,
          limit: meta.limit ?? filtros.limit,
          totalPages: meta.totalPages ?? 1,
          hasNext: Boolean(meta.hasNext),
          hasPrev: Boolean(meta.hasPrev),
        },
        mensaje: 'Misiones obtenidas exitosamente.',
      };
    } catch {
      return {
        exito: false,
        data: [],
        meta: {
          total: 0,
          page: filtros.page,
          limit: filtros.limit,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
        mensaje: 'Error de conexión con el servidor municipal.',
      };
    }
  },

  /**
   * Consulta el detalle completo de una misión operativa por su UUID.
   *
   * @param id UUID de la misión
   * @param userId UUID del usuario autenticado (Encargado, Admin o Supervisor)
   */
  async obtenerDetalle(
    id: string,
    userId: string = DEFAULT_ENCARGADO_ID
  ): Promise<ResultadoDetalleMision> {
    const idLimpio = id?.trim();

    if (!idLimpio) {
      return {
        exito: false,
        codigoError: 400,
        mensaje: 'Identificador de misión no válido.',
      };
    }

    try {
      // Usamos el cliente tipado con casteo controlado para soportar el endpoint OpenAPI
      const { data, error, response } = await (apiClient as unknown as {
        GET: (
          url: string,
          options: {
            params?: { path?: Record<string, string>; header?: Record<string, string> };
            headers?: Record<string, string>;
          }
        ) => Promise<{
          data?: MisionDetalleResponse;
          error?: unknown;
          response?: Response;
        }>;
      }).GET('/api/misiones/{id}', {
        params: {
          path: { id: idLimpio },
          header: { 'x-user-id': userId },
        },
        headers: { 'x-user-id': userId },
      });

      if (response?.status === 403) {
        return {
          exito: false,
          codigoError: 403,
          mensaje:
            'No tienes permisos de Encargado o Administrador para visualizar el detalle de esta misión.',
        };
      }

      if (response?.status === 404) {
        return {
          exito: false,
          codigoError: 404,
          mensaje: 'La misión solicitada no existe o fue eliminada.',
        };
      }

      if (error || !response?.ok) {
        const errorMsg =
          typeof error === 'object' && error !== null && 'message' in error
            ? String((error as { message: unknown }).message)
            : 'Error al consultar el detalle de la misión.';

        return {
          exito: false,
          codigoError: response?.status || 500,
          mensaje: errorMsg,
        };
      }

      if (data?.data) {
        return {
          exito: true,
          datos: data.data,
          mensaje: data.message || 'Detalle de misión obtenido exitosamente.',
        };
      }

      return {
        exito: false,
        codigoError: 500,
        mensaje: 'Respuesta inesperada del servidor municipal.',
      };
    } catch {
      return {
        exito: false,
        codigoError: 500,
        mensaje: 'Error de conexión con el servidor al obtener el detalle de la misión.',
      };
    }
  },
};

export const obtenerDetalleMision = misionesService.obtenerDetalle;
export const listarMisiones = misionesService.listar;
