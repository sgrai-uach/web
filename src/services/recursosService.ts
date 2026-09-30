import apiClient, { DEFAULT_ADMIN_USER_ID } from '@/lib/api/client';
import { formatApiError } from '@/lib/utils/errorUtils';
import type {
  CrearRecursoDTO,
  RecursoCreado,
  ListarRecursosResponse,
  FiltrosRecursosState,
  EliminarRecursoResponse,
} from '@/types/recurso';
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
export async function crearRecurso(
  payload: CrearRecursoDTO,
  userId: string = DEFAULT_ADMIN_USER_ID
): Promise<RecursoCreado> {
  try {
    const { data, error, response } = await apiClient.POST('/api/recursos', {
      params: {
        header: {
          'x-user-id': userId,
        },
      },
      body: payload,
    });

    if (response.status === 201 && data?.data) {
      return data.data;
    }

    if (error) {
      const formatted = formatApiError({
        ...(typeof error === 'object' && error !== null ? error : {}),
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

/**
 * Obtiene el listado paginado y filtrado de recursos logísticos.
 */
export async function getRecursos(
  filtros: FiltrosRecursosState,
  userId: string = DEFAULT_ADMIN_USER_ID,
  signal?: AbortSignal
): Promise<ListarRecursosResponse> {
  try {
    const { data, error, response } = await apiClient.GET('/api/recursos', {
      params: {
        query: {
          pagina: filtros.pagina,
          limite: filtros.limite,
          delegacionId: filtros.delegacionId,
          estado: filtros.estado,
          esIndividual: filtros.esIndividual,
          busqueda: filtros.busqueda && filtros.busqueda.trim() !== '' ? filtros.busqueda.trim() : undefined,
        },
        header: {
          'x-user-id': userId,
        },
      },
      signal,
    });

    if (response.status === 200 && data) {
      return data as unknown as ListarRecursosResponse;
    }

    if (error) {
      throw new RecursoServiceError(
        formatApiError({
          ...(typeof error === 'object' && error !== null ? error : {}),
          status: response.status,
        })
      );
    }

    throw new RecursoServiceError({
      message: `Error HTTP ${response.status}: Fallo al obtener inventario`,
      statusCode: response.status,
    });
  } catch (err: unknown) {
    if (err instanceof RecursoServiceError) {
      throw err;
    }
    throw new RecursoServiceError(formatApiError(err));
  }
}

/**
 * Da de baja lógicamente un recurso logístico en el inventario.
 * Bloqueado por la API si el recurso está en uso en terreno o en misión activa (409 Conflict).
 */
export async function eliminarRecurso(
  id: string,
  userId: string = DEFAULT_ADMIN_USER_ID
): Promise<EliminarRecursoResponse> {
  try {
    const { data, error, response } = await apiClient.DELETE('/api/recursos/{id}', {
      params: {
        path: { id },
        header: {
          'x-user-id': userId,
        },
      },
    });

    if (response.status === 200 && data) {
      return data as EliminarRecursoResponse;
    }

    if (error) {
      const formatted = formatApiError({
        ...(typeof error === 'object' && error !== null ? error : {}),
        status: response.status,
      });
      throw new RecursoServiceError(formatted);
    }

    throw new RecursoServiceError({
      message: `Error HTTP ${response.status}: No fue posible dar de baja el recurso`,
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

