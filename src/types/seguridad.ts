import type { components, paths } from './api-generated';

export type { components, paths };

export type RolItem = components['schemas']['RolItem'];
export type PermisoAsignado = components['schemas']['PermisoAsignado'];
export type ListarRolesResponse = components['schemas']['ListarRolesResponse'];
export type RolDetalleResponse = components['schemas']['RolDetalleResponse'];

export type PermisosPorModulo = Record<string, PermisoAsignado[]>;

export type FiltroTipoRol = 'TODOS' | 'SISTEMA' | 'PERSONALIZADO';
export type FiltroEstadoPermisos = 'TODOS' | 'CON_PERMISOS' | 'SIN_PERMISOS';

export interface FiltrosRolesState {
  busqueda: string;
  filtroTipo: FiltroTipoRol;
  filtroEstado: FiltroEstadoPermisos;
}

export interface UsuarioSimulado {
  id: string;
  nombre: string;
  email: string;
  rut: string;
  rol: string;
  esAdmin: boolean;
}

export interface MetricasRoles {
  totalPerfiles: number;
  perfilesSistema: number;
  perfilesConPermisos: number;
  perfilesSinPermisos: number;
  totalPermisosUnicos: number;
}

export interface PermisoCatalogoItem {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  modulo: string;
}

export type PermisosCatalogoPorModulo = Record<string, PermisoCatalogoItem[]>;

export interface ActualizarPermisosRolPayload {
  permisoIds: string[];
}

export interface ActualizarPermisosRolResponse {
  message: string;
  data?: RolItem;
}

export type SeguridadExtendedPaths = paths & {
  '/api/seguridad/permisos': {
    get: {
      parameters: {
        header: {
          'x-user-id': string;
        };
      };
      responses: {
        200: {
          content: {
            'application/json': {
              data: PermisoCatalogoItem[];
              total?: number;
            };
          };
        };
        401: { content: { 'application/json': { error: string } } };
        403: { content: { 'application/json': { error: string } } };
      };
    };
  };
  '/api/seguridad/roles/{id}/permisos': {
    put: {
      parameters: {
        path: { id: string };
        header: {
          'x-user-id': string;
        };
      };
      requestBody: {
        content: {
          'application/json': {
            permisoIds: string[];
          };
        };
      };
      responses: {
        200: {
          content: {
            'application/json': {
              message: string;
              data?: components['schemas']['RolItem'];
            };
          };
        };
        400: { content: { 'application/json': { error: string } } };
        401: { content: { 'application/json': { error: string } } };
        403: { content: { 'application/json': { error: string } } };
        404: { content: { 'application/json': { error: string } } };
      };
    };
  };
  '/api/seguridad/usuario-activo': {
    get: {
      parameters: {
        header: {
          'x-user-id': string;
        };
      };
      responses: {
        200: {
          content: {
            'application/json': {
              data: UsuarioActivoDetalle;
            };
          };
        };
        401: { content: { 'application/json': { error: string } } };
        403: { content: { 'application/json': { error: string } } };
      };
    };
  };
};

export interface UsuarioActivoDetalle {
  id: string;
  rut: string;
  nombre: string;
  email: string;
  activo: boolean;
  delegacionId?: string | null;
  rol: {
    id: string;
    nombre: string;
    codigo: string;
    esAdmin: boolean;
  };
  permisos: string[];
}

