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
  activo?: boolean;
  prioridad?: PrioridadPuntoCritico;
  busqueda?: string;
}

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

