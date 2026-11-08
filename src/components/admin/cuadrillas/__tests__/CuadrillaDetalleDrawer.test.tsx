import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CuadrillaDetalleDrawer from '../CuadrillaDetalleDrawer';
import { cuadrillasService, CuadrillaServiceError } from '@/services/cuadrillasService';
import type { CuadrillaItem } from '@/types/cuadrilla';

const mockCuadrillaDisponible: CuadrillaItem = {
  id: 'c-100',
  nombre: 'Cuadrilla Vías y Despeje Urbano',
  estado: 'DISPONIBLE',
  delegacion: { id: 'd-1', nombre: 'Delegación Norte' },
  delegado: {
    id: 'u-1',
    nombre: 'Carlos Delegado',
    email: 'carlos@valdivia.cl',
    rut: '15.111.222-3',
    telefono: '+56 9 8111 2233',
  },
  trabajadores: [
    {
      id: 't-1',
      personalId: 'p-1',
      usuarioId: 'u-2',
      nombre: 'Pedro Obrero',
      rut: '16.222.333-4',
      cargo: 'Motosierrista',
      especialidad: 'Poda de Altura',
      telefono: '+56 9 8765 4321',
      asignadoEn: '2026-10-24T12:00:00.000Z',
    },
  ],
  recursos: [
    {
      id: 'r-1',
      recursoId: 'rec-1',
      nombre: 'Camioneta de Rescate 4x4',
      cantidadAsignada: 1,
      esIndividual: true,
      descripcion: 'Vehículo de tracción integral para traslado',
      especificaciones: {
        patente: 'ABCD-12',
        marca: 'Toyota',
        modelo: 'Hilux',
      },
    },
  ],
  activo: true,
  creadoEn: '2026-10-24T12:00:00.000Z',
  actualizadoEn: null,
};

const mockCuadrillaEnMision: CuadrillaItem = {
  id: 'c-200',
  nombre: 'Cuadrilla Mitigación Costera',
  estado: 'EN_MISION',
  delegacion: { id: 'd-2', nombre: 'Delegación Costa' },
  delegado: {
    id: 'u-3',
    nombre: 'Matías Oyarzún Vera',
    email: 'matias@valdivia.cl',
    rut: '18.123.789-4',
    telefono: '+56 9 8234 5678',
  },
  trabajadores: [
    {
      id: 't-2',
      personalId: 'p-2',
      usuarioId: 'u-4',
      nombre: 'Claudio Soto',
      rut: '14.555.666-7',
      cargo: 'Conductor',
      especialidad: 'Maquinaria Pesada',
      telefono: '+56 9 7654 3210',
      asignadoEn: '2026-10-25T08:00:00.000Z',
    },
  ],
  recursos: [
    {
      id: 'r-2',
      recursoId: 'rec-2',
      nombre: 'Camión Tolva 10m3',
      cantidadAsignada: 1,
      esIndividual: true,
      descripcion: 'Camión tolva para retiro de escombros',
      especificaciones: {
        patente: 'GHJK-78',
        marca: 'Mercedes-Benz',
      },
    },
  ],
  misionActiva: {
    id: 'm-1',
    codigo: 'MIS-2026-089',
    titulo: 'Mitigación y despeje de cauce costero',
    tipoMision: 'MITIGACION',
    estado: 'EN_CURSO',
    fechaDespacho: '2026-10-25T08:30:00.000Z',
    tiempoTranscurridoMinutos: 85,
    incidente: {
      id: 'inc-042',
      codigo: 'INC-2026-042',
      tipo: 'Anegamiento de Vía Pública',
      direccion: 'Av. Costanera Arturo Prat 1250',
      latitud: -39.8142,
      longitud: -73.2459,
    },
  },
  activo: true,
  creadoEn: '2026-10-25T08:00:00.000Z',
  actualizadoEn: null,
};

