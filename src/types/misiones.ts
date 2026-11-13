/**
 * Contratos de datos y tipos TypeScript para el módulo de Misiones Operativas
 * (Centro de Mando / Despacho, HU-17 y HU-34).
 * Conforme a docs/architecture/architecture.md y contratos OpenAPI de sgrai-api.
 */

import type { paths } from './api-generated';
import type { PaginationMeta } from './common';

export interface AdjuntoEvidencia {
  id: string;
  nombreArchivo: string;
  url: string;
  tipoMime: string;
  tamanoBytes: number;
  creadoEn: string;
}

export interface EvaluadorTerreno {
  id: string;
  nombre: string;
  email: string;
  rut?: string | null;
}

export interface FamiliaAfectadaMisionDetalle {
  id?: string;
  referencia?: string;
  nucleoFamiliarTotal?: number;
  cantidadNinos?: number;
  cantidadAdultosMayores?: number;
  personasDiscapacitadas?: number;
  personasElectrodependientes?: number;
  mascotasAfectadas?: number;
  nivelCompromisoVivienda?: string;
  requiereAsistenciaSocial?: boolean;
}

export interface EvaluacionTerrenoMisionDetalle {
  familias?: FamiliaAfectadaMisionDetalle[];
  nucleoFamiliarTotal?: number;
  familiasAfectadas?: number;
  cantidadNinos?: number;
  cantidadAdultosMayores?: number;
  personasDiscapacitadas?: number;
  personasElectrodependientes?: number;
  mascotasAfectadas?: number;
  viviendasAfectadas?: number;
  nivelCompromisoVivienda?: 'SIN_DANO' | 'LEVE' | 'MODERADO' | 'GRAVE_INHABITABLE' | string;
  requiereEvacuacion?: boolean;
  requiereAsistenciaSocial?: boolean;
  requiereApoyoAdicional?: boolean;
  riesgosActivos?: {
    riesgoElectrico?: boolean;
    riesgoEstructural?: boolean;
    riesgoQuimicoSanitario?: boolean;
    aislamientoVial?: boolean;
  };
  detallesAdicionales?: string | null;
  accionesRealizadas?: string | null;
  danosEstimados?: string | null;
  puntajeTotal?: number;
  factoresGatillantes?: string[];
  [key: string]: unknown;
}

export interface ReporteTerrenoDetalle {
  id: string;
  misionId: string;
  versionReporte?: number;
  esRectificacion?: boolean;
  etiquetaReporte?: string;
  prioridadSugerida?: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA' | null;
  prioridadAsignada?: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA' | null;
  justificacionPrioridad?: string | null;
  detallesEvaluacion?: EvaluacionTerrenoMisionDetalle;
  evaluador: EvaluadorTerreno;
  resumenTecnico: string;
  accionesRealizadas: string | null;
  requiereApoyoAdicional: boolean;
  danosEstimados: string | null;
  observaciones: string | null;
  personasAfectadas: number;
  estadoTerreno: string;
  adjuntos: AdjuntoEvidencia[];
  creadoEn: string;
  actualizadoEn: string;
}

export interface MisionBitacoraHito {
  id?: string;
  hito: string;
  fecha: string;
  hora: string;
  timestamp: string;
  descripcion: string;
  metadatos?: Record<string, unknown> | null;
}

export interface IncidenteMisionResumen {
  id: string;
  codigo: string;
  codigoSeguimiento: string;
  tipoAfectacion: string;
  descripcion: string | null;
  direccion: string;
  latitud: number;
  longitud: number;
  estado: string;
  prioridad: string;
  prioridadSugerida?: string | null;
  justificacionPrioridad?: string | null;
  requiereAsistenciaSocial: boolean;
  delegacionNombre: string | null;
}

export interface PrevencionMisionResumen {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  latitud: number;
  longitud: number;
  delegacionNombre: string | null;
}

export interface RecursoAsignadoMision {
  id: string;
  nombre: string;
  tipo: string;
  cantidadAsignada: number;
}

