import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '@/lib/api/client';
import {
  crearEventoAtp,
  EventoAtpServiceError,
} from '../eventosAtpService';
import type { CrearEventoAtpInput, EventoAtpDetalle } from '@/types/eventoAtp';

const payload: CrearEventoAtpInput = {
  nombre: 'Sistema Frontal Mayo 2026',
  descripcion:
    'Sistema frontal con precipitaciones intensas y vientos moderados a fuertes durante 48 horas.',
  tipoAmenaza: 'METEOROLOGICA',
  nivelAlerta: 'AMARILLA',
  fechaInicio: '2026-05-01T10:00',
  fechaTermino: '2026-05-03T18:00',
  delegacionIds: ['30000000-0000-4000-8000-000000000001'],
};

const evento: EventoAtpDetalle = {
  id: '50000000-0000-4000-8000-000000000001',
  codigo: 'ATP-2026-0001',
  nombre: payload.nombre,
  descripcion: payload.descripcion,
  tipoAmenaza: payload.tipoAmenaza,
  nivelAlerta: payload.nivelAlerta,
  fechaInicio: '2026-05-01T10:00:00.000Z',
  fechaTermino: '2026-05-03T18:00:00.000Z',
  estado: 'ACTIVO',
  delegaciones: [
    {
      id: '30000000-0000-4000-8000-000000000001',
      codigo: 'DEL_NORTE',
      nombre: 'Delegación Municipal Norte',
    },
  ],
  creadoPorId: '00000000-0000-4000-8000-000000000001',
  creadoEn: '2026-05-01T09:55:00.000Z',
  actualizadoEn: '2026-05-01T09:55:00.000Z',
};

describe('eventosAtpService (H61)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe enviar el payload a POST /api/eventos-atp y retornar el evento creado', async () => {
    vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
      data: {
        message: 'Evento ATP registrado exitosamente.',
        data: evento,
      },
      response: { status: 201 } as Response,
    } as never);

    const resultado = await crearEventoAtp(payload);

    expect(apiClient.POST).toHaveBeenCalledWith('/api/eventos-atp', {
      body: payload,
    });
    expect(resultado).toEqual(evento);
  });

  it('debe propagar el mensaje de conflicto cuando el código ya existe', async () => {
    vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
      error: {
        message: "Ya existe un Evento ATP registrado con el código 'ATP-2026-0001'.",
      },
      response: { status: 409 } as Response,
    } as never);

    await expect(crearEventoAtp(payload)).rejects.toMatchObject({
      name: 'EventoAtpServiceError',
      statusCode: 409,
      message: expect.stringContaining('Ya existe un Evento ATP'),
    });
  });

  it('debe traducir el 403 a un mensaje de permisos', async () => {
    vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
      error: { message: 'Acceso denegado.' },
      response: { status: 403 } as Response,
    } as never);

    await expect(crearEventoAtp(payload)).rejects.toThrow(
      /Se requiere perfil de Administrador o el permiso eventos_atp:crear/i
    );
  });

  it('debe encapsular errores inesperados en EventoAtpServiceError', async () => {
    vi.spyOn(apiClient, 'POST').mockRejectedValueOnce(
      new Error('Fallo de red inesperado')
    );

    await expect(crearEventoAtp(payload)).rejects.toBeInstanceOf(
      EventoAtpServiceError
    );
  });

  it('debe validar que el servicio no fabrique eventos ante fallos de conexión', async () => {
    vi.spyOn(apiClient, 'POST').mockRejectedValueOnce(
      new TypeError('Failed to fetch')
    );

    await expect(crearEventoAtp(payload)).rejects.toBeInstanceOf(
      EventoAtpServiceError
    );
  });
});
