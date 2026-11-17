import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MisionDetalleModal } from '../MisionDetalleModal';
import * as misionesService from '@/services/misionesService';
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
  getSocket: () => mockSocket,
}));

describe('Componente MisionDetalleModal (HU-17)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    socketListeners = {};
    mockSocket.connected = true;
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

    // Abrir video en lightbox
    fireEvent.click(screen.getByTitle(/Ver archivo inspeccion\.mp4/i));
    const videoEl = screen.getByLabelText('inspeccion.mp4');
    expect(videoEl.tagName).toBe('VIDEO');
    expect(videoEl.getAttribute('controls')).not.toBeNull();

    // Cerrar y abrir PDF en lightbox
    fireEvent.click(screen.getByLabelText('Cerrar visor de evidencia'));
    fireEvent.click(screen.getByTitle(/Ver archivo informe\.pdf/i));
    const iframeEl = screen.getByTitle('informe.pdf');
    expect(iframeEl.tagName).toBe('IFRAME');
    expect(screen.getByText('Descargar PDF')).toBeDefined();
  });
});
