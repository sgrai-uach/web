import apiClient from '@/lib/api/client';
import { formatApiError } from '@/lib/utils/errorUtils';
import type {
  CrearEventoAsistenciaSocialDTO,
  EventoAsistenciaSocialItem,
  ListarEventosAsistenciaSocialResponse,
  FiltrosEventosAsistenciaSocialState,
  PrioridadEventoSocial,
} from '@/types/asistenciaSocial';

export class AsistenciaSocialServiceError extends Error {
  public statusCode?: number;
  public errors?: Array<{ campo: string; mensaje: string }>;
  public fieldErrors?: Record<string, string>;
  public apiDetails?: unknown;

  constructor(
    message: string,
    options?: {
      statusCode?: number;
      errors?: Array<{ campo: string; mensaje: string }>;
      fieldErrors?: Record<string, string>;
      apiDetails?: unknown;
    }
  ) {
    super(message);
    this.name = 'AsistenciaSocialServiceError';
    this.statusCode = options?.statusCode;
    this.errors = options?.errors;
    this.fieldErrors = options?.fieldErrors;
    this.apiDetails = options?.apiDetails;
  }
}

/**
 * Catálogo mock de eventos de asistencia social para pruebas y contingencia offline.
 */
export const EVENTOS_ASISTENCIA_SOCIAL_MOCK: EventoAsistenciaSocialItem[] = [
  {
    id: '70000000-0000-4000-8000-000000000001',
    codigo: 'AS-2026-0001',
    descripcion: 'Vivienda con anegamiento severo en patio y dormitorios por colapso de canaleta comunal.',
    tipoAfectacion: 'VIVIENDA_ANEGADA',
    personasAfectadas: 4,
    familiasAfectadas: 1,
    direccionTexto: 'Calle Los Alerces 1420, Sector Collico',
    latitud: -39.8234,
    longitud: -73.2189,
    prioridad: 'ALTA',
    estado: 'PENDIENTE',
    contactoNombre: 'María González',
    contactoTelefono: '+56912345678',
    contactoRut: '12.345.678-9',
    delegacionId: '30000000-0000-4000-8000-000000000001',
    delegacionNombre: 'Delegación Municipal Costa',
    incidenteId: null,
    asistenteSocialId: null,
    asistenteSocialNombre: null,
    creadoPor: {
      id: '00000000-0000-4000-8000-000000000003',
      nombre: 'Encargado de Operaciones',
    },
    creadoEn: new Date(Date.now() - 3600000 * 2).toISOString(),
    actualizadoEn: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: '70000000-0000-4000-8000-000000000002',
    codigo: 'AS-2026-0002',
    descripcion: 'Adulto mayor en situación de aislamiento por anegamiento del pasaje de acceso peatonal.',
    tipoAfectacion: 'AISLAMIENTO_HOGAR',
    personasAfectadas: 1,
    familiasAfectadas: 1,
    direccionTexto: 'Pasaje Los Robles 45, Sector Angachilla',
    latitud: -39.8456,
    longitud: -73.2389,
    prioridad: 'CRITICA',
    estado: 'PENDIENTE',
    contactoNombre: 'Juan Carlos Pérez',
    contactoTelefono: '+56987654321',
    contactoRut: '8.765.432-1',
    delegacionId: '30000000-0000-4000-8000-000000000002',
    delegacionNombre: 'Delegación Municipal Sur',
    incidenteId: null,
    asistenteSocialId: null,
    asistenteSocialNombre: null,
    creadoPor: {
      id: '00000000-0000-4000-8000-000000000003',
      nombre: 'Encargado de Operaciones',
    },
    creadoEn: new Date(Date.now() - 3600000 * 5).toISOString(),
    actualizadoEn: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

let eventosSocialesMemoria: EventoAsistenciaSocialItem[] = [...EVENTOS_ASISTENCIA_SOCIAL_MOCK];

/**
 * Filtra los datos mock en memoria.
 */
export function filtrarEventosMock(
  filtros: FiltrosEventosAsistenciaSocialState
): ListarEventosAsistenciaSocialResponse {
  let filtrados = [...eventosSocialesMemoria];

  if (filtros.estado) {
    filtrados = filtrados.filter((e) => e.estado === filtros.estado);
  }

  if (filtros.delegacionId) {
    filtrados = filtrados.filter((e) => e.delegacionId === filtros.delegacionId);
  }

  if (filtros.prioridad) {
    filtrados = filtrados.filter((e) => e.prioridad === filtros.prioridad);
  }

  if (filtros.busqueda && filtros.busqueda.trim() !== '') {
    const q = filtros.busqueda.toLowerCase();
    filtrados = filtrados.filter(
      (e) =>
        e.codigo.toLowerCase().includes(q) ||
        e.descripcion.toLowerCase().includes(q) ||
        e.direccionTexto.toLowerCase().includes(q) ||
        (e.contactoNombre && e.contactoNombre.toLowerCase().includes(q))
    );
  }

  const pagina = Math.max(1, filtros.pagina || 1);
  const limite = Math.max(1, filtros.limite || 10);
  const total = filtrados.length;
  const totalPaginas = Math.ceil(total / limite) || 1;
  const data = filtrados.slice((pagina - 1) * limite, pagina * limite);

  return {
    data,
    total,
    pagina,
    limite,
    totalPaginas,
  };
}

/**
 * Registra un nuevo evento de asistencia social excepcional (HU-28).
 */
export async function crearEventoAsistenciaSocial(
  payload: CrearEventoAsistenciaSocialDTO,
  userId?: string
): Promise<EventoAsistenciaSocialItem> {
  const body = {
    descripcion: payload.descripcion.trim(),
    tipoAfectacion: payload.tipoAfectacion,
    direccionTexto: payload.direccionTexto.trim(),
    latitud: Number(payload.latitud),
    longitud: Number(payload.longitud),
    personasAfectadas: payload.personasAfectadas ?? 0,
    familiasAfectadas: payload.familiasAfectadas ?? 0,
    prioridad: payload.prioridad || 'MEDIA',
    contactoNombre: payload.contactoNombre?.trim() || null,
    contactoTelefono: payload.contactoTelefono?.trim() || null,
    contactoRut: payload.contactoRut?.trim() || null,
    delegacionId: payload.delegacionId || null,
    incidenteId: payload.incidenteId ? payload.incidenteId.trim() : null,
  };

  try {
    const { data, error, response } = await apiClient.POST(
      '/api/eventos-atp/asistencia-social' as unknown as Parameters<typeof apiClient.POST>[0],
      {
        params: {
          header: {
            ...(userId ? { 'x-user-id': userId } : {}),
          },
        },
        headers: {
          ...(userId ? { 'x-user-id': userId } : {}),
        },
        body: body as unknown as Parameters<typeof apiClient.POST>[1]['body'],
      } as unknown as Parameters<typeof apiClient.POST>[1]
    );

    if (response?.status === 201 && data) {
      const respData =
        (data as { data?: EventoAsistenciaSocialItem }).data || (data as EventoAsistenciaSocialItem);
      // Actualizar memoria mock
      eventosSocialesMemoria = [respData, ...eventosSocialesMemoria];
      return respData;
    }

    const statusCode = response?.status || 500;
    const errorBody = (error || {}) as {
      message?: string;
      errors?: Array<{ campo: string; mensaje: string }>;
    };

    if (statusCode === 403) {
      throw new AsistenciaSocialServiceError(
        'No cuenta con los permisos requeridos para registrar eventos de asistencia social.',
        { statusCode: 403 }
      );
    }

    if (statusCode === 400 && Array.isArray(errorBody.errors)) {
      const fieldErrors: Record<string, string> = {};
      errorBody.errors.forEach((err: { campo: string; mensaje: string }) => {
        if (err.campo) fieldErrors[err.campo] = err.mensaje;
      });
      throw new AsistenciaSocialServiceError(
        errorBody.message || 'Error de validación al registrar el evento de asistencia social',
        {
          statusCode: 400,
          errors: errorBody.errors,
          fieldErrors,
        }
      );
    }

    const apiErr = formatApiError(errorBody);
    throw new AsistenciaSocialServiceError(
      apiErr.message || `Error HTTP ${statusCode}: No fue posible registrar el evento social`,
      { statusCode }
    );
  } catch (err: unknown) {
    if (err instanceof AsistenciaSocialServiceError) {
      throw err;
    }

    const isNetworkError =
      err instanceof TypeError &&
      (err.message.includes('fetch') ||
        err.message.includes('Failed to fetch') ||
        err.message.includes('NetworkError'));

    if (isNetworkError) {
      // Mock de contingencia
      const correlativoNum = eventosSocialesMemoria.length + 1;
      const nuevoMock: EventoAsistenciaSocialItem = {
        id: `mock-${Date.now()}`,
        codigo: `AS-2026-${String(correlativoNum).padStart(4, '0')}`,
        descripcion: body.descripcion,
        tipoAfectacion: body.tipoAfectacion,
        personasAfectadas: body.personasAfectadas,
        familiasAfectadas: body.familiasAfectadas,
        direccionTexto: body.direccionTexto,
        latitud: body.latitud,
        longitud: body.longitud,
        prioridad: body.prioridad as PrioridadEventoSocial,
        estado: 'PENDIENTE',
        contactoNombre: body.contactoNombre,
        contactoTelefono: body.contactoTelefono,
        contactoRut: body.contactoRut,
        delegacionId: body.delegacionId,
        delegacionNombre: body.delegacionId ? 'Delegación Municipal' : null,
        incidenteId: body.incidenteId ?? null,
        asistenteSocialId: null,
        asistenteSocialNombre: null,
        creadoPor: {
          id: userId || '00000000-0000-4000-8000-000000000003',
          nombre: 'Encargado de Operaciones',
        },
        creadoEn: new Date().toISOString(),
        actualizadoEn: new Date().toISOString(),
      };

      eventosSocialesMemoria = [nuevoMock, ...eventosSocialesMemoria];
      return nuevoMock;
    }

    throw new AsistenciaSocialServiceError(
      'Error inesperado al conectar con el servicio de asistencia social.'
    );
  }
}

/**
 * Obtiene la lista de eventos de asistencia social con soporte a filtros.
 */
export async function obtenerEventosAsistenciaSocial(
  filtros: FiltrosEventosAsistenciaSocialState,
  userId?: string
): Promise<ListarEventosAsistenciaSocialResponse> {
  const queryParams: Record<string, string> = {
    pagina: String(filtros.pagina || 1),
    limite: String(filtros.limite || 10),
  };

  if (filtros.estado) queryParams.estado = filtros.estado;
  if (filtros.delegacionId) queryParams.delegacionId = filtros.delegacionId;
  if (filtros.prioridad) queryParams.prioridad = filtros.prioridad;
  if (filtros.busqueda) queryParams.busqueda = filtros.busqueda;

  try {
    const { data, response } = await apiClient.GET(
      '/api/eventos-atp/asistencia-social' as unknown as Parameters<typeof apiClient.GET>[0],
      {
        params: {
          query: queryParams,
          header: {
            ...(userId ? { 'x-user-id': userId } : {}),
          },
        },
      } as unknown as Parameters<typeof apiClient.GET>[1]
    );

    if (response?.status === 200 && data) {
      const respData = data as {
        data?: EventoAsistenciaSocialItem[];
        total?: number;
        pagina?: number;
        limite?: number;
        totalPaginas?: number;
      };
      if (Array.isArray(respData.data)) {
        return {
          data: respData.data,
          total: respData.total ?? respData.data.length,
          pagina: respData.pagina ?? filtros.pagina,
          limite: respData.limite ?? filtros.limite,
          totalPaginas: respData.totalPaginas ?? Math.ceil((respData.total ?? 1) / filtros.limite),
        };
      }
    }

    if (response?.status === 403) {
      throw new AsistenciaSocialServiceError(
        'No cuenta con permisos para ver los eventos de asistencia social (asistencia_social:leer)',
        { statusCode: 403 }
      );
    }

    return filtrarEventosMock(filtros);
  } catch (err: unknown) {
    if (err instanceof AsistenciaSocialServiceError) {
      throw err;
    }
    return filtrarEventosMock(filtros);
  }
}
