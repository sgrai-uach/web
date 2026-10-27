/**
 * Capa DAL (Data Access Layer) para administración de personal y empleados.
 * Conforme a docs/architecture/architecture.md.
 */

import type {
  EmpleadoUsuario,
  CatalogosResponse,
  EmpleadosQueryParams,
  ActualizarEmpleadoPayload,
  RegistrarEmpleadoPayload,
  FiltrosPersonalParams,
  UpdatePersonalDTO,
  ListarEmpleadosResponse,
  PaginationMeta,
} from '@/types/empleados';
import { getErrorMessage } from '@/lib/utils/errorUtils';
import { catalogosService } from '@/services/catalogosService';
import apiClient, { DEFAULT_ADMIN_USER_ID } from '@/lib/api/client';
import type { paths } from '@/types/api-generated';
import { getAuthCookie } from '@/lib/utils/cookieUtils';

/** Parámetros de consulta tipados de GET /api/personal (H11). */
type ListarPersonalQuery = NonNullable<paths['/api/personal']['get']['parameters']['query']>;

function getActiveUserId(userId?: string): string {
  if (userId) return userId;
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('sgrai_simulated_user_id');
      if (stored) return stored;
    } catch {
      // Ignorar fallo de lectura de localStorage
    }
  }
  return DEFAULT_ADMIN_USER_ID;
}

function getAuthorizationHeader(explicitToken?: string): string | undefined {
  const token =
    explicitToken ||
    getAuthCookie() ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('sgrai_auth_token') || localStorage.getItem('token')
      : null);

  return token ? `Bearer ${token}` : undefined;
}

export class EmpleadosServiceError extends Error {
  public status?: number;
  public detalles?: Array<{ campo: string; mensaje: string }>;

  constructor(
    message: string,
    status?: number,
    detalles?: Array<{ campo: string; mensaje: string }>
  ) {
    super(message);
    this.name = 'EmpleadosServiceError';
    this.status = status;
    this.detalles = detalles;
  }
}

const NOMBRES_CAMPOS: Record<string, string> = {
  rut: 'RUT',
  email: 'Correo Electrónico',
  telefono: 'Teléfono',
  nombres: 'Nombres',
  apellidos: 'Apellidos',
  password: 'Contraseña',
  rol_id: 'Rol',
  delegacion_id: 'Delegación',
  fecha_ingreso: 'Fecha de Ingreso',
  fecha_salida: 'Fecha de Salida',
  especialidad: 'Especialidad',
  cargo: 'Cargo',
  disponible_terreno: 'Disponibilidad para Terreno',
  observaciones: 'Observaciones',
};

