/**
 * Capa DAL (Data Access Layer) para administración de personal y empleados.
 * Conforme a docs/architecture/architecture.md.
 */

import type {
  EmpleadoUsuario,
  CatalogosResponse,
  EmpleadosQueryParams,
  ActualizarEmpleadoPayload,
  FiltrosPersonalParams,
  UpdatePersonalDTO,
} from '@/types/empleados';
import type { ApiResponse } from '@/types/common';
import { formatApiError, getErrorMessage } from '@/lib/utils/errorUtils';

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
  rol_id: 'Rol',
  delegacion_id: 'Delegación',
  fecha_ingreso: 'Fecha de Ingreso',
  fecha_salida: 'Fecha de Salida',
  especialidad: 'Especialidad',
  cargo: 'Cargo',
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
      if (params.incluir_inactivos) search.set('incluir_inactivos', 'true');
      if (params.estado) search.set('estado', params.estado);
      if (params.limite) search.set('limite', params.limite.toString());
      if (params.pagina) search.set('pagina', params.pagina.toString());

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
   * Realiza la baja lógica de un empleado/usuario del sistema.
   */
  async deleteEmpleado(targetId: string): Promise<void> {
    try {
      const res = await fetch(`/api/personal/${targetId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const body = (await res.json()) as ApiResponse<unknown>;
        throw new EmpleadosServiceError(
          formatApiError(body, 'No fue posible dar de baja al empleado'),
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
};

/**
 * Funciones exportadas directamente para compatibilidad.
 */
export async function getPersonal(filtros: FiltrosPersonalParams = {}): Promise<EmpleadoUsuario[]> {
  return empleadosService.getEmpleados(filtros);
}

export async function updatePersonal(
  personalOrUsuarioId: string,
  payload: UpdatePersonalDTO
): Promise<Partial<EmpleadoUsuario>> {
  return empleadosService.updateEmpleado(personalOrUsuarioId, payload as ActualizarEmpleadoPayload);
}

export async function deletePersonal(personalOrUsuarioId: string): Promise<void> {
  return empleadosService.deleteEmpleado(personalOrUsuarioId);
}
