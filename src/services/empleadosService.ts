import type { EmpleadoUsuario, FiltrosPersonalParams, UpdatePersonalDTO } from '@/types/empleados';
import type { ApiResponse } from '@/types/common';
import { formatApiError } from '@/lib/utils/errorUtils';

/**
 * Consulta la lista de funcionarios con filtros de búsqueda y ordenamiento.
 */
export async function getPersonal(filtros: FiltrosPersonalParams = {}): Promise<EmpleadoUsuario[]> {
  const params = new URLSearchParams();

  if (filtros.q && filtros.q.trim()) {
    params.set('q', filtros.q.trim());
  }
  if (filtros.delegacion_id) {
    params.set('delegacion_id', filtros.delegacion_id);
  }
  if (filtros.rol_id) {
    params.set('rol_id', filtros.rol_id);
  }
  if (filtros.ordenar_por) {
    params.set('ordenar_por', filtros.ordenar_por);
  }
  if (filtros.orden) {
    params.set('orden', filtros.orden);
  }

  const query = params.toString();
  const url = query ? `/api/personal?${query}` : '/api/personal';

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const body = (await res.json()) as ApiResponse<EmpleadoUsuario[]>;

  if (!res.ok) {
    throw new Error(formatApiError(body, 'Error al consultar la lista de empleados'));
  }

  return body.data || [];
}

/**
 * Actualiza los datos de un empleado o usuario del sistema.
 */
export async function updatePersonal(
  personalOrUsuarioId: string,
  payload: UpdatePersonalDTO
): Promise<Partial<EmpleadoUsuario>> {
  const res = await fetch(`/api/personal/${personalOrUsuarioId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const body = (await res.json()) as ApiResponse<Partial<EmpleadoUsuario>>;

  if (!res.ok) {
    throw new Error(formatApiError(body, 'Error al actualizar los datos del empleado'));
  }

  return body.data;
}

/**
 * Realiza la baja lógica de un empleado/usuario del sistema.
 */
export async function deletePersonal(personalOrUsuarioId: string): Promise<void> {
  const res = await fetch(`/api/personal/${personalOrUsuarioId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const body = (await res.json()) as ApiResponse<unknown>;

  if (!res.ok) {
    throw new Error(formatApiError(body, 'No fue posible dar de baja al empleado'));
  }
}
