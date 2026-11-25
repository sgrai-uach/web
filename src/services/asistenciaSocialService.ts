import apiClient from '@/lib/api/client';
import { formatApiError } from '@/lib/utils/errorUtils';
import { normalizarDetallesEvaluacionSocial } from '@/lib/utils/asistenciaSocialIncidenteUtils';
import type {
  CrearEventoAsistenciaSocialDTO,
  DerivarAsistenciaSocialDTO,
  DerivarAsistenciaSocialResponse,
  EventoAsistenciaSocialItem,
  ListarEventosAsistenciaSocialResponse,
  FiltrosEventosAsistenciaSocialState,
  PrioridadEventoSocial,
  NivelCompromisoViviendaSocial,
  RegistrarFichaFibeDTO,
} from '@/types/asistenciaSocial';

export const ENDPOINT_DERIVAR_INCIDENTE_SOCIAL = '/api/incidentes/{id}/asistencia-social' as const;

export interface ContextoIncidenteDerivacion {
  codigo?: string;
  tipoAfectacion?: string;
  descripcion?: string | null;
  direccion?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  personasAfectadas?: number | null;
  prioridad?: PrioridadEventoSocial | string | null;
  delegacionId?: string | null;
  delegacionNombre?: string | null;
  contactoNombre?: string | null;
  contactoTelefono?: string | null;
  contactoRut?: string | null;
  asistenteSocialNombre?: string | null;
}

