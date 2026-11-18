import apiClient from '@/lib/api/client';
import { DEFAULT_ENCARGADO_ID } from '@/services/incidentesService';
import { formatApiError } from '@/lib/utils/errorUtils';
import type {
  CrearEventoRecuperacionInput,
  EventoRecuperacionResponse,
  DetalleEventoRecuperacionResponse,
  DetalleEventoRecuperacionDTO,
  AsignarRecursosRecuperacionInput,
  AsignarRecursosRecuperacionResponse,
} from '@/types/recuperacion';

export type TipoConflictoRecuperacion =
  | 'PATRULLA_OCUPADA'
  | 'STOCK_INSUFICIENTE'
  | 'ACTIVO_NO_DISPONIBLE'
  | 'EVENTO_CERRADO'
  | 'OTRO';

export class RecuperacionServiceError extends Error {
  public statusCode?: number;
  public tipoConflicto?: TipoConflictoRecuperacion;
  public fieldErrors?: Record<string, string>;
  public apiDetails?: unknown;

  constructor(
    message: string,
    options?: {
      statusCode?: number;
      tipoConflicto?: TipoConflictoRecuperacion;
      fieldErrors?: Record<string, string>;
      apiDetails?: unknown;
    }
  ) {
    super(message);
    this.name = 'RecuperacionServiceError';
    this.statusCode = options?.statusCode;
    this.tipoConflicto = options?.tipoConflicto;
    this.fieldErrors = options?.fieldErrors;
    this.apiDetails = options?.apiDetails;
  }
}

/**
 * Registra un nuevo evento territorial de recuperación y despacha una patrulla
 * con insumos logísticos asignados directamente en terreno (HU-29).
 */
