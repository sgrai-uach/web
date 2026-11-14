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
 * Valida en tiempo de ejecución si un valor pertenece al dominio oficial
 * de estados de trazabilidad de notificación de misión.
 */
export function esEstadoTrazabilidadValido(
  valor: unknown
): valor is EstadoTrazabilidadNotificacion {
  return (
    valor === 'PENDIENTE_ENVIO' ||
    valor === 'ENVIADA' ||
    valor === 'RECIBIDA' ||
    valor === 'LEIDA'
  );
}

/**
 * Resuelve la transición de estado aplicando progresión estrictamente monotónica
 * (PENDIENTE_ENVIO < ENVIADA < RECIBIDA < LEIDA).
 * Retorna `null` si el estado candidato es inválido o no supera al actual (evita retrocesos y duplicados).
 */
export function resolverSiguienteEstadoTrazabilidad(
  actual: EstadoTrazabilidadNotificacion | undefined,
  candidato: unknown
): EstadoTrazabilidadNotificacion | null {
  if (!esEstadoTrazabilidadValido(candidato)) return null;
  if (!actual || !esEstadoTrazabilidadValido(actual)) return candidato;
  return TRAZABILIDAD_CONFIG[candidato].paso > TRAZABILIDAD_CONFIG[actual].paso
    ? candidato
    : null;
}

/**
 * Selecciona entre dos estados opcionales el de mayor avance monotónico en el ciclo de vida.
 */
export function seleccionarEstadoTrazabilidadMayor(
  a?: EstadoTrazabilidadNotificacion,
  b?: EstadoTrazabilidadNotificacion
): EstadoTrazabilidadNotificacion | undefined {
  const aValido = esEstadoTrazabilidadValido(a);
  const bValido = esEstadoTrazabilidadValido(b);
  if (aValido && bValido) {
    return TRAZABILIDAD_CONFIG[b].paso > TRAZABILIDAD_CONFIG[a].paso ? b : a;
  }
  if (aValido) return a;
  if (bValido) return b;
  return undefined;
}

/**
 * Valida en tiempo de ejecución la estructura mínima requerida de un payload
 * recibido por el evento WebSocket `notificacion:trazabilidad_actualizada`.
 */
export function esPayloadTrazabilidadValido(
  payload: unknown
): payload is { misionId: string; estado: EstadoTrazabilidadNotificacion } {
  if (!payload || typeof payload !== 'object') return false;
  const p = payload as Record<string, unknown>;
  return (
    typeof p.misionId === 'string' &&
    p.misionId.trim().length > 0 &&
    esEstadoTrazabilidadValido(p.estado)
  );
}

/**
 * Extrae el estado inicial de notificación devuelto por el backend al despachar
 * una patrulla verificadora, o asume PENDIENTE_ENVIO si no viene informado.
 */
export function extraerEstadoInicialNotificacion(data: {
  notificacion?: { estado?: EstadoTrazabilidadNotificacion };
}): EstadoTrazabilidadNotificacion {
  return data.notificacion?.estado && esEstadoTrazabilidadValido(data.notificacion.estado)
    ? data.notificacion.estado
    : 'PENDIENTE_ENVIO';
}

