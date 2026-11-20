/**
 * Capa DAL (Data Access Layer) para Eventos de Prevención (HU-30).
 * Consume el endpoint POST /api/eventos-atp/prevencion y gestiona respuestas y errores.
 */

import apiClient from '@/lib/api/client';
import { DEFAULT_ENCARGADO_ID } from '@/services/incidentesService';
import { formatApiError } from '@/lib/utils/errorUtils';
import { getAuthCookie } from '@/lib/utils/cookieUtils';
import type {
  CrearEventoPrevencionPayload,
  EditarEventoPrevencionPayload,
  EventoPrevencionDTO,
  ListarEventosPrevencionParams,
  ListarEventosPrevencionResponse,
  EventoPrevencionListItemDTO,
  PaginacionMetaH34,
  DetalleEventoPrevencionDTO,
  DetalleEventoPrevencionResponse,
  MisionPrevencionHistorialItem,
  RecursoAsignadoPrevencionDetalle,
  AsignarRecursosPrevencionInput,
  AsignarRecursosPrevencionResponse,
} from '@/types/evento-prevencion';

import type { paths } from '@/types/api-generated';

type PrevencionRequestBody = NonNullable<
  NonNullable<paths['/api/eventos-atp/prevencion']['post']['requestBody']>['content']
>['application/json'];

type EditarPrevencionRequestBody = NonNullable<
  NonNullable<paths['/api/eventos-atp/prevencion/{id}']['patch']['requestBody']>['content']
>['application/json'];

export type TipoConflictoPrevencion =
  | 'PATRULLA_OCUPADA'
  | 'STOCK_INSUFICIENTE'
  | 'ACTIVO_NO_DISPONIBLE'
  | 'EVENTO_CERRADO'
  | 'ESTADO_BLOQUEADO'
  | 'OTRO';

function normalizarGeoJson(
  geoJson: unknown
): { type: string; coordinates: number[] } | null {
  if (!geoJson || typeof geoJson !== 'object') return null;
  const candidate = geoJson as { type?: unknown; coordinates?: unknown };
  if (typeof candidate.type !== 'string' || !Array.isArray(candidate.coordinates)) {
    return null;
  }
  return {
    type: candidate.type,
    coordinates: candidate.coordinates.filter((c): c is number => typeof c === 'number'),
  };
}

function resolveAuthToken(explicitToken?: string): string | null {
  return (
    explicitToken ||
    getAuthCookie() ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('sgrai_auth_token') || localStorage.getItem('token')
      : null)
  );
}

function parseFieldErrors400(errorData: {
  details?: Record<string, string[]>;
  errors?: Array<{ campo?: string; field?: string; mensaje?: string; message?: string }> | Record<string, string[]>;
}): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  if (Array.isArray(errorData.errors)) {
    for (const err of errorData.errors) {
      const field = err.campo || err.field;
      const msg = err.mensaje || err.message;
      if (field && msg) {
        fieldErrors[field] = msg;
      }
    }
  } else if (errorData.details && typeof errorData.details === 'object') {
    for (const [key, msgs] of Object.entries(errorData.details)) {
      if (Array.isArray(msgs) && msgs.length > 0) {
        fieldErrors[key] = msgs.join('. ');
      }
    }
  }
  return fieldErrors;
}

export class PrevencionServiceError extends Error {
  public statusCode?: number;
  public tipoConflicto?: TipoConflictoPrevencion;
  public fieldErrors?: Record<string, string>;
  public apiDetails?: unknown;

  constructor(
    message: string,
    options?: {
      statusCode?: number;
      tipoConflicto?: TipoConflictoPrevencion;
      fieldErrors?: Record<string, string>;
      apiDetails?: unknown;
    }
  ) {
    super(message);
    this.name = 'PrevencionServiceError';
    this.statusCode = options?.statusCode;
    this.tipoConflicto = options?.tipoConflicto;
    this.fieldErrors = options?.fieldErrors;
    this.apiDetails = options?.apiDetails;
  }
}

/**
 * Registra un nuevo evento territorial de prevención y despacha una patrulla
 * con insumos logísticos opcionales directamente en terreno (HU-30).
 */
