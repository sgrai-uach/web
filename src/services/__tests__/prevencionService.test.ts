import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  crearEventoPrevencion,
  PrevencionServiceError,
} from '../prevencionService';
import apiClient from '@/lib/api/client';
import { DEFAULT_ENCARGADO_ID } from '@/services/incidentesService';
import type {
  CrearEventoPrevencionPayload,
  EventoPrevencionDTO,
} from '@/types/evento-prevencion';

vi.mock('@/lib/api/client', () => ({
  default: {
    POST: vi.fn(),
  },
}));

vi.mock('@/lib/utils/cookieUtils', () => ({
  getAuthCookie: vi.fn(() => 'mock-jwt-token'),
}));

describe('prevencionService (HU-30)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPayload: CrearEventoPrevencionPayload = {
    nombre: 'Limpieza y monitoreo de sumideros en Angachilla',
    descripcion: 'Monitoreo preventivo del caudal e inspección de alcantarillas por frente de mal tiempo.',
    sector: 'Humedal Angachilla',
    direccionTexto: 'Av. Simpson con Los Robles',
    prioridad: 'ALTA',
    delegacionId: '30000000-0000-4000-8000-000000000001',
    puntoCriticoId: '40000000-0000-4000-8000-000000000001',
    latitud: -39.8456,
    longitud: -73.2389,
    patrullaId: 'f1000000-0000-4000-8000-000000000002',
    recursos: [
      {
        recursoId: '00000000-0000-4000-8000-000000000001',
        cantidad: 5,
      },
    ],
  };

  const mockResponseDTO: EventoPrevencionDTO = {
    id: '91d99083-b0a4-4a23-a269-1df58dd60dbb',
    codigo: 'PREV-2026-0001',
    nombre: 'Limpieza y monitoreo de sumideros en Angachilla',
    descripcion: 'Monitoreo preventivo del caudal e inspección de alcantarillas por frente de mal tiempo.',
    sector: 'Humedal Angachilla',
    direccionTexto: 'Av. Simpson con Los Robles',
    prioridad: 'ALTA',
    estado: 'PLANIFICADA',
    latitud: -39.8456,
    longitud: -73.2389,
    puntoCritico: {
      id: '40000000-0000-4000-8000-000000000001',
      codigo: 'PC-ANG-01',
      nombre: 'Sector Humedal Angachilla - Pasaje Los Robles',
    },
    delegacion: {
      id: '30000000-0000-4000-8000-000000000001',
      codigo: 'DEL_NORTE',
      nombre: 'Delegación Municipal Norte',
    },
    mision: {
      id: '17dbae23-d6c7-45c1-8850-d37cfd9ee7f6',
      codigo: 'MIS-2026-0006',
      titulo: 'Limpieza y monitoreo de sumideros en Angachilla',
      estado: 'DESPACHADA',
      tipoMision: 'PREVENCION',
    },
    patrulla: {
      id: 'f1000000-0000-4000-8000-000000000002',
      nombre: 'Patrulla Rápida Centro-Sur',
      estado: 'EN_PREVENCION',
    },
    recursos: [
      {
        recursoId: '00000000-0000-4000-8000-000000000001',
        nombre: 'Sacos de Arena 25kg',
        cantidadAsignada: 5,
      },
    ],
    creadoPorId: DEFAULT_ENCARGADO_ID,
    creadoEn: '2026-10-05T06:45:50.867Z',
    actualizadoEn: '2026-10-05T06:45:50.867Z',
  };

  it('debe registrar un evento de prevención exitosamente en 201 Created', async () => {
    vi.mocked(apiClient.POST).mockResolvedValueOnce({
      data: {
        message: 'Evento de prevención creado y patrulla despachada exitosamente.',
        data: mockResponseDTO,
      } as unknown as never,
      error: undefined,
      response: { ok: true, status: 201 } as Response,
    });

    const resultado = await crearEventoPrevencion(mockPayload, DEFAULT_ENCARGADO_ID);

    expect(apiClient.POST).toHaveBeenCalledWith('/api/eventos-atp/prevencion', {
      body: mockPayload,
      headers: {
        'x-user-id': DEFAULT_ENCARGADO_ID,
        Authorization: 'Bearer mock-jwt-token',
      },
    });
    expect(resultado).toEqual(mockResponseDTO);
    expect(resultado.codigo).toBe('PREV-2026-0001');
    expect(resultado.patrulla.estado).toBe('EN_PREVENCION');
  });

  it('debe arrojar PrevencionServiceError con tipoConflicto PATRULLA_OCUPADA en 409 Conflict', async () => {
    vi.mocked(apiClient.POST).mockResolvedValueOnce({
      data: undefined,
      error: {
        message: 'La patrulla "Patrulla Rápida Costa-1" no está disponible para asignación (estado actual: EN_VERIFICACION).',
      } as unknown as never,
      response: { ok: false, status: 409 } as Response,
    });

    try {
      await crearEventoPrevencion(mockPayload, DEFAULT_ENCARGADO_ID);
      expect.fail('Debería haber lanzado PrevencionServiceError');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(PrevencionServiceError);
      if (err instanceof PrevencionServiceError) {
        expect(err.statusCode).toBe(409);
        expect(err.tipoConflicto).toBe('PATRULLA_OCUPADA');
        expect(err.message).toContain('no está disponible para asignación');
      }
    }
  });

  it('debe arrojar PrevencionServiceError con tipoConflicto STOCK_INSUFICIENTE en 409 Conflict', async () => {
    vi.mocked(apiClient.POST).mockResolvedValueOnce({
      data: undefined,
      error: {
        message: 'Stock insuficiente para el recurso "Sacos de Arena 25kg". Solicitado: 50, Disponible: 10.',
      } as unknown as never,
      response: { ok: false, status: 409 } as Response,
    });

    try {
      await crearEventoPrevencion(mockPayload, DEFAULT_ENCARGADO_ID);
      expect.fail('Debería haber lanzado PrevencionServiceError');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(PrevencionServiceError);
      if (err instanceof PrevencionServiceError) {
        expect(err.statusCode).toBe(409);
        expect(err.tipoConflicto).toBe('STOCK_INSUFICIENTE');
        expect(err.message).toContain('Stock insuficiente');
      }
    }
  });

  it('debe mapear errores de validación de campos cuando la API retorna 400 Bad Request', async () => {
    vi.mocked(apiClient.POST).mockResolvedValueOnce({
      data: undefined,
      error: {
        message: 'Datos de entrada inválidos para el evento de prevención.',
        errors: [
          { campo: 'nombre', mensaje: 'El título debe tener al menos 3 caracteres' },
          { campo: 'descripcion', mensaje: 'Instrucciones tácticas obligatorias (mínimo 5 caracteres)' },
        ],
      } as unknown as never,
      response: { ok: false, status: 400 } as Response,
    });

    try {
      await crearEventoPrevencion(mockPayload, DEFAULT_ENCARGADO_ID);
      expect.fail('Debería haber lanzado error 400');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(PrevencionServiceError);
      if (err instanceof PrevencionServiceError) {
        expect(err.statusCode).toBe(400);
        expect(err.fieldErrors).toBeDefined();
        expect(err.fieldErrors?.nombre).toBe('El título debe tener al menos 3 caracteres');
        expect(err.fieldErrors?.descripcion).toBe('Instrucciones tácticas obligatorias (mínimo 5 caracteres)');
      }
    }
  });

  it('debe arrojar error específico en 401 Unauthorized', async () => {
    vi.mocked(apiClient.POST).mockResolvedValueOnce({
      data: undefined,
      error: {
        message: 'Token de sesión inválido o expirado.',
      } as unknown as never,
      response: { ok: false, status: 401 } as Response,
    });

    await expect(
      crearEventoPrevencion(mockPayload, DEFAULT_ENCARGADO_ID)
    ).rejects.toThrow('Token de sesión inválido o expirado.');
  });

  it('debe arrojar error de permisos en 403 Forbidden', async () => {
    vi.mocked(apiClient.POST).mockResolvedValueOnce({
      data: undefined,
      error: {
        message: 'Acceso denegado. Se requiere el permiso \'prevencion:eventos:crear\'.',
      } as unknown as never,
      response: { ok: false, status: 403 } as Response,
    });

    await expect(
      crearEventoPrevencion(mockPayload, 'callcenter-user-id')
    ).rejects.toThrow('Acceso denegado. Se requiere el permiso "prevencion:eventos:crear".');
  });

  it('debe arrojar error en 404 Not Found cuando la patrulla o delegación no existen', async () => {
    vi.mocked(apiClient.POST).mockResolvedValueOnce({
      data: undefined,
      error: {
        message: 'La patrulla verificadora indicada no fue encontrada.',
      } as unknown as never,
      response: { ok: false, status: 404 } as Response,
    });

    await expect(
      crearEventoPrevencion(mockPayload, DEFAULT_ENCARGADO_ID)
    ).rejects.toThrow('La patrulla verificadora indicada no fue encontrada.');
  });
});
