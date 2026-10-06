import type { paths } from '@/types/api-generated';

/* ==========================================================================
   Tipos del Dominio: Puntos Críticos y Prevención (HU-57)
   ========================================================================== */

export type PrioridadPuntoCritico = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export interface DelegacionResumen {
  id: string;
  codigo: string;
  nombre: string;
}

export type PuntoCriticoItem = NonNullable<
  NonNullable<
    paths['/api/puntos-criticos']['get']['responses'][200]['content']['application/json']['data']
  >[number]
>;

export type ListarPuntosCriticosResponse = NonNullable<
  paths['/api/puntos-criticos']['get']['responses'][200]['content']['application/json']
>;

export interface FiltrosPuntosCriticosState {
  pagina: number;
  limite: number;
  delegacionId?: string;
  delegacionNombre?: string;
  activo?: boolean;
  prioridad?: PrioridadPuntoCritico;
  busqueda?: string;
}

/* ==========================================================================
/* ==========================================================================
   Tipos para Creación de Puntos Críticos (HU-58)
   ========================================================================== */

export const TIPOS_RIESGO_CANONICOS = [
  'Inundación',
  'Desborde de Río',
  'Remoción en Masa / Deslizamiento',
  'Caída de Árboles',
  'Corte de Ruta',
  'Colapso Estructural',
  'Incendio de Interfase',
  'Anegamiento de Calzada',
  'Otro',
] as const;

export type TipoRiesgoCanonico = (typeof TIPOS_RIESGO_CANONICOS)[number];

export type CrearPuntoCriticoInput =
  paths['/api/puntos-criticos']['post']['requestBody']['content']['application/json'];

export type PuntoCriticoDetalle =
  paths['/api/puntos-criticos']['post']['responses'][201]['content']['application/json'];

/* ==========================================================================
   Tipos para Eliminación / Desactivación Lógica (HU-56)
   ========================================================================== */

export type EliminarPuntoCriticoResponse = NonNullable<
  paths['/api/puntos-criticos/{id}']['delete']['responses'][200]['content']['application/json']
>;

export interface PuntoCriticoEliminadoSocketPayload {
  id: string;
  codigo: string;
  nombre: string;
  eliminadoPorId?: string;
  eliminadoEn?: string;
}

/* ==========================================================================
   Tipos para Edición de Puntos Críticos (HU-55)
   ========================================================================== */

export interface PuntoCriticoDetalleResponse {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  tipoRiesgo: string | null;
  prioridad: PrioridadPuntoCritico;
  activo: boolean;
  estadoTexto: string;
  latitud: number;
  longitud: number;
  delegacion: DelegacionResumen | null;
  creadoEn: string;
  actualizadoEn?: string | null;
  actualizadoPorId?: string | null;
}

export interface ActualizarPuntoCriticoDTO {
  nombre: string;
  descripcion?: string | null;
  tipoRiesgo?: string | null;
  prioridad: PrioridadPuntoCritico;
  delegacionId?: string | null;
  latitud: number;
  longitud: number;
}

export interface PuntoCriticoEditFormState {
  nombre: string;
  descripcion: string;
  tipoRiesgo: string;
  prioridad: PrioridadPuntoCritico;
  delegacionId: string;
  latitud: number | string;
  longitud: number | string;
}

export interface PuntoCriticoFormErrors {
  nombre?: string;
  descripcion?: string;
  tipoRiesgo?: string;
  prioridad?: string;
  delegacionId?: string;
  latitud?: string;
  longitud?: string;
  general?: string;
}
