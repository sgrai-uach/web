import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AccesoDenegado } from '../AccesoDenegado';

describe('AccesoDenegado', () => {
  it('debe renderizar el título de acceso restringido y el mensaje adaptado de permisos insuficientes', () => {
    render(<AccesoDenegado />);

    expect(screen.getByText(/Acceso Restringido/i)).toBeDefined();
    expect(screen.getByText(/Permisos insuficientes para el Centro de Mando/i)).toBeDefined();
    expect(
      screen.getByText(
        /No cuenta con los permisos necesarios para acceder a esta sección. Si requiere acceso, puede solicitarlos a un administrador./i
      )
    ).toBeDefined();
    expect(screen.getByRole('link', { name: /Ir a Bandeja de Avisos/i })).toBeDefined();
  });
});
