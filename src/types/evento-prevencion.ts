/**
 * Tipos TypeScript para el flujo de Eventos Manuales de Prevención (HU-30, HU-76, HU-77 y HU-33).
 * Conforme a la especificación OpenAPI de sgrai-api.
 */

import type { paths } from '@/types/api-generated';

export type PrioridadEventoPrevencion = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export type EstadoEventoPrevencion = 'PLANIFICADA' | 'EN_CURSO' | 'COMPLETADA' | 'CANCELADA';

export interface ItemRecursoSolicitadoPrevencion {
  recursoId: string; // UUID
  cantidad: number;  // Entero >= 1
}

export interface CrearEventoPrevencionPayload {
  nombre: string;
  descripcion: string;
  sector?: string | null;
  direccionTexto?: string | null;
  prioridad?: PrioridadEventoPrevencion;
  delegacionId: string;
  puntoCriticoId?: string | null;
  latitud: number;
  longitud: number;
  patrullaId?: string | null;
  recursos?: ItemRecursoSolicitadoPrevencion[];
}

export interface RecursoAsignadoPrevencionDTO {
  id?: string;
  recursoId: string;
  nombre: string;
  esIndividual?: boolean;
  cantidadAsignada: number;
  misionId?: string | null;
  creadoEn?: string;
}

/**
 * Contratos OpenAPI derivados para Detalle y Asignación de Recursos a Evento de Prevención (HU-33).
 */
export type DetalleEventoPrevencionDTO =
  paths['/api/eventos-atp/prevencion/{id}']['get']['responses'][200]['content']['application/json']['data'];

export type AsignarRecursosPrevencionInputDTO =
  NonNullable<paths['/api/eventos-atp/prevencion/{id}/recursos']['post']['requestBody']>['content']['application/json'];

export type AsignarRecursosPrevencionResponseDTO =
  paths['/api/eventos-atp/prevencion/{id}/recursos']['post']['responses'][200]['content']['application/json'];

export interface RecursoAsignadoPrevencionDetalle {
  id?: string;
  recursoId: string;
  nombre: string;
  esIndividual: boolean;
  cantidadAsignada: number;
  misionId?: string | null;
  creadoEn?: string;
}

export interface MisionPrevencionHistorialItem {
  id: string;
  codigo: string;
  titulo: string;
  estado: string;
  tipoMision: string;
  fechaInicio?: string | null;
  fechaCierre?: string | null;
  creadoEn: string;
  patrulla?: {
    id: string;
    nombre: string;
    estado: string;
  } | null;
  cuadrilla?: CuadrillaPrevencionResumenDTO | null;
  recursos?: RecursoAsignadoPrevencionDetalle[];
}

