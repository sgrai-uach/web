import apiClient, { DEFAULT_ADMIN_USER_ID } from '@/lib/api/client';
import { formatApiError } from '@/lib/utils/errorUtils';
import type {
  ListarPuntosCriticosResponse,
  FiltrosPuntosCriticosState,
  PuntoCriticoItem,
  EliminarPuntoCriticoResponse,
  PuntoCriticoDetalleResponse,
  ActualizarPuntoCriticoDTO,
} from '@/types/puntoCritico';
import type { ApiErrorResponse } from '@/types/common';

export class PuntoCriticoServiceError extends Error {
  public apiError: ApiErrorResponse;

  constructor(apiError: ApiErrorResponse) {
    super(apiError.message);
    this.name = 'PuntoCriticoServiceError';
    this.apiError = apiError;
  }
}

/**
 * Catálogo de puntos críticos sembrados para pruebas y fallback ante servidor desconectado.
 */
export const PUNTOS_CRITICOS_MOCK: PuntoCriticoItem[] = [
  {
    id: '40000000-0000-4000-8000-000000000001',
    codigo: 'PC-ANG-01',
    nombre: 'Sector Humedal Angachilla - Pasaje Los Robles',
    descripcion: 'Zona baja con riesgo recurrente de anegamiento por desborde en temporada invernal',
    tipoRiesgo: 'Inundación y anegamiento',
    prioridad: 'ALTA',
    activo: true,
    estadoTexto: 'Activo',
    latitud: -39.8456,
    longitud: -73.2389,
    delegacion: {
      id: '30000000-0000-4000-8000-000000000002',
      codigo: 'DEL_SUR',
      nombre: 'Delegación Municipal Sur',
    },
    creadoEn: '2026-06-15T12:00:00.000Z',
  },
  {
    id: '40000000-0000-4000-8000-000000000002',
    codigo: 'PC-COL-02',
    nombre: 'Ladera Collico - Calle Los Lingues',
    descripcion: 'Pendiente inestable con peligro de remoción en masa por saturación de agua',
    tipoRiesgo: 'Remoción en masa',
    prioridad: 'CRITICA',
    activo: true,
    estadoTexto: 'Activo',
    latitud: -39.8189,
    longitud: -73.2123,
    delegacion: {
      id: '30000000-0000-4000-8000-000000000004',
      codigo: 'DEL_CALLE_CALLE',
      nombre: 'Delegación Municipal Calle Calle',
    },
    creadoEn: '2026-06-18T09:30:00.000Z',
  },
  {
    id: '40000000-0000-4000-8000-000000000003',
    codigo: 'PC-NIE-03',
    nombre: 'Sector Costero Niebla - Desembocadura',
    descripcion: 'Punto de monitoreo ante marejadas anormales e impacto en infraestructura vial',
    tipoRiesgo: 'Anegamiento costero y marejadas',
    prioridad: 'MEDIA',
    activo: true,
    estadoTexto: 'Activo',
    latitud: -39.8692,
    longitud: -73.3951,
    delegacion: {
      id: '30000000-0000-4000-8000-000000000003',
      codigo: 'DEL_COSTA',
      nombre: 'Delegación Municipal Costa',
    },
    creadoEn: '2026-07-02T14:15:00.000Z',
  },
  {
    id: '40000000-0000-4000-8000-000000000004',
    codigo: 'PC-ANI-04',
    nombre: 'Avenida Pedro Aguirre Cerda - Paso Bajo Nivel',
    descripcion: 'Acumulación de aguas lluvias por colapso de sumideros en temporales intensos',
    tipoRiesgo: 'Inundación vial',
    prioridad: 'MEDIA',
    activo: true,
    estadoTexto: 'Activo',
    latitud: -39.8054,
    longitud: -73.2301,
    delegacion: {
      id: '30000000-0000-4000-8000-000000000001',
      codigo: 'DEL_NORTE',
      nombre: 'Delegación Municipal Norte',
    },
    creadoEn: '2026-07-10T11:00:00.000Z',
  },
  {
    id: '40000000-0000-4000-8000-000000000005',
    codigo: 'PC-COR-05',
    nombre: 'Población Corvi - Plaza Los Laureles',
    descripcion: 'Área recuperada con canalizaciones preventivas, en estado de observación pasiva',
    tipoRiesgo: 'Anegamiento leve',
    prioridad: 'BAJA',
    activo: false,
    estadoTexto: 'Inactivo',
    latitud: -39.8277,
    longitud: -73.2245,
    delegacion: {
      id: '30000000-0000-4000-8000-000000000004',
      codigo: 'DEL_CALLE_CALLE',
      nombre: 'Delegación Municipal Calle Calle',
    },
    creadoEn: '2026-08-01T16:45:00.000Z',
  },
];

