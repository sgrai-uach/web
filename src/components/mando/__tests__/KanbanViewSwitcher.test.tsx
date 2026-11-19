import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KanbanViewSwitcher } from '../KanbanViewSwitcher';

describe('KanbanViewSwitcher', () => {
  it('debe renderizar los botones con la vista activa seleccionada', () => {
    const onCambiarVista = vi.fn();
    render(<KanbanViewSwitcher vistaActiva="kanban" onCambiarVista={onCambiarVista} />);

    const btnKanban = screen.getByRole('button', { name: /Tablero Kanban/i });
    const btnMapa = screen.getByRole('button', { name: /Mapa Operativo/i });
    const btnPrevencion = screen.getByRole('button', { name: /Eventos Preventivos/i });

    expect(btnKanban).toBeInTheDocument();
    expect(btnMapa).toBeInTheDocument();
    expect(btnPrevencion).toBeInTheDocument();
    expect(btnKanban).toHaveAttribute('aria-pressed', 'true');
    expect(btnMapa).toHaveAttribute('aria-pressed', 'false');
    expect(btnPrevencion).toHaveAttribute('aria-pressed', 'false');
  });

  it('debe llamar a onCambiarVista con "mapa" al hacer clic en Mapa Operativo', () => {
    const onCambiarVista = vi.fn();
    render(<KanbanViewSwitcher vistaActiva="kanban" onCambiarVista={onCambiarVista} />);

    const btnMapa = screen.getByRole('button', { name: /Mapa Operativo/i });
    fireEvent.click(btnMapa);

    expect(onCambiarVista).toHaveBeenCalledWith('mapa');
  });

  it('debe llamar a onCambiarVista con "prevencion" al hacer clic en Eventos Preventivos', () => {
    const onCambiarVista = vi.fn();
    render(<KanbanViewSwitcher vistaActiva="kanban" onCambiarVista={onCambiarVista} />);

    const btnPrevencion = screen.getByRole('button', { name: /Eventos Preventivos/i });
    fireEvent.click(btnPrevencion);

    expect(onCambiarVista).toHaveBeenCalledWith('prevencion');
  });

  it('debe llamar a onCambiarVista con "kanban" al hacer clic en Tablero Kanban', () => {
    const onCambiarVista = vi.fn();
    render(<KanbanViewSwitcher vistaActiva="prevencion" onCambiarVista={onCambiarVista} />);

    const btnKanban = screen.getByRole('button', { name: /Tablero Kanban/i });
    fireEvent.click(btnKanban);

    expect(onCambiarVista).toHaveBeenCalledWith('kanban');
  });
});