export async function crearEventoRecuperacion(
  input: CrearEventoRecuperacionInput,
  userId: string = DEFAULT_ENCARGADO_ID
): Promise<EventoRecuperacionResponse> {
  try {
    const { data, error, response } = await apiClient.POST('/api/eventos-atp/recuperacion', {
      params: {
        header: {
          'x-user-id': userId,
        },
      },
      body: input,
    });

    if (response.status === 201 && data?.data) {
      return data.data as EventoRecuperacionResponse;
    }

    const status = response.status;
    const errorData = (error || {}) as {
      message?: string;
      error?: string;
      details?: Record<string, string[]>;
      errors?: Array<{ campo?: string; field?: string; mensaje?: string; message?: string }>;
    };

    const mensajeError =
      errorData.message || errorData.error || `Error HTTP ${status} al crear el evento de recuperación.`;

    if (status === 409) {
      const lower = mensajeError.toLowerCase();
      let tipoConflicto: TipoConflictoRecuperacion = 'OTRO';

      if (lower.includes('stock') || lower.includes('bodega') || lower.includes('insuficiente')) {
        tipoConflicto = 'STOCK_INSUFICIENTE';
      } else if (
        lower.includes('mantencion') ||
        lower.includes('mantención') ||
        lower.includes('taller') ||
        lower.includes('activo') ||
        lower.includes('individual')
      ) {
        tipoConflicto = 'ACTIVO_NO_DISPONIBLE';
      } else if (lower.includes('patrulla') || lower.includes('ocupada')) {
        tipoConflicto = 'PATRULLA_OCUPADA';
      }

      throw new RecuperacionServiceError(mensajeError, {
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

      throw new RecuperacionServiceError(mensajeError, {
        statusCode: 400,
        fieldErrors,
        apiDetails: errorData,
      });
    }

    if (status === 403) {
      throw new RecuperacionServiceError(
        'No posee el permiso requerido: recuperacion:crear. Requiere rol de Encargado o Administrador.',
        {
          statusCode: 403,
          apiDetails: errorData,
        }
      );
    }

    if (status === 404) {
      throw new RecuperacionServiceError(
        mensajeError || 'La patrulla verificadora o recurso indicado no fue encontrado.',
        {
          statusCode: 404,
          apiDetails: errorData,
        }
      );
    }

    throw new RecuperacionServiceError(mensajeError, {
      statusCode: status,
      apiDetails: errorData,
    });
  } catch (err: unknown) {
    if (err instanceof RecuperacionServiceError) {
      throw err;
    }
    const formatted = formatApiError(err);
    throw new RecuperacionServiceError(formatted.message || 'Error inesperado de comunicación con el servidor', {
      statusCode: formatted.statusCode,
      apiDetails: formatted,
    });
  }
}

/**
 * Parámetros de consulta para listar eventos de recuperación (HU-73 / HU-32 / HU-5)
 */
export interface ListarEventosRecuperacionParams {
  pagina?: number;
  limite?: number;
  delegacionId?: string;
  estado?: 'PLANIFICADA' | 'EN_CURSO' | 'EN_EJECUCION' | 'COMPLETADA' | 'CANCELADA';
  prioridad?: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  busqueda?: string;
}

export interface ListarEventosRecuperacionResponse {
  data: DetalleEventoRecuperacionResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Lista los eventos u operativos de recuperación comunal registrados (HU-73 / HU-32).
 * Consume: GET /api/eventos-atp/recuperacion
 */
export async function listarEventosRecuperacion(
  params?: ListarEventosRecuperacionParams,
  userId: string = DEFAULT_ENCARGADO_ID
): Promise<ListarEventosRecuperacionResponse> {
  try {
    const { data, error, response } = await apiClient.GET('/api/eventos-atp/recuperacion', {
      params: {
        query: {
          page: params?.pagina,
          limit: params?.limite,
          pagina: params?.pagina,
          limite: params?.limite,
          delegacionId: params?.delegacionId,
          estado: params?.estado,
          prioridad: params?.prioridad,
          busqueda: params?.busqueda,
        },
        header: {
          'x-user-id': userId,
        },
      },
    });

    if (response.status === 200 && data) {
      const items = (data.data || []).map((ev) => {
        const misiones = (ev.misiones || []).map((m) => ({
          ...m,
          creadoEn: '',
          patrulla: m.patrulla ?? null,
        }));
        const primeraMision = misiones[0] || null;
        const patrulla = primeraMision?.patrulla ?? null;
        const recursosAsignados = ev.recursosAsignados || [];

        return {
          ...ev,
          descripcion: ev.descripcion ?? null,
          familiasAfectadas: ev.familiasAfectadas ?? 0,
          mision: primeraMision
            ? {
                id: primeraMision.id,
                codigo: primeraMision.codigo,
                titulo: primeraMision.titulo,
                estado: primeraMision.estado,
                tipoMision: primeraMision.tipoMision,
              }
            : null,
          misiones,
          patrulla,
          recursosAsignados,
          recursos: recursosAsignados,
        };
      }) as DetalleEventoRecuperacionResponse[];

      return {
        data: items,
        total: data.total ?? items.length,
        page: data.page ?? 1,
        limit: data.limit ?? 100,
        totalPages: data.totalPages ?? 1,
      };
    }

    const status = response.status;
    const errorData = (error || {}) as { message?: string; error?: string };
    const mensajeError =
      errorData.message || errorData.error || `Error HTTP ${status} al listar los eventos de recuperación.`;

    throw new RecuperacionServiceError(mensajeError, {
      statusCode: status,
      apiDetails: errorData,
    });
  } catch (err: unknown) {
    if (err instanceof RecuperacionServiceError) {
      throw err;
    }
    const formatted = formatApiError(err);
    throw new RecuperacionServiceError(formatted.message || 'Error inesperado al listar eventos de recuperación', {
      statusCode: formatted.statusCode,
      apiDetails: formatted,
    });
  }
}

/**
 * Consulta la información consolidada de un evento de recuperación comunal (HU-32).
 * Consume: GET /api/eventos-atp/recuperacion/{id}
 */
export async function obtenerEventoRecuperacion(
  id: string,
  userId: string = DEFAULT_ENCARGADO_ID
): Promise<DetalleEventoRecuperacionResponse> {
  try {
    const { data, error, response } = await apiClient.GET('/api/eventos-atp/recuperacion/{id}', {
      params: {
        path: { id },
        header: {
          'x-user-id': userId,
        },
      },
    });

    if (response.status === 200 && data) {
      const raw =
        typeof data === 'object' && data !== null && 'data' in data
          ? (data as { data: DetalleEventoRecuperacionDTO }).data
          : (data as DetalleEventoRecuperacionDTO);

      const recursosAsignados = raw.recursosAsignados || [];
      const misiones = (raw.misiones || []).map((m) => ({
        ...m,
        patrulla: m.patrulla ?? null,
      }));
      const primeraMision = misiones[0] || null;
      const patrulla = primeraMision?.patrulla ?? null;

      const normalizado: DetalleEventoRecuperacionResponse = {
        ...raw,
        descripcion: raw.descripcion ?? null,
        direccionTexto: raw.direccionTexto ?? null,
        contactoNombre: raw.contactoNombre ?? null,
        contactoTelefono: raw.contactoTelefono ?? null,
        delegacion: raw.delegacion ?? null,
        familiasAfectadas: raw.familiasAfectadas ?? 0,
        mision: primeraMision
          ? {
              id: primeraMision.id,
              codigo: primeraMision.codigo,
              titulo: primeraMision.titulo,
              estado: primeraMision.estado,
              tipoMision: primeraMision.tipoMision,
            }
          : null,
        misiones,
        patrulla,
        recursosAsignados,
        recursos: recursosAsignados,
      };

      return normalizado;
    }

    const status = response.status;
    const errorData = (error || {}) as { message?: string; error?: string };
    const mensajeError =
      errorData.message || errorData.error || `Error HTTP ${status} al consultar el evento de recuperación.`;

    if (status === 404) {
      throw new RecuperacionServiceError('El evento de recuperación especificado no fue encontrado.', {
        statusCode: 404,
        apiDetails: errorData,
      });
    }

    if (status === 403) {
      throw new RecuperacionServiceError('No posee permisos suficientes para consultar el evento de recuperación.', {
        statusCode: 403,
        apiDetails: errorData,
      });
    }

    throw new RecuperacionServiceError(mensajeError, {
      statusCode: status,
      apiDetails: errorData,
    });
  } catch (err: unknown) {
    if (err instanceof RecuperacionServiceError) {
      throw err;
    }
    const formatted = formatApiError(err);
    throw new RecuperacionServiceError(formatted.message || 'Error inesperado al consultar evento de recuperación', {
      statusCode: formatted.statusCode,
      apiDetails: formatted,
    });
  }
}

/**
 * Asigna atómicamente una patrulla verificadora disponible y materiales de bodega a un evento de recuperación (HU-32).
 * Consume: POST /api/eventos-atp/recuperacion/{id}/asignar
 */
export async function asignarRecursosRecuperacion(
  id: string,
  input: AsignarRecursosRecuperacionInput,
  userId: string = DEFAULT_ENCARGADO_ID
): Promise<AsignarRecursosRecuperacionResponse> {
  try {
    const { data, error, response } = await apiClient.POST('/api/eventos-atp/recuperacion/{id}/asignar', {
      params: {
        path: { id },
        header: {
          'x-user-id': userId,
        },
      },
      body: input,
    });

    if ((response.status === 200 || response.status === 201) && data) {
      return data as AsignarRecursosRecuperacionResponse;
    }

    const status = response.status;
    const errorData = (error || {}) as {
      message?: string;
      error?: string;
      details?: Record<string, string[]>;
      errors?: Array<{ campo?: string; field?: string; mensaje?: string; message?: string }>;
    };

    const mensajeError =
      errorData.message || errorData.error || `Error HTTP ${status} al asignar recursos al evento de recuperación.`;

    if (status === 409) {
      const lower = mensajeError.toLowerCase();
      let tipoConflicto: TipoConflictoRecuperacion = 'OTRO';

      if (lower.includes('stock') || lower.includes('bodega') || lower.includes('insuficiente')) {
        tipoConflicto = 'STOCK_INSUFICIENTE';
      } else if (
        lower.includes('mantencion') ||
        lower.includes('mantención') ||
        lower.includes('taller') ||
        lower.includes('activo') ||
        lower.includes('individual')
      ) {
        tipoConflicto = 'ACTIVO_NO_DISPONIBLE';
      } else if (lower.includes('patrulla') || lower.includes('ocupada')) {
        tipoConflicto = 'PATRULLA_OCUPADA';
      } else if (lower.includes('cerrad') || lower.includes('completad') || lower.includes('cancelad')) {
        tipoConflicto = 'EVENTO_CERRADO';
      }

      throw new RecuperacionServiceError(mensajeError, {
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

      throw new RecuperacionServiceError(mensajeError, {
        statusCode: 400,
        fieldErrors,
        apiDetails: errorData,
      });
    }

    if (status === 403) {
      throw new RecuperacionServiceError(
        'No posee el permiso requerido: misiones:asignar. Requiere rol de Encargado o Administrador.',
        {
          statusCode: 403,
          apiDetails: errorData,
        }
      );
    }

    if (status === 404) {
      throw new RecuperacionServiceError(
        mensajeError || 'El evento de recuperación, patrulla o insumo logístico no fue encontrado.',
        {
          statusCode: 404,
          apiDetails: errorData,
        }
      );
    }

    throw new RecuperacionServiceError(mensajeError, {
      statusCode: status,
      apiDetails: errorData,
    });
  } catch (err: unknown) {
    if (err instanceof RecuperacionServiceError) {
      throw err;
    }
    const formatted = formatApiError(err);
    throw new RecuperacionServiceError(formatted.message || 'Error inesperado al asignar recursos a recuperación', {
      statusCode: formatted.statusCode,
      apiDetails: formatted,
    });
  }
}
