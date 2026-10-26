import type { components, paths } from './api-generated';

export type { components, paths };

export type RolItem = components['schemas']['RolItem'];
export type PermisoAsignado = components['schemas']['PermisoAsignado'];
export type ListarRolesResponse = components['schemas']['ListarRolesResponse'];
export type RolDetalleResponse = components['schemas']['RolDetalleResponse'];
export type RecuperarContrasenaRequest = components['schemas']['RecuperarContrasenaRequest'];
export type RestablecerContrasenaRequest = components['schemas']['RestablecerContrasenaRequest'];
export type MensajeGenericoResponse = components['schemas']['MensajeGenericoResponse'];

export type PermisosPorModulo = Record<string, PermisoAsignado[]>;

export const PERMISOS_SISTEMA = {
  PERSONAL_CREAR: 'personal:crear',
  PERSONAL_LEER: 'personal:leer',
  PERSONAL_GESTIONAR: 'personal:gestionar',
  SEGURIDAD_ROLES_LEER: 'seguridad:roles:leer',
  SEGURIDAD_ROLES_GESTIONAR: 'seguridad:roles:gestionar',
  RECURSOS_LEER: 'recursos:leer',
  RECURSOS_CREAR: 'recursos:crear',
  RECURSOS_EDITAR: 'recursos:editar',
} as const;

export type PermisoCodigoSistema = (typeof PERMISOS_SISTEMA)[keyof typeof PERMISOS_SISTEMA];

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
  '/api/seguridad/login': {
    post: {
      requestBody: {
        content: {
          'application/json': LoginRequest;
        };
      };
      responses: {
        200: {
          content: {
            'application/json': LoginResponse;
          };
        };
        400: { content: { 'application/json': { error: string; detalles?: unknown[] } } };
        401: { content: { 'application/json': { error: string } } };
        403: { content: { 'application/json': { error: string } } };
        500: { content: { 'application/json': { error: string } } };
      };
    };
  };
  '/api/seguridad/usuario-activo': {
    get: {
      parameters?: {
        header?: {
          'x-user-id'?: string;
          authorization?: string;
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

export interface LoginRequest {
  identificador: string;
  password: string;
}

export interface UsuarioPerfilSesion {
  id: string;
  rut: string;
  nombre: string;
  email: string;
  rolId: string;
  rolNombre: string;
  rolCodigo: string;
  delegacionId: string | null;
  delegacionNombre?: string | null;
  permisos: string[];
}

export interface LoginResponseData {
  token: string;
  expiraEn: string;
  usuario: UsuarioPerfilSesion;
}

export interface LoginResponse {
  data: LoginResponseData;
}

export interface UsuarioActivoDetalle {
  id: string;
  rut: string;
  nombre: string;
  email: string;
  activo: boolean;
  ultimoAcceso?: string | null;
  delegacionId?: string | null;
  rol: {
    id: string;
    nombre: string;
    codigo: string;
    esAdmin?: boolean;
    permisos?: string[];
  };
  delegacion?: {
    id: string;
    nombre: string;
  } | null;
  permisos: string[];
}

