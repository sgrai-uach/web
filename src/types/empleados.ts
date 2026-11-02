/**
 * Contratos de datos para el módulo de administración de empleados y usuarios.
 * Conforme a docs/architecture/architecture.md.
 */

import type { CatalogoItem, CatalogosResponse } from './catalogos';
import type { PaginationMeta } from './common';

export type { CatalogoItem, CatalogosResponse, PaginationMeta };

/**
 * Estado operativo (disponibilidad actual) del funcionario.
 * H11: reside en `usuario.estado_operativo` y siempre está presente.
 */
export type EstadoOperativo =
  | 'disponible'
  | 'en_mision'
  | 'en_patrulla'
  | 'descanso'
  | 'licencia'
  | 'inactivo';

export interface ListarEmpleadosResponse {
  data: EmpleadoUsuario[];
  meta: PaginationMeta;
}

export interface EmpleadoUsuario {
  usuario_id: string;
  rut: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string | null;
  usuario_activo: boolean;
  fecha_ingreso: string | null;
  fecha_salida: string | null;
  rol_id: string;
  rol_codigo: string;
  rol_nombre: string;
  delegacion_id: string | null;
  delegacion_codigo: string | null;
  delegacion_nombre: string | null;
  es_personal: boolean;
  personal_id: string | null;
  especialidad: string | null;
  cargo: string | null;
  /** Disponibilidad actual. Siempre presente (H11). */
  estado_operativo: EstadoOperativo;
  /** Capacidad para salir a terreno. `null` cuando el usuario no tiene ficha de terreno. */
  disponible_terreno: boolean | null;
  observaciones: string | null;
}

export interface FiltrosPersonalParams {
  q?: string;
  delegacion_id?: string;
  rol_id?: string;
  ordenar_por?: 'apellidos' | 'nombres' | 'rut' | string;
  orden?: 'asc' | 'desc';
}

export interface UpdatePersonalDTO {
  rut: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  rol_id: string;
  delegacion_id: string | null;
  activo: boolean;
  fecha_ingreso: string | null;
  fecha_salida: string | null;
  especialidad?: string | null;
  cargo?: string | null;
}

export interface EmpleadosQueryParams {
  q?: string;
  busqueda?: string;
  delegacion_id?: string;
  delegacionNombre?: string;
  rol_id?: string;
  rolNombre?: string;
  estado_operativo?: EstadoOperativo | string;
  estadoOperativo?: EstadoOperativo | string;
  cargo?: string;
  especialidad?: string;
  ordenar_por?: string;
  orden?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  incluir_inactivos?: boolean;
  /** Alias camelCase de `incluir_inactivos` (H11). */
  incluirInactivos?: boolean;
  estado?: 'todos' | 'activo' | 'inactivo' | string;
  limite?: number;
  pagina?: number;
}

export interface ActualizarEmpleadoPayload {
  rut: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  rol_id: string;
  delegacion_id: string | null;
  activo: boolean;
  fecha_ingreso: string | null;
  fecha_salida: string | null;
  especialidad?: string | null;
  cargo?: string | null;
  /** Disponibilidad actual (H11): se persiste en `usuario.estado_operativo`. */
  estado_operativo?: EstadoOperativo;
  /** Capacidad para terreno: sólo se envía para roles de terreno. */
  disponible_terreno?: boolean;
}

export interface RegistrarEmpleadoPayload {
  rut: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  password: string;
  rol_id: string;
  delegacion_id: string;
  cargo?: string | null;
  especialidad?: string | null;
  estado_operativo?: EstadoOperativo;
  disponible_terreno?: boolean;
  observaciones?: string | null;
}

