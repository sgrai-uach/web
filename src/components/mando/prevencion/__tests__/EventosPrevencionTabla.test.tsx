import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventosPrevencionTabla } from '../EventosPrevencionTabla';
import type { EventoPrevencionListItemDTO } from '@/types/evento-prevencion';

describe('EventosPrevencionTabla (HU-76)', () => {
  const mockEventos: EventoPrevencionListItemDTO[] = [
    {
      id: 'ev-1',
      codigo: 'PREV-2026-0001',
      nombre: 'Limpieza de sumideros',
      descripcion: 'Mitigación en collico',
      sector: 'Collico',
      direccionTexto: 'Av. Balmaceda 100',
      prioridad: 'ALTA',
      estado: 'EN_CURSO',
      latitud: -39.81,
      longitud: -73.24,
      ubicacionGeoJson: null,
      delegacion: { id: 'del-1', codigo: 'CALLE', nombre: 'Calle Calle' },
      puntoCritico: {
        id: 'pc-1',
        codigo: 'PC-COL-01',
        nombre: 'Cruce Férreo Collico',
        descripcion: 'Inundación recurrente',
        tipoRiesgo: 'Anegamiento',
        prioridad: 'ALTA',
        latitud: -39.81,
        longitud: -73.24,
        ubicacionGeoJson: null,
      },
      patrulla: { id: 'pat-1', nombre: 'Patrulla Centro-Sur', estado: 'EN_PREVENCION' },
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
    },
    {
      id: 'ev-2',
      codigo: 'PREV-2026-0002',
      nombre: 'Poda preventiva en faja cortafuego',
      descripcion: null,
      sector: 'Niebla',
      direccionTexto: null,
      prioridad: 'MEDIA',
      estado: 'PLANIFICADA',
      latitud: -39.85,
      longitud: -73.35,
      ubicacionGeoJson: null,
      delegacion: { id: 'del-2', codigo: 'COSTA', nombre: 'Costa' },
      puntoCritico: null,
      patrulla: null,
      cuadrilla: { id: 'cua-1', nombre: 'Cuadrilla Costa', estado: 'EN_MISION' },
      mision: null,
      creadoEn: '2026-11-19T08:00:00Z',
      actualizadoEn: '2026-11-19T08:00:00Z',
    },
  ];

  it('debe renderizar columnas y filas de eventos preventivos', () => {
    render(
      <EventosPrevencionTabla
        eventos={mockEventos}
        onSeleccionarEvento={vi.fn()}
      />
    );

    expect(screen.getByText('PREV-2026-0001')).toBeInTheDocument();
    expect(screen.getByText('Cruce Férreo Collico')).toBeInTheDocument();
    expect(screen.getByText('Calle Calle')).toBeInTheDocument();
    expect(screen.getByText('Patrulla Centro-Sur')).toBeInTheDocument();

    expect(screen.getByText('PREV-2026-0002')).toBeInTheDocument();
    expect(screen.getByText('Coordenadas libres')).toBeInTheDocument();
    expect(screen.getByText('Cuadrilla Costa')).toBeInTheDocument();
  });

  it('debe disparar onSeleccionarEvento al hacer clic en una fila o en el botón Detalle', () => {
    const onSeleccionarEvento = vi.fn();
    render(
      <EventosPrevencionTabla
        eventos={mockEventos}
        onSeleccionarEvento={onSeleccionarEvento}
      />
    );

    const botonesDetalle = screen.getAllByRole('button', { name: /Detalle/i });
    fireEvent.click(botonesDetalle[0]);

    expect(onSeleccionarEvento).toHaveBeenCalledWith(mockEventos[0]);
  });

  it('debe mostrar mensaje vacío cuando no hay eventos', () => {
    render(
      <EventosPrevencionTabla
        eventos={[]}
        onSeleccionarEvento={vi.fn()}
      />
    );

    expect(screen.getByText(/No se encontraron eventos u operativos de prevención/i)).toBeInTheDocument();
  });

  it('debe mostrar skeleton de carga cuando cargando es true', () => {
    render(
      <EventosPrevencionTabla
        eventos={[]}
        onSeleccionarEvento={vi.fn()}
        cargando={true}
      />
    );

    expect(screen.getByText(/Cargando eventos preventivos en terreno.../i)).toBeInTheDocument();
  });

  it('debe mostrar el botón Editar en la columna de acciones cuando puedeEditar es true y deshabilitarlo en COMPLETADA/CANCELADA (H77)', () => {
    const onEditarEvento = vi.fn();
    const onSeleccionarEvento = vi.fn();
    const eventosConCerrado = [
      mockEventos[0],
      { ...mockEventos[1], estado: 'COMPLETADA' as const },
    ];

    render(
      <EventosPrevencionTabla
        eventos={eventosConCerrado}
        onSeleccionarEvento={onSeleccionarEvento}
        puedeEditar={true}
        onEditarEvento={onEditarEvento}
      />
    );

    const btnEditarActivo = screen.getByRole('button', { name: `Editar ${mockEventos[0].codigo}` });
    const btnEditarCerrado = screen.getByRole('button', { name: `Editar ${mockEventos[1].codigo}` });

    expect(btnEditarActivo).not.toBeDisabled();
    expect(btnEditarCerrado).toBeDisabled();

    fireEvent.click(btnEditarActivo);
    expect(onEditarEvento).toHaveBeenCalledWith(mockEventos[0]);
    expect(onSeleccionarEvento).not.toHaveBeenCalled();
  });

  it('debe mostrar enlace Asignar en eventos activos y botón deshabilitado en COMPLETADA cuando puedeAsignar es true (HU-33)', () => {
    const eventosConCerrado = [
      mockEventos[0],
      { ...mockEventos[1], estado: 'COMPLETADA' as const },
    ];

    render(
      <EventosPrevencionTabla
        eventos={eventosConCerrado}
        onSeleccionarEvento={vi.fn()}
        puedeAsignar={true}
      />
    );

    const linkAsignarActivo = screen.getByRole('link', {
      name: `Asignar recursos a ${mockEventos[0].codigo}`,
    });
    expect(linkAsignarActivo).toHaveAttribute('href', '/eventos-atp/prevencion/ev-1');

    const btnAsignarCerrado = screen.getByRole('button', {
      name: `Asignar recursos a ${mockEventos[1].codigo}`,
    });
    expect(btnAsignarCerrado).toBeDisabled();
  });
});
