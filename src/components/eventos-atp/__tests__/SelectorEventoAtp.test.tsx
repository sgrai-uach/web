import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SelectorEventoAtp } from '../SelectorEventoAtp';
import * as eventosAtpService from '@/services/eventosAtpService';
import type { EventoAtpResumen } from '@/types/eventoAtp';

const eventos: EventoAtpResumen[] = [
  {
    id: '50000000-0000-4000-8000-000000000001',
    codigo: 'ATP-2026-0001',
    nombre: 'Sistema Frontal Mayo 2026',
    descripcion: 'Sistema frontal con precipitaciones intensas.',
    tipoAmenaza: 'METEOROLOGICA',
    nivelAlerta: 'AMARILLA',
    fechaInicio: '2026-05-01T10:00:00.000Z',
    fechaTermino: '2026-05-03T18:00:00.000Z',
    estado: 'ACTIVO',
    delegaciones: [],
    creadoPorId: '00000000-0000-4000-8000-000000000003',
    creadoEn: '2026-05-01T09:55:00.000Z',
    actualizadoEn: '2026-05-01T09:55:00.000Z',
    totalVinculados: 3,
  },
  {
    id: '50000000-0000-4000-8000-000000000002',
    codigo: 'ATP-2026-0002',
    nombre: 'Marejadas Costa',
    descripcion: 'Marejadas intensas en el borde costero.',
    tipoAmenaza: 'MAREJADAS',
    nivelAlerta: 'ROJA',
    fechaInicio: '2026-05-04T10:00:00.000Z',
    fechaTermino: '2026-05-05T18:00:00.000Z',
    estado: 'ACTIVO',
    delegaciones: [],
    creadoPorId: '00000000-0000-4000-8000-000000000003',
    creadoEn: '2026-05-04T09:55:00.000Z',
    actualizadoEn: '2026-05-04T09:55:00.000Z',
    totalVinculados: 0,
  },
];

describe('SelectorEventoAtp (H60)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('lista solo Eventos ATP ACTIVO y permite seleccionar uno', async () => {
    const listar = vi
      .spyOn(eventosAtpService, 'listarEventosAtp')
      .mockResolvedValueOnce({
        exito: true,
        eventos,
        mensaje: 'ok',
      });

    const onChange = vi.fn();

    render(<SelectorEventoAtp onChange={onChange} />);

    await waitFor(() =>
      expect(listar).toHaveBeenCalledWith({ estado: 'ACTIVO', limit: 100 })
    );

    const select = await screen.findByLabelText(/Evento ATP/i);

    await waitFor(() => {
      expect(screen.getByText(/ATP-2026-0001 · Sistema Frontal Mayo 2026/)).toBeInTheDocument();
      expect(screen.getByText(/ATP-2026-0002 · Marejadas Costa/)).toBeInTheDocument();
    });

    fireEvent.change(select, {
      target: { value: '50000000-0000-4000-8000-000000000002' },
    });

    expect(onChange).toHaveBeenCalledWith('50000000-0000-4000-8000-000000000002');
  });

  it('emite null al seleccionar la opción vacía', async () => {
    vi.spyOn(eventosAtpService, 'listarEventosAtp').mockResolvedValueOnce({
      exito: true,
      eventos,
      mensaje: 'ok',
    });

    const onChange = vi.fn();

    render(<SelectorEventoAtp onChange={onChange} value={eventos[0].id} />);

    const select = await screen.findByLabelText(/Evento ATP/i);
    await waitFor(() => expect(screen.getByText(/ATP-2026-0001/)).toBeInTheDocument());

    fireEvent.change(select, { target: { value: '' } });

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('muestra la ayuda y el mensaje de error', async () => {
    vi.spyOn(eventosAtpService, 'listarEventosAtp').mockResolvedValueOnce({
      exito: false,
      eventos: [],
      mensaje: 'Error',
    });

    render(
      <SelectorEventoAtp
        onChange={() => {}}
        error="Debe seleccionar un Evento ATP."
      />
    );

    expect(
      await screen.findByText('Debe seleccionar un Evento ATP.')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Evento ATP/i)
    ).toHaveAttribute('aria-invalid', 'true');
  });

  it('muestra la ayuda cuando no hay error', async () => {
    vi.spyOn(eventosAtpService, 'listarEventosAtp').mockResolvedValueOnce({
      exito: false,
      eventos: [],
      mensaje: 'Error',
    });

    render(<SelectorEventoAtp onChange={() => {}} />);

    expect(
      await screen.findByText(/Solo se muestran Eventos ATP en estado ACTIVO/i)
    ).toBeInTheDocument();
  });
});
