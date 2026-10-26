/**
 * Tipos y DTOs para el módulo de Cuadrillas Operativas (H79).
 * Basado en el contrato OpenAPI de sgrai-api (POST /api/cuadrillas).
 */

export type EstadoCuadrilla =
  | 'DISPONIBLE'
  | 'EN_MISION'
  | 'NO_DISPONIBLE'
  | 'EN_TRANSITO'
  | 'EN_OPERACION'
  | 'DESCANSO';

export interface CrearCuadrillaDTO {
  nombre: string;
  delegacionId: string;
  usuarioDelegadoId: string;
}

export interface ItemRecursoCuadrillaInput {
  recursoId: string;
  cantidad: number;
}

export interface ItemTrabajadorCuadrillaInput {
  personalId: string;
}

export interface EditarCuadrillaDTO {
  nombre: string;
  delegacionId: string;
  usuarioDelegadoId: string;
  recursos: ItemRecursoCuadrillaInput[];
  trabajadores: ItemTrabajadorCuadrillaInput[];
}

export interface DelegacionResumen {
  id: string;
  nombre: string;
  codigo?: string;
}

export interface DelegadoResumen {
  id: string;
  nombre: string;
  email: string;
  rut?: string | null;
  telefono?: string | null;
  rolActual?: string;
}

export interface CuadrillaRecursoDetalle {
  id: string;
  recursoId: string;
  nombre: string;
  cantidadAsignada: number;
  esIndividual: boolean;
}

export interface CuadrillaTrabajadorDetalle {
  id: string;
  personalId: string;
  usuarioId: string;
  nombre: string;
  rut?: string | null;
  cargo?: string | null;
  especialidad?: string | null;
  asignadoEn: string;
}

export interface CuadrillaItem {
  id: string;
  nombre: string;
  estado: EstadoCuadrilla;
  delegacion: DelegacionResumen;
  delegado: DelegadoResumen;
  recursos: CuadrillaRecursoDetalle[];
  trabajadores: CuadrillaTrabajadorDetalle[];
  totalRecursos?: number;
  totalTrabajadores?: number;
  activo?: boolean;
  eliminadoEn?: string | null;
  eliminadoPorId?: string | null;
  creadoEn: string;
  actualizadoEn?: string | null;
  actualizadoPorId?: string | null;
  creadoPorId?: string | null;
}

export type CuadrillaDetalle = CuadrillaItem;
export type CuadrillaCreada = CuadrillaItem;

export interface DesactivarCuadrillaData {
  id: string;
  nombre: string;
  activo: boolean;
  estado: EstadoCuadrilla;
  recursosDesvinculados: number;
  trabajadoresDesvinculados: number;
  delegadoRevertido: boolean;
  eliminadoEn: string;
  eliminadoPorId: string;
}

export interface DesactivarCuadrillaApiResponse {
  message: string;
  data: DesactivarCuadrillaData;
}

export interface MetaPaginacionCuadrillas {
  total: number;
  pagina: number;
  limite: number;
  paginasTotales: number;
}

export interface ListarCuadrillasApiResponse {
  message: string;
  data: CuadrillaItem[];
  meta: MetaPaginacionCuadrillas;
}

export interface DetalleCuadrillaApiResponse {
  message: string;
  data: CuadrillaDetalle;
}

export interface CrearCuadrillaApiResponse {
  message: string;
  data: CuadrillaCreada;
}

export interface EditarCuadrillaApiResponse {
  message: string;
  data: CuadrillaDetalle;
}

export interface PersonalCandidatoDelegado {
  id: string;
  nombreCompleto: string;
  rut: string;
  email: string;
  rolNombre: string;
  rolCodigo: string;
  delegacionNombre?: string;
  estadoOperativo?: string;
}

export interface PersonalOperativoDisponible {
  id: string;
  usuarioId?: string;
  nombre: string;
  rut?: string | null;
  cargo?: string | null;
  especialidad?: string | null;
  delegacionNombre?: string | null;
  estadoOperativo?: string;
  disponibleTerreno?: boolean;
}

export interface RecursoInventarioDisponible {
  id: string;
  nombre: string;
  tipo?: string;
  esIndividual: boolean;
  cantidadInventario: number;
  cantidadDisponible?: number;
  unidadMedida?: string;
  delegacionNombre?: string;
}

export interface FiltrosCuadrillasState {
  pagina: number;
  limite: number;
  busqueda?: string;
  delegacionId?: string;
  estado?: string;
}

export interface FormErrorCuadrilla {
  nombre?: string;
  delegacionId?: string;
  usuarioDelegadoId?: string;
  recursos?: string;
  trabajadores?: string;
  general?: string;
}
