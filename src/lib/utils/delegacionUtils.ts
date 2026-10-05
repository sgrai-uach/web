import { DELEGACIONES_MUNICIPALES } from '@/hooks/useRecursos';

export const NOMBRES_DELEGACIONES_MAP: Record<string, string> = {
  '30000000-0000-4000-8000-000000000001': 'Delegación Municipal Norte',
  '30000000-0000-4000-8000-000000000002': 'Delegación Municipal Sur',
  '30000000-0000-4000-8000-000000000003': 'Delegación Municipal Costa',
  '30000000-0000-4000-8000-000000000004': 'Delegación Municipal Calle Calle',
  DEL_NORTE: 'Delegación Municipal Norte',
  DEL_SUR: 'Delegación Municipal Sur',
  DEL_COSTA: 'Delegación Municipal Costa',
  DEL_CALLE_CALLE: 'Delegación Municipal Calle Calle',
  del_norte: 'Delegación Municipal Norte',
  del_sur: 'Delegación Municipal Sur',
  del_costa: 'Delegación Municipal Costa',
  del_calle_calle: 'Delegación Municipal Calle Calle',
  norte: 'Delegación Municipal Norte',
  sur: 'Delegación Municipal Sur',
  costa: 'Delegación Municipal Costa',
  calle_calle: 'Delegación Municipal Calle Calle',
  'calle-calle': 'Delegación Municipal Calle Calle',
};

/**
 * Retorna siempre el nombre legible de una delegación municipal.
 * Si recibe un UUID, un código interno o un identificador abreviado, lo resuelve
 * a su nombre institucional completo en lugar de exponer identificadores técnicos.
 */
export function obtenerNombreDelegacion(
  idOCodigoONombre?: string | null,
  fallback = ''
): string {
  if (!idOCodigoONombre || typeof idOCodigoONombre !== 'string') {
    return fallback;
  }

  const limpio = idOCodigoONombre.trim();
  if (!limpio) return fallback;

  // Coincidencia directa por mapa
  if (NOMBRES_DELEGACIONES_MAP[limpio]) {
    return NOMBRES_DELEGACIONES_MAP[limpio];
  }

  const minuscula = limpio.toLowerCase();
  if (NOMBRES_DELEGACIONES_MAP[minuscula]) {
    return NOMBRES_DELEGACIONES_MAP[minuscula];
  }

  // Búsqueda en catálogo oficial
  const match = DELEGACIONES_MUNICIPALES.find(
    (d) =>
      d.id.toLowerCase() === minuscula ||
      d.codigo.toLowerCase() === minuscula ||
      d.nombre.toLowerCase() === minuscula
  );

  if (match) {
    return match.nombre;
  }

  // Si es un UUID no catalogado, retornar nombre genérico institucional
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(limpio)) {
    return 'Delegación Municipal';
  }

  // Si es un identificador técnico sintético como "del-1", "del_costa", etc.
  if (/^del[-_][a-z0-9_-]+$/i.test(limpio)) {
    const sufijo = limpio.replace(/^del[-_]/i, '').toLowerCase();
    if (NOMBRES_DELEGACIONES_MAP[sufijo]) {
      return NOMBRES_DELEGACIONES_MAP[sufijo];
    }
    return 'Delegación Municipal';
  }

  return limpio;
}
