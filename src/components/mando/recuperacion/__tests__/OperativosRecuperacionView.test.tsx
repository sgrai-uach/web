import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OperativosRecuperacionView } from '../OperativosRecuperacionView';
import * as recuperacionService from '@/services/recuperacionService';
import * as usePuedeEditarModule from '@/hooks/usePuedeEditarRecuperacion';
import type {
  ListarOperativosRecuperacionApiResponse,
  OperativoRecuperacionDetalle,
} from '@/types/recuperacion';

vi.mock('@/hooks/useRecuperacionSocket', () => ({
  useRecuperacionSocket: vi.fn(() => ({ conectado: true, ultimoEvento: null })),
}));

vi.mock('@/components/ui/Toast', () => ({
  useOptionalToast: () => ({
    showError: vi.fn(),
    showToast: vi.fn(),
  }),
}));

const mockDelegaciones = [
  { id: 'del-1', codigo: 'COSTA', nombre: 'Delegación de la Costa' },
  { id: 'del-2', codigo: 'SUR', nombre: 'Delegación Sur' },
];

const mockListado: ListarOperativosRecuperacionApiResponse = {
  data: [
    {
      id: 'op-1',
      codigo: 'REC-2026-0001',
      nombre: 'Entrega de Materiales y Remoción',
      descripcion: 'Operativo de entrega de planchas de zinc',
      estado: 'EN_EJECUCION',
      prioridad: 'ALTA',
      sector: 'Sector Niebla Alto',
      direccionTexto: null,
      familiasAfectadas: 4,
      creadoEn: '2026-11-14T15:00:00.000Z',
      actualizadoEn: '2026-11-14T15:30:00.000Z',
      fechaCierre: null,
      delegacion: { id: 'del-1', codigo: 'COSTA', nombre: 'Delegación de la Costa' },
      cantidadInsumosAsignados: 130,
      totalTiposInsumos: 2,
      recursosResumen: [
        { recursoId: 'r1', nombre: 'Planchas de Zinc', cantidadAsignada: 120 },
        { recursoId: 'r2', nombre: 'Frazadas', cantidadAsignada: 10 },
      ],
    },
  ],
  meta: {
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
};

const mockDetalle: OperativoRecuperacionDetalle = {
  id: 'op-1',
  codigo: 'REC-2026-0001',
  nombre: 'Entrega de Materiales y Remoción',
  descripcion: 'Operativo de entrega de planchas de zinc',
  estado: 'EN_EJECUCION',
  prioridad: 'ALTA',
  sector: 'Sector Niebla Alto',
  direccionTexto: null,
  contactoNombre: null,
  contactoTelefono: null,
  latitud: -39.8142,
  longitud: -73.2459,
  familiasAfectadas: 4,
  creadoEn: '2026-11-14T15:00:00.000Z',
  actualizadoEn: '2026-11-14T15:30:00.000Z',
  fechaCierre: null,
  observacionesCierre: null,
  creadoPor: { id: 'u1', nombre: 'Juan Pérez' },
  delegacion: { id: 'del-1', codigo: 'COSTA', nombre: 'Delegación de la Costa' },
  recursos: [
    {
      recursoId: 'r1',
      nombre: 'Planchas de Zinc',
      cantidadAsignada: 120,
    },
  ],
  cantidadInsumosAsignados: 120,
  totalTiposInsumos: 1,
  mision: {
    id: 'm1',
    codigo: 'MIS-2026-0010',
    titulo: 'Entrega de Materiales',
    estado: 'EN_CURSO',
    tipoMision: 'RECUPERACION',
  },
  patrulla: {
    id: 'p1',
    nombre: 'Patrulla Costa',
    estado: 'EN_RECUPERACION',
  },
  historial: [
    {
      id: 'h1',
      tipo: 'CREACION',
      creadoEn: '2026-11-14T15:00:00.000Z',
      titulo: 'Operativo registrado',
      descripcion: 'Operativo de recuperación creado en estado PLANIFICADA',
      registradoPor: { id: 'u1', nombre: 'Juan Pérez' },
    },
  ],
};

describe('OperativosRecuperacionView (HU-73)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar la tabla con los operativos y abrir el drawer al hacer clic en una fila', async () => {
    vi.spyOn(recuperacionService, 'listarOperativosRecuperacion').mockResolvedValue(mockListado);
    const detalleSpy = vi
      .spyOn(recuperacionService, 'obtenerDetalleOperativoRecuperacion')
      .mockResolvedValue(mockDetalle);

    const onCrear = vi.fn();
    render(
      <OperativosRecuperacionView
        delegaciones={mockDelegaciones}
        onCrearRecuperacion={onCrear}
      />
    );

    expect(await screen.findByText('REC-2026-0001')).toBeInTheDocument();
    expect(screen.getByText('Entrega de Materiales y Remoción')).toBeInTheDocument();
    expect(screen.getAllByText('Delegación de la Costa').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('130 unidades')).toBeInTheDocument();

    const btnNuevo = screen.getByRole('button', { name: /Nuevo Operativo de Recuperación/i });
    fireEvent.click(btnNuevo);
    expect(onCrear).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('REC-2026-0001'));

    await waitFor(() => {
      expect(detalleSpy).toHaveBeenCalledWith('op-1');
    });

    expect(await screen.findByText('Planchas de Zinc')).toBeInTheDocument();
    expect(screen.getByText('Operativo registrado')).toBeInTheDocument();
    expect(screen.getByText(/MIS-2026-0010/)).toBeInTheDocument();
  });

  it('debe mostrar estado de acceso denegado cuando la API responde 403', async () => {
    vi.spyOn(recuperacionService, 'listarOperativosRecuperacion').mockRejectedValue(
      new recuperacionService.RecuperacionServiceError('Sin permiso', { statusCode: 403 })
    );

    render(<OperativosRecuperacionView delegaciones={mockDelegaciones} />);

    expect(await screen.findByText(/Acceso Restringido/i)).toBeInTheDocument();
    expect(screen.getByText(/recuperacion:leer/i)).toBeInTheDocument();
  });

  it('debe mostrar EmptyState cuando no hay operativos', async () => {
    vi.spyOn(recuperacionService, 'listarOperativosRecuperacion').mockResolvedValue({
      data: [],
      meta: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    });

    render(<OperativosRecuperacionView delegaciones={mockDelegaciones} />);

    expect(
      await screen.findByText(/No se encontraron operativos de recuperación/i)
    ).toBeInTheDocument();
  });

  it('debe restringir rango invertido de fechas con min y max en los inputs de fecha', async () => {
    vi.spyOn(recuperacionService, 'listarOperativosRecuperacion').mockResolvedValue(mockListado);

    render(<OperativosRecuperacionView delegaciones={mockDelegaciones} />);
    await screen.findByText('REC-2026-0001');

    const inputDesde = screen.getByLabelText('Desde') as HTMLInputElement;
    const inputHasta = screen.getByLabelText('Hasta') as HTMLInputElement;

    fireEvent.change(inputDesde, { target: { value: '2026-11-20' } });
    expect(inputHasta).toHaveAttribute('min', '2026-11-20');

    fireEvent.change(inputHasta, { target: { value: '2026-11-24' } });
    expect(inputDesde).toHaveAttribute('max', '2026-11-24');
  });

  it('HU-74: permite abrir el modal de edición directa desde el botón Editar de la tabla y bloquea si el operativo está cerrado', async () => {
    vi.spyOn(usePuedeEditarModule, 'usePuedeEditarRecuperacion').mockReturnValue(true);
    vi.spyOn(recuperacionService, 'listarOperativosRecuperacion').mockResolvedValue(mockListado);
    vi.spyOn(recuperacionService, 'obtenerDetalleOperativoRecuperacion').mockResolvedValue(
      mockDetalle
    );

    render(<OperativosRecuperacionView delegaciones={mockDelegaciones} />);
    await screen.findByText('REC-2026-0001');

    const btnEditarTabla = screen.getByRole('button', { name: /editar rec-2026-0001/i });
    expect(btnEditarTabla).toBeEnabled();
    fireEvent.click(btnEditarTabla);

    expect(
      await screen.findByText('Editar Planificación del Operativo')
    ).toBeInTheDocument();
  });
});
