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

    expect(screen.getByText('MIS-2026-0001: Despeje de cables')).toBeDefined();
    expect(screen.getByText('EN_CURSO')).toBeDefined();

    const btnVerDetalles = screen.getByRole('button', {
      name: /Ver detalles de la misión MIS-2026-0001/i,
    });
    expect(btnVerDetalles).toBeDefined();

    fireEvent.click(btnVerDetalles);
    expect(handleVerDetalles).toHaveBeenCalledWith(
      'm1000000-0000-4000-8000-000000000001'
    );
  });
});
