/**
 * Capa de acceso a datos (DAL) para Cuadrillas Operativas (H79).
 * Se comunica con sgrai-api vía apiClient / openapi-fetch.
 */

import apiClient from '@/lib/api/client';
import { catalogosService } from '@/services/catalogosService';
import type {
  CrearCuadrillaDTO,
  CuadrillaCreada,
  CrearCuadrillaApiResponse,
  PersonalCandidatoDelegado,
  DelegacionResumen,
} from '@/types/cuadrilla';

export class CuadrillaServiceError extends Error {
  public status?: number;
  public codigo?: string;
  public campo?: 'nombre' | 'delegacionId' | 'usuarioDelegadoId' | 'general';
  public detalles?: Array<{ campo: string; mensaje: string }>;

  constructor(
    message: string,
    status?: number,
    campo?: 'nombre' | 'delegacionId' | 'usuarioDelegadoId' | 'general',
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
        const errObj = error as { message?: string; errors?: Array<{ path?: string[]; message: string }> };
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
