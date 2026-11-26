import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import { IncidenteDetalleDrawer } from '../IncidenteDetalleDrawer';
import * as incidentesService from '@/services/incidentesService';
import * as misionesService from '@/services/misionesService';
import { cuadrillasService } from '@/services/cuadrillasService';
import { AuthContext } from '@/context/AuthContext';
import type { IncidenteDetalle } from '@/services/incidentesService';
import type { MisionDetalleCompleto } from '@/types/misiones';
import {
  clearTrazabilidadCache,
  getIncidentePorMision,
  getTrazabilidadEstado,
  getTrazabilidadPorIncidente,
  setTrazabilidadEstado,
} from '@/lib/socket/trazabilidadStore';

let socketListeners: Record<string, ((...args: unknown[]) => void)[]> = {};
const mockSocket = {
  connected: true,
  connect: vi.fn(),
  emit: vi.fn(),
  on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
    if (!socketListeners[event]) socketListeners[event] = [];
    socketListeners[event].push(handler);
    return mockSocket;
  }),
  off: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
    if (socketListeners[event]) {
      socketListeners[event] = socketListeners[event].filter((h) => h !== handler);
    }
    return mockSocket;
  }),
};

vi.mock('@/lib/socket/client', () => ({
  getSocket: () => mockSocket,
}));

vi.mock('@/hooks/usePuedeAsignarMision', () => ({
  usePuedeAsignarMision: () => true,
}));

vi.mock('@/components/ui/Toast', () => {
  const toastMock = {
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showInfo: vi.fn(),
    showWarning: vi.fn(),
  };
  return {
    useToast: () => toastMock,
    useOptionalToast: () => toastMock,
  };
});

