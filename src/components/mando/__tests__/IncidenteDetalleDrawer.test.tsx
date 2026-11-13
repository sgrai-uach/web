import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { IncidenteDetalleDrawer } from '../IncidenteDetalleDrawer';
import * as incidentesService from '@/services/incidentesService';
import * as misionesService from '@/services/misionesService';
import type { IncidenteDetalle } from '@/services/incidentesService';
import type { MisionDetalleCompleto } from '@/types/misiones';

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

  it('renderiza estados y prioridades legibles sin mostrar el antiguo recuadro de reclasificación técnica (reemplazado por Último Reporte e ícono de afectación)', async () => {
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

    // El antiguo recuadro de reclasificación en el resumen ya no se renderiza
    expect(screen.queryByTestId('bloque-reclasificacion-terreno')).toBeNull();
    // Se muestra el botón clickeable de cambio de afectación y la sección Último Reporte de Terreno
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
    expect(desgloseFamilias.textContent).toContain('FIBE');
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
});
