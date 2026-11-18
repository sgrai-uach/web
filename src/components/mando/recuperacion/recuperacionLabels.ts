import type { EstadoRecuperacion, PrioridadRecuperacion } from '@/types/recuperacion';

export const ESTADOS_RECUPERACION_OPCIONES: Array<{
  valor: EstadoRecuperacion;
  etiqueta: string;
}> = [
  { valor: 'PLANIFICADA', etiqueta: 'Planificada' },
  { valor: 'EN_EJECUCION', etiqueta: 'En Ejecución' },
  { valor: 'COMPLETADA', etiqueta: 'Completada' },
  { valor: 'CANCELADA', etiqueta: 'Cancelada' },
];

export const PRIORIDADES_RECUPERACION_OPCIONES: Array<{
  valor: PrioridadRecuperacion;
  etiqueta: string;
}> = [
  { valor: 'CRITICA', etiqueta: 'Crítica' },
  { valor: 'ALTA', etiqueta: 'Alta' },
  { valor: 'MEDIA', etiqueta: 'Media' },
  { valor: 'BAJA', etiqueta: 'Baja' },
];

export const ETIQUETA_ESTADO_RECUPERACION: Record<EstadoRecuperacion, string> = {
  PLANIFICADA: 'Planificada',
  EN_EJECUCION: 'En Ejecución',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
};

export const ETIQUETA_PRIORIDAD_RECUPERACION: Record<PrioridadRecuperacion, string> = {
  BAJA: 'Baja',
  MEDIA: 'Media',
  ALTA: 'Alta',
  CRITICA: 'Crítica',
};

export const ETIQUETA_TIPO_RECURSO: Record<string, string> = {
  MATERIAL: 'Materiales',
  EQUIPAMIENTO: 'Equipamiento',
  VEHICULO: 'Vehículos',
  HERRAMIENTA: 'Herramientas',
  INSUMO: 'Insumos',
};

export function formatearFechaChilena(iso: string | null | undefined): string {
  if (!iso) return '—';
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '—';

  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();
  const horas = String(fecha.getHours()).padStart(2, '0');
  const minutos = String(fecha.getMinutes()).padStart(2, '0');

  return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
}

export function formatearTipoRecurso(tipo?: string | null): string {
  if (!tipo) return 'Insumos';
  return ETIQUETA_TIPO_RECURSO[tipo.toUpperCase()] || tipo;
}
