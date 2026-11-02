import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '../page';

describe('Home Page — Portales de Acceso SGRAI', () => {
  it('renderiza los tres portales de acceso institucionales', () => {
    render(<Home />);

    expect(
      screen.getByRole('heading', { name: /portal de atención ciudadana/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /portal de gestión de recursos e incidentes/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /aplicación operativa de terreno/i })
    ).toBeInTheDocument();
  });

  it('incluye los botones con enlaces hacia /ciudadania, /gestion y /terreno', () => {
    render(<Home />);

    const linkCiudadania = screen.getByRole('link', { name: /ingresar al portal ciudadano/i });
    expect(linkCiudadania).toHaveAttribute('href', '/ciudadania');

    const linkGestion = screen.getByRole('link', { name: /acceder al portal de gestión/i });
    expect(linkGestion).toHaveAttribute('href', '/gestion');

    const linkTerreno = screen.getByRole('link', { name: /ingresar a app de terreno/i });
    expect(linkTerreno).toHaveAttribute('href', '/terreno');
  });

  it('describe las capacidades operativas de Patrulla Verificadora y Delegado de Cuadrilla en la tarjeta de terreno', () => {
    render(<Home />);

    expect(
      screen.getByText(/verificación y triage primario de incidentes en terreno/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/ejecución de faenas pesadas, evidencia y cierre técnico/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/posicionamiento gps y cola de sincronización offline/i)
    ).toBeInTheDocument();
  });
});
