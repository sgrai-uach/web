import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '../Pagination';

describe('Pagination Component (F-02)', () => {
  it('no debe renderizar nada cuando currentTotal es 0 (lista vacía)', () => {
    const { container } = render(
      <Pagination
        paginaActual={1}
        totalPaginas={1}
        totalItems={0}
        limite={20}
        onCambiarPagina={vi.fn()}
        onCambiarLimite={vi.fn()}
        nombreEntidad="avisos"
      />
    );

    expect(container.firstChild).toBeNull();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('no debe renderizar nada cuando total es 0 con prop total', () => {
    const { container } = render(
      <Pagination
        pagina={1}
        totalPaginas={1}
        total={0}
        limite={10}
        onCambiarPagina={vi.fn()}
        onCambiarLimite={vi.fn()}
        nombreEntidad="recursos"
      />
    );

    expect(container.firstChild).toBeNull();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('debe renderizarse correctamente cuando hay al menos 1 elemento', () => {
    render(
      <Pagination
        paginaActual={1}
        totalPaginas={2}
        totalItems={25}
        limite={20}
        onCambiarPagina={vi.fn()}
        onCambiarLimite={vi.fn()}
        nombreEntidad="avisos"
      />
    );

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText(/Mostrando/i)).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText(/avisos/i)).toBeInTheDocument();
  });

  it('debe invocar onCambiarPagina al hacer click en Siguiente', () => {
    const onCambiarPagina = vi.fn();
    render(
      <Pagination
        paginaActual={1}
        totalPaginas={3}
        totalItems={50}
        limite={20}
        onCambiarPagina={onCambiarPagina}
        onCambiarLimite={vi.fn()}
        nombreEntidad="elementos"
      />
    );

    const btnSiguiente = screen.getByRole('button', { name: /Página siguiente/i });
    fireEvent.click(btnSiguiente);
    expect(onCambiarPagina).toHaveBeenCalledWith(2);
  });

  it('debe invocar onCambiarLimite al cambiar el selector de límite', () => {
    const onCambiarLimite = vi.fn();
    render(
      <Pagination
        paginaActual={1}
        totalPaginas={5}
        totalItems={100}
        limite={20}
        onCambiarPagina={vi.fn()}
        onCambiarLimite={onCambiarLimite}
        nombreEntidad="elementos"
      />
    );

    const select = screen.getByLabelText(/Cantidad de elementos por página/i);
    fireEvent.change(select, { target: { value: '50' } });
    expect(onCambiarLimite).toHaveBeenCalledWith(50);
  });
});
