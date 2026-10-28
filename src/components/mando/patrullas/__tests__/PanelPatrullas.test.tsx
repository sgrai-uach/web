import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { PanelPatrullasModal } from '../PanelPatrullasModal';
import { PatrullaCard } from '../PatrullaCard';
import { patrullasService } from '@/services/patrullasService';
import type { PatrullaVerificadoraDTO } from '@/types/patrullas';

vi.mock('@/services/patrullasService', () => ({
  DEFAULT_ENCARGADO_ID: '00000000-0000-4000-8000-000000000003',
  patrullasService: {
    listar: vi.fn(),
  },
}));

vi.mock('@/lib/socket/client', () => ({
  getSocket: () => ({
    connected: true,
    connect: vi.fn(),
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  }),
}));

vi.mock('@/hooks/useCatalogos', () => ({
  useCatalogos: () => ({
    nombresDelegaciones: ['Norte', 'Sur', 'Costa', 'Calle Calle'],
    delegaciones: [],
    cargando: false,
    resolverId: vi.fn(),
    resolverNombre: vi.fn(),
  }),
}));

describe('Componente PanelPatrullasModal y PatrullaCard (HU-16: Visualizar Patrullas)', () => {
  const mockPatrullas: PatrullaVerificadoraDTO[] = [
    {
      id: 'f1000000-0000-4000-8000-000000000001',
      nombre: 'Patrulla Rápida Costa-1',
      estado: 'EN_VERIFICACION',
      latitud: -39.86523,
      longitud: -73.39841,
      delegacion: {
        id: '30000000-0000-4000-8000-000000000003',
        nombre: 'Costa',
        codigo: 'DEL_COSTA',
      },
      lider: {
        id: '00000000-0000-4000-8000-000000000003',
        nombre: 'Encargado de Operaciones',
        email: 'encargado@valdivia.cl',
        telefono: '+56911112222',
        rut: '33333333-3',
      },
      integrantes: [
        {
          id: 'b1',
          nombre: 'Juan Brigadista',
          cargo: 'Evaluador Rápido',
          rolEnPatrulla: 'OPERATIVO',
          estadoOperativo: 'en_patrulla',
        },
      ],
      misionActiva: {
        id: 'd1000000-0000-4000-8000-000000000001',
        codigo: 'MIS-2026-0001',
        titulo: 'Evaluación preliminar de derrumbe',
        tipoMision: 'VERIFICACION',
        estado: 'EN_CURSO',
        prioridad: 'CRITICA',
        incidenteId: 'a1000000-0000-4000-8000-000000000003',
        incidenteCodigo: 'INC-2026-0003',
        incidenteDireccion: 'Ruta T-350 km 12',
      },
      actualizadoEn: '2026-10-21T10:00:00.000Z',
    },
    {
      id: 'f1000000-0000-4000-8000-000000000002',
      nombre: 'Patrulla Móvil Sur',
      estado: 'DISPONIBLE',
      delegacion: {
        id: '30000000-0000-4000-8000-000000000002',
        nombre: 'Sur',
        codigo: 'DEL_SUR',
      },
      lider: {
        id: '00000000-0000-4000-8000-000000000004',
        nombre: 'Carlos Inspector',
        email: 'carlos@valdivia.cl',
        rut: '44444444-4',
      },
      integrantes: [],
      misionActiva: null,
      actualizadoEn: '2026-10-21T10:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no debe renderizar nada si isOpen es false', () => {
    const { container } = render(
      <PanelPatrullasModal isOpen={false} onClose={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('debe renderizar el modal con cabecera institucional y resumen de dotación', async () => {
    vi.mocked(patrullasService.listar).mockResolvedValueOnce({
      exito: true,
      data: mockPatrullas,
      meta: { total: 2, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false },
      mensaje: 'OK',
    });

    render(<PanelPatrullasModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByRole('heading', { name: /Patrullas Verificadoras en Terreno/i })).toBeInTheDocument();
    expect(screen.getByTestId('patrullas-skeleton')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Patrulla Rápida Costa-1')).toBeInTheDocument();
      expect(screen.getByText('Patrulla Móvil Sur')).toBeInTheDocument();
    });

    // Comprobar resumen de dotación
    expect(screen.getByText('Total registradas:')).toBeInTheDocument();
    expect(screen.getByText('Disponibles:')).toBeInTheDocument();
    expect(screen.getByText('En Misión / Verificación:')).toBeInTheDocument();
  });

  it('debe renderizar la tarjeta con datos de líder, delegación y badge canónico sin emojis', () => {
    render(
      <PatrullaCard
        patrulla={mockPatrullas[0]}
        onSelectMision={vi.fn()}
        onSelectIncidente={vi.fn()}
      />
    );

    expect(screen.getByText('Patrulla Rápida Costa-1')).toBeInTheDocument();
    expect(screen.getByText('Costa')).toBeInTheDocument();
    expect(screen.getByText('Encargado de Operaciones')).toBeInTheDocument();
    expect(screen.getByText(/RUT: 33333333-3/)).toBeInTheDocument();

    // Badge canónico de estado EN_VERIFICACION
    const badge = screen.getByTestId('badge-estado-en_verificacion');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('En Verificación');

    // Verificar que no contiene emojis
    expect(badge.textContent).not.toMatch(/[\uD800-\uDBFF][\uDC00-\uDFFF]/);
  });

  it('debe mostrar bloque de misión activa y ejecutar callbacks al hacer clic en misión e incidente', () => {
    const onSelectMision = vi.fn();
    const onSelectIncidente = vi.fn();

    render(
      <PatrullaCard
        patrulla={mockPatrullas[0]}
        onSelectMision={onSelectMision}
        onSelectIncidente={onSelectIncidente}
      />
    );

    expect(screen.getByText('Evaluación preliminar de derrumbe')).toBeInTheDocument();

    // Clic en enlace a la misión
    const btnMision = screen.getByTestId('link-mision-MIS-2026-0001');
    expect(btnMision).toBeInTheDocument();
    fireEvent.click(btnMision);
    expect(onSelectMision).toHaveBeenCalledWith('d1000000-0000-4000-8000-000000000001');

    // Clic en enlace al incidente
    const btnIncidente = screen.getByTestId('link-incidente-INC-2026-0003');
    expect(btnIncidente).toBeInTheDocument();
    fireEvent.click(btnIncidente);
    expect(onSelectIncidente).toHaveBeenCalledWith('a1000000-0000-4000-8000-000000000003');
  });

  it('debe renderizar estado vacío cuando no existen patrullas registradas', async () => {
    vi.mocked(patrullasService.listar).mockResolvedValueOnce({
      exito: true,
      data: [],
      meta: { total: 0, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false },
      mensaje: 'OK',
    });

    render(<PanelPatrullasModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('No hay patrullas registradas')).toBeInTheDocument();
    });
  });

  it('debe renderizar AccesoDenegadoState ante error 403 Forbidden', async () => {
    vi.mocked(patrullasService.listar).mockResolvedValueOnce({
      exito: false,
      esForbidden: true,
      codigoError: 403,
      data: [],
      meta: { total: 0, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false },
      mensaje: 'No cuenta con el permiso requerido: misiones:leer',
    });

    render(<PanelPatrullasModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Acceso Restringido')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Permisos insuficientes/i })).toBeInTheDocument();
      expect(screen.getByText(/No cuenta con el permiso requerido \(misiones:leer\)/i)).toBeInTheDocument();
    });
  });

  it('debe llamar a onClose al hacer clic en el botón de cerrar', async () => {
    vi.mocked(patrullasService.listar).mockResolvedValueOnce({
      exito: true,
      data: mockPatrullas,
      meta: { total: 2, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false },
      mensaje: 'OK',
    });

    const onClose = vi.fn();
    render(<PanelPatrullasModal isOpen={true} onClose={onClose} />);

    const btnCerrar = screen.getByRole('button', { name: /Cerrar modal de patrullas/i });
    fireEvent.click(btnCerrar);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
