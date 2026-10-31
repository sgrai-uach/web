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

  it('debe renderizar el botón "Nuevo Evento" y desplegar "Nuevo Evento de Prevención" para ejecutar onOpenCrearPrevencion', () => {
    const onOpenCrearPrevencion = vi.fn();

    render(
      <KanbanHeader
        totalIncidentesVisibles={5}
        conectado={true}
        onOpenCrearPrevencion={onOpenCrearPrevencion}
      />
    );

    // Abrir dropdown compacto
    const btnDropdown = screen.getByRole('button', { name: /Nuevo Evento/i });
    expect(btnDropdown).toBeInTheDocument();
    fireEvent.click(btnDropdown);

    const btnPrevencion = screen.getByRole('menuitem', { name: /Nuevo Evento de Prevención/i });
    expect(btnPrevencion).toBeInTheDocument();

    fireEvent.click(btnPrevencion);
    expect(onOpenCrearPrevencion).toHaveBeenCalledTimes(1);
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

  it('debe renderizar el botón "Nuevo Evento" y desplegar "Nuevo Evento de Recuperación" si se pasa onOpenCrearRecuperacion', () => {
    const onOpenCrearRecuperacion = vi.fn();

    render(
      <KanbanHeader
        totalIncidentesVisibles={5}
        conectado={true}
        onOpenCrearRecuperacion={onOpenCrearRecuperacion}
      />
    );

    // Abrir dropdown compacto
    const btnDropdown = screen.getByRole('button', { name: /Nuevo Evento/i });
    expect(btnDropdown).toBeInTheDocument();
    fireEvent.click(btnDropdown);

    const btnRecuperacion = screen.getByRole('menuitem', { name: /Nuevo Evento de Recuperación/i });
    expect(btnRecuperacion).toBeInTheDocument();

    fireEvent.click(btnRecuperacion);
    expect(onOpenCrearRecuperacion).toHaveBeenCalledTimes(1);
  });

  it('no debe renderizar el botón de Patrullas Verificadoras en el centro de mando', () => {
    render(
      <KanbanHeader
        totalIncidentesVisibles={5}
        conectado={true}
      />
    );

    const btnPatrullas = screen.queryByRole('button', { name: /Patrullas Verificadoras/i });
    expect(btnPatrullas).not.toBeInTheDocument();
  });
});
