import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '@/lib/api/client';
import {
  crearEventoAtp,
  desvincularEntidadesEventoAtp,
  EventoAtpServiceError,
  listarEventosAtp,
  obtenerEventoAtp,
  vincularEntidadesEventoAtp,
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

describe('eventosAtpService (H60) - listado, detalle y vinculación', () => {
  const eventoAtpId = '50000000-0000-4000-8000-000000000001';
  const incidenteId = 'a0000000-0000-4000-8000-000000000001';

  const resumen = {
    id: eventoAtpId,
    codigo: 'ATP-2026-0001',
    nombre: 'Sistema Frontal Mayo 2026',
    descripcion: 'Sistema frontal con precipitaciones intensas.',
    tipoAmenaza: 'METEOROLOGICA' as const,
    nivelAlerta: 'AMARILLA' as const,
    fechaInicio: '2026-05-01T10:00:00.000Z',
    fechaTermino: '2026-05-03T18:00:00.000Z',
    estado: 'ACTIVO' as const,
    delegaciones: [],
    creadoPorId: '00000000-0000-4000-8000-000000000003',
    creadoEn: '2026-05-01T09:55:00.000Z',
    actualizadoEn: '2026-05-01T09:55:00.000Z',
    totalVinculados: 0,
  };

  const resultadoVinculacion = {
    eventoAtpId,
    accion: 'VINCULADO' as const,
    entidades: {
      incidentes: [
        {
          tipo: 'INCIDENTE' as const,
          id: incidenteId,
          codigo: 'INC-2026-0001',
          nombre: 'Inundación',
          eventoAtpIdAnterior: null,
        },
      ],
      eventosPrevencion: [],
      recuperaciones: [],
      eventosAsistenciaSocial: [],
    },
    reasignadas: [],
    noEncontradas: [],
    noDesvinculadas: [],
    vinculadoPorId: '00000000-0000-4000-8000-000000000003',
    ocurridoEn: '2026-05-01T10:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista Eventos ATP con los filtros recibidos', async () => {
    vi.spyOn(apiClient, 'GET').mockResolvedValueOnce({
      data: {
        message: 'Listado de Eventos ATP obtenido exitosamente.',
        data: [resumen],
        meta: {
          total: 1,
          page: 1,
          limit: 100,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      },
      response: { status: 200 } as Response,
    } as never);

    const resultado = await listarEventosAtp({ estado: 'ACTIVO', limit: 100 });

    expect(apiClient.GET).toHaveBeenCalledWith('/api/eventos-atp', {
      params: { query: { estado: 'ACTIVO', limit: 100 } },
    });
    expect(resultado.exito).toBe(true);
    expect(resultado.eventos).toHaveLength(1);
    expect(resultado.meta?.total).toBe(1);
  });

  it('traduce el 403 del listado a un mensaje de permisos', async () => {
    vi.spyOn(apiClient, 'GET').mockResolvedValueOnce({
      error: { message: 'Acceso denegado.' },
      response: { status: 403 } as Response,
    } as never);

    const resultado = await listarEventosAtp();

    expect(resultado.exito).toBe(false);
    expect(resultado.codigoError).toBe(403);
    expect(resultado.mensaje).toMatch(/eventos_atp:vincular/);
  });

  it('obtiene el detalle de un Evento ATP', async () => {
    vi.spyOn(apiClient, 'GET').mockResolvedValueOnce({
      data: {
        message: 'Evento ATP obtenido exitosamente.',
        data: {
          ...resumen,
          vinculos: {
            incidentes: [],
            eventosPrevencion: [],
            recuperaciones: [],
            eventosAsistenciaSocial: [],
          },
        },
      },
      response: { status: 200 } as Response,
    } as never);

    const resultado = await obtenerEventoAtp(eventoAtpId);

    expect(apiClient.GET).toHaveBeenCalledWith('/api/eventos-atp/{id}', {
      params: { path: { id: eventoAtpId } },
    });
    expect(resultado.exito).toBe(true);
    expect(resultado.datos?.vinculos.incidentes).toEqual([]);
  });

  it('vincula entidades a un Evento ATP', async () => {
    vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
      data: {
        message: 'Entidades vinculadas exitosamente.',
        data: resultadoVinculacion,
      },
      response: { status: 200 } as Response,
    } as never);

    const resultado = await vincularEntidadesEventoAtp(eventoAtpId, {
      incidenteIds: [incidenteId],
    });

    expect(apiClient.POST).toHaveBeenCalledWith(
      '/api/eventos-atp/{id}/vinculos',
      {
        params: { path: { id: eventoAtpId } },
        body: { incidenteIds: [incidenteId] },
      }
    );
    expect(resultado.accion).toBe('VINCULADO');
  });

  it('lanza EventoAtpServiceError con el 409 al no estar ACTIVO', async () => {
    vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
      error: { message: 'El Evento ATP no está ACTIVO.' },
      response: { status: 409 } as Response,
    } as never);

    await expect(
      vincularEntidadesEventoAtp(eventoAtpId, { incidenteIds: [incidenteId] })
    ).rejects.toMatchObject({
      name: 'EventoAtpServiceError',
      statusCode: 409,
      message: expect.stringContaining('no está ACTIVO'),
    });
  });

  it('desvincula entidades de un Evento ATP', async () => {
    vi.spyOn(apiClient, 'DELETE').mockResolvedValueOnce({
      data: {
        message: 'Entidades desvinculadas exitosamente.',
        data: { ...resultadoVinculacion, accion: 'DESVINCULADO' },
      },
      response: { status: 200 } as Response,
    } as never);

    const resultado = await desvincularEntidadesEventoAtp(eventoAtpId, {
      incidenteIds: [incidenteId],
    });

    expect(apiClient.DELETE).toHaveBeenCalledWith(
      '/api/eventos-atp/{id}/vinculos',
      {
        params: { path: { id: eventoAtpId } },
        body: { incidenteIds: [incidenteId] },
      }
    );
    expect(resultado.accion).toBe('DESVINCULADO');
  });

  it('encapsula fallos de red al desvincular', async () => {
    vi.spyOn(apiClient, 'DELETE').mockRejectedValueOnce(
      new TypeError('Failed to fetch')
    );

    await expect(
      desvincularEntidadesEventoAtp(eventoAtpId, {
        incidenteIds: [incidenteId],
      })
    ).rejects.toBeInstanceOf(EventoAtpServiceError);
  });
});
