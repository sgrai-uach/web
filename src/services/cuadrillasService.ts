/**
 * Capa de acceso a datos (DAL) para Cuadrillas Operativas (H79).
 * Se comunica con sgrai-api vía apiClient / openapi-fetch.
 */

import apiClient from '@/lib/api/client';
import { catalogosService } from '@/services/catalogosService';
import { getAuthCookie } from '@/lib/utils/cookieUtils';
import type {
  CrearCuadrillaDTO,
  EditarCuadrillaDTO,
  CuadrillaItem,
  CuadrillaDetalle,
  CuadrillaCreada,
  CuadrillaRecursoDetalle,
  CuadrillaTrabajadorDetalle,
  CrearCuadrillaApiResponse,
  EditarCuadrillaApiResponse,
  ListarCuadrillasApiResponse,
  DetalleCuadrillaApiResponse,
  PersonalCandidatoDelegado,
  PersonalOperativoDisponible,
  RecursoInventarioDisponible,
  DelegacionResumen,
  FiltrosCuadrillasState,
  MetaPaginacionCuadrillas,
  DesactivarCuadrillaData,
  DesactivarCuadrillaApiResponse,
} from '@/types/cuadrilla';

type HttpGetFn = <T>(url: string, init?: unknown) => Promise<{ data?: T; error?: unknown; response: Response }>;

export class CuadrillaServiceError extends Error {
  public status?: number;
  public codigo?: string;
  public campo?: 'nombre' | 'delegacionId' | 'usuarioDelegadoId' | 'recursos' | 'trabajadores' | 'general';
  public detalles?: Array<{ campo: string; mensaje: string }>;

  constructor(
    message: string,
    status?: number,
    campo?: 'nombre' | 'delegacionId' | 'usuarioDelegadoId' | 'recursos' | 'trabajadores' | 'general',
    codigo?: string,
    detalles?: Array<{ campo: string; mensaje: string }>
  ) {
    super(message);
    this.name = 'CuadrillaServiceError';
    this.status = status;
    this.campo = campo;
    this.codigo = codigo;
    this.detalles = detalles;
  }
}

function getAuthorizationHeader(explicitToken?: string): string {
  const token =
    explicitToken ||
    getAuthCookie() ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('sgrai_auth_token') || localStorage.getItem('token')
      : null);

  return token ? `Bearer ${token}` : '';
}

/**
 * Normaliza el código o nombre del rol a una etiqueta amigable y legible para el usuario.
 * Evita términos técnicos en mayúsculas sostenidas o con guiones bajos (ej. DELEGADO_CUADRILLA).
 */
export function formatearNombreRol(codigo?: string | null, nombre?: string | null): string {
  if (nombre && !nombre.includes('_') && nombre !== nombre.toUpperCase()) {
    return nombre;
  }
  const c = (codigo || nombre || '').toUpperCase();
  switch (c) {
    case 'DELEGADO_CUADRILLA':
      return 'Delegado de Cuadrilla';
    case 'OPERARIO':
      return 'Operario';
    case 'BRIGADISTA':
      return 'Brigadista';
    case 'CONDUCTOR':
    case 'CHOFER':
      return 'Conductor';
    case 'PATRULLERO':
      return 'Patrullero';
    case 'PERSONAL_TERRENO':
      return 'Personal de Terreno';
    case 'ENCARGADO':
      return 'Encargado de Operaciones';
    case 'ADMIN':
    case 'ADMINISTRADOR':
      return 'Administrador';
    case 'ASISTENTE_SOCIAL':
      return 'Asistente Social';
    case 'CALL_CENTER':
      return 'Call Center';
    default:
      return (
        c.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase()) ||
        'Personal Operativo'
      );
  }
}

/**
 * Candidatos de respaldo en caso de que el backend no tenga registros poblados en BD local
 */
export const CANDIDATOS_DELEGADOS_FALLBACK: PersonalCandidatoDelegado[] = [
  {
    id: '00000000-0000-4000-8000-000000000006',
    nombreCompleto: 'Andrés Morales Ríos',
    rut: '16.789.012-3',
    email: 'andres.morales@valdivia.cl',
    rolNombre: 'Brigadista',
    rolCodigo: 'BRIGADISTA',
    delegacionNombre: 'Norte',
    estadoOperativo: 'disponible',
  },
  {
    id: '00000000-0000-4000-8000-000000000010',
    nombreCompleto: 'Felipe Sandoval Cárdenas',
    rut: '17.654.321-0',
    email: 'felipe.sandoval@valdivia.cl',
    rolNombre: 'Brigadista',
    rolCodigo: 'BRIGADISTA',
    delegacionNombre: 'Calle Calle',
    estadoOperativo: 'disponible',
  },
  {
    id: '00000000-0000-4000-8000-000000000011',
    nombreCompleto: 'Matías Oyarzún Vera',
    rut: '18.123.789-4',
    email: 'matias.oyarzun@valdivia.cl',
    rolNombre: 'Brigadista',
    rolCodigo: 'BRIGADISTA',
    delegacionNombre: 'Costa',
    estadoOperativo: 'disponible',
  },
  {
    id: '00000000-0000-4000-8000-000000000012',
    nombreCompleto: 'Sebastián Alarcón Toledo',
    rut: '15.987.654-2',
    email: 'sebastian.alarcon@valdivia.cl',
    rolNombre: 'Brigadista',
    rolCodigo: 'BRIGADISTA',
    delegacionNombre: 'Sur',
    estadoOperativo: 'disponible',
  },
];

/**
 * Cuadrillas de respaldo para desarrollo o cuando la API no dispone de registros
 */
