import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  crearEventoAsistenciaSocial,
  obtenerEventosAsistenciaSocial,
  AsistenciaSocialServiceError,
  filtrarEventosMock,
} from '../asistenciaSocialService';
import apiClient from '@/lib/api/client';
import type { CrearEventoAsistenciaSocialDTO } from '@/types/asistenciaSocial';

describe('asistenciaSocialService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPayload: CrearEventoAsistenciaSocialDTO = {
    descripcion: 'Anegamiento crítico por desborde en patio y acceso',
    tipoAfectacion: 'VIVIENDA_ANEGADA',
    direccionTexto: 'Calle Simpson 120',
    latitud: -39.814,
    longitud: -73.245,
    personasAfectadas: 3,
    familiasAfectadas: 1,
    prioridad: 'ALTA',
    contactoNombre: 'Rosa Morales',
    contactoTelefono: '+56911223344',
  };

  it('debe registrar un evento de asistencia social exitosamente cuando la API retorna 201', async () => {
    const mockApiResponse = {
      message: 'Evento de asistencia social registrado exitosamente.',
      data: {
        id: '70000000-0000-4000-8000-000000000099',
        codigo: 'AS-2026-0099',
        ...mockPayload,
        estado: 'PENDIENTE',
        contactoRut: null,
        delegacionId: null,
        delegacionNombre: null,
        incidenteId: null,
        asistenteSocialId: null,
        asistenteSocialNombre: null,
        creadoPor: { id: 'user-1', nombre: 'Encargado' },
        creadoEn: new Date().toISOString(),
        actualizadoEn: new Date().toISOString(),
      },
    };

    vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
      data: mockApiResponse,
      error: null,
      response: new Response(null, { status: 201 }),
    });

    const resultado = await crearEventoAsistenciaSocial(mockPayload, 'user-1');

    expect(resultado.codigo).toBe('AS-2026-0099');
    expect(resultado.estado).toBe('PENDIENTE');
    expect(resultado.incidenteId).toBeNull();
  });

  it('debe lanzar AsistenciaSocialServiceError con código 403 cuando el usuario no tiene permisos', async () => {
    vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
      data: null,
      error: { message: 'No cuenta con el permiso requerido: asistencia_social:crear' },
      response: new Response(null, { status: 403 }),
    });

    await expect(crearEventoAsistenciaSocial(mockPayload, 'observador-id')).rejects.toThrow(
      AsistenciaSocialServiceError
    );
  });

  it('debe parsear fieldErrors cuando la API retorna 400 con un array de errores', async () => {
    vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
      data: null,
      error: {
        message: 'Validación fallida',
        errors: [
          { campo: 'descripcion', mensaje: 'La descripción debe tener al menos 5 caracteres' },
        ],
      },
      response: new Response(null, { status: 400 }),
    });

    try {
      await crearEventoAsistenciaSocial(mockPayload);
      expect.fail('Debería haber lanzado AsistenciaSocialServiceError');
    } catch (err) {
      expect(err).toBeInstanceOf(AsistenciaSocialServiceError);
      const serviceErr = err as AsistenciaSocialServiceError;
      expect(serviceErr.statusCode).toBe(400);
      expect(serviceErr.fieldErrors?.descripcion).toContain('al menos 5 caracteres');
    }
  });

  it('debe listar eventos pendientes y filtrar por búsqueda en mock de respaldo', async () => {
    const res = filtrarEventosMock({
      pagina: 1,
      limite: 10,
      busqueda: 'Alerces',
    });

    expect(res.data.length).toBeGreaterThan(0);
    expect(res.data[0].direccionTexto).toContain('Los Alerces');
  });

  it('debe consultar endpoint GET /api/eventos-atp/asistencia-social y retornar data', async () => {
    const mockList = [
      {
        id: '70000000-0000-4000-8000-000000000001',
        codigo: 'AS-2026-0001',
        descripcion: 'Anegamiento en patio',
        tipoAfectacion: 'VIVIENDA_ANEGADA',
        personasAfectadas: 2,
        familiasAfectadas: 1,
        direccionTexto: 'Av. Francia 500',
        latitud: -39.82,
        longitud: -73.23,
        prioridad: 'MEDIA' as const,
        estado: 'PENDIENTE' as const,
        contactoNombre: null,
        contactoTelefono: null,
        contactoRut: null,
        delegacionId: null,
        delegacionNombre: null,
        incidenteId: null,
        asistenteSocialId: null,
        asistenteSocialNombre: null,
        creadoPor: { id: '1', nombre: 'Admin' },
        creadoEn: new Date().toISOString(),
        actualizadoEn: new Date().toISOString(),
      },
    ];

    vi.spyOn(apiClient, 'GET').mockResolvedValueOnce({
      data: { data: mockList, total: 1, pagina: 1, limite: 10, totalPaginas: 1 },
      error: null,
      response: new Response(null, { status: 200 }),
    });

    const respuesta = await obtenerEventosAsistenciaSocial({
      pagina: 1,
      limite: 10,
      estado: 'PENDIENTE',
    });

    expect(respuesta.data).toHaveLength(1);
    expect(respuesta.data[0].codigo).toBe('AS-2026-0001');
  });
});
