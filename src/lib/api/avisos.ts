/**
 * Servicios de comunicación con sgrai-api para el módulo de Avisos (Call Center).
 * 
 * Cumple con GEMINI.md § 4 usando openapi-fetch y tipos generados.
 */

import apiClient from './client';
import type {
  AvisoDetalleResponse,
  AvisosPaginadosResponse,
  DescartarAvisoInput,
  DescartarAvisoSuccessResponse,
  VerificarAvisoInput,
  VerificarAvisoSuccessResponse,
} from '@/types/api';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isConflict(): boolean {
    return this.status === 409;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isBadRequest(): boolean {
    return this.status === 400;
  }
}

export interface ListarAvisosParams {
  page?: number;
  limit?: number;
  estado?: 'NO_VERIFICADO' | 'VERIFICADO' | 'DESCARTADO';
}

/**
 * Obtiene la lista paginada de avisos para la bandeja del Call Center.
 */
export async function listarAvisos(
  params: ListarAvisosParams = {}
): Promise<AvisosPaginadosResponse> {
  const { data, error, response } = await apiClient.GET('/api/incidentes/avisos', {
    params: {
      query: {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        estado: params.estado ?? 'NO_VERIFICADO',
      },
    },
  });

  if (error || !data) {
    throw new ApiError(
      response.status,
      'Error al cargar los avisos pendientes',
      error
    );
  }

  return data;
}

/**
 * Obtiene el detalle completo de un aviso por su ID, incluyendo informante y fotos adjuntas.
 */
export async function obtenerDetalleAviso(
  id: string
): Promise<AvisoDetalleResponse> {
  const { data, error, response } = await apiClient.GET('/api/incidentes/avisos/{id}', {
    params: {
      path: { id },
    },
  });

  if (error || !data) {
    throw new ApiError(
      response.status,
      response.status === 404
        ? 'El aviso solicitado no existe o fue eliminado'
        : 'Error al obtener el detalle del aviso',
      error
    );
  }

  return data;
}

/**
 * Verifica un aviso preliminar y lo promueve a Incidente formal (visible para el Encargado).
 */
export async function verificarAviso(
  id: string,
  body: VerificarAvisoInput,
  operadorId: string
): Promise<VerificarAvisoSuccessResponse> {
  const { data, error, response } = await apiClient.POST(
    '/api/incidentes/avisos/{id}/verificar',
    {
      params: {
        path: { id },
        header: {
          'x-user-id': operadorId,
        },
      },
      body,
    }
  );

  if (error || response.status !== 201) {
    if (response.status === 409) {
      throw new ApiError(
        409,
        'Este aviso ya fue atendido o procesado por otro operador'
      );
    }
    if (response.status === 401) {
      throw new ApiError(
        401,
        'No autorizado: Se requiere una sesión válida de operador'
      );
    }

    let mensajeError = 'Error al verificar y promover el aviso a incidente';
    if (error && typeof error === 'object') {
      const errObj = error as { error?: string; detalles?: Array<{ message?: string }> };
      if (errObj.detalles && errObj.detalles.length > 0) {
        mensajeError = errObj.detalles.map((d) => d.message || '').filter(Boolean).join('. ');
      } else if (errObj.error) {
        mensajeError = errObj.error;
      }
    }

    throw new ApiError(
      response.status,
      mensajeError,
      error
    );
  }

  // La API retorna el JSON de confirmación de incidente creado
  return (data as unknown as VerificarAvisoSuccessResponse) || {
    mensaje: 'Aviso verificado exitosamente',
    avisoId: id,
    incidenteId: '',
    folio: 'INC-GENERADO',
    estado: 'Reportado',
  };
}

/**
 * Descarta un aviso preliminar con justificación obligatoria (mínimo 5 caracteres).
 */
export async function descartarAviso(
  id: string,
  body: DescartarAvisoInput,
  operadorId: string
): Promise<DescartarAvisoSuccessResponse> {
  if (!body.motivoDescarte || body.motivoDescarte.trim().length < 5) {
    throw new ApiError(
      400,
      'El motivo de descarte es obligatorio y debe tener al menos 5 caracteres'
    );
  }

  const { data, error, response } = await apiClient.POST(
    '/api/incidentes/avisos/{id}/descartar',
    {
      params: {
        path: { id },
        header: {
          'x-user-id': operadorId,
        },
      },
      body,
    }
  );

  if (error || response.status !== 200) {
    if (response.status === 409) {
      throw new ApiError(
        409,
        'Este aviso ya fue procesado o descartado por otro operador'
      );
    }
    if (response.status === 401) {
      throw new ApiError(
        401,
        'No autorizado: Se requiere una sesión válida de operador'
      );
    }
    let mensajeError = 'Error al descartar el aviso';
    if (error && typeof error === 'object') {
      const errObj = error as { error?: string; detalles?: Array<{ message?: string }> };
      if (errObj.detalles && errObj.detalles.length > 0) {
        mensajeError = errObj.detalles.map((d) => d.message || '').filter(Boolean).join('. ');
      } else if (errObj.error) {
        mensajeError = errObj.error;
      }
    }

    throw new ApiError(
      response.status,
      mensajeError,
      error
    );
  }

  return (data as unknown as DescartarAvisoSuccessResponse) || {
    mensaje: 'Aviso descartado exitosamente',
    avisoId: id,
    estado: 'DESCARTADO',
    motivoDescarte: body.motivoDescarte,
  };
}
