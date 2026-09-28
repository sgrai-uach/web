import apiClient from '@/lib/api/client';

export const TIPOS_AFECTACION_DEFAULT = [
  'Anegamiento',
  'Caída de árbol',
  'Corte de energía',
  'Deslizamiento',
  'Daño estructural',
  'Corte de agua potable',
  'Otro',
];

import type { components } from '@/types/api-generated';

export type CrearAvisoPayload = components['schemas']['CrearAvisoIncidenteInput'];

export interface ResultadoAviso {
  exito: boolean;
  esDuplicado: boolean;
  codigoSeguimiento?: string;
  mensaje: string;
  errores?: string[];
}

/**
 * Obtiene el catálogo dinámico de tipos de afectación desde sgrai-api.
 * Si la API falla o no responde, utiliza la lista institucional por defecto.
 */
export async function obtenerTiposAfectacion(): Promise<string[]> {
  try {
    const { data, error } = await apiClient.GET('/api/incidentes/tipos');
    if (error || !data?.data || !Array.isArray(data.data) || data.data.length === 0) {
      return TIPOS_AFECTACION_DEFAULT;
    }
    return data.data;
  } catch {
    return TIPOS_AFECTACION_DEFAULT;
  }
}

/**
 * Envía el reporte de incidente al endpoint de recepción de avisos.
 * Maneja tanto reportes nuevos (HTTP 201) como reportes duplicados (HTTP 200 - modelo SAESA).
 */
export async function enviarAvisoIncidente(payload: CrearAvisoPayload): Promise<ResultadoAviso> {
  try {
    const { data, error, response } = await apiClient.POST('/api/incidentes/avisos', {
      body: payload,
    });

    if (error || !response.ok) {
      const errObj = error as { message?: string; errors?: string[] } | undefined;
      return {
        exito: false,
        esDuplicado: false,
        mensaje: errObj?.message || 'No fue posible registrar el reporte. Por favor intenta nuevamente.',
        errores: errObj?.errors,
      };
    }

    if (data?.data) {
      return {
        exito: true,
        esDuplicado: Boolean(data.data.esDuplicado),
        codigoSeguimiento: data.data.codigoSeguimiento,
        mensaje: data.message || 'Reporte procesado exitosamente.',
      };
    }

    return {
      exito: false,
      esDuplicado: false,
      mensaje: 'Respuesta inesperada del servidor.',
    };
  } catch {
    return {
      exito: false,
      esDuplicado: false,
      mensaje: 'Error de conexión con el servidor. Verifica tu conexión e intenta nuevamente.',
    };
  }
}
