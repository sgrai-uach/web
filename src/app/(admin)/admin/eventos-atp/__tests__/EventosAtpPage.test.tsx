import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import EventosAtpPage from '../page';
import * as eventosAtpService from '@/services/eventosAtpService';

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/eventos-atp',
}));

vi.mock('@/context/SimulatedSessionContext', () => ({
  useSimulatedSession: () => ({
    usuarioActivo: {
      id: '00000000-0000-4000-8000-000000000001',
      rol: 'Administrador',
      esAdmin: true,
    },
    hasPermission: () => true,
  }),
}));

const evento = {
  id: '50000000-0000-4000-8000-000000000001',
  codigo: 'ATP-2026-0001',
  nombre: 'Sistema Frontal Mayo 2026',
  descripcion: 'Sistema frontal con precipitaciones intensas.',
  tipoAmenaza: 'METEOROLOGICA' as const,
  nivelAlerta: 'AMARILLA' as const,
  fechaInicio: '2026-05-01T10:00:00.000Z',
  fechaTermino: '2026-05-03T18:00:00.000Z',
  estado: 'ACTIVO' as const,
  delegaciones: [],
  creadoPorId: '00000000-0000-4000-8000-000000000003',
  creadoEn: '2026-05-01T09:55:00.000Z',
  actualizadoEn: '2026-05-01T09:55:00.000Z',
  totalVinculados: 4,
};

describe('Página de Eventos ATP (H60)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('lista los Eventos ATP con su total de entidades vinculadas', async () => {
    const listar = vi
      .spyOn(eventosAtpService, 'listarEventosAtp')
      .mockResolvedValueOnce({
        exito: true,
        eventos: [evento],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
        mensaje: 'ok',
      });

    render(<EventosAtpPage />);

    await waitFor(() =>
      expect(screen.getByText('ATP-2026-0001')).toBeInTheDocument()
    );

    expect(listar).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 10, estado: 'ACTIVO' })
    );
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ver detalle/i })).toHaveAttribute(
      'href',
      '/admin/eventos-atp/50000000-0000-4000-8000-000000000001'
    );
  });

  it('muestra el mensaje del servicio cuando el listado falla', async () => {
    vi.spyOn(eventosAtpService, 'listarEventosAtp').mockResolvedValueOnce({
      exito: false,
      eventos: [],
      mensaje: 'Acceso denegado. Se requiere el permiso eventos_atp:vincular.',
      codigoError: 403,
    });

    render(<EventosAtpPage />);

    expect(
      await screen.findByText(/Acceso denegado. Se requiere el permiso eventos_atp:vincular/i)
    ).toBeInTheDocument();
  });

  it('muestra un estado vacío cuando no hay eventos con los filtros', async () => {
    vi.spyOn(eventosAtpService, 'listarEventosAtp').mockResolvedValueOnce({
      exito: true,
      eventos: [],
      meta: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
      mensaje: 'ok',
    });

    render(<EventosAtpPage />);

    expect(
      await screen.findByText(/No se encontraron Eventos ATP con los filtros seleccionados/i)
    ).toBeInTheDocument();
  });
});
