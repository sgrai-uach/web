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
  { id: '30000000-0000-4000-8000-000000000001', codigo: 'DEL_NORTE', nombre: 'Delegación Norte' },
  { id: '30000000-0000-4000-8000-000000000002', codigo: 'DEL_SUR', nombre: 'Delegación Sur' },
  { id: '30000000-0000-4000-8000-000000000003', codigo: 'DEL_COSTA', nombre: 'Delegación Costa' },
  { id: '30000000-0000-4000-8000-000000000004', codigo: 'DEL_CALLE_CALLE', nombre: 'Delegación Calle Calle' },
];

export type CategoriaKpiEstado =
  | 'reportado'
  | 'verificando'
  | 'enAtencion'
  | 'noAbordables'
  | 'resueltos';
