import apiClient from '@/lib/api/client';
import { DEFAULT_ENCARGADO_ID } from '@/services/incidentesService';
import { formatApiError } from '@/lib/utils/errorUtils';
import type {
  CrearEventoRecuperacionInput,
  EventoRecuperacionResponse,
  ListarOperativosRecuperacionQuery,
  ListarOperativosRecuperacionApiResponse,
  OperativoRecuperacionDetalle,
  OperativoRecuperacionListadoItem,
  DetalleEventoRecuperacionResponse,
  DetalleEventoRecuperacionDTO,
  MisionRecuperacionItem,
  RecursoAsignadoItem,
  AsignarRecursosRecuperacionInput,
  AsignarRecursosRecuperacionResponse,
  EditarOperativoRecuperacionInput,
  EditarOperativoRecuperacionApiResponse,
} from '@/types/recuperacion';

export type TipoConflictoRecuperacion =
  | 'PATRULLA_OCUPADA'
  | 'STOCK_INSUFICIENTE'
  | 'ACTIVO_NO_DISPONIBLE'
  | 'EVENTO_CERRADO'
  | 'ESTADO_BLOQUEADO'
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

const toIsoBoundary = (val: string, endOfDay: boolean): string => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    const d = new Date(`${val}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}`);
    return Number.isNaN(d.getTime()) ? val : d.toISOString();
  }
  return val;
};

/**
 * Obtiene el listado paginado y filtrable de operativos de recuperación (HU-73).
 */
