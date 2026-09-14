/**
 * Tipos generados desde el spec OpenAPI de sgrai-api (v0.4.0).
 *
 * Definición contractual para sgrai-web (GEMINI.md § 4).
 * Incluye endpoints de incidentes manuales y verificación de duplicados.
 */

export interface paths {
  '/api/incidentes/tipos': {
    get: {
      responses: {
        200: {
          content: {
            'application/json': {
              message: string;
              data: string[];
            };
          };
        };
      };
    };
  };
  '/api/incidentes/verificar-duplicado': {
    post: {
      parameters?: {
        header?: {
          'X-User-Id'?: string;
        };
      };
      requestBody: {
        content: {
          'application/json': components['schemas']['VerificarDuplicadoInput'];
        };
      };
      responses: {
        200: {
          content: {
            'application/json': components['schemas']['VerificarDuplicadoResponse'];
          };
        };
        400: {
          content: {
            'application/json': {
              message: string;
              errors?: Array<{ campo?: string; mensaje: string }> | string[];
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
  '/api/incidentes/manual': {
    post: {
      parameters?: {
        header?: {
          'X-User-Id'?: string;
        };
      };
      requestBody: {
        content: {
          'application/json': components['schemas']['CrearIncidenteManualInput'];
        };
      };
      responses: {
        201: {
          content: {
            'application/json': components['schemas']['CrearIncidenteManualResponse'];
          };
        };
        400: {
          content: {
            'application/json': {
              message: string;
              errors?: Array<{ campo?: string; mensaje: string }> | string[];
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
        409: {
          content: {
            'application/json': {
              message: string;
              requiereConfirmacion: boolean;
              data: {
                hayDuplicados: boolean;
                coincidencias: components['schemas']['DuplicadoItem'][];
              };
            };
          };
        };
      };
    };
  };
  '/api/incidentes/avisos': {
    post: {
      requestBody: {
        content: {
          'application/json': components['schemas']['CrearAvisoDto'];
        };
      };
      responses: {
        201: {
          content: {
            'application/json': components['schemas']['AvisoCreadoResponse'];
          };
        };
        200: {
          content: {
            'application/json': components['schemas']['AvisoCreadoResponse'];
          };
        };
        400: {
          content: {
            'application/json': {
              message: string;
              errors?: string[];
            };
          };
        };
      };
    };
  };
}

export interface components {
  schemas: {
    DuplicadoItem: {
      id: string;
      codigo: string;
      tipoAfectacion: string;
      direccion: string;
      estado: string;
      distanciaMetros: number;
      creadoEn: string;
      origen: 'aviso' | 'incidente';
    };
    VerificarDuplicadoInput: {
      tipoAfectacion: string;
      direccion: string;
      latitud?: number;
      longitud?: number;
      radioMetros?: number;
      horasVentana?: number;
    };
    VerificarDuplicadoResponse: {
      message?: string;
      data: {
        hayDuplicados: boolean;
        coincidencias: components['schemas']['DuplicadoItem'][];
      };
    };
    CrearIncidenteManualInput: {
      origenReporte: 'LLAMADA_TELEFONICA' | 'FUNCIONARIO_TERRENO';
      tipoAfectacion: string;
      descripcion: string;
      direccion: string;
      informanteNombre: string;
      informanteRut: string;
      informanteTelefono?: string;
      latitud?: number;
      longitud?: number;
      asteriskCallId?: string;
      asteriskCallerPhone?: string;
      prioridad?: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
      requiereAsistenciaSocial?: boolean;
      forzarCreacion?: boolean;
    };
    IncidenteResponse: {
      id: string;
      codigo: string;
      tipoAfectacion: string;
      direccion: string;
      estado: string;
      prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
      requiereAsistenciaSocial: boolean;
      latitud?: number;
      longitud?: number;
      creadoEn: string;
    };
    CrearIncidenteManualResponse: {
      message: string;
      data: {
        incidente: components['schemas']['IncidenteResponse'];
        aviso: {
          id: string;
          codigoSeguimiento: string;
          origenReporte: string;
        };
      };
    };
    CrearAvisoDto: {
      tipoAfectacion: string;
      direccion: string;
      descripcion?: string;
      informanteNombre: string;
      informanteRut: string;
      informanteTelefono: string;
      latitud?: number;
      longitud?: number;
    };
    AvisoCreadoResponse: {
      message: string;
      data: {
        codigoSeguimiento: string;
        esDuplicado: boolean;
        tipoAfectacion: string;
        direccion: string;
      };
    };
  };
}
