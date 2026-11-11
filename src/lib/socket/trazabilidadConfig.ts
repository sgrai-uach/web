import type { EstadoTrazabilidadNotificacion } from '@/services/incidentesService';

export interface TrazabilidadVisualSpec {
  estado: EstadoTrazabilidadNotificacion;
  /** Texto oficial HU-35 para badge de detalle de misión */
  texto: string;
  /** Texto compacto orientado a lectura rápida en tarjetas Kanban y tablas */
  textoCorto: string;
  /** Etiqueta binaria/corta para escanear al instante si está leída o no */
  etiquetaLectura: string;
  /** Encabezado descriptivo en el panel de monitoreo del drawer */
  tituloLectura: string;
  /** Indica si el operador en terreno ya abrió/leyó la orden */
  leida: boolean;
  /** Nivel de avance en la máquina de estados (0..3) */
  paso: 0 | 1 | 2 | 3;
  bg: string;
  color: string;
}

export const TRAZABILIDAD_CONFIG: Record<
  EstadoTrazabilidadNotificacion,
  TrazabilidadVisualSpec
> = {
  PENDIENTE_ENVIO: {
    estado: 'PENDIENTE_ENVIO',
    texto: 'Patrulla sin señal / offline',
    textoCorto: 'Sin señal / offline',
    etiquetaLectura: 'NO LEÍDA',
    tituloLectura: 'ORDEN NO LEÍDA POR PATRULLA',
    leida: false,
    paso: 0,
    bg: '#ECEFF3',
    color: '#3B3F45',
  },
  ENVIADA: {
    estado: 'ENVIADA',
    texto: 'Alerta emitida al móvil',
    textoCorto: 'Alerta emitida al móvil',
    etiquetaLectura: 'NO LEÍDA',
    tituloLectura: 'ORDEN NO LEÍDA POR PATRULLA',
    leida: false,
    paso: 1,
    bg: '#FFF3E0',
    color: '#E65100',
  },
  RECIBIDA: {
    estado: 'RECIBIDA',
    texto: 'Recibida en móvil de terreno',
    textoCorto: 'Recibida · pendiente lectura',
    etiquetaLectura: 'RECIBIDA (SIN LEER)',
    tituloLectura: 'RECIBIDA EN MÓVIL · SIN LECTURA',
    leida: false,
    paso: 2,
    bg: '#E8F5E9',
    color: '#2E7D32',
  },
  LEIDA: {
    estado: 'LEIDA',
    texto: 'Leída por operador en terreno',
    textoCorto: 'Leída por operador en terreno',
    etiquetaLectura: 'LEÍDA',
    tituloLectura: 'LECTURA CONFIRMADA EN TERRENO',
    leida: true,
    paso: 3,
    bg: '#E0F2F1',
    color: '#14505A',
  },
};

/**
 * Extrae el estado inicial de notificación devuelto por el backend al despachar
 * una patrulla verificadora, o asume PENDIENTE_ENVIO si no viene informado.
 */
export function extraerEstadoInicialNotificacion(data: {
  notificacion?: { estado?: EstadoTrazabilidadNotificacion };
}): EstadoTrazabilidadNotificacion {
  return data.notificacion?.estado || 'PENDIENTE_ENVIO';
}