export const CUADRILLAS_FALLBACK: CuadrillaItem[] = [
  {
    id: '50000000-0000-4000-8000-000000000001',
    nombre: 'Cuadrilla Vías y Despeje Urbano',
    estado: 'DISPONIBLE',
    delegacion: {
      id: '30000000-0000-4000-8000-000000000001',
      nombre: 'Delegación Municipal Norte',
    },
    delegado: {
      id: '00000000-0000-4000-8000-000000000005',
      nombre: 'Carlos Delegado',
      email: 'carlos@valdivia.cl',
      rut: '15.111.222-3',
      telefono: '+56 9 8111 2233',
    },
    recursos: [
      {
        id: 'cd100000-0000-4000-8000-000000000001',
        recursoId: 'e1000000-0000-4000-8000-000000000001',
        nombre: 'Camioneta de Rescate 4x4',
        cantidadAsignada: 1,
        esIndividual: true,
        descripcion: 'Vehículo todoterreno para traslado de operarios y equipos',
        especificaciones: {
          patente: 'ABCD-12',
          marca: 'Toyota',
          modelo: 'Hilux 4x4',
          anio: 2023,
        },
      },
      {
        id: 'cd100000-0000-4000-8000-000000000002',
        recursoId: 'e1000000-0000-4000-8000-000000000003',
        nombre: 'Motosierra Stihl MS-382',
        cantidadAsignada: 2,
        esIndividual: false,
        descripcion: 'Herramienta de corte para despeje de ramas caídas y corte forestal',
        especificaciones: {
          marca: 'Stihl',
          modelo: 'MS-382',
          cilindrada: '72.2 cc',
        },
      },
    ],
    trabajadores: [
      {
        id: 'cp100000-0000-4000-8000-000000000001',
        personalId: '40000000-0000-4000-8000-000000000001',
        usuarioId: '00000000-0000-4000-8000-000000000009',
        nombre: 'Pedro Obrero',
        rut: '16.222.333-4',
        cargo: 'Motosierrista',
        especialidad: 'Poda de Altura',
        telefono: '+56 9 8765 4321',
        asignadoEn: '2026-10-24T12:00:00.000Z',
      },
      {
        id: 'cp100000-0000-4000-8000-000000000002',
        personalId: '40000000-0000-4000-8000-000000000002',
        usuarioId: '00000000-0000-4000-8000-000000000013',
        nombre: 'Jorge Almonacid',
        rut: '17.333.444-5',
        cargo: 'Operario',
        especialidad: 'Retiro de Escombros',
        telefono: '+56 9 9123 4567',
        asignadoEn: '2026-10-24T12:00:00.000Z',
      },
    ],
    totalRecursos: 2,
    totalTrabajadores: 2,
    activo: true,
    misionActiva: null,
    creadoEn: '2026-10-24T12:00:00.000Z',
    actualizadoEn: '2026-10-26T01:30:00.000Z',
  },
  {
    id: '50000000-0000-4000-8000-000000000002',
    nombre: 'Cuadrilla Mitigación Costera',
    estado: 'EN_MISION',
    delegacion: {
      id: '30000000-0000-4000-8000-000000000003',
      nombre: 'Delegación Municipal Costa',
    },
    delegado: {
      id: '00000000-0000-4000-8000-000000000011',
      nombre: 'Matías Oyarzún Vera',
      email: 'matias.oyarzun@valdivia.cl',
      rut: '18.123.789-4',
      telefono: '+56 9 8234 5678',
    },
    recursos: [
      {
        id: 'cd200000-0000-4000-8000-000000000001',
        recursoId: 'e1000000-0000-4000-8000-000000000002',
        nombre: 'Camión Tolva 10m3',
        cantidadAsignada: 1,
        esIndividual: true,
        descripcion: 'Camión de carga pesada para remoción y traslado de ripio o escombros',
        especificaciones: {
          patente: 'GHJK-78',
          marca: 'Mercedes-Benz',
          modelo: 'Arocs 3342',
          capacidad: '10 m3',
        },
      },
    ],
    trabajadores: [
      {
        id: 'cp200000-0000-4000-8000-000000000001',
        personalId: '40000000-0000-4000-8000-000000000003',
        usuarioId: '00000000-0000-4000-8000-000000000014',
        nombre: 'Claudio Soto',
        rut: '14.555.666-7',
        cargo: 'Conductor',
        especialidad: 'Maquinaria Pesada',
        telefono: '+56 9 7654 3210',
        asignadoEn: '2026-10-25T08:00:00.000Z',
      },
    ],
    misionActiva: {
      id: 'mis-50000000-0000-4000-8000-000000000001',
      codigo: 'MIS-2026-089',
      titulo: 'Mitigación y despeje de cauce costero',
      tipoMision: 'MITIGACION',
      estado: 'EN_CURSO',
      fechaDespacho: '2026-10-25T08:30:00.000Z',
      tiempoTranscurridoMinutos: 85,
      incidente: {
        id: 'inc-00000000-0000-4000-8000-000000000002',
        codigo: 'INC-2026-042',
        tipo: 'Anegamiento de Vía Pública',
        direccion: 'Av. Costanera Arturo Prat 1250',
        latitud: -39.8142,
        longitud: -73.2459,
      },
    },
    totalRecursos: 1,
    totalTrabajadores: 1,
    activo: true,
    creadoEn: '2026-10-25T08:00:00.000Z',
    actualizadoEn: null,
  },
  {
    id: '50000000-0000-4000-8000-000000000003',
    nombre: 'Cuadrilla Drenaje y Aguas Lluvias Sur',
    estado: 'DISPONIBLE',
    delegacion: {
      id: '30000000-0000-4000-8000-000000000002',
      nombre: 'Delegación Municipal Sur',
    },
    delegado: {
      id: '00000000-0000-4000-8000-000000000012',
      nombre: 'Sebastián Alarcón Toledo',
      email: 'sebastian.alarcon@valdivia.cl',
      rut: '15.987.654-2',
      telefono: '+56 9 6543 2109',
    },
    recursos: [
      {
        id: 'cd300000-0000-4000-8000-000000000001',
        recursoId: 'e1000000-0000-4000-8000-000000000004',
        nombre: 'Motobomba de Achique 3"',
        cantidadAsignada: 2,
        esIndividual: false,
        descripcion: 'Bomba de succión para anegamientos residenciales y colectores',
        especificaciones: {
          marca: 'Honda',
          modelo: 'WT30X',
          caudal: '1200 L/min',
        },
      },
    ],
    trabajadores: [],
    misionActiva: null,
    totalRecursos: 1,
    totalTrabajadores: 0,
    activo: true,
    creadoEn: '2026-10-23T10:00:00.000Z',
    actualizadoEn: null,
  },
];

