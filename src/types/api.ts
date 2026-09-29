/**
 * Definiciones y tipos derivados desde el spec OpenAPI generado (api-generated.d.ts).
 * 
 * Proporciona tipos convenientes para el módulo de Call Center y otros clientes del SGRAI.
 */

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

// Tipos auxiliares para respuestas de mutación
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

// Payload de eventos Socket.io en la sala 'call-center'
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

// Esquemas de Seguridad: Roles y Permisos (Panel Administrador)
export type RolItem = components['schemas']['RolItem'];
export type PermisoAsignado = components['schemas']['PermisoAsignado'];
export type ListarRolesResponse = components['schemas']['ListarRolesResponse'];
export type RolDetalleResponse = components['schemas']['RolDetalleResponse'];

export type PermisosPorModulo = Record<string, PermisoAsignado[]>;
