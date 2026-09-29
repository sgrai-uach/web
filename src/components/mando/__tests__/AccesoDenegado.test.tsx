import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AccesoDenegado } from '../AccesoDenegado';

describe('AccesoDenegado', () => {
  it('debe renderizar el título de acceso restringido y mensaje de rol Encargado', () => {
    render(<AccesoDenegado />);

    expect(screen.getByText(/Acceso Restringido — 403 Forbidden/i)).toBeDefined();
    expect(screen.getByText(/Encargado de Operaciones/i)).toBeDefined();
    expect(screen.getByText(/incidentes:kanban/i)).toBeDefined();
  });

  it('debe permitir reintentar si se proporciona la función onReintentar', () => {
    const handleReintentar = vi.fn();
    render(<AccesoDenegado onReintentar={handleReintentar} />);

    const boton = screen.getByRole('button', {
      name: /Reintentar con Sesión de Encargado/i,
    });
    expect(boton).toBeDefined();

    fireEvent.click(boton);
    expect(handleReintentar).toHaveBeenCalledTimes(1);
  });
});
