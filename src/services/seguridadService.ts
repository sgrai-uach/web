import apiClient from '@/lib/api/client';
import { formatApiError } from '@/lib/utils/errorUtils';
import type {
  ListarRolesResponse,
  PermisoAsignado,
  PermisosPorModulo,
  RolDetalleResponse,
} from '@/types/seguridad';
import type { ApiErrorResponse } from '@/types/common';

export class SeguridadServiceError extends Error {
  public apiError: ApiErrorResponse;
  public status: number;

  constructor(status: number, message: string, apiError?: ApiErrorResponse) {
    super(message);
    this.name = 'SeguridadServiceError';
    this.status = status;
    this.apiError = apiError || { message, statusCode: status };
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isBadRequest(): boolean {
    return this.status === 400;
  }
}

export { SeguridadServiceError as ApiError };

/**
 * Obtiene la lista completa de perfiles/roles y sus permisos asignados.
 * Requiere que el usuario especificado tenga rol de Administrador.
 */
export async function listarRolesYPermisos(userId: string): Promise<ListarRolesResponse> {
  const { data, error, response } = await apiClient.GET('/api/seguridad/roles', {
    params: {
      header: {
        'x-user-id': userId,
      },
    },
  });

  if (error || !data) {
    let mensaje = 'Error al consultar los roles y permisos del sistema';
    if (response.status === 403) {
      mensaje = 'Acceso denegado. Se requiere perfil de Administrador para ver este módulo.';
    } else if (response.status === 401) {
      mensaje = 'Sesión no válida o usuario no autenticado.';
    }

    const formatted = formatApiError({
      ...(typeof error === 'object' && error !== null ? error : {}),
      status: response.status,
      message: mensaje,
    });
    throw new SeguridadServiceError(response.status, formatted.message, formatted);
  }

  return data;
}

/**
 * Obtiene el detalle de un perfil específico y sus permisos.
 */
export async function obtenerDetalleRol(
  id: string,
  userId: string
): Promise<RolDetalleResponse> {
  const { data, error, response } = await apiClient.GET('/api/seguridad/roles/{id}', {
    params: {
      path: { id },
      header: {
        'x-user-id': userId,
      },
    },
  });

  if (error || !data) {
    let mensaje = 'Error al obtener el detalle del perfil';
    if (response.status === 403) {
      mensaje = 'Acceso denegado. Se requiere perfil de Administrador.';
    } else if (response.status === 404) {
      mensaje = 'El perfil solicitado no existe en el sistema.';
    }

    const formatted = formatApiError({
      ...(typeof error === 'object' && error !== null ? error : {}),
      status: response.status,
      message: mensaje,
    });
    throw new SeguridadServiceError(response.status, formatted.message, formatted);
  }

  return data;
}

/**
 * Helper para agrupar permisos por su módulo funcional (Criterio 2).
 */
export function agruparPermisosPorModulo(
  permisos: PermisoAsignado[]
): PermisosPorModulo {
  return permisos.reduce<PermisosPorModulo>((acc, permiso) => {
    const modulo = permiso.modulo?.trim() || 'General';
    if (!acc[modulo]) {
      acc[modulo] = [];
    }
    acc[modulo].push(permiso);
    return acc;
  }, {});
}
