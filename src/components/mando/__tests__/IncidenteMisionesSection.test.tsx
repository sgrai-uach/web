import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { IncidenteMisionesSection } from '../drawer/IncidenteMisionesSection';
import type { IncidenteDetalle } from '@/services/incidentesService';

describe('Componente IncidenteMisionesSection', () => {
  const mockMisiones: IncidenteDetalle['misiones'] = [
    {
      id: 'm1000000-0000-4000-8000-000000000001',
      codigo: 'MIS-2026-0001',
      titulo: 'Despeje de cables',
      descripcion: 'Poda urgente',
      tipoMision: 'ATENCION_CUADRILLA',
      estado: 'EN_CURSO',
      prioridad: 'ALTA',
      justificacionRechazo: null,
      cuadrilla: {
        id: 'c1',
        nombre: 'Cuadrilla Alfa 1',
        estado: 'EN_MISION',
      },
      patrulla: null,
      fechaInicio: '2026-10-02T14:00:00Z',
      fechaCierre: null,
      creadoEn: '2026-10-02T13:30:00Z',
    },
  ];

  it('debe mostrar mensaje amigable cuando no hay misiones despachadas', () => {
    render(<IncidenteMisionesSection misiones={[]} />);
    expect(
      screen.getByText('No se han despachado misiones operativas para este caso.')
    ).toBeDefined();
  });

  it('debe renderizar la tarjeta de la misión con textos amigables (sin enums crudos) y el botón "Ver Detalles"', () => {
    const handleVerDetalles = vi.fn();

    render(
      <IncidenteMisionesSection
        misiones={mockMisiones}
        onVerDetalleMision={handleVerDetalles}
      />
    );

    expect(screen.getByText('MIS-2026-0001: Despeje de cables')).toBeDefined();
    // Estado formateado amigable en lugar de enum crudo
    expect(screen.getByText('En Curso')).toBeDefined();
    expect(screen.queryByText('EN_CURSO')).toBeNull();
    // Tipo formateado
    expect(screen.getByText(/Atención de Cuadrilla/i)).toBeDefined();

    const btnVerDetalles = screen.getByRole('button', {
      name: /Ver detalles de la misión MIS-2026-0001/i,
    });
    expect(btnVerDetalles).toBeDefined();

    fireEvent.click(btnVerDetalles);
    expect(handleVerDetalles).toHaveBeenCalledWith(
      'm1000000-0000-4000-8000-000000000001'
    );
  });

  it('debe renderizar el historial de misiones rechazadas con motivo de rechazo y permitir reasignar en estado REPORTADO', () => {
    const handleReasignar = vi.fn();
    const mockMisionesConRechazo: IncidenteDetalle['misiones'] = [
      {
        id: 'm-rechazada-1',
        codigo: 'MIS-2026-0099',
        titulo: 'Verificación en terreno',
        descripcion: 'Inspeccionar derrumbe',
        tipoMision: 'VERIFICACION',
        estado: 'RECHAZADA',
        prioridad: 'ALTA',
        justificacionRechazo: 'Ruta cortada por socavón en km 12, imposible acceso del móvil',
        cuadrilla: null,
        patrulla: {
          id: 'p1',
          nombre: 'Patrulla 04',
          estado: 'DISPONIBLE',
        },
        fechaInicio: null,
        fechaCierre: null,
        creadoEn: '2026-10-02T15:00:00Z',
      },
    ];

    render(
      <IncidenteMisionesSection
        misiones={mockMisionesConRechazo}
        incidenteEstado="REPORTADO"
        onAsignarPatrulla={handleReasignar}
      />
    );

    // Debe mostrar sección de historial de rechazos
    expect(screen.getByText(/Historial de Asignaciones y Rechazos \(1\)/i)).toBeDefined();
    expect(screen.getByText('MIS-2026-0099: Verificación en terreno')).toBeDefined();
    expect(screen.getByText('Rechazada')).toBeDefined();
    expect(screen.queryByText('RECHAZADA')).toBeNull();

    // Debe mostrar motivo de rechazo
    expect(
      screen.getByText('Ruta cortada por socavón en km 12, imposible acceso del móvil')
    ).toBeDefined();
    expect(screen.getByText(/Motivo del Rechazo \(Patrulla 04\):/i)).toBeDefined();

    // Debe mostrar botón para reasignar patrulla verificadora
    const btnReasignar = screen.getByRole('button', {
      name: /Reasignar patrulla verificadora/i,
    });
    expect(btnReasignar).toBeDefined();

    fireEvent.click(btnReasignar);
    expect(handleReasignar).toHaveBeenCalledTimes(1);
  });

  it('debe mostrar botón inactivo "Confirmación Pendiente" cuando hay una misión en estado DESPACHADA', () => {
    const handleAsignar = vi.fn();
    const mockMisionesDespachada: IncidenteDetalle['misiones'] = [
      {
        id: 'm-desp-1',
        codigo: 'MIS-2026-0005',
        titulo: 'Verificación en terreno',
        descripcion: null,
        tipoMision: 'VERIFICACION',
        estado: 'DESPACHADA',
        prioridad: 'MEDIA',
        justificacionRechazo: null,
        cuadrilla: null,
        patrulla: {
          id: 'p2',
          nombre: 'Patrulla 02',
          estado: 'EN_VERIFICACION',
        },
        fechaInicio: '2026-10-02T15:00:00Z',
        fechaCierre: null,
        creadoEn: '2026-10-02T15:00:00Z',
      },
    ];

    render(
      <IncidenteMisionesSection
        misiones={mockMisionesDespachada}
        incidenteEstado="REPORTADO"
        onAsignarPatrulla={handleAsignar}
      />
    );

    const btnPendiente = screen.getByRole('button', {
      name: /confirmación pendiente por la patrulla verificadora/i,
    });
    expect(btnPendiente).toBeDefined();
    expect(btnPendiente).toBeDisabled();
    expect(btnPendiente.querySelector('svg.lucide-hourglass')).not.toBeNull();

    // No debe mostrar botón activo de asignar
    expect(
      screen.queryByRole('button', {
        name: /Despachar patrulla verificadora/i,
      })
    ).toBeNull();
  });
});
