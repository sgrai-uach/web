/**
 * Servicio para consulta de catálogos generales (roles, delegaciones, cargos y especialidades).
 * Conforme a docs/architecture/architecture.md.
 */

import apiClient from '@/lib/api/client';
import type { CatalogoItem, CatalogosResponse } from '@/types/empleados';

export const DELEGACIONES_FALLBACK: CatalogoItem[] = [
  {
    id: '30000000-0000-4000-8000-000000000001',
    codigo: 'DEL_NORTE',
    nombre: 'Norte',
  },
  {
    id: '30000000-0000-4000-8000-000000000002',
    codigo: 'DEL_SUR',
    nombre: 'Sur',
  },
  {
    id: '30000000-0000-4000-8000-000000000003',
    codigo: 'DEL_COSTA',
    nombre: 'Costa',
  },
  {
    id: '30000000-0000-4000-8000-000000000004',
    codigo: 'DEL_CALLE_CALLE',
    nombre: 'Calle Calle',
  },
];

export const NOMBRES_DELEGACIONES_ESTANDAR = ['Norte', 'Sur', 'Costa', 'Calle Calle'] as const;
export type NombreDelegacionEstandar = typeof NOMBRES_DELEGACIONES_ESTANDAR[number];

/**
 * Normaliza un nombre o texto libre de delegación a los 4 nombres estándar comunales.
 */
export function normalizarNombreDelegacion(texto?: string | null): string {
  if (!texto) return '';
  const n = texto.trim();
  if (/calle[\s_-]*calle/i.test(n)) return 'Calle Calle';
  if (/norte/i.test(n)) return 'Norte';
  if (/sur/i.test(n)) return 'Sur';
  if (/costa/i.test(n)) return 'Costa';
  return n;
}

let catalogosCache: CatalogosResponse | null = null;
let promiseEnCurso: Promise<CatalogosResponse> | null = null;

export const catalogosService = {
  /**
   * Obtiene los catálogos del sistema, con almacenamiento en caché en memoria.
   */
  async getCatalogos(forzarRecarga: boolean = false): Promise<CatalogosResponse> {
    if (catalogosCache && !forzarRecarga) {
      return catalogosCache;
    }

    if (promiseEnCurso && !forzarRecarga) {
      return promiseEnCurso;
    }

    promiseEnCurso = (async () => {
      try {
        const { data, error } = await apiClient.GET('/api/catalogos');

        if (error || !data?.data) {
          return {
            roles: [],
            delegaciones: DELEGACIONES_FALLBACK,
            especialidades: [],
            cargos: [],
          };
        }

        const delegacionesNormalizadas: CatalogoItem[] = (data.data.delegaciones || []).map((d) => ({
          id: d.id,
          codigo: d.codigo,
          nombre: normalizarNombreDelegacion(d.nombre),
        }));

        const respuesta: CatalogosResponse = {
          roles: data.data.roles || [],
          delegaciones: delegacionesNormalizadas.length > 0 ? delegacionesNormalizadas : DELEGACIONES_FALLBACK,
          especialidades: data.data.especialidades || [],
          cargos: data.data.cargos || [],
        };

        catalogosCache = respuesta;
        return respuesta;
      } catch {
        return {
          roles: [],
          delegaciones: DELEGACIONES_FALLBACK,
          especialidades: [],
          cargos: [],
        };
      } finally {
        promiseEnCurso = null;
      }
    })();

    return promiseEnCurso;
  },

  /**
   * Traduce un nombre legible de delegación (ej. 'Norte', 'Costa') a su UUID para llamadas API.
   */
  resolverDelegacionId(nombre: string, listaDelegaciones?: CatalogoItem[]): string | undefined {
    if (!nombre || nombre === 'TODAS' || nombre === 'TODOS') return undefined;
    const items = listaDelegaciones || catalogosCache?.delegaciones || DELEGACIONES_FALLBACK;
    const nombreNorm = normalizarNombreDelegacion(nombre).toLowerCase();
    const encontrada = items.find(
      (d) =>
        normalizarNombreDelegacion(d.nombre).toLowerCase() === nombreNorm ||
        d.codigo.toLowerCase() === nombre.toLowerCase()
    );
    return encontrada?.id;
  },

  /**
   * Traduce un UUID a su nombre legible de delegación (ej. 'Norte').
   */
  resolverDelegacionNombre(id: string, listaDelegaciones?: CatalogoItem[]): string | undefined {
    if (!id) return undefined;
    const items = listaDelegaciones || catalogosCache?.delegaciones || DELEGACIONES_FALLBACK;
    const encontrada = items.find((d) => d.id === id);
    return encontrada ? normalizarNombreDelegacion(encontrada.nombre) : undefined;
  },

  limpiarCacheParaPruebas(): void {
    catalogosCache = null;
    promiseEnCurso = null;
  },
};
