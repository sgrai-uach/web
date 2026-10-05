import apiClient, { DEFAULT_ADMIN_USER_ID } from '@/lib/api/client';
import { formatApiError } from '@/lib/utils/errorUtils';
import type {
  ListarPuntosCriticosResponse,
  FiltrosPuntosCriticosState,
  PuntoCriticoItem,
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
