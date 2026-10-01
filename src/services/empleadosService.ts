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
} from '@/types/empleados';
import { getErrorMessage } from '@/lib/utils/errorUtils';
import { DEFAULT_ADMIN_USER_ID } from '@/lib/api/client';

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
      const res = await fetch('/api/catalogos');
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
  async getEmpleados(params: EmpleadosQueryParams = {}): Promise<EmpleadoUsuario[]> {
    try {
      const search = new URLSearchParams();
      if (params.q?.trim()) search.set('q', params.q.trim());
      if (params.delegacion_id) search.set('delegacion_id', params.delegacion_id);
      if (params.rol_id) search.set('rol_id', params.rol_id);
      if (params.ordenar_por) search.set('ordenar_por', params.ordenar_por);
      if (params.orden) search.set('orden', params.orden);

      const query = search.toString();
      const url = query ? `/api/personal?${query}` : '/api/personal';

      const res = await fetch(url);
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
    payload: ActualizarEmpleadoPayload
  ): Promise<EmpleadoUsuario> {
    try {
      const res = await fetch(`/api/personal/${targetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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

      const authToken =
        token ||
        (typeof document !== 'undefined'
          ? document.cookie
              .split('; ')
              .find((row) => row.startsWith('auth_token='))
              ?.split('=')[1]
          : undefined);

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      headers['X-User-Id'] = DEFAULT_ADMIN_USER_ID;

      const res = await fetch('/api/personal', {
        method: 'POST',
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
