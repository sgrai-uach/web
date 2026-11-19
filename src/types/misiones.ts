/**
 * Contratos de datos y tipos TypeScript para el módulo de Misiones Operativas
 * (Centro de Mando / Despacho, HU-17 y HU-34).
 * Conforme a docs/architecture/architecture.md y contratos OpenAPI de sgrai-api.
 */

import type { paths } from './api-generated';
import type { PaginationMeta } from './common';

type ListarMisiones200 =
  paths['/api/misiones']['get']['responses'][200]['content']['application/json'];
type MisionDetalle200 =
  paths['/api/misiones/{id}']['get']['responses'][200]['content']['application/json'];
type MisionDetalleDataOpenApi = MisionDetalle200['data'];
type ReporteTerrenoOpenApi = MisionDetalleDataOpenApi['reportesTerreno'][number];

export type AdjuntoEvidencia = ReporteTerrenoOpenApi['adjuntos'][number];
export type EvaluadorTerreno = ReporteTerrenoOpenApi['evaluador'];

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

export type ReporteTerrenoDetalle = Omit<ReporteTerrenoOpenApi, 'detallesEvaluacion'> & {
  detallesEvaluacion?: EvaluacionTerrenoMisionDetalle;
};

export type MisionBitacoraHito = MisionDetalleDataOpenApi['bitacoraTiempos'][number] & {
  metadatos?: Record<string, unknown> | null;
};

export type IncidenteMisionResumen = NonNullable<MisionDetalleDataOpenApi['incidente']> & {
  prioridadSugerida?: string | null;
  justificacionPrioridad?: string | null;
};

export type PrevencionMisionResumen = NonNullable<MisionDetalleDataOpenApi['prevencion']>;
export type CuadrillaMisionDetalle = NonNullable<MisionDetalleDataOpenApi['cuadrilla']>;
export type RecursoAsignadoMision = CuadrillaMisionDetalle['recursos'][number];
export type PatrullaMisionDetalle = NonNullable<MisionDetalleDataOpenApi['patrulla']>;

export type MisionItem = Omit<
  ListarMisiones200['data'][number],
  'descripcion' | 'actualizadoEn'
> & {
  descripcion?: string | null;
  actualizadoEn?: string;
};

export type TipoMision = MisionItem['tipoMision'];
export type EstadoMision = MisionItem['estado'];
export type PrioridadMision = MisionItem['prioridad'];

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

export type MisionDetalleCompleto = Omit<
  MisionDetalleDataOpenApi,
  'incidente' | 'bitacoraTiempos' | 'reportesTerreno'
> & {
  incidente: IncidenteMisionResumen | null;
  bitacoraTiempos: MisionBitacoraHito[];
  reportesTerreno: ReporteTerrenoDetalle[];
};

export type MisionDetalleResponse = Omit<MisionDetalle200, 'data'> & {
  data: MisionDetalleCompleto;
};
/** DTO de entrada para despachar cuadrilla operativa a un incidente (HU-21) */
export interface DespacharCuadrillaDTO {
  tipoMision: 'ATENCION_CUADRILLA';
  incidenteId: string;
  cuadrillaId: string;
  titulo?: string;
  descripcion?: string;
  prioridad?: PrioridadMision;
}

/** Información de la patrulla verificadora liberada según regla ICS §3.2 (HU-21) */
export interface PatrullaLiberadaInfo {
  id: string;
  nombre: string;
  estado: string;
  misionPreviaId?: string;
}

/** Respuesta de la API al despachar cuadrilla y liberar patrulla (HU-21) */
export interface DespacharCuadrillaResponse {
  message: string;
  data: {
    mision: {
      id: string;
      codigo: string;
      tipoMision: TipoMision | string;
      estado: EstadoMision | string;
      fechaInicio: string | null;
    };
    cuadrilla: {
      id: string;
      nombre: string;
      estado: string;
    };
    incidente: {
      id: string;
      codigo: string;
      estado: string;
      prioridad: string;
    };
    patrullaLiberada: PatrullaLiberadaInfo | null;
    hitoCuadrilla?: {
      hito: string;
      descripcion: string;
    };
    hitoPatrulla?: {
      hito: string;
      descripcion: string;
    };
  };
}

export type CrearMisionRequestBody =
  paths['/api/misiones']['post']['requestBody']['content']['application/json'];
export type CrearMisionResponse201 =
  paths['/api/misiones']['post']['responses'][201]['content']['application/json'];

type CrearMisionPatrullaBody = Extract<CrearMisionRequestBody, { patrullaId: string }>;

export type DespacharPatrullaPayload = Omit<CrearMisionPatrullaBody, 'tipoMision'> & {
  tipoMision?: CrearMisionPatrullaBody['tipoMision'];
};
export type DespacharPatrullaResponseData = Extract<
  CrearMisionResponse201['data'],
  { patrulla: unknown }
>;
export type DespacharPatrullaResponse = CrearMisionResponse201;

export interface ResultadoDespacharPatrulla {
  exito: boolean;
  data?: DespacharPatrullaResponseData;
  mensaje: string;
  codigoError?: number;
  esConflicto?: boolean;
  esForbidden?: boolean;
}
