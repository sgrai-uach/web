/**
 * Capa DAL (Data Access Layer) para Eventos de Prevención (HU-30).
 * Consume el endpoint POST /api/eventos-atp/prevencion y gestiona respuestas y errores.
 */

import apiClient from '@/lib/api/client';
import { DEFAULT_ENCARGADO_ID } from '@/services/incidentesService';
import { formatApiError } from '@/lib/utils/errorUtils';
import { getAuthCookie } from '@/lib/utils/cookieUtils';
import type {
  CrearEventoPrevencionPayload,
  EventoPrevencionDTO,
} from '@/types/evento-prevencion';

import type { paths } from '@/types/api-generated';

type PrevencionRequestBody = NonNullable<
  NonNullable<paths['/api/eventos-atp/prevencion']['post']['requestBody']>['content']
>['application/json'];

export type TipoConflictoPrevencion = 'PATRULLA_OCUPADA' | 'STOCK_INSUFICIENTE' | 'OTRO';

export class PrevencionServiceError extends Error {
  public statusCode?: number;
  public tipoConflicto?: TipoConflictoPrevencion;
  public fieldErrors?: Record<string, string>;
  public apiDetails?: unknown;

  constructor(
    message: string,
    options?: {
      statusCode?: number;
      tipoConflicto?: TipoConflictoPrevencion;
      fieldErrors?: Record<string, string>;
      apiDetails?: unknown;
    }
  ) {
    super(message);
    this.name = 'PrevencionServiceError';
    this.statusCode = options?.statusCode;
    this.tipoConflicto = options?.tipoConflicto;
    this.fieldErrors = options?.fieldErrors;
    this.apiDetails = options?.apiDetails;
  }
}

/**
 * Registra un nuevo evento territorial de prevención y despacha una patrulla
 * con insumos logísticos opcionales directamente en terreno (HU-30).
 */
export async function crearEventoPrevencion(
  payload: CrearEventoPrevencionPayload,
  userId: string = DEFAULT_ENCARGADO_ID,
  explicitToken?: string
): Promise<EventoPrevencionDTO> {
  try {
    const token =
      explicitToken ||
      getAuthCookie() ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('sgrai_auth_token') || localStorage.getItem('token')
        : null);

    const body: PrevencionRequestBody = {
      nombre: payload.nombre,
      descripcion: payload.descripcion,
      sector: payload.sector,
      direccionTexto: payload.direccionTexto,
      prioridad: payload.prioridad,
      delegacionId: payload.delegacionId,
      puntoCriticoId: payload.puntoCriticoId,
      latitud: payload.latitud,
      longitud: payload.longitud,
      patrullaId: payload.patrullaId,
      recursos: payload.recursos,
    };

    const { data, error, response } = await apiClient.POST('/api/eventos-atp/prevencion', {
      body,
      headers: {
        'x-user-id': userId,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (response?.status === 201 && data && 'data' in data) {
      return data.data as EventoPrevencionDTO;
    }

    const status = response?.status ?? 500;
    const errorData = (error || {}) as {
      message?: string;
      error?: string;
      details?: Record<string, string[]>;
      errors?: Array<{ campo?: string; field?: string; mensaje?: string; message?: string }>;
    };

    const mensajeError =
      errorData.message || errorData.error || `Error HTTP ${status} al crear el evento de prevención.`;

    if (status === 409) {
      const lower = mensajeError.toLowerCase();
      let tipoConflicto: TipoConflictoPrevencion = 'OTRO';

      if (lower.includes('patrulla') || lower.includes('disponible para asignación')) {
        tipoConflicto = 'PATRULLA_OCUPADA';
      } else if (lower.includes('stock') || lower.includes('bodega') || lower.includes('insuficiente')) {
        tipoConflicto = 'STOCK_INSUFICIENTE';
      }

      throw new PrevencionServiceError(mensajeError, {
        statusCode: 409,
        tipoConflicto,
        apiDetails: errorData,
      });
    }

    if (status === 400) {
      const fieldErrors: Record<string, string> = {};

      if (Array.isArray(errorData.errors)) {
        for (const err of errorData.errors) {
          const field = err.campo || err.field;
          const msg = err.mensaje || err.message;
          if (field && msg) {
            fieldErrors[field] = msg;
          }
        }
      } else if (errorData.details && typeof errorData.details === 'object') {
        for (const [key, msgs] of Object.entries(errorData.details)) {
          if (Array.isArray(msgs) && msgs.length > 0) {
            fieldErrors[key] = msgs.join('. ');
          }
        }
      }

      throw new PrevencionServiceError(mensajeError, {
        statusCode: 400,
        fieldErrors,
        apiDetails: errorData,
      });
    }

    if (status === 401) {
      throw new PrevencionServiceError('Token de sesión inválido o expirado.', {
        statusCode: 401,
        apiDetails: errorData,
      });
    }

    if (status === 403) {
      throw new PrevencionServiceError(
        'Acceso denegado. Se requiere el permiso "prevencion:eventos:crear".',
        {
          statusCode: 403,
          apiDetails: errorData,
        }
      );
    }

    if (status === 404) {
      throw new PrevencionServiceError(
        mensajeError || 'La patrulla verificadora, delegación o recurso indicado no fue encontrado.',
        {
          statusCode: 404,
          apiDetails: errorData,
        }
      );
    }

    throw new PrevencionServiceError(mensajeError, {
      statusCode: status,
      apiDetails: errorData,
    });
  } catch (err: unknown) {
    if (err instanceof PrevencionServiceError) {
      throw err;
    }
    const formatted = formatApiError(err);
    throw new PrevencionServiceError(formatted.message || 'Error inesperado de comunicación con el servidor', {
      statusCode: formatted.statusCode,
      apiDetails: formatted,
    });
  }
}
