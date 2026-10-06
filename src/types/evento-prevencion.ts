/**
 * Tipos TypeScript para el flujo de Creación de Eventos Manuales de Prevención (HU-30).
 * Conforme a la especificación OpenAPI de sgrai-api y HANDOVER_HU30_CREAR_EVENTO_PREVENCION_FRONTEND.md.
 */

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
  patrullaId: string;
  recursos?: ItemRecursoSolicitadoPrevencion[];
}

export interface RecursoAsignadoPrevencionDTO {
  recursoId: string;
  nombre: string;
  cantidadAsignada: number;
}

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
}

export interface DelegacionPrevencionDTO {
  id: string;
  codigo: string;
  nombre: string;
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
  creadoPorId: string;
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
