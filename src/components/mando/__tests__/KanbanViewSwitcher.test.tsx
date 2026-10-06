import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KanbanViewSwitcher } from '../KanbanViewSwitcher';

describe('KanbanViewSwitcher', () => {
  it('debe renderizar ambos botones con la vista activa seleccionada', () => {
    const onCambiarVista = vi.fn();
    render(<KanbanViewSwitcher vistaActiva="kanban" onCambiarVista={onCambiarVista} />);

    const btnKanban = screen.getByRole('button', { name: /Tablero Kanban/i });
    const btnMapa = screen.getByRole('button', { name: /Mapa Operativo/i });

    expect(btnKanban).toBeInTheDocument();
    expect(btnMapa).toBeInTheDocument();
    expect(btnKanban).toHaveAttribute('aria-pressed', 'true');
    expect(btnMapa).toHaveAttribute('aria-pressed', 'false');
  });

  it('debe llamar a onCambiarVista con "mapa" al hacer clic en Mapa Operativo', () => {
    const onCambiarVista = vi.fn();
    render(<KanbanViewSwitcher vistaActiva="kanban" onCambiarVista={onCambiarVista} />);

    const btnMapa = screen.getByRole('button', { name: /Mapa Operativo/i });
    fireEvent.click(btnMapa);

    expect(onCambiarVista).toHaveBeenCalledWith('mapa');
  });

  it('debe llamar a onCambiarVista con "kanban" al hacer clic en Tablero Kanban', () => {
    const onCambiarVista = vi.fn();
    render(<KanbanViewSwitcher vistaActiva="mapa" onCambiarVista={onCambiarVista} />);

    const btnKanban = screen.getByRole('button', { name: /Tablero Kanban/i });
    fireEvent.click(btnKanban);

    expect(onCambiarVista).toHaveBeenCalledWith('kanban');
  });
});
