/**
 * Tipos TypeScript para el Detalle de Misión (HU-17).
 * Conforme al contrato OpenAPI de sgrai-api y HANDOVER_HU17_DETALLE_MISION_FRONTEND.md.
 */

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

export interface ReporteTerrenoDetalle {
  id: string;
  misionId: string;
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
  hito: string;
  fecha: string;
  hora: string;
  timestamp: string;
  descripcion: string;
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
