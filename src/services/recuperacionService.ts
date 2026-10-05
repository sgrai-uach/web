import apiClient from '@/lib/api/client';
import { DEFAULT_ENCARGADO_ID } from '@/services/incidentesService';
import { formatApiError } from '@/lib/utils/errorUtils';
import type {
  CrearEventoRecuperacionInput,
  EventoRecuperacionResponse,
} from '@/types/recuperacion';

export type TipoConflictoRecuperacion = 'PATRULLA_OCUPADA' | 'STOCK_INSUFICIENTE' | 'OTRO';

export class RecuperacionServiceError extends Error {
  public statusCode?: number;
  public tipoConflicto?: TipoConflictoRecuperacion;
  public fieldErrors?: Record<string, string>;
  public apiDetails?: unknown;

  constructor(
    message: string,
    options?: {
      statusCode?: number;
      tipoConflicto?: TipoConflictoRecuperacion;
      fieldErrors?: Record<string, string>;
      apiDetails?: unknown;
    }
  ) {
    super(message);
    this.name = 'RecuperacionServiceError';
    this.statusCode = options?.statusCode;
    this.tipoConflicto = options?.tipoConflicto;
    this.fieldErrors = options?.fieldErrors;
    this.apiDetails = options?.apiDetails;
  }
}

/**
 * Registra un nuevo evento territorial de recuperación y despacha una patrulla
 * con insumos logísticos asignados directamente en terreno (HU-29).
 */
export async function crearEventoRecuperacion(
  input: CrearEventoRecuperacionInput,
  userId: string = DEFAULT_ENCARGADO_ID
): Promise<EventoRecuperacionResponse> {
  try {
    const { data, error, response } = await apiClient.POST('/api/eventos-atp/recuperacion', {
      params: {
        header: {
          'x-user-id': userId,
        },
      },
      body: input,
    });

    if (response.status === 201 && data?.data) {
      return data.data as EventoRecuperacionResponse;
    }

    const status = response.status;
    const errorData = (error || {}) as {
      message?: string;
      error?: string;
      details?: Record<string, string[]>;
      errors?: Array<{ campo?: string; field?: string; mensaje?: string; message?: string }>;
    };

    const mensajeError =
      errorData.message || errorData.error || `Error HTTP ${status} al crear el evento de recuperación.`;

    if (status === 409) {
      const lower = mensajeError.toLowerCase();
      let tipoConflicto: TipoConflictoRecuperacion = 'OTRO';

      if (lower.includes('patrulla') || lower.includes('disponible para asignación')) {
        tipoConflicto = 'PATRULLA_OCUPADA';
      } else if (lower.includes('stock') || lower.includes('bodega') || lower.includes('insuficiente')) {
        tipoConflicto = 'STOCK_INSUFICIENTE';
      }

      throw new RecuperacionServiceError(mensajeError, {
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

      throw new RecuperacionServiceError(mensajeError, {
        statusCode: 400,
        fieldErrors,
        apiDetails: errorData,
      });
    }

    if (status === 403) {
      throw new RecuperacionServiceError(
        'No posee el permiso requerido: recuperacion:crear. Requiere rol de Encargado o Administrador.',
        {
          statusCode: 403,
          apiDetails: errorData,
        }
      );
    }

    if (status === 404) {
      throw new RecuperacionServiceError(
        mensajeError || 'La patrulla verificadora o recurso indicado no fue encontrado.',
        {
          statusCode: 404,
          apiDetails: errorData,
        }
      );
    }

    throw new RecuperacionServiceError(mensajeError, {
      statusCode: status,
      apiDetails: errorData,
    });
  } catch (err: unknown) {
    if (err instanceof RecuperacionServiceError) {
      throw err;
    }
    const formatted = formatApiError(err);
    throw new RecuperacionServiceError(formatted.message || 'Error inesperado de comunicación con el servidor', {
      statusCode: formatted.statusCode,
      apiDetails: formatted,
    });
  }
}
