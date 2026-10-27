import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IncidenteDetalleDrawer } from '../IncidenteDetalleDrawer';
import * as incidentesService from '@/services/incidentesService';
import * as misionesService from '@/services/misionesService';
import type { IncidenteDetalle } from '@/services/incidentesService';
import type { MisionDetalleCompleto } from '@/types/misiones';

vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showInfo: vi.fn(),
    showWarning: vi.fn(),
  }),
}));

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
      expect(screen.getByText('MIS-2026-0001: Despeje de cables')).toBeDefined();
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

  it('muestra el botón "Asignar Patrulla" cuando el incidente está en estado REPORTADO y abre el modal', async () => {
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

    // En estado REPORTADO, los botones de asignar patrulla deben estar presentes
    const botonesAsignar = screen.getAllByRole('button', { name: /Asignar Patrulla/i });
    expect(botonesAsignar.length).toBeGreaterThan(0);

    // Clic en el primer botón de asignar patrulla
    fireEvent.click(botonesAsignar[0]);

    // Debe abrirse el modal de asignación de patrulla
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /Asignar Patrulla Verificadora/i })).toBeDefined();
    });
  });

  it('NO muestra el botón "Asignar Patrulla" si el incidente ya está en estado EN_ATENCION o VERIFICANDO', async () => {
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
    const btnAsignar = screen.queryByRole('button', { name: /Asignar Patrulla/i });
    expect(btnAsignar).toBeNull();
  });
});
