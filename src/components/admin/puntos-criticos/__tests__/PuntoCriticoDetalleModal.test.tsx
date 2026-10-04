import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PuntoCriticoDetalleModal from '../PuntoCriticoDetalleModal';
import type { PuntoCriticoItem } from '@/types/puntoCritico';

const mockPunto: PuntoCriticoItem = {
  id: '40000000-0000-4000-8000-000000000001',
  codigo: 'PC-ANG-01',
  nombre: 'Sector Humedal Angachilla - Pasaje Los Robles',
  descripcion: 'Zona baja con riesgo recurrente de anegamiento por desborde en temporada invernal',
  tipoRiesgo: 'Inundación y anegamiento',
  prioridad: 'ALTA',
  activo: true,
  estadoTexto: 'Activo',
  latitud: -39.8456,
  longitud: -73.2389,
  delegacion: {
    id: '30000000-0000-4000-8000-000000000002',
    codigo: 'DEL_SUR',
    nombre: 'Delegación Municipal Sur',
  },
  creadoEn: '2026-06-15T12:00:00.000Z',
};

describe('PuntoCriticoDetalleModal', () => {
  it('no debe renderizar nada si punto es null', () => {
    const { container } = render(
      <PuntoCriticoDetalleModal punto={null} onCerrar={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('debe desplegar los atributos completos del punto crítico en el modal', () => {
    render(
      <PuntoCriticoDetalleModal punto={mockPunto} onCerrar={vi.fn()} />
    );

    expect(screen.getByText('Ficha Detallada de Punto Crítico')).toBeInTheDocument();
    expect(screen.getByText('PC-ANG-01')).toBeInTheDocument();
    expect(screen.getByText('Sector Humedal Angachilla - Pasaje Los Robles')).toBeInTheDocument();
    expect(
      screen.getByText(/Zona baja con riesgo recurrente de anegamiento/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Inundación y anegamiento')).toBeInTheDocument();
    expect(screen.getByText('Prioridad Alta')).toBeInTheDocument();
    expect(screen.getByText('Delegación Municipal Sur')).toBeInTheDocument();
    expect(screen.queryByText('DEL_SUR')).toBeNull();
    expect(screen.getByText('-39.8456')).toBeInTheDocument();
    expect(screen.getByText('-73.2389')).toBeInTheDocument();
  });

  it('debe invocar onCerrar al hacer clic en Cerrar Ficha', () => {
    const handleCerrar = vi.fn();
    render(
      <PuntoCriticoDetalleModal punto={mockPunto} onCerrar={handleCerrar} />
    );

    const btnCerrar = screen.getByRole('button', { name: /Cerrar Ficha/i });
    fireEvent.click(btnCerrar);

    expect(handleCerrar).toHaveBeenCalledTimes(1);
  });

  it('debe permitir copiar coordenadas al portapapeles desde el modal', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <PuntoCriticoDetalleModal punto={mockPunto} onCerrar={vi.fn()} />
    );

    const btnCopiar = screen.getByRole('button', { name: /Copiar Coordenadas/i });
    fireEvent.click(btnCopiar);

    expect(writeTextMock).toHaveBeenCalledWith('-39.8456, -73.2389');
    expect(await screen.findByText('Coordenadas Copiadas')).toBeInTheDocument();
  });
});