function normalizarEventoSocial(
  item: EventoAsistenciaSocialItem & {
    detalles_evaluacion?: unknown;
    tipo_afectacion?: string;
    personas_afectadas?: number;
    familias_afectadas?: number;
    direccion_texto?: string;
    contacto_nombre?: string | null;
    contacto_telefono?: string | null;
    contacto_rut?: string | null;
    delegacion_id?: string | null;
    delegacion_nombre?: string | null;
    incidente_id?: string | null;
    asistente_social_id?: string | null;
    asistente_social_nombre?: string | null;
    folio_fibe?: string | null;
    nivel_dano_vivienda?: NivelCompromisoViviendaSocial | null;
    observaciones_fibe?: string | null;
    fibe_registrada_en?: string | null;
    fibe_registrada_por_id?: string | null;
    creado_en?: string;
    actualizado_en?: string;
  }
): EventoAsistenciaSocialItem {
  const detalles = normalizarDetallesEvaluacionSocial(
    item.detallesEvaluacion ?? item.detalles_evaluacion
  );
  return {
    ...item,
    tipoAfectacion: item.tipoAfectacion ?? item.tipo_afectacion ?? 'OTRO_EXCEPCIONAL',
    personasAfectadas: item.personasAfectadas ?? item.personas_afectadas ?? 0,
    familiasAfectadas: item.familiasAfectadas ?? item.familias_afectadas ?? 0,
    direccionTexto: item.direccionTexto ?? item.direccion_texto ?? '',
    contactoNombre: item.contactoNombre !== undefined ? item.contactoNombre : (item.contacto_nombre ?? null),
    contactoTelefono:
      item.contactoTelefono !== undefined ? item.contactoTelefono : (item.contacto_telefono ?? null),
    contactoRut: item.contactoRut !== undefined ? item.contactoRut : (item.contacto_rut ?? null),
    delegacionId: item.delegacionId !== undefined ? item.delegacionId : (item.delegacion_id ?? null),
    delegacionNombre:
      item.delegacionNombre !== undefined ? item.delegacionNombre : (item.delegacion_nombre ?? null),
    incidenteId: item.incidenteId !== undefined ? item.incidenteId : (item.incidente_id ?? null),
    asistenteSocialId:
      item.asistenteSocialId !== undefined ? item.asistenteSocialId : (item.asistente_social_id ?? null),
    asistenteSocialNombre:
      item.asistenteSocialNombre !== undefined
        ? item.asistenteSocialNombre
        : (item.asistente_social_nombre ?? null),
    folioFibe: item.folioFibe !== undefined ? item.folioFibe : (item.folio_fibe ?? null),
    nivelDanoVivienda:
      item.nivelDanoVivienda !== undefined
        ? item.nivelDanoVivienda
        : (item.nivel_dano_vivienda ?? null),
    observacionesFibe:
      item.observacionesFibe !== undefined
        ? item.observacionesFibe
        : (item.observaciones_fibe ?? null),
    fibeRegistradaEn:
      item.fibeRegistradaEn !== undefined
        ? item.fibeRegistradaEn
        : (item.fibe_registrada_en ?? null),
    fibeRegistradaPorId:
      item.fibeRegistradaPorId !== undefined
        ? item.fibeRegistradaPorId
        : (item.fibe_registrada_por_id ?? null),
    creadoEn: item.creadoEn ?? item.creado_en ?? new Date().toISOString(),
    actualizadoEn: item.actualizadoEn ?? item.actualizado_en ?? new Date().toISOString(),
    detallesEvaluacion: detalles,
  };
}

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
    detallesEvaluacion: {
      familiasAfectadas: 1,
      nucleoFamiliarTotal: 4,
      cantidadNinos: 2,
      cantidadAdultosMayores: 1,
      personasDiscapacitadas: 0,
      personasElectrodependientes: 0,
      mascotasAfectadas: 1,
      nivelCompromisoVivienda: 'MODERADO',
      danosEstimados: 'Anegamiento en patio y dos dormitorios de primer piso',
      familias: [
        {
          id: 'fam-mock-1',
          referencia: 'Familia González',
          nucleoFamiliarTotal: 4,
          cantidadNinos: 2,
          cantidadAdultosMayores: 1,
          personasDiscapacitadas: 0,
          personasElectrodependientes: 0,
          mascotasAfectadas: 1,
          nivelCompromisoVivienda: 'MODERADO',
        },
      ],
    },
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
    detallesEvaluacion: null,
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
    asistenteSocialId: payload.asistenteSocialId ? payload.asistenteSocialId.trim() : null,
    detallesEvaluacion: payload.detallesEvaluacion ?? null,
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
      const rawData =
        (data as { data?: EventoAsistenciaSocialItem }).data || (data as EventoAsistenciaSocialItem);
      const respData = normalizarEventoSocial(rawData);
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

    if (statusCode === 409) {
      throw new AsistenciaSocialServiceError(
        errorBody.message ||
          'El asistente social seleccionado ya no se encuentra disponible o existe un conflicto con el evento.',
        { statusCode: 409 }
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
        estado: body.asistenteSocialId ? 'ASIGNADO' : 'PENDIENTE',
        contactoNombre: body.contactoNombre,
        contactoTelefono: body.contactoTelefono,
        contactoRut: body.contactoRut,
        delegacionId: body.delegacionId,
        delegacionNombre: body.delegacionId ? 'Delegación Municipal' : null,
        incidenteId: body.incidenteId ?? null,
        asistenteSocialId: body.asistenteSocialId ?? null,
        asistenteSocialNombre: body.asistenteSocialId ? 'Asistente Social Asignado' : null,
        detallesEvaluacion: body.detallesEvaluacion ?? null,
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
          data: respData.data.map(normalizarEventoSocial),
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

/**
 * Asigna un asistente social disponible a un evento de asistencia social en estado PENDIENTE (H31).
 */
export async function asignarAsistenteSocial(
  eventoId: string,
  asistenteSocialId: string,
  userId?: string
): Promise<EventoAsistenciaSocialItem> {
  const body = { asistenteSocialId: asistenteSocialId.trim() };

  try {
    const { data, error, response } = await apiClient.PATCH(
      '/api/eventos-atp/asistencia-social/{id}' as unknown as Parameters<typeof apiClient.PATCH>[0],
      {
        params: {
          path: { id: eventoId },
          header: {
            ...(userId ? { 'x-user-id': userId } : {}),
          },
        },
        headers: {
          ...(userId ? { 'x-user-id': userId } : {}),
        },
        body: body as unknown as Parameters<typeof apiClient.PATCH>[1]['body'],
      } as unknown as Parameters<typeof apiClient.PATCH>[1]
    );

    if (response?.status === 200 && data) {
      const rawData =
        (data as unknown as { data?: EventoAsistenciaSocialItem }).data ||
        (data as unknown as EventoAsistenciaSocialItem);
      const respData = normalizarEventoSocial(rawData);
      eventosSocialesMemoria = eventosSocialesMemoria.map((item) =>
        item.id === respData.id ? respData : item
      );
      return respData;
    }

    const statusCode = response?.status || 500;
    const errorBody = (error || {}) as {
      message?: string;
      errors?: Array<{ campo: string; mensaje: string }>;
    };

    if (statusCode === 403) {
      throw new AsistenciaSocialServiceError(
        errorBody.message ||
          'No cuenta con el permiso requerido (asistencia_social:crear) para asignar asistentes sociales.',
        { statusCode: 403 }
      );
    }

    if (statusCode === 404) {
      throw new AsistenciaSocialServiceError(
        errorBody.message || 'Evento de asistencia social o asistente social no encontrado.',
        { statusCode: 404 }
      );
    }

    if (statusCode === 409) {
      throw new AsistenciaSocialServiceError(
        errorBody.message ||
          'El asistente social seleccionado ya no se encuentra disponible o el evento ya fue asignado.',
        { statusCode: 409 }
      );
    }

    if (statusCode === 400 && Array.isArray(errorBody.errors)) {
      const fieldErrors: Record<string, string> = {};
      errorBody.errors.forEach((err: { campo: string; mensaje: string }) => {
        if (err.campo) fieldErrors[err.campo] = err.mensaje;
      });
      throw new AsistenciaSocialServiceError(
        errorBody.message || 'Error de validación al asignar el asistente social.',
        {
          statusCode: 400,
          errors: errorBody.errors,
          fieldErrors,
        }
      );
    }

    const apiErr = formatApiError(errorBody);
    throw new AsistenciaSocialServiceError(
      apiErr.message || `Error HTTP ${statusCode}: No fue posible asignar el asistente social.`,
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
      const existente = eventosSocialesMemoria.find((item) => item.id === eventoId);
      const actualizado: EventoAsistenciaSocialItem = existente
        ? {
            ...existente,
            estado: 'ASIGNADO',
            asistenteSocialId: body.asistenteSocialId,
            asistenteSocialNombre: existente.asistenteSocialNombre || 'Asistente Social Asignado',
            actualizadoEn: new Date().toISOString(),
          }
        : {
            id: eventoId,
            codigo: 'AS-2026-0000',
            descripcion: '',
            tipoAfectacion: 'OTRO_EXCEPCIONAL',
            personasAfectadas: 0,
            familiasAfectadas: 0,
            direccionTexto: '',
            latitud: -39.814,
            longitud: -73.245,
            prioridad: 'MEDIA',
            estado: 'ASIGNADO',
            contactoNombre: null,
            contactoTelefono: null,
            contactoRut: null,
            delegacionId: null,
            delegacionNombre: null,
            incidenteId: null,
            asistenteSocialId: body.asistenteSocialId,
            asistenteSocialNombre: 'Asistente Social Asignado',
            creadoPor: {
              id: userId || '00000000-0000-4000-8000-000000000003',
              nombre: 'Encargado de Operaciones',
            },
            creadoEn: new Date().toISOString(),
            actualizadoEn: new Date().toISOString(),
          };

      eventosSocialesMemoria = eventosSocialesMemoria.map((item) =>
        item.id === eventoId ? actualizado : item
      );
      return actualizado;
    }

    throw new AsistenciaSocialServiceError(
      'Error inesperado al conectar con el servicio de asistencia social.'
    );
  }
}

/**
 * Deriva un incidente en estado RESUELTO hacia Asistencia Social (DGRD — Ficha FIBE)
 * creando o actualizando el registro en evento_asistencia_social en estado ASIGNADO (HU-25).
 */
export async function derivarIncidenteAAsistenciaSocial(
  payload: DerivarAsistenciaSocialDTO,
  userId?: string,
  contextoIncidente?: ContextoIncidenteDerivacion
): Promise<DerivarAsistenciaSocialResponse> {
  const incidenteId = payload.incidenteId.trim();
  const body = {
    asistenteSocialId: payload.asistenteSocialId.trim(),
    ...(payload.observaciones?.trim() ? { observaciones: payload.observaciones.trim() } : {}),
  };

  try {
    const { data, error, response } = await apiClient.POST(
      ENDPOINT_DERIVAR_INCIDENTE_SOCIAL as unknown as Parameters<typeof apiClient.POST>[0],
      {
        params: {
          path: { id: incidenteId },
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

    if ((response?.status === 201 || response?.status === 200) && data) {
      const envelope = data as unknown as {
        data?: {
          evento?: EventoAsistenciaSocialItem;
          accion?: 'CREADO' | 'ACTUALIZADO';
          hitoRegistrado?: DerivarAsistenciaSocialResponse['hitoRegistrado'];
        } & EventoAsistenciaSocialItem;
        evento?: EventoAsistenciaSocialItem;
        accion?: 'CREADO' | 'ACTUALIZADO';
        hitoRegistrado?: DerivarAsistenciaSocialResponse['hitoRegistrado'];
      };

      const inner = envelope.data ?? (envelope as unknown as EventoAsistenciaSocialItem & {
        evento?: EventoAsistenciaSocialItem;
        accion?: 'CREADO' | 'ACTUALIZADO';
        hitoRegistrado?: DerivarAsistenciaSocialResponse['hitoRegistrado'];
      });

      const rawEvento =
        (inner as { evento?: EventoAsistenciaSocialItem }).evento ??
        (inner as EventoAsistenciaSocialItem);

      const eventoNormalizado = normalizarEventoSocial(rawEvento);
      const statusNum = (response as { status?: number } | undefined)?.status;
      const accion: 'CREADO' | 'ACTUALIZADO' =
        (inner as { accion?: 'CREADO' | 'ACTUALIZADO' }).accion ??
        (statusNum === 200 ? 'ACTUALIZADO' : 'CREADO');

      const existeEnMemoria = eventosSocialesMemoria.some((e) => e.id === eventoNormalizado.id);
      eventosSocialesMemoria = existeEnMemoria
        ? eventosSocialesMemoria.map((e) => (e.id === eventoNormalizado.id ? eventoNormalizado : e))
        : [eventoNormalizado, ...eventosSocialesMemoria];

      return {
        evento: eventoNormalizado,
        accion,
        hitoRegistrado:
          (inner as { hitoRegistrado?: DerivarAsistenciaSocialResponse['hitoRegistrado'] })
            .hitoRegistrado ?? null,
      };
    }

    const statusCode = response?.status || 500;
    const errorBody = (error || {}) as {
      message?: string;
      errors?: Array<{ campo: string; mensaje: string }>;
    };

    if (statusCode === 403) {
      throw new AsistenciaSocialServiceError(
        errorBody.message ||
          'No cuenta con el permiso requerido (asistencia_social:crear) para derivar incidentes a Asistencia Social.',
        { statusCode: 403 }
      );
    }

    if (statusCode === 404) {
      throw new AsistenciaSocialServiceError(
        errorBody.message || 'Incidente o asistente social no encontrado.',
        { statusCode: 404 }
      );
    }

    if (statusCode === 409) {
      throw new AsistenciaSocialServiceError(
        errorBody.message ||
          'El asistente social seleccionado ya no se encuentra disponible o el incidente ya posee una derivación activa.',
        { statusCode: 409 }
      );
    }

    if (statusCode === 422) {
      throw new AsistenciaSocialServiceError(
        errorBody.message ||
          'El incidente debe encontrarse en estado RESUELTO y registrar personas afectadas o marca FIBE para derivar.',
        { statusCode: 422 }
      );
    }

    if (statusCode === 400 && Array.isArray(errorBody.errors)) {
      const fieldErrors: Record<string, string> = {};
      errorBody.errors.forEach((err: { campo: string; mensaje: string }) => {
        if (err.campo) fieldErrors[err.campo] = err.mensaje;
      });
      throw new AsistenciaSocialServiceError(
        errorBody.message || 'Error de validación al derivar el incidente a Asistencia Social.',
        {
          statusCode: 400,
          errors: errorBody.errors,
          fieldErrors,
        }
      );
    }

    const apiErr = formatApiError(errorBody);
    throw new AsistenciaSocialServiceError(
      apiErr.message ||
        `Error HTTP ${statusCode}: No fue posible derivar el incidente a Asistencia Social.`,
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
      const existente = eventosSocialesMemoria.find(
        (item) => item.incidenteId === incidenteId && item.estado !== 'DESCARTADO'
      );
      const ahora = new Date().toISOString();
      const nombreAsistente =
        contextoIncidente?.asistenteSocialNombre || 'Asistente Social Asignado';

      if (existente) {
        const actualizado: EventoAsistenciaSocialItem = {
          ...existente,
          estado: 'ASIGNADO',
          asistenteSocialId: body.asistenteSocialId,
          asistenteSocialNombre: nombreAsistente,
          contactoNombre:
            existente.contactoNombre ?? contextoIncidente?.contactoNombre ?? null,
          contactoTelefono:
            existente.contactoTelefono ?? contextoIncidente?.contactoTelefono ?? null,
          contactoRut: existente.contactoRut ?? contextoIncidente?.contactoRut ?? null,
          direccionTexto:
            existente.direccionTexto || contextoIncidente?.direccion || 'Dirección del incidente',
          actualizadoEn: ahora,
        };
        eventosSocialesMemoria = eventosSocialesMemoria.map((item) =>
          item.id === existente.id ? actualizado : item
        );
        return {
          evento: actualizado,
          accion: 'ACTUALIZADO',
          hitoRegistrado: {
            hito: 'DERIVACION_ASISTENCIA_SOCIAL',
            descripcion: `Incidente derivado a Asistencia Social (${actualizado.codigo}). Profesional asignado: ${nombreAsistente}.`,
            creadoEn: ahora,
          },
        };
      }

      const correlativoNum = eventosSocialesMemoria.length + 1;
      const prioridadRaw = (contextoIncidente?.prioridad || 'MEDIA').toUpperCase();
      const prioridadNorm: PrioridadEventoSocial =
        prioridadRaw === 'BAJA' ||
        prioridadRaw === 'MEDIA' ||
        prioridadRaw === 'ALTA' ||
        prioridadRaw === 'CRITICA'
          ? prioridadRaw
          : 'MEDIA';

      const nuevoMock: EventoAsistenciaSocialItem = {
        id: `mock-deriv-${Date.now()}`,
        codigo: `AS-2026-${String(correlativoNum).padStart(4, '0')}`,
        descripcion:
          payload.observaciones?.trim() ||
          contextoIncidente?.descripcion?.trim() ||
          `Derivación post-incidente ${contextoIncidente?.codigo || incidenteId} para levantamiento de Ficha FIBE (DGRD).`,
        tipoAfectacion: contextoIncidente?.tipoAfectacion || 'OTRO_EXCEPCIONAL',
        personasAfectadas: contextoIncidente?.personasAfectadas ?? 1,
        familiasAfectadas: 1,
        direccionTexto: contextoIncidente?.direccion?.trim() || 'Dirección del incidente',
        latitud: contextoIncidente?.latitud ?? -39.8142,
        longitud: contextoIncidente?.longitud ?? -73.2459,
        prioridad: prioridadNorm,
        estado: 'ASIGNADO',
        contactoNombre: contextoIncidente?.contactoNombre ?? null,
        contactoTelefono: contextoIncidente?.contactoTelefono ?? null,
        contactoRut: contextoIncidente?.contactoRut ?? null,
        delegacionId: contextoIncidente?.delegacionId ?? null,
        delegacionNombre: contextoIncidente?.delegacionNombre ?? null,
        incidenteId,
        asistenteSocialId: body.asistenteSocialId,
        asistenteSocialNombre: nombreAsistente,
        detallesEvaluacion: null,
        creadoPor: {
          id: userId || '00000000-0000-4000-8000-000000000003',
          nombre: 'Encargado de Operaciones',
        },
        creadoEn: ahora,
        actualizadoEn: ahora,
      };

      eventosSocialesMemoria = [nuevoMock, ...eventosSocialesMemoria];
      return {
        evento: nuevoMock,
        accion: 'CREADO',
        hitoRegistrado: {
          hito: 'DERIVACION_ASISTENCIA_SOCIAL',
          descripcion: `Incidente derivado a Asistencia Social (${nuevoMock.codigo}). Profesional asignado: ${nombreAsistente}.`,
          creadoEn: ahora,
        },
      };
    }

    throw new AsistenciaSocialServiceError(
      'Error inesperado al conectar con el servicio de asistencia social.'
    );
  }
}

/**
 * Registra o actualiza los datos oficiales de la Ficha Básica de Emergencia (FIBE)
 * para un caso de asistencia social en estado ASIGNADO o EN_EVALUACION_FIBE (HU-71).
 */
export async function registrarFichaFibe(
  eventoId: string,
  payload: RegistrarFichaFibeDTO,
  userId?: string
): Promise<EventoAsistenciaSocialItem> {
  const folioNormalizado = payload.folioFibe.trim().toUpperCase();
  const body: {
    folioFibe: string;
    personasAfectadas?: number | null;
    nivelDanoVivienda?: NivelCompromisoViviendaSocial;
    observacionesSociales?: string | null;
  } = {
    folioFibe: folioNormalizado,
  };

  if (payload.personasAfectadas !== undefined && payload.personasAfectadas !== null) {
    body.personasAfectadas = Number(payload.personasAfectadas);
  }

  if (payload.nivelDanoVivienda !== undefined) {
    body.nivelDanoVivienda = payload.nivelDanoVivienda;
  }

  if (payload.observacionesSociales !== undefined) {
    const obsTrim = payload.observacionesSociales?.trim() ?? '';
    body.observacionesSociales = obsTrim.length > 0 ? obsTrim : null;
  }

  try {
    const { data, error, response } = await apiClient.PATCH(
      '/api/eventos-atp/asistencia-social/{id}/fibe',
      {
        params: {
          path: { id: eventoId },
          header: {
            ...(userId ? { 'x-user-id': userId } : {}),
          },
        },
        headers: {
          ...(userId ? { 'x-user-id': userId } : {}),
        },
        body,
      }
    );

    if (response?.status === 200 && data) {
      const rawData =
        (data as unknown as { data?: EventoAsistenciaSocialItem }).data ||
        (data as unknown as EventoAsistenciaSocialItem);
      const respData = normalizarEventoSocial(rawData);
      eventosSocialesMemoria = eventosSocialesMemoria.map((item) =>
        item.id === respData.id ? respData : item
      );
      return respData;
    }

    const statusCode = response?.status || 500;
    const errorBody = (error || {}) as {
      message?: string;
      errors?: Array<{ campo: string; mensaje: string }>;
    };

    if (statusCode === 403) {
      throw new AsistenciaSocialServiceError(
        errorBody.message ||
          'No cuenta con el permiso requerido (asistencia_social:fibe:gestionar) para registrar la Ficha FIBE.',
        { statusCode: 403 }
      );
    }

    if (statusCode === 404) {
      throw new AsistenciaSocialServiceError(
        errorBody.message || 'El evento de asistencia social no existe o fue eliminado.',
        { statusCode: 404 }
      );
    }

    if (statusCode === 409) {
      const msg =
        errorBody.message ||
        'Conflicto al registrar la Ficha FIBE: el folio ya existe o el caso no está en estado válido.';
      const esFolioDuplicado = msg.toLowerCase().includes('folio');
      throw new AsistenciaSocialServiceError(msg, {
        statusCode: 409,
        ...(esFolioDuplicado ? { fieldErrors: { folioFibe: msg } } : {}),
      });
    }

    if (statusCode === 400 && Array.isArray(errorBody.errors)) {
      const fieldErrors: Record<string, string> = {};
      errorBody.errors.forEach((err: { campo: string; mensaje: string }) => {
        if (err.campo) fieldErrors[err.campo] = err.mensaje;
      });
      throw new AsistenciaSocialServiceError(
        errorBody.message || 'Error de validación en los datos de la Ficha FIBE.',
        {
          statusCode: 400,
          errors: errorBody.errors,
          fieldErrors,
        }
      );
    }

    const apiErr = formatApiError(errorBody);
    throw new AsistenciaSocialServiceError(
      apiErr.message || `Error HTTP ${statusCode}: No fue posible registrar la Ficha FIBE.`,
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
      const folioDuplicado = eventosSocialesMemoria.find(
        (item) =>
          item.id !== eventoId &&
          item.estado !== 'DESCARTADO' &&
          item.folioFibe &&
          item.folioFibe.toUpperCase() === folioNormalizado
      );

      if (folioDuplicado) {
        const msg = `El folio FIBE ${folioNormalizado} ya está registrado en el expediente ${folioDuplicado.codigo}.`;
        throw new AsistenciaSocialServiceError(msg, {
          statusCode: 409,
          fieldErrors: { folioFibe: msg },
        });
      }

      const existente = eventosSocialesMemoria.find((item) => item.id === eventoId);
      if (
        existente &&
        existente.estado !== 'ASIGNADO' &&
        existente.estado !== 'EN_EVALUACION_FIBE'
      ) {
        throw new AsistenciaSocialServiceError(
          'Solo se puede registrar la Ficha FIBE en casos en estado ASIGNADO o EN_EVALUACION_FIBE.',
          { statusCode: 409 }
        );
      }

      const ahora = new Date().toISOString();
      const actualizado: EventoAsistenciaSocialItem = existente
        ? {
            ...existente,
            estado: 'EN_EVALUACION_FIBE',
            folioFibe: folioNormalizado,
            personasAfectadas:
              body.personasAfectadas !== undefined && body.personasAfectadas !== null
                ? body.personasAfectadas
                : existente.personasAfectadas,
            nivelDanoVivienda:
              body.nivelDanoVivienda ?? existente.nivelDanoVivienda ?? null,
            observacionesFibe:
              body.observacionesSociales !== undefined
                ? body.observacionesSociales
                : (existente.observacionesFibe ?? null),
            fibeRegistradaEn: existente.fibeRegistradaEn ?? ahora,
            fibeRegistradaPorId: userId ?? existente.fibeRegistradaPorId ?? null,
            actualizadoEn: ahora,
          }
        : {
            id: eventoId,
            codigo: 'AS-2026-0000',
            descripcion: '',
            tipoAfectacion: 'OTRO_EXCEPCIONAL',
            personasAfectadas: body.personasAfectadas ?? 0,
            familiasAfectadas: 1,
            direccionTexto: '',
            latitud: -39.814,
            longitud: -73.245,
            prioridad: 'MEDIA',
            estado: 'EN_EVALUACION_FIBE',
            contactoNombre: null,
            contactoTelefono: null,
            contactoRut: null,
            delegacionId: null,
            delegacionNombre: null,
            incidenteId: null,
            asistenteSocialId: userId ?? null,
            asistenteSocialNombre: 'Asistente Social',
            folioFibe: folioNormalizado,
            nivelDanoVivienda: body.nivelDanoVivienda ?? null,
            observacionesFibe: body.observacionesSociales ?? null,
            fibeRegistradaEn: ahora,
            fibeRegistradaPorId: userId ?? null,
            creadoPor: {
              id: userId || '00000000-0000-4000-8000-000000000003',
              nombre: 'Encargado de Operaciones',
            },
            creadoEn: ahora,
            actualizadoEn: ahora,
          };

      eventosSocialesMemoria = eventosSocialesMemoria.map((item) =>
        item.id === eventoId ? actualizado : item
      );
      return actualizado;
    }

    throw new AsistenciaSocialServiceError(
      'Error inesperado al conectar con el servicio de asistencia social.'
    );
  }
}