describe('CuadrillaDetalleDrawer (HU-22)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no debe renderizar nada si isOpen es false', () => {
    render(
      <CuadrillaDetalleDrawer
        cuadrilla={mockCuadrillaDisponible}
        isOpen={false}
        onCerrar={vi.fn()}
      />
    );
    expect(screen.queryByTestId('cuadrilla-detalle-drawer')).toBeNull();
  });

  it('debe renderizar la ficha técnica de una cuadrilla disponible con sus integrantes y recursos', async () => {
    vi.spyOn(cuadrillasService, 'obtenerCuadrillaPorId').mockResolvedValueOnce(mockCuadrillaDisponible);

    render(
      <CuadrillaDetalleDrawer
        cuadrillaId="c-100"
        isOpen={true}
        onCerrar={vi.fn()}
      />
    );

    // Esperar a que se resuelva la consulta
    expect(await screen.findByText('Cuadrilla Vías y Despeje Urbano')).toBeInTheDocument();
    expect(screen.getByText('Delegación Delegación Norte')).toBeInTheDocument();
    expect(screen.getByTestId('cuadrilla-badge-disponible')).toHaveTextContent('DISPONIBLE');

    // Delegado a cargo
    expect(screen.getByText('Carlos Delegado')).toBeInTheDocument();
    expect(screen.getByText(/carlos@valdivia\.cl/)).toBeInTheDocument();

    // Integrantes con enlace de teléfono
    expect(screen.getByText('Pedro Obrero')).toBeInTheDocument();
    expect(screen.getByText('Motosierrista')).toBeInTheDocument();
    expect(screen.getByText('• Poda de Altura')).toBeInTheDocument();
    expect(screen.getByText('16.222.333-4')).toBeInTheDocument();

    const telLink = screen.getByTestId('tel-link-p-1');
    expect(telLink).toHaveAttribute('href', 'tel:+56 9 8765 4321');
    expect(telLink).toHaveTextContent('+56 9 8765 4321');

    // Recursos con especificaciones
    expect(screen.getByText('Camioneta de Rescate 4x4')).toBeInTheDocument();
    expect(screen.getByText('1 unidad')).toBeInTheDocument();
    expect(screen.getByText(/Vehículo de tracción integral/)).toBeInTheDocument();
    expect(screen.getByText('ABCD-12')).toBeInTheDocument();
    expect(screen.getByText('Toyota')).toBeInTheDocument();
  });

  it('debe renderizar la tarjeta de misión activa con tiempo transcurrido y enlace directo al incidente cuando la cuadrilla está EN_MISION', async () => {
    vi.spyOn(cuadrillasService, 'obtenerCuadrillaPorId').mockResolvedValueOnce(mockCuadrillaEnMision);
    const mockSelectIncidente = vi.fn();
    const mockCerrar = vi.fn();

    render(
      <CuadrillaDetalleDrawer
        cuadrillaId="c-200"
        isOpen={true}
        onCerrar={mockCerrar}
        onSelectIncidente={mockSelectIncidente}
      />
    );

    expect(await screen.findByText('Cuadrilla Mitigación Costera')).toBeInTheDocument();
    expect(screen.getByTestId('cuadrilla-badge-en-mision')).toHaveTextContent('EN MISIÓN');

    // Tarjeta de Misión Activa
    const misionCard = screen.getByTestId('cuadrilla-mision-activa-card');
    expect(misionCard).toBeInTheDocument();
    expect(screen.getByText(/Despachada hace: 1 h 25 min/)).toBeInTheDocument();
    expect(screen.getByText('MIS-2026-089: Mitigación y despeje de cauce costero')).toBeInTheDocument();
    expect(screen.getByText(/INC-2026-042/)).toBeInTheDocument();
    expect(screen.getByText(/Av\. Costanera Arturo Prat 1250/)).toBeInTheDocument();

    // Clic en botón "Ver Incidente" (Opción A)
    const btnVerIncidente = screen.getByTestId('btn-ver-incidente-mision');
    fireEvent.click(btnVerIncidente);

    expect(mockCerrar).toHaveBeenCalledTimes(1);
    expect(mockSelectIncidente).toHaveBeenCalledWith('inc-042');
  });

  it('debe mostrar advertencia de Acceso Restringido ante error 403 Forbidden', async () => {
    vi.spyOn(cuadrillasService, 'obtenerCuadrillaPorId').mockRejectedValueOnce(
      new CuadrillaServiceError('Permisos insuficientes para ver cuadrilla', 403, 'general', 'PERMISOS_INSUFICIENTES')
    );

    render(
      <CuadrillaDetalleDrawer
        cuadrillaId="c-prohibida"
        isOpen={true}
        onCerrar={vi.fn()}
      />
    );

    expect(await screen.findByTestId('cuadrilla-forbidden-notice')).toBeInTheDocument();
    expect(screen.getByText(/Acceso Restringido \(403 Forbidden\)/)).toBeInTheDocument();
  });

  it('debe responder al teclado con tecla Escape y cerrar el panel', async () => {
    vi.spyOn(cuadrillasService, 'obtenerCuadrillaPorId').mockResolvedValueOnce(mockCuadrillaDisponible);
    const mockCerrar = vi.fn();

    render(
      <CuadrillaDetalleDrawer
        cuadrillaId="c-100"
        isOpen={true}
        onCerrar={mockCerrar}
      />
    );

    await screen.findByText('Cuadrilla Vías y Despeje Urbano');

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockCerrar).toHaveBeenCalledTimes(1);
  });

  it('debe permitir editar cuando la cuadrilla está DISPONIBLE y deshabilitar edición si está EN_MISION', async () => {
    const mockEditar = vi.fn();

    // 1. Caso DISPONIBLE: botón habilitado
    vi.spyOn(cuadrillasService, 'obtenerCuadrillaPorId').mockResolvedValueOnce(mockCuadrillaDisponible);
    const { unmount } = render(
      <CuadrillaDetalleDrawer
        cuadrillaId="c-100"
        isOpen={true}
        onCerrar={vi.fn()}
        onEditar={mockEditar}
        puedeEditar={true}
      />
    );

    await screen.findByText('Cuadrilla Vías y Despeje Urbano');
    const btnEditar = screen.getByRole('button', { name: /Editar Cuadrilla/i });
    expect(btnEditar).not.toBeDisabled();
    fireEvent.click(btnEditar);
    expect(mockEditar).toHaveBeenCalledWith(expect.objectContaining({ id: 'c-100' }));

    unmount();

    // 2. Caso EN_MISION: botón deshabilitado
    vi.spyOn(cuadrillasService, 'obtenerCuadrillaPorId').mockResolvedValueOnce(mockCuadrillaEnMision);
    render(
      <CuadrillaDetalleDrawer
        cuadrillaId="c-200"
        isOpen={true}
        onCerrar={vi.fn()}
        onEditar={mockEditar}
        puedeEditar={true}
      />
    );

    await screen.findByText('Cuadrilla Mitigación Costera');
    const btnEditarBloqueado = screen.getByRole('button', { name: /Editar Cuadrilla/i });
    expect(btnEditarBloqueado).toBeDisabled();
  });
});
