import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CuadrillaEditarModal from '../CuadrillaEditarModal';
import { cuadrillasService, CuadrillaServiceError } from '@/services/cuadrillasService';
import type { CuadrillaItem } from '@/types/cuadrilla';

describe('CuadrillaEditarModal (H81)', () => {
  const mockCuadrillaDisponible: CuadrillaItem = {
    id: '50000000-0000-4000-8000-000000000001',
    nombre: 'Cuadrilla Vías y Despeje Urbano',
    estado: 'DISPONIBLE',
    delegacion: { id: 'del-1', nombre: 'Delegación Norte' },
    delegado: {
      id: 'del-user-1',
      nombre: 'Carlos Delegado',
      email: 'carlos@valdivia.cl',
      rut: '15.111.222-3',
    },
    recursos: [
      {
        id: 'cr-1',
        recursoId: 'rec-1',
        nombre: 'Camioneta de Rescate 4x4',
        cantidadAsignada: 1,
        esIndividual: true,
      },
    ],
    trabajadores: [
      {
        id: 'cp-1',
        personalId: 'per-1',
        usuarioId: 'u-1',
        nombre: 'Pedro Obrero',
        cargo: 'Motosierrista',
        especialidad: 'Poda de Altura',
        asignadoEn: '2026-10-24T12:00:00.000Z',
      },
    ],
    creadoEn: '2026-10-24T12:00:00.000Z',
  };

  const mockCuadrillaEnMision: CuadrillaItem = {
    ...mockCuadrillaDisponible,
    id: '50000000-0000-4000-8000-000000000002',
    nombre: 'Cuadrilla Costa en Terreno',
    estado: 'EN_MISION',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(cuadrillasService, 'obtenerDelegaciones').mockResolvedValue([
      { id: 'del-1', nombre: 'Delegación Norte' },
      { id: 'del-2', nombre: 'Delegación Sur' },
    ]);

    vi.spyOn(cuadrillasService, 'obtenerCandidatosDelegados').mockResolvedValue([
      {
        id: 'del-user-2',
        nombreCompleto: 'Felipe Sandoval',
        rut: '17.654.321-0',
        email: 'felipe@valdivia.cl',
        rolNombre: 'Brigadista',
        rolCodigo: 'BRIGADISTA',
        estadoOperativo: 'disponible',
      },
    ]);

    vi.spyOn(cuadrillasService, 'obtenerPersonalOperativoDisponible').mockResolvedValue([
      {
        id: 'per-2',
        nombre: 'Jorge Almonacid',
        cargo: 'Operario',
        especialidad: 'Despeje',
        rut: '17.333.444-5',
        disponibleTerreno: true,
        estadoOperativo: 'disponible',
      },
    ]);

    vi.spyOn(cuadrillasService, 'obtenerRecursosDisponibles').mockResolvedValue([
      {
        id: 'rec-2',
        nombre: 'Motosierra Stihl MS-382',
        esIndividual: false,
        cantidadInventario: 5,
        cantidadDisponible: 5,
      },
    ]);
  });

  it('debe precargar los datos existentes de la cuadrilla y su dotación', async () => {
    render(
      <CuadrillaEditarModal
        isOpen={true}
        cuadrilla={mockCuadrillaDisponible}
        onCerrar={vi.fn()}
        onGuardadoExitoso={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Cuadrilla Vías y Despeje Urbano')).toBeDefined();
      expect(screen.getByText('Carlos Delegado')).toBeDefined();
      expect(screen.getByText('Pedro Obrero')).toBeDefined();
      expect(screen.getByText('Camioneta de Rescate 4x4')).toBeDefined();
    });
  });

  it('debe alertar y bloquear el botón de guardar si la cuadrilla se encuentra EN_MISION', async () => {
    render(
      <CuadrillaEditarModal
        isOpen={true}
        cuadrilla={mockCuadrillaEnMision}
        onCerrar={vi.fn()}
        onGuardadoExitoso={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Modificación Bloqueada \(409 Conflict\)/i)).toBeDefined();
    });

    const botonGuardar = screen.getByRole('button', { name: /guardar cambios/i });
    expect(botonGuardar).toBeDisabled();
  });

  it('debe permitir modificar el nombre y guardar exitosamente', async () => {
    const onGuardadoExitoso = vi.fn();
    const onCerrar = vi.fn();

    vi.spyOn(cuadrillasService, 'actualizarCuadrilla').mockResolvedValueOnce({
      ...mockCuadrillaDisponible,
      nombre: 'Cuadrilla Vías Modificada',
    });

    render(
      <CuadrillaEditarModal
        isOpen={true}
        cuadrilla={mockCuadrillaDisponible}
        onCerrar={onCerrar}
        onGuardadoExitoso={onGuardadoExitoso}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Cuadrilla Vías y Despeje Urbano')).toBeDefined();
    });

    const inputNombre = screen.getByDisplayValue('Cuadrilla Vías y Despeje Urbano');
    fireEvent.change(inputNombre, { target: { value: 'Cuadrilla Vías Modificada' } });

    const botonGuardar = screen.getByRole('button', { name: /guardar cambios/i });
    expect(botonGuardar).not.toBeDisabled();
    fireEvent.click(botonGuardar);

    await waitFor(() => {
      expect(cuadrillasService.actualizarCuadrilla).toHaveBeenCalledWith(
        mockCuadrillaDisponible.id,
        expect.objectContaining({
          nombre: 'Cuadrilla Vías Modificada',
          delegacionId: 'del-1',
          usuarioDelegadoId: 'del-user-1',
        })
      );
      expect(onGuardadoExitoso).toHaveBeenCalled();
      expect(onCerrar).toHaveBeenCalled();
    });
  });

  it('debe capturar error 409 Conflict de nombre duplicado y mostrar el mensaje en el campo correspondiente', async () => {
    vi.spyOn(cuadrillasService, 'actualizarCuadrilla').mockRejectedValueOnce(
      new CuadrillaServiceError(
        'Ya existe otra cuadrilla operativa con el nombre ingresado.',
        409,
        'nombre',
        'NOMBRE_DUPLICADO'
      )
    );

    render(
      <CuadrillaEditarModal
        isOpen={true}
        cuadrilla={mockCuadrillaDisponible}
        onCerrar={vi.fn()}
        onGuardadoExitoso={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Cuadrilla Vías y Despeje Urbano')).toBeDefined();
    });

    const botonGuardar = screen.getByRole('button', { name: /guardar cambios/i });
    fireEvent.click(botonGuardar);

    await waitFor(() => {
      expect(screen.getByText('Ya existe otra cuadrilla operativa con el nombre ingresado.')).toBeDefined();
    });
  });
});
