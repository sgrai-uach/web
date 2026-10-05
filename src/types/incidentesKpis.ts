/**
 * Tipos de datos para KPIs y Vista Rápida de Incidentes (HU-18).
 * Contrato sincronizado con sgrai-api (GET /api/incidentes/kpis).
 */

export interface IncidentesKpisContadores {
  reportado: number;
  verificando: number;
  enAtencion: number;
  noAbordables: number;
  resueltos: number;
}

export interface IncidentesKpisData {
  fecha: string;
  zonaHoraria: string;
  delegacionId: string | null;
  total: number;
  contadores: IncidentesKpisContadores;
  actualizadoEn: string;
}

export interface IncidentesKpisResponse {
  message: string;
  data: IncidentesKpisData;
}

export interface DelegacionOpcion {
  id: string;
  codigo: string;
  nombre: string;
}

/** Delegaciones municipales de Valdivia (valores base para fallback o selección rápida) */
export const DELEGACIONES_VALDIVIA_DEFAULT: DelegacionOpcion[] = [
  { id: 'del-norte', codigo: 'NORTE', nombre: 'Delegación Norte' },
  { id: 'del-sur', codigo: 'SUR', nombre: 'Delegación Sur' },
  { id: 'del-costa', codigo: 'COSTA', nombre: 'Delegación Costa' },
  { id: 'del-callecalle', codigo: 'CALLE_CALLE', nombre: 'Delegación Calle Calle' },
];

export type CategoriaKpiEstado =
  | 'reportado'
  | 'verificando'
  | 'enAtencion'
  | 'noAbordables'
  | 'resueltos';
