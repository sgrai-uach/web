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

