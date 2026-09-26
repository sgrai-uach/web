import type { components, paths } from './api-generated';

export type { components, paths };

// Esquemas principales de Avisos (Call Center)
export type AvisoItem = components['schemas']['AvisoItem'];
export type AvisoDetalleResponse = components['schemas']['AvisoDetalleResponse'];
export type AvisosPaginadosResponse = components['schemas']['AvisosPaginadosResponse'];
export type VerificarAvisoInput = components['schemas']['VerificarAvisoInput'];
export type DescartarAvisoInput = components['schemas']['DescartarAvisoInput'];
export type CrearAvisoInput = components['schemas']['CrearAvisoInput'];

export type OrigenReporte = AvisoItem['origenReporte'];
export type EstadoAviso = AvisoItem['estado'];

export interface VerificarAvisoSuccessResponse {
  mensaje: string;
  avisoId: string;
  incidenteId: string;
  folio: string;
  estado: string;
}

export interface DescartarAvisoSuccessResponse {
  mensaje: string;
  avisoId: string;
  estado: string;
  motivoDescarte: string;
}

export type SocketAvisoNuevoPayload = AvisoItem;

export interface SocketAvisoVerificadoPayload {
  avisoId: string;
  incidenteId: string;
  folio: string;
}

export interface SocketAvisoDescartadoPayload {
  avisoId: string;
  motivoDescarte: string;
}

export interface TipoIncidenteDTO {
  id: string;
  nombre: string;
  descripcion?: string | null;
  activo?: boolean;
}

export interface TipoIncidenteOpcion {
  id: string;
  nombre: string;
}

export type FiltroOrigen = 'TODOS' | 'WEB' | 'CHATBOT' | 'TELEFONO';
export type FiltroSemaforo = 'TODOS' | 'EN_TIEMPO' | 'PRECAUCION' | 'URGENTE';

export interface OperadorInfo {
  id: string;
  nombre: string;
  rol: string;
}

export interface FiltrosAvisosState {
  page: number;
  limit: number;
  estado?: 'NO_VERIFICADO' | 'VERIFICADO' | 'DESCARTADO';
}
