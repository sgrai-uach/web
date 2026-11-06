/**
 * Capa DAL (Data Access Layer) para el módulo de Patrullas Verificadoras.
 * Consume los endpoints de sgrai-api (GET /api/patrullas y GET /api/patrullas/{id}).
 * Cumple con las directrices de docs/architecture/architecture.md y GEMINI.md.
 */

import { catalogosService } from '@/services/catalogosService';
import { getAuthCookie } from '@/lib/utils/cookieUtils';
import type {
  FiltrosPatrullas,
  PatrullaVerificadoraDTO,
  ResultadoListarPatrullas,
  PaginacionMeta,
  CrearPatrullaInputDTO,
  ResultadoCrearPatrulla,
} from '@/types/patrullas';

export const DEFAULT_ENCARGADO_ID = '00000000-0000-4000-8000-000000000003';

const META_POR_DEFECTO: PaginacionMeta = {
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
};

export const patrullasService = {
  /**
   * Consulta el listado paginado y filtrado de patrullas verificadoras.
   */
  async listar(
    filtros: FiltrosPatrullas = {},
    userId: string = DEFAULT_ENCARGADO_ID
  ): Promise<ResultadoListarPatrullas> {
    const searchParams = new URLSearchParams();
    const page = filtros.page || 1;
    const limit = filtros.limit || 20;

    searchParams.set('page', String(page));
    searchParams.set('limit', String(limit));

    if (filtros.busqueda?.trim()) {
      searchParams.set('busqueda', filtros.busqueda.trim());
    }

    if (filtros.estado && filtros.estado !== 'TODOS') {
      searchParams.set('estado', filtros.estado);
    }

    // Resolver delegacionId: si viene directo o si viene por nombre canónico
    if (filtros.delegacionId) {
      searchParams.set('delegacionId', filtros.delegacionId);
    } else if (filtros.delegacion && filtros.delegacion !== 'TODAS' && filtros.delegacion !== 'TODOS') {
      const resolvedId = catalogosService.resolverDelegacionId(filtros.delegacion);
      if (resolvedId) {
        searchParams.set('delegacionId', resolvedId);
      }
    }

    try {
      const token = typeof window !== 'undefined' ? getAuthCookie() : undefined;
      const headers: Record<string, string> = {
        'x-user-id': userId,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/patrullas?${searchParams.toString()}`, {
        headers,
      });

      if (res.status === 403) {
        return {
          exito: false,
          esForbidden: true,
          codigoError: 403,
          data: [],
          meta: { ...META_POR_DEFECTO, page, limit },
          mensaje: 'No cuenta con el permiso requerido (misiones:leer) para visualizar las patrullas verificadoras.',
        };
      }

      if (!res.ok) {
        let detalleError = `Error HTTP ${res.status}`;
        try {
          const errorJson = await res.json();
          if (errorJson.message) detalleError = errorJson.message;
        } catch {
          // ignore
        }

        return {
          exito: false,
          codigoError: res.status,
          data: [],
          meta: { ...META_POR_DEFECTO, page, limit },
          mensaje: detalleError,
        };
      }

      const json = await res.json();
      const rawData: PatrullaVerificadoraDTO[] = Array.isArray(json.data) ? json.data : [];
      const meta: PaginacionMeta = json.meta || {
        total: rawData.length,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(rawData.length / limit)),
        hasNext: false,
        hasPrev: false,
      };

      return {
        exito: true,
        data: rawData,
        meta,
        mensaje: json.message || 'Listado de patrullas obtenido exitosamente.',
      };
    } catch {
      return {
        exito: false,
        codigoError: 500,
        data: [],
        meta: { ...META_POR_DEFECTO, page, limit },
        mensaje: 'Error de conexión con el servidor municipal al consultar patrullas verificadoras.',
      };
    }
  },

  /**
   * Consulta el detalle unitario de una patrulla verificadora.
   */
  async obtenerPorId(
    id: string,
    userId: string = DEFAULT_ENCARGADO_ID
  ): Promise<{ exito: boolean; data?: PatrullaVerificadoraDTO; mensaje: string; codigoError?: number }> {
    const idLimpio = id?.trim();
    if (!idLimpio) {
      return { exito: false, codigoError: 400, mensaje: 'Identificador de patrulla no válido.' };
    }

    try {
      const token = typeof window !== 'undefined' ? getAuthCookie() : undefined;
      const headers: Record<string, string> = {
        'x-user-id': userId,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/patrullas/${encodeURIComponent(idLimpio)}`, {
        headers,
      });

      if (!res.ok) {
        return {
          exito: false,
          codigoError: res.status,
          mensaje: `Error ${res.status} al obtener patrulla verificadora.`,
        };
      }

      const json = await res.json();
      return {
        exito: true,
        data: json.data,
        mensaje: json.message || 'Patrulla verificadora obtenida exitosamente.',
      };
    } catch {
      return {
        exito: false,
        codigoError: 500,
        mensaje: 'Error de conexión con el servidor municipal.',
      };
    }
  },

  /**
   * Registra y da de alta una nueva patrulla verificadora (POST /api/patrullas).
   * Requiere permiso 'recursos:crear'.
   */
  async crear(
    payload: CrearPatrullaInputDTO,
    userId: string = DEFAULT_ENCARGADO_ID
  ): Promise<ResultadoCrearPatrulla> {
    try {
      const token = typeof window !== 'undefined' ? getAuthCookie() : undefined;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/patrullas', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (res.status === 201) {
        const json = await res.json();
        return {
          exito: true,
          data: json.data,
          mensaje: json.message || 'Patrulla verificadora registrada exitosamente.',
        };
      }

      if (res.status === 409) {
        let mensaje = 'Ya existe una patrulla registrada con ese código identificador.';
        try {
          const json = await res.json();
          if (json.message) mensaje = json.message;
        } catch {
          // ignore
        }
        return {
          exito: false,
          esConflicto: true,
          codigoError: 409,
          mensaje,
        };
      }

      if (res.status === 403) {
        return {
          exito: false,
          esForbidden: true,
          codigoError: 403,
          mensaje:
            'No cuenta con el permiso requerido (recursos:crear) para dar de alta patrullas verificadoras.',
        };
      }

      if (res.status === 400) {
        let mensaje = 'Los datos ingresados para la patrulla verificadora no son válidos.';
        let erroresValidacion: Array<{ campo: string; mensaje: string }> | undefined;
        try {
          const json = await res.json();
          if (json.message) mensaje = json.message;
          if (Array.isArray(json.errors)) erroresValidacion = json.errors;
        } catch {
          // ignore
        }
        return {
          exito: false,
          codigoError: 400,
          mensaje,
          erroresValidacion,
        };
      }

      let detalleError = `Error HTTP ${res.status} al registrar patrulla verificadora.`;
      try {
        const json = await res.json();
        if (json.message) detalleError = json.message;
      } catch {
        // ignore
      }

      return {
        exito: false,
        codigoError: res.status,
        mensaje: detalleError,
      };
    } catch {
      return {
        exito: false,
        codigoError: 500,
        mensaje: 'Error de conexión con el servidor municipal al registrar la patrulla.',
      };
    }
  },
};

export const listarPatrullas = patrullasService.listar;
export const obtenerPatrullaPorId = patrullasService.obtenerPorId;
export const crearPatrulla = patrullasService.crear;

