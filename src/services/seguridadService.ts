import apiClient from '@/lib/api/client';
import { formatApiError } from '@/lib/utils/errorUtils';
import type {
  ActualizarPermisosRolResponse,
  ListarRolesResponse,
  PermisoAsignado,
  PermisoCatalogoItem,
  PermisosCatalogoPorModulo,
  PermisosPorModulo,
  RolDetalleResponse,
  RolItem,
  UsuarioActivoDetalle,
} from '@/types/seguridad';
import type { ApiErrorResponse } from '@/types/common';

interface ExtendedClient {
  GET: {
    (
      url: '/api/seguridad/permisos',
      init?: { params?: { header?: { 'x-user-id': string } } }
    ): Promise<{
      data?: { data?: PermisoCatalogoItem[] } | PermisoCatalogoItem[];
      error?: unknown;
      response: Response;
    }>;
    (
      url: '/api/seguridad/usuario-activo',
      init?: { params?: { header?: { 'x-user-id'?: string; authorization?: string } } }
    ): Promise<{
      data?: { data?: UsuarioActivoDetalle };
      error?: unknown;
      response: Response;
    }>;
  };
  POST: (
    url: '/api/seguridad/login',
    init: { body: import('@/types/seguridad').LoginRequest }
  ) => Promise<{
    data?: import('@/types/seguridad').LoginResponse;
    error?: unknown;
    response: Response;
  }>;
  PUT: (
    url: '/api/seguridad/roles/{id}/permisos',
    init?: {
      params?: { path?: { id: string }; header?: { 'x-user-id': string } };
      body?: { permisoIds: string[] };
    }
  ) => Promise<{
    data?: { message?: string; data?: RolItem };
    error?: unknown;
    response: Response;
  }>;
}

const extendedClient = apiClient as unknown as ExtendedClient;

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
 * Obtiene el catálogo completo de todos los permisos disponibles en el sistema (HU-5).
 * Criterio 2: Desplegar lista completa de módulos y permisos disponibles.
 */
export async function obtenerCatalogoPermisos(
  userId: string
): Promise<PermisoCatalogoItem[]> {
  try {
    const { data, error, response } = await extendedClient.GET(
      '/api/seguridad/permisos',
      {
        params: {
          header: {
            'x-user-id': userId,
          },
        },
      }
    );

    if (error || !data) {
      let mensaje = 'Error al consultar el catálogo de permisos del sistema';
      if (response?.status === 403) {
        mensaje = 'Acceso denegado. Se requiere perfil de Administrador.';
      } else if (response?.status === 401) {
        mensaje = 'Sesión no válida o no autenticada.';
      } else if (response?.status === 404) {
        mensaje = 'Endpoint de catálogo de permisos no encontrado en el servidor.';
      }

      const formatted = formatApiError({
        ...(typeof error === 'object' && error !== null ? error : {}),
        status: response?.status || 500,
        message: mensaje,
      });
      throw new SeguridadServiceError(response?.status || 500, formatted.message, formatted);
    }

    const lista = Array.isArray(data) ? data : data.data || [];
    return lista;
  } catch (err: unknown) {
    if (err instanceof SeguridadServiceError) throw err;
    const formatted = formatApiError(err);
    throw new SeguridadServiceError(500, formatted.message, formatted);
  }
}

/**
 * Asigna o revoca permisos a un perfil específico (HU-5).
 * Criterio 3 y 4: Persistir selección masiva y retornar confirmación.
 */
