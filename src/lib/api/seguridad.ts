/**
 * Servicios de comunicación con sgrai-api para el módulo de Seguridad (Roles y Permisos).
 * 
 * Cumple con GEMINI.md § 4 usando openapi-fetch y tipos generados.
 */

import apiClient from './client';
import type {
  ListarRolesResponse,
  PermisoAsignado,
  PermisosPorModulo,
  RolDetalleResponse,
} from '@/types/api';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
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

/**
 * Obtiene la lista completa de perfiles/roles y sus permisos asignados.
 * Requiere que el usuario especificado tenga rol de Administrador.
 */
export async function listarRolesYPermisos(
  userId: string
): Promise<ListarRolesResponse> {
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
    } else if (error && typeof error === 'object' && 'error' in error) {
      mensaje = String((error as { error?: string }).error || mensaje);
    }

    throw new ApiError(response.status, mensaje, error);
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

    throw new ApiError(response.status, mensaje, error);
  }

  return data;
}

/**
 * Helper para agrupar permisos por su módulo funcional (Criterio 2).
 * Por ejemplo: "Seguridad", "Incidentes", "Recursos y Personal", "Misiones", "Eventos ATP".
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
