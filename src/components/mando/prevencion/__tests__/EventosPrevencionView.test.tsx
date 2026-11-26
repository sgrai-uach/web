import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EventosPrevencionView } from '../EventosPrevencionView';
import * as prevencionService from '@/services/prevencionService';
import { useSimulatedSession } from '@/context/SimulatedSessionContext';
import type { ListarEventosPrevencionResponse } from '@/types/evento-prevencion';

vi.mock('@/context/SimulatedSessionContext', () => ({
  useSimulatedSession: vi.fn(),
}));

vi.mock('@/services/prevencionService', () => ({
  listarEventosPrevencion: vi.fn(),
  PrevencionServiceError: class PrevencionServiceError extends Error {
    statusCode?: number;
    constructor(message: string, options?: { statusCode?: number }) {
      super(message);
      this.statusCode = options?.statusCode;
    }
  },
}));

vi.mock('@/services/catalogosService', () => ({
  getCatalogos: vi.fn().mockResolvedValue({
    delegaciones: [
      { id: 'del-1', codigo: 'NORTE', nombre: 'Norte' },
      { id: 'del-2', codigo: 'SUR', nombre: 'Sur' },
    ],
  }),
  DELEGACIONES_FALLBACK: [
    { id: 'del-1', codigo: 'NORTE', nombre: 'Norte' },
    { id: 'del-2', codigo: 'SUR', nombre: 'Sur' },
  ],
}));

vi.mock('@/hooks/usePrevencionSocket', () => ({
  usePrevencionSocket: vi.fn(),
}));

vi.mock('@/components/maps/LocationPickerMap', () => ({
  default: () => <div data-testid="mock-location-picker-map" />,
}));

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/gestion/centro-incidentes'),
  useSearchParams: vi.fn(() => new URLSearchParams('')),
}));

describe('EventosPrevencionView (HU-76)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockRespuesta: ListarEventosPrevencionResponse = {
    message: 'Eventos listados',
    data: [
      {
        id: 'ev-1',
        codigo: 'PREV-2026-0001',
        nombre: 'Limpieza de sumideros',
        descripcion: 'Mitigación en collico',
        sector: 'Collico',
        direccionTexto: 'Av. Balmaceda 100',
        prioridad: 'ALTA',
        estado: 'EN_CURSO',
        latitud: -39.81,
        longitud: -73.24,
        ubicacionGeoJson: null,
        delegacion: { id: 'del-1', codigo: 'CALLE', nombre: 'Calle Calle' },
        puntoCritico: null,
        patrulla: { id: 'pat-1', nombre: 'Patrulla Centro-Sur', estado: 'EN_PREVENCION' },
        cuadrilla: null,
        mision: null,
        creadoEn: '2026-11-19T07:00:00Z',
        actualizadoEn: '2026-11-19T07:30:00Z',
      },
    ],
    meta: {
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };

  it('no debe renderizar nada mientras isMounted sea false', () => {
    vi.mocked(useSimulatedSession).mockReturnValue({
      usuarioActivo: { id: 'usr-1', nombre: 'Encargado', rol: 'Encargado', esAdmin: false },
      hasPermission: vi.fn(() => true),
      isMounted: false,
      perfilesSimulados: [],
      cambiarPerfil: vi.fn(),
    });

    const { container } = render(<EventosPrevencionView />);
    expect(container.firstChild).toBeNull();
    expect(prevencionService.listarEventosPrevencion).not.toHaveBeenCalled();
  });

  it('debe renderizar vista tabular con filtros cuando el usuario tiene permisos', async () => {
    vi.mocked(useSimulatedSession).mockReturnValue({
      usuarioActivo: { id: 'usr-1', nombre: 'Encargado', rol: 'Encargado', esAdmin: false },
      hasPermission: vi.fn((permiso) => permiso === 'prevencion:eventos:leer'),
      isMounted: true,
      perfilesSimulados: [],
      cambiarPerfil: vi.fn(),
    });

    vi.mocked(prevencionService.listarEventosPrevencion).mockResolvedValue(mockRespuesta);

    render(<EventosPrevencionView />);

    await waitFor(() => {
      expect(screen.getByText('PREV-2026-0001')).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText(/Buscar por código, sector o punto crítico/i)).toBeInTheDocument();
    expect(screen.getByText('Calle Calle')).toBeInTheDocument();
  });

  it('debe renderizar AccesoDenegadoState sin disparar peticion HTTP si el usuario no tiene permisos', async () => {
    vi.mocked(useSimulatedSession).mockReturnValue({
      usuarioActivo: { id: 'usr-2', nombre: 'Informante', rol: 'Informante', esAdmin: false },
      hasPermission: vi.fn(() => false),
      isMounted: true,
      perfilesSimulados: [],
      cambiarPerfil: vi.fn(),
    });

    render(<EventosPrevencionView />);

    expect(screen.getByText(/Acceso Restringido/i)).toBeInTheDocument();
    expect(
      screen.getByText(/No posee permisos suficientes para supervisar los eventos preventivos/i)
    ).toBeInTheDocument();
    expect(prevencionService.listarEventosPrevencion).not.toHaveBeenCalled();
  });

  it('debe abrir el Drawer al seleccionar una fila de la tabla', async () => {
    vi.mocked(useSimulatedSession).mockReturnValue({
      usuarioActivo: { id: 'usr-1', nombre: 'Encargado', rol: 'Encargado', esAdmin: false },
      hasPermission: vi.fn(() => true),
      isMounted: true,
      perfilesSimulados: [],
      cambiarPerfil: vi.fn(),
    });

    vi.mocked(prevencionService.listarEventosPrevencion).mockResolvedValue(mockRespuesta);

    render(<EventosPrevencionView />);

    await waitFor(() => {
      expect(screen.getByText('PREV-2026-0001')).toBeInTheDocument();
    });

    const botonDetalle = screen.getByTitle(/Abrir panel de detalle para PREV-2026-0001/i);
    fireEvent.click(botonDetalle);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'PREV-2026-0001' })).toBeInTheDocument();
    });
  });

  it('debe mostrar mensaje de error con boton Reintentar ante fallos de carga', async () => {
    vi.mocked(useSimulatedSession).mockReturnValue({
      usuarioActivo: { id: 'usr-1', nombre: 'Encargado', rol: 'Encargado', esAdmin: false },
      hasPermission: vi.fn(() => true),
      isMounted: true,
      perfilesSimulados: [],
      cambiarPerfil: vi.fn(),
    });

    vi.mocked(prevencionService.listarEventosPrevencion).mockRejectedValueOnce(
      new Error('Fallo de red en servidor')
    );

    render(<EventosPrevencionView />);

    await waitFor(() => {
      expect(screen.getByText(/Fallo de red en servidor/i)).toBeInTheDocument();
    });

    const botonReintentar = screen.getByRole('button', { name: /Reintentar/i });
    expect(botonReintentar).toBeInTheDocument();

    vi.mocked(prevencionService.listarEventosPrevencion).mockResolvedValueOnce(mockRespuesta);
    fireEvent.click(botonReintentar);

    await waitFor(() => {
      expect(screen.getByText('PREV-2026-0001')).toBeInTheDocument();
    });
  });
});
