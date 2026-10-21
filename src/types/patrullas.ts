/**
 * Tipos TypeScript canónicos para el módulo de Patrullas Verificadoras (Centro de Mando / Operaciones).
 * Sincronizado con sgrai-api (Migración 024 y endpoint GET /api/patrullas).
 */

export type EstadoPatrullaEnum =
  | 'DISPONIBLE'
  | 'EN_VERIFICACION'
  | 'EN_PREVENCION'
  | 'EN_RECUPERACION'
  | 'EN_MISION'
  | 'NO_DISPONIBLE';

export interface PatrullaDelegacionDTO {
  id: string;
  nombre: string;
  codigo: string;
}

export interface PatrullaLiderDTO {
  id: string;
  nombre: string;
  email: string;
  telefono?: string | null;
  rut?: string | null;
}

export interface PatrullaIntegranteDTO {
  id: string;
  usuarioId?: string;
  nombre: string;
  email?: string;
  telefono?: string;
  rut?: string;
  cargo?: string;
  especialidad?: string | null;
  rolEnPatrulla?: string;
  estadoOperativo?: string;
}

export interface MisionActivaPatrullaDTO {
  id: string;
  codigo: string;
  titulo: string;
  tipoMision: string;
  estado: string;
  prioridad: string;
  incidenteId?: string | null;
  incidenteCodigo?: string | null;
  incidenteFolio?: string | null;
  incidenteTipoAfectacion?: string | null;
  incidenteDireccion?: string | null;
}

export interface PatrullaVerificadoraDTO {
  id: string;
  nombre: string;
  estado: EstadoPatrullaEnum;
  latitud?: number | null;
  longitud?: number | null;
  ultimaActualizacionUbicacion?: string | null;
  delegacion?: PatrullaDelegacionDTO | null;
  lider?: PatrullaLiderDTO | null;
  integrantes?: PatrullaIntegranteDTO[];
  misionActiva?: MisionActivaPatrullaDTO | null;
  creadoEn?: string;
  actualizadoEn?: string;
}

export interface FiltrosPatrullas {
  page?: number;
  limit?: number;
  delegacionId?: string;
  delegacion?: string; // Nombre legible institucional: 'TODAS' | 'Norte' | 'Sur' | 'Costa' | 'Calle Calle'
  estado?: EstadoPatrullaEnum | 'TODOS';
  busqueda?: string;
}

export interface PaginacionMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ListarPatrullasResponse {
  message?: string;
  data: PatrullaVerificadoraDTO[];
  meta: PaginacionMeta;
}

export interface ResultadoListarPatrullas {
  exito: boolean;
  data: PatrullaVerificadoraDTO[];
  meta: PaginacionMeta;
  mensaje: string;
  codigoError?: number;
  esForbidden?: boolean;
}

export interface PatrullaActualizadaSocketPayload {
  patrullaId: string;
  nombre: string;
  estado: EstadoPatrullaEnum;
  delegacionId?: string | null;
  usuarioLiderId?: string | null;
  misionActivaId?: string | null;
  incidenteId?: string | null;
  actualizadoEn: string;
}

export interface MisionAsignadaSocketPayload {
  misionId: string;
  codigo: string;
  tipoMision: string;
  patrullaId?: string | null;
  cuadrillaId?: string | null;
  incidenteId?: string | null;
  asignadoEn: string;
}
