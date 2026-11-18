/**
 * Tipos TypeScript para el flujo de Creación de Eventos de Recuperación (HU-29).
 * Conforme a la especificación OpenAPI de sgrai-api y HANDOVER_HU29_CREAR_EVENTO_RECUPERACION_FRONTEND.md.
 */

export type PrioridadRecuperacion = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export type EstadoRecuperacion = 'PLANIFICADA' | 'EN_EJECUCION' | 'EN_CURSO' | 'COMPLETADA' | 'CANCELADA';

export interface ItemRecursoSolicitado {
  recursoId: string; // UUID
  cantidad: number;  // Entero > 0
}

export interface CrearEventoRecuperacionInput {
  nombre: string;
  descripcion?: string | null;
  sector: string;
  direccionTexto?: string | null;
  prioridad?: PrioridadRecuperacion;
  contactoNombre?: string | null;
  contactoTelefono?: string | null;
  latitud: number;
  longitud: number;
  delegacionId?: string | null;
  patrullaId: string;
  familiasAfectadas?: number;
  recursos: ItemRecursoSolicitado[];
}

export interface RecursoAsignadoItem {
  recursoId: string;
  nombre: string;
  cantidadAsignada: number;
  misionId?: string | null;
}

export interface EventoRecuperacionResponse {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  sector: string;
  direccionTexto: string | null;
  prioridad: PrioridadRecuperacion;
  contactoNombre: string | null;
  contactoTelefono: string | null;
  latitud: number;
  longitud: number;
  estado: EstadoRecuperacion;
  familiasAfectadas: number;
  delegacion?: {
    id: string;
    codigo: string;
    nombre: string;
  } | null;
  mision?: {
    id: string;
    codigo: string;
    titulo: string;
    estado: string;
    tipoMision: string;
  } | null;
  misiones?: MisionRecuperacionItem[];
  patrulla?: {
    id: string;
    nombre: string;
    estado: string;
  } | null;
  recursos: RecursoAsignadoItem[];
  recursosAsignados?: RecursoAsignadoItem[];
  creadoPorId?: string;
  creadoEn: string;
  actualizadoEn: string;
}

export interface CrearEventoRecuperacionApiResponse {
  message: string;
  data: EventoRecuperacionResponse;
}

export interface PatrullaVerificadoraItem {
  id: string;
  nombre: string;
  estado: 'DISPONIBLE' | 'EN_VERIFICACION' | 'EN_MISION' | 'EN_PREVENCION' | 'EN_RECUPERACION' | 'NO_DISPONIBLE';
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

import type { paths } from '@/types/api-generated';

/**
 * Modelos para Detalle y Asignación de Recursos a Evento de Recuperación (HU-32).
 */
export type DetalleEventoRecuperacionDTO =
  paths['/api/eventos-atp/recuperacion/{id}']['get']['responses'][200]['content']['application/json']['data'];

export type AsignarRecursosRecuperacionInputDTO =
  paths['/api/eventos-atp/recuperacion/{id}/asignar']['post']['requestBody']['content']['application/json'];

export type AsignarRecursosRecuperacionResponseDTO =
  paths['/api/eventos-atp/recuperacion/{id}/asignar']['post']['responses'][200]['content']['application/json'];

export type ListarEventosRecuperacionQuery = NonNullable<
  paths['/api/eventos-atp/recuperacion']['get']['parameters']['query']
>;

export interface MisionRecuperacionItem {
  id: string;
  codigo: string;
  titulo: string;
  estado: string;
  tipoMision: string;
  creadoEn: string;
  patrulla?: {
    id: string;
    nombre: string;
    estado: string;
  } | null;
  recursos?: Array<{
    recursoId: string;
    nombre: string;
    cantidadAsignada: number;
  }>;
}

export interface DetalleEventoRecuperacionResponse {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  sector: string;
  direccionTexto?: string | null;
  prioridad: PrioridadRecuperacion;
  contactoNombre?: string | null;
  contactoTelefono?: string | null;
  latitud: number;
  longitud: number;
  estado: EstadoRecuperacion;
  familiasAfectadas: number;
  delegacion?: {
    id: string;
    codigo: string;
    nombre: string;
  } | null;
  mision?: {
    id: string;
    codigo: string;
    titulo: string;
    estado: string;
    tipoMision: string;
  } | null;
  misiones: MisionRecuperacionItem[];
  patrulla?: {
    id: string;
    nombre: string;
    estado: string;
  } | null;
  recursosAsignados: RecursoAsignadoItem[];
  recursos: RecursoAsignadoItem[];
  creadoPorId?: string;
  creadoEn: string;
  actualizadoEn: string;
}

export interface GetEventoRecuperacionApiResponse {
  message?: string;
  data: DetalleEventoRecuperacionResponse;
}

export interface AsignarRecursoItemInput {
  recursoId: string;
  cantidad: number;
}

export interface AsignarRecursosRecuperacionInput {
  patrullaId: string;
  recursos: AsignarRecursoItemInput[];
}

export interface AsignarRecursosRecuperacionResponse {
  message: string;
  data: {
    mision: {
      id: string;
      codigo: string;
      titulo: string;
      estado: string;
      tipoMision: string;
    };
    patrulla: {
      id: string;
      nombre: string;
      estado: string;
    };
    recursos: Array<{
      recursoId: string;
      nombre: string;
      cantidadAsignada: number;
    }>;
    evento?: DetalleEventoRecuperacionResponse;
  };
}
