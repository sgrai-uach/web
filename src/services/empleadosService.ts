/**
 * Capa DAL (Data Access Layer) para administración de personal y empleados.
 * Conforme a docs/architecture/architecture.md.
 */

import type {
  EmpleadoUsuario,
  CatalogosResponse,
  EmpleadosQueryParams,
  ActualizarEmpleadoPayload,
} from '@/types/empleados';
import { getErrorMessage } from '@/lib/utils/errorUtils';
import { catalogosService } from '@/services/catalogosService';

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
      const q = params.busqueda || params.q;
      if (q?.trim()) search.set('q', q.trim());
      if (params.page) search.set('page', String(params.page));
      if (params.limit) search.set('limit', String(params.limit));

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
};