/**
 * Helper interno para simular la actualización en memoria de una cuadrilla de respaldo (fallback).
 * Mapea fielmente los recursos y trabajadores desde el payload y catálogos locales.
 */
async function aplicarActualizacionFallback(
  item: CuadrillaItem,
  payload: EditarCuadrillaDTO
): Promise<CuadrillaDetalle> {
  const estado = (item.estado || '').toUpperCase();
  if (estado === 'EN_MISION' || estado === 'EN_TRANSITO' || estado === 'EN_OPERACION') {
    throw new CuadrillaServiceError(
      'No es posible modificar los datos ni la dotación de una cuadrilla que se encuentra actualmente en misión activa en terreno.',
      409,
      'general',
      'CUADRILLA_EN_MISION'
    );
  }

  const delegacionItem = catalogosService.obtenerDelegacionPorId(payload.delegacionId);
  const delegacionNombre =
    delegacionItem?.nombre ||
    catalogosService.resolverDelegacionNombre(payload.delegacionId) ||
    item.delegacion.nombre;

  const delegacionObj: DelegacionResumen = {
    id: delegacionItem?.id || payload.delegacionId,
    nombre: delegacionNombre,
    codigo: delegacionItem?.codigo || item.delegacion.codigo,
  };

  let delegadoObj = CANDIDATOS_DELEGADOS_FALLBACK.find((c) => c.id === payload.usuarioDelegadoId);
  if (!delegadoObj) {
    try {
      // Se excluye la propia cuadrilla para que su delegado actual siga siendo resoluble
      const candidatos = await cuadrillasService.obtenerCandidatosDelegados(undefined, item.id);
      delegadoObj = candidatos.find((c) => c.id === payload.usuarioDelegadoId);
    } catch {
      // Ignorar fallo de búsqueda
    }
  }

  // Mapear recursos asignados
  let recursosDisponibles: RecursoInventarioDisponible[] = [];
  try {
    recursosDisponibles = await cuadrillasService.obtenerRecursosDisponibles();
  } catch {
    // Ignorar fallo de inventario
  }

  const recursosActualizados: CuadrillaRecursoDetalle[] = (payload.recursos || []).map((r, i) => {
    const existente = item.recursos?.find((ir) => ir.recursoId === r.recursoId);
    if (existente) {
      return {
        ...existente,
        cantidadAsignada: r.cantidad,
      };
    }
    const encontrado = recursosDisponibles.find((rec) => rec.id === r.recursoId);
    return {
      id: `cd-${item.id.slice(0, 8)}-${i + 1}`,
      recursoId: r.recursoId,
      nombre: encontrado?.nombre || `Recurso Asignado`,
      cantidadAsignada: r.cantidad,
      esIndividual: encontrado?.esIndividual ?? false,
    };
  });

  // Mapear trabajadores asignados
  let personalDisponible: PersonalOperativoDisponible[] = [];
  try {
    personalDisponible = await cuadrillasService.obtenerPersonalOperativoDisponible(undefined, item.id);
  } catch {
    // Ignorar fallo de personal
  }

  const trabajadoresActualizados: CuadrillaTrabajadorDetalle[] = (payload.trabajadores || []).map((t, i) => {
    const existente = item.trabajadores?.find((it) => it.personalId === t.personalId);
    if (existente) {
      return existente;
    }
    const encontrado = personalDisponible.find((p) => p.id === t.personalId);
    return {
      id: `cp-${item.id.slice(0, 8)}-${i + 1}`,
      personalId: t.personalId,
      usuarioId: encontrado?.usuarioId || t.personalId,
      nombre: encontrado?.nombre || 'Personal Operativo',
      rut: encontrado?.rut || null,
      cargo: encontrado?.cargo || 'Brigadista',
      especialidad: encontrado?.especialidad || null,
      asignadoEn: new Date().toISOString(),
    };
  });

  const cuadrillaActualizada: CuadrillaDetalle = {
    ...item,
    nombre: payload.nombre.trim(),
    delegacion: delegacionObj,
    delegado: delegadoObj
      ? {
          id: delegadoObj.id,
          nombre: delegadoObj.nombreCompleto,
          email: delegadoObj.email,
          rut: delegadoObj.rut,
        }
      : item.delegado,
    recursos: recursosActualizados,
    trabajadores: trabajadoresActualizados,
    totalRecursos: recursosActualizados.length,
    totalTrabajadores: trabajadoresActualizados.length,
    actualizadoEn: new Date().toISOString(),
  };

  return cuadrillaActualizada;
}

