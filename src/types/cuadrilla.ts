/**
 * Tipos y DTOs para el módulo de Cuadrillas Operativas (H79).
 * Basado en el contrato OpenAPI de sgrai-api (POST /api/cuadrillas).
 */

export interface CrearCuadrillaDTO {
  nombre: string;
  delegacionId: string;
  usuarioDelegadoId: string;
}

export interface DelegacionResumen {
  id: string;
  nombre: string;
  codigo?: string;
}

export interface DelegadoResumen {
  id: string;
  nombre: string;
  email: string;
  rut: string;
  telefono?: string | null;
  rolActual?: string;
}

export interface CuadrillaCreada {
  id: string;
  nombre: string;
  estado: 'DISPONIBLE' | 'EN_TRANSITO' | 'EN_OPERACION' | 'DESCANSO' | 'NO_DISPONIBLE';
  delegacion: DelegacionResumen;
  delegado: DelegadoResumen;
  creadoEn: string;
  creadoPorId?: string;
}

export interface CrearCuadrillaApiResponse {
  message: string;
  data: CuadrillaCreada;
}

export interface PersonalCandidatoDelegado {
  id: string;
  nombreCompleto: string;
  rut: string;
  email: string;
  rolNombre: string;
  rolCodigo?: string | null;
  delegacionNombre?: string;
  estadoOperativo?: string;
}

export interface FormErrorCuadrilla {
  nombre?: string;
  delegacionId?: string;
  usuarioDelegadoId?: string;
  general?: string;
}

declare module '@/types/api-generated' {
  interface paths {
    '/api/cuadrillas': {
      post: {
        parameters: {
          header?: {
            authorization?: string;
            'x-user-id'?: string;
          };
        };
        requestBody: {
          content: {
            'application/json': {
              nombre: string;
              delegacionId: string;
              usuarioDelegadoId: string;
            };
          };
        };
        responses: {
          201: {
            content: {
              'application/json': CrearCuadrillaApiResponse;
            };
          };
          400: { content: { 'application/json': unknown } };
          403: { content: { 'application/json': unknown } };
          409: { content: { 'application/json': unknown } };
        };
      };
    };
  }
}