/**
 * Aplica filtros locales a los datos mock simulando la respuesta del backend.
 */
export function filtrarPuntosCriticosMock(
  filtros: FiltrosPuntosCriticosState
): ListarPuntosCriticosResponse {
  let resultado = [...PUNTOS_CRITICOS_MOCK];

  if (filtros.delegacionId) {
    resultado = resultado.filter((p) => p.delegacion?.id === filtros.delegacionId);
  }

  if (filtros.activo !== undefined) {
    resultado = resultado.filter((p) => p.activo === filtros.activo);
  } else {
    // Por defecto únicamente mostrar puntos críticos activos (HU-56)
    resultado = resultado.filter((p) => p.activo !== false);
  }

  if (filtros.prioridad) {
    resultado = resultado.filter((p) => p.prioridad === filtros.prioridad);
  }

  if (filtros.busqueda && filtros.busqueda.trim() !== '') {
    const q = filtros.busqueda.trim().toLowerCase();
    resultado = resultado.filter(
      (p) =>
        p.codigo.toLowerCase().includes(q) ||
        p.nombre.toLowerCase().includes(q) ||
        (p.tipoRiesgo && p.tipoRiesgo.toLowerCase().includes(q)) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(q))
    );
  }

  const total = resultado.length;
  const limite = Math.max(1, filtros.limite || 10);
  const pagina = Math.max(1, filtros.pagina || 1);
  const totalPaginas = Math.max(1, Math.ceil(total / limite));

  const offset = (pagina - 1) * limite;
  const paginados = resultado.slice(offset, offset + limite);

  return {
    data: paginados,
    meta: {
      total,
      pagina,
      limite,
      totalPaginas,
    },
  };
}

/**
 * Consulta el listado paginado y filtrado de puntos críticos a la API de SGRAI.
 */
export async function getPuntosCriticos(
  filtros: FiltrosPuntosCriticosState,
  userId: string = DEFAULT_ADMIN_USER_ID,
  signal?: AbortSignal
): Promise<ListarPuntosCriticosResponse> {
  try {
    const { data, error, response } = await apiClient.GET('/api/puntos-criticos', {
      params: {
        query: {
          pagina: filtros.pagina,
          limite: filtros.limite,
          delegacionId: filtros.delegacionId,
          activo: filtros.activo,
          prioridad: filtros.prioridad,
          busqueda:
            filtros.busqueda && filtros.busqueda.trim() !== ''
              ? filtros.busqueda.trim()
              : undefined,
        },
        header: {
          'x-user-id': userId,
        },
      },
      signal,
    });

    if (response?.status === 200 && data) {
      return data;
    }

    if (error || (response && response.status >= 400)) {
      const statusCode = response?.status ?? 500;
      const apiErr = formatApiError({
        ...(typeof error === 'object' && error !== null ? error : {}),
        status: statusCode,
      });

      // Si es 403 Forbidden o 400 Bad Request, lanzar error específico para gestión RBAC en UI
      throw new PuntoCriticoServiceError({
        message: apiErr.message || `Error HTTP ${statusCode}: Acceso no autorizado o solicitud inválida`,
        statusCode,
      });
    }

    throw new PuntoCriticoServiceError({
      message: `Error HTTP ${response?.status ?? 500}: Fallo al obtener listado de puntos críticos`,
      statusCode: response?.status ?? 500,
    });
  } catch (err: unknown) {
    if ((err as Error)?.name === 'AbortError') {
      throw err;
    }

    if (err instanceof PuntoCriticoServiceError) {
      throw err;
    }

    // Si es error de conexión de red (servidor local no levantado), usar fallback mock
    const isNetworkError =
      err instanceof TypeError &&
      (err.message.includes('fetch') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError'));

    if (isNetworkError) {
      return filtrarPuntosCriticosMock(filtros);
    }

    const formatted = formatApiError(err);
    throw new PuntoCriticoServiceError(formatted);
  }
}

/**
 * Obtiene el detalle consolidado de un punto crítico por su ID para precargar el formulario.
 */
export async function getPuntoCriticoById(
  id: string,
  userId: string = DEFAULT_ADMIN_USER_ID,
  signal?: AbortSignal
): Promise<PuntoCriticoDetalleResponse> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error, response } = await (apiClient as any).GET('/api/puntos-criticos/{id}', {
      params: {
        path: { id },
        header: {
          'x-user-id': userId,
        },
      },
      signal,
    });

    if (response?.status === 200 && data) {
      return (data.data || data) as PuntoCriticoDetalleResponse;
    }

    if (error || (response && response.status >= 400)) {
      const statusCode = response?.status ?? 500;
      const apiErr = formatApiError({
        ...(typeof error === 'object' && error !== null ? error : {}),
        status: statusCode,
      });

      if (statusCode === 403) {
        throw new PuntoCriticoServiceError({
          message: 'Acceso denegado: solo usuarios con rol Administrador tienen permiso para ver este detalle.',
          statusCode: 403,
        });
      }

      if (statusCode === 404) {
        throw new PuntoCriticoServiceError({
          message: 'El punto crítico solicitado no fue encontrado en el sistema.',
          statusCode: 404,
        });
      }

      throw new PuntoCriticoServiceError({
        message: apiErr.message || `Error HTTP ${statusCode}: No fue posible obtener el detalle del punto crítico`,
        statusCode,
      });
    }

    throw new PuntoCriticoServiceError({
      message: `Error HTTP ${response?.status ?? 500}: Error al consultar punto crítico`,
      statusCode: response?.status ?? 500,
    });
  } catch (err: unknown) {
    if ((err as Error)?.name === 'AbortError') {
      throw err;
    }

    if (err instanceof PuntoCriticoServiceError) {
      throw err;
    }

    // Fallback con datos mock locales ante servidor no disponible
    const isNetworkError =
      err instanceof TypeError &&
      (err.message.includes('fetch') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError'));

    if (isNetworkError) {
      const encontrado = PUNTOS_CRITICOS_MOCK.find((p) => p.id === id);
      if (encontrado) {
        return {
          ...encontrado,
          actualizadoEn: null,
          actualizadoPorId: null,
        };
      }
      throw new PuntoCriticoServiceError({
        message: 'Punto crítico no encontrado en catálogo local.',
        statusCode: 404,
      });
    }

    const formatted = formatApiError(err);
    throw new PuntoCriticoServiceError(formatted);
  }
}

