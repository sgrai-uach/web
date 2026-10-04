/**
 * Capa DAL (Data Access Layer) para la consulta detallada de misiones operativas.
 * Conforme a docs/architecture/architecture.md y HANDOVER_HU17_DETALLE_MISION_FRONTEND.md.
 */

import apiClient from '@/lib/api/client';
import type { MisionDetalleCompleto, MisionDetalleResponse } from '@/types/misiones';

export const DEFAULT_ENCARGADO_ID = '00000000-0000-4000-8000-000000000003';

export interface ResultadoDetalleMision {
  exito: boolean;
  datos?: MisionDetalleCompleto;
  mensaje: string;
  codigoError?: number;
}

export const misionesService = {
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