export async function listarOperativosRecuperacion(
  query: ListarOperativosRecuperacionQuery = {}
): Promise<{ data: ListarOperativosRecuperacionApiResponse['data']; meta: NonNullable<ListarOperativosRecuperacionApiResponse['meta']> }> {
  try {
    const cleanQuery: ListarOperativosRecuperacionQuery = {};
    if (query.page !== undefined) cleanQuery.page = query.page;
    if (query.limit !== undefined) cleanQuery.limit = query.limit;
    if (query.delegacionId) cleanQuery.delegacionId = query.delegacionId;
    if (query.estado) cleanQuery.estado = query.estado;
    if (query.prioridad) cleanQuery.prioridad = query.prioridad;
    if (query.busqueda && query.busqueda.trim()) cleanQuery.busqueda = query.busqueda.trim();
    if (query.fechaDesde) cleanQuery.fechaDesde = toIsoBoundary(query.fechaDesde, false);
    if (query.fechaHasta) cleanQuery.fechaHasta = toIsoBoundary(query.fechaHasta, true);
    if (query.ordenarPor) cleanQuery.ordenarPor = query.ordenarPor;
    if (query.orden) cleanQuery.orden = query.orden;

    const { data, error, response } = await apiClient.GET(
      '/api/eventos-atp/recuperacion',
      {
        params: {
          query: cleanQuery,
        },
      }
    );

    if (response.ok && data?.data) {
      const fallbackMeta = {
        total: data.meta?.total ?? data.data.length,
        page: query.page ?? 1,
        limit: query.limit ?? (data.data.length || 10),
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      };
      return {
        data: data.data,
        meta: data.meta ?? fallbackMeta,
      };
    }

    const status = response.status;
    const errorData = (error || {}) as { message?: string; error?: string };
    const mensajeError =
      errorData.message || errorData.error || `Error HTTP ${status} al listar los operativos de recuperación.`;

    if (status === 401) {
      throw new RecuperacionServiceError('Sesión expirada o no autenticada.', {
        statusCode: 401,
        apiDetails: errorData,
      });
    }

    if (status === 403) {
      throw new RecuperacionServiceError(
        'No posee el permiso requerido: recuperacion:leer. Requiere rol Administrador, Encargado o Supervisor.',
        {
          statusCode: 403,
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
    throw new RecuperacionServiceError(
      formatted.message || 'Error inesperado al listar los operativos de recuperación.',
      {
        statusCode: formatted.statusCode,
        apiDetails: formatted,
      }
    );
  }
}

/**
 * Obtiene el detalle completo de un operativo de recuperación para el drawer lateral (HU-73).
 */
export async function obtenerDetalleOperativoRecuperacion(
  id: string
): Promise<OperativoRecuperacionDetalle> {
  try {
    const { data, error, response } = await apiClient.GET(
      '/api/eventos-atp/recuperacion/{id}',
      {
        params: {
          path: { id },
        },
      }
    );

    if (response.ok && data?.data) {
      return data.data;
    }

    const status = response.status;
    const errorData = (error || {}) as { message?: string; error?: string };
    const mensajeError =
      errorData.message || errorData.error || `Error HTTP ${status} al obtener el detalle del operativo.`;

    if (status === 401) {
      throw new RecuperacionServiceError('Sesión expirada o no autenticada.', {
        statusCode: 401,
        apiDetails: errorData,
      });
    }

    if (status === 403) {
      throw new RecuperacionServiceError(
        'No posee el permiso requerido: recuperacion:leer. Requiere rol Administrador, Encargado o Supervisor.',
        {
          statusCode: 403,
          apiDetails: errorData,
        }
      );
    }

    if (status === 404) {
      throw new RecuperacionServiceError(
        mensajeError || 'El operativo de recuperación solicitado no existe o fue eliminado.',
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
    throw new RecuperacionServiceError(
      formatted.message || 'Error inesperado al obtener el detalle del operativo de recuperación.',
      {
        statusCode: formatted.statusCode,
        apiDetails: formatted,
      }
    );
  }
}

/**
 * Parámetros de consulta para listar eventos de recuperación (HU-73 / HU-32 / HU-5)
 */
export interface ListarEventosRecuperacionParams {
  pagina?: number;
  limite?: number;
  delegacionId?: string;
  estado?: 'PLANIFICADA' | 'EN_EJECUCION' | 'COMPLETADA' | 'CANCELADA';
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

interface RawListadoRecuperacionItem extends OperativoRecuperacionListadoItem {
  contactoNombre?: string | null;
  contactoTelefono?: string | null;
  latitud?: number;
  longitud?: number;
  mision?: DetalleEventoRecuperacionDTO['mision'] | null;
  patrulla?: DetalleEventoRecuperacionDTO['patrulla'] | null;
  recursos?: Array<{ recursoId: string; nombre: string; cantidadAsignada: number }>;
}

interface RawDetalleRecuperacionItem extends DetalleEventoRecuperacionDTO {
  recursosAsignados?: RecursoAsignadoItem[];
  misiones?: MisionRecuperacionItem[];
}

/**
 * Lista los eventos u operativos de recuperación comunal registrados (HU-73 / HU-32).
 * Consume: GET /api/eventos-atp/recuperacion
 */
export async function listarEventosRecuperacion(
  params?: ListarEventosRecuperacionParams,
  _userId: string = DEFAULT_ENCARGADO_ID
): Promise<ListarEventosRecuperacionResponse> {
  void _userId;
  try {
    const { data, error, response } = await apiClient.GET('/api/eventos-atp/recuperacion', {
      params: {
        query: {
          page: params?.pagina,
          limit: params?.limite,
        },
      },
    });

    if (response.status === 200 && data) {
      const rawData = data as ListarOperativosRecuperacionApiResponse & { total?: number };
      const items = (rawData.data || []).map((rawEv) => {
        const ev = rawEv as RawListadoRecuperacionItem;
        const mision = ev.mision ?? null;
        const patrulla = ev.patrulla ?? null;
        const fuenteRecursos = ev.recursos ?? ev.recursosResumen ?? [];
        const recursos: RecursoAsignadoItem[] = fuenteRecursos.map((r) => ({
          id: r.recursoId,
          recursoId: r.recursoId,
          nombre: r.nombre,
          cantidadAsignada: r.cantidadAsignada,
          esIndividual: false,
          misionId: mision?.id ?? null,
          creadoEn: ev.creadoEn,
        }));
        const misiones: MisionRecuperacionItem[] = mision
          ? [
              {
                id: mision.id,
                codigo: mision.codigo,
                titulo: mision.titulo,
                estado: mision.estado,
                tipoMision: mision.tipoMision,
                creadoEn: ev.creadoEn,
                patrulla,
                recursos,
              },
            ]
          : [];

        const itemNormalizado: DetalleEventoRecuperacionResponse = {
          id: ev.id,
          codigo: ev.codigo,
          nombre: ev.nombre,
          descripcion: ev.descripcion ?? null,
          sector: ev.sector,
          direccionTexto: ev.direccionTexto ?? null,
          prioridad: ev.prioridad,
          contactoNombre: ev.contactoNombre ?? null,
          contactoTelefono: ev.contactoTelefono ?? null,
          latitud: ev.latitud ?? 0,
          longitud: ev.longitud ?? 0,
          estado: ev.estado,
          familiasAfectadas: ev.familiasAfectadas ?? 0,
          delegacion: ev.delegacion ?? null,
          mision,
          misiones,
          patrulla,
          recursos,
          recursosAsignados: recursos,
          creadoEn: ev.creadoEn,
          actualizadoEn: ev.actualizadoEn,
        };
        return itemNormalizado;
      });

      const totalItems = rawData.total ?? rawData.meta?.total ?? items.length;
      return {
        data: items,
        total: totalItems,
        page: params?.pagina ?? rawData.meta?.page ?? 1,
        limit: params?.limite ?? rawData.meta?.limit ?? (items.length || 100),
        totalPages: params?.limite
          ? Math.ceil(totalItems / params.limite)
          : rawData.meta?.totalPages ?? 1,
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
  _userId: string = DEFAULT_ENCARGADO_ID
): Promise<DetalleEventoRecuperacionResponse> {
  void _userId;
  try {
    const { data, error, response } = await apiClient.GET('/api/eventos-atp/recuperacion/{id}', {
      params: {
        path: { id },
      },
    });

    if (response.status === 200 && data) {
      const raw = (
        typeof data === 'object' && data !== null && 'data' in data
          ? (data as { data: RawDetalleRecuperacionItem }).data
          : (data as unknown as RawDetalleRecuperacionItem)
      );

      const recursosBase: RecursoAsignadoItem[] =
        raw.recursosAsignados ??
        (raw.recursos || []).map((r) => ({
          id: r.recursoId,
          recursoId: r.recursoId,
          nombre: r.nombre,
          cantidadAsignada: r.cantidadAsignada,
          esIndividual: false,
          misionId: raw.mision?.id ?? null,
          creadoEn: raw.creadoEn,
        }));

      const misiones: MisionRecuperacionItem[] = raw.misiones
        ? raw.misiones.map((m) => ({
            ...m,
            patrulla: m.patrulla ?? null,
          }))
        : raw.mision
        ? [
            {
              id: raw.mision.id,
              codigo: raw.mision.codigo,
              titulo: raw.mision.titulo,
              estado: raw.mision.estado,
              tipoMision: raw.mision.tipoMision,
              creadoEn: raw.creadoEn,
              patrulla: raw.patrulla ?? null,
              recursos: recursosBase,
            },
          ]
        : [];
      const primeraMision = misiones[0] || null;
      const patrulla = raw.patrulla ?? primeraMision?.patrulla ?? null;

      const normalizado: DetalleEventoRecuperacionResponse = {
        ...raw,
        descripcion: raw.descripcion ?? null,
        direccionTexto: raw.direccionTexto ?? null,
        contactoNombre: raw.contactoNombre ?? null,
        contactoTelefono: raw.contactoTelefono ?? null,
        delegacion: raw.delegacion ?? null,
        familiasAfectadas: raw.familiasAfectadas ?? 0,
        mision: raw.mision ?? primeraMision,
        misiones,
        patrulla,
        recursos: recursosBase,
        recursosAsignados: recursosBase,
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
  _userId: string = DEFAULT_ENCARGADO_ID
): Promise<AsignarRecursosRecuperacionResponse> {
  void _userId;
  try {
    const { data, error, response } = await apiClient.POST('/api/eventos-atp/recuperacion/{id}/asignar', {
      params: {
        path: { id },
      },
      body: input,
    });

    if (response.status === 200 && data) {
      return data;
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

/**
 * Edita la planificación de un operativo de recuperación en curso (HU-74).
 * Permite actualizar descripción, fechaEstimadaFin, recursos (reemplazo declarativo) y/o patrullaId.
 * La autenticación se envía automáticamente vía Authorization: Bearer <token> en apiClient.
 */
export async function editarOperativoRecuperacion(
  id: string,
  input: EditarOperativoRecuperacionInput,
  _userId?: string
): Promise<EditarOperativoRecuperacionApiResponse> {
  void _userId;
  try {
    const { data, error, response } = await apiClient.PATCH(
      '/api/eventos-atp/recuperacion/{id}',
      {
        params: {
          path: { id },
        },
        body: input,
      }
    );

    if (response.ok && data?.data) {
      return data;
    }

    const status = response.status;
    const errorData = (error || {}) as {
      message?: string;
      error?: string;
      details?: Record<string, string[]>;
      errors?: Array<{ campo?: string; field?: string; mensaje?: string; message?: string }>;
    };

    const mensajeError =
      errorData.message ||
      errorData.error ||
      `Error HTTP ${status} al editar el operativo de recuperación.`;

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

    if (status === 401) {
      throw new RecuperacionServiceError('Sesión expirada o no autenticada.', {
        statusCode: 401,
        apiDetails: errorData,
      });
    }

    if (status === 403) {
      throw new RecuperacionServiceError(
        'No posee el permiso requerido: recuperacion:editar. Requiere rol de Encargado o Administrador.',
        {
          statusCode: 403,
          apiDetails: errorData,
        }
      );
    }

    if (status === 404) {
      throw new RecuperacionServiceError(
        mensajeError || 'El operativo de recuperación, patrulla o recurso indicado no fue encontrado.',
        {
          statusCode: 404,
          apiDetails: errorData,
        }
      );
    }

    if (status === 409) {
      const lower = mensajeError.toLowerCase();
      let tipoConflicto: TipoConflictoRecuperacion = 'OTRO';

      if (
        lower.includes('completada') ||
        lower.includes('cancelada') ||
        lower.includes('bloquead') ||
        lower.includes('finalizado')
      ) {
        tipoConflicto = 'ESTADO_BLOQUEADO';
      } else if (lower.includes('patrulla') || lower.includes('disponible')) {
        tipoConflicto = 'PATRULLA_OCUPADA';
      } else if (lower.includes('stock') || lower.includes('bodega') || lower.includes('insuficiente')) {
        tipoConflicto = 'STOCK_INSUFICIENTE';
      }

      throw new RecuperacionServiceError(mensajeError, {
        statusCode: 409,
        tipoConflicto,
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
    throw new RecuperacionServiceError(
      formatted.message || 'Error inesperado al editar el operativo de recuperación.',
      {
        statusCode: formatted.statusCode,
        apiDetails: formatted,
      }
    );
  }
}
