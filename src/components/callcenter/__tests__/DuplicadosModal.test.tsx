import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DuplicadosModal from '../DuplicadosModal';
import type { DuplicadoItem } from '@/types/incidente-manual';

describe('DuplicadosModal', () => {
  const coincidenciasPrueba: DuplicadoItem[] = [
    {
      id: 'dup-1',
      codigo: 'INC-0010',
      tipoAfectacion: 'Anegamiento',
      direccion: 'Av. Alemania 550',
      estado: 'SIN_ATENDER',
      distanciaMetros: 20.5,
      creadoEn: '2026-09-13T12:00:00Z',
      origen: 'incidente',
    },
    {
      id: 'dup-2',
      codigo: 'AV-0020',
      tipoAfectacion: 'Anegamiento',
      direccion: 'Av. Alemania 580',
      estado: 'REPORTADO',
      distanciaMetros: 65.2,
      creadoEn: '2026-09-13T11:30:00Z',
      origen: 'aviso',
    },
  ];

  it('no debe renderizar nada si isOpen es false', () => {
    const { container } = render(
      <DuplicadosModal
        isOpen={false}
        coincidencias={coincidenciasPrueba}
        onOmitir={vi.fn()}
        onContinuar={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('debe renderizar la lista de coincidencias con su distancia y código', () => {
    render(
      <DuplicadosModal
        isOpen={true}
        coincidencias={coincidenciasPrueba}
        onOmitir={vi.fn()}
        onContinuar={vi.fn()}
      />
    );

    expect(screen.getByText('Posible Incidente Duplicado Detectado')).toBeDefined();
    expect(screen.getByText('INC-0010')).toBeDefined();
    expect(screen.getByText('AV-0020')).toBeDefined();
    expect(screen.getByText('21 m')).toBeDefined();
    expect(screen.getByText('65 m')).toBeDefined();
  });

  it('debe llamar a onOmitir al hacer clic en "Omitir reporte"', () => {
    const onOmitirMock = vi.fn();
    render(
      <DuplicadosModal
        isOpen={true}
        coincidencias={coincidenciasPrueba}
        onOmitir={onOmitirMock}
        onContinuar={vi.fn()}
      />
    );

    const botonOmitir = screen.getByRole('button', { name: /omitir reporte/i });
    fireEvent.click(botonOmitir);

    expect(onOmitirMock).toHaveBeenCalledTimes(1);
  });

  it('debe llamar a onContinuar al hacer clic en "Continuar de todos modos"', () => {
    const onContinuarMock = vi.fn();
    render(
      <DuplicadosModal
        isOpen={true}
        coincidencias={coincidenciasPrueba}
        onOmitir={vi.fn()}
        onContinuar={onContinuarMock}
      />
    );

    const botonContinuar = screen.getByRole('button', { name: /continuar de todos modos/i });
    fireEvent.click(botonContinuar);

    expect(onContinuarMock).toHaveBeenCalledTimes(1);
  });
});
