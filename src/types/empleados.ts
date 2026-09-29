/**
 * Contratos de datos para el módulo de administración de empleados y usuarios.
 * Conforme a docs/architecture/architecture.md.
 */

import type { CatalogoItem, CatalogosResponse } from './catalogos';

export type { CatalogoItem, CatalogosResponse };

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
  estado_operativo:
    | 'disponible'
    | 'en_mision'
    | 'en_patrulla'
    | 'descanso'
    | 'licencia'
    | 'inactivo'
    | null;
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
  delegacion_id?: string;
  rol_id?: string;
  ordenar_por?: string;
  orden?: 'asc' | 'desc';
  incluir_inactivos?: boolean;
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
}