export async function crearEventoPrevencion(
  payload: CrearEventoPrevencionPayload,
  userId: string = DEFAULT_ENCARGADO_ID,
  explicitToken?: string
): Promise<EventoPrevencionDTO> {
  try {
    const token =
      explicitToken ||
      getAuthCookie() ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('sgrai_auth_token') || localStorage.getItem('token')
        : null);

    const body: PrevencionRequestBody = {
      nombre: payload.nombre,
      descripcion: payload.descripcion,
      sector: payload.sector,
      direccionTexto: payload.direccionTexto,
      prioridad: payload.prioridad,
      delegacionId: payload.delegacionId,
      puntoCriticoId: payload.puntoCriticoId,
      latitud: payload.latitud,
      longitud: payload.longitud,
      ...(payload.patrullaId ? { patrullaId: payload.patrullaId } : {}),
      ...(payload.recursos ? { recursos: payload.recursos } : {}),
    };

    const { data, error, response } = await apiClient.POST('/api/eventos-atp/prevencion', {
      body,
      headers: {
        'x-user-id': userId,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (response?.status === 201 && data && 'data' in data) {
      return data.data as EventoPrevencionDTO;
    }

    const status = response?.status ?? 500;
    const errorData = (error || {}) as {
      message?: string;
      error?: string;
      details?: Record<string, string[]>;
      errors?: Array<{ campo?: string; field?: string; mensaje?: string; message?: string }>;
    };

    const mensajeError =
      errorData.message || errorData.error || `Error HTTP ${status} al crear el evento de prevención.`;

    if (status === 409) {
      const lower = mensajeError.toLowerCase();
      let tipoConflicto: TipoConflictoPrevencion = 'OTRO';

      if (lower.includes('patrulla') || lower.includes('disponible para asignación')) {
        tipoConflicto = 'PATRULLA_OCUPADA';
      } else if (lower.includes('stock') || lower.includes('bodega') || lower.includes('insuficiente')) {
        tipoConflicto = 'STOCK_INSUFICIENTE';
      }

      throw new PrevencionServiceError(mensajeError, {
        statusCode: 409,
        tipoConflicto,
        apiDetails: errorData,
      });
    }

    if (status === 400) {
      const fieldErrors: Record<string, string> = {};

      if (Array.isArray(errorData.errors)) {
        for (const err of errorData.errors) {
          const field = err.campo || err.field;
          const msg = err.mensaje || err.message;
          if (field && msg) {
            fieldErrors[field] = msg;
          }
        }
      } else if (errorData.details && typeof errorData.details === 'object') {
        for (const [key, msgs] of Object.entries(errorData.details)) {
          if (Array.isArray(msgs) && msgs.length > 0) {
            fieldErrors[key] = msgs.join('. ');
          }
        }
      }

      throw new PrevencionServiceError(mensajeError, {
        statusCode: 400,
        fieldErrors,
        apiDetails: errorData,
      });
    }

    if (status === 401) {
      throw new PrevencionServiceError('Token de sesión inválido o expirado.', {
        statusCode: 401,
        apiDetails: errorData,
      });
    }

    if (status === 403) {
      throw new PrevencionServiceError(
        'Acceso denegado. Se requiere el permiso "prevencion:eventos:crear".',
        {
          statusCode: 403,
          apiDetails: errorData,
        }
      );
    }

    if (status === 404) {
      throw new PrevencionServiceError(
        mensajeError || 'La patrulla verificadora, delegación o recurso indicado no fue encontrado.',
        {
          statusCode: 404,
          apiDetails: errorData,
        }
      );
    }

    throw new PrevencionServiceError(mensajeError, {
      statusCode: status,
      apiDetails: errorData,
    });
  } catch (err: unknown) {
    if (err instanceof PrevencionServiceError) {
      throw err;
    }
    const formatted = formatApiError(err);
    throw new PrevencionServiceError(formatted.message || 'Error inesperado de comunicación con el servidor', {
      statusCode: formatted.statusCode,
      apiDetails: formatted,
    });
  }
}

/**
 * Lista los eventos y misiones preventivas desplegadas en puntos críticos (HU-76).
 * Consume: GET /api/eventos-atp/prevencion con filtros y paginación H34.
 */
export async function listarEventosPrevencion(
  params?: ListarEventosPrevencionParams,
  explicitToken?: string
): Promise<ListarEventosPrevencionResponse> {
  try {
    const token =
      explicitToken ||
      getAuthCookie() ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('sgrai_auth_token') || localStorage.getItem('token')
        : null);

    const { data, error, response } = await apiClient.GET('/api/eventos-atp/prevencion', {
      params: {
        query: {
          page: params?.page,
          limit: params?.limit,
          delegacionId: params?.delegacionId,
          estado: params?.estado,
          busqueda: params?.busqueda,
        },
      },
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (response?.status === 200 && data && 'data' in data) {
      const items = (data.data || []).map((ev) => ({
        ...ev,
        descripcion: ev.descripcion ?? null,
        sector: ev.sector ?? null,
        direccionTexto: ev.direccionTexto ?? null,
        puntoCritico: ev.puntoCritico
          ? {
              ...ev.puntoCritico,
              descripcion: ev.puntoCritico.descripcion ?? null,
              tipoRiesgo: ev.puntoCritico.tipoRiesgo ?? null,
              prioridad: ev.puntoCritico.prioridad ?? null,
              ubicacionGeoJson: ev.puntoCritico.ubicacionGeoJson ?? null,
            }
          : null,
        patrulla: ev.patrulla ?? null,
        cuadrilla: ev.cuadrilla ?? null,
        mision: ev.mision
          ? {
              ...ev.mision,
              fechaInicio: ev.mision.fechaInicio ?? null,
              fechaCierre: ev.mision.fechaCierre ?? null,
            }
          : null,
        ubicacionGeoJson: ev.ubicacionGeoJson ?? null,
        recursos: ev.recursos ?? [],
        fechaEstimadaFin: ev.fechaEstimadaFin ?? null,
        creadoPorId: ev.creadoPorId,
        actualizadoPorId: ev.actualizadoPorId ?? null,
      })) as EventoPrevencionListItemDTO[];

      const meta: PaginacionMetaH34 = data.meta || {
        total: items.length,
        page: params?.page ?? 1,
        limit: params?.limit ?? (items.length || 20),
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      };

      return {
        message: data.message || 'Eventos de prevención listados exitosamente',
        data: items,
        meta,
      };
    }

    const status = response?.status ?? 500;
    const errorData = (error || {}) as {
      message?: string;
      error?: string;
      errors?: Record<string, string[]>;
    };

    const mensajeError =
      errorData.message || errorData.error || `Error HTTP ${status} al listar los eventos de prevención.`;

    if (status === 401) {
      throw new PrevencionServiceError('Token de sesión inválido o expirado.', {
        statusCode: 401,
        apiDetails: errorData,
      });
    }

    if (status === 403) {
      throw new PrevencionServiceError(
        'Acceso denegado. Se requiere el permiso "prevencion:eventos:leer".',
        {
          statusCode: 403,
          apiDetails: errorData,
        }
      );
    }

    if (status === 400) {
      throw new PrevencionServiceError(mensajeError, {
        statusCode: 400,
        apiDetails: errorData,
      });
    }

    throw new PrevencionServiceError(mensajeError, {
      statusCode: status,
      apiDetails: errorData,
    });
  } catch (err: unknown) {
    if (err instanceof PrevencionServiceError) {
      throw err;
    }
    const formatted = formatApiError(err);
    throw new PrevencionServiceError(
      formatted.message || 'Error inesperado de comunicación con el servidor',
      {
        statusCode: formatted.statusCode,
        apiDetails: formatted,
      }
    );
  }
}

/**
 * Actualiza planificación, fechas estimadas y dotación de recursos materiales
 * de un evento de prevención activo (HU-77).
 * Consume: PATCH /api/eventos-atp/prevencion/{id}.
 */
export async function editarEventoPrevencion(
  id: string,
  payload: EditarEventoPrevencionPayload,
  userId: string = DEFAULT_ENCARGADO_ID,
  explicitToken?: string
): Promise<EventoPrevencionDTO> {
  try {
    const token = resolveAuthToken(explicitToken);

    const body: EditarPrevencionRequestBody = {
      ...(payload.nombre !== undefined ? { nombre: payload.nombre } : {}),
      ...(payload.descripcion !== undefined ? { descripcion: payload.descripcion } : {}),
      ...(payload.prioridad !== undefined ? { prioridad: payload.prioridad } : {}),
      ...(payload.fechaEstimadaFin !== undefined ? { fechaEstimadaFin: payload.fechaEstimadaFin } : {}),
      ...(payload.recursos !== undefined ? { recursos: payload.recursos } : {}),
    };

    const { data, error, response } = await apiClient.PATCH('/api/eventos-atp/prevencion/{id}', {
      params: {
        path: { id },
      },
      body,
      headers: {
        'x-user-id': userId,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (response?.status === 200 && data && 'data' in data) {
      return data.data as EventoPrevencionDTO;
    }

    const status = response?.status ?? 500;
    const errorData = (error || {}) as {
      message?: string;
      error?: string;
      details?: Record<string, string[]>;
      errors?: Array<{ campo?: string; field?: string; mensaje?: string; message?: string }>;
    };

    const mensajeError =
      errorData.message || errorData.error || `Error HTTP ${status} al actualizar el evento de prevención.`;

    if (status === 409) {
      const lower = mensajeError.toLowerCase();
      let tipoConflicto: TipoConflictoPrevencion = 'OTRO';

      if (lower.includes('stock') || lower.includes('bodega') || lower.includes('insuficiente')) {
        tipoConflicto = 'STOCK_INSUFICIENTE';
      } else if (
        lower.includes('completada') ||
        lower.includes('cancelada') ||
        lower.includes('estado') ||
        lower.includes('inactivo')
      ) {
        tipoConflicto = 'ESTADO_BLOQUEADO';
      }

      throw new PrevencionServiceError(mensajeError, {
        statusCode: 409,
        tipoConflicto,
        apiDetails: errorData,
      });
    }

    if (status === 400) {
      throw new PrevencionServiceError(mensajeError, {
        statusCode: 400,
        fieldErrors: parseFieldErrors400(errorData),
        apiDetails: errorData,
      });
    }

    if (status === 401) {
      throw new PrevencionServiceError('Token de sesión inválido o expirado.', {
        statusCode: 401,
        apiDetails: errorData,
      });
    }

    if (status === 403) {
      throw new PrevencionServiceError(
        'Acceso denegado. Se requiere el permiso "prevencion:eventos:crear".',
        {
          statusCode: 403,
          apiDetails: errorData,
        }
      );
    }

    if (status === 404) {
      throw new PrevencionServiceError(
        mensajeError || 'El evento de prevención solicitado no fue encontrado.',
        {
          statusCode: 404,
          apiDetails: errorData,
        }
      );
    }

    throw new PrevencionServiceError(mensajeError, {
      statusCode: status,
      apiDetails: errorData,
    });
  } catch (err: unknown) {
    if (err instanceof PrevencionServiceError) {
      throw err;
    }
    const formatted = formatApiError(err);
    throw new PrevencionServiceError(
      formatted.message || 'Error inesperado de comunicación con el servidor',
      {
        statusCode: formatted.statusCode,
        apiDetails: formatted,
      }
    );
  }
}

/**
 * Consulta la información consolidada de un evento de prevención comunal (HU-33).
 * Consume: GET /api/eventos-atp/prevencion/{id}
 */
export async function obtenerEventoPrevencion(
  id: string,
  explicitToken?: string
): Promise<DetalleEventoPrevencionResponse> {
  try {
    const token = resolveAuthToken(explicitToken);

    const { data, error, response } = await apiClient.GET('/api/eventos-atp/prevencion/{id}', {
      params: {
        path: { id },
      },
      ...(token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : {}),
    });

    if (response?.status === 200 && data) {
      const raw =
        typeof data === 'object' && data !== null && 'data' in data
          ? (data as { data: DetalleEventoPrevencionDTO }).data
          : (data as DetalleEventoPrevencionDTO);

      const recursosAsignados: RecursoAsignadoPrevencionDetalle[] = (raw.recursosAsignados || []).map(
        (rec) => ({
          id: rec.id,
          recursoId: rec.recursoId,
          nombre: rec.nombre,
          esIndividual: Boolean(rec.esIndividual),
          cantidadAsignada: rec.cantidadAsignada,
          misionId: rec.misionId ?? null,
          creadoEn: rec.creadoEn,
        })
      );

      const misiones: MisionPrevencionHistorialItem[] = (raw.misiones || []).map((m) => ({
        id: m.id,
        codigo: m.codigo,
        titulo: m.titulo,
        estado: m.estado,
        tipoMision: m.tipoMision,
        fechaInicio: m.fechaInicio ?? null,
        fechaCierre: m.fechaCierre ?? null,
        creadoEn: m.creadoEn,
        patrulla: m.patrulla ?? null,
        cuadrilla: m.cuadrilla ?? null,
      }));

      const primeraMision = misiones[0] || null;

      return {
        id: raw.id,
        codigo: raw.codigo,
        nombre: raw.nombre,
        descripcion: raw.descripcion ?? null,
        sector: raw.sector ?? null,
        direccionTexto: raw.direccionTexto ?? null,
        prioridad: raw.prioridad,
        estado: raw.estado,
        latitud: raw.latitud,
        longitud: raw.longitud,
        ubicacionGeoJson: normalizarGeoJson(raw.ubicacionGeoJson),
        puntoCritico: raw.puntoCritico
          ? {
              id: raw.puntoCritico.id,
              codigo: raw.puntoCritico.codigo,
              nombre: raw.puntoCritico.nombre,
              descripcion: raw.puntoCritico.descripcion ?? null,
              tipoRiesgo: raw.puntoCritico.tipoRiesgo ?? null,
              prioridad: raw.puntoCritico.prioridad ?? null,
              latitud: raw.puntoCritico.latitud,
              longitud: raw.puntoCritico.longitud,
              ubicacionGeoJson: normalizarGeoJson(raw.puntoCritico.ubicacionGeoJson),
            }
          : null,
        delegacion: raw.delegacion ?? null,
        mision: primeraMision
          ? {
              id: primeraMision.id,
              codigo: primeraMision.codigo,
              titulo: primeraMision.titulo,
              estado: primeraMision.estado,
              tipoMision: primeraMision.tipoMision,
              fechaInicio: primeraMision.fechaInicio ?? null,
              fechaCierre: primeraMision.fechaCierre ?? null,
            }
          : null,
        misiones,
        patrulla: primeraMision?.patrulla ?? null,
        cuadrilla: primeraMision?.cuadrilla ?? null,
        recursosAsignados,
        recursos: recursosAsignados,
        fechaEstimadaFin: raw.fechaEstimadaFin ?? null,
        creadoPorId: raw.creadoPorId,
        actualizadoPorId: raw.actualizadoPorId ?? null,
        creadoEn: raw.creadoEn,
        actualizadoEn: raw.actualizadoEn,
      };
    }

    const status = response?.status ?? 500;
    const errorData = (error || {}) as {
      message?: string;
      error?: string;
      details?: Record<string, string[]>;
      errors?: Array<{ campo?: string; field?: string; mensaje?: string; message?: string }> | Record<string, string[]>;
    };
    const mensajeError =
      errorData.message || errorData.error || `Error HTTP ${status} al consultar el evento de prevención.`;

    if (status === 400) {
      throw new PrevencionServiceError(mensajeError, {
        statusCode: 400,
        fieldErrors: parseFieldErrors400(errorData),
        apiDetails: errorData,
      });
    }

    if (status === 401) {
      throw new PrevencionServiceError('Token de sesión inválido o expirado.', {
        statusCode: 401,
        apiDetails: errorData,
      });
    }

    if (status === 403) {
      throw new PrevencionServiceError(
        'Acceso denegado. Se requiere alguno de los permisos: "prevencion:eventos:leer", "prevencion:eventos:crear", "misiones:leer" o "misiones:asignar".',
        {
          statusCode: 403,
          apiDetails: errorData,
        }
      );
    }

    if (status === 404) {
      throw new PrevencionServiceError(
        mensajeError || 'El evento de prevención especificado no fue encontrado.',
        {
          statusCode: 404,
          apiDetails: errorData,
        }
      );
    }

    throw new PrevencionServiceError(mensajeError, {
      statusCode: status,
      apiDetails: errorData,
    });
  } catch (err: unknown) {
    if (err instanceof PrevencionServiceError) {
      throw err;
    }
    const formatted = formatApiError(err);
    throw new PrevencionServiceError(
      formatted.message || 'Error inesperado al consultar el evento de prevención',
      {
        statusCode: formatted.statusCode,
        apiDetails: formatted,
      }
    );
  }
}

/**
 * Asigna atómicamente una patrulla verificadora disponible y materiales del inventario
 * a un evento de prevención comunal bajo bloqueo transaccional FOR UPDATE §3.6 (HU-33).
 * Consume: POST /api/eventos-atp/prevencion/{id}/recursos
 */
export async function asignarRecursosPrevencion(
  id: string,
  input: AsignarRecursosPrevencionInput,
  explicitToken?: string
): Promise<AsignarRecursosPrevencionResponse> {
  try {
    const token = resolveAuthToken(explicitToken);

    const { data, error, response } = await apiClient.POST('/api/eventos-atp/prevencion/{id}/recursos', {
      params: {
        path: { id },
      },
      body: input,
      ...(token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : {}),
    });

    if (response?.status === 200 && data) {
      return data;
    }

    const status = response?.status ?? 500;
    const errorData = (error || {}) as {
      message?: string;
      error?: string;
      details?: Record<string, string[]>;
      errors?: Array<{ campo?: string; field?: string; mensaje?: string; message?: string }> | Record<string, string[]>;
    };

    const mensajeError =
      errorData.message || errorData.error || `Error HTTP ${status} al asignar recursos al evento de prevención.`;

    if (status === 409) {
      const lower = mensajeError.toLowerCase();
      let tipoConflicto: TipoConflictoPrevencion = 'OTRO';

      if (
        lower.includes('completad') ||
        lower.includes('cancelad') ||
        lower.includes('inactivo') ||
        lower.includes('cerrad')
      ) {
        tipoConflicto = 'EVENTO_CERRADO';
      } else if (lower.includes('patrulla') || lower.includes('ocupada')) {
        tipoConflicto = 'PATRULLA_OCUPADA';
      } else if (lower.includes('stock') || lower.includes('bodega') || lower.includes('insuficiente')) {
        tipoConflicto = 'STOCK_INSUFICIENTE';
      } else if (
        lower.includes('mantencion') ||
        lower.includes('mantención') ||
        lower.includes('taller') ||
        lower.includes('activo') ||
        lower.includes('individual') ||
        lower.includes('no disponible') ||
        lower.includes('asignado')
      ) {
        tipoConflicto = 'ACTIVO_NO_DISPONIBLE';
      }

      throw new PrevencionServiceError(mensajeError, {
        statusCode: 409,
        tipoConflicto,
        apiDetails: errorData,
      });
    }

    if (status === 400) {
      throw new PrevencionServiceError(mensajeError, {
        statusCode: 400,
        fieldErrors: parseFieldErrors400(errorData),
        apiDetails: errorData,
      });
    }

    if (status === 401) {
      throw new PrevencionServiceError('Token de sesión inválido o expirado.', {
        statusCode: 401,
        apiDetails: errorData,
      });
    }

    if (status === 403) {
      throw new PrevencionServiceError(
        'No posee el permiso requerido: misiones:asignar. Requiere rol de Encargado o Administrador.',
        {
          statusCode: 403,
          apiDetails: errorData,
        }
      );
    }

    if (status === 404) {
      throw new PrevencionServiceError(
        mensajeError || 'El evento de prevención, patrulla o insumo logístico no fue encontrado.',
        {
          statusCode: 404,
          apiDetails: errorData,
        }
      );
    }

    throw new PrevencionServiceError(mensajeError, {
      statusCode: status,
      apiDetails: errorData,
    });
  } catch (err: unknown) {
    if (err instanceof PrevencionServiceError) {
      throw err;
    }
    const formatted = formatApiError(err);
    throw new PrevencionServiceError(
      formatted.message || 'Error inesperado al asignar recursos a prevención',
      {
        statusCode: formatted.statusCode,
        apiDetails: formatted,
      }
    );
  }
}
