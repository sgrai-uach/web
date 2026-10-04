/**
 * Servicio para consulta de Misiones Operativas (Centro de Mando / Despacho).
 * Conforme a docs/architecture/architecture.md.
 */

import { catalogosService } from '@/services/catalogosService';
import { DEFAULT_ENCARGADO_ID } from '@/services/incidentesService';
import type { FiltrosMisiones, MisionItem } from '@/types/misiones';

export interface ResultadoListarMisiones {
  exito: boolean;
  data: MisionItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  mensaje: string;
}

export const misionesService = {
  /**
   * Consulta el listado paginado y filtrado de misiones operativas.
   */
  async listar(
    filtros: FiltrosMisiones,
    userId: string = DEFAULT_ENCARGADO_ID
  ): Promise<ResultadoListarMisiones> {
    const searchParams = new URLSearchParams();
    searchParams.set('page', String(filtros.page || 1));
    searchParams.set('limit', String(filtros.limit || 10));

    if (filtros.busqueda?.trim()) {
      searchParams.set('busqueda', filtros.busqueda.trim());
    }

    if (filtros.estado && filtros.estado !== 'TODOS') {
      searchParams.set('estado', filtros.estado);
    }

    if (filtros.tipoMision && filtros.tipoMision !== 'TODOS') {
      searchParams.set('tipoMision', filtros.tipoMision);
    }

    if (filtros.prioridad) {
      searchParams.set('prioridad', filtros.prioridad);
    }

    // Traducción transparente del nombre legible de delegación a UUID
    if (filtros.delegacion && filtros.delegacion !== 'TODAS') {
      const delegacionId = catalogosService.resolverDelegacionId(filtros.delegacion);
      if (delegacionId) {
        searchParams.set('delegacionId', delegacionId);
      }
    }

    try {
      const headers: Record<string, string> = {
        'x-user-id': userId,
      };

      const res = await fetch(`/api/misiones?${searchParams.toString()}`, {
        headers,
      });

      if (!res.ok) {
        return {
          exito: false,
          data: [],
          meta: {
            total: 0,
            page: filtros.page,
            limit: filtros.limit,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
          mensaje: `Error ${res.status} al consultar misiones.`,
        };
      }

      const json = await res.json();
      const meta = json.meta || {
        total: (json.data || []).length,
        page: filtros.page,
        limit: filtros.limit,
        totalPages: Math.ceil(((json.data || []).length || 1) / filtros.limit),
        hasNext: false,
        hasPrev: false,
      };

      return {
        exito: true,
        data: json.data || [],
        meta: {
          total: meta.total ?? 0,
          page: meta.page ?? filtros.page,
          limit: meta.limit ?? filtros.limit,
          totalPages: meta.totalPages ?? 1,
          hasNext: Boolean(meta.hasNext),
          hasPrev: Boolean(meta.hasPrev),
        },
        mensaje: 'Misiones obtenidas exitosamente.',
      };
    } catch {
      return {
        exito: false,
        data: [],
        meta: {
          total: 0,
          page: filtros.page,
          limit: filtros.limit,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
        mensaje: 'Error de conexión con el servidor municipal.',
      };
    }
  },
};