export async function actualizarPermisosRol(
  rolId: string,
  permisoIds: string[],
  userId: string
): Promise<ActualizarPermisosRolResponse> {
  try {
    const { data, error, response } = await extendedClient.PUT(
      '/api/seguridad/roles/{id}/permisos',
      {
        params: {
          path: { id: rolId },
          header: {
            'x-user-id': userId,
          },
        },
        body: {
          permisoIds,
        },
      }
    );

    if (error || !response || response.status >= 400) {
      let mensaje = 'Error al actualizar los permisos del perfil';
      if (response?.status === 403) {
        mensaje = 'Acceso denegado. Se requiere perfil de Administrador.';
      } else if (response?.status === 404) {
        mensaje = 'El perfil especificado no existe en el sistema.';
      } else if (response?.status === 400) {
        const errObj = error as { message?: unknown; error?: unknown } | null;
        if (errObj && typeof errObj.error === 'string') {
          mensaje = errObj.error;
        } else if (errObj && typeof errObj.message === 'string') {
          mensaje = errObj.message;
        } else {
          mensaje = 'Parámetros inválidos para actualización de permisos.';
        }
      }

      const formatted = formatApiError({
        ...(typeof error === 'object' && error !== null ? error : {}),
        status: response?.status || 500,
        message: mensaje,
      });
      throw new SeguridadServiceError(response?.status || 500, formatted.message, formatted);
    }

    return {
      message: data?.message || 'Permisos actualizados correctamente en la base de datos',
      data: data?.data,
    };
  } catch (err: unknown) {
    if (err instanceof SeguridadServiceError) throw err;
    const formatted = formatApiError(err);
    throw new SeguridadServiceError(500, formatted.message, formatted);
  }
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

/**
 * Helper para agrupar el catálogo de permisos por módulo funcional.
 */
export function agruparCatalogoPorModulo(
  permisos: PermisoCatalogoItem[]
): PermisosCatalogoPorModulo {
  return permisos.reduce<PermisosCatalogoPorModulo>((acc, permiso) => {
    const modulo = permiso.modulo?.trim() || 'General';
    if (!acc[modulo]) {
      acc[modulo] = [];
    }
    acc[modulo].push(permiso);
    return acc;
  }, {});
}

/**
 * Inicia sesión en el sistema con identificador (correo corporativo o RUT) y contraseña.
 */
export async function loginUsuario(
  credenciales: import('@/types/seguridad').LoginRequest
): Promise<import('@/types/seguridad').LoginResponseData> {
  try {
    const { data, error, response } = await extendedClient.POST('/api/seguridad/login', {
      body: credenciales,
    });

    if (error || !data || !data.data) {
      let mensaje = 'Error al procesar el inicio de sesión.';
      const errObj = error as { error?: string; message?: string } | null;

      if (response?.status === 401) {
        mensaje = 'Credenciales inválidas. Verifique su identificador o contraseña.';
      } else if (response?.status === 403) {
        const apiMsg = (errObj?.error || errObj?.message || '').toLowerCase();
        if (apiMsg.includes('inactiv') || apiMsg.includes('deshabilitad')) {
          mensaje = 'El usuario se encuentra inactivo en el sistema. Contacte al Administrador.';
        } else {
          // Bloqueo temporal por seguridad: se ofusca el tiempo de bloqueo intencionalmente
          mensaje =
            'Cuenta bloqueada temporalmente por seguridad debido a múltiples intentos fallidos. Intente más tarde o contacte al Administrador.';
        }
      } else if (response?.status === 400) {
        mensaje = errObj?.error || 'Datos de entrada inválidos. Complete todos los campos.';
      } else if (response?.status >= 500) {
        mensaje = 'Error interno del servidor al procesar el inicio de sesión.';
      }

      const formatted = formatApiError({
        ...(typeof error === 'object' && error !== null ? error : {}),
        status: response?.status || 500,
        message: mensaje,
      });
      throw new SeguridadServiceError(response?.status || 500, formatted.message, formatted);
    }

    return data.data;
  } catch (err: unknown) {
    if (err instanceof SeguridadServiceError) throw err;
    const formatted = formatApiError(err);
    throw new SeguridadServiceError(500, formatted.message, formatted);
  }
}

/**
 * Consulta la sesión e introspección de permisos del usuario activo.
 */
export async function obtenerUsuarioActivo(
  userId?: string
): Promise<UsuarioActivoDetalle> {
  try {
    const params = userId
      ? {
          params: {
            header: {
              'x-user-id': userId,
            },
          },
        }
      : undefined;

    const { data, error, response } = await extendedClient.GET(
      '/api/seguridad/usuario-activo',
      params
    );

    if (error || !data || !('data' in data) || !data.data) {
      let mensaje = 'Error al consultar la sesión y permisos del usuario activo';
      if (response?.status === 401) {
        mensaje = 'Sesión no válida o usuario no autenticado.';
      } else if (response?.status === 403) {
        mensaje = 'Acceso denegado al perfil de usuario.';
      }

      const formatted = formatApiError({
        ...(typeof error === 'object' && error !== null ? error : {}),
        status: response?.status || 500,
        message: mensaje,
      });
      throw new SeguridadServiceError(response?.status || 500, formatted.message, formatted);
    }

    return data.data;
  } catch (err: unknown) {
    if (err instanceof SeguridadServiceError) throw err;
    const formatted = formatApiError(err);
    throw new SeguridadServiceError(500, formatted.message, formatted);
  }
}

