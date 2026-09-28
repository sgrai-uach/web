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
  id?: string;
  nombre?: string;
  descripcion?: string | null;
  activo?: boolean;
}

export interface TipoIncidenteOpcion {
  id: string;
  nombre: string;
}

const UUID_REGEX =
  /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;

export const CATALOGO_TIPOS_INCIDENTE_DEFAULT: TipoIncidenteOpcion[] = [
  { id: 'a0000000-0000-4000-8000-000000000001', nombre: 'Anegamiento' },
  { id: 'a0000000-0000-4000-8000-000000000002', nombre: 'Caída de árbol' },
  { id: 'a0000000-0000-4000-8000-000000000003', nombre: 'Corte de energía' },
  { id: 'a0000000-0000-4000-8000-000000000004', nombre: 'Deslizamiento' },
  { id: 'a0000000-0000-4000-8000-000000000005', nombre: 'Daño estructural' },
  { id: 'a0000000-0000-4000-8000-000000000006', nombre: 'Corte de agua potable' },
  { id: 'a0000000-0000-4000-8000-000000000007', nombre: 'Otro' },
];

export function normalizarTipoIncidente(t: unknown, index = 0): TipoIncidenteOpcion {
  if (typeof t === 'string') {
    const nombre = t.trim();
    const match = CATALOGO_TIPOS_INCIDENTE_DEFAULT.find(
      (c) => c.nombre.toLowerCase() === nombre.toLowerCase()
    );
    const id = match?.id || `a0000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`;
    return { id, nombre: nombre || `Tipo ${index + 1}` };
  }

  if (t && typeof t === 'object') {
    const obj = t as Record<string, unknown>;
    const rawNombre = obj.nombre || obj.tipo || obj.id || `Tipo ${index + 1}`;
    const nombre = String(rawNombre).trim();
    let id = typeof obj.id === 'string' ? obj.id.trim() : '';

    if (!id || !UUID_REGEX.test(id)) {
      const match = CATALOGO_TIPOS_INCIDENTE_DEFAULT.find(
        (c) => c.nombre.toLowerCase() === nombre.toLowerCase()
      );
      id = match?.id || `a0000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`;
    }

    return { id, nombre: nombre || `Tipo ${index + 1}` };
  }

  return (
    CATALOGO_TIPOS_INCIDENTE_DEFAULT[index] || {
      id: `a0000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
      nombre: `Tipo ${index + 1}`,
    }
  );
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