export interface CuadrillaMisionDetalle {
  id: string;
  nombre: string;
  estado: string;
  delegacionNombre: string | null;
  delegado: {
    id: string;
    nombre: string;
    email: string;
  } | null;
  recursos: RecursoAsignadoMision[];
}

export interface PatrullaMisionDetalle {
  id: string;
  nombre: string;
  estado: string;
  delegacionNombre: string | null;
  lider: {
    id: string;
    nombre: string;
    email: string;
  } | null;
}

export type TipoMision =
  | 'VERIFICACION'
  | 'ATENCION_CUADRILLA'
  | 'PREVENCION'
  | 'RECUPERACION'
  | 'ASISTENCIA_SOCIAL';

export type EstadoMision =
  | 'PLANIFICADA'
  | 'DESPACHADA'
  | 'EN_CURSO'
  | 'COMPLETADA'
  | 'CANCELADA'
  | 'RECHAZADA';

export type PrioridadMision = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export interface MisionItem {
  id: string;
  codigo: string;
  titulo: string;
  descripcion?: string | null;
  tipoMision: TipoMision;
  estado: EstadoMision;
  prioridad: PrioridadMision;
  delegacionId?: string | null;
  delegacionNombre?: string | null;
  incidenteId?: string | null;
  incidenteCodigo?: string | null;
  cuadrillaId?: string | null;
  cuadrillaNombre?: string | null;
  patrullaId?: string | null;
  patrullaNombre?: string | null;
  justificacionRechazo?: string | null;
  fechaInicio?: string | null;
  fechaCierre?: string | null;
  creadoEn: string;
  actualizadoEn?: string;
}

export interface FiltrosMisiones {
  busqueda: string;
  estado: string; // 'TODOS' o EstadoMision
  tipoMision: string; // 'TODOS' o TipoMision
  prioridad: string; // '' o PrioridadMision
  delegacion: string; // 'TODAS', 'Norte', 'Sur', 'Costa', 'Calle Calle' (nombre legible en UI)
  page: number;
  limit: number;
}

export interface ListarMisionesResponse {
  data: MisionItem[];
  meta: PaginationMeta;
}

export interface MisionDetalleCompleto {
  id: string;
  codigo: string;
  titulo: string;
  descripcion: string | null;
  tipoMision: TipoMision;
  estado: EstadoMision;
  prioridad: PrioridadMision;
  justificacionRechazo: string | null;
  fechaInicio: string | null;
  fechaCierre: string | null;
  creadoEn: string;
  actualizadoEn: string;
  creadoPor: { id: string; nombre: string; email: string } | null;
  encargado: { id: string; nombre: string; email: string } | null;
  incidente: IncidenteMisionResumen | null;
  prevencion: PrevencionMisionResumen | null;
  cuadrilla: CuadrillaMisionDetalle | null;
  patrulla: PatrullaMisionDetalle | null;
  bitacoraTiempos: MisionBitacoraHito[];
  reportesTerreno: ReporteTerrenoDetalle[];
}

export interface MisionDetalleResponse {
  message: string;
  data: MisionDetalleCompleto;
}

export type CrearMisionRequestBody =
  paths['/api/misiones']['post']['requestBody']['content']['application/json'];
export type CrearMisionResponse201 =
  paths['/api/misiones']['post']['responses'][201]['content']['application/json'];

export type DespacharPatrullaPayload = Omit<CrearMisionRequestBody, 'tipoMision'> & {
  tipoMision?: CrearMisionRequestBody['tipoMision'];
};
export type DespacharPatrullaResponseData = CrearMisionResponse201['data'];
export type DespacharPatrullaResponse = CrearMisionResponse201;

export interface ResultadoDespacharPatrulla {
  exito: boolean;
  data?: DespacharPatrullaResponseData;
  mensaje: string;
  codigoError?: number;
  esConflicto?: boolean;
  esForbidden?: boolean;
}

