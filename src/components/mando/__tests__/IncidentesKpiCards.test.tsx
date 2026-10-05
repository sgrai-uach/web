import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IncidentesKpiCards } from '../IncidentesKpiCards';
import type { IncidentesKpisData } from '@/types/incidentesKpis';

const mockKpis: IncidentesKpisData = {
  fecha: '2026-10-03',
  zonaHoraria: 'America/Santiago',
  delegacionId: null,
  total: 40,
  contadores: {
    reportado: 8,
    verificando: 3,
    enAtencion: 12,
    noAbordables: 2,
    resueltos: 15,
  },
  actualizadoEn: '2026-10-03T17:30:00.000Z',
};

const mockDelegaciones = [
  { id: 'del-1', codigo: 'NORTE', nombre: 'Delegación Norte' },
  { id: 'del-2', codigo: 'SUR', nombre: 'Delegación Sur' },
];

describe('IncidentesKpiCards', () => {
  it('debe renderizar el título de panorama del día y los 5 contadores de estado', () => {
    const onSelectEstado = vi.fn();
    const onDelegacionChange = vi.fn();
    const onRefrescar = vi.fn();

    render(
      <IncidentesKpiCards
        kpis={mockKpis}
        cargando={false}
        delegacionId=""
        onDelegacionChange={onDelegacionChange}
        delegaciones={mockDelegaciones}
        onRefrescar={onRefrescar}
        estadoSeleccionado={null}
        onSelectEstado={onSelectEstado}
        conectado={true}
      />
    );

    expect(screen.getByText(/Panorama del Día — Vista Rápida de Incidentes/i)).toBeDefined();
    expect(screen.getByText(/40 casos totales/i)).toBeDefined();

    // Comprobar presencia de tarjetas y sus números
    expect(screen.getByText('Reportados')).toBeDefined();
    expect(screen.getByText('8')).toBeDefined();

    expect(screen.getByText('En Verificación')).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();

    expect(screen.getByText('En Atención')).toBeDefined();
    expect(screen.getByText('12')).toBeDefined();

    expect(screen.getByText('No Abordables')).toBeDefined();
    expect(screen.getByText('2')).toBeDefined();

    expect(screen.getByText('Resueltos')).toBeDefined();
    expect(screen.getByText('15')).toBeDefined();

    // Indicador en vivo
    expect(screen.getByText('En Vivo')).toBeDefined();
  });

  it('debe emitir onSelectEstado al hacer clic en una tarjeta', () => {
    const onSelectEstado = vi.fn();

    render(
      <IncidentesKpiCards
        kpis={mockKpis}
        cargando={false}
        delegacionId=""
        onDelegacionChange={vi.fn()}
        delegaciones={mockDelegaciones}
        onRefrescar={vi.fn()}
        estadoSeleccionado={null}
        onSelectEstado={onSelectEstado}
        conectado={true}
      />
    );

    const btnEnAtencion = screen.getByRole('button', { name: /Filtrar por En Atención: 12 incidentes/i });
    fireEvent.click(btnEnAtencion);

    expect(onSelectEstado).toHaveBeenCalledWith('EN_ATENCION');
  });

  it('debe marcar la tarjeta activa con el tag Enfocado', () => {
    render(
      <IncidentesKpiCards
        kpis={mockKpis}
        cargando={false}
        delegacionId=""
        onDelegacionChange={vi.fn()}
        delegaciones={mockDelegaciones}
        onRefrescar={vi.fn()}
        estadoSeleccionado="EN_ATENCION"
        onSelectEstado={vi.fn()}
        conectado={true}
      />
    );

    expect(screen.getByText('Enfocado')).toBeDefined();
  });

  it('debe emitir onDelegacionChange al seleccionar una delegación', () => {
    const onDelegacionChange = vi.fn();

    render(
      <IncidentesKpiCards
        kpis={mockKpis}
        cargando={false}
        delegacionId=""
        onDelegacionChange={onDelegacionChange}
        delegaciones={mockDelegaciones}
        onRefrescar={vi.fn()}
        estadoSeleccionado={null}
        onSelectEstado={vi.fn()}
        conectado={true}
      />
    );

    const select = screen.getByRole('combobox', { name: /Filtrar KPIs por delegación territorial/i });
    fireEvent.change(select, { target: { value: 'del-1' } });

    expect(onDelegacionChange).toHaveBeenCalledWith('del-1');
  });

  it('debe emitir onRefrescar al hacer clic en el botón de actualización', () => {
    const onRefrescar = vi.fn();

    render(
      <IncidentesKpiCards
        kpis={mockKpis}
        cargando={false}
        delegacionId=""
        onDelegacionChange={vi.fn()}
        delegaciones={mockDelegaciones}
        onRefrescar={onRefrescar}
        estadoSeleccionado={null}
        onSelectEstado={vi.fn()}
        conectado={true}
      />
    );

    const btnRefrescar = screen.getByRole('button', { name: /Actualizar contadores de incidentes/i });
    fireEvent.click(btnRefrescar);

    expect(onRefrescar).toHaveBeenCalled();
  });
});