describe('Componente IncidenteDetalleDrawer e integración HU-17', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearTrazabilidadCache();
    socketListeners = {};
    mockSocket.connected = true;
  });

  const mockDetalleIncidente: IncidenteDetalle = {
    id: 'i1000000-0000-4000-8000-000000000001',
    codigo: 'INC-2026-0042',
    codigoSeguimiento: '82947102',
    tipoAfectacion: 'Caída de Árbol',
    descripcion: 'Árbol sobre cableado eléctrico',
    direccion: 'Av. Balmaceda 450',
    latitud: -39.8142,
    longitud: -73.2459,
    estado: 'EN_ATENCION',
    prioridad: 'ALTA',
    requiereAsistenciaSocial: false,
    fuenteOrigen: 'CHATBOT',
    informante: {
      nombre: 'Pedro Informante',
      telefono: '+56911223344',
      email: 'pedro@gmail.com',
    },
    delegacion: {
      id: 'del-01',
      nombre: 'Collico',
    },
    misiones: [
      {
        id: 'm1000000-0000-4000-8000-000000000001',
        codigo: 'MIS-2026-0001',
        titulo: 'Despeje de cables',
        descripcion: 'Poda urgente',
        tipoMision: 'ATENCION_CUADRILLA',
        estado: 'EN_CURSO',
        prioridad: 'ALTA',
        justificacionRechazo: null,
        patrulla: null,
        cuadrilla: {
          id: 'c1',
          nombre: 'Cuadrilla Alfa 1',
          estado: 'EN_MISION',
        },
        fechaInicio: '2026-10-02T14:00:00Z',
        fechaCierre: null,
        creadoEn: '2026-10-02T13:30:00Z',
      },
    ],
    recursosAsociados: [],
    creadoEn: '2026-10-02T13:00:00Z',
    actualizadoEn: '2026-10-02T14:00:00Z',
  };

  const mockMisionDetalle: MisionDetalleCompleto = {
    id: 'm1000000-0000-4000-8000-000000000001',
    codigo: 'MIS-2026-0001',
    titulo: 'Despeje de cables',
    descripcion: 'Poda urgente',
    tipoMision: 'ATENCION_CUADRILLA',
    estado: 'EN_CURSO',
    prioridad: 'ALTA',
    justificacionRechazo: null,
    fechaInicio: '2026-10-02T14:00:00Z',
    fechaCierre: null,
    creadoEn: '2026-10-02T13:30:00Z',
    actualizadoEn: '2026-10-02T14:00:00Z',
    creadoPor: null,
    encargado: null,
    incidente: null,
    prevencion: null,
    cuadrilla: {
      id: 'c1',
      nombre: 'Cuadrilla Alfa 1',
      estado: 'EN_MISION',
      delegacionNombre: 'Collico',
      delegado: null,
      recursos: [],
    },
    patrulla: null,
    bitacoraTiempos: [],
    reportesTerreno: [],
  };

  it('no debe renderizar el drawer si incidenteId es null', () => {
    const { container } = render(
      <IncidenteDetalleDrawer
        incidenteId={null}
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('debe abrir MisionDetalleModal al hacer clic en "Ver Detalles" de una misión dentro del drawer', async () => {
    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: mockDetalleIncidente,
      mensaje: 'OK',
    });

    vi.spyOn(misionesService, 'obtenerDetalleMision').mockResolvedValueOnce({
      exito: true,
      datos: mockMisionDetalle,
      mensaje: 'Mision OK',
    });

    render(
      <IncidenteDetalleDrawer
        incidenteId="i1000000-0000-4000-8000-000000000001"
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    // Esperar a que cargue el incidente
    await waitFor(() => {
      expect(screen.getByText('INC-2026-0042')).toBeDefined();
      expect(screen.getByText('MIS-2026-0001')).toBeDefined();
      expect(screen.getByText('Despeje de cables')).toBeDefined();
    });

    // Clic en el botón "Ver Detalles" de la misión
    const btnVerDetalles = screen.getByRole('button', {
      name: /Ver detalles de la misión MIS-2026-0001/i,
    });
    fireEvent.click(btnVerDetalles);

    // Debe abrirse el modal de misión sobre el drawer
    await waitFor(() => {
      expect(misionesService.obtenerDetalleMision).toHaveBeenCalledWith(
        'm1000000-0000-4000-8000-000000000001',
        'user-test'
      );
    });

    // Cerrar el modal de misión con el botón de pie "Cerrar Detalle"
    const btnCerrarMision = screen.getByRole('button', { name: 'Cerrar Detalle' });
    fireEvent.click(btnCerrarMision);

    // El drawer de incidente sigue abierto sin pérdida de contexto
    expect(screen.getByText('INC-2026-0042')).toBeDefined();
  });

  it('muestra la barra de despacho táctico con botón habilitado para intentar el despacho incluso si la patrulla está verificando', async () => {
    const incidenteVerificando: IncidenteDetalle = {
      ...mockDetalleIncidente,
      estado: 'VERIFICANDO',
      misiones: [
        {
          id: 'mis-v1',
          codigo: 'MIS-2026-0010',
          titulo: 'Verificación en terreno',
          descripcion: null,
          tipoMision: 'VERIFICACION',
          estado: 'EN_SITIO', // Verificación en curso
          prioridad: 'ALTA',
          justificacionRechazo: null,
          patrulla: { id: 'p1', nombre: 'Patrulla Alpha', estado: 'EN_TERRENO' },
          cuadrilla: null,
          fechaInicio: '2026-10-02T13:30:00Z',
          fechaCierre: null,
          creadoEn: '2026-10-02T13:30:00Z',
        },
      ],
    };

    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: incidenteVerificando,
      mensaje: 'OK',
    });

    render(
      <IncidenteDetalleDrawer
        incidenteId="i1000000-0000-4000-8000-000000000001"
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Intervención Táctica Operativa/i)).toBeDefined();
      expect(screen.getByText(/Patrulla asignada: Patrulla Alpha \(EN_SITIO\)/i)).toBeDefined();
    });

    const btnDespachar = screen.getByRole('button', { name: /Despachar Cuadrilla Operativa/i });
    expect(btnDespachar.hasAttribute('disabled')).toBe(false);
  });

  it('permite abrir ModalAsignarCuadrilla cuando la verificación concluyó', async () => {
    const incidenteVerificadoListo: IncidenteDetalle = {
      ...mockDetalleIncidente,
      estado: 'VERIFICANDO',
      misiones: [
        {
          id: 'mis-v2',
          codigo: 'MIS-2026-0011',
          titulo: 'Verificación concluida',
          descripcion: null,
          tipoMision: 'VERIFICACION',
          estado: 'COMPLETADA',
          prioridad: 'ALTA',
          justificacionRechazo: null,
          patrulla: { id: 'p1', nombre: 'Patrulla Alpha', estado: 'DISPONIBLE' },
          cuadrilla: null,
          fechaInicio: '2026-10-02T13:30:00Z',
          fechaCierre: '2026-10-02T14:00:00Z',
          creadoEn: '2026-10-02T13:30:00Z',
        },
      ],
    };

    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: incidenteVerificadoListo,
      mensaje: 'OK',
    });

    render(
      <IncidenteDetalleDrawer
        incidenteId="i1000000-0000-4000-8000-000000000001"
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Intervención Táctica Operativa/i)).toBeDefined();
    });

    const btnDespachar = screen.getByRole('button', { name: /Despachar Cuadrilla Operativa/i });
    expect(btnDespachar.hasAttribute('disabled')).toBe(false);

    fireEvent.click(btnDespachar);

    // Debe abrirse el modal emergente de despacho
    await waitFor(() => {
      expect(screen.getByText('Despachar Cuadrilla Operativa')).toBeDefined();
    });
  });

  it('no muestra el botón de despacho táctico en incidentes que ya están EN_ATENCION', async () => {
    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: {
        ...mockDetalleIncidente,
        estado: 'EN_ATENCION',
      },
      mensaje: 'OK',
    });

    render(
      <IncidenteDetalleDrawer
        incidenteId="i1000000-0000-4000-8000-000000000001"
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('INC-2026-0042')).toBeDefined();
    });

    expect(screen.queryByRole('button', { name: /Despachar Cuadrilla Operativa/i })).toBeNull();
  });

  it('muestra el botón de despacho de cuadrilla en incidentes REPORTADO para despacho táctico directo', async () => {
    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: {
        ...mockDetalleIncidente,
        estado: 'REPORTADO',
        misiones: [],
      },
      mensaje: 'OK',
    });

    render(
      <IncidenteDetalleDrawer
        incidenteId="i1000000-0000-4000-8000-000000000001"
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('INC-2026-0042')).toBeDefined();
    });

    expect(screen.getByRole('button', { name: /Despachar Cuadrilla Operativa/i })).toBeDefined();
    expect(screen.getByText(/Sin patrulla previa asignada \(despacho táctico directo\)/i)).toBeDefined();
  });

  it('muestra el botón "Despachar Patrulla Verificadora" cuando el incidente está en estado REPORTADO y abre el modal', async () => {
    const mockIncidenteReportado: IncidenteDetalle = {
      ...mockDetalleIncidente,
      id: 'inc-reportado-1',
      codigo: 'INC-2026-9999',
      estado: 'REPORTADO',
      misiones: [],
    };

    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: mockIncidenteReportado,
      mensaje: 'OK',
    });

    render(
      <IncidenteDetalleDrawer
        incidenteId="inc-reportado-1"
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('INC-2026-9999')).toBeDefined();
    });

    // En estado REPORTADO, el botón de despachar patrulla en la sección inferior debe estar presente
    const btnDespachar = screen.getByRole('button', { name: /Despachar Patrulla Verificadora/i });
    expect(btnDespachar).toBeDefined();

    // Clic en el botón de despachar patrulla
    fireEvent.click(btnDespachar);

    // Debe abrirse el modal de asignación de patrulla
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /Asignar Patrulla Verificadora/i })).toBeDefined();
    });
  });

  it('NO muestra el botón "Despachar Patrulla Verificadora" si el incidente ya está en estado EN_ATENCION o VERIFICANDO', async () => {
    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: mockDetalleIncidente, // estado: EN_ATENCION
      mensaje: 'OK',
    });

    render(
      <IncidenteDetalleDrawer
        incidenteId="i1000000-0000-4000-8000-000000000001"
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('INC-2026-0042')).toBeDefined();
    });

    // En estado EN_ATENCION, no debe estar el botón
    const btnDespachar = screen.queryByRole('button', { name: /Despachar Patrulla/i });
    expect(btnDespachar).toBeNull();
  });

  it('renderiza estados y prioridades legibles y muestra bloque de justificación de reclasificación técnica (H37)', async () => {
    const mockIncidenteReclasificado: IncidenteDetalle = {
      ...mockDetalleIncidente,
      tipoAfectacion: 'Inundación Mayor',
      prioridad: 'CRITICA',
      reclasificadoEnTerreno: true,
      justificacionReclasificacion: 'Desborde de río constatado con riesgo inminente a personas.',
      cambioPrioridadMotivo: 'Desborde de río constatado con riesgo inminente a personas.',
    };

    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: mockIncidenteReclasificado,
      mensaje: 'OK',
    });

    render(
      <IncidenteDetalleDrawer
        incidenteId="i1000000-0000-4000-8000-000000000001"
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('INC-2026-0042')).toBeDefined();
    });

    // Validar strings legibles y sin enums en crudo
    expect(screen.getByText('Estado: En atención')).toBeDefined();
    expect(screen.getByText('Prioridad: Crítica')).toBeDefined();

    // Validar bloque informativo de reclasificación técnica en terreno
    const bloque = screen.getByTestId('bloque-reclasificacion-terreno');
    expect(bloque).toBeDefined();
    expect(within(bloque).getByText(/Reclasificación Técnica en Terreno/i)).toBeDefined();
    expect(within(bloque).getByText(/Inundación Mayor/i)).toBeDefined();
    expect(within(bloque).getByText(/Desborde de río constatado con riesgo inminente a personas/i)).toBeDefined();
    expect(screen.getByTestId('btn-ver-cambio-afectacion')).toBeDefined();
    expect(screen.getByTestId('incidente-ultimo-reporte-section')).toBeDefined();
  });

  it('muestra el acceso rápido al último reporte de las misiones activas y permite abrir todos los reportes de la misión en MisionDetalleModal (HU-38)', async () => {
    const mockIncidenteConReportes: IncidenteDetalle = {
      ...mockDetalleIncidente,
      prioridad: 'CRITICA',
      prioridadSugerida: 'ALTA',
      justificacionPrioridad: 'Riesgo eléctrico activo junto a anegamiento de dormitorio.',
      reportesEvaluacionTerreno: [
        {
          id: 'rep-m1-2',
          misionId: 'm1000000-0000-4000-8000-000000000001',
          versionReporte: 2,
          esRectificacion: true,
          etiquetaReporte: 'Reporte de Evaluación #2 (Rectificación)',
          prioridadSugerida: 'ALTA',
          prioridadAsignada: 'CRITICA',
          justificacionPrioridad: 'Riesgo eléctrico activo junto a anegamiento de dormitorio.',
          resumenTecnico: 'Segundo reporte rectificado desde terreno.',
          accionesRealizadas: 'Aislamiento preventivo.',
          danosEstimados: 'Pérdida de enseres.',
          observaciones: 'Se solicita apoyo.',
          personasAfectadas: 4,
          requiereApoyoAdicional: true,
          evaluacion: {
            nucleoFamiliarTotal: 4,
            cantidadNinos: 2,
            mascotasAfectadas: 1,
            nivelCompromisoVivienda: 'MODERADO',
          },
          evaluador: {
            id: 'u-eval-1',
            nombre: 'Patrulla Verificadora',
            email: 'patrulla@valdivia.cl',
          },
          creadoEn: '2026-11-11T11:00:00Z',
        },
        {
          id: 'rep-m1-1',
          misionId: 'm1000000-0000-4000-8000-000000000001',
          versionReporte: 1,
          esRectificacion: false,
          etiquetaReporte: 'Reporte de Evaluación #1 (Inicial)',
          prioridadSugerida: 'MEDIA',
          prioridadAsignada: 'ALTA',
          justificacionPrioridad: 'Agua sube por patio.',
          resumenTecnico: 'Reporte inicial de evaluación.',
          accionesRealizadas: null,
          danosEstimados: null,
          observaciones: null,
          personasAfectadas: 4,
          requiereApoyoAdicional: false,
          evaluacion: {
            nucleoFamiliarTotal: 4,
          },
          evaluador: {
            id: 'u-eval-1',
            nombre: 'Patrulla Verificadora',
            email: 'patrulla@valdivia.cl',
          },
          creadoEn: '2026-11-11T10:30:00Z',
        },
      ],
    };

    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: mockIncidenteConReportes,
      mensaje: 'OK',
    });

    vi.spyOn(misionesService, 'obtenerDetalleMision').mockResolvedValueOnce({
      exito: true,
      datos: mockMisionDetalle,
      mensaje: 'Mision OK',
    });

    render(
      <IncidenteDetalleDrawer
        incidenteId="i1000000-0000-4000-8000-000000000001"
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('INC-2026-0042')).toBeDefined();
    });

    // Verificar badge de prioridad sugerida vs asignada en el header del drawer
    expect(screen.getByText('Prioridad: Crítica')).toBeDefined();
    expect(screen.getByText('Sugerida: Alta')).toBeDefined();

    // Verificar que se renderiza el bloque del último reporte de la misión activa
    const bloqueUltimo = screen.getByTestId(
      'ultimo-reporte-mision-m1000000-0000-4000-8000-000000000001'
    );
    expect(bloqueUltimo).toBeDefined();
    expect(bloqueUltimo.textContent).toContain('Reporte #2 — Rectificación Vigente');
    expect(bloqueUltimo.textContent).toContain('Segundo reporte rectificado desde terreno.');

    // Clic en "Ver Todos los Reportes (2)" para abrir el detalle de la misión enfocado en reportes
    const btnVerTodos = screen.getByRole('button', {
      name: /Ver todos los reportes de la misión MIS-2026-0001/i,
    });
    fireEvent.click(btnVerTodos);

    await waitFor(() => {
      expect(misionesService.obtenerDetalleMision).toHaveBeenCalledWith(
        'm1000000-0000-4000-8000-000000000001',
        'user-test'
      );
      expect(screen.getByTestId('mision-reportes-section')).toBeDefined();
    });
  });

  it('muestra el código del incidente en la cabecera, origen amigable, ícono clickeable de cambio de afectación, sección Último Reporte y botón de mapa desplegable', async () => {
    const mockIncidenteCompleto: IncidenteDetalle = {
      ...mockDetalleIncidente,
      codigo: 'INC-592395-562',
      tipoAfectacion: 'Corte de agua potable',
      fuenteOrigen: 'LLAMADA_TELEFONICA',
      reclasificadoEnTerreno: true,
      reclasificacionTipologia: {
        hitoId: 'hito-reclas-1',
        misionId: 'm1000000-0000-4000-8000-000000000001',
        misionCodigo: 'MIS-2026-0001',
        tipoAnterior: 'Anegamiento',
        tipoNuevo: 'Corte de agua potable',
        justificacion: 'Rotura de matriz principal de agua potable.',
        registradoPor: 'Cabo Patrulla',
        creadoEn: '2026-11-11T10:15:00Z',
      },
      ultimoReporte: {
        origen: 'REPORTE_TERRENO',
        reporteId: 'rep-m1-2',
        misionId: 'm1000000-0000-4000-8000-000000000001',
        misionCodigo: 'MIS-2026-0001',
        evaluadorNombre: 'Cabo Patrulla',
        creadoEn: '2026-11-11T11:00:00Z',
        resumen: 'Corte de suministro en toda la cuadra.',
        prioridadAsignada: 'ALTA',
        versionReporte: 2,
        esRectificacion: true,
      },
    };

    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: mockIncidenteCompleto,
      mensaje: 'OK',
    });

    vi.spyOn(misionesService, 'obtenerDetalleMision').mockResolvedValue({
      exito: true,
      datos: {
        ...mockMisionDetalle,
        bitacoraTiempos: [
          {
            id: 'hito-reclas-1',
            hito: 'TIPOLOGIA_RECLASIFICADA',
            fecha: '2026-11-11',
            hora: '10:15:00',
            timestamp: '2026-11-11T10:15:00Z',
            descripcion: 'Tipología reclasificada en terreno a: Corte de agua potable. Justificación: Rotura de matriz principal de agua potable.',
            metadatos: {
              tipoAnterior: 'Anegamiento',
              tipoNuevo: 'Corte de agua potable',
              justificacion: 'Rotura de matriz principal de agua potable.',
            },
          },
        ],
      },
      mensaje: 'Mision OK',
    });

    render(
      <IncidenteDetalleDrawer
        incidenteId="i1000000-0000-4000-8000-000000000001"
        incidenteCodigo="INC-592395-562"
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    // El identificador del incidente se muestra inmediatamente en la cabecera superior
    expect(screen.getByTestId('incidente-header-codigo').textContent).toBe(
      'INC-592395-562'
    );

    await waitFor(() => {
      expect(screen.getByText('Central Telefónica')).toBeDefined();
    });

    // Verificar sección "Último Reporte de Terreno" y su botón "Ver detalle"
    const seccionUltimo = screen.getByTestId('incidente-ultimo-reporte-section');
    expect(seccionUltimo.textContent).toContain('Corte de suministro en toda la cuadra.');
    expect(screen.getByTestId('btn-ver-detalle-ultimo-reporte')).toBeDefined();

    // Verificar botón de mapa desplegable en "Ubicación Territorial"
    const btnMapa = screen.getByTestId('btn-toggle-mapa-ubicacion');
    expect(btnMapa.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(btnMapa);
    expect(btnMapa.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByTestId('contenedor-mini-mapa-incidente')).toBeDefined();

    // Verificar ícono clickeable al costado del tipo de afectación cambiado
    const btnCambioAfectacion = screen.getByTestId('btn-ver-cambio-afectacion');
    expect(btnCambioAfectacion.textContent).toContain('Antes: Anegamiento');
    fireEvent.click(btnCambioAfectacion);

    await waitFor(() => {
      expect(misionesService.obtenerDetalleMision).toHaveBeenCalledWith(
        'm1000000-0000-4000-8000-000000000001',
        'user-test'
      );
      expect(screen.getByTestId('reporte-verificacion-reclasificacion')).toBeDefined();
    });
  });

  it('despliega métricas de familias y desglose de hogares en la sección de Último Reporte', async () => {
    const mockIncidenteConFamilias: IncidenteDetalle = {
      ...mockDetalleIncidente,
      codigo: 'INC-777888-999',
      tipoAfectacion: 'Inundación',
      ultimoReporte: {
        origen: 'REPORTE_TERRENO',
        reporteId: 'rep-familias-1',
        misionId: 'm1000000-0000-4000-8000-000000000001',
        misionCodigo: 'MIS-2026-0001',
        evaluadorNombre: 'Patrullero Castro',
        creadoEn: '2026-11-12T11:00:00Z',
        resumen: 'Dos viviendas anegadas con familias afectadas.',
        prioridadAsignada: 'CRITICA',
        versionReporte: 1,
        esRectificacion: false,
      },
      reportesEvaluacionTerreno: [
        {
          id: 'rep-familias-1',
          misionId: 'm1000000-0000-4000-8000-000000000001',
          versionReporte: 1,
          esRectificacion: false,
          etiquetaReporte: 'Reporte de Evaluación #1 (Inicial)',
          prioridadSugerida: 'ALTA',
          prioridadAsignada: 'CRITICA',
          justificacionPrioridad: 'Riesgo grave para personas vulnerables.',
          resumenTecnico: 'Constatación en terreno.',
          accionesRealizadas: 'Demarcación preventiva.',
          danosEstimados: null,
          observaciones: null,
          personasAfectadas: 6,
          requiereApoyoAdicional: false,
          evaluacion: {
            nucleoFamiliarTotal: 6,
            familiasAfectadas: 2,
            viviendasAfectadas: 2,
            nivelCompromisoVivienda: 'GRAVE_INHABITABLE',
            requiereAsistenciaSocial: true,
            familias: [
              {
                id: 'f-1',
                referencia: 'Familia Morales',
                nucleoFamiliarTotal: 4,
                nivelCompromisoVivienda: 'GRAVE_INHABITABLE',
                requiereAsistenciaSocial: true,
              },
              {
                id: 'f-2',
                referencia: 'Casa 2 Interior',
                nucleoFamiliarTotal: 2,
                nivelCompromisoVivienda: 'LEVE_HABITABLE',
                requiereAsistenciaSocial: false,
              },
            ],
          },
          evaluador: {
            id: 'u-eval-1',
            nombre: 'Patrullero Castro',
            email: 'castro@valdivia.cl',
          },
          creadoEn: '2026-11-12T11:00:00Z',
        },
      ],
    };

    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: mockIncidenteConFamilias,
      mensaje: 'OK',
    });

    render(
      <IncidenteDetalleDrawer
        incidenteId="i1000000-0000-4000-8000-000000000001"
        incidenteCodigo="INC-777888-999"
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('INC-777888-999')).toBeDefined();
    });

    const seccionUltimo = screen.getByTestId('incidente-ultimo-reporte-section');
    expect(seccionUltimo.textContent).toContain('2 familias');
    expect(seccionUltimo.textContent).toContain('6 personas');
    expect(seccionUltimo.textContent).toContain('2 viviendas');
    expect(seccionUltimo.textContent).toContain('Grave / Inhabitable');

    const desgloseFamilias = screen.getByTestId('incidente-ultimo-reporte-familias-desglose');
    expect(desgloseFamilias.textContent).toContain('Familia Morales: 4 pers.');
    expect(desgloseFamilias.textContent).not.toContain('FIBE');
    expect(desgloseFamilias.textContent).toContain('Familia Casa 2 Interior: 2 pers.');
  });

  it('indica explícitamente cuando la tipología no fue modificada por la patrulla en Resumen y Último Reporte', async () => {
    const mockIncidenteRatificado: IncidenteDetalle = {
      ...mockDetalleIncidente,
      codigo: 'INC-948888-846',
      tipoAfectacion: 'Deslizamiento',
      reclasificadoEnTerreno: false,
      reclasificacionTipologia: {
        hitoId: 'hito-rat-1',
        misionId: 'm1000000-0000-4000-8000-000000000001',
        misionCodigo: 'MIS-2026-0001',
        tipoAnterior: 'Deslizamiento',
        tipoNuevo: 'Deslizamiento',
        justificacion: 'Tipología constatada y ratificada en terreno sin variaciones.',
        registradoPor: 'Cristóbal Felipe Veas',
        creadoEn: '2026-11-13T15:21:38Z',
      },
      ultimoReporte: {
        origen: 'RECLASIFICACION',
        reporteId: 'reclasificacion-hito-rat-1',
        misionId: 'm1000000-0000-4000-8000-000000000001',
        misionCodigo: 'MIS-2026-0001',
        evaluadorNombre: 'Cristóbal Felipe Veas',
        creadoEn: '2026-11-13T15:21:38Z',
        resumen: 'Tipología constatada y ratificada en terreno sin variaciones.',
        prioridadAsignada: null,
        versionReporte: null,
        esRectificacion: false,
      },
    };

    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: mockIncidenteRatificado,
      mensaje: 'OK',
    });

    render(
      <IncidenteDetalleDrawer
        incidenteId="i1000000-0000-4000-8000-000000000001"
        incidenteCodigo="INC-948888-846"
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('INC-948888-846')).toBeDefined();
    });

    // Imagen 1: Resumen no debe decir "Antes: Deslizamiento"
    const btnCambio = screen.getByTestId('btn-ver-cambio-afectacion');
    expect(btnCambio.textContent).toContain('Confirmada sin cambios');
    expect(btnCambio.textContent).not.toContain('Antes:');

    // Imagen 2: Último reporte no debe mostrar "Deslizamiento → Deslizamiento"
    const seccionUltimo = screen.getByTestId('incidente-ultimo-reporte-section');
    expect(seccionUltimo.textContent).toContain('Constatación en Terreno (Sin cambios)');
    expect(seccionUltimo.textContent).toContain('Deslizamiento (confirmada sin modificaciones por la patrulla)');
    expect(seccionUltimo.textContent).not.toContain('Deslizamiento → Deslizamiento');
  });

  it('muestra el informe VERIFICACION_CIERRE con dictamen REQUIERE_CUADRILLA, comparativa de personas afectadas y Ficha FIBE (H39)', async () => {
    const mockIncidenteCierreCuadrilla: IncidenteDetalle = {
      ...mockDetalleIncidente,
      estado: 'VERIFICANDO',
      requiereAsistenciaSocial: true,
      verificado: true,
      misiones: [
        {
          ...mockDetalleIncidente.misiones[0],
          estado: 'COMPLETADA',
        },
      ],
      ultimoReporte: {
        origen: 'REPORTE_TERRENO',
        reporteId: 'rep-cierre-39',
        misionId: 'm1000000-0000-4000-8000-000000000001',
        misionCodigo: 'MIS-2026-0001',
        evaluadorNombre: 'Patrullero Vera',
        creadoEn: '2026-11-15T14:00:00Z',
        resumen: 'Árbol caído bloquea acceso a dos viviendas; requiere motosierrista.',
        prioridadAsignada: 'ALTA',
        versionReporte: 2,
        esRectificacion: false,
        tipoReporte: 'VERIFICACION_CIERRE',
        dictamen: 'REQUIERE_CUADRILLA',
        estadoTerreno: 'CRITICO',
        requiereAsistenciaSocial: true,
        personasAfectadas: 6,
      },
      reportesEvaluacionTerreno: [
        {
          id: 'rep-prio-38',
          misionId: 'm1000000-0000-4000-8000-000000000001',
          tipoReporte: 'EVALUACION_PRIORIDAD',
          versionReporte: 1,
          esRectificacion: false,
          etiquetaReporte: 'Reporte de Evaluación #1 (Inicial)',
          prioridadSugerida: 'MEDIA',
          prioridadAsignada: 'ALTA',
          justificacionPrioridad: 'Riesgo sobre acceso principal.',
          resumenTecnico: 'Evaluación inicial de prioridad.',
          accionesRealizadas: null,
          danosEstimados: null,
          observaciones: null,
          personasAfectadas: 4,
          requiereApoyoAdicional: false,
          evaluacion: { nucleoFamiliarTotal: 4, familiasAfectadas: 1 },
          evaluador: { id: 'u-p', nombre: 'Patrullero Vera' },
          creadoEn: '2026-11-15T13:30:00Z',
        },
        {
          id: 'rep-cierre-39',
          misionId: 'm1000000-0000-4000-8000-000000000001',
          tipoReporte: 'VERIFICACION_CIERRE',
          dictamen: 'REQUIERE_CUADRILLA',
          estadoTerreno: 'CRITICO',
          requiereAsistenciaSocial: true,
          versionReporte: 2,
          esRectificacion: false,
          etiquetaReporte: 'Informe Técnico de Verificación y Cierre',
          prioridadSugerida: null,
          prioridadAsignada: 'ALTA',
          justificacionPrioridad: null,
          resumenTecnico: 'Árbol caído bloquea acceso a dos viviendas; requiere motosierrista.',
          accionesRealizadas: null,
          danosEstimados: 'Cerco perimetral destruido',
          observaciones: 'Se dejó perímetro demarcado.',
          personasAfectadas: 6,
          requiereApoyoAdicional: false,
          evaluacion: {},
          evaluador: { id: 'u-p', nombre: 'Patrullero Vera' },
          creadoEn: '2026-11-15T14:00:00Z',
        },
      ],
    };

    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: mockIncidenteCierreCuadrilla,
      mensaje: 'OK',
    });

    render(
      <IncidenteDetalleDrawer
        incidenteId="i1000000-0000-4000-8000-000000000001"
        incidenteCodigo="INC-2026-001"
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Informe Técnico de Verificación y Cierre')).toBeDefined();
    });

    const seccionUltimo = screen.getByTestId('incidente-ultimo-reporte-section');
    expect(seccionUltimo.textContent).toContain('Dictamen: Requiere Cuadrilla');
    expect(seccionUltimo.textContent).toContain('Requiere Ficha FIBE');
    expect(seccionUltimo.textContent).toContain('Critico');
    expect(seccionUltimo.textContent).toContain('6 personas (Modificado; antes: 4)');
    expect(screen.getByText('Despachar Cuadrilla')).toBeDefined();
  });

  it('al recibir VERIFICACION_CIERRE por socket actualiza ultimoReporte, libera patrulla y preserva misiones históricas RECHAZADA (BUG-H39-WEB-02/06)', async () => {
    const detalleConHistorica: IncidenteDetalle = {
      ...mockDetalleIncidente,
      estado: 'VERIFICANDO',
      ultimoReporte: {
        origen: 'REPORTE_TERRENO',
        reporteId: 'rep-h38-previo',
        misionId: 'm-activa-1',
        misionCodigo: 'MIS-2026-0102',
        evaluadorNombre: 'Patrulla Previa',
        creadoEn: '2026-11-15T13:00:00Z',
        resumen: 'Evaluación previa H38',
        prioridadAsignada: 'ALTA',
        versionReporte: 1,
        esRectificacion: false,
      },
      misiones: [
        {
          id: 'm-rechazada-hist',
          codigo: 'MIS-2026-0101',
          titulo: 'Verificación previa rechazada',
          tipoMision: 'VERIFICACION',
          estado: 'RECHAZADA',
          prioridad: 'ALTA',
          creadoEn: '2026-11-15T12:00:00Z',
          fechaCierre: '2026-11-15T12:10:00Z',
          motivoRechazo: 'Unidad en otra emergencia',
          patrulla: { id: 'pat-old', nombre: 'Patrulla Histórica', estado: 'DISPONIBLE' },
          cuadrilla: null,
        },
        {
          id: 'm-activa-1',
          codigo: 'MIS-2026-0102',
          titulo: 'Verificación en curso',
          tipoMision: 'VERIFICACION',
          estado: 'EN_CURSO',
          prioridad: 'ALTA',
          creadoEn: '2026-11-15T12:30:00Z',
          fechaCierre: null,
          motivoRechazo: null,
          patrulla: { id: 'pat-1', nombre: 'Patrulla Activa', estado: 'EN_VERIFICACION' },
          cuadrilla: null,
        },
      ],
    };

    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: detalleConHistorica,
      mensaje: 'OK',
    });

    render(
      <IncidenteDetalleDrawer
        incidenteId="i1000000-0000-4000-8000-000000000001"
        incidenteCodigo="INC-2026-0042"
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('INC-2026-0042')).toBeDefined();
    });

    act(() => {
      const handler = socketListeners['incidente:actualizado']?.[0];
      handler?.({
        evento: 'incidente:actualizado',
        datos: {
          id: 'i1000000-0000-4000-8000-000000000001',
          nuevoEstado: 'VERIFICANDO',
          dictamen: 'REQUIERE_CUADRILLA',
          requiereAsistenciaSocial: true,
          fechaCierre: '2026-11-15T14:30:00Z',
          reporteTerreno: {
            id: 'rep-cierre-socket',
            misionId: 'm-activa-1',
            tipoReporte: 'VERIFICACION_CIERRE',
            dictamen: 'REQUIERE_CUADRILLA',
            estadoTerreno: 'CRITICO',
            requiereAsistenciaSocial: true,
            versionReporte: 2,
            esRectificacion: false,
            resumenTecnico: 'Cierre en vivo con requerimiento de cuadrilla.',
            personasAfectadas: 5,
            evaluador: { id: 'u-p', nombre: 'Patrullero Socket' },
            creadoEn: '2026-11-15T14:30:00Z',
          },
        },
      });
    });

    await waitFor(() => {
      const seccionUltimo = screen.getByTestId('incidente-ultimo-reporte-section');
      expect(seccionUltimo.textContent).toContain('Dictamen: Requiere Cuadrilla');
      expect(seccionUltimo.textContent).toContain('Critico');
    });

    // La misión histórica rechazada conserva su estado y no se sobrescribe a Completada
    expect(screen.getByLabelText('Desplegar misiones rechazadas (1)')).toBeDefined();
    // El badge de Verificación Completada aparece estandarizado
    expect(screen.getByText('Verificación Completada')).toBeDefined();
  });

  it('muestra banner de cierre No Abordable y motivo técnico cuando dictamen es NO_ABORDABLE (H39)', async () => {
    const mockIncidenteNoAbordable: IncidenteDetalle = {
      ...mockDetalleIncidente,
      estado: 'NO_ABORDABLE',
      motivoNoAbordable: 'Predio privado inaccesible y sin riesgo hacia la vía pública.',
      fechaCierre: '2026-11-15T15:10:00Z',
      dictamenTerreno: 'NO_ABORDABLE',
      reportesEvaluacionTerreno: [
        {
          id: 'rep-cierre-noab',
          misionId: 'm1000000-0000-4000-8000-000000000001',
          tipoReporte: 'VERIFICACION_CIERRE',
          dictamen: 'NO_ABORDABLE',
          motivoNoAbordable: 'Predio privado inaccesible y sin riesgo hacia la vía pública.',
          estadoTerreno: 'SIN_ACCESO',
          requiereAsistenciaSocial: false,
          versionReporte: 1,
          esRectificacion: false,
          etiquetaReporte: 'Informe de Cierre — No Abordable',
          prioridadSugerida: null,
          prioridadAsignada: null,
          justificacionPrioridad: null,
          resumenTecnico: 'Se verifica portón cerrado en predio particular sin afectación externa.',
          accionesRealizadas: null,
          danosEstimados: 'Sin daños en espacio público',
          observaciones: 'Se deja registro fotográfico del acceso.',
          personasAfectadas: 0,
          requiereApoyoAdicional: false,
          evaluacion: {},
          evaluador: { id: 'u-p', nombre: 'Patrullero Vera' },
          creadoEn: '2026-11-15T15:10:00Z',
        },
      ],
    };

    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: mockIncidenteNoAbordable,
      mensaje: 'OK',
    });

    render(
      <IncidenteDetalleDrawer
        incidenteId="i1000000-0000-4000-8000-000000000001"
        incidenteCodigo="INC-2026-001"
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('banner-incidente-no-abordable')).toBeDefined();
    });

    const banner = screen.getByTestId('banner-incidente-no-abordable');
    expect(banner.textContent).toContain('Caso cerrado en terreno como No Abordable');
    expect(banner.textContent).toContain('Predio privado inaccesible y sin riesgo hacia la vía pública.');
    expect(screen.queryByText('Despachar Cuadrilla')).toBeNull();
    expect(screen.getByTestId('ultimo-reporte-motivo-no-abordable').textContent).toContain(
      'Predio privado inaccesible y sin riesgo hacia la vía pública.'
    );
  });

  it('actualiza reactivamente el estado de trazabilidad de la misión ante notificacion:trazabilidad_actualizada', async () => {
    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: mockDetalleIncidente,
      mensaje: 'OK',
    });

    render(
      <IncidenteDetalleDrawer
        incidenteId="i1000000-0000-4000-8000-000000000001"
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('INC-2026-0042')).toBeDefined();
    });

    // Antes del evento, no se visualiza el badge de trazabilidad
    expect(
      screen.queryByTestId('badge-trazabilidad-m1000000-0000-4000-8000-000000000001')
    ).toBeNull();

    // Simular recepción de evento de socket
    act(() => {
      const handler = socketListeners['notificacion:trazabilidad_actualizada']?.[0];
      handler?.({
        notificacionId: 'notif-1',
        misionId: 'm1000000-0000-4000-8000-000000000001',
        patrullaId: 'pat-1',
        estado: 'RECIBIDA',
      });
    });

    // Se debe renderizar el badge con el texto esperado
    await waitFor(() => {
      const badge = screen.getByTestId(
        'badge-trazabilidad-m1000000-0000-4000-8000-000000000001'
      );
      expect(badge).toBeDefined();
      expect(badge.textContent).toBe('Recibida en móvil de terreno');
    });

    // Transición a LEIDA
    act(() => {
      const handler = socketListeners['notificacion:trazabilidad_actualizada']?.[0];
      handler?.({
        notificacionId: 'notif-1',
        misionId: 'm1000000-0000-4000-8000-000000000001',
        patrullaId: 'pat-1',
        estado: 'LEIDA',
      });
    });

    await waitFor(() => {
      const badge = screen.getByTestId(
        'badge-trazabilidad-m1000000-0000-4000-8000-000000000001'
      );
      expect(badge.textContent).toBe('Leída por operador en terreno');
    });
  });

  it('hidrata el badge de trazabilidad desde el cache local cuando el detalle de API omite trazabilidadNotificacion', async () => {
    setTrazabilidadEstado('m1000000-0000-4000-8000-000000000001', 'RECIBIDA');

    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: mockDetalleIncidente,
      mensaje: 'OK',
    });

    render(
      <IncidenteDetalleDrawer
        incidenteId="i1000000-0000-4000-8000-000000000001"
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('INC-2026-0042')).toBeDefined();
    });

    const badge = screen.getByTestId(
      'badge-trazabilidad-m1000000-0000-4000-8000-000000000001'
    );
    expect(badge).toBeDefined();
    expect(badge.textContent).toBe('Recibida en móvil de terreno');
  });

  it('muestra el resumen superior de lectura en terreno para patrulla activa y actualiza en vivo al recibir LEIDA', async () => {
    const detalleConPatrulla: IncidenteDetalle = {
      ...mockDetalleIncidente,
      estado: 'VERIFICANDO',
      misiones: [
        {
          ...mockDetalleIncidente.misiones[0],
          id: 'm-pat-001',
          codigo: 'MIS-2026-0099',
          tipoMision: 'VERIFICACION',
          estado: 'DESPACHADA',
          cuadrilla: null,
          patrulla: {
            id: 'pat-01',
            nombre: 'Patrulla Rápida Norte',
            estado: 'EN_VERIFICACION',
          },
          trazabilidadNotificacion: 'PENDIENTE_ENVIO',
        },
      ],
    };

    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: detalleConPatrulla,
      mensaje: 'OK',
    });

    render(
      <IncidenteDetalleDrawer
        incidenteId="i1000000-0000-4000-8000-000000000001"
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('drawer-trazabilidad-resumen')).toBeDefined();
    });

    const resumenInicial = screen.getByTestId('drawer-trazabilidad-resumen');
    expect(resumenInicial.textContent).toContain('NO LEÍDA');
    expect(getIncidentePorMision('m-pat-001')).toBe('i1000000-0000-4000-8000-000000000001');

    act(() => {
      const handler = socketListeners['notificacion:trazabilidad_actualizada']?.[0];
      handler?.({
        notificacionId: 'notif-99',
        misionId: 'm-pat-001',
        patrullaId: 'pat-01',
        estado: 'LEIDA',
      });
    });

    await waitFor(() => {
      const resumenActualizado = screen.getByTestId('drawer-trazabilidad-resumen');
      expect(resumenActualizado.textContent).toContain('LEÍDA: Leída por operador en terreno');
    });
  });

  it('BUG-H35-WEB-04: ignora eventos de misiones ajenas sin contaminar el caché del incidente abierto', async () => {
    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: mockDetalleIncidente,
      mensaje: 'OK',
    });

    render(
      <IncidenteDetalleDrawer
        incidenteId={mockDetalleIncidente.id}
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('INC-2026-0042')).toBeDefined();
    });

    act(() => {
      const handler = socketListeners['notificacion:trazabilidad_actualizada']?.[0];
      handler?.({
        notificacionId: 'notif-ajena',
        misionId: 'mision-de-otro-incidente-B',
        patrullaId: 'pat-99',
        estado: 'LEIDA',
      });
    });

    expect(getIncidentePorMision('mision-de-otro-incidente-B')).toBeUndefined();
    expect(getTrazabilidadEstado('mision-de-otro-incidente-B')).toBeUndefined();
    expect(getTrazabilidadPorIncidente(mockDetalleIncidente.id)).toBeUndefined();
    expect(
      screen.queryByTestId('badge-trazabilidad-m1000000-0000-4000-8000-000000000001')
    ).toBeNull();
  });

  it('BUG-H35-WEB-05: impide retroceso visual si llega un evento RECIBIDA o ENVIADA tras LEIDA', async () => {
    const detalleLeida: IncidenteDetalle = {
      ...mockDetalleIncidente,
      estado: 'VERIFICANDO',
      misiones: [
        {
          ...mockDetalleIncidente.misiones[0],
          id: 'm-pat-leida',
          codigo: 'MIS-2026-0111',
          tipoMision: 'VERIFICACION',
          estado: 'DESPACHADA',
          cuadrilla: null,
          patrulla: {
            id: 'pat-11',
            nombre: 'Patrulla Sur',
            estado: 'EN_VERIFICACION',
          },
          trazabilidadNotificacion: 'LEIDA',
        },
      ],
    };

    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: detalleLeida,
      mensaje: 'OK',
    });

    render(
      <IncidenteDetalleDrawer
        incidenteId={mockDetalleIncidente.id}
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('badge-trazabilidad-m-pat-leida').textContent).toBe(
        'Leída por operador en terreno'
      );
    });

    act(() => {
      const handler = socketListeners['notificacion:trazabilidad_actualizada']?.[0];
      handler?.({
        notificacionId: 'notif-tardia',
        misionId: 'm-pat-leida',
        patrullaId: 'pat-11',
        estado: 'RECIBIDA',
      });
      handler?.({
        notificacionId: 'notif-tardia',
        misionId: 'm-pat-leida',
        patrullaId: 'pat-11',
        estado: 'ENVIADA',
      });
    });

    expect(screen.getByTestId('badge-trazabilidad-m-pat-leida').textContent).toBe(
      'Leída por operador en terreno'
    );
    expect(screen.getByTestId('drawer-trazabilidad-resumen').textContent).toContain(
      'LEÍDA: Leída por operador en terreno'
    );
  });

  it('BUG-H35-WEB-07: asegura conexión del socket y suscripción a sala:encargados en montaje aislado sin emitir salir al cerrar', async () => {
    mockSocket.connected = false;
    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: mockDetalleIncidente,
      mensaje: 'OK',
    });

    const { unmount } = render(
      <IncidenteDetalleDrawer
        incidenteId={mockDetalleIncidente.id}
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('INC-2026-0042')).toBeDefined();
    });

    expect(mockSocket.connect).toHaveBeenCalledTimes(1);
    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));

    act(() => {
      mockSocket.connected = true;
      socketListeners['connect']?.forEach((cb) => cb());
    });

    expect(mockSocket.emit).toHaveBeenCalledWith('join', 'encargado');
    expect(mockSocket.emit).toHaveBeenCalledWith('unirse', 'sala:encargados');

    unmount();

    expect(mockSocket.off).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.off).toHaveBeenCalledWith(
      'notificacion:trazabilidad_actualizada',
      expect.any(Function)
    );
    expect(mockSocket.emit).not.toHaveBeenCalledWith('salir', 'sala:encargados');
  });

  it('BUG-H38-WEB-05: no muestra etiqueta Reclasificado cuando reclasificacionTipologia es null y la glosa es solo de prioridad', async () => {
    const casosSoloPrioridad: Array<string | null> = [
      'Reporte de evaluación #1: Prioridad asignada en terreno a CRITICA (Sugerida: ALTA).',
      'Reporte de evaluación #4 (Rectificación): Prioridad actualizada en terreno de BAJA a CRITICA (Sugerida: ALTA).',
      null,
    ];

    for (const justificacionReclasificacion of casosSoloPrioridad) {
      const mockSoloPrioridad: incidentesService.IncidenteDetalle = {
        ...mockDetalleIncidente,
        reclasificadoEnTerreno: true,
        reclasificacionTipologia: null,
        justificacionReclasificacion,
      };

      vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
        exito: true,
        datos: mockSoloPrioridad,
        mensaje: 'OK',
      });

      const { unmount } = render(
        <IncidenteDetalleDrawer
          incidenteId={mockDetalleIncidente.id}
          userId="user-test"
          onCerrar={vi.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('INC-2026-0042')).toBeDefined();
      });

      expect(screen.queryByTestId('btn-ver-cambio-afectacion')).toBeNull();
      unmount();
    }
  });

  it('BUG-H37-WEB-05: limpia el detalle previo cuando se cambia a otro incidente cuya consulta retorna error 403', async () => {
    vi.spyOn(incidentesService, 'obtenerDetalleIncidente')
      .mockResolvedValueOnce({
        exito: true,
        datos: mockDetalleIncidente,
        mensaje: 'OK',
      })
      .mockResolvedValueOnce({
        exito: false,
        codigoError: 403,
        mensaje: 'Acceso denegado al incidente B.',
      });

    const { rerender } = render(
      <IncidenteDetalleDrawer
        incidenteId="i1000000-0000-4000-8000-000000000001"
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('INC-2026-0042')).toBeDefined();
    });

    rerender(
      <IncidenteDetalleDrawer
        incidenteId="i2000000-0000-4000-8000-000000000002"
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Acceso denegado al incidente B.')).toBeDefined();
    });

    expect(screen.queryByText('INC-2026-0042')).toBeNull();
  });

  it('BUG-H41-WEB-02: ante mision:rechazada refresca silenciosamente sin ocultar detalle ni resetear el formulario de ModalAsignarCuadrilla', async () => {
    vi.spyOn(cuadrillasService, 'obtenerCuadrillas').mockResolvedValue({
      cuadrillas: [],
      meta: { total: 0, pagina: 1, limite: 100, paginasTotales: 0 },
    } as never);

    const detalleVerificando: incidentesService.IncidenteDetalle = {
      ...mockDetalleIncidente,
      estado: 'VERIFICANDO',
      misiones: [
        {
          id: 'm-verif-1',
          codigo: 'MIS-2026-0010',
          titulo: 'Verificación',
          descripcion: null,
          tipoMision: 'VERIFICACION',
          estado: 'COMPLETADA',
          prioridad: 'ALTA',
          justificacionRechazo: null,
          patrulla: { id: 'pat-1', nombre: 'Patrulla 1', estado: 'DISPONIBLE' },
          cuadrilla: null,
          fechaInicio: null,
          fechaCierre: null,
          creadoEn: '2026-10-02T13:00:00Z',
        },
      ],
    };

    const detalleActualizadoTrasRechazo: incidentesService.IncidenteDetalle = {
      ...detalleVerificando,
      misiones: [
        ...detalleVerificando.misiones,
        {
          id: 'm-rech-2',
          codigo: 'MIS-2026-0011',
          titulo: 'Atención',
          descripcion: null,
          tipoMision: 'ATENCION_CUADRILLA',
          estado: 'RECHAZADA',
          prioridad: 'ALTA',
          justificacionRechazo: 'Falla hidráulica en camión tolva',
          patrulla: null,
          cuadrilla: { id: 'c1', nombre: 'Cuadrilla Alfa 1', estado: 'DISPONIBLE' },
          fechaInicio: null,
          fechaCierre: '2026-10-02T15:00:00Z',
          creadoEn: '2026-10-02T14:30:00Z',
        },
      ],
    };

    vi.spyOn(incidentesService, 'obtenerDetalleIncidente')
      .mockResolvedValueOnce({
        exito: true,
        datos: detalleVerificando,
        mensaje: 'OK',
      })
      .mockResolvedValueOnce({
        exito: true,
        datos: detalleActualizadoTrasRechazo,
        mensaje: 'OK',
      });

    render(
      <IncidenteDetalleDrawer
        incidenteId={detalleVerificando.id}
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('INC-2026-0042')).toBeDefined();
    });

    fireEvent.click(screen.getByRole('button', { name: /Despachar Cuadrilla Operativa/i }));

    await waitFor(() => {
      expect(
        screen.getByLabelText(/Instrucciones Específicas para la Cuadrilla/i)
      ).toBeDefined();
    });

    const inputInstrucciones = screen.getByLabelText(
      /Instrucciones Específicas para la Cuadrilla/i
    ) as HTMLTextAreaElement;
    fireEvent.change(inputInstrucciones, { target: { value: 'Instrucción en progreso' } });
    expect(inputInstrucciones.value).toBe('Instrucción en progreso');

    await act(async () => {
      socketListeners['mision:rechazada']?.forEach((cb) =>
        cb({
          misionId: 'm-rech-2',
          codigo: 'MIS-2026-0011',
          incidenteId: detalleVerificando.id,
        })
      );
      await new Promise((r) => setTimeout(r, 150));
    });

    await waitFor(() => {
      expect(screen.getByTestId('aviso-rechazo-cuadrilla-reasignacion')).toBeDefined();
    });

    // No parpadeó ni reinició la descripción del modal hijo
    expect(screen.queryByText('Cargando información detallada del incidente...')).toBeNull();
    expect(
      (
        screen.getByLabelText(
          /Instrucciones Específicas para la Cuadrilla/i
        ) as HTMLTextAreaElement
      ).value
    ).toBe('Instrucción en progreso');
  });

  it('BUG-H41-WEB-05: prioriza los permisos de AuthContext autenticado sobre usePuedeAsignarMision', async () => {
    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: {
        ...mockDetalleIncidente,
        estado: 'VERIFICANDO',
        misiones: [
          {
            ...mockDetalleIncidente.misiones[0],
            estado: 'RECHAZADA',
            justificacionRechazo: 'Falla mecánica',
          },
        ],
      },
      mensaje: 'OK',
    });

    render(
      <AuthContext.Provider
        value={{
          usuario: {
            id: 'u-callcenter',
            nombre: 'Operador Call Center',
            email: 'cc@valdivia.cl',
            rut: '11.111.111-1',
            rolId: 'r-cc',
            rolNombre: 'Call Center',
            rolCodigo: 'CALL_CENTER',
            permisos: ['incidentes:leer'],
            delegacionId: null,
            delegacionNombre: null,
          },
          token: 'jwt',
          cargando: false,
          estaAutenticado: true,
          tienePermiso: () => false,
          tieneAlgunPermiso: () => false,
          login: vi.fn(),
          logout: vi.fn(),
          refrescarPerfil: vi.fn(),
        }}
      >
        <IncidenteDetalleDrawer
          incidenteId={mockDetalleIncidente.id}
          userId="u-callcenter"
          onCerrar={vi.fn()}
        />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('INC-2026-0042')).toBeDefined();
    });

    expect(screen.queryByRole('button', { name: /Despachar Cuadrilla Operativa/i })).toBeNull();
    expect(screen.getByTestId('aviso-rechazo-cuadrilla-reasignacion').textContent).toContain(
      'Encargado autorizado'
    );
  });
});
