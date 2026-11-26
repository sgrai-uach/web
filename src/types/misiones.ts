/**
 * Contratos de datos y tipos TypeScript para el módulo de Misiones Operativas
 * (Centro de Mando / Despacho, HU-17 y HU-34).
 * Conforme a docs/architecture/architecture.md y contratos OpenAPI de sgrai-api.
 */

import type { components, paths } from './api-generated';
import type { PaginationMeta } from './common';

type ListarMisiones200 =
  paths['/api/misiones']['get']['responses'][200]['content']['application/json'];
type MisionDetalle200 =
  paths['/api/misiones/{id}']['get']['responses'][200]['content']['application/json'];
type MisionDetalleDataOpenApi = MisionDetalle200['data'];
type ReporteTerrenoOpenApi = MisionDetalleDataOpenApi['reportesTerreno'][number];

export type AdjuntoEvidencia = ReporteTerrenoOpenApi['adjuntos'][number];
export type EvaluadorTerreno = ReporteTerrenoOpenApi['evaluador'];

export interface AdjuntoCreadoPayload extends AdjuntoEvidencia {
  incidenteId: string | null;
  reporteTerrenoId: string | null;
  misionId?: string | null;
}

export function esPayloadAdjuntoCreadoValido(
  payload: unknown
): payload is AdjuntoCreadoPayload {
  if (!payload || typeof payload !== 'object') return false;
  const p = payload as Record<string, unknown>;
  if (
    typeof p.id !== 'string' ||
    p.id.trim().length === 0 ||
    typeof p.nombreArchivo !== 'string' ||
    p.nombreArchivo.trim().length === 0 ||
    typeof p.url !== 'string' ||
    p.url.trim().length === 0 ||
    typeof p.tipoMime !== 'string' ||
    p.tipoMime.trim().length === 0 ||
    typeof p.tamanoBytes !== 'number' ||
    !Number.isFinite(p.tamanoBytes) ||
    p.tamanoBytes < 0 ||
    typeof p.creadoEn !== 'string' ||
    p.creadoEn.trim().length === 0
  ) {
    return false;
  }

  const url = p.url.trim();
  const esProtocoloSeguro =
    url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://');
  if (!esProtocoloSeguro) {
    return false;
  }

  const esIdOpcionalValido = (v: unknown) =>
    v === undefined || v === null || (typeof v === 'string' && v.trim().length > 0);
  if (!esIdOpcionalValido(p.incidenteId) || !esIdOpcionalValido(p.reporteTerrenoId)) {
    return false;
  }

  return true;
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

export type TipoReporteTerreno = 'EVALUACION_PRIORIDAD' | 'VERIFICACION_CIERRE' | string;

export type DictamenAtencionTerreno = 'REQUIERE_CUADRILLA' | 'NO_ABORDABLE';

export type ReporteTerrenoDetalle = Omit<ReporteTerrenoOpenApi, 'detallesEvaluacion'> & {
  personasAfectadasPrevias?: number | null;
  personasAfectadasModificadas?: boolean;
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