export const empleadosService = {
  /**
   * Obtiene los catálogos de roles, delegaciones, cargos y especialidades.
   */
  async getCatalogos(): Promise<CatalogosResponse> {
    try {
      const headers: Record<string, string> = {};
      const authHeader = getAuthorizationHeader();
      if (authHeader) {
        headers['Authorization'] = authHeader;
      }
      headers['X-User-Id'] = DEFAULT_ADMIN_USER_ID;

      const res = await fetch('/api/catalogos', { headers });
      if (!res.ok) {
        throw new EmpleadosServiceError(
          'Error al cargar catálogos del sistema.',
          res.status
        );
      }
      const json = await res.json();
      return {
        roles: json.data?.roles || [],
        delegaciones: json.data?.delegaciones || [],
        especialidades: json.data?.especialidades || [],
        cargos: json.data?.cargos || [],
      };
    } catch (err) {
      if (err instanceof EmpleadosServiceError) throw err;
      throw new EmpleadosServiceError(
        getErrorMessage(err) || 'Error al conectar con el servidor de catálogos.'
      );
    }
  },

  /**
   * Consulta el personal retornando data y meta estandarizado (ADR-004 / H34 / H11).
   * La paginación y los filtros se resuelven en el servidor (GET /api/personal).
   */
  async getEmpleadosPaginado(
    params: EmpleadosQueryParams = {},
    token?: string,
    signal?: AbortSignal
  ): Promise<ListarEmpleadosResponse> {
    try {
      const q = params.busqueda || params.q;
      const page = params.page ?? params.pagina;
      const limit = params.limit ?? params.limite;

      let delId = params.delegacion_id;
      if (!delId && params.delegacionNombre && params.delegacionNombre !== 'TODAS') {
        delId = catalogosService.resolverDelegacionId(params.delegacionNombre);
      }

      const estOp = (params.estadoOperativo || params.estado_operativo) as string | undefined;
      const incluirInactivos = params.incluirInactivos ?? params.incluir_inactivos;

      const query: ListarPersonalQuery = {
        ...(q?.trim() ? { busqueda: q.trim() } : {}),
        ...(page ? { page } : {}),
        ...(limit ? { limit } : {}),
        ...(delId ? { delegacion_id: delId } : {}),
        ...(params.rol_id ? { rol_id: params.rol_id } : {}),
        ...(estOp && estOp !== 'TODOS'
          ? { estadoOperativo: estOp as ListarPersonalQuery['estadoOperativo'] }
          : {}),
        ...(params.cargo ? { cargo: params.cargo } : {}),
        ...(params.especialidad ? { especialidad: params.especialidad } : {}),
        ...(params.ordenar_por
          ? { ordenar_por: params.ordenar_por as ListarPersonalQuery['ordenar_por'] }
          : {}),
        ...(params.orden ? { orden: params.orden } : {}),
        ...(incluirInactivos ? { incluirInactivos: true } : {}),
        ...(params.estado ? { estado: params.estado as ListarPersonalQuery['estado'] } : {}),
      };

      const authHeader = getAuthorizationHeader(token);

      const { data, error, response } = await apiClient.GET('/api/personal', {
        params: {
          query,
          header: { authorization: authHeader ?? '' },
        },
        signal,
      });

      if (error || !data) {
        throw new EmpleadosServiceError(
          'Error al consultar el listado de empleados.',
          response?.status
        );
      }

      const lista = (data as { data?: EmpleadoUsuario[]; meta?: Record<string, unknown> }) ?? {};
      const empleados: EmpleadoUsuario[] = lista.data ?? [];

      // Estandarización de meta (H34) con fallback defensivo a paginacion (HU-13)
      const metaRaw = lista.meta as PaginationMeta | undefined;
      const paginacionRaw = (data as { paginacion?: Record<string, unknown> }).paginacion;

      const meta: PaginationMeta = metaRaw
        ? {
            total: Number(metaRaw.total ?? empleados.length),
            page: Number(metaRaw.page ?? 1),
            limit: Number(metaRaw.limit ?? 20),
            totalPages: Number(metaRaw.totalPages ?? 1),
            hasNext: Boolean(metaRaw.hasNext),
            hasPrev: Boolean(metaRaw.hasPrev),
          }
        : paginacionRaw
        ? {
            total: Number(paginacionRaw.total ?? paginacionRaw.total_retornados ?? empleados.length),
            page: Number(paginacionRaw.pagina ?? paginacionRaw.page ?? 1),
            limit: Number(paginacionRaw.limite ?? paginacionRaw.limit ?? 20),
            totalPages:
              Math.ceil(
                Number(paginacionRaw.total ?? paginacionRaw.total_retornados ?? empleados.length) /
                  Number(paginacionRaw.limite ?? paginacionRaw.limit ?? 20)
              ) || 1,
            hasNext: Boolean(paginacionRaw.hasNext ?? false),
            hasPrev: Boolean(paginacionRaw.hasPrev ?? false),
          }
        : {
            total: empleados.length,
            page: Number(page || 1),
            limit: Number(limit || 20),
            totalPages: Math.ceil(empleados.length / Number(limit || 20)) || 1,
            hasNext: false,
            hasPrev: false,
          };

      return {
        data: empleados,
        meta,
      };
    } catch (err) {
      if (err instanceof EmpleadosServiceError) throw err;
      throw new EmpleadosServiceError(
        getErrorMessage(err) || 'Error de conexión al buscar empleados.'
      );
    }
  },

  /**
   * Consulta el personal filtrado y ordenado.
   * Retorna EmpleadoUsuario[] con meta adjunto para máxima compatibilidad con callers y tests.
   */
  async getEmpleados(
    params: EmpleadosQueryParams = {},
    token?: string
  ): Promise<EmpleadoUsuario[] & { meta?: PaginationMeta }> {
    try {
      const response = await this.getEmpleadosPaginado(params, token);
      const data = [...response.data] as EmpleadoUsuario[] & { meta?: PaginationMeta };
      data.meta = response.meta;
      return data;
    } catch (err) {
      if (err instanceof EmpleadosServiceError) throw err;
      throw new EmpleadosServiceError(
        getErrorMessage(err) || 'Error de conexión al buscar empleados.'
      );
    }
  },

  /**
   * Actualiza los datos de un empleado/usuario.
   */
  async updateEmpleado(
    targetId: string,
    payload: ActualizarEmpleadoPayload,
    tokenOrUserId?: string
  ): Promise<EmpleadoUsuario> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      const authHeader = getAuthorizationHeader(tokenOrUserId);
      if (authHeader) {
        headers['Authorization'] = authHeader;
      }
      headers['X-User-Id'] = getActiveUserId(tokenOrUserId);

      const res = await fetch(`/api/personal/${targetId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.detalles && Array.isArray(data.detalles) && data.detalles.length > 0) {
          const listaErrores = data.detalles
            .map((item: { campo: string; mensaje: string }) => {
              const label = NOMBRES_CAMPOS[item.campo] || item.campo;
              return `${label}: ${item.mensaje}`;
            })
            .join(' | ');
          throw new EmpleadosServiceError(
            `Error en los datos ingresados: ${listaErrores}`,
            res.status,
            data.detalles
          );
        }
        throw new EmpleadosServiceError(
          data.error || 'Error al actualizar los datos del empleado.',
          res.status
        );
      }

      return data.data;
    } catch (err) {
      if (err instanceof EmpleadosServiceError) throw err;
      throw new EmpleadosServiceError(
        getErrorMessage(err) || 'Error al conectar con la API para actualizar.'
      );
    }
  },

  /**
   * Realiza la baja lógica de un empleado/usuario del sistema.
   */
  async deleteEmpleado(targetId: string, userId?: string, token?: string): Promise<void> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      const authHeader = getAuthorizationHeader(token);
      if (authHeader) {
        headers['Authorization'] = authHeader;
      }
      headers['X-User-Id'] = getActiveUserId(userId);

      const res = await fetch(`/api/personal/${targetId}`, {
        method: 'DELETE',
        headers,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new EmpleadosServiceError(
          data.error || data.message || 'No fue posible dar de baja al empleado',
          res.status
        );
      }
    } catch (err) {
      if (err instanceof EmpleadosServiceError) throw err;
      throw new EmpleadosServiceError(
        getErrorMessage(err) || 'Error al conectar con la API para dar de baja.'
      );
    }
  },

  /**
   * Registra a un nuevo funcionario o empleado en el sistema.
   * Conecta con POST /api/personal y maneja errores semánticos (409 colisión, 422 validación).
   */
  async createEmpleado(
    payload: RegistrarEmpleadoPayload,
    token?: string
  ): Promise<EmpleadoUsuario> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const authHeader = getAuthorizationHeader(token);
      if (authHeader) {
        headers['Authorization'] = authHeader;
      }
      headers['X-User-Id'] = DEFAULT_ADMIN_USER_ID;

      const res = await fetch('/api/personal', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          throw new EmpleadosServiceError(
            data.error ||
              data.message ||
              'Sesión expirada o no autenticada. Se requiere iniciar sesión con permisos de gestión de personal.',
            401
          );
        }

        if (res.status === 403) {
          throw new EmpleadosServiceError(
            data.error ||
              data.message ||
              'Acceso denegado. No dispone del permiso requerido (personal:crear) para registrar funcionarios en el sistema.',
            403
          );
        }

        if (data.detalles && Array.isArray(data.detalles) && data.detalles.length > 0) {
          const listaErrores = data.detalles
            .map((item: { campo: string; mensaje: string }) => {
              const label = NOMBRES_CAMPOS[item.campo] || item.campo;
              return `${label}: ${item.mensaje}`;
            })
            .join(' | ');
          throw new EmpleadosServiceError(
            `Error en los datos ingresados: ${listaErrores}`,
            res.status,
            data.detalles
          );
        }

        // Manejo específico para 409 Conflict (anti-colisión)
        if (res.status === 409) {
          const msg = data.error || data.message || 'Conflicto en datos ingresados.';
          const detalles: Array<{ campo: string; mensaje: string }> = [];
          if (/rut/i.test(msg) || data.campo === 'rut') {
            detalles.push({ campo: 'rut', mensaje: msg });
          } else if (/correo|email/i.test(msg) || data.campo === 'email') {
            detalles.push({ campo: 'email', mensaje: msg });
          }
          throw new EmpleadosServiceError(msg, res.status, detalles);
        }

        throw new EmpleadosServiceError(
          data.error || data.message || 'Error al registrar el nuevo funcionario.',
          res.status
        );
      }

      return data.data;
    } catch (err) {
      if (err instanceof EmpleadosServiceError) throw err;
      throw new EmpleadosServiceError(
        getErrorMessage(err) || 'Error al conectar con la API para registrar funcionario.'
      );
    }
  },
};

export const createEmpleado = (payload: RegistrarEmpleadoPayload, token?: string) =>
  empleadosService.createEmpleado(payload, token);

export async function getPersonal(filtros: FiltrosPersonalParams = {}): Promise<EmpleadoUsuario[]> {
  return empleadosService.getEmpleados(filtros);
}

export async function getPersonalPaginado(
  params: EmpleadosQueryParams = {},
  token?: string
): Promise<ListarEmpleadosResponse> {
  return empleadosService.getEmpleadosPaginado(params, token);
}

export const getEmpleadosPaginado = (params: EmpleadosQueryParams = {}, token?: string) =>
  empleadosService.getEmpleadosPaginado(params, token);

export async function updatePersonal(
  personalOrUsuarioId: string,
  payload: UpdatePersonalDTO,
  userId?: string
): Promise<Partial<EmpleadoUsuario>> {
  return empleadosService.updateEmpleado(personalOrUsuarioId, payload as ActualizarEmpleadoPayload, userId);
}

export async function deletePersonal(personalOrUsuarioId: string, userId?: string): Promise<void> {
  return empleadosService.deleteEmpleado(personalOrUsuarioId, userId);
}