/**
 * Actualiza las características y coordenadas geoespaciales de un punto crítico.
 */
export async function actualizarPuntoCritico(
  id: string,
  body: ActualizarPuntoCriticoDTO,
  userId: string = DEFAULT_ADMIN_USER_ID
): Promise<PuntoCriticoDetalleResponse> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error, response } = await (apiClient as any).PUT('/api/puntos-criticos/{id}', {
      params: {
        path: { id },
        header: {
          'x-user-id': userId,
        },
      },
      body,
    });

    if (response?.status === 200 && data) {
      return (data.data || data) as PuntoCriticoDetalleResponse;
    }

    if (error || (response && response.status >= 400)) {
      const statusCode = response?.status ?? 500;
      const apiErr = formatApiError({
        ...(typeof error === 'object' && error !== null ? error : {}),
        status: statusCode,
      });

      if (statusCode === 409) {
        throw new PuntoCriticoServiceError({
          message:
            apiErr.message ||
            'No es posible modificar este punto crítico porque se encuentra inactivo.',
          statusCode: 409,
        });
      }

      if (statusCode === 403) {
        throw new PuntoCriticoServiceError({
          message: 'Acceso denegado: solo usuarios con rol Administrador tienen permiso para editar puntos críticos.',
          statusCode: 403,
        });
      }

      if (statusCode === 404) {
        throw new PuntoCriticoServiceError({
          message: 'El punto crítico que intenta actualizar no existe en el sistema.',
          statusCode: 404,
        });
      }

      throw new PuntoCriticoServiceError({
        message: apiErr.message || `Error HTTP ${statusCode}: No fue posible actualizar el punto crítico`,
        statusCode,
      });
    }

    throw new PuntoCriticoServiceError({
      message: `Error HTTP ${response?.status ?? 500}: Fallo al actualizar punto crítico`,
      statusCode: response?.status ?? 500,
    });
  } catch (err: unknown) {
    if (err instanceof PuntoCriticoServiceError) {
      throw err;
    }

    // Fallback con actualización de mock local si el backend no está disponible
    const isNetworkError =
      err instanceof TypeError &&
      (err.message.includes('fetch') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError'));

    if (isNetworkError) {
      const idx = PUNTOS_CRITICOS_MOCK.findIndex((p) => p.id === id);
      if (idx === -1) {
        throw new PuntoCriticoServiceError({
          message: 'Punto crítico no encontrado.',
          statusCode: 404,
        });
      }

      if (!PUNTOS_CRITICOS_MOCK[idx].activo) {
        throw new PuntoCriticoServiceError({
          message: 'No es posible modificar este punto crítico porque se encuentra inactivo.',
          statusCode: 409,
        });
      }

      const anterior = PUNTOS_CRITICOS_MOCK[idx];
      const actualizado: PuntoCriticoItem = {
        ...anterior,
        nombre: body.nombre,
        descripcion: body.descripcion !== undefined ? body.descripcion : anterior.descripcion,
        tipoRiesgo: body.tipoRiesgo !== undefined ? body.tipoRiesgo : anterior.tipoRiesgo,
        prioridad: body.prioridad,
        latitud: body.latitud,
        longitud: body.longitud,
        delegacion: body.delegacionId
          ? {
              id: body.delegacionId,
              codigo: anterior.delegacion?.codigo || 'DEL_ASIG',
              nombre: anterior.delegacion?.nombre || 'Delegación Asignada',
            }
          : anterior.delegacion,
      };

      PUNTOS_CRITICOS_MOCK[idx] = actualizado;

      return {
        ...actualizado,
        actualizadoEn: new Date().toISOString(),
        actualizadoPorId: userId,
      };
    }

    const formatted = formatApiError(err);
    throw new PuntoCriticoServiceError(formatted);
  }
}

