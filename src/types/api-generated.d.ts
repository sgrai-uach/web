/**
 * Tipos generados automáticamente desde el spec OpenAPI de sgrai-api.
 *
 * NO EDITAR MANUALMENTE.
 *
 * Para regenerar, ejecutar:
 *   npx openapi-typescript <URL_O_RUTA_DEL_SPEC> -o src/types/api-generated.d.ts
 *
 * Ver GEMINI.md § 4 para más detalles.
 */

export interface paths {
  '/api/recursos': {
    post: {
      parameters?: {
        header?: {
          'X-User-Id'?: string;
        };
      };
      requestBody: {
        content: {
          'application/json': {
            nombre: string;
            esIndividual?: boolean;
            cantidadInventario: number;
            cantidadMinima?: number;
            latitud: number;
            longitud: number;
            descripcion?: string;
            detalles?: {
              patente?: string;
              numeroSerie?: string;
              marca?: string;
              modelo?: string;
              anio?: number;
              kilometraje?: number;
              tipoCombustible?: 'GASOLINA' | 'DIESEL' | 'ELECTRICO' | 'HIBRIDO' | 'OTRO';
              capacidadPasajeros?: number;
              numeroChasis?: string;
              capacidadCargaKg?: number;
              alcanceMaximoMetros?: number;
              tipoGrua?: string;
              horometro?: number;
              caudalMaximoLpm?: number;
              diametroPulgadas?: number;
              potenciaHp?: number;
            };
          };
        };
      };
      responses: {
        201: {
          content: {
            'application/json': {
              message: string;
              data: {
                id: string;
                nombre: string;
                esIndividual: boolean;
                cantidadInventario: number;
                cantidadMinima: number;
                latitud: number;
                longitud: number;
                estado: 'DISPONIBLE' | 'NO_DISPONIBLE' | 'BAJO_STOCK';
                descripcion?: string | null;
                detalles?: Record<string, unknown> | null;
                creadoPor: string;
                creadoEn: string;
                actualizadoEn: string;
              };
            };
          };
        };
        400: {
          content: {
            'application/json': {
              message: string;
              errors?: Array<{ campo?: string; mensaje: string }>;
            };
          };
        };
        401: {
          content: {
            'application/json': {
              message: string;
            };
          };
        };
        403: {
          content: {
            'application/json': {
              message: string;
            };
          };
        };
      };
    };
  };
}
