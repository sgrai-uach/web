import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ModalAsignarCuadrilla } from '../ModalAsignarCuadrilla';
import { cuadrillasService } from '@/services/cuadrillasService';
import { misionesService } from '@/services/misionesService';
import * as recursosService from '@/services/recursosService';
import { getSocket } from '@/lib/socket/client';
import type { IncidenteDetalle } from '@/services/incidentesService';
import type { CuadrillaItem } from '@/types/cuadrilla';

vi.mock('@/lib/socket/client', () => {
  const listeners: Record<string, ((data: unknown) => void)[]> = {};
  const mockSocket = {
    connected: true,
    connect: vi.fn(),
    emit: vi.fn(),
    on: vi.fn((event: string, cb: (data: unknown) => void) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(cb);
    }),
    off: vi.fn((event: string, cb: (data: unknown) => void) => {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter((c) => c !== cb);
    }),
    _trigger: (event: string, data: unknown) => {
      if (listeners[event]) {
        listeners[event].forEach((cb) => cb(data));
      }
    },
    _clear: () => {
      Object.keys(listeners).forEach((k) => delete listeners[k]);
    },
  };
  return {
    getSocket: () => mockSocket,
  };
});

describe('ModalAsignarCuadrilla (HU-21 / Regla ICS §3.2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getSocket() as unknown as { _clear: () => void })._clear();
  });

  const mockIncidenteConPatrullaEnCurso: IncidenteDetalle = {
    id: 'inc-01',
    codigo: 'INC-2026-0001',
    codigoSeguimiento: '112233',
    tipoAfectacion: 'Desborde de Río',
    descripcion: 'Agua anega calzada',
    direccion: 'Costanera Arturo Prat',
    latitud: -39.81,
    longitud: -73.24,
    estado: 'VERIFICANDO',
    prioridad: 'ALTA',
    requiereAsistenciaSocial: false,
    fuenteOrigen: 'CALL_CENTER',
    informante: null,
    delegacion: null,
    misiones: [
      {
        id: 'mis-verif-01',
        codigo: 'MIS-2026-0010',
        titulo: 'Verificar nivel de inundación',
        descripcion: 'Inspección visual en sitio',
        tipoMision: 'VERIFICACION',
        estado: 'EN_SITIO', // En curso -> relevo táctico pendiente según ICS §3.2
        prioridad: 'ALTA',
        justificacionRechazo: null,
        patrulla: {
          id: 'pat-01',
          nombre: 'Patrulla Rápida Costa 1',
          estado: 'EN_TERRENO',
        },
        cuadrilla: null,
        fechaInicio: '2026-10-02T10:00:00Z',
        fechaCierre: null,
        creadoEn: '2026-10-02T09:30:00Z',
      },
    ],
    recursosAsociados: [],
    creadoEn: '2026-10-02T09:00:00Z',
    actualizadoEn: '2026-10-02T10:00:00Z',
  };

  const mockIncidenteVerificacionConcluida: IncidenteDetalle = {
    ...mockIncidenteConPatrullaEnCurso,
    id: 'inc-02',
    codigo: 'INC-2026-0002',
    estado: 'VERIFICANDO',
    misiones: [
      {
        ...mockIncidenteConPatrullaEnCurso.misiones[0],
        estado: 'COMPLETADA', // Ya terminó de verificar -> antecedente técnico cerrado
      },
    ],
  };

  const mockCuadrillasDisponibles: CuadrillaItem[] = [
    {
      id: 'cuad-01',
      nombre: 'Cuadrilla Vías y Canales 1',
      estado: 'DISPONIBLE',
      delegacionId: 'del-01',
      delegacionNombre: 'Costera',
      usuarioDelegadoId: 'usr-01',
      totalTrabajadores: 6,
      totalRecursos: 2,
      creadoEn: '2026-01-01T00:00:00Z',
    },
    {
      id: 'cuad-02',
      nombre: 'Cuadrilla Emergencias Viales 2',
      estado: 'DISPONIBLE',
      delegacionId: 'del-02',
      delegacionNombre: 'Sur',
      usuarioDelegadoId: 'usr-02',
      totalTrabajadores: 4,
      totalRecursos: 1,
      creadoEn: '2026-01-01T00:00:00Z',
    },
  ];

  it('no se renderiza si isOpen es false o incidente es null', () => {
    const { container } = render(
      <ModalAsignarCuadrilla
        isOpen={false}
        onClose={vi.fn()}
        incidente={mockIncidenteConPatrullaEnCurso}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('muestra la tarjeta de relevo táctico ICS §3.2 cuando la patrulla sigue asociada a la verificación', async () => {
    vi.spyOn(cuadrillasService, 'obtenerCuadrillas').mockResolvedValueOnce({
      cuadrillas: mockCuadrillasDisponibles,
      meta: { total: 2, pagina: 1, limite: 10, paginasTotales: 1 },
    });

    render(
      <ModalAsignarCuadrilla
        isOpen={true}
        onClose={vi.fn()}
        incidente={mockIncidenteConPatrullaEnCurso}
      />
    );

    // Debe mostrar la tarjeta informativa de la regla ICS §3.2 explicando que la patrulla será relevada
    expect(screen.getByText(/Regla de Negocio ICS §3.2 \(Relevo Táctico\)/i)).toBeDefined();
    expect(screen.getByText(/Patrulla Rápida Costa 1/i)).toBeDefined();
    expect(screen.getByText(/será automáticamente relevada a estado/i)).toBeDefined();
    expect(screen.getByText(/Estado actual:/i).parentElement?.textContent).toContain(
      'Estado actual: En verificación | Prioridad: Alta'
    );
    expect(screen.queryByText(/DISPONIBLE/)).toBeNull();

    // Esperar a que se listen las cuadrillas disponibles en el selector
    await waitFor(() => {
      expect(screen.getByText(/Cuadrilla Vías y Canales 1.*6 integrantes/i)).toBeDefined();
    });

    // El botón debe permanecer habilitable una vez seleccionada la cuadrilla (no vetado de antemano)
    const selectCuadrilla = screen.getByRole('combobox', { name: /Cuadrilla Operativa/i });
    fireEvent.change(selectCuadrilla, { target: { value: 'cuad-01' } });

    expect(screen.getByText(/Dotación: 6 integrantes/i)).toBeDefined();

    const submitBtn = screen.getByRole('button', { name: /Confirmar y Despachar/i });
    expect(submitBtn.hasAttribute('disabled')).toBe(false);
  });

  it('muestra antecedente técnico cerrado y permite despachar cuando la verificación ya terminó', async () => {
    vi.spyOn(cuadrillasService, 'obtenerCuadrillas').mockResolvedValueOnce({
      cuadrillas: mockCuadrillasDisponibles,
      meta: { total: 2, pagina: 1, limite: 10, paginasTotales: 1 },
    });

    const mockDespachoResultado = {
      mision: {
        id: 'mis-atencion-01',
        codigo: 'MIS-2026-0020',
        tipoMision: 'ATENCION_CUADRILLA',
        estado: 'DESPACHADA',
        fechaInicio: null,
      },
      cuadrilla: {
        id: 'cuad-01',
        nombre: 'Cuadrilla Vías y Canales 1',
        estado: 'EN_MISION',
      },
      incidente: {
        id: 'inc-02',
        codigo: 'INC-2026-0002',
        estado: 'EN_ATENCION',
        prioridad: 'ALTA',
      },
      patrullaLiberada: {
        id: 'pat-01',
        nombre: 'Patrulla Rápida Costa 1',
        estado: 'DISPONIBLE',
        misionPreviaId: 'mis-verif-01',
      },
    };

    vi.spyOn(misionesService, 'despacharCuadrilla').mockResolvedValueOnce({
      exito: true,
      datos: mockDespachoResultado,
      mensaje: 'Cuadrilla despachada y patrulla liberada.',
    });

    const mockOnSuccess = vi.fn();
    const mockOnClose = vi.fn();

    render(
      <ModalAsignarCuadrilla
        isOpen={true}
        onClose={mockOnClose}
        incidente={mockIncidenteVerificacionConcluida}
        onSuccess={mockOnSuccess}
      />
    );

    // Debe mostrar la tarjeta de antecedente técnico cerrado
    expect(screen.getByText(/Diagnóstico Técnico en Terreno Completado/i)).toBeDefined();
    expect(screen.getByText(/Evaluación técnica en terreno finalizada por la patrulla/i)).toBeDefined();

    // Esperar a que se listen las cuadrillas disponibles en el selector
    await waitFor(() => {
      expect(screen.getByText(/Cuadrilla Vías y Canales 1/i)).toBeDefined();
      expect(screen.getByText(/Cuadrilla Emergencias Viales 2/i)).toBeDefined();
    });

    // Seleccionar cuadrilla
    const selectCuadrilla = screen.getByRole('combobox', { name: /Cuadrilla Operativa/i });
    fireEvent.change(selectCuadrilla, { target: { value: 'cuad-01' } });

    // Confirmar formulario
    const submitBtn = screen.getByRole('button', { name: /Confirmar y Despachar/i });
    expect(submitBtn.hasAttribute('disabled')).toBe(false);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(misionesService.despacharCuadrilla).toHaveBeenCalledWith(
        expect.objectContaining({
          tipoMision: 'ATENCION_CUADRILLA',
          incidenteId: 'inc-02',
          cuadrillaId: 'cuad-01',
          prioridad: 'ALTA',
        }),
        undefined
      );
      expect(mockOnSuccess).toHaveBeenCalledWith(mockDespachoResultado);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('despliega error si el backend responde con conflicto 409 VERIFICACION_EN_CURSO', async () => {
    vi.spyOn(cuadrillasService, 'obtenerCuadrillas').mockResolvedValueOnce({
      cuadrillas: mockCuadrillasDisponibles,
      meta: { total: 2, pagina: 1, limite: 10, paginasTotales: 1 },
    });

    vi.spyOn(misionesService, 'despacharCuadrilla').mockResolvedValueOnce({
      exito: false,
      codigoError: 409,
      codigo: 'VERIFICACION_EN_CURSO',
      mensaje: 'Conflicto: la patrulla aún está evaluando el sitio.',
    });

    render(
      <ModalAsignarCuadrilla
        isOpen={true}
        onClose={vi.fn()}
        incidente={mockIncidenteConPatrullaEnCurso}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Cuadrilla Vías y Canales 1/i)).toBeDefined();
    });

    const selectCuadrilla = screen.getByRole('combobox', { name: /Cuadrilla Operativa/i });
    fireEvent.change(selectCuadrilla, { target: { value: 'cuad-01' } });

    const submitBtn = screen.getByRole('button', { name: /Confirmar y Despachar/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Conflicto: la patrulla aún está evaluando el sitio/i)).toBeDefined();
    });
  });

  it('muestra el aviso de advertencia cuando no hay cuadrillas operativas disponibles', async () => {
    vi.spyOn(cuadrillasService, 'obtenerCuadrillas').mockResolvedValueOnce({
      cuadrillas: [],
      meta: { total: 0, pagina: 1, limite: 10, paginasTotales: 0 },
    });

    render(
      <ModalAsignarCuadrilla
        isOpen={true}
        onClose={vi.fn()}
        incidente={mockIncidenteVerificacionConcluida}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No hay cuadrillas operativas disponibles en este momento.')).toBeDefined();
    });

    // No debe haber texto de ayuda debajo
    expect(screen.queryByText(/Únicamente se listan dotaciones/i)).toBeNull();
  });

  it('HU-68: recarga cuadrillas disponibles en vivo cuando llega cuadrilla:actualizada con estado DISPONIBLE', async () => {
    const spyObtener = vi
      .spyOn(cuadrillasService, 'obtenerCuadrillas')
      .mockResolvedValueOnce({
        cuadrillas: [],
        meta: { total: 0, pagina: 1, limite: 10, paginasTotales: 0 },
      })
      .mockResolvedValueOnce({
        cuadrillas: [mockCuadrillasDisponibles[0]],
        meta: { total: 1, pagina: 1, limite: 10, paginasTotales: 1 },
      });

    render(
      <ModalAsignarCuadrilla
        isOpen={true}
        onClose={vi.fn()}
        incidente={mockIncidenteVerificacionConcluida}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No hay cuadrillas operativas disponibles en este momento.')).toBeDefined();
    });

    const socket = getSocket() as unknown as { _trigger: (ev: string, data: unknown) => void };
    act(() => {
      socket._trigger('cuadrilla:actualizada', {
        id: 'cuad-01',
        nombre: 'Cuadrilla Vías y Canales 1',
        estado: 'DISPONIBLE',
      });
    });

    await waitFor(() => {
      expect(spyObtener).toHaveBeenCalledTimes(2);
      expect(screen.getByText(/Cuadrilla Vías y Canales 1/i)).toBeDefined();
    });
  });

  it('HU-44: en EN_ATENCION muestra cuadrillas activas, contexto de apoyo, dotación actual, permite agregar recursos adicionales sin filtrar estado=DISPONIBLE y preserva selección ante re-render con mismo id', async () => {
    vi.spyOn(cuadrillasService, 'obtenerCuadrillas').mockResolvedValueOnce({
      cuadrillas: [
        {
          ...mockCuadrillasDisponibles[0],
          recursos: [
            {
              id: 'cr-1',
              recursoId: 'rec-ya',
              nombre: 'Motosierra Stihl',
              cantidadAsignada: 2,
              esIndividual: false,
            },
          ],
        },
      ],
      meta: { total: 1, pagina: 1, limite: 10, paginasTotales: 1 },
    });

    const spyGetRecursos = vi.spyOn(recursosService, 'getRecursos').mockResolvedValueOnce({
      data: [
        {
          id: 'rec-extra-1',
          nombre: 'Motobomba Honda',
          tipo: 'Vehículo o Maquinaria',
          esIndividual: true,
          estado: 'DISPONIBLE',
          cantidadInventario: 1,
          cantidadEnUso: 0,
          cantidadDisponible: 1,
          cantidadMinima: 0,
          latitud: -39.81,
          longitud: -73.24,
          descripcion: null,
          detalles: {},
          delegacion: null,
          creadoPorId: 'u1',
          creadoEn: '2026-01-01T00:00:00Z',
          actualizadoEn: '2026-01-01T00:00:00Z',
        },
        {
          id: 'rec-extra-2',
          nombre: 'Sacos de arena 25kg',
          tipo: 'Material o Insumo',
          esIndividual: false,
          estado: 'BAJO_STOCK',
          cantidadInventario: 20,
          cantidadEnUso: 12,
          cantidadDisponible: 8,
          cantidadMinima: 10,
          latitud: -39.81,
          longitud: -73.24,
          descripcion: null,
          detalles: {},
          delegacion: null,
          creadoPorId: 'u1',
          creadoEn: '2026-01-01T00:00:00Z',
          actualizadoEn: '2026-01-01T00:00:00Z',
        },
      ],
      meta: { total: 2, pagina: 1, limite: 100, totalPaginas: 1 },
    });

    const spyDespachar = vi.spyOn(misionesService, 'despacharCuadrilla').mockResolvedValueOnce({
      exito: true,
      datos: {
        mision: {
          id: 'mis-apoyo-2',
          codigo: 'MIS-2026-0099',
          titulo: 'Apoyo táctico - INC-2026-0090',
          descripcion: null,
          tipoMision: 'ATENCION_CUADRILLA',
          estado: 'DESPACHADA',
          prioridad: 'ALTA',
          incidenteId: 'inc-atencion-1',
          cuadrillaId: 'cuad-01',
          encargadoId: 'user-enc-1',
          creadoPorId: 'user-enc-1',
          fechaInicio: null,
          creadoEn: '2026-11-24T12:00:00Z',
        },
        cuadrilla: {
          id: 'cuad-01',
          nombre: 'Cuadrilla Vías y Canales 1',
          estado: 'EN_MISION',
        },
        incidente: {
          id: 'inc-atencion-1',
          codigo: 'INC-2026-0090',
          estado: 'EN_ATENCION',
          prioridad: 'ALTA',
        },
        patrullaLiberada: null as never,
        hitoCuadrilla: {
          id: 'h-1',
          misionId: 'mis-apoyo-2',
          hito: 'CUADRILLA_DESPACHADA',
          descripcion: 'Despachada',
          creadoEn: '2026-11-24T12:00:00Z',
        },
      },
      mensaje: 'OK',
    });

    const incidenteEnAtencion: IncidenteDetalle = {
      ...mockIncidenteVerificacionConcluida,
      id: 'inc-atencion-1',
      codigo: 'INC-2026-0090',
      estado: 'EN_ATENCION',
      apoyoSolicitado: true,
      requiereCuadrillaAdicional: true,
      detalleApoyoRequerido: 'Se requiere segunda cuadrilla con motobomba y sacos',
      misiones: [
        {
          id: 'mis-act-1',
          codigo: 'MIS-2026-0011',
          titulo: 'Atención táctica',
          descripcion: null,
          tipoMision: 'ATENCION_CUADRILLA',
          estado: 'EN_CURSO',
          prioridad: 'ALTA',
          justificacionRechazo: null,
          patrulla: null,
          cuadrilla: {
            id: 'cuad-99',
            nombre: 'Cuadrilla Norte',
            estado: 'EN_MISION',
          },
          fechaInicio: '2026-11-24T10:00:00Z',
          fechaCierre: null,
          creadoEn: '2026-11-24T09:50:00Z',
        },
      ],
    };

    const { rerender } = render(
      <ModalAsignarCuadrilla
        isOpen={true}
        onClose={vi.fn()}
        incidente={incidenteEnAtencion}
        userId="user-enc-1"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('modal-cuadrillas-activas').textContent).toContain('Cuadrilla Norte');
      expect(screen.getByTestId('modal-contexto-apoyo').textContent).toContain(
        'Cuadrilla adicional solicitada desde terreno'
      );
    });

    // Verifica llamada sin filtro estado='DISPONIBLE' (permite BAJO_STOCK con disponible > 0)
    expect(spyGetRecursos).toHaveBeenCalledWith({ pagina: 1, limite: 100 }, 'user-enc-1');

    // Selecciona cuadrilla y verifica dotación actual
    fireEvent.change(screen.getByRole('combobox', { name: /Cuadrilla Operativa/i }), {
      target: { value: 'cuad-01' },
    });
    expect(screen.getByTestId('dotacion-actual-cuadrilla').textContent).toContain(
      'Motosierra Stihl (×2)'
    );

    // Agrega recurso con BAJO_STOCK y cantidad 4
    fireEvent.change(screen.getByRole('combobox', { name: /Recurso adicional para la cuadrilla/i }), {
      target: { value: 'rec-extra-2' },
    });
    fireEvent.change(screen.getByRole('spinbutton', { name: /Cantidad de recurso adicional/i }), {
      target: { value: '4' },
    });
    fireEvent.click(screen.getByTestId('btn-agregar-recurso-adicional'));

    expect(screen.getByTestId('lista-recursos-adicionales-seleccionados').textContent).toContain(
      'Sacos de arena 25kg'
    );

    // Re-render con nuevo objeto de incidente pero MISMO id -> no debe limpiar la selección
    rerender(
      <ModalAsignarCuadrilla
        isOpen={true}
        onClose={vi.fn()}
        incidente={{ ...incidenteEnAtencion, actualizadoEn: '2026-11-24T12:01:00Z' }}
        userId="user-enc-1"
      />
    );

    expect(
      (screen.getByRole('combobox', { name: /Cuadrilla Operativa/i }) as HTMLSelectElement).value
    ).toBe('cuad-01');
    expect(screen.getByTestId('lista-recursos-adicionales-seleccionados').textContent).toContain(
      'Sacos de arena 25kg'
    );

    fireEvent.click(screen.getByRole('button', { name: /Confirmar y Despachar/i }));

    await waitFor(() => {
      expect(spyDespachar).toHaveBeenCalledWith(
        expect.objectContaining({
          tipoMision: 'ATENCION_CUADRILLA',
          incidenteId: 'inc-atencion-1',
          cuadrillaId: 'cuad-01',
          titulo: 'Apoyo táctico - INC-2026-0090',
          recursosAdicionales: [{ recursoId: 'rec-extra-2', cantidad: 4 }],
        }),
        'user-enc-1'
      );
    });
  });

  it('HU-44: al seleccionar un recurso individual primero y cambiar a una cuadrilla que ya lo posee, lo retira de recursosAdicionales para evitar 409', async () => {
    vi.spyOn(cuadrillasService, 'obtenerCuadrillas').mockResolvedValueOnce({
      cuadrillas: [
        mockCuadrillasDisponibles[0],
        {
          ...mockCuadrillasDisponibles[1],
          recursos: [
            {
              id: 'cr-ind-1',
              recursoId: 'rec-extra-ind',
              nombre: 'Motobomba Honda',
              cantidadAsignada: 1,
              esIndividual: true,
            },
          ],
        },
      ],
      meta: { total: 2, pagina: 1, limite: 10, paginasTotales: 1 },
    });

    vi.spyOn(recursosService, 'getRecursos').mockResolvedValueOnce({
      data: [
        {
          id: 'rec-extra-ind',
          nombre: 'Motobomba Honda',
          tipo: 'Vehículo o Maquinaria',
          esIndividual: true,
          estado: 'DISPONIBLE',
          cantidadInventario: 1,
          cantidadEnUso: 0,
          cantidadDisponible: 1,
          cantidadMinima: 0,
          latitud: -39.81,
          longitud: -73.24,
          descripcion: null,
          detalles: {},
          delegacion: null,
          creadoPorId: 'u1',
          creadoEn: '2026-01-01T00:00:00Z',
          actualizadoEn: '2026-01-01T00:00:00Z',
        },
      ],
      meta: { total: 1, pagina: 1, limite: 100, totalPaginas: 1 },
    });

    render(
      <ModalAsignarCuadrilla
        isOpen={true}
        onClose={vi.fn()}
        incidente={mockIncidenteVerificacionConcluida}
        userId="user-enc-1"
      />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('combobox', { name: /Recurso adicional para la cuadrilla/i })
      ).toBeDefined();
    });

    // Seleccionar primero cuadrilla 1 (que no tiene la motobomba) y agregar Motobomba Honda
    fireEvent.change(screen.getByRole('combobox', { name: /Cuadrilla Operativa/i }), {
      target: { value: 'cuad-01' },
    });
    fireEvent.change(
      screen.getByRole('combobox', { name: /Recurso adicional para la cuadrilla/i }),
      {
        target: { value: 'rec-extra-ind' },
      }
    );
    fireEvent.click(screen.getByTestId('btn-agregar-recurso-adicional'));

    expect(screen.getByTestId('lista-recursos-adicionales-seleccionados').textContent).toContain(
      'Motobomba Honda'
    );

    // Cambiar a cuadrilla 2 (que ya posee Motobomba Honda como recurso individual)
    fireEvent.change(screen.getByRole('combobox', { name: /Cuadrilla Operativa/i }), {
      target: { value: 'cuad-02' },
    });

    await waitFor(() => {
      expect(screen.queryByTestId('lista-recursos-adicionales-seleccionados')).toBeNull();
    });
  });
});