/**
 * Desactiva lógicamente un punto crítico del catálogo operativo (HU-56).
 * Valida que el usuario tenga rol Administrador / permiso puntos_criticos:eliminar
 * y que no existan misiones preventivas activas vinculadas (Error 409 Conflict).
 */
export async function eliminarPuntoCritico(
  id: string,
  userId: string = DEFAULT_ADMIN_USER_ID,
  signal?: AbortSignal
): Promise<EliminarPuntoCriticoResponse> {
  try {
    const { data, error, response } = await apiClient.DELETE('/api/puntos-criticos/{id}', {
      params: {
        path: { id },
        header: {
          'x-user-id': userId,
        },
      },
      signal,
    });

    if (response?.status === 200 && data) {
      // Sincronizar catálogo mock local
      const mockIdx = PUNTOS_CRITICOS_MOCK.findIndex((p) => p.id === id);
      if (mockIdx !== -1) {
        PUNTOS_CRITICOS_MOCK[mockIdx].activo = false;
        PUNTOS_CRITICOS_MOCK[mockIdx].estadoTexto = 'Inactivo';
      }
      return data;
    }

    if (error || (response && response.status >= 400)) {
      const statusCode = response?.status ?? 500;
      const apiErr = formatApiError({
        ...(typeof error === 'object' && error !== null ? error : {}),
        status: statusCode,
      });

      let mensaje = apiErr.message;
      if (statusCode === 409) {
        mensaje =
          apiErr.message ||
          'No es posible eliminar el punto crítico porque cuenta con misiones preventivas activas o patrullas asignadas en terreno.';
      } else if (statusCode === 403) {
        mensaje =
          apiErr.message ||
          'Acceso denegado: No cuenta con permisos para eliminar puntos críticos.';
      } else if (statusCode === 404) {
        mensaje = apiErr.message || 'El punto crítico seleccionado no existe o ya no está disponible.';
      }

      throw new PuntoCriticoServiceError({
        message: mensaje,
        statusCode,
      });
    }

    throw new PuntoCriticoServiceError({
      message: `Error HTTP ${response?.status ?? 500}: Fallo al desactivar punto crítico`,
      statusCode: response?.status ?? 500,
    });
  } catch (err: unknown) {
    if ((err as Error)?.name === 'AbortError') {
      throw err;
    }

    if (err instanceof PuntoCriticoServiceError) {
      throw err;
    }

    const isNetworkError =
      err instanceof TypeError &&
      (err.message.includes('fetch') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError'));

    if (isNetworkError) {
      // Si el punto crítico tiene misiones preventivas activas (ej. Collico), simular bloqueo 409 Conflict
      if (id === '40000000-0000-4000-8000-000000000002') {
        throw new PuntoCriticoServiceError({
          message:
            "No es posible eliminar el punto crítico 'Sector Collico - Borde Río Calle Calle' porque cuenta con 1 misión(es) preventivas activas o patrullas asignadas en terreno (Misiones asociadas: MIS-PREV-2026-001).",
          statusCode: 409,
        });
      }

      const punto = PUNTOS_CRITICOS_MOCK.find((p) => p.id === id);
      if (!punto) {
        throw new PuntoCriticoServiceError({
          message: 'El punto crítico seleccionado no existe o ya no está disponible.',
          statusCode: 404,
        });
      }

      punto.activo = false;
      punto.estadoTexto = 'Inactivo';

      return {
        message: 'Punto crítico desactivado exitosamente del sistema.',
        id: punto.id,
        codigo: punto.codigo,
        nombre: punto.nombre,
        activo: false,
        eliminadoEn: new Date().toISOString(),
        eliminadoPorId: userId,
      };
    }

    const formatted = formatApiError(err);
    throw new PuntoCriticoServiceError(formatted);
  }
}
