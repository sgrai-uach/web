/**
 * Capa de acceso a datos (DAL) para Cuadrillas Operativas (H79).
 * Se comunica con sgrai-api vía apiClient / openapi-fetch.
 */

import apiClient from '@/lib/api/client';
import { catalogosService } from '@/services/catalogosService';
import type {
  CrearCuadrillaDTO,
  EditarCuadrillaDTO,
  CuadrillaItem,
  CuadrillaDetalle,
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
} from '@/types/cuadrilla';

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
    },
    recursos: [
      {
        id: 'cd100000-0000-4000-8000-000000000001',
        recursoId: 'e1000000-0000-4000-8000-000000000001',
        nombre: 'Camioneta de Rescate 4x4',
        cantidadAsignada: 1,
        esIndividual: true,
      },
      {
        id: 'cd100000-0000-4000-8000-000000000002',
        recursoId: 'e1000000-0000-4000-8000-000000000003',
        nombre: 'Motosierra Stihl MS-382',
        cantidadAsignada: 2,
        esIndividual: false,
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
        asignadoEn: '2026-10-24T12:00:00.000Z',
      },
    ],
    totalRecursos: 2,
    totalTrabajadores: 2,
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
    },
    recursos: [
      {
        id: 'cd200000-0000-4000-8000-000000000001',
        recursoId: 'e1000000-0000-4000-8000-000000000002',
        nombre: 'Camión Tolva 10m3',
        cantidadAsignada: 1,
        esIndividual: true,
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
        asignadoEn: '2026-10-25T08:00:00.000Z',
      },
    ],
    totalRecursos: 1,
    totalTrabajadores: 1,
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
    },
    recursos: [
      {
        id: 'cd300000-0000-4000-8000-000000000001',
        recursoId: 'e1000000-0000-4000-8000-000000000004',
        nombre: 'Motobomba de Achique 3"',
        cantidadAsignada: 2,
        esIndividual: false,
      },
    ],
    trabajadores: [],
    totalRecursos: 1,
    totalTrabajadores: 0,
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
      const candidatos = await cuadrillasService.obtenerCandidatosDelegados();
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
    personalDisponible = await cuadrillasService.obtenerPersonalOperativoDisponible();
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
   * Obtiene la nómina de funcionarios activos de terreno aptos para ser asignados como Delegado de Cuadrilla.
   * Consulta GET /api/personal mediante apiClient y aplica filtros amplios de personal operativo.
   */
  async obtenerCandidatosDelegados(busqueda?: string): Promise<PersonalCandidatoDelegado[]> {
    try {
      const q = busqueda?.trim();

      // Consulta directa al backend mediante apiClient
      const { data, response } = await apiClient.GET('/api/personal', {
        params: {
          query: {
            q: q || undefined,
          },
        },
      });

      const personal = response.ok && data?.data ? data.data : [];

      if (personal.length > 0) {
        return personal
          .filter((emp) => {
            // Excluir únicamente si está explícitamente inactivo
            if (emp.usuario_activo === false) return false;

            const rolCodigo = (emp.rol_codigo || '').toUpperCase();
            const rolNombre = (emp.rol_nombre || '').toLowerCase();
            const cargo = (emp.cargo || '').toLowerCase();

            // Filtrar exclusivamente personal con rol o cargo de Brigadista
            const esBrigadista =
              rolCodigo === 'BRIGADISTA' ||
              rolNombre.includes('brigad') ||
              cargo.includes('brigad');

            return esBrigadista;
          })
          .map((emp) => ({
            id: emp.usuario_id,
            nombreCompleto: `${emp.nombres} ${emp.apellidos}`.trim(),
            rut: emp.rut,
            email: emp.email,
            rolNombre: formatearNombreRol(emp.rol_codigo, emp.rol_nombre),
            rolCodigo: emp.rol_codigo,
            delegacionNombre: emp.delegacion_nombre || undefined,
            estadoOperativo: emp.estado_operativo || undefined,
          }));
      }

      // Fallback a lista predefinida si el endpoint no tiene registros aún o falló
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
  async obtenerCuadrillas(filtros?: FiltrosCuadrillasState): Promise<{ cuadrillas: CuadrillaItem[]; meta: MetaPaginacionCuadrillas }> {
    const pagina = filtros?.pagina || 1;
    const limite = filtros?.limite || 10;
    const busqueda = filtros?.busqueda?.trim();
    const delegacionId = filtros?.delegacionId;
    const estado = filtros?.estado;

    try {
      const { data, response } = await apiClient.GET('/api/cuadrillas' as unknown as Parameters<typeof apiClient.GET>[0], {
        params: {
          query: {
            pagina,
            limite,
            q: busqueda || undefined,
            delegacionId: delegacionId || undefined,
            estado: estado || undefined,
          },
        } as unknown as Parameters<typeof apiClient.GET>[1],
      });

      if (response && response.ok && data) {
        const resp = data as unknown as ListarCuadrillasApiResponse;
        if (resp && Array.isArray(resp.data)) {
          return {
            cuadrillas: resp.data,
            meta: resp.meta || {
              total: resp.data.length,
              pagina,
              limite,
              paginasTotales: Math.ceil(resp.data.length / limite) || 1,
            },
          };
        }
      }
    } catch {
      // Continuar al fallback si falla la llamada
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
      const { data, response } = await apiClient.GET(
        `/api/cuadrillas/${id}` as unknown as Parameters<typeof apiClient.GET>[0]
      );

      if (response && response.ok && data) {
        const resp = data as unknown as DetalleCuadrillaApiResponse;
        if (resp && resp.data) {
          return resp.data;
        }
      }
    } catch {
      // Continuar al fallback
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
  async obtenerPersonalOperativoDisponible(busqueda?: string): Promise<PersonalOperativoDisponible[]> {
    try {
      const q = busqueda?.trim();
      const { data, response } = await apiClient.GET('/api/personal', {
        params: {
          query: {
            q: q || undefined,
            estadoOperativo: 'disponible',
            soloPersonal: 'true',
          },
        },
      });

      if (response && response.ok && data?.data && Array.isArray(data.data)) {
        return data.data
          .filter((emp) => emp.usuario_activo !== false)
          .map((emp) => ({
            id: emp.personal_id || emp.id || emp.usuario_id,
            usuarioId: emp.usuario_id,
            nombre: `${emp.nombres} ${emp.apellidos}`.trim(),
            rut: emp.rut,
            cargo: emp.cargo || 'Operario',
            especialidad: emp.especialidad || 'Labores Generales',
            delegacionNombre: emp.delegacion_nombre,
            estadoOperativo: emp.estado_operativo,
            disponibleTerreno: emp.disponible_terreno,
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
      const { data, response } = await apiClient.GET('/api/recursos', {
        params: {
          query: {
            estado: 'DISPONIBLE',
            limite: 100,
          },
        },
      });

      if (response && response.ok && data?.data && Array.isArray(data.data)) {
        return data.data.map((r) => ({
          id: r.id,
          nombre: r.nombre,
          tipo: r.tipo,
          esIndividual: Boolean(r.esIndividual),
          cantidadInventario: r.cantidadDisponible ?? r.cantidadTotal ?? 1,
          cantidadDisponible: r.cantidadDisponible ?? 1,
          unidadMedida: r.unidadMedida,
          delegacionNombre: r.delegacionNombre,
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
};

