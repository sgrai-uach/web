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
import { DEFAULT_ADMIN_USER_ID } from '@/lib/api/client';
import { getAuthCookie } from '@/lib/utils/cookieUtils';

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
   * Consulta el personal retornando data y meta estandarizado (ADR-004 / H34).
   * Procesa la estructura estandarizada { data, meta } y mantiene fallback resiliente a { data, paginacion }.
   */
  async getEmpleadosPaginado(
    params: EmpleadosQueryParams = {},
    token?: string
  ): Promise<ListarEmpleadosResponse> {
    try {
      const search = new URLSearchParams();
      const q = params.busqueda || params.q;
      if (q?.trim()) search.set('q', q.trim());

      const page = params.page ?? params.pagina;
      if (page) search.set('page', String(page));

      const limit = params.limit ?? params.limite;
      if (limit) search.set('limit', String(limit));

      let delId = params.delegacion_id;
      if (!delId && params.delegacionNombre && params.delegacionNombre !== 'TODAS') {
        delId = catalogosService.resolverDelegacionId(params.delegacionNombre);
      }
      if (delId) search.set('delegacion_id', delId);

      if (params.rol_id) search.set('rol_id', params.rol_id);
      const estOp = params.estadoOperativo || params.estado_operativo;
      if (estOp && estOp !== 'TODOS') search.set('estadoOperativo', estOp);
      if (params.cargo) search.set('cargo', params.cargo);
      if (params.especialidad) search.set('especialidad', params.especialidad);

      if (params.ordenar_por) search.set('ordenar_por', params.ordenar_por);
      if (params.orden) search.set('orden', params.orden);
      if (params.incluir_inactivos) search.set('incluir_inactivos', 'true');
      if (params.estado) search.set('estado', params.estado);
      if (params.limite && !params.limit) search.set('limite', params.limite.toString());
      if (params.pagina && !params.page) search.set('pagina', params.pagina.toString());

      const query = search.toString();
      const url = query ? `/api/personal?${query}` : '/api/personal';

      const headers: Record<string, string> = {};
      const authHeader = getAuthorizationHeader(token);
      if (authHeader) {
        headers['Authorization'] = authHeader;
      }
      headers['X-User-Id'] = DEFAULT_ADMIN_USER_ID;

      const res = await fetch(url, { headers });
      if (!res.ok) {
        throw new EmpleadosServiceError(
          'Error al consultar el listado de empleados.',
          res.status
        );
      }
      const json = await res.json();
      const data: EmpleadoUsuario[] = json.data || [];

      // Estandarización de meta (H34) con fallback defensivo a paginacion (HU-13)
      const metaRaw = json.meta;
      const paginacionRaw = json.paginacion;

      const meta: PaginationMeta = metaRaw
        ? {
            total: Number(metaRaw.total ?? data.length),
            page: Number(metaRaw.page ?? 1),
            limit: Number(metaRaw.limit ?? 20),
            totalPages: Number(metaRaw.totalPages ?? 1),
            hasNext: Boolean(metaRaw.hasNext),
            hasPrev: Boolean(metaRaw.hasPrev),
          }
        : paginacionRaw
        ? {
            total: Number(paginacionRaw.total ?? paginacionRaw.total_retornados ?? data.length),
            page: Number(paginacionRaw.pagina ?? paginacionRaw.page ?? 1),
            limit: Number(paginacionRaw.limite ?? paginacionRaw.limit ?? 20),
            totalPages:
              Math.ceil(
                Number(paginacionRaw.total ?? paginacionRaw.total_retornados ?? data.length) /
                  Number(paginacionRaw.limite ?? paginacionRaw.limit ?? 20)
              ) || 1,
            hasNext: Boolean(paginacionRaw.hasNext ?? false),
            hasPrev: Boolean(paginacionRaw.hasPrev ?? false),
          }
        : {
            total: data.length,
            page: Number(page || 1),
            limit: Number(limit || 20),
            totalPages: Math.ceil(data.length / Number(limit || 20)) || 1,
            hasNext: false,
            hasPrev: false,
          };

      return {
        data,
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
