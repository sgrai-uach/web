import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AccesoDenegado } from '../AccesoDenegado';

describe('AccesoDenegado', () => {
  it('debe renderizar el título amigable de acceso restringido y el permiso legible', () => {
    render(<AccesoDenegado />);

    expect(screen.getByText(/Acceso Restringido/i)).toBeDefined();
    expect(screen.getByText(/Permisos insuficientes para el Centro de Mando/i)).toBeDefined();
    expect(screen.getByText(/Gestión Táctica del Tablero de Incidentes/i)).toBeDefined();
  });

  it('debe permitir reintentar si se proporciona la función onReintentar', () => {
    const handleReintentar = vi.fn();
    render(<AccesoDenegado onReintentar={handleReintentar} />);

    const boton = screen.getByRole('button', {
      name: /Reintentar acceso/i,
    });
    expect(boton).toBeDefined();

    fireEvent.click(boton);
    expect(handleReintentar).toHaveBeenCalledTimes(1);
  });
});
