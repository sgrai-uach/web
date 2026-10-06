import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { KanbanHeader } from '../KanbanHeader';

describe('KanbanHeader (HU-30)', () => {
  it('debe renderizar el título institucional y contadores', () => {
    render(
      <KanbanHeader
        totalIncidentesVisibles={12}
        conectado={true}
      />
    );

    expect(screen.getByRole('heading', { name: 'Centro de Mando', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('12 incidentes')).toBeInTheDocument();
  });

  it('debe renderizar el botón "Nuevo Evento de Prevención" y ejecutar onOpenCrearPrevencion', () => {
    const onOpenCrearPrevencion = vi.fn();

    render(
      <KanbanHeader
        totalIncidentesVisibles={5}
        conectado={true}
        onOpenCrearPrevencion={onOpenCrearPrevencion}
      />
    );

    const btnPrevencion = screen.getByRole('button', { name: /Nuevo Evento de Prevención/i });
    expect(btnPrevencion).toBeInTheDocument();

    fireEvent.click(btnPrevencion);
    expect(onOpenCrearPrevencion).toHaveBeenCalledTimes(1);
  });

  it('debe permitir conmutar entre Tablero Kanban y Mapa Operativo', () => {
    const onCambiarVista = vi.fn();

    render(
      <KanbanHeader
        totalIncidentesVisibles={5}
        conectado={true}
        vistaActiva="kanban"
        onCambiarVista={onCambiarVista}
      />
    );

    const btnMapa = screen.getByRole('button', { name: /Mapa Operativo/i });
    expect(btnMapa).toBeInTheDocument();

    fireEvent.click(btnMapa);
    expect(onCambiarVista).toHaveBeenCalledWith('mapa');
  });

  it('debe renderizar el botón de Misiones Operativas si se pasa onAbrirMisiones', () => {
    const onAbrirMisiones = vi.fn();

    render(
      <KanbanHeader
        totalIncidentesVisibles={5}
        conectado={true}
        onAbrirMisiones={onAbrirMisiones}
      />
    );

    const btnMisiones = screen.getByRole('button', { name: /Misiones Operativas/i });
    expect(btnMisiones).toBeInTheDocument();

    fireEvent.click(btnMisiones);
    expect(onAbrirMisiones).toHaveBeenCalledTimes(1);
  });

  it('debe renderizar el botón "Nuevo Evento de Recuperación" si se pasa onOpenCrearRecuperacion', () => {
    const onOpenCrearRecuperacion = vi.fn();

    render(
      <KanbanHeader
        totalIncidentesVisibles={5}
        conectado={true}
        onOpenCrearRecuperacion={onOpenCrearRecuperacion}
      />
    );

    const btnRecuperacion = screen.getByRole('button', { name: /Nuevo Evento de Recuperación/i });
    expect(btnRecuperacion).toBeInTheDocument();

    fireEvent.click(btnRecuperacion);
    expect(onOpenCrearRecuperacion).toHaveBeenCalledTimes(1);
  });
});
