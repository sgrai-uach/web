import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MisionDetalleModal } from '../MisionDetalleModal';
import * as misionesService from '@/services/misionesService';
import type { MisionDetalleCompleto } from '@/types/misiones';

describe('Componente MisionDetalleModal (HU-17)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
        screen.getByText('Sin evidencias fotográficas adjuntas')
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
    expect(desglose2.textContent).toContain('Requiere Ficha FIBE');
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
    expect(itemFam1.textContent).toContain('Requiere FIBE');

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
});
