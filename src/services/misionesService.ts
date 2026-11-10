/**
 * Capa DAL (Data Access Layer) para el módulo de Misiones Operativas (Centro de Mando / Despacho).
 * Soporta listado paginado y filtrado táctico (HU-34), consulta detallada (HU-17) y
 * despacho de cuadrillas con liberación atómica de patrulla (HU-21 / Regla ICS §3.2).
 * Conforme a docs/architecture/architecture.md.
 */

import apiClient from '@/lib/api/client';
import { getAuthCookie } from '@/lib/utils/cookieUtils';
import { catalogosService } from '@/services/catalogosService';
import type {
  FiltrosMisiones,
  MisionItem,
  MisionDetalleCompleto,
  MisionDetalleResponse,
  DespacharCuadrillaDTO,
  DespacharCuadrillaResponse,
  DespacharPatrullaPayload,
  ResultadoDespacharPatrulla,
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

export interface ResultadoDespacharCuadrilla {
  exito: boolean;
  datos?: DespacharCuadrillaResponse['data'];
  mensaje: string;
  codigoError?: number;
  codigo?: string;
  detalles?: Record<string, unknown>;
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

  /**
   * Despacha una cuadrilla operativa a un incidente táctico (HU-21).
   * Al completarse con éxito, la API ejecuta la regla ICS §3.2 liberando a la patrulla verificadora.
   *
   * @param dto Datos del despacho de cuadrilla
   * @param userId UUID del usuario que ejecuta la acción
   * @param tokenOverride Token opcional para pruebas unitarias
   */
  async despacharCuadrilla(
    dto: DespacharCuadrillaDTO,
    userId: string = DEFAULT_ENCARGADO_ID,
    tokenOverride?: string
  ): Promise<ResultadoDespacharCuadrilla> {
    try {
      const token =
        tokenOverride ||
        getAuthCookie() ||
        (typeof window !== 'undefined'
          ? localStorage.getItem('sgrai_auth_token') || localStorage.getItem('token')
          : null);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const baseUrl =
        typeof window !== 'undefined' && process.env.NODE_ENV !== 'test'
          ? ''
          : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

      const response = await fetch(`${baseUrl}/api/misiones`, {
        method: 'POST',
        headers,
        body: JSON.stringify(dto),
      });

      const data = (await response.json().catch(() => null)) as {
        message?: string;
        data?: DespacharCuadrillaResponse['data'];
        codigo?: string;
        detalles?: Record<string, unknown>;
        error?: string;
      } | null;

      if (!response.ok) {
        let mensaje = data?.message || data?.error || 'Error al despachar la cuadrilla operativa.';
        if (response.status === 409) {
          if (data?.codigo === 'VERIFICACION_EN_CURSO') {
            const patrullaNombre = (data?.detalles as Record<string, unknown> | undefined)?.patrullaNombre;
            if (data?.message) {
              mensaje = data.message;
            } else if (patrullaNombre) {
              mensaje = `No es posible despachar una cuadrilla operativa: la patrulla verificadora asignada ('${String(patrullaNombre)}') aún no ha finalizado la evaluación técnica en terreno.`;
            } else {
              mensaje = 'No es posible despachar una cuadrilla operativa: la patrulla verificadora aún no ha finalizado la evaluación técnica en terreno.';
            }
          } else {
            mensaje =
              data?.message ||
              'Conflicto al asignar cuadrilla: el recurso o el incidente ya han sido modificados.';
          }
        } else if (response.status === 403) {
          mensaje =
            data?.message ||
            'Acceso denegado. Se requiere el permiso "misiones:asignar" para despachar cuadrillas.';
        } else if (response.status === 404) {
          mensaje = data?.message || 'El incidente o la cuadrilla seleccionada no fueron encontrados.';
        }

        return {
          exito: false,
          codigoError: response.status,
          codigo: data?.codigo,
          detalles: data?.detalles,
          mensaje,
        };
      }

      return {
        exito: true,
        datos: data?.data,
        mensaje: data?.message || 'Cuadrilla despachada exitosamente.',
      };
    } catch {
      return {
        exito: false,
        codigoError: 500,
        mensaje: 'Error de conexión con el servidor al despachar la cuadrilla.',
      };
    }
  },

  /**
   * Crea una misión operativa de tipo VERIFICACION y despacha la patrulla seleccionada (HU-20).
   * Ejecuta POST /api/misiones y maneja casos de éxito (201), conflicto de concurrencia (409)
   * y control de acceso RBAC (403).
   */
  async despacharPatrulla(
    payload: DespacharPatrullaPayload,
    userId: string = DEFAULT_ENCARGADO_ID
  ): Promise<ResultadoDespacharPatrulla> {
    const incidenteId = payload.incidenteId?.trim();
    const patrullaId = payload.patrullaId?.trim();

    if (!incidenteId || !patrullaId) {
      return {
        exito: false,
        codigoError: 400,
        mensaje: 'Debe especificar el incidente y la patrulla verificadora para el despacho.',
      };
    }

    try {
      const token = typeof window !== 'undefined' ? getAuthCookie() : undefined;

      const { data, error, response } = await apiClient.POST('/api/misiones', {
        params: {
          header: {
            'x-user-id': userId,
            ...(token ? { authorization: `Bearer ${token}` } : {}),
          },
        },
        body: {
          incidenteId,
          patrullaId,
          tipoMision: 'VERIFICACION',
          titulo: payload.titulo?.trim() || undefined,
          descripcion: payload.descripcion?.trim() || undefined,
          prioridad: payload.prioridad || undefined,
        },
      });

      if (response.status === 403) {
        return {
          exito: false,
          esForbidden: true,
          codigoError: 403,
          mensaje:
            (error as { message?: string })?.message ||
            'No cuenta con el permiso requerido (misiones:asignar) para despachar patrullas.',
        };
      }

      if (response.status === 409) {
        return {
          exito: false,
          esConflicto: true,
          codigoError: 409,
          mensaje:
            (error as { message?: string })?.message ||
            'La patrulla seleccionada ya no se encuentra disponible. Por favor selecciona otra patrulla.',
        };
      }

      if (!response.ok || !data) {
        return {
          exito: false,
          codigoError: response.status,
          mensaje:
            (error as { message?: string })?.message ||
            `Error HTTP ${response.status} al despachar patrulla verificadora.`,
        };
      }

      return {
        exito: true,
        data: data.data,
        mensaje: data.message || 'Misión de verificación creada y patrulla despachada exitosamente.',
      };
    } catch {
      return {
        exito: false,
        codigoError: 500,
        mensaje: 'Error de conexión con el servidor municipal al despachar la patrulla.',
      };
    }
  },
};

export const obtenerDetalleMision = misionesService.obtenerDetalle;
export const listarMisiones = misionesService.listar;
export const despacharCuadrilla = misionesService.despacharCuadrilla;
export const despacharPatrullaVerificadora = misionesService.despacharPatrulla;
