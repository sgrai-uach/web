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
