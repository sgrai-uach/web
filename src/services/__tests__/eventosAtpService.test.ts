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

  it('debe preservar el mensaje específico del servidor en un 403', async () => {
    vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
      error: { message: 'El usuario especificado se encuentra inactivo.' },
      response: { status: 403 } as Response,
    } as never);

    await expect(crearEventoAtp(payload)).rejects.toThrow(/inactivo/i);
  });

  it('debe traducir el 401 a un mensaje institucional de sesión expirada', async () => {
    vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
      error: {
        message:
          'Se requiere cabecera de autenticación Authorization: Bearer <token>.',
      },
      response: { status: 401 } as Response,
    } as never);

    await expect(crearEventoAtp(payload)).rejects.toThrow(
      /Su sesión ha expirado o no está autenticado/i
    );
  });

  it('debe conservar el detalle de errores por campo en un 400', async () => {
    vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
      error: {
        message: 'Datos de creación de Evento ATP inválidos.',
        errors: [
          {
            campo: 'fechaTermino',
            mensaje:
              'La fecha y hora de término debe ser mayor o igual a la fecha y hora de inicio',
          },
        ],
      },
      response: { status: 400 } as Response,
    } as never);

    await expect(crearEventoAtp(payload)).rejects.toMatchObject({
      name: 'EventoAtpServiceError',
      statusCode: 400,
      apiError: {
        errors: [
          {
            campo: 'fechaTermino',
            mensaje:
              'La fecha y hora de término debe ser mayor o igual a la fecha y hora de inicio',
          },
        ],
      },
    });
  });

  it('debe usar el fallback HTTP cuando la respuesta no trae cuerpo de error', async () => {
    vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
      error: undefined,
      response: { status: 502 } as Response,
    } as never);

    await expect(crearEventoAtp(payload)).rejects.toThrow(
      /Error HTTP 502: No fue posible crear el Evento ATP/
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
