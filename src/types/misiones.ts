/**
 * Contratos de datos y tipos TypeScript para el módulo de Misiones Operativas
 * (Centro de Mando / Despacho, HU-17 y HU-34).
 * Conforme a docs/architecture/architecture.md y contratos OpenAPI de sgrai-api.
 */

import type { components } from './api-generated';
import type { PaginationMeta } from './common';

export interface AdjuntoEvidencia {
  id: string;
  nombreArchivo: string;
  url: string;
  tipoMime: string;
  tamanoBytes: number;
  creadoEn: string;
}

export interface AdjuntoCreadoPayload extends AdjuntoEvidencia {
  incidenteId: string | null;
  reporteTerrenoId: string | null;
}

export function esPayloadAdjuntoCreadoValido(
  payload: unknown
): payload is AdjuntoCreadoPayload {
  if (!payload || typeof payload !== 'object') return false;
  const p = payload as Record<string, unknown>;
  return (
    typeof p.id === 'string' &&
    typeof p.nombreArchivo === 'string' &&
    typeof p.url === 'string' &&
    typeof p.tipoMime === 'string' &&
    typeof p.tamanoBytes === 'number' &&
    typeof p.creadoEn === 'string'
  );
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
  requiereCuadrillaAdicional?: boolean;
  detalleApoyoRequerido?: string | null;
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

export type TipoReporteTerreno =
  | 'EVALUACION_PRIORIDAD'
  | 'VERIFICACION_CIERRE'
  | 'REPORTE_CUADRILLA'
  | string;

export type DictamenAtencionTerreno = 'REQUIERE_CUADRILLA' | 'NO_ABORDABLE';

export type EstadoTerrenoCierreCuadrilla =
  | 'CONTROLADO'
  | 'ESTABLE'
  | 'FINALIZADO'
  | 'REQUIERE_SEGUIMIENTO'
  | 'CRITICO'
  | 'INACCESIBLE'
  | string;

export interface MaterialConsumidoDetalle {
  recursoId: string;
  nombre?: string | null;
  cantidad: number;
  unidad?: string | null;
  observacion?: string | null;
}

export interface MisionEvaluacionesResumen {
  tipologiaEvaluada?: boolean;
  prioridadEvaluada?: boolean;
  verificacionCerrada?: boolean;
  reporteCuadrillaEnviado?: boolean;
  reporteCuadrillaEnviadoEn?: string | null;
  [key: string]: unknown;
}

export interface ReporteTerrenoDetalle {
  id: string;
  misionId: string;
  tipoReporte?: TipoReporteTerreno | null;
  dictamen?: DictamenAtencionTerreno | null;
  motivoNoAbordable?: string | null;
  requiereAsistenciaSocial?: boolean;
  personasAfectadasPrevias?: number | null;
  personasAfectadasModificadas?: boolean;
  versionReporte?: number;
  esRectificacion?: boolean;
  etiquetaReporte?: string;
  prioridadSugerida?: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA' | null;
  prioridadAsignada?: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA' | null;
  justificacionPrioridad?: string | null;
  detallesEvaluacion?: EvaluacionTerrenoMisionDetalle;
  evaluador: EvaluadorTerreno;
  resumenTecnico: string;
  resumenFaenas?: string | null;
  accionesRealizadas: string | null;
  requiereApoyoAdicional: boolean;
  requiereCuadrillaAdicional?: boolean;
  detalleApoyoRequerido?: string | null;
  danosEstimados: string | null;
  observaciones: string | null;
  personasAfectadas: number;
  estadoTerreno: string;
  horasHombre?: number | null;
  materialesConsumidos?: MaterialConsumidoDetalle[] | null;
  adjuntos: AdjuntoEvidencia[];
  creadoEn: string;
  actualizadoEn: string;
}

export interface MisionBitacoraHito {
  id?: string;
  hito: string;
  codigoHito?: string;
  fecha: string;
  hora: string;
  timestamp: string;
  descripcion: string;
  latitud?: number | null;
  longitud?: number | null;
  registradoPorId?: string | null;
  registradoPorNombre?: string | null;
  metadatos?: Record<string, unknown> | null;
}

export interface MisionHitoRegistradoPayload {
  misionId: string;
  codigoMision?: string;
  hitoId?: string;
  hito: string;
  descripcion: string;
  latitud?: number | null;
  longitud?: number | null;
  registradoPor?: {
    id: string;
    nombre: string;
  } | null;
  registradoEn: string;
  nuevoEstadoMision?: string;
}

export interface MisionApoyoSolicitadoPayload {
  reporteId: string;
  misionId: string;
  misionCodigo?: string | null;
  incidenteId?: string | null;
  incidenteCodigo?: string | null;
  cuadrillaId?: string | null;
  cuadrillaNombre?: string | null;
  evaluadorId?: string | null;
  evaluadorNombre?: string | null;
  requiereApoyoAdicional: boolean;
  requiereCuadrillaAdicional?: boolean;
  detalleApoyoRequerido: string | null;
  prioridadAlerta?: 'ALTA' | 'CRITICA' | string;
  solicitadoEn: string;
}

export interface MisionActualizadaHitoPayload {
  id?: string;
  hitoId?: string;
  hito: string;
  descripcion: string;
  registradoPorId?: string | null;
  registradoPorNombre?: string | null;
  registradoPor?: {
    id: string;
    nombre: string;
  } | null;
  latitud?: number | null;
  longitud?: number | null;
  creadoEn?: string;
  registradoEn?: string;
}

export interface MisionActualizadaPayload {
  misionId: string;
  codigo?: string;
  estado: string;
  tipoMision?: TipoMision | string;
  incidenteId?: string | null;
  patrullaId?: string | null;
  cuadrillaId?: string | null;
  cuadrillaNombre?: string | null;
  fechaInicio?: string | null;
  hito?: MisionActualizadaHitoPayload | null;
  actualizadoEn?: string;
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
  esIndividual?: boolean;
  unidad?: string | null;
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
  | 'EN_PROCESO'
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
  trazabilidadNotificacion?: 'PENDIENTE_ENVIO' | 'ENVIADA' | 'RECIBIDA' | 'LEIDA';
  notificacionId?: string | null;
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
  trazabilidadNotificacion?: 'PENDIENTE_ENVIO' | 'ENVIADA' | 'RECIBIDA' | 'LEIDA';
  notificacionId?: string | null;
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
  adjuntos?: AdjuntoEvidencia[];
  evaluaciones?: MisionEvaluacionesResumen | null;
}

export interface MisionDetalleResponse {
  message: string;
  data: MisionDetalleCompleto;
}
export interface RecursoAdicionalDespachoDTO {
  recursoId: string;
  cantidad: number;
}

/** DTO de entrada para despachar cuadrilla operativa a un incidente (HU-21 / HU-44) */
export interface DespacharCuadrillaDTO {
  tipoMision: 'ATENCION_CUADRILLA';
  incidenteId: string;
  cuadrillaId: string;
  titulo?: string;
  descripcion?: string;
  prioridad?: PrioridadMision;
  recursosAdicionales?: RecursoAdicionalDespachoDTO[];
}

/** Información de la patrulla verificadora liberada según regla ICS §3.2 (HU-21) */
export interface PatrullaLiberadaInfo {
  id: string;
  nombre: string;
  estado: string;
  misionPreviaId?: string;
}

/**
 * Contratos del endpoint unificado POST /api/misiones (HU-20 verificacion / HU-21 cuadrilla).
 * La API expone el cuerpo como `anyOf`, por lo que se parametrizan los tipos por esquema
 * concreto para mantener el tipado estricto en el cliente.
 */
export type CrearMisionVerificacionBody = components['schemas']['CrearMisionVerificacionInput'];
export type AsignarCuadrillaMisionBody = components['schemas']['AsignarCuadrillaMisionInput'];
export type CrearMisionRequestBody = CrearMisionVerificacionBody | AsignarCuadrillaMisionBody;
export type CrearMisionResponse201 =
  | components['schemas']['CrearMisionResponse']
  | components['schemas']['AsignarCuadrillaMisionResponse'];

export type DespacharPatrullaPayload = Omit<CrearMisionVerificacionBody, 'tipoMision'> & {
  tipoMision?: CrearMisionVerificacionBody['tipoMision'];
};
export type DespacharPatrullaResponseData = components['schemas']['CrearMisionResponse']['data'];
export type DespacharPatrullaResponse = components['schemas']['CrearMisionResponse'];
export type DespacharCuadrillaResponse = components['schemas']['AsignarCuadrillaMisionResponse'];
export type DespacharCuadrillaResponseData =
  components['schemas']['AsignarCuadrillaMisionResponse']['data'];

export interface ResultadoDespacharPatrulla {
  exito: boolean;
  data?: DespacharPatrullaResponseData;
  mensaje: string;
  codigoError?: number;
  esConflicto?: boolean;
  esForbidden?: boolean;
}
