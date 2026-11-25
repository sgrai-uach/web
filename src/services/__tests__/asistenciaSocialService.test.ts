import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  crearEventoAsistenciaSocial,
  obtenerEventosAsistenciaSocial,
  asignarAsistenteSocial,
  derivarIncidenteAAsistenciaSocial,
  registrarFichaFibe,
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

  it('debe asignar un asistente social mediante PATCH y retornar el evento actualizado a ASIGNADO', async () => {
    const mockActualizado = {
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
      estado: 'ASIGNADO' as const,
      contactoNombre: null,
      contactoTelefono: null,
      contactoRut: null,
      delegacionId: null,
      delegacionNombre: null,
      incidenteId: null,
      asistenteSocialId: '50000000-0000-4000-8000-000000000001',
      asistenteSocialNombre: 'Camila Valenzuela Castro',
      creadoPor: { id: '1', nombre: 'Encargado' },
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
    };

    const spyPatch = vi.spyOn(apiClient, 'PATCH').mockResolvedValueOnce({
      data: { data: mockActualizado },
      error: null,
      response: new Response(null, { status: 200 }),
    });

    const resultado = await asignarAsistenteSocial(
      '70000000-0000-4000-8000-000000000001',
      '50000000-0000-4000-8000-000000000001',
      'encargado-1'
    );

    expect(spyPatch).toHaveBeenCalledTimes(1);
    expect(resultado.estado).toBe('ASIGNADO');
    expect(resultado.asistenteSocialId).toBe('50000000-0000-4000-8000-000000000001');
    expect(resultado.asistenteSocialNombre).toBe('Camila Valenzuela Castro');
  });

  it('debe lanzar AsistenciaSocialServiceError con statusCode 409 cuando el asistente no está disponible', async () => {
    vi.spyOn(apiClient, 'PATCH').mockResolvedValueOnce({
      data: null,
      error: { message: 'El asistente social ya no se encuentra disponible.' },
      response: new Response(null, { status: 409 }),
    });

    await expect(
      asignarAsistenteSocial(
        '70000000-0000-4000-8000-000000000001',
        '50000000-0000-4000-8000-000000000001'
      )
    ).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it('debe lanzar AsistenciaSocialServiceError con statusCode 403 si falta permiso asistencia_social:crear', async () => {
    vi.spyOn(apiClient, 'PATCH').mockResolvedValueOnce({
      data: null,
      error: { message: 'Permiso insuficiente' },
      response: new Response(null, { status: 403 }),
    });

    await expect(
      asignarAsistenteSocial(
        '70000000-0000-4000-8000-000000000001',
        '50000000-0000-4000-8000-000000000001'
      )
    ).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it('debe crear un evento con asistenteSocialId en estado ASIGNADO cuando la API retorna 201 (Opción A)', async () => {
    const payloadConAsistente: CrearEventoAsistenciaSocialDTO = {
      ...mockPayload,
      asistenteSocialId: '50000000-0000-4000-8000-000000000001',
    };

    const spyPost = vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
      data: {
        data: {
          id: '70000000-0000-4000-8000-000000000101',
          codigo: 'AS-2026-0101',
          ...mockPayload,
          estado: 'ASIGNADO',
          contactoRut: null,
          delegacionId: null,
          delegacionNombre: null,
          incidenteId: null,
          asistenteSocialId: '50000000-0000-4000-8000-000000000001',
          asistenteSocialNombre: 'Camila Valenzuela Castro',
          creadoPor: { id: 'user-1', nombre: 'Encargado' },
          creadoEn: new Date().toISOString(),
          actualizadoEn: new Date().toISOString(),
        },
      },
      error: null,
      response: new Response(null, { status: 201 }),
    });

    const resultado = await crearEventoAsistenciaSocial(payloadConAsistente, 'user-1');

    expect(spyPost).toHaveBeenCalledTimes(1);
    expect(resultado.estado).toBe('ASIGNADO');
    expect(resultado.asistenteSocialId).toBe('50000000-0000-4000-8000-000000000001');
  });

  it('debe lanzar AsistenciaSocialServiceError con statusCode 409 al crear si el asistente ya no está disponible', async () => {
    vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
      data: null,
      error: { message: 'El asistente social ya no está disponible para asignación.' },
      response: new Response(null, { status: 409 }),
    });

    await expect(
      crearEventoAsistenciaSocial(
        {
          ...mockPayload,
          asistenteSocialId: '50000000-0000-4000-8000-000000000001',
        },
        'user-1'
      )
    ).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it('debe enviar detallesEvaluacion con familias en el cuerpo del POST cuando se provee desglose opcional', async () => {
    const payloadConDetalles: CrearEventoAsistenciaSocialDTO = {
      ...mockPayload,
      personasAfectadas: 4,
      familiasAfectadas: 1,
      detallesEvaluacion: {
        familiasAfectadas: 1,
        nucleoFamiliarTotal: 4,
        cantidadNinos: 2,
        cantidadAdultosMayores: 1,
        nivelCompromisoVivienda: 'MODERADO',
        danosEstimados: 'Anegamiento en comedor',
        familias: [
          {
            referencia: 'Familia Morales',
            nucleoFamiliarTotal: 4,
            cantidadNinos: 2,
            cantidadAdultosMayores: 1,
            nivelCompromisoVivienda: 'MODERADO',
          },
        ],
      },
    };

    const spyPost = vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
      data: {
        data: {
          id: '70000000-0000-4000-8000-000000000105',
          codigo: 'AS-2026-0105',
          ...payloadConDetalles,
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
      },
      error: null,
      response: new Response(null, { status: 201 }),
    });

    const resultado = await crearEventoAsistenciaSocial(payloadConDetalles, 'user-1');

    expect(spyPost).toHaveBeenCalledWith(
      '/api/eventos-atp/asistencia-social',
      expect.objectContaining({
        body: expect.objectContaining({
          detallesEvaluacion: expect.objectContaining({
            familiasAfectadas: 1,
            nucleoFamiliarTotal: 4,
          }),
        }),
      })
    );
    expect(resultado.codigo).toBe('AS-2026-0105');
  });

  it('preserva y normaliza detallesEvaluacion (5 integrantes, 2 niños, 1 discapacidad) entre POST, GET y PATCH', async () => {
    const detallesReales = {
      familiasAfectadas: 1,
      nucleoFamiliarTotal: 5,
      cantidadNinos: 2,
      cantidadAdultosMayores: 0,
      personasDiscapacitadas: 1,
      personasElectrodependientes: 0,
      mascotasAfectadas: 0,
      nivelCompromisoVivienda: 'MODERADO' as const,
      danosEstimados: 'Daño parcial',
      familias: [
        {
          referencia: 'Hogar Beneficencia',
          nucleoFamiliarTotal: 5,
          cantidadNinos: 2,
          cantidadAdultosMayores: 0,
          personasDiscapacitadas: 1,
          personasElectrodependientes: 0,
          mascotasAfectadas: 0,
          nivelCompromisoVivienda: 'MODERADO' as const,
        },
      ],
    };

    const eventoServidor = {
      id: '70000000-0000-4000-8000-000000000222',
      codigo: 'AS-2026-0222',
      ...mockPayload,
      personasAfectadas: 5,
      familiasAfectadas: 1,
      estado: 'PENDIENTE' as const,
      contactoRut: null,
      delegacionId: null,
      delegacionNombre: null,
      incidenteId: null,
      asistenteSocialId: null,
      asistenteSocialNombre: null,
      detallesEvaluacion: detallesReales,
      creadoPor: { id: 'user-1', nombre: 'Encargado' },
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
    };

    vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
      data: { data: eventoServidor },
      error: null,
      response: new Response(null, { status: 201 }),
    });
    vi.spyOn(apiClient, 'GET').mockResolvedValueOnce({
      data: { data: [eventoServidor], total: 1, pagina: 1, limite: 10, totalPaginas: 1 },
      error: null,
      response: new Response(null, { status: 200 }),
    });
    vi.spyOn(apiClient, 'PATCH').mockResolvedValueOnce({
      data: {
        data: {
          ...eventoServidor,
          estado: 'ASIGNADO',
          asistenteSocialId: '50000000-0000-4000-8000-000000000001',
          asistenteSocialNombre: 'Camila Valenzuela Castro',
        },
      },
      error: null,
      response: new Response(null, { status: 200 }),
    });

    const creado = await crearEventoAsistenciaSocial(
      { ...mockPayload, personasAfectadas: 5, familiasAfectadas: 1, detallesEvaluacion: detallesReales },
      'user-1'
    );
    const listado = await obtenerEventosAsistenciaSocial({ pagina: 1, limite: 10 });
    const asignado = await asignarAsistenteSocial(
      eventoServidor.id,
      '50000000-0000-4000-8000-000000000001',
      'user-1'
    );

    for (const item of [creado, listado.data[0], asignado]) {
      expect(item.personasAfectadas).toBe(5);
      expect(item.familiasAfectadas).toBe(1);
      expect(item.detallesEvaluacion?.familias).toHaveLength(1);
      expect(item.detallesEvaluacion?.cantidadNinos).toBe(2);
      expect(item.detallesEvaluacion?.personasDiscapacitadas).toBe(1);
    }
  });

  it('HU-25: derivarIncidenteAAsistenciaSocial llama a POST /api/incidentes/{id}/asistencia-social y maneja 201, 200, 403, 409 y 422', async () => {
    const postSpy = vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
      data: {
        data: {
          accion: 'CREADO',
          evento: {
            id: 'ev-h25-1',
            codigo: 'AS-2026-0099',
            estado: 'ASIGNADO',
            incidenteId: 'inc-resuelto-1',
            asistenteSocialId: 'asoc-1',
            asistenteSocialNombre: 'Camila Soto',
            direccionTexto: 'Av. Picarte 1420',
            contactoNombre: 'Juan Pérez',
            contactoTelefono: '+56987654321',
            prioridad: 'ALTA',
            tipoAfectacion: 'VIVIENDA_ANEGADA',
            personasAfectadas: 3,
            familiasAfectadas: 1,
            latitud: -39.81,
            longitud: -73.24,
            creadoEn: '2026-11-21T12:00:00Z',
            actualizadoEn: '2026-11-21T12:00:00Z',
          },
          hitoRegistrado: {
            hito: 'DERIVACION_ASISTENCIA_SOCIAL',
            descripcion: 'Derivado a Camila Soto',
          },
        },
      },
      error: null,
      response: new Response(null, { status: 201 }),
    } as never);

    const res201 = await derivarIncidenteAAsistenciaSocial(
      {
        incidenteId: 'inc-resuelto-1',
        asistenteSocialId: 'asoc-1',
        observaciones: 'Adulto mayor en vivienda anegada',
      },
      'encargado-1'
    );

    expect(postSpy).toHaveBeenCalledWith(
      '/api/incidentes/{id}/asistencia-social',
      expect.objectContaining({
        params: expect.objectContaining({ path: { id: 'inc-resuelto-1' } }),
        body: {
          asistenteSocialId: 'asoc-1',
          observaciones: 'Adulto mayor en vivienda anegada',
        },
      })
    );
    expect(res201.accion).toBe('CREADO');
    expect(res201.evento.estado).toBe('ASIGNADO');
    expect(res201.evento.contactoNombre).toBe('Juan Pérez');
    expect(res201.hitoRegistrado?.hito).toBe('DERIVACION_ASISTENCIA_SOCIAL');

    // Error 403 RBAC
    vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
      data: undefined,
      error: { message: 'Permiso asistencia_social:crear requerido' },
      response: new Response(null, { status: 403 }),
    } as never);
    await expect(
      derivarIncidenteAAsistenciaSocial({
        incidenteId: 'inc-resuelto-1',
        asistenteSocialId: 'asoc-1',
      })
    ).rejects.toMatchObject({ statusCode: 403 });

    // Error 409 conflicto disponibilidad
    vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
      data: undefined,
      error: { message: 'El asistente social ya no está disponible' },
      response: new Response(null, { status: 409 }),
    } as never);
    await expect(
      derivarIncidenteAAsistenciaSocial({
        incidenteId: 'inc-resuelto-1',
        asistenteSocialId: 'asoc-1',
      })
    ).rejects.toMatchObject({ statusCode: 409 });

    // Error 422 incidente no elegible
    vi.spyOn(apiClient, 'POST').mockResolvedValueOnce({
      data: undefined,
      error: { message: 'Incidente no está RESUELTO' },
      response: new Response(null, { status: 422 }),
    } as never);
    await expect(
      derivarIncidenteAAsistenciaSocial({
        incidenteId: 'inc-resuelto-1',
        asistenteSocialId: 'asoc-1',
      })
    ).rejects.toMatchObject({ statusCode: 422 });
  });

  it('debe registrar la Ficha FIBE (HU-71) con PATCH y manejar errores 403, 404 y 409', async () => {
    const mockEventoActualizado = {
      id: '70000000-0000-4000-8000-000000000050',
      codigo: 'AS-2026-0050',
      descripcion: 'Vivienda con anegamiento severo',
      tipoAfectacion: 'VIVIENDA_ANEGADA',
      personasAfectadas: 4,
      familiasAfectadas: 1,
      direccionTexto: 'Calle Los Alerces 1420',
      latitud: -39.8234,
      longitud: -73.2189,
      prioridad: 'ALTA',
      estado: 'EN_EVALUACION_FIBE',
      contactoNombre: 'María González',
      contactoTelefono: '+56912345678',
      contactoRut: null,
      delegacionId: null,
      delegacionNombre: null,
      incidenteId: null,
      asistenteSocialId: 'asoc-1',
      asistenteSocialNombre: 'Camila Valenzuela',
      folioFibe: 'FIBE-2026-0001',
      nivelDanoVivienda: 'MODERADO',
      observacionesFibe: 'Requiere reposición de enseres.',
      fibeRegistradaEn: '2026-10-05T14:30:00.000Z',
      fibeRegistradaPorId: 'asoc-1',
      creadoPor: { id: 'user-1', nombre: 'Encargado' },
      creadoEn: '2026-10-05T12:00:00.000Z',
      actualizadoEn: '2026-10-05T14:30:00.000Z',
    };

    const patchSpy = vi.spyOn(apiClient, 'PATCH').mockResolvedValueOnce({
      data: {
        message: 'Ficha FIBE registrada exitosamente.',
        data: mockEventoActualizado,
      },
      error: undefined,
      response: new Response(null, { status: 200 }),
    } as never);

    const resultado = await registrarFichaFibe(
      '70000000-0000-4000-8000-000000000050',
      {
        folioFibe: ' fibe-2026-0001 ',
        personasAfectadas: 4,
        nivelDanoVivienda: 'MODERADO',
        observacionesSociales: 'Requiere reposición de enseres.',
      },
      'asoc-1'
    );

    expect(patchSpy).toHaveBeenCalledWith(
      '/api/eventos-atp/asistencia-social/{id}/fibe',
      expect.objectContaining({
        params: expect.objectContaining({
          path: { id: '70000000-0000-4000-8000-000000000050' },
        }),
        body: {
          folioFibe: 'FIBE-2026-0001',
          personasAfectadas: 4,
          nivelDanoVivienda: 'MODERADO',
          observacionesSociales: 'Requiere reposición de enseres.',
        },
      })
    );
    expect(resultado.estado).toBe('EN_EVALUACION_FIBE');
    expect(resultado.folioFibe).toBe('FIBE-2026-0001');
    expect(resultado.nivelDanoVivienda).toBe('MODERADO');

    // Error 409 folio duplicado -> incluye fieldErrors.folioFibe
    vi.spyOn(apiClient, 'PATCH').mockResolvedValueOnce({
      data: undefined,
      error: { message: 'El folio FIBE-2026-0001 ya está registrado en otro expediente.' },
      response: new Response(null, { status: 409 }),
    } as never);

    try {
      await registrarFichaFibe('70000000-0000-4000-8000-000000000050', {
        folioFibe: 'FIBE-2026-0001',
      });
      expect.fail('Debió lanzar AsistenciaSocialServiceError');
    } catch (err) {
      expect(err).toBeInstanceOf(AsistenciaSocialServiceError);
      const serviceErr = err as AsistenciaSocialServiceError;
      expect(serviceErr.statusCode).toBe(409);
      expect(serviceErr.fieldErrors?.folioFibe).toContain('folio');
    }

    // Error 403 sin permiso asistencia_social:fibe:gestionar
    vi.spyOn(apiClient, 'PATCH').mockResolvedValueOnce({
      data: undefined,
      error: { message: 'Permiso asistencia_social:fibe:gestionar requerido' },
      response: new Response(null, { status: 403 }),
    } as never);

    await expect(
      registrarFichaFibe('70000000-0000-4000-8000-000000000050', {
        folioFibe: 'FIBE-2026-0002',
      })
    ).rejects.toMatchObject({ statusCode: 403 });

    // Error 404 caso inexistente
    vi.spyOn(apiClient, 'PATCH').mockResolvedValueOnce({
      data: undefined,
      error: { message: 'Evento no encontrado' },
      response: new Response(null, { status: 404 }),
    } as never);

    await expect(
      registrarFichaFibe('70000000-0000-4000-8000-000000000999', {
        folioFibe: 'FIBE-2026-0003',
      })
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
