import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PuntoCriticoEditarModal from '../PuntoCriticoEditarModal';
import * as puntosCriticosService from '@/services/puntosCriticosService';
import type { PuntoCriticoItem } from '@/types/puntoCritico';

vi.mock('@/components/maps/LocationPickerMap', () => ({
  default: ({ onChange, latitud, longitud }: { onChange?: (coords: { latitud: number; longitud: number }) => void; latitud: number; longitud: number }) => (
    <div data-testid="location-picker-mock">
      <span data-testid="mock-lat">{latitud}</span>
      <span data-testid="mock-lng">{longitud}</span>
      <button
        type="button"
        onClick={() => onChange?.({ latitud: -39.85, longitud: -73.25 })}
      >
        Mover Marcador en Mapa
      </button>
    </div>
  ),
}));

const mockPunto: PuntoCriticoItem = {
  id: '40000000-0000-4000-8000-000000000001',
  codigo: 'PC-ANG-01',
  nombre: 'Sector Humedal Angachilla',
  descripcion: 'Zona baja inundable',
  tipoRiesgo: 'Inundación',
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

describe('PuntoCriticoEditarModal', () => {
  const onCerrar = vi.fn();
  const onGuardadoExitoso = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(puntosCriticosService, 'getPuntoCriticoById').mockResolvedValue({
      ...mockPunto,
      actualizadoEn: null,
      actualizadoPorId: null,
    });
  });

  it('no debe renderizar nada si isOpen es false o punto es null', () => {
    const { container, rerender } = render(
      <PuntoCriticoEditarModal
        isOpen={false}
        punto={mockPunto}
        usuarioActivoId="admin-id"
        onCerrar={onCerrar}
        onGuardadoExitoso={onGuardadoExitoso}
      />
    );
    expect(container).toBeEmptyDOMElement();

    rerender(
      <PuntoCriticoEditarModal
        isOpen={true}
        punto={null}
        usuarioActivoId="admin-id"
        onCerrar={onCerrar}
        onGuardadoExitoso={onGuardadoExitoso}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('debe precargar los datos del punto y mostrar el código institucional como inmutable', () => {
    render(
      <PuntoCriticoEditarModal
        isOpen={true}
        punto={mockPunto}
        usuarioActivoId="admin-id"
        onCerrar={onCerrar}
        onGuardadoExitoso={onGuardadoExitoso}
      />
    );

    expect(screen.getByText('Editar Punto Crítico: PC-ANG-01')).toBeInTheDocument();
    expect(screen.getByText('Código institucional inmutable')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Sector Humedal Angachilla')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Inundación')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Zona baja inundable')).toBeInTheDocument();

    // Comprobar que no se muestran códigos de delegación entre paréntesis (DEL_SUR, etc.)
    expect(screen.queryByText(/DEL_SUR/i)).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Delegación Municipal Sur' })).toBeInTheDocument();

    // Comprobar que el selector de tipo de riesgo incluye opciones del catálogo
    expect(screen.getByRole('option', { name: 'Inundación y anegamiento' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Remoción en masa' })).toBeInTheDocument();
  });

  it('debe permitir modificar campos descriptivos y guardar exitosamente', async () => {
    vi.spyOn(puntosCriticosService, 'actualizarPuntoCritico').mockResolvedValueOnce({
      ...mockPunto,
      nombre: 'Sector Humedal Angachilla Modificado',
      prioridad: 'CRITICA',
    });

    render(
      <PuntoCriticoEditarModal
        isOpen={true}
        punto={mockPunto}
        usuarioActivoId="admin-id"
        onCerrar={onCerrar}
        onGuardadoExitoso={onGuardadoExitoso}
      />
    );

    const btnGuardar = screen.getByRole('button', { name: /Guardar Cambios/i });
    await waitFor(() => expect(btnGuardar).not.toBeDisabled());

    const inputNombre = screen.getByLabelText(/Nombre o Sector/i);
    fireEvent.change(inputNombre, { target: { value: 'Sector Humedal Angachilla Modificado' } });

    fireEvent.click(btnGuardar);

    await waitFor(() => {
      expect(puntosCriticosService.actualizarPuntoCritico).toHaveBeenCalledWith(
        mockPunto.id,
        expect.objectContaining({
          nombre: 'Sector Humedal Angachilla Modificado',
        }),
        'admin-id'
      );
    });

    expect(onGuardadoExitoso).toHaveBeenCalled();
  });

  it('debe actualizar coordenadas al interactuar con el mapa', async () => {
    render(
      <PuntoCriticoEditarModal
        isOpen={true}
        punto={mockPunto}
        usuarioActivoId="admin-id"
        onCerrar={onCerrar}
        onGuardadoExitoso={onGuardadoExitoso}
      />
    );

    const btnMover = screen.getByText('Mover Marcador en Mapa');
    fireEvent.click(btnMover);

    const inputLat = screen.getByLabelText(/Latitud \(GPS\)/i) as HTMLInputElement;
    const inputLng = screen.getByLabelText(/Longitud \(GPS\)/i) as HTMLInputElement;

    expect(inputLat.value).toBe('-39.85');
    expect(inputLng.value).toBe('-73.25');
  });

  it('debe mostrar mensaje de error en el modal si la API rechaza con 409', async () => {
    const error409 = new puntosCriticosService.PuntoCriticoServiceError({
      message: 'No es posible modificar este punto crítico porque se encuentra inactivo.',
      statusCode: 409,
    });
    vi.spyOn(puntosCriticosService, 'actualizarPuntoCritico').mockRejectedValueOnce(error409);

    render(
      <PuntoCriticoEditarModal
        isOpen={true}
        punto={mockPunto}
        usuarioActivoId="admin-id"
        onCerrar={onCerrar}
        onGuardadoExitoso={onGuardadoExitoso}
      />
    );

    const btnGuardar = screen.getByRole('button', { name: /Guardar Cambios/i });
    await waitFor(() => expect(btnGuardar).not.toBeDisabled());

    fireEvent.click(btnGuardar);

    await waitFor(() => {
      expect(
        screen.getByText(/No es posible modificar este punto crítico porque se encuentra inactivo/i)
      ).toBeInTheDocument();
    });

    expect(onGuardadoExitoso).not.toHaveBeenCalled();
  });
});