export const cuadrillasService = {
  /**
   * Envía la solicitud para dar de alta una nueva cuadrilla operativa en sgrai-api.
   * Maneja errores semánticos (409 colisión de nombre, 400 validación, 403 permisos).
   */
  async crearCuadrilla(payload: CrearCuadrillaDTO): Promise<CuadrillaCreada> {
    try {
      const { data, error, response } = await apiClient.POST(
        '/api/cuadrillas' as unknown as Parameters<typeof apiClient.POST>[0],
        {
          body: {
            nombre: payload.nombre.trim(),
            delegacionId: payload.delegacionId,
            usuarioDelegadoId: payload.usuarioDelegadoId,
          } as unknown as Parameters<typeof apiClient.POST>[1]['body'],
        } as unknown as Parameters<typeof apiClient.POST>[1]
      );

      // 1. Manejo explícito de respuesta exitosa (201 Created)
      if (response && response.status === 201) {
        const resp = data as unknown as CrearCuadrillaApiResponse;
        if (resp && resp.data) {
          return resp.data;
        }
      }

      // 2. Colisión de nombre único (409 Conflict)
      if (response && response.status === 409) {
        throw new CuadrillaServiceError(
          'Ya existe una cuadrilla operativa con este nombre.',
          409,
          'nombre',
          'NOMBRE_DUPLICADO'
        );
      }

      // 3. Permisos insuficientes (403 Forbidden)
      if (response && response.status === 403) {
        throw new CuadrillaServiceError(
          'No tiene permisos suficientes para registrar cuadrillas operativas (requiere permiso recursos:crear o rol Administrador).',
          403,
          'general',
          'PERMISOS_INSUFICIENTES'
        );
      }

      // 4. Recursos no encontrados (404 Not Found)
      if (response && response.status === 404) {
        throw new CuadrillaServiceError(
          'La delegación municipal o el funcionario seleccionado no existen o fueron dados de baja.',
          404,
          'general',
          'RECURSO_NO_ENCONTRADO'
        );
      }

      // 5. Errores de validación de formulario (400 Bad Request)
      if (response && response.status === 400) {
        const errObj = error as unknown as { message?: string; errors?: Array<{ path?: string[]; message: string }> };
        const msg = errObj?.message || 'Los datos de la cuadrilla no son válidos.';
        throw new CuadrillaServiceError(
          msg,
          400,
          'general',
          'DATOS_INVALIDOS',
          errObj?.errors?.map((e) => ({
            campo: e.path ? e.path.join('.') : 'general',
            mensaje: e.message,
          }))
        );
      }

      // Fallback para otros errores o respuestas no OK
      if (error || (response && !response.ok)) {
        throw new CuadrillaServiceError(
          'Error inesperado al intentar crear la cuadrilla operativa. Intente nuevamente.',
          response ? response.status : 500
        );
      }

      // En caso de que la respuesta venga sin error
      const fallBackResp = data as unknown as CrearCuadrillaApiResponse;
      if (fallBackResp?.data) {
        return fallBackResp.data;
      }

      throw new CuadrillaServiceError('Respuesta inesperada del servidor al crear cuadrilla.', 500);
    } catch (err: unknown) {
      if (err instanceof CuadrillaServiceError) {
        throw err;
      }
      throw new CuadrillaServiceError(
        err instanceof Error ? err.message : 'Error de comunicación con el servicio de cuadrillas.',
        500
      );
    }
  },

  /**
   * Obtiene la nómina de funcionarios aptos para ser asignados como Delegado de Cuadrilla.
   *
   * Candidatos admisibles:
   * - BRIGADISTA: al guardar la cuadrilla se promueve automáticamente a DELEGADO_CUADRILLA.
   * - DELEGADO_CUADRILLA: conserva su rol y asume el liderazgo de la nueva unidad.
   *
   * Se consultan vía GET /api/personal aplicando `sinAsignacionCuadrilla`, de modo que el
   * backend ya excluye a quienes lideran o integran otra cuadrilla operativa activa (regla ICS).
   *
   * @param busqueda Texto de búsqueda opcional (RUT, nombres, apellidos o email).
   * @param excluirCuadrillaId Cuadrilla que se está editando: sus integrantes no se excluyen.
   */
  async obtenerCandidatosDelegados(
    busqueda?: string,
    excluirCuadrillaId?: string
  ): Promise<PersonalCandidatoDelegado[]> {
    try {
      const q = busqueda?.trim();

      const authHeader = getAuthorizationHeader();
      interface EmpleadoCandidatoRawApi {
        usuario_id: string;
        nombres: string;
        apellidos: string;
        rut: string;
        email: string;
        rol_codigo?: string | null;
        rol_nombre?: string | null;
        delegacion_nombre?: string | null;
        estado_operativo?: 'disponible' | 'en_mision' | 'en_patrulla' | 'descanso' | 'licencia' | 'inactivo';
        usuario_activo?: boolean;
        cargo?: string | null;
        especialidad?: string | null;
      }

      // Consulta directa al backend mediante apiClient
      const { data, response } = await (apiClient.GET as unknown as HttpGetFn)<{ data?: EmpleadoCandidatoRawApi[] }>(
        '/api/personal',
        {
          params: {
            query: {
              q: q || undefined,
              sinAsignacionCuadrilla: true,
              excluirCuadrillaId: excluirCuadrillaId || undefined,
            },
            header: {
              authorization: authHeader,
            },
          },
        }
      );

      // Si la API responde correctamente se respeta el resultado (incluso vacío);
      // el fallback predefinido solo aplica ante fallo de comunicación.
      if (response.ok && Array.isArray(data?.data)) {
        return data.data
          .filter((emp) => {
            // Excluir únicamente si está explícitamente inactivo
            if (emp.usuario_activo === false) return false;

            const rolCodigo = (emp.rol_codigo || '').toUpperCase();
            const rolNombre = (emp.rol_nombre || '').toLowerCase();
            const cargo = (emp.cargo || '').toLowerCase();

            // Admite brigadistas (se promoverán) y delegados de cuadrilla ya constituidos
            const esBrigadista =
              rolCodigo === 'BRIGADISTA' ||
              rolNombre.includes('brigad') ||
              cargo.includes('brigad');

            const esDelegado =
              rolCodigo === 'DELEGADO_CUADRILLA' ||
              rolNombre.includes('delegad') ||
              cargo.includes('delegad');

            return esBrigadista || esDelegado;
          })
          .map((emp) => ({
            id: emp.usuario_id,
            nombreCompleto: `${emp.nombres} ${emp.apellidos}`.trim(),
            rut: emp.rut,
            email: emp.email,
            rolNombre: formatearNombreRol(emp.rol_codigo, emp.rol_nombre),
            rolCodigo: emp.rol_codigo || '',
            delegacionNombre: emp.delegacion_nombre || undefined,
            estadoOperativo: emp.estado_operativo || undefined,
          }));
      }

      // Fallback a lista predefinida si el endpoint falló (sin conectividad o error del servidor)
      const fallbackFiltrado = CANDIDATOS_DELEGADOS_FALLBACK.filter((c) => {
        if (!q) return true;
        const termino = q.toLowerCase();
        return (
          c.nombreCompleto.toLowerCase().includes(termino) ||
          c.rut.toLowerCase().includes(termino) ||
          c.rolNombre.toLowerCase().includes(termino)
        );
      });

      return fallbackFiltrado;
    } catch {
      // En caso de excepción, devolver candidatos de fallback filtrados
      const q = busqueda?.trim().toLowerCase();
      return CANDIDATOS_DELEGADOS_FALLBACK.filter((c) => {
        if (!q) return true;
        return (
          c.nombreCompleto.toLowerCase().includes(q) ||
          c.rut.toLowerCase().includes(q) ||
          c.rolNombre.toLowerCase().includes(q)
        );
      });
    }
  },

  /**
   * Modifica los datos, delegado responsable y dotación (trabajadores y recursos) de una cuadrilla (H81).
   * Se comunica con PUT /api/cuadrillas/{id}.
   */
  async actualizarCuadrilla(id: string, payload: EditarCuadrillaDTO): Promise<CuadrillaDetalle> {
    try {
      const { data, error, response } = await apiClient.PUT(
        `/api/cuadrillas/${id}` as unknown as Parameters<typeof apiClient.PUT>[0],
        {
          body: {
            nombre: payload.nombre.trim(),
            delegacionId: payload.delegacionId,
            usuarioDelegadoId: payload.usuarioDelegadoId,
            recursos: payload.recursos || [],
            trabajadores: payload.trabajadores || [],
          } as unknown as Parameters<typeof apiClient.PUT>[1]['body'],
        } as unknown as Parameters<typeof apiClient.PUT>[1]
      );

      // 1. Manejo de respuesta exitosa (200 OK)
      if (response && response.status === 200) {
        const resp = data as unknown as EditarCuadrillaApiResponse;
        if (resp && resp.data) {
          return resp.data;
        }
      }

      // 2. Manejo de conflicto operativo (409 Conflict)
      if (response && response.status === 409) {
        const errObj = error as unknown as { message?: string };
        const msg = errObj?.message || 'Conflicto operativo al intentar modificar la cuadrilla.';
        const msgLower = msg.toLowerCase();

        if (msgLower.includes('recurso') || msgLower.includes('individual')) {
          throw new CuadrillaServiceError(
            msg,
            409,
            'recursos',
            'RECURSO_EN_USO'
          );
        }

        if (
          msgLower.includes('misión') ||
          msgLower.includes('mision') ||
          msgLower.includes('en misión') ||
          msgLower.includes('misiones operativas')
        ) {
          throw new CuadrillaServiceError(
            'No es posible modificar los datos ni la dotación de una cuadrilla que se encuentra actualmente en misión activa en terreno.',
            409,
            'general',
            'CUADRILLA_EN_MISION'
          );
        }

        if (msgLower.includes('nombre') || msgLower.includes('duplicado')) {
          throw new CuadrillaServiceError(
            'Ya existe otra cuadrilla operativa con el nombre ingresado.',
            409,
            'nombre',
            'NOMBRE_DUPLICADO'
          );
        }

        throw new CuadrillaServiceError(msg, 409, 'general', 'CONFLICTO_OPERATIVO');
      }

      // 3. Permisos insuficientes (403 Forbidden)
      if (response && response.status === 403) {
        throw new CuadrillaServiceError(
          'No tiene permisos suficientes para modificar cuadrillas operativas (requiere permiso recursos:editar o rol Administrador).',
          403,
          'general',
          'PERMISOS_INSUFICIENTES'
        );
      }

      // 4. Recursos o personal no encontrados (404 Not Found)
      if (response && response.status === 404) {
        const indexFallback = CUADRILLAS_FALLBACK.findIndex((c) => c.id === id);
        if (indexFallback !== -1) {
          const cuadrillaActualizada = await aplicarActualizacionFallback(CUADRILLAS_FALLBACK[indexFallback], payload);
          CUADRILLAS_FALLBACK[indexFallback] = cuadrillaActualizada;
          return cuadrillaActualizada;
        }

        const errObj = error as unknown as { message?: string };
        throw new CuadrillaServiceError(
          errObj?.message || 'La cuadrilla operativa especificada o uno de sus recursos no existe.',
          404,
          'general',
          'RECURSO_NO_ENCONTRADO'
        );
      }

      // 5. Errores de validación (400 Bad Request)
      if (response && response.status === 400) {
        const errObj = error as unknown as { message?: string; errors?: Array<{ campo?: string; path?: string[]; mensaje?: string; message?: string }> };
        const msg = errObj?.message || 'Los datos de la cuadrilla o dotación no son válidos.';
        throw new CuadrillaServiceError(
          msg,
          400,
          'general',
          'DATOS_INVALIDOS',
          errObj?.errors?.map((e) => ({
            campo: e.campo || (e.path ? e.path.join('.') : 'general'),
            mensaje: e.mensaje || e.message || 'Dato no válido',
          }))
        );
      }

      if (error || (response && !response.ok)) {
        // En caso de que el backend responda con error 401 o 500 para un registro local de prueba
        const indexFallback = CUADRILLAS_FALLBACK.findIndex((c) => c.id === id);
        if (indexFallback !== -1) {
          const cuadrillaActualizada = await aplicarActualizacionFallback(CUADRILLAS_FALLBACK[indexFallback], payload);
          CUADRILLAS_FALLBACK[indexFallback] = cuadrillaActualizada;
          return cuadrillaActualizada;
        }

        throw new CuadrillaServiceError(
          'Error inesperado al intentar actualizar la cuadrilla. Intente nuevamente.',
          response ? response.status : 500
        );
      }

      const fallBackResp = data as unknown as EditarCuadrillaApiResponse;
      if (fallBackResp?.data) {
        return fallBackResp.data;
      }

      throw new CuadrillaServiceError('Respuesta inesperada del servidor al actualizar cuadrilla.', 500);
    } catch (err: unknown) {
      if (err instanceof CuadrillaServiceError) {
        throw err;
      }

      // Si falló por excepción de red (fetch fallido) para un registro local
      const indexFallback = CUADRILLAS_FALLBACK.findIndex((c) => c.id === id);
      if (indexFallback !== -1) {
        const cuadrillaActualizada = await aplicarActualizacionFallback(CUADRILLAS_FALLBACK[indexFallback], payload);
        CUADRILLAS_FALLBACK[indexFallback] = cuadrillaActualizada;
        return cuadrillaActualizada;
      }

      throw new CuadrillaServiceError(
        err instanceof Error ? err.message : 'Error de comunicación con el servicio de cuadrillas.',
        500
      );
    }
  },

  /**
   * Obtiene el listado de cuadrillas operativas con soporte de filtros y paginación.
   */
  async obtenerCuadrillas(filtros?: Partial<FiltrosCuadrillasState>): Promise<{ cuadrillas: CuadrillaItem[]; meta: MetaPaginacionCuadrillas }> {
    const pagina = filtros?.pagina || 1;
    const limite = filtros?.limite || 10;
    const busqueda = filtros?.busqueda?.trim();
    const delegacionId = filtros?.delegacionId;
    const estado = filtros?.estado;

    // Mapeo de estados del filtro de UI al contrato de la API (HU-82)
    const estadoQuery: "DISPONIBLE" | "EN_MISION" | "NO_DISPONIBLE" | undefined =
      estado === 'INACTIVAS'
        ? 'NO_DISPONIBLE'
        : estado === 'TODAS' || estado === 'ACTIVAS' || !estado
        ? undefined
        : (estado as "DISPONIBLE" | "EN_MISION" | "NO_DISPONIBLE");

    const incluirInactivas = estado === 'TODAS' || estado === 'INACTIVAS' ? true : undefined;

    try {
      const authHeader = getAuthorizationHeader();
      const { data, response } = await (apiClient.GET as unknown as HttpGetFn)<ListarCuadrillasApiResponse>(
        '/api/cuadrillas',
        {
          params: {
            query: {
              pagina,
              limite,
              q: busqueda || undefined,
              delegacionId: delegacionId || undefined,
              estado: estadoQuery,
              incluirInactivas,
            },
            header: {
              authorization: authHeader,
            },
          },
        }
      );

      // Propagación explícita de errores de autenticación/autorización:
      // nunca se debe caer al fallback con datos municipales ante un 401 o 403.
      if (response && (response.status === 401 || response.status === 403)) {
        throw new CuadrillaServiceError(
          response.status === 401
            ? 'Su sesión expiró o no está autenticado para consultar cuadrillas operativas.'
            : 'No tiene permisos suficientes para consultar cuadrillas operativas (requiere permiso recursos:leer).',
          response.status,
          'general',
          response.status === 401 ? 'NO_AUTENTICADO' : 'PERMISOS_INSUFICIENTES'
        );
      }

      if (response && response.ok && data) {
        if (Array.isArray(data.data)) {
          // Contrato H34: el backend puede responder con page/limit/totalPages
          // o con la nomenclatura histórica pagina/limite/paginasTotales.
          const rawMeta = (data.meta ?? {}) as Partial<MetaPaginacionCuadrillas> & {
            page?: number;
            limit?: number;
            totalPages?: number;
          };
          const paginaNormalizada = rawMeta.pagina ?? rawMeta.page ?? pagina;
          const limiteNormalizado = rawMeta.limite ?? rawMeta.limit ?? limite;
          const totalNormalizado = rawMeta.total ?? data.data.length;
          const paginasTotalesNormalizadas =
            rawMeta.paginasTotales ??
            rawMeta.totalPages ??
            (Math.ceil(totalNormalizado / limiteNormalizado) || 1);

          return {
            cuadrillas: data.data,
            meta: {
              total: totalNormalizado,
              pagina: paginaNormalizada,
              limite: limiteNormalizado,
              paginasTotales: paginasTotalesNormalizadas,
            },
          };
        }
      }
    } catch (err) {
      // Los errores de permisos deben llegar al hook/vista; el resto usa fallback.
      if (err instanceof CuadrillaServiceError) {
        throw err;
      }
    }

    // Filtrado de respaldo en memoria local (fallback)
    let resultado = [...CUADRILLAS_FALLBACK];

    if (busqueda) {
      const qLower = busqueda.toLowerCase();
      resultado = resultado.filter(
        (c) =>
          c.nombre.toLowerCase().includes(qLower) ||
          c.delegado.nombre.toLowerCase().includes(qLower) ||
          (c.delegado.rut && c.delegado.rut.toLowerCase().includes(qLower))
      );
    }

    if (delegacionId) {
      resultado = resultado.filter((c) => c.delegacion.id === delegacionId);
    }

    if (estado) {
      resultado = resultado.filter((c) => c.estado === estado);
    }

    const total = resultado.length;
    const paginasTotales = Math.ceil(total / limite) || 1;
    const inicio = (pagina - 1) * limite;
    const paginadas = resultado.slice(inicio, inicio + limite);

    return {
      cuadrillas: paginadas,
      meta: {
        total,
        pagina,
        limite,
        paginasTotales,
      },
    };
  },

  /**
   * Obtiene el detalle individual de una cuadrilla operativa por ID.
   */
  async obtenerCuadrillaPorId(id: string): Promise<CuadrillaDetalle> {
    try {
      const authHeader = getAuthorizationHeader();
      const { data, response } = await apiClient.GET('/api/cuadrillas/{id}', {
        params: {
          path: { id },
          header: {
            authorization: authHeader,
          },
        },
      });

      if (response) {
        if (response.status === 403) {
          throw new CuadrillaServiceError(
            'No cuenta con privilegios suficientes para consultar el detalle de la cuadrilla (requiere permiso recursos:leer o rol Encargado).',
            403,
            'general',
            'PERMISOS_INSUFICIENTES'
          );
        }

        if (response.status === 401) {
          throw new CuadrillaServiceError(
            'Sesión no válida o expirada. Por favor inicie sesión nuevamente.',
            401,
            'general',
            'NO_AUTORIZADO'
          );
        }

        if (response.status === 404) {
          throw new CuadrillaServiceError(
            'La cuadrilla operativa especificada no existe.',
            404,
            'general',
            'RECURSO_NO_ENCONTRADO'
          );
        }

        if (!response.ok) {
          const mensajeError =
            response.status === 400
              ? 'Solicitud incorrecta al consultar la cuadrilla.'
              : 'Error interno del servidor al consultar la cuadrilla.';
          throw new CuadrillaServiceError(
            mensajeError,
            response.status,
            'general',
            response.status >= 500 ? 'ERROR_SERVIDOR' : 'ERROR_SOLICITUD'
          );
        }

        if (response.ok && data) {
          const resp = data as DetalleCuadrillaApiResponse;
          if (resp && resp.data) {
            return resp.data as CuadrillaDetalle;
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof CuadrillaServiceError) {
        throw err;
      }
      // Solo en caso de error de red estricto (offline/servidor apagado) se permite fallback
    }

    const cuadrillaLocal = CUADRILLAS_FALLBACK.find((c) => c.id === id);
    if (cuadrillaLocal) {
      return cuadrillaLocal;
    }

    throw new CuadrillaServiceError('La cuadrilla operativa especificada no existe.', 404, 'general', 'RECURSO_NO_ENCONTRADO');
  },

  /**
   * Obtiene el personal de terreno disponible para conformar la dotación de la cuadrilla (cuadrilla_personal).
   * Consulta GET /api/personal?estadoOperativo=disponible&soloPersonal=true.
   */
  async obtenerPersonalOperativoDisponible(
    busqueda?: string,
    excluirCuadrillaId?: string
  ): Promise<PersonalOperativoDisponible[]> {
    try {
      const q = busqueda?.trim();
      interface PersonalOperativoRawApi {
        usuario_id: string;
        personal_id?: string;
        id?: string;
        nombres: string;
        apellidos: string;
        rut: string;
        cargo?: string | null;
        especialidad?: string | null;
        delegacion_nombre?: string | null;
        estado_operativo?: string | null;
        disponible_terreno?: boolean | null;
        usuario_activo?: boolean;
      }

      const authHeader = getAuthorizationHeader();
      const { data, response } = await (apiClient.GET as unknown as HttpGetFn)<{ data?: PersonalOperativoRawApi[] }>(
        '/api/personal',
        {
          params: {
            query: {
              q: q || undefined,
              estadoOperativo: 'disponible',
              soloPersonal: true,
              sinAsignacionCuadrilla: true,
              excluirCuadrillaId: excluirCuadrillaId || undefined,
            },
            header: {
              authorization: authHeader,
            },
          },
        }
      );

      if (response && response.ok && data?.data && Array.isArray(data.data)) {
        return data.data
          .filter((emp) => emp.usuario_activo !== false)
          .map((emp) => ({
            id: emp.personal_id || ('id' in emp && typeof (emp as { id?: unknown }).id === 'string' ? (emp as { id: string }).id : emp.usuario_id),
            usuarioId: emp.usuario_id,
            nombre: `${emp.nombres} ${emp.apellidos}`.trim(),
            rut: emp.rut,
            cargo: emp.cargo || 'Operario',
            especialidad: emp.especialidad || 'Labores Generales',
            delegacionNombre: emp.delegacion_nombre ?? undefined,
            estadoOperativo: emp.estado_operativo ?? undefined,
            disponibleTerreno: emp.disponible_terreno ?? undefined,
          }));
      }
    } catch {
      // Fallback a candidatos predefinidos
    }

    const fallbacks: PersonalOperativoDisponible[] = [
      {
        id: '40000000-0000-4000-8000-000000000001',
        usuarioId: '00000000-0000-4000-8000-000000000009',
        nombre: 'Pedro Obrero',
        rut: '16.222.333-4',
        cargo: 'Motosierrista',
        especialidad: 'Poda de Altura',
        delegacionNombre: 'Norte',
        estadoOperativo: 'disponible',
        disponibleTerreno: true,
      },
      {
        id: '40000000-0000-4000-8000-000000000002',
        usuarioId: '00000000-0000-4000-8000-000000000013',
        nombre: 'Jorge Almonacid',
        rut: '17.333.444-5',
        cargo: 'Operario',
        especialidad: 'Retiro de Escombros',
        delegacionNombre: 'Norte',
        estadoOperativo: 'disponible',
        disponibleTerreno: true,
      },
      {
        id: '40000000-0000-4000-8000-000000000003',
        usuarioId: '00000000-0000-4000-8000-000000000014',
        nombre: 'Claudio Soto',
        rut: '14.555.666-7',
        cargo: 'Conductor',
        especialidad: 'Maquinaria Pesada',
        delegacionNombre: 'Costa',
        estadoOperativo: 'disponible',
        disponibleTerreno: true,
      },
      {
        id: '40000000-0000-4000-8000-000000000004',
        usuarioId: '00000000-0000-4000-8000-000000000015',
        nombre: 'Marcelo Navarro',
        rut: '16.888.999-1',
        cargo: 'Operario de Motobomba',
        especialidad: 'Drenaje de Inundaciones',
        delegacionNombre: 'Sur',
        estadoOperativo: 'disponible',
        disponibleTerreno: true,
      },
      {
        id: '40000000-0000-4000-8000-000000000005',
        usuarioId: '00000000-0000-4000-8000-000000000016',
        nombre: 'Rodrigo Fuentes',
        rut: '18.444.555-8',
        cargo: 'Brigadista Auxiliar',
        especialidad: 'Despeje de Vías',
        delegacionNombre: 'Calle Calle',
        estadoOperativo: 'disponible',
        disponibleTerreno: true,
      },
    ];

    if (!busqueda) return fallbacks;
    const q = busqueda.toLowerCase();
    return fallbacks.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        (p.rut && p.rut.toLowerCase().includes(q)) ||
        (p.cargo && p.cargo.toLowerCase().includes(q)) ||
        (p.especialidad && p.especialidad.toLowerCase().includes(q))
    );
  },

  /**
   * Obtiene los recursos logísticos y vehículos disponibles en inventario para ser dotados en la cuadrilla.
   * Consulta GET /api/recursos?estado=DISPONIBLE.
   */
  async obtenerRecursosDisponibles(): Promise<RecursoInventarioDisponible[]> {
    try {
      interface RecursoRawApi {
        id: string;
        nombre: string;
        tipo: string;
        esIndividual?: boolean;
        cantidadDisponible?: number;
        cantidadTotal?: number;
        unidadMedida?: string;
        delegacionNombre?: string;
        delegacion?: { nombre?: string };
      }

      const { data, response } = await (apiClient.GET as unknown as HttpGetFn)<{ data?: RecursoRawApi[] }>(
        '/api/recursos',
        {
          params: {
            query: {
              estado: 'DISPONIBLE',
              limite: 100,
            },
          },
        }
      );

      if (response && response.ok && data?.data && Array.isArray(data.data)) {
        return (data.data as unknown as RecursoRawApi[]).map((r) => ({
          id: r.id,
          nombre: r.nombre,
          tipo: r.tipo,
          esIndividual: Boolean(r.esIndividual),
          cantidadInventario: Number(r.cantidadDisponible ?? r.cantidadTotal ?? 1),
          cantidadDisponible: Number(r.cantidadDisponible ?? 1),
          unidadMedida: r.unidadMedida ? String(r.unidadMedida) : 'Unidad',
          delegacionNombre: r.delegacionNombre ? String(r.delegacionNombre) : (r.delegacion as { nombre?: string } | undefined)?.nombre,
        }));
      }
    } catch {
      // Fallback a inventario local
    }

    return [
      {
        id: 'e1000000-0000-4000-8000-000000000001',
        nombre: 'Camioneta de Rescate 4x4',
        tipo: 'VEHICULO',
        esIndividual: true,
        cantidadInventario: 1,
        cantidadDisponible: 1,
        unidadMedida: 'Unidad',
        delegacionNombre: 'Norte',
      },
      {
        id: 'e1000000-0000-4000-8000-000000000002',
        nombre: 'Camión Tolva 10m3',
        tipo: 'VEHICULO',
        esIndividual: true,
        cantidadInventario: 1,
        cantidadDisponible: 1,
        unidadMedida: 'Unidad',
        delegacionNombre: 'Costa',
      },
      {
        id: 'e1000000-0000-4000-8000-000000000003',
        nombre: 'Motosierra Stihl MS-382',
        tipo: 'HERRAMIENTA',
        esIndividual: false,
        cantidadInventario: 10,
        cantidadDisponible: 6,
        unidadMedida: 'Unidad',
        delegacionNombre: 'Norte',
      },
      {
        id: 'e1000000-0000-4000-8000-000000000004',
        nombre: 'Motobomba de Achique 3"',
        tipo: 'MAQUINARIA',
        esIndividual: false,
        cantidadInventario: 8,
        cantidadDisponible: 4,
        unidadMedida: 'Unidad',
        delegacionNombre: 'Sur',
      },
      {
        id: 'e1000000-0000-4000-8000-000000000005',
        nombre: 'Generador Eléctrico 5kVA',
        tipo: 'EQUIPAMIENTO',
        esIndividual: true,
        cantidadInventario: 1,
        cantidadDisponible: 1,
        unidadMedida: 'Unidad',
        delegacionNombre: 'Calle Calle',
      },
    ];
  },

  /**
   * Obtiene las delegaciones municipales activas para el selector base.
   */
  async obtenerDelegaciones(): Promise<DelegacionResumen[]> {
    try {
      const catalogo = await catalogosService.getCatalogos();
      return catalogo.delegaciones.map((d) => ({
        id: d.id,
        nombre: d.nombre,
        codigo: d.codigo,
      }));
    } catch {
      return [];
    }
  },

  /**
   * Da de baja lógica a una cuadrilla operativa disuelta o retirada de servicio (HU-82).
   * Se comunica con DELETE /api/cuadrillas/{id}.
   * Bloquea la baja si la cuadrilla posee misiones activas (409 Conflict).
   */
  async desactivarCuadrilla(id: string): Promise<DesactivarCuadrillaData> {
    try {
      const authHeader = getAuthorizationHeader();
      const { data, error, response } = await apiClient.DELETE('/api/cuadrillas/{id}', {
        params: {
          path: { id },
          header: {
            authorization: authHeader,
          },
        },
      });

      // 1. Éxito (200 OK)
      if (response && response.status === 200) {
        const resp = data as DesactivarCuadrillaApiResponse;
        if (resp && resp.data) {
          const indexFallback = CUADRILLAS_FALLBACK.findIndex((c) => c.id === id);
          if (indexFallback !== -1) {
            CUADRILLAS_FALLBACK[indexFallback].activo = false;
            CUADRILLAS_FALLBACK[indexFallback].estado = 'NO_DISPONIBLE';
            CUADRILLAS_FALLBACK[indexFallback].recursos = [];
            CUADRILLAS_FALLBACK[indexFallback].trabajadores = [];
            CUADRILLAS_FALLBACK[indexFallback].totalRecursos = 0;
            CUADRILLAS_FALLBACK[indexFallback].totalTrabajadores = 0;
            CUADRILLAS_FALLBACK[indexFallback].eliminadoEn = resp.data.eliminadoEn || new Date().toISOString();
          }
          return resp.data;
        }
      }

      // 2. Sesión expirada o no autenticada (401 Unauthorized)
      if (response && response.status === 401) {
        throw new CuadrillaServiceError(
          'Sesión expirada o no autenticada.',
          401,
          'general',
          'NO_AUTENTICADO'
        );
      }

      // 3. Conflicto por misiones activas (409 Conflict)
      if (response && response.status === 409) {
        const errObj = error as { message?: string } | null;
        const msg =
          errObj?.message ||
          'No es posible desactivar la cuadrilla porque posee misiones activas en curso (PLANIFICADA, DESPACHADA o EN_CURSO).';
        throw new CuadrillaServiceError(msg, 409, 'general', 'CUADRILLA_EN_MISION');
      }

      // 4. Permisos insuficientes (403 Forbidden)
      if (response && response.status === 403) {
        throw new CuadrillaServiceError(
          'No tiene permisos suficientes para desactivar cuadrillas operativas (requiere permiso cuadrillas:eliminar o rol Administrador).',
          403,
          'general',
          'PERMISOS_INSUFICIENTES'
        );
      }

      // 5. No encontrada (404 Not Found)
      if (response && response.status === 404) {
        throw new CuadrillaServiceError(
          'La cuadrilla operativa especificada no existe o ya fue desactivada.',
          404,
          'general',
          'RECURSO_NO_ENCONTRADO'
        );
      }

      const errObj = error as { message?: string } | null;
      const mensaje =
        errObj?.message || 'Error al intentar desactivar la cuadrilla operativa. Intente nuevamente.';
      throw new CuadrillaServiceError(mensaje, response ? response.status : 500);
    } catch (err: unknown) {
      if (err instanceof CuadrillaServiceError) {
        throw err;
      }
      throw new CuadrillaServiceError(
        'Error de conexión con el servidor al intentar desactivar la cuadrilla.',
        500
      );
    }
  },
};

