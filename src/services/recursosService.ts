import apiClient from '@/lib/api/client';
import { formatApiError } from '@/lib/utils/errorUtils';
import type { CrearRecursoDTO, RecursoCreado } from '@/types/recurso';
import type { ApiErrorResponse } from '@/types/common';

export class RecursoServiceError extends Error {
  public apiError: ApiErrorResponse;

  constructor(apiError: ApiErrorResponse) {
    super(apiError.message);
    this.name = 'RecursoServiceError';
    this.apiError = apiError;
  }
}

/**
 * Servicio para la gestión de recursos logísticos.
 * Capa DAL pura sin acoplamiento a React o hooks.
 */
export async function crearRecurso(payload: CrearRecursoDTO): Promise<RecursoCreado> {
  try {
    const { data, error, response } = await apiClient.POST('/api/recursos', {
      body: payload,
    });

    if (response.status === 201 && data?.data) {
      return data.data;
    }

    if (error) {
      const formatted = formatApiError({
        ...error,
        status: response.status,
      });
      throw new RecursoServiceError(formatted);
    }

    throw new RecursoServiceError({
      message: 'No fue posible completar la creación del recurso. Intente nuevamente.',
      statusCode: response.status,
    });
  } catch (err: unknown) {
    if (err instanceof RecursoServiceError) {
      throw err;
    }

    const formatted = formatApiError(err);
    throw new RecursoServiceError(formatted);
  }
}
