import type { paths } from '@/types/api-generated';

/* ==========================================================================
   Tipos del Dominio: Eventos de Alerta Temprana Preventiva (H61)
   ========================================================================== */

type CrearEventoAtpRequestBody = NonNullable<
  paths['/api/eventos-atp']['post']['requestBody']
>['content']['application/json'];

export type TipoAmenazaEventoAtp = CrearEventoAtpRequestBody['tipoAmenaza'];
export type NivelAlertaEventoAtp = CrearEventoAtpRequestBody['nivelAlerta'];

export type EstadoEventoAtp = NonNullable<
  paths['/api/eventos-atp']['post']['responses'][201]['content']
>['application/json']['data']['estado'];

export type CrearEventoAtpInput = CrearEventoAtpRequestBody;

export type EventoAtpDetalle = NonNullable<
  paths['/api/eventos-atp']['post']['responses'][201]['content']
>['application/json']['data'];

export type ListarEventosAtpQuery = NonNullable<
  paths['/api/eventos-atp']['get']['parameters']['query']
>;

export type ListarEventosAtpResponse = NonNullable<
  paths['/api/eventos-atp']['get']['responses'][200]['content']
>['application/json'];

export type EventoAtpResumen = ListarEventosAtpResponse['data'][number];

export type ObtenerEventoAtpResponse = NonNullable<
  paths['/api/eventos-atp/{id}']['get']['responses'][200]['content']
>['application/json'];

export type EventoAtpDetalleCompleto = ObtenerEventoAtpResponse['data'];

export type EventoAtpDetalleVinculos = ObtenerEventoAtpResponse['data']['vinculos'];

export type EntidadVinculadaEventoAtp =
  EventoAtpDetalleVinculos['incidentes'][number];

export type TipoEntidadVinculable =
  | 'INCIDENTE'
  | 'EVENTO_PREVENCION'
  | 'RECUPERACION'
  | 'EVENTO_ASISTENCIA_SOCIAL';

export type VincularEntidadesInput = NonNullable<
  NonNullable<
    paths['/api/eventos-atp/{id}/vinculos']['post']['requestBody']
  >['content']
>['application/json'];

export type VincularEntidadesInputParcial = Partial<VincularEntidadesInput>;

export type ResultadoVinculacion = NonNullable<
  paths['/api/eventos-atp/{id}/vinculos']['post']['responses'][200]['content']
>['application/json']['data'];

export type EntidadVinculadaResultado =
  ResultadoVinculacion['entidades']['incidentes'][number];

export type DelegacionEventoAtp = EventoAtpDetalle['delegaciones'][number];

export interface DelegacionEventoAtpOption {
  id: string;
  codigo?: string;
  nombre: string;
}

/* ==========================================================================
   Catálogos homologados para la interfaz
   ========================================================================== */

export const TIPOS_AMENAZA_EVENTO_ATP: ReadonlyArray<{
  value: TipoAmenazaEventoAtp;
  label: string;
}> = [
  { value: 'METEOROLOGICA', label: 'Meteorológica (lluvias, viento, tormentas)' },
  { value: 'MAREJADAS', label: 'Marejadas y oleaje anormal' },
  { value: 'REMOCION_EN_MASA', label: 'Remoción en masa / deslizamiento' },
  { value: 'INUNDACION', label: 'Inundación y desborde de cauce' },
  { value: 'INCENDIO_FORESTAL', label: 'Incendio forestal o de interfase' },
  { value: 'SISMICA', label: 'Sísmica / actividad telúrica' },
  { value: 'OTRO', label: 'Otro fenómeno no clasificado' },
];

export const NIVELES_ALERTA_EVENTO_ATP: ReadonlyArray<{
  value: NivelAlertaEventoAtp;
  label: string;
  descripcion: string;
}> = [
  {
    value: 'VERDE',
    label: 'Verde',
    descripcion: 'Alerta preventiva. Monitoreo de condiciones y coordinación inicial.',
  },
  {
    value: 'AMARILLA',
    label: 'Amarilla',
    descripcion: 'Alerta de vigilancia. Riesgo probable con posible afectación territorial.',
  },
  {
    value: 'ROJA',
    label: 'Roja',
    descripcion: 'Alerta de emergencia. Afectación inminente o en curso.',
  },
];

export const ESTADO_EVENTO_ATP_LABEL: Record<EstadoEventoAtp, string> = {
  ACTIVO: 'Activo',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado',
};

export const ESTADOS_EVENTO_ATP: ReadonlyArray<{
  value: EstadoEventoAtp;
  label: string;
}> = [
  { value: 'ACTIVO', label: 'Activo' },
  { value: 'FINALIZADO', label: 'Finalizado' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

/**
 * Normaliza un enum técnico de amenaza a su etiqueta legible.
 */
export function obtenerEtiquetaTipoAmenaza(tipo?: string | null): string {
  if (!tipo) return 'Sin clasificar';
  return (
    TIPOS_AMENAZA_EVENTO_ATP.find((item) => item.value === tipo)?.label ?? tipo
  );
}

/**
 * Normaliza un nivel de alerta a su etiqueta legible.
 */
export function obtenerEtiquetaNivelAlerta(nivel?: string | null): string {
  if (!nivel) return 'Sin definir';
  return (
    NIVELES_ALERTA_EVENTO_ATP.find((item) => item.value === nivel)?.label ?? nivel
  );
}