export interface DetalleEventoPrevencionResponse {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  sector: string | null;
  direccionTexto: string | null;
  prioridad: PrioridadEventoPrevencion;
  estado: EstadoEventoPrevencion;
  latitud: number;
  longitud: number;
  ubicacionGeoJson?: { type: string; coordinates: number[] } | null;
  puntoCritico: PuntoCriticoPrevencionDetalleDTO | null;
  delegacion: DelegacionPrevencionDTO | null;
  mision?: MisionPrevencionDetalleDTO | null;
  misiones: MisionPrevencionHistorialItem[];
  patrulla?: {
    id: string;
    nombre: string;
    estado: string;
  } | null;
  cuadrilla?: CuadrillaPrevencionResumenDTO | null;
  recursosAsignados: RecursoAsignadoPrevencionDetalle[];
  recursos: RecursoAsignadoPrevencionDetalle[];
  fechaEstimadaFin?: string | null;
  creadoPorId?: string;
  actualizadoPorId?: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export type AsignarRecursosPrevencionInput = AsignarRecursosPrevencionInputDTO;

export type AsignarRecursosPrevencionResponse = AsignarRecursosPrevencionResponseDTO;

export interface MisionPrevencionResumenDTO {
  id: string;
  codigo: string;
  titulo: string;
  estado: string;
  tipoMision: string;
}

export interface PatrullaPrevencionResumenDTO {
  id: string;
  nombre: string;
  estado: 'EN_PREVENCION';
}

export interface PuntoCriticoPrevencionDTO {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  tipoRiesgo?: string | null;
  prioridad?: string | null;
  latitud?: number;
  longitud?: number;
  ubicacionGeoJson?: { type: string; coordinates: number[] } | null;
}

export interface PuntoCriticoPrevencionDetalleDTO {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  tipoRiesgo?: string | null;
  prioridad?: string | null;
  latitud: number;
  longitud: number;
  ubicacionGeoJson?: { type: string; coordinates: number[] } | null;
}

export interface DelegacionPrevencionDTO {
  id: string;
  codigo: string;
  nombre: string;
}

export interface MisionPrevencionDetalleDTO {
  id: string;
  codigo: string;
  titulo: string;
  estado: string;
  tipoMision: string;
  fechaInicio: string | null;
  fechaCierre: string | null;
}

export interface CuadrillaPrevencionResumenDTO {
  id: string;
  nombre: string;
  estado: string;
}

export interface EventoPrevencionListItemDTO {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  sector: string | null;
  direccionTexto: string | null;
  prioridad: PrioridadEventoPrevencion;
  estado: EstadoEventoPrevencion;
  latitud: number;
  longitud: number;
  ubicacionGeoJson?: { type: string; coordinates: number[] } | null;
  delegacion: DelegacionPrevencionDTO | null;
  puntoCritico: PuntoCriticoPrevencionDetalleDTO | null;
  patrulla: { id: string; nombre: string; estado: string } | null;
  cuadrilla: CuadrillaPrevencionResumenDTO | null;
  mision: MisionPrevencionDetalleDTO | null;
  recursos?: RecursoAsignadoPrevencionDTO[];
  fechaEstimadaFin?: string | null;
  creadoPorId?: string;
  actualizadoPorId?: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface EditarEventoPrevencionPayload {
  nombre?: string;
  descripcion?: string;
  prioridad?: PrioridadEventoPrevencion;
  fechaEstimadaFin?: string | null;
  recursos?: ItemRecursoSolicitadoPrevencion[];
}

export interface EditarEventoPrevencionResponse {
  message: string;
  data: EventoPrevencionDTO;
}

export interface PaginacionMetaH34 {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ListarEventosPrevencionParams {
  page?: number;
  limit?: number;
  delegacionId?: string;
  estado?: EstadoEventoPrevencion;
  busqueda?: string;
}

export interface ListarEventosPrevencionResponse {
  message: string;
  data: EventoPrevencionListItemDTO[];
  meta: PaginacionMetaH34;
}

export interface FiltrosEventosPrevencionState {
  busqueda: string;
  delegacionId?: string;
  estado?: EstadoEventoPrevencion;
  pagina: number;
  limite: number;
}

export interface EventoPrevencionDTO {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  sector: string | null;
  direccionTexto: string | null;
  prioridad: PrioridadEventoPrevencion;
  estado: EstadoEventoPrevencion;
  latitud: number;
  longitud: number;
  puntoCritico: PuntoCriticoPrevencionDTO | null;
  delegacion: DelegacionPrevencionDTO | null;
  mision: MisionPrevencionResumenDTO;
  patrulla: PatrullaPrevencionResumenDTO;
  recursos: RecursoAsignadoPrevencionDTO[];
  fechaEstimadaFin?: string | null;
  creadoPorId: string;
  actualizadoPorId?: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface CrearEventoPrevencionResponse {
  message: string;
  data: EventoPrevencionDTO;
}

export interface PatrullaVerificadoraItem {
  id: string;
  nombre: string;
  estado: 'DISPONIBLE' | 'EN_VERIFICACION' | 'EN_PREVENCION' | 'EN_RECUPERACION' | 'NO_DISPONIBLE';
  delegacionId?: string | null;
  delegacionNombre?: string | null;
}

/** Patrullas sembradas oficiales del sistema (sgrai-api) */
export const PATRULLAS_OFICIALES_SEED: PatrullaVerificadoraItem[] = [
  {
    id: 'f1000000-0000-4000-8000-000000000002',
    nombre: 'Patrulla Rápida Centro-Sur',
    estado: 'DISPONIBLE',
    delegacionId: '30000000-0000-4000-8000-000000000002',
    delegacionNombre: 'Delegación Sur',
  },
  {
    id: 'f1000000-0000-4000-8000-000000000001',
    nombre: 'Patrulla Rápida Costa-1',
    estado: 'EN_VERIFICACION',
    delegacionId: '30000000-0000-4000-8000-000000000003',
    delegacionNombre: 'Delegación Costa',
  },
];

export const PRIORIDADES_PREVENCION: { valor: PrioridadEventoPrevencion; label: string; color: string }[] = [
  { valor: 'BAJA', label: 'Baja', color: 'var(--color-text-muted, #5F676E)' },
  { valor: 'MEDIA', label: 'Media', color: 'var(--color-primary-teal, #1B6F7D)' },
  { valor: 'ALTA', label: 'Alta', color: 'var(--color-warning, #E65100)' },
  { valor: 'CRITICA', label: 'Crítica', color: 'var(--color-danger, #D32F2F)' },
];

export const ESTADOS_PREVENCION: { valor: EstadoEventoPrevencion; label: string; color: string; bg: string }[] = [
  { valor: 'PLANIFICADA', label: 'Planificada', color: '#B45309', bg: '#FEF3C7' },
  { valor: 'EN_CURSO', label: 'En Ejecución', color: '#1B6F7D', bg: '#E0F2F1' },
  { valor: 'COMPLETADA', label: 'Completada', color: '#2E7D32', bg: '#E8F5E9' },
  { valor: 'CANCELADA', label: 'Cancelada', color: '#D32F2F', bg: '#FFEBEE' },
];
