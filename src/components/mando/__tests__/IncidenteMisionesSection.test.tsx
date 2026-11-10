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

  it('debe renderizar la tarjeta de la misión y el botón "Ver Detalles"', () => {
    const handleVerDetalles = vi.fn();

    render(
      <IncidenteMisionesSection
        misiones={mockMisiones}
        onVerDetalleMision={handleVerDetalles}
      />
    );

    expect(screen.getByText('MIS-2026-0001')).toBeDefined();
    expect(screen.getByText('Despeje de cables')).toBeDefined();
    expect(screen.getByText('En curso')).toBeDefined();
    expect(screen.getByText(/Atención de cuadrilla/i)).toBeDefined();
    expect(screen.getByText(/\(En misión\)/i)).toBeDefined();

    const btnVerDetalles = screen.getByRole('button', {
      name: /Ver detalles de la misión MIS-2026-0001/i,
    });
    expect(btnVerDetalles).toBeDefined();

    fireEvent.click(btnVerDetalles);
    expect(handleVerDetalles).toHaveBeenCalledWith(
      'm1000000-0000-4000-8000-000000000001'
    );
  });

  it('debe mostrar el botón de despachar patrulla verificadora cuando el incidente está en REPORTADO aunque tenga misiones previas no activas (BUG-02)', () => {
    const handleAsignarPatrulla = vi.fn();

    render(
      <IncidenteMisionesSection
        misiones={mockMisiones}
        incidenteEstado="REPORTADO"
        onAsignarPatrulla={handleAsignarPatrulla}
      />
    );

    const btnDespachar = screen.getByRole('button', {
      name: /Despachar Patrulla Verificadora/i,
    });
    expect(btnDespachar).toBeDefined();

    fireEvent.click(btnDespachar);
    expect(handleAsignarPatrulla).toHaveBeenCalled();
  });

  it('no debe mostrar el botón de despacho si puedeAsignar es false (BUG-03)', () => {
    const handleAsignarPatrulla = vi.fn();

    render(
      <IncidenteMisionesSection
        misiones={[]}
        incidenteEstado="REPORTADO"
        onAsignarPatrulla={handleAsignarPatrulla}
        puedeAsignar={false}
      />
    );

    expect(
      screen.queryByRole('button', { name: /Despachar Patrulla Verificadora/i })
    ).toBeNull();
  });

  it('debe renderizar chip semántico de rechazo y bloque de justificación cuando la misión fue rechazada', () => {
    const misionRechazada: IncidenteDetalle['misiones'][number] = {
      id: 'm-rechazada-1',
      codigo: 'MIS-2026-9001',
      titulo: 'Evaluación de desborde',
      descripcion: 'Evaluar altura de agua',
      tipoMision: 'VERIFICACION',
      estado: 'RECHAZADA',
      prioridad: 'CRITICA',
      justificacionRechazo: 'Vía cortada por derrumbe previo, imposible acceder con vehículo 4x4.',
      cuadrilla: null,
      patrulla: {
        id: 'pat-1',
        nombre: 'Patrulla Isla Teja',
        estado: 'DISPONIBLE',
      },
      fechaInicio: null,
      fechaCierre: null,
      creadoEn: '2026-11-10T08:00:00Z',
    };

    render(<IncidenteMisionesSection misiones={[misionRechazada]} />);

    expect(screen.getByText('Rechazada')).toBeDefined();
    expect(screen.getByText(/Verificación en terreno/i)).toBeDefined();
    expect(screen.getByText(/Patrulla Isla Teja/i)).toBeDefined();
    expect(screen.getByText(/\(Disponible\)/i)).toBeDefined();
    expect(screen.getByText(/Motivo de Rechazo en Terreno:/i)).toBeDefined();
    expect(
      screen.getByText('Vía cortada por derrumbe previo, imposible acceder con vehículo 4x4.')
    ).toBeDefined();
  });
});
