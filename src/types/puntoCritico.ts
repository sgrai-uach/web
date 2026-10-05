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
   Catálogo Canónico de Tipos de Riesgo Comunal (Valdivia)
   ========================================================================== */

export const CATALOGO_TIPOS_RIESGO: string[] = [
  'Inundación y anegamiento',
  'Remoción en masa',
  'Inundación vial',
  'Desborde de cauce o humedal',
  'Anegamiento costero y marejadas',
  'Caída de árboles o ramas de gran tamaño',
  'Colapso o daño estructural',
  'Anegamiento leve',
  'Incendio de interfase forestal',
  'Otro riesgo socio-natural',
];

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

