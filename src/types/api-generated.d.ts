/**
 * Tipos generados desde el spec OpenAPI de sgrai-api (v0.3.0).
 *
 * Definición contractual para sgrai-web (GEMINI.md § 4).
 */

export interface paths {
  "/api/incidentes/tipos": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": {
              message: string;
              data: string[];
            };
          };
        };
      };
    };
  };
  "/api/incidentes/avisos": {
    post: {
      requestBody: {
        content: {
          "application/json": {
            tipoAfectacion: string;
            direccion: string;
            descripcion?: string;
            informanteNombre: string;
            informanteRut: string;
            informanteTelefono: string;
            latitud?: number;
            longitud?: number;
          };
        };
      };
      responses: {
        201: {
          content: {
            "application/json": {
              message: string;
              data: {
                id?: string;
                codigoSeguimiento: string;
                esDuplicado: false;
                tipoAfectacion: string;
                direccion: string;
              };
            };
          };
        };
        200: {
          content: {
            "application/json": {
              message: string;
              data: {
                codigoSeguimiento: string;
                esDuplicado: true;
                tipoAfectacion: string;
                direccion: string;
              };
            };
          };
        };
        400: {
          content: {
            "application/json": {
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
