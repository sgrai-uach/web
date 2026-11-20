import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventoPrevencionDrawer } from '../EventoPrevencionDrawer';
import type { EventoPrevencionListItemDTO } from '@/types/evento-prevencion';

vi.mock('@/components/maps/LocationPickerMap', () => ({
  default: () => <div data-testid="mock-location-picker-map" />,
}));

describe('EventoPrevencionDrawer (HU-76)', () => {
  const mockEventoConPuntoCritico: EventoPrevencionListItemDTO = {
    id: 'ev-1',
    codigo: 'PREV-2026-0001',
    nombre: 'Limpieza de rejillas y alcantarillas',
    descripcion: 'Instrucción de monitoreo del caudal fluvial.',
    sector: 'Angachilla',
    direccionTexto: 'Av. Simpson 1200',
    prioridad: 'ALTA',
    estado: 'EN_CURSO',
    latitud: -39.8456,
    longitud: -73.2389,
    ubicacionGeoJson: { type: 'Point', coordinates: [-73.2389, -39.8456] },
    delegacion: { id: 'del-sur', codigo: 'SUR', nombre: 'Delegación Sur' },
    puntoCritico: {
      id: 'pc-1',
      codigo: 'PC-ANG-01',
      nombre: 'Humedal Angachilla - Rejilla Sur',
      descripcion: 'Punto crítico de acumulación de hojas y barro.',
      tipoRiesgo: 'Inundación',
      prioridad: 'ALTA',
      latitud: -39.8456,
      longitud: -73.2389,
      ubicacionGeoJson: { type: 'Point', coordinates: [-73.2389, -39.8456] },
    },
    patrulla: { id: 'pat-1', nombre: 'Patrulla Rápida Sur', estado: 'EN_PREVENCION' },
    cuadrilla: null,
    mision: {
      id: 'mis-1',
      codigo: 'MIS-2026-0001',
      titulo: 'Limpieza de sumideros',
      estado: 'EN_EJECUCION',
      tipoMision: 'PREVENCION',
      fechaInicio: '2026-11-19T08:00:00Z',
      fechaCierre: null,
    },
    creadoEn: '2026-11-19T07:00:00Z',
    actualizadoEn: '2026-11-19T07:30:00Z',
  };

  const mockEventoSinPuntoCritico: EventoPrevencionListItemDTO = {
    ...mockEventoConPuntoCritico,
    id: 'ev-2',
    codigo: 'PREV-2026-0002',
    puntoCritico: null,
    sector: 'Sector Las Ánimas',
    direccionTexto: 'Calle Sedeñor 450',
    cuadrilla: { id: 'cua-1', nombre: 'Cuadrilla Norte 1', estado: 'EN_MISION' },
    patrulla: null,
  };

  it('no debe renderizar nada cuando isOpen es false o evento es null', () => {
    const { container } = render(
      <EventoPrevencionDrawer
        evento={mockEventoConPuntoCritico}
        isOpen={false}
        onClose={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('debe renderizar ficha PostGIS cuando el punto crítico está asociado', () => {
    render(
      <EventoPrevencionDrawer
        evento={mockEventoConPuntoCritico}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('PREV-2026-0001')).toBeInTheDocument();
    expect(screen.getByText('Humedal Angachilla - Rejilla Sur')).toBeInTheDocument();
    expect(screen.getByText('Inundación')).toBeInTheDocument();
    expect(screen.getByText('Patrulla Rápida Sur')).toBeInTheDocument();
    expect(screen.getByTestId('mock-location-picker-map')).toBeInTheDocument();
  });

  it('debe renderizar alerta fallback de coordenadas libres cuando puntoCritico es null', () => {
    render(
      <EventoPrevencionDrawer
        evento={mockEventoSinPuntoCritico}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('PREV-2026-0002')).toBeInTheDocument();
    expect(screen.getByText(/Evento con coordenadas libres/i)).toBeInTheDocument();
    expect(screen.getByText('Sector Las Ánimas')).toBeInTheDocument();
    expect(screen.getByText('Calle Sedeñor 450')).toBeInTheDocument();
    expect(screen.getByText('Cuadrilla Norte 1')).toBeInTheDocument();
  });

  it('debe disparar onClose al presionar el botón de cierre [✕]', () => {
    const onClose = vi.fn();
    render(
      <EventoPrevencionDrawer
        evento={mockEventoConPuntoCritico}
        isOpen={true}
        onClose={onClose}
      />
    );

    const btnCerrar = screen.getByRole('button', { name: /Cerrar panel lateral/i });
    fireEvent.click(btnCerrar);

    expect(onClose).toHaveBeenCalled();
  });

  it('debe disparar onClose al presionar la tecla Escape', () => {
    const onClose = vi.fn();
    render(
      <EventoPrevencionDrawer
        evento={mockEventoConPuntoCritico}
        isOpen={true}
        onClose={onClose}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalled();
  });

  it('debe mostrar el botón "Editar Preventivo" cuando tiene permiso y el estado es activo (H77)', () => {
    const onEditarEvento = vi.fn();
    render(
      <EventoPrevencionDrawer
        evento={mockEventoConPuntoCritico}
        isOpen={true}
        onClose={vi.fn()}
        puedeEditar={true}
        onEditarEvento={onEditarEvento}
      />
    );

    const btnEditar = screen.getByRole('button', { name: /Editar Preventivo/i });
    expect(btnEditar).toBeInTheDocument();

    fireEvent.click(btnEditar);
    expect(onEditarEvento).toHaveBeenCalledWith(mockEventoConPuntoCritico);
  });

  it('debe ocultar el botón "Editar Preventivo" cuando el evento está COMPLETADA o CANCELADA (H77)', () => {
    const { rerender } = render(
      <EventoPrevencionDrawer
        evento={{ ...mockEventoConPuntoCritico, estado: 'COMPLETADA' }}
        isOpen={true}
        onClose={vi.fn()}
        puedeEditar={true}
        onEditarEvento={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: /Editar Preventivo/i })).not.toBeInTheDocument();

    rerender(
      <EventoPrevencionDrawer
        evento={{ ...mockEventoConPuntoCritico, estado: 'CANCELADA' }}
        isOpen={true}
        onClose={vi.fn()}
        puedeEditar={true}
        onEditarEvento={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: /Editar Preventivo/i })).not.toBeInTheDocument();
  });

  it('debe mostrar enlace "Asignar Patrulla y Recursos" cuando puedeAsignar es true y el evento está activo, y "Ver Ficha Completa" si está cerrado (HU-33)', () => {
    const { rerender } = render(
      <EventoPrevencionDrawer
        evento={mockEventoConPuntoCritico}
        isOpen={true}
        onClose={vi.fn()}
        puedeAsignar={true}
      />
    );

    const linkAsignar = screen.getByRole('link', { name: /Asignar Patrulla y Recursos/i });
    expect(linkAsignar).toHaveAttribute('href', '/eventos-atp/prevencion/ev-1');

    rerender(
      <EventoPrevencionDrawer
        evento={{ ...mockEventoConPuntoCritico, estado: 'COMPLETADA' }}
        isOpen={true}
        onClose={vi.fn()}
        puedeAsignar={true}
      />
    );

    const linkFicha = screen.getByRole('link', { name: /Ver Ficha Completa/i });
    expect(linkFicha).toHaveAttribute('href', '/eventos-atp/prevencion/ev-1');
  });
});
