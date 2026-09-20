/**
 * Servicio cliente para la consulta del estado de seguimiento de un aviso de incidente.
 *
 * Utiliza openapi-fetch y los tipos generados de sgrai-api v0.5.0 (GEMINI.md § 4).
 */

import apiClient from './client';
import type { components } from '@/types/api-generated';

export type EstadoIncidente = components['schemas']['ConsultaSeguimientoResponse']['estado'];
export type DatosSeguimiento = components['schemas']['ConsultaSeguimientoResponse'];

export interface ResultadoConsultaSeguimiento {
  exito: boolean;
  datos?: DatosSeguimiento;
  mensaje: string;
  codigoError?: number;
}

/**
 * Consulta el estado y detalle de seguimiento de un aviso o incidente mediante su código de 8 dígitos.
 *
 * Maneja códigos inválidos (400), no encontrados (404), respuestas exitosas (200) y fallos de servidor (500).
 */
export async function consultarSeguimientoIncidente(codigo: string): Promise<ResultadoConsultaSeguimiento> {
  const codigoLimpio = codigo.trim();

  // Validación básica del formato: 8 dígitos numéricos
  if (!/^\d{8}$/.test(codigoLimpio)) {
    return {
      exito: false,
      codigoError: 400,
      mensaje: 'El código de seguimiento debe contener exactamente 8 dígitos numéricos.',
    };
  }

  try {
    const { data, error, response } = await apiClient.GET('/api/incidentes/avisos/seguimiento/{codigo}', {
      params: {
        path: { codigo: codigoLimpio },
      },
    });

    if (response?.status === 404 || (error && response?.status === 404)) {
      return {
        exito: false,
        codigoError: 404,
        mensaje: 'No encontramos ningún reporte con el código ingresado. Por favor, verifica el número entregado por el asistente.',
      };
    }

    if (error || !response?.ok) {
      return {
        exito: false,
        codigoError: response?.status || 500,
        mensaje: (error as unknown as { message?: string } | undefined)?.message || 'No fue posible consultar el estado del reporte. Por favor intenta más tarde.',
      };
    }

    if (data?.data) {
      return {
        exito: true,
        datos: data.data,
        mensaje: data.message || 'Reporte encontrado exitosamente.',
      };
    }

    return {
      exito: false,
      codigoError: 500,
      mensaje: 'Respuesta inesperada del servidor municipal.',
    };
  } catch {
    return {
      exito: false,
      codigoError: 500,
      mensaje: 'Error de conexión con el servidor. Verifica tu conexión a internet e intenta nuevamente.',
    };
  }
}
