import type { CatalogosResponse } from '@/types/catalogos';
import type { ApiResponse } from '@/types/common';
import { formatApiError } from '@/lib/utils/errorUtils';

/**
 * Servicio para consultar catálogos del sistema.
 */
export async function getCatalogos(): Promise<CatalogosResponse> {
  const res = await fetch('/api/catalogos', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const body = (await res.json()) as ApiResponse<CatalogosResponse>;

  if (!res.ok) {
    throw new Error(formatApiError(body, 'Error al cargar los catálogos del sistema'));
  }

  return body.data;
}
