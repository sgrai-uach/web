/**
 * Capa de acceso a datos (DAL) para Cuadrillas Operativas (H79).
 * Se comunica con sgrai-api vía apiClient / openapi-fetch.
 */

import apiClient from '@/lib/api/client';
import { catalogosService } from '@/services/catalogosService';
import { empleadosService } from '@/services/empleadosService';
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
   * Filtra por personal de terreno y roles operativos, admitiendo búsqueda por texto.
   */
  async obtenerCandidatosDelegados(busqueda?: string): Promise<PersonalCandidatoDelegado[]> {
    try {
      const response = await empleadosService.getEmpleados({
        q: busqueda?.trim() || undefined,
        incluir_inactivos: false,
        limite: 100,
      });

      const personal = response.data || [];

      // Filtro de personal activo apto para terreno
      return personal
        .filter((emp) => {
          if (!emp.usuario_activo) return false;

          const rol = (emp.rol_codigo || '').toUpperCase();
          const cargo = (emp.cargo || '').toLowerCase();

          // Admitir operarios, brigadistas, delegados de cuadrilla y cargos afines de terreno
          const esRolTerreno = [
            'DELEGADO_CUADRILLA',
            'OPERARIO',
            'BRIGADISTA',
            'CONDUCTOR',
            'PATRULLERO',
            'PERSONAL_TERRENO',
          ].includes(rol);

          const esCargoTerreno =
            cargo.includes('oper') ||
            cargo.includes('brigad') ||
            cargo.includes('cuadrill') ||
            cargo.includes('chofer') ||
            cargo.includes('conductor') ||
            cargo.includes('mantenimiento') ||
            cargo.includes('terreno');

          const tieneDisponibleTerreno = emp.disponible_terreno === true;

          // Si coincide con alguna condición de terreno, o si no hay filtros estrictos
          return esRolTerreno || esCargoTerreno || tieneDisponibleTerreno || emp.es_personal;
        })
        .map((emp) => ({
          id: emp.usuario_id,
          nombreCompleto: `${emp.nombres} ${emp.apellidos}`.trim(),
          rut: emp.rut,
          email: emp.email,
          rolNombre: emp.rol_nombre || emp.rol_codigo || 'Personal Operativo',
          rolCodigo: emp.rol_codigo,
          delegacionNombre: emp.delegacion_nombre || undefined,
          estadoOperativo: emp.estado_operativo || undefined,
        }));
    } catch {
      return [];
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
