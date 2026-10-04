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
} from '@/types/empleados';
import { getErrorMessage } from '@/lib/utils/errorUtils';
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
   * Consulta el personal filtrado y paginado/ordenado.
   */
  async getEmpleados(params: EmpleadosQueryParams = {}, token?: string): Promise<EmpleadoUsuario[]> {
    try {
      const search = new URLSearchParams();
      if (params.q?.trim()) search.set('q', params.q.trim());
      if (params.delegacion_id) search.set('delegacion_id', params.delegacion_id);
      if (params.rol_id) search.set('rol_id', params.rol_id);
      if (params.ordenar_por) search.set('ordenar_por', params.ordenar_por);
      if (params.orden) search.set('orden', params.orden);
      if (params.incluir_inactivos) search.set('incluir_inactivos', 'true');
      if (params.estado) search.set('estado', params.estado);
      if (params.limite) search.set('limite', params.limite.toString());
      if (params.pagina) search.set('pagina', params.pagina.toString());

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
      return json.data || [];
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
