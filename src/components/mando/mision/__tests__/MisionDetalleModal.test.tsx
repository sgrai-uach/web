import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MisionDetalleModal } from '../MisionDetalleModal';
import * as misionesService from '@/services/misionesService';
import * as socketClient from '@/lib/socket/client';
import type { MisionDetalleCompleto } from '@/types/misiones';

let socketListeners: Record<string, ((...args: unknown[]) => void)[]> = {};

const mockSocket = {
  connected: true,
  connect: vi.fn(),
  emit: vi.fn(),
  on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
    if (!socketListeners[event]) socketListeners[event] = [];
    socketListeners[event].push(handler);
  }),
  off: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
    if (socketListeners[event]) {
      socketListeners[event] = socketListeners[event].filter((h) => h !== handler);
    }
  }),
};

vi.mock('@/lib/socket/client', () => ({
  getSocket: vi.fn(() => mockSocket),
}));

describe('Componente MisionDetalleModal (HU-17)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    socketListeners = {};
    mockSocket.connected = true;
    vi.mocked(socketClient.getSocket).mockReturnValue(mockSocket as never);
  });

  const mockMision: MisionDetalleCompleto = {
    id: 'm1000000-0000-4000-8000-000000000001',
    codigo: 'MIS-2026-0001',
    titulo: 'Despeje de ramas en tendido eléctrico',
    descripcion: 'Poda de seguridad y retiro de escombros en sector Collico',
    tipoMision: 'ATENCION_CUADRILLA',
    estado: 'EN_CURSO',
    prioridad: 'ALTA',
    justificacionRechazo: null,
    fechaInicio: '2026-10-02T14:30:00.000Z',
    fechaCierre: null,
    creadoEn: '2026-10-02T14:00:00.000Z',
    actualizadoEn: '2026-10-02T15:00:00.000Z',
    creadoPor: {
      id: 'u001',
      nombre: 'Encargado Emergencias',
      email: 'encargado@valdivia.cl',
    },
    encargado: {
      id: 'u001',
      nombre: 'Encargado Emergencias',
      email: 'encargado@valdivia.cl',
    },
    incidente: {
      id: 'i001',
      codigo: 'INC-2026-0042',
      codigoSeguimiento: '82947102',
      tipoAfectacion: 'Caída de Árbol',
      descripcion: 'Árbol sobre cables eléctricos con riesgo inminente',
      direccion: 'Av. Balmaceda 450, Collico',
      latitud: -39.8142,
      longitud: -73.2459,
      estado: 'EN_ATENCION',
      prioridad: 'ALTA',
      requiereAsistenciaSocial: true,
      delegacionNombre: 'Collico',
    },
    prevencion: null,
    cuadrilla: {
      id: 'c001',
      nombre: 'Cuadrilla Alfa 1',
      estado: 'EN_MISION',
      delegacionNombre: 'Collico',
      delegado: {
        id: 'u002',
        nombre: 'Carlos Delegado',
        email: 'carlos@valdivia.cl',
      },
      recursos: [
        {
          id: 'r001',
          nombre: 'Camioneta Toyota Hilux 4x4',
          tipo: 'VEHICULO',
          cantidadAsignada: 1,
        },
        {
          id: 'r002',
          nombre: 'Motosierra Stihl MS 382',
          tipo: 'HERRAMIENTA',
          cantidadAsignada: 2,
        },
      ],
    },
    patrulla: null,
    bitacoraTiempos: [
      {
        hito: 'Misión Creada',
        fecha: '2026-10-02',
        hora: '14:00:00',
        timestamp: '2026-10-02T14:00:00.000Z',
        descripcion: 'Planificación y despacho de la cuadrilla Alfa 1',
      },
    ],
    reportesTerreno: [
      {
        id: 'rep001',
        misionId: 'm1000000-0000-4000-8000-000000000001',
        evaluador: {
          id: 'u002',
          nombre: 'Carlos Delegado',
          email: 'carlos@valdivia.cl',
          rut: '12.345.678-9',
        },
        resumenTecnico: 'Árbol desgajó rama principal sobre cableado.',
        accionesRealizadas: 'Corte con motosierra y despeje de calzada.',
        requiereApoyoAdicional: false,
        danosEstimados: 'Cable alumbrado afectado',
        observaciones: 'Saesa en camino.',
        personasAfectadas: 0,
        estadoTerreno: 'TRABAJANDO',
        adjuntos: [
          {
            id: 'adj001',
            nombreArchivo: 'evidencia_1.jpg',
            url: '/uploads/evidencia_1.jpg',
            tipoMime: 'image/jpeg',
            tamanoBytes: 204800,
            creadoEn: '2026-10-02T14:45:00.000Z',
          },
        ],
        creadoEn: '2026-10-02T14:45:00.000Z',
        actualizadoEn: '2026-10-02T14:45:00.000Z',
      },
    ],
  };

  it('no debe renderizar nada si misionId es null', () => {
    const { container } = render(
      <MisionDetalleModal misionId={null} onCerrar={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('debe mostrar skeleton loader mientras se resuelve la consulta de la misión', () => {
    vi.spyOn(misionesService, 'obtenerDetalleMision').mockImplementation(
      () => new Promise(() => {}) // Promesa pendiente sin resolver
    );

    render(
      <MisionDetalleModal
        misionId="m1000000-0000-4000-8000-000000000001"
        onCerrar={vi.fn()}
      />
    );

    expect(screen.getByTestId('mision-skeleton-loader')).toBeDefined();
    expect(
      screen.getByText('Cargando información detallada de la misión...')
    ).toBeDefined();
  });

  it('debe renderizar la información completa de la misión y sus secciones estructuradas', async () => {
    vi.spyOn(misionesService, 'obtenerDetalleMision').mockResolvedValueOnce({
      exito: true,
      datos: mockMision,
      mensaje: 'Detalle obtenido exitosamente.',
    });

    render(
      <MisionDetalleModal
        misionId="m1000000-0000-4000-8000-000000000001"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('MIS-2026-0001')).toBeDefined();
      expect(
        screen.getByText('Despeje de ramas en tendido eléctrico')
      ).toBeDefined();
    });

    // Validar contexto del incidente y badge FIBE
    expect(screen.getByText(/INC-2026-0042/)).toBeDefined();
    expect(screen.getByText('Caída de Árbol')).toBeDefined();
    expect(screen.getByText('Av. Balmaceda 450, Collico')).toBeDefined();
    expect(screen.getByText(/Requiere Asistencia Social \(FIBE\)/i)).toBeDefined();

    // Validar equipo asignado y recursos
    expect(screen.getByText('Cuadrilla Alfa 1')).toBeDefined();
    expect(screen.getAllByText('Carlos Delegado').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Camioneta Toyota Hilux 4x4')).toBeDefined();
    expect(screen.getByText('Motosierra Stihl MS 382')).toBeDefined();

    // Validar bitácora cronológica
    expect(screen.getByText('Misión Creada')).toBeDefined();
    expect(
      screen.getByText('Planificación y despacho de la cuadrilla Alfa 1')
    ).toBeDefined();

    // Validar reporte de terreno
    expect(
      screen.getByText('Árbol desgajó rama principal sobre cableado.')
    ).toBeDefined();
    expect(
      screen.getByText('Corte con motosierra y despeje de calzada.')
    ).toBeDefined();

    // Validar evidencia adjunta
    expect(screen.getByText('evidencia_1.jpg')).toBeDefined();
  });

  it('debe mostrar banner de alerta cuando la misión está rechazada', async () => {
    const misionRechazada: MisionDetalleCompleto = {
      ...mockMision,
      estado: 'RECHAZADA',
      justificacionRechazo: 'Vía cortada por derrumbe de ladera, sin acceso para el camión.',
    };

    vi.spyOn(misionesService, 'obtenerDetalleMision').mockResolvedValueOnce({
      exito: true,
      datos: misionRechazada,
      mensaje: 'Detalle obtenido.',
    });

    render(
      <MisionDetalleModal
        misionId="m1000000-0000-4000-8000-000000000001"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText('Misión Rechazada por la Unidad en Terreno')
      ).toBeDefined();
      expect(
        screen.getByText(/Vía cortada por derrumbe de ladera/i)
      ).toBeDefined();
    });
  });

  it('debe mostrar mensaje amigable de "Sin reportes aún" cuando no hay reportes de terreno', async () => {
    const misionSinReportes: MisionDetalleCompleto = {
      ...mockMision,
      reportesTerreno: [],
    };

    vi.spyOn(misionesService, 'obtenerDetalleMision').mockResolvedValueOnce({
      exito: true,
      datos: misionSinReportes,
      mensaje: 'Detalle obtenido.',
    });

    render(
      <MisionDetalleModal
        misionId="m1000000-0000-4000-8000-000000000001"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Sin reportes aún')).toBeDefined();
      expect(
        screen.getByText(/La unidad aún no ha emitido informes técnicos en terreno/i)
      ).toBeDefined();
    });
  });

  it('debe mostrar mensaje amigable de "Sin evidencias fotográficas adjuntas" cuando un reporte no tiene fotos', async () => {
    const misionSinAdjuntos: MisionDetalleCompleto = {
      ...mockMision,
      reportesTerreno: [
        {
          ...mockMision.reportesTerreno[0],
          adjuntos: [],
        },
      ],
    };

    vi.spyOn(misionesService, 'obtenerDetalleMision').mockResolvedValueOnce({
      exito: true,
      datos: misionSinAdjuntos,
      mensaje: 'Detalle obtenido.',
    });

    render(
      <MisionDetalleModal
        misionId="m1000000-0000-4000-8000-000000000001"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText('Sin evidencias multimedia adjuntas')
      ).toBeDefined();
    });
  });

  it('debe mostrar pantalla de acceso restringido en caso de error 403 Forbidden', async () => {
    vi.spyOn(misionesService, 'obtenerDetalleMision').mockResolvedValueOnce({
      exito: false,
      codigoError: 403,
      mensaje:
        'No tienes permisos de Encargado o Administrador para visualizar el detalle de esta misión.',
    });

    render(
      <MisionDetalleModal
        misionId="m1000000-0000-4000-8000-000000000001"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Acceso Restringido')).toBeDefined();
      expect(
        screen.getByText(
          /No tienes permisos de Encargado o Administrador para visualizar el detalle de esta misión/i
        )
      ).toBeDefined();
    });
  });

  it('debe mostrar aviso de no encontrada en caso de error 404 Not Found', async () => {
    vi.spyOn(misionesService, 'obtenerDetalleMision').mockResolvedValueOnce({
      exito: false,
      codigoError: 404,
      mensaje: 'La misión solicitada no existe o fue eliminada.',
    });

    render(
      <MisionDetalleModal
        misionId="m1000000-0000-4000-8000-999999999999"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Misión No Encontrada')).toBeDefined();
      expect(
        screen.getByText('La misión solicitada no existe o fue eliminada.')
      ).toBeDefined();
    });
  });

  it('debe llamar a onCerrar al hacer clic en el botón de cerrar de la cabecera o pie', async () => {
    const handleCerrar = vi.fn();

    vi.spyOn(misionesService, 'obtenerDetalleMision').mockResolvedValueOnce({
      exito: true,
      datos: mockMision,
      mensaje: 'Detalle obtenido.',
    });

    render(
      <MisionDetalleModal
        misionId="m1000000-0000-4000-8000-000000000001"
        onCerrar={handleCerrar}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Cerrar detalle de misión')).toBeDefined();
    });

    fireEvent.click(screen.getByLabelText('Cerrar detalle de misión'));
    expect(handleCerrar).toHaveBeenCalledTimes(1);
  });

  it('debe cerrar el modal al presionar la tecla Escape', async () => {
    const handleCerrar = vi.fn();

    vi.spyOn(misionesService, 'obtenerDetalleMision').mockResolvedValueOnce({
      exito: true,
      datos: mockMision,
      mensaje: 'Detalle obtenido.',
    });

    render(
      <MisionDetalleModal
        misionId="m1000000-0000-4000-8000-000000000001"
        onCerrar={handleCerrar}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('MIS-2026-0001')).toBeDefined();
    });

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleCerrar).toHaveBeenCalledTimes(1);
  });

  it('debe abrir y cerrar el visor de evidencias (lightbox) al hacer clic en una miniatura', async () => {
    vi.spyOn(misionesService, 'obtenerDetalleMision').mockResolvedValueOnce({
      exito: true,
      datos: mockMision,
      mensaje: 'Detalle obtenido.',
    });

    render(
      <MisionDetalleModal
        misionId="m1000000-0000-4000-8000-000000000001"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('evidencia_1.jpg')).toBeDefined();
    });

    // Abrir lightbox haciendo clic en la tarjeta de miniatura
    const miniatura = screen.getByTitle(/Ver archivo evidencia_1.jpg/i);
    fireEvent.click(miniatura);

    // Debe mostrarse el lightbox con el aria-label correspondiente
    expect(
      screen.getByLabelText('Visor de evidencia: evidencia_1.jpg')
    ).toBeDefined();

    // Cerrar lightbox con el botón de cerrar visor
    const btnCerrarLightbox = screen.getByLabelText('Cerrar visor de evidencia');
    fireEvent.click(btnCerrarLightbox);

    expect(
      screen.queryByLabelText('Visor de evidencia: evidencia_1.jpg')
    ).toBeNull();
  });

  it('debe renderizar el informe técnico de reclasificación de tipología en terreno y evitar enums crudos', async () => {
    const mockMisionConReclasificacion: MisionDetalleCompleto = {
      ...mockMision,
      id: 'm1000000-0000-4000-8000-000000000770',
      codigo: 'MIS-2026-7700',
      titulo: 'Verificación: Corte de agua potable - INC-592395-562',
      tipoMision: 'VERIFICACION',
      estado: 'EN_CURSO',
      prioridad: 'MEDIA',
      patrulla: {
        id: 'pat-1',
        nombre: 'papappap',
        estado: 'EN_VERIFICACION',
        delegacionNombre: 'Calle Calle',
        lider: {
          id: 'u-lider',
          nombre: 'Cristóbal Felipe Veas Huequemán',
          email: 'patrulla@valdivia.cl',
        },
      },
      cuadrilla: null,
      incidente: {
        id: 'inc-770',
        codigo: 'INC-592395-562',
        codigoSeguimiento: '17780027',
        tipoAfectacion: 'Corte de agua potable',
        descripcion: 'Matriz rota',
        direccion: 'Arauco 642, Villa Coltauco',
        latitud: -39.82,
        longitud: -73.24,
        estado: 'VERIFICANDO',
        prioridad: 'MEDIA',
        requiereAsistenciaSocial: false,
        delegacionNombre: 'Calle Calle',
      },
      bitacoraTiempos: [
        {
          hito: 'CREACION',
          fecha: '2026-11-10',
          hora: '01:03:24',
          timestamp: '2026-11-10T01:03:24.000Z',
          descripcion: 'Misión planificada y registrada en el sistema',
        },
        {
          hito: 'TIPOLOGIA_RECLASIFICADA',
          fecha: '2026-11-10',
          hora: '05:15:00',
          timestamp: '2026-11-10T05:15:00.000Z',
          descripcion:
            'Tipología reclasificada en terreno a: Corte de agua potable. Justificación: Se constata rotura de matriz con suspensión de suministro.',
        },
      ],
      reportesTerreno: [],
    };

    vi.spyOn(misionesService, 'obtenerDetalleMision').mockResolvedValueOnce({
      exito: true,
      datos: mockMisionConReclasificacion,
      mensaje: 'OK',
    });

    render(
      <MisionDetalleModal
        misionId="m1000000-0000-4000-8000-000000000770"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('MIS-2026-7700')).toBeDefined();
    });

    // Validar tipo formateado amigable (no enum VERIFICACION)
    expect(screen.getByText('Verificación en terreno')).toBeDefined();

    // Validar estados formateados en español
    expect(screen.getAllByText('En verificación').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Media').length).toBeGreaterThanOrEqual(1);

    // Validar hito de reclasificación en bitácora
    expect(screen.getByText('Tipología reclasificada en terreno')).toBeDefined();

    // Validar tarjeta destacada de informe técnico en terreno
    const cardInforme = screen.getByTestId('reporte-verificacion-reclasificacion');
    expect(cardInforme).toBeDefined();
    expect(cardInforme.textContent).toContain('Corte de agua potable');
    expect(cardInforme.textContent).toContain('rotura de matriz');
    expect(cardInforme.textContent).toContain('Cristóbal Felipe Veas');

    // Validar interacción de colapsar / desplegar informe de evaluación
    const triggerToggle = screen.getByLabelText(/Colapsar informe de evaluación en terreno/i);
    expect(triggerToggle.getAttribute('aria-expanded')).toBe('true');

    // Al hacer clic, se colapsa
    fireEvent.click(triggerToggle);
    expect(triggerToggle.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText('Se constata rotura de matriz con suspensión de suministro.')).toBeNull();

    // Al volver a hacer clic, se despliega nuevamente
    fireEvent.click(triggerToggle);
    expect(triggerToggle.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('Se constata rotura de matriz con suspensión de suministro.')).toBeDefined();
  });

  it('debe renderizar los reportes de evaluación en terreno con versión (Inicial y Rectificación), comparativa de prioridad sugerida vs confirmada, justificación y desglose demográfico (HU-38)', async () => {
    const mockMisionConEvaluaciones: MisionDetalleCompleto = {
      ...mockMision,
      id: 'm-eval-38',
      codigo: 'MIS-2026-0038',
      tipoMision: 'VERIFICACION',
      prioridad: 'CRITICA',
      reportesTerreno: [
        {
          id: 'rep-38-1',
          misionId: 'm-eval-38',
          versionReporte: 1,
          esRectificacion: false,
          etiquetaReporte: 'Reporte de Evaluación #1 (Inicial)',
          prioridadSugerida: 'MEDIA',
          prioridadAsignada: 'ALTA',
          justificacionPrioridad: 'Crecida rápida del estero cercano a vivienda.',
          detallesEvaluacion: {
            nucleoFamiliarTotal: 3,
            cantidadNinos: 1,
            nivelCompromisoVivienda: 'LEVE',
          },
          evaluador: {
            id: 'u002',
            nombre: 'Patrullero Terreno',
            email: 'patrulla@valdivia.cl',
            rut: '15.222.333-4',
          },
          resumenTecnico: 'Primer reporte de evaluación en terreno.',
          accionesRealizadas: 'Inspección perimetral.',
          requiereApoyoAdicional: false,
          danosEstimados: 'Humedad en patio.',
          observaciones: 'Se mantiene monitoreo.',
          personasAfectadas: 3,
          estadoTerreno: 'EN_PROGRESO',
          adjuntos: [],
          creadoEn: '2026-11-11T10:00:00.000Z',
          actualizadoEn: '2026-11-11T10:00:00.000Z',
        },
        {
          id: 'rep-38-2',
          misionId: 'm-eval-38',
          versionReporte: 2,
          esRectificacion: true,
          etiquetaReporte: 'Reporte de Evaluación #2 (Rectificación)',
          prioridadSugerida: 'ALTA',
          prioridadAsignada: 'CRITICA',
          justificacionPrioridad: 'El agua ingresó a la vivienda donde reside persona con discapacidad y niños.',
          detallesEvaluacion: {
            nucleoFamiliarTotal: 5,
            familiasAfectadas: 1,
            cantidadNinos: 2,
            cantidadAdultosMayores: 1,
            personasDiscapacitadas: 1,
            mascotasAfectadas: 3,
            viviendasAfectadas: 1,
            nivelCompromisoVivienda: 'GRAVE_INHABITABLE',
            requiereEvacuacion: true,
            requiereAsistenciaSocial: true,
            riesgosActivos: {
              riesgoElectrico: true,
              riesgoEstructural: true,
            },
            detallesAdicionales: 'Adulto mayor requiere traslado asistido inmediato.',
          },
          evaluador: {
            id: 'u002',
            nombre: 'Patrullero Terreno',
            email: 'patrulla@valdivia.cl',
            rut: '15.222.333-4',
          },
          resumenTecnico: 'Rectificación por agravamiento de inundación.',
          accionesRealizadas: 'Corte de suministro eléctrico.',
          requiereApoyoAdicional: true,
          danosEstimados: 'Vivienda anegada en primer nivel.',
          observaciones: 'Adulto mayor requiere traslado asistido inmediato.',
          personasAfectadas: 5,
          estadoTerreno: 'TRABAJANDO',
          adjuntos: [],
          creadoEn: '2026-11-11T10:25:00.000Z',
          actualizadoEn: '2026-11-11T10:25:00.000Z',
        },
      ],
    };

    vi.spyOn(misionesService, 'obtenerDetalleMision').mockResolvedValueOnce({
      exito: true,
      datos: mockMisionConEvaluaciones,
      mensaje: 'OK',
    });

    render(
      <MisionDetalleModal
        misionId="m-eval-38"
        enfocarReportes={true}
        reporteDestacadoId="rep-38-2"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('MIS-2026-0038')).toBeDefined();
    });

    // Verificar etiquetas de versión e indicador de múltiples versiones
    expect(screen.getByText('2 versiones registradas')).toBeDefined();
    expect(screen.getByText('Reporte de Evaluación #2 (Rectificación)')).toBeDefined();
    expect(screen.getByText('Reporte de Evaluación #1 (Inicial)')).toBeDefined();
    expect(screen.getByText('Vigente')).toBeDefined();
    expect(screen.getByText('Histórico')).toBeDefined();

    // Verificar comparativa de prioridad y justificación en el reporte #2
    const bloquePrioridad2 = screen.getByTestId('comparativa-prioridad-rep-38-2');
    expect(bloquePrioridad2.textContent).toContain('Alta');
    expect(bloquePrioridad2.textContent).toContain('Crítica (Ajustada manualmente)');
    expect(bloquePrioridad2.textContent).toContain(
      'El agua ingresó a la vivienda donde reside persona con discapacidad y niños.'
    );

    // Verificar desglose demográfico del formulario en terreno
    const desglose2 = screen.getByTestId('desglose-evaluacion-terreno-rep-38-2');
    expect(desglose2.textContent).toContain('5 (1 familia)');
    expect(desglose2.textContent).toContain('Grave / Inhabitable (1 vivienda)');
    expect(desglose2.textContent).toContain('Requiere Evacuación');
    expect(desglose2.textContent).not.toContain('Requiere Ficha FIBE');
    expect(desglose2.textContent).toContain('Riesgo Eléctrico');
    expect(desglose2.textContent).toContain('Riesgo Estructural');

    // Verificar que al abrir enfocado en rep-38-2, el reporte #1 (rep-38-1) está colapsado por defecto
    expect(screen.queryByTestId('comparativa-prioridad-rep-38-1')).toBeNull();
    const toggleRep1 = screen.getByTestId('toggle-reporte-rep-38-1');
    expect(toggleRep1.getAttribute('aria-expanded')).toBe('false');

    // Al hacer clic en el encabezado del reporte #1, se despliega su contenido
    fireEvent.click(toggleRep1);
    expect(toggleRep1.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByTestId('comparativa-prioridad-rep-38-1')).toBeDefined();
  });

  it('debe renderizar el desglose estructurado de múltiples familias con referencias, severidad y FIBE', async () => {
    const misionConMultiplesFamilias: MisionDetalleCompleto = {
      ...mockMision,
      tipoMision: 'VERIFICACION',
      reportesTerreno: [
        {
          id: 'rep-familias-multiples',
          misionId: 'mis-mock-01',
          versionReporte: 1,
          esRectificacion: false,
          prioridadSugerida: 'ALTA',
          prioridadAsignada: 'CRITICA',
          justificacionPrioridad: 'Dos viviendas anegadas con familias en riesgo.',
          evaluador: {
            id: 'eval-01',
            nombre: 'Patrullero Soto',
            email: 'soto@valdivia.cl',
            rut: '12.345.678-9',
          },
          resumenTecnico: 'Constatación de dos viviendas en lote común.',
          accionesRealizadas: 'Demarcación y evaluación preliminar FIBE.',
          requiereApoyoAdicional: true,
          danosEstimados: 'Moderados',
          observaciones: 'Coordinar con asistente social.',
          personasAfectadas: 7,
          estadoTerreno: 'EN_PROCESO',
          adjuntos: [],
          creadoEn: '2026-11-12T10:00:00Z',
          actualizadoEn: '2026-11-12T10:00:00Z',
          detallesEvaluacion: {
            familias: [
              {
                id: 'fam-1',
                referencia: 'Familia Muñoz - Casa Principal',
                nucleoFamiliarTotal: 4,
                cantidadNinos: 2,
                cantidadAdultosMayores: 1,
                personasDiscapacitadas: 0,
                mascotasAfectadas: 1,
                nivelCompromisoVivienda: 'GRAVE_INHABITABLE',
                requiereAsistenciaSocial: true,
              },
              {
                id: 'fam-2',
                referencia: 'Familia Díaz - Cabaña Interior',
                nucleoFamiliarTotal: 3,
                cantidadNinos: 0,
                cantidadAdultosMayores: 0,
                personasDiscapacitadas: 1,
                mascotasAfectadas: 2,
                nivelCompromisoVivienda: 'MODERADO_PARCIAL',
                requiereAsistenciaSocial: false,
              },
            ],
            nucleoFamiliarTotal: 7,
            familiasAfectadas: 2,
            viviendasAfectadas: 2,
            nivelCompromisoVivienda: 'GRAVE_INHABITABLE',
            requiereAsistenciaSocial: true,
            riesgosActivos: {
              riesgoElectrico: true,
            },
          },
        },
      ],
    };

    vi.spyOn(misionesService, 'obtenerDetalleMision').mockResolvedValueOnce({
      exito: true,
      datos: misionConMultiplesFamilias,
      mensaje: 'OK',
    });

    render(
      <MisionDetalleModal
        misionId="mis-mock-01"
        onCerrar={vi.fn()}
      />
    );

    // Esperar a que el modal cargue y verificar chip de cantidad de hogares en la cabecera del reporte
    await waitFor(() => {
      expect(screen.getByText('2 hogares')).toBeDefined();
    });

    // Verificar presencia del contenedor de listado de familias
    const contenedorFamilias = screen.getByTestId('familias-listado-rep-familias-multiples');
    expect(contenedorFamilias).toBeDefined();

    // Verificar ítems de familias individuales con sus referencias
    const itemFam1 = screen.getByTestId('familia-item-rep-familias-multiples-0');
    expect(itemFam1.textContent).toContain('Familia Muñoz - Casa Principal');
    expect(itemFam1.textContent).toContain('Integrantes: 4 pers.');
    expect(itemFam1.textContent).toContain('Niños/Adolescentes: 2');
    expect(itemFam1.textContent).toContain('Adultos mayores: 1');
    expect(itemFam1.textContent).toContain('Grave / Inhabitable');
    expect(itemFam1.textContent).not.toContain('Requiere FIBE');

    const itemFam2 = screen.getByTestId('familia-item-rep-familias-multiples-1');
    expect(itemFam2.textContent).toContain('Familia Díaz - Cabaña Interior');
    expect(itemFam2.textContent).toContain('Integrantes: 3 pers.');
    expect(itemFam2.textContent).toContain('Discapacidad: 1');
    expect(itemFam2.textContent).toContain('Mascotas: 2');
    expect(itemFam2.textContent).toContain('Daño moderado (Parcial)');

    // Verificar consolidado general
    const desgloseGeneral = screen.getByTestId('desglose-evaluacion-terreno-rep-familias-multiples');
    expect(desgloseGeneral.textContent).toContain('Consolidado General de Afectación');
    expect(desgloseGeneral.textContent).toContain('7 (2 familias)');
  });

  it('indica explícitamente cuando la tipología no fue modificada en Diagnóstico Técnico y Bitácora Cronológica', async () => {
    const mockMisionRatificada: MisionDetalleCompleto = {
      ...mockMision,
      id: 'm-rat-1',
      codigo: 'MIS-2026-0999',
      tipoMision: 'VERIFICACION',
      incidente: {
        id: 'inc-999',
        codigo: 'INC-948888-846',
        tipoAfectacion: 'Deslizamiento',
        estado: 'VERIFICANDO',
        prioridad: 'MEDIA',
        direccion: 'Sector Norte',
      },
      bitacoraTiempos: [
        {
          id: 'hito-rat-1',
          hito: 'TIPOLOGIA_RECLASIFICADA',
          descripcion:
            'Tipología reclasificada en terreno a: Deslizamiento. Justificación: Tipología constatada y ratificada en terreno sin variaciones.',
          fecha: '2026-11-13',
          hora: '15:21:38',
          timestamp: '2026-11-13T15:21:38Z',
          metadatos: {
            tipoAnterior: 'Deslizamiento',
            tipoNuevo: 'Deslizamiento',
          },
        },
      ],
    };

    vi.spyOn(misionesService, 'obtenerDetalleMision').mockResolvedValueOnce({
      exito: true,
      datos: mockMisionRatificada,
      mensaje: 'OK',
    });

    render(
      <MisionDetalleModal misionId="m-rat-1" onCerrar={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('MIS-2026-0999')).toBeDefined();
    });

    // Imagen 3: Diagnóstico Técnico y Tipología Constatada sin flecha X → X
    const cardInforme = screen.getByTestId('reporte-verificacion-reclasificacion');
    expect(cardInforme.textContent).toContain('Deslizamiento (confirmada sin modificaciones por la patrulla)');
    expect(cardInforme.textContent).not.toContain('Deslizamiento → Deslizamiento');

    // Imagen 4: Bitácora Cronológica debe indicar que no hubo cambios
    expect(screen.getByText('Tipología constatada en terreno (sin cambios)')).toBeDefined();
    expect(
      screen.getByText(
        /Tipología confirmada en terreno sin modificaciones: Deslizamiento\./i
      )
    ).toBeDefined();
  });

  it('distingue reporte VERIFICACION_CIERRE con dictamen REQUIERE_CUADRILLA, comparativa de personas afectadas, FIBE y sección HU-43 (H39)', async () => {
    const misionCierreCuadrilla: MisionDetalleCompleto = {
      ...mockMision,
      id: 'm-cierre-39',
      codigo: 'MIS-2026-0039',
      tipoMision: 'VERIFICACION',
      estado: 'COMPLETADA',
      reportesTerreno: [
        {
          id: 'rep-prio-base',
          misionId: 'm-cierre-39',
          tipoReporte: 'EVALUACION_PRIORIDAD',
          versionReporte: 1,
          esRectificacion: false,
          etiquetaReporte: 'Reporte de Evaluación #1 (Inicial)',
          prioridadSugerida: 'MEDIA',
          prioridadAsignada: 'ALTA',
          justificacionPrioridad: 'Riesgo de anegamiento.',
          detallesEvaluacion: {
            nucleoFamiliarTotal: 4,
            familiasAfectadas: 1,
            requiereAsistenciaSocial: true,
          },
          evaluador: {
            id: 'u002',
            nombre: 'Patrullero Terreno',
            email: 'patrulla@valdivia.cl',
            rut: '15.222.333-4',
          },
          resumenTecnico: 'Evaluación inicial.',
          accionesRealizadas: null,
          requiereApoyoAdicional: false,
          danosEstimados: null,
          observaciones: null,
          personasAfectadas: 4,
          estadoTerreno: 'EN_PROGRESO',
          adjuntos: [],
          creadoEn: '2026-11-15T10:00:00Z',
          actualizadoEn: '2026-11-15T10:00:00Z',
        },
        {
          id: 'rep-cierre-cuad',
          misionId: 'm-cierre-39',
          tipoReporte: 'VERIFICACION_CIERRE',
          dictamen: 'REQUIERE_CUADRILLA',
          requiereAsistenciaSocial: true,
          etiquetaReporte: 'Informe de Verificación y Cierre #1',
          evaluador: {
            id: 'u002',
            nombre: 'Patrullero Terreno',
            email: 'patrulla@valdivia.cl',
            rut: '15.222.333-4',
          },
          resumenTecnico: 'Se constata árbol caído sobre cerco perimetral y acceso bloqueado.',
          accionesRealizadas: null,
          requiereApoyoAdicional: false,
          danosEstimados: 'Cerco dañado en 6 metros',
          observaciones: 'Se requiere motosierrista y retiro de ramas.',
          personasAfectadas: 6,
          estadoTerreno: 'INUNDADO_ACCESIBLE',
          adjuntos: [],
          creadoEn: '2026-11-15T10:30:00Z',
          actualizadoEn: '2026-11-15T10:30:00Z',
        },
      ],
    };

    vi.spyOn(misionesService, 'obtenerDetalleMision').mockResolvedValueOnce({
      exito: true,
      datos: misionCierreCuadrilla,
      mensaje: 'OK',
    });

    render(<MisionDetalleModal misionId="m-cierre-39" onCerrar={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('reporte-verificacion-cierre-rep-cierre-cuad')).toBeDefined();
    });

    const cardCierre = screen.getByTestId('reporte-verificacion-cierre-rep-cierre-cuad');
    expect(cardCierre.textContent).toContain('Informe de Verificación y Cierre #1');
    expect(screen.getByTestId('badge-dictamen-rep-cierre-cuad').textContent).toContain(
      'Dictamen: Requiere Cuadrilla'
    );
    expect(cardCierre.textContent).toContain('Inundado accesible');
    expect(screen.getByTestId('badge-personas-modificadas').textContent).toContain(
      'Modificado respecto a prioridad (Antes: 4)'
    );
    expect(screen.getByTestId('chip-fibe-verificacion-cierre').textContent).toContain(
      'Requiere Ficha FIBE'
    );
    expect(screen.getByTestId('seccion-evidencias-h43').textContent).toContain(
      'Sin evidencias multimedia adjuntas'
    );
  });

  it('distingue reporte VERIFICACION_CIERRE con dictamen NO_ABORDABLE mostrando motivoNoAbordable y personas rescatadas sin cambios (H39)', async () => {
    const misionCierreNoAbordable: MisionDetalleCompleto = {
      ...mockMision,
      id: 'm-cierre-noab',
      codigo: 'MIS-2026-0086',
      tipoMision: 'VERIFICACION',
      estado: 'COMPLETADA',
      reportesTerreno: [
        {
          id: 'rep-prio-2',
          misionId: 'm-cierre-noab',
          tipoReporte: 'EVALUACION_PRIORIDAD',
          versionReporte: 1,
          esRectificacion: false,
          evaluador: {
            id: 'u002',
            nombre: 'Patrullero Terreno',
            email: 'patrulla@valdivia.cl',
          },
          resumenTecnico: 'Evaluación inicial.',
          accionesRealizadas: null,
          requiereApoyoAdicional: false,
          danosEstimados: null,
          observaciones: null,
          personasAfectadas: 2,
          estadoTerreno: 'SIN_DANO',
          adjuntos: [],
          creadoEn: '2026-11-15T11:00:00Z',
          actualizadoEn: '2026-11-15T11:00:00Z',
        },
        {
          id: 'rep-cierre-noab',
          misionId: 'm-cierre-noab',
          tipoReporte: 'VERIFICACION_CIERRE',
          dictamen: 'NO_ABORDABLE',
          motivoNoAbordable: 'Faja fiscal externa de concesionaria Vial, fuera de competencia municipal.',
          requiereAsistenciaSocial: false,
          etiquetaReporte: 'Informe de Cierre — No Abordable',
          evaluador: {
            id: 'u002',
            nombre: 'Patrullero Terreno',
            email: 'patrulla@valdivia.cl',
          },
          resumenTecnico: 'Siniestro ubicado en faja fiscal de ruta concesionada.',
          accionesRealizadas: null,
          requiereApoyoAdicional: false,
          danosEstimados: 'Sin daños municipales',
          observaciones: 'Se informa al Encargado para cierre definitivo.',
          personasAfectadas: 2,
          estadoTerreno: 'FAJA_FISCAL_EXTERNA',
          adjuntos: [],
          creadoEn: '2026-11-15T11:20:00Z',
          actualizadoEn: '2026-11-15T11:20:00Z',
        },
      ],
    };

    vi.spyOn(misionesService, 'obtenerDetalleMision').mockResolvedValueOnce({
      exito: true,
      datos: misionCierreNoAbordable,
      mensaje: 'OK',
    });

    render(<MisionDetalleModal misionId="m-cierre-noab" onCerrar={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('reporte-verificacion-cierre-rep-cierre-noab')).toBeDefined();
    });

    const cardNoAb = screen.getByTestId('reporte-verificacion-cierre-rep-cierre-noab');
    expect(screen.getByTestId('badge-dictamen-rep-cierre-noab').textContent).toContain(
      'Dictamen: No Abordable'
    );
    expect(screen.getByTestId('motivo-no-abordable-rep-cierre-noab').textContent).toContain(
      'Faja fiscal externa de concesionaria Vial, fuera de competencia municipal.'
    );
    expect(cardNoAb.textContent).toContain('(Rescatado del reporte de prioridad sin cambios)');
    expect(screen.getByTestId('chip-fibe-verificacion-cierre').textContent).toContain(
      'No requiere Ficha FIBE'
    );
  });

  it('formatea bitácora cronológica con textos amigables sin enums crudos ni prefijos duplicados', async () => {
    const mockMisionBitacoraAmigable: MisionDetalleCompleto = {
      ...mockMision,
      id: 'm-bitacora-amigable',
      codigo: 'MIS-2026-0777',
      bitacoraTiempos: [
        {
          id: 'h-1',
          hito: 'MISION_DESPACHADA',
          descripcion: 'Misión de verificación asignada y despachada a la patrulla Patrulla Lenteja.',
          fecha: '2026-11-16',
          hora: '21:30:15',
          timestamp: '2026-11-16T21:30:15Z',
        },
        {
          id: 'h-2',
          hito: 'PRIORIDAD_ASIGNADA',
          descripcion: 'Reporte de evaluación #1: Prioridad asignada en terreno a BAJA (Sugerida: CRITICA). Justificación: Ajuste presencial.',
          fecha: '2026-11-16',
          hora: '21:32:56',
          timestamp: '2026-11-16T21:32:56Z',
        },
        {
          id: 'h-3',
          hito: 'VERIFICACION_COMPLETADA',
          descripcion: 'Informe técnico enviado y misión cerrada. Dictamen: NO_ABORDABLE. Motivo: Predio privado cerrado.',
          fecha: '2026-11-16',
          hora: '23:30:33',
          timestamp: '2026-11-16T23:30:33Z',
        },
      ],
    };

    vi.spyOn(misionesService, 'obtenerDetalleMision').mockResolvedValueOnce({
      exito: true,
      datos: mockMisionBitacoraAmigable,
      mensaje: 'OK',
    });

    render(<MisionDetalleModal misionId="m-bitacora-amigable" onCerrar={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Verificación completada')).toBeDefined();
    });

    expect(
      screen.getByText('Misión de verificación asignada y despachada a la Patrulla Lenteja.')
    ).toBeDefined();
    expect(
      screen.getByText(
        'Reporte de evaluación #1: Prioridad asignada en terreno a Baja (Sugerida: Crítica). Justificación: Ajuste presencial.'
      )
    ).toBeDefined();
    expect(
      screen.getByText(
        'Informe técnico enviado y misión cerrada. Dictamen: No Abordable. Motivo: Predio privado cerrado.'
      )
    ).toBeDefined();
  });

  it('HU-43: debe actualizar la galería inmediatamente al recibir evento WebSocket adjunto:creado', async () => {
    vi.spyOn(misionesService, 'obtenerDetalleMision').mockResolvedValueOnce({
      exito: true,
      datos: mockMision,
      mensaje: 'Detalle obtenido.',
    });

    render(
      <MisionDetalleModal
        misionId="m1000000-0000-4000-8000-000000000001"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('evidencia_1.jpg')).toBeDefined();
    });

    const handler = socketListeners['adjunto:creado']?.[0];
    expect(handler).toBeDefined();

    act(() => {
      handler?.({
        id: 'adj-ws-001',
        nombreArchivo: 'acta_terreno.pdf',
        url: '/uploads/evidencia/acta_terreno.pdf',
        tipoMime: 'application/pdf',
        tamanoBytes: 512000,
        incidenteId: 'i001',
        reporteTerrenoId: 'rep001',
        creadoEn: '2026-10-02T15:10:00.000Z',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('acta_terreno.pdf')).toBeDefined();
    });
    expect(screen.getByText('PDF')).toBeDefined();
  });

  it('HU-43: debe renderizar visor de video (<video>) y vista previa PDF (<iframe>) en el lightbox', async () => {
    const misionConMultimedia: MisionDetalleCompleto = {
      ...mockMision,
      reportesTerreno: [
        {
          ...mockMision.reportesTerreno[0],
          adjuntos: [
            {
              id: 'adj-vid-1',
              nombreArchivo: 'inspeccion.mp4',
              url: '/uploads/evidencia/inspeccion.mp4',
              tipoMime: 'video/mp4',
              tamanoBytes: 2097152,
              creadoEn: '2026-10-02T14:50:00.000Z',
            },
            {
              id: 'adj-pdf-1',
              nombreArchivo: 'informe.pdf',
              url: '/uploads/evidencia/informe.pdf',
              tipoMime: 'application/pdf',
              tamanoBytes: 102400,
              creadoEn: '2026-10-02T14:55:00.000Z',
            },
          ],
        },
      ],
    };

    vi.spyOn(misionesService, 'obtenerDetalleMision').mockResolvedValueOnce({
      exito: true,
      datos: misionConMultimedia,
      mensaje: 'Detalle obtenido.',
    });

    render(
      <MisionDetalleModal
        misionId="m1000000-0000-4000-8000-000000000001"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('inspeccion.mp4')).toBeDefined();
      expect(screen.getByText('informe.pdf')).toBeDefined();
    });

    expect(screen.getByText('VIDEO')).toBeDefined();
    expect(screen.getByText('PDF')).toBeDefined();

    fireEvent.click(screen.getByTitle(/Ver archivo inspeccion\.mp4/i));
    const videoEl = screen.getByLabelText('inspeccion.mp4');
    expect(videoEl.tagName).toBe('VIDEO');
    expect(videoEl.getAttribute('controls')).not.toBeNull();

    fireEvent.click(screen.getByLabelText('Cerrar visor de evidencia'));
    fireEvent.click(screen.getByTitle(/Ver archivo informe\.pdf/i));
    const iframeEl = screen.getByTitle('informe.pdf');
    expect(iframeEl.tagName).toBe('IFRAME');
    expect(screen.getByText('Descargar PDF')).toBeDefined();
  });

  it('BUG-H37-WEB-05: selecciona el hito TIPOLOGIA_RECLASIFICADA más reciente y extrae justificaciones multilínea con saltos de línea', async () => {
    const mockMisionDosReclasificaciones: MisionDetalleCompleto = {
      ...mockMision,
      id: 'm1000000-0000-4000-8000-000000000771',
      codigo: 'MIS-2026-7701',
      tipoMision: 'VERIFICACION',
      estado: 'EN_CURSO',
      prioridad: 'ALTA',
      patrulla: {
        id: 'pat-1',
        nombre: 'Patrulla Norte',
        estado: 'EN_VERIFICACION',
        delegacionNombre: 'Las Ánimas',
        lider: {
          id: 'u-lider',
          nombre: 'Inspector Terreno',
          email: 'inspector@valdivia.cl',
        },
      },
      cuadrilla: null,
      incidente: {
        id: 'inc-771',
        codigo: 'INC-2026-0771',
        codigoSeguimiento: '77100001',
        tipoAfectacion: 'Inundación',
        descripcion: 'Desborde constatado',
        direccion: 'Av. España 123',
        latitud: -39.81,
        longitud: -73.24,
        estado: 'VERIFICANDO',
        prioridad: 'ALTA',
        requiereAsistenciaSocial: false,
        delegacionNombre: 'Las Ánimas',
      },
      bitacoraTiempos: [
        {
          hito: 'TIPOLOGIA_RECLASIFICADA',
          fecha: '2026-11-10',
          hora: '05:00:00',
          timestamp: '2026-11-10T05:00:00.000Z',
          descripcion:
            'Tipología reclasificada en terreno a: Anegamiento. Justificación: Justificación antigua descartada.',
        },
        {
          hito: 'TIPOLOGIA_RECLASIFICADA',
          fecha: '2026-11-10',
          hora: '05:25:00',
          timestamp: '2026-11-10T05:25:00.000Z',
          descripcion:
            'Tipología reclasificada en terreno a: Inundación. Justificación: Primera línea de constatación.\nSegunda línea con detalle de anegamiento.',
        },
      ],
      reportesTerreno: [],
    };

    vi.spyOn(misionesService, 'obtenerDetalleMision').mockResolvedValueOnce({
      exito: true,
      datos: mockMisionDosReclasificaciones,
      mensaje: 'OK',
    });

    render(
      <MisionDetalleModal
        misionId="m1000000-0000-4000-8000-000000000771"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('MIS-2026-7701')).toBeDefined();
    });

    const cardInforme = screen.getByTestId('reporte-verificacion-reclasificacion');
    expect(cardInforme.textContent).toContain('Primera línea de constatación.');
    expect(cardInforme.textContent).toContain('Segunda línea con detalle de anegamiento.');
    expect(cardInforme.textContent).not.toContain('Justificación antigua descartada');
  });

  it('BUG-H41-WEB-02: refresca silenciosamente la misión abierta al recibir mision:rechazada por WebSocket', async () => {
    const listeners: Record<string, ((...args: unknown[]) => void)[]> = {};
    const mockSocketLocal = {
      connected: true,
      on: vi.fn((event: string, cb: (...args: unknown[]) => void) => {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push(cb);
        return mockSocketLocal;
      }),
      off: vi.fn((event: string, cb: (...args: unknown[]) => void) => {
        if (listeners[event]) {
          listeners[event] = listeners[event].filter((h) => h !== cb);
        }
        return mockSocketLocal;
      }),
      emit: vi.fn(),
    };
    vi.mocked(socketClient.getSocket).mockReturnValue(mockSocketLocal as never);

    const misionRechazadaActualizada: MisionDetalleCompleto = {
      ...mockMision,
      estado: 'RECHAZADA',
      justificacionRechazo: 'Falla hidráulica crítica en ruta.',
    };

    vi.spyOn(misionesService, 'obtenerDetalleMision')
      .mockResolvedValueOnce({
        exito: true,
        datos: mockMision,
        mensaje: 'OK',
      })
      .mockResolvedValueOnce({
        exito: true,
        datos: misionRechazadaActualizada,
        mensaje: 'OK',
      });

    render(<MisionDetalleModal misionId={mockMision.id} onCerrar={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('MIS-2026-0001')).toBeDefined();
    });

    await act(async () => {
      listeners['mision:rechazada']?.forEach((cb) =>
        cb({
          misionId: mockMision.id,
          codigo: 'MIS-2026-0001',
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Falla hidráulica crítica en ruta.')).toBeDefined();
    });
    expect(screen.queryByTestId('mision-skeleton-loader')).toBeNull();
  });

  it('BUG-H43-WEB-01: al recibir adjunto:creado con incidenteId coincidente sin reporteTerrenoId recarga y muestra adjuntos directos', async () => {
    const nuevoAdjuntoDirecto = {
      id: 'adj-directo-1',
      incidenteId: mockMision.incidente?.id ?? 'i001',
      reporteTerrenoId: null,
      misionId: mockMision.id,
      nombreArchivo: 'evidencia-directa-mision.jpg',
      url: '/uploads/evidencia/evidencia-directa-mision.jpg',
      tipoMime: 'image/jpeg',
      tamanoBytes: 3100,
      creadoEn: '2026-10-02T15:10:00.000Z',
    };

    const obtenerSpy = vi
      .spyOn(misionesService, 'obtenerDetalleMision')
      .mockResolvedValueOnce({
        exito: true,
        datos: mockMision,
        mensaje: 'OK',
      })
      .mockResolvedValueOnce({
        exito: true,
        datos: {
          ...mockMision,
          adjuntos: [nuevoAdjuntoDirecto],
        },
        mensaje: 'OK',
      });

    render(<MisionDetalleModal misionId={mockMision.id} onCerrar={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('MIS-2026-0001')).toBeDefined();
    });

    await act(async () => {
      socketListeners['adjunto:creado']?.forEach((cb) =>
        cb({ datos: nuevoAdjuntoDirecto })
      );
    });

    await waitFor(() => {
      expect(screen.getByText('evidencia-directa-mision.jpg')).toBeDefined();
    });
    expect(obtenerSpy).toHaveBeenCalledTimes(2);
    expect(
      screen.getByLabelText('Evidencias directas de la misión')
    ).toBeDefined();
  });

  it('BUG-H43-WEB-04: presionar Escape con el Lightbox abierto cierra solo el Lightbox y mantiene abierto el Modal', async () => {
    const onCerrar = vi.fn();
    vi.spyOn(misionesService, 'obtenerDetalleMision').mockResolvedValueOnce({
      exito: true,
      datos: {
        ...mockMision,
        adjuntos: [
          {
            id: 'adj-modal-esc',
            nombreArchivo: 'foto-modal-esc.jpg',
            url: '/uploads/evidencia/foto-modal-esc.jpg',
            tipoMime: 'image/jpeg',
            tamanoBytes: 1500,
            creadoEn: '2026-10-02T15:15:00.000Z',
          },
        ],
      },
      mensaje: 'OK',
    });

    render(<MisionDetalleModal misionId={mockMision.id} onCerrar={onCerrar} />);

    await waitFor(() => {
      expect(screen.getByText('foto-modal-esc.jpg')).toBeDefined();
    });

    fireEvent.click(screen.getByTitle(/Ver archivo foto-modal-esc\.jpg/i));

    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: /Visor de evidencia: foto-modal-esc\.jpg/i })
      ).toBeDefined();
    });

    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: /Visor de evidencia: foto-modal-esc\.jpg/i })
      ).toBeNull();
    });
    expect(onCerrar).not.toHaveBeenCalled();
  });
});
