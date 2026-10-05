import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePuntoCriticoEditForm, VALDIVIA_CENTRO_LAT, VALDIVIA_CENTRO_LNG } from '../usePuntoCriticoEditForm';
import * as puntosCriticosService from '@/services/puntosCriticosService';
import type { PuntoCriticoItem } from '@/types/puntoCritico';
import type { ApiErrorResponse } from '@/types/common';

vi.mock('@/services/puntosCriticosService', () => ({
  getPuntoCriticoById: vi.fn(),
  actualizarPuntoCritico: vi.fn(),
  PuntoCriticoServiceError: class extends Error {
    public apiError: ApiErrorResponse;
    constructor(apiError: ApiErrorResponse) {
      super(apiError?.message || 'Error');
      this.apiError = apiError;
    }
  },
}));

describe('usePuntoCriticoEditForm', () => {
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

  const onGuardadoExitoso = vi.fn();
  const onCerrar = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(puntosCriticosService.getPuntoCriticoById).mockResolvedValue({
      ...mockPunto,
      actualizadoEn: null,
      actualizadoPorId: null,
    });
  });

  it('debe precargar los datos iniciales y consultar el detalle fresco', async () => {
    const { result } = renderHook(() =>
      usePuntoCriticoEditForm({
        puntoInicial: mockPunto,
        usuarioActivoId: '00000000-0000-4000-8000-000000000001',
        onGuardadoExitoso,
        onCerrar,
      })
    );

    expect(result.current.formData.nombre).toBe('Sector Humedal Angachilla');
    expect(result.current.formData.prioridad).toBe('ALTA');
    expect(result.current.formData.latitud).toBe(-39.8456);
    expect(result.current.formData.longitud).toBe(-73.2389);
  });

  it('debe validar que el nombre sea obligatorio y tenga al menos 3 caracteres', async () => {
    const { result } = renderHook(() =>
      usePuntoCriticoEditForm({
        puntoInicial: mockPunto,
        usuarioActivoId: '00000000-0000-4000-8000-000000000001',
        onGuardadoExitoso,
        onCerrar,
      })
    );

    act(() => {
      result.current.handleFieldChange('nombre', '   ');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.clientErrors.nombre).toBe('El nombre del punto crítico es obligatorio.');
    expect(puntosCriticosService.actualizarPuntoCritico).not.toHaveBeenCalled();

    act(() => {
      result.current.handleFieldChange('nombre', 'AB');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.clientErrors.nombre).toBe('El nombre debe tener al menos 3 caracteres.');
  });

  it('debe validar rangos de latitud y longitud', async () => {
    const { result } = renderHook(() =>
      usePuntoCriticoEditForm({
        puntoInicial: mockPunto,
        usuarioActivoId: '00000000-0000-4000-8000-000000000001',
        onGuardadoExitoso,
        onCerrar,
      })
    );

    act(() => {
      result.current.handleFieldChange('latitud', 120);
      result.current.handleFieldChange('longitud', -200);
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.clientErrors.latitud).toBe('La latitud debe encontrarse entre -90 y 90 grados.');
    expect(result.current.clientErrors.longitud).toBe('La longitud debe encontrarse entre -180 y 180 grados.');
  });

  it('debe permitir centrar en Valdivia y actualizar coordenadas', () => {
    const { result } = renderHook(() =>
      usePuntoCriticoEditForm({
        puntoInicial: mockPunto,
        usuarioActivoId: '00000000-0000-4000-8000-000000000001',
        onGuardadoExitoso,
        onCerrar,
      })
    );

    act(() => {
      result.current.handleCenterValdivia();
    });

    expect(result.current.formData.latitud).toBe(VALDIVIA_CENTRO_LAT);
    expect(result.current.formData.longitud).toBe(VALDIVIA_CENTRO_LNG);
  });

  it('debe guardar exitosamente cuando los campos son válidos y llamar a onGuardadoExitoso', async () => {
    vi.mocked(puntosCriticosService.actualizarPuntoCritico).mockResolvedValueOnce({
      ...mockPunto,
      nombre: 'Humedal Angachilla Renombrado',
      prioridad: 'CRITICA',
      latitud: -39.845,
      longitud: -73.238,
      actualizadoEn: '2026-10-04T12:00:00Z',
    });

    const { result } = renderHook(() =>
      usePuntoCriticoEditForm({
        puntoInicial: mockPunto,
        usuarioActivoId: '00000000-0000-4000-8000-000000000001',
        onGuardadoExitoso,
        onCerrar,
      })
    );

    act(() => {
      result.current.handleFieldChange('nombre', 'Humedal Angachilla Renombrado');
      result.current.handleFieldChange('prioridad', 'CRITICA');
      result.current.handleCoordsChange({ latitud: -39.845, longitud: -73.238 });
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(puntosCriticosService.actualizarPuntoCritico).toHaveBeenCalledWith(
      mockPunto.id,
      expect.objectContaining({
        nombre: 'Humedal Angachilla Renombrado',
        prioridad: 'CRITICA',
        latitud: -39.845,
        longitud: -73.238,
      }),
      '00000000-0000-4000-8000-000000000001'
    );
    expect(onGuardadoExitoso).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Humedal Angachilla Renombrado',
      })
    );
  });

  it('debe capturar error 409 y desplegar mensaje amigable si el punto está inactivo', async () => {
    const error409 = new puntosCriticosService.PuntoCriticoServiceError({
      message: 'No es posible modificar este punto crítico porque se encuentra inactivo.',
      statusCode: 409,
    });
    vi.mocked(puntosCriticosService.actualizarPuntoCritico).mockRejectedValueOnce(error409);

    const { result } = renderHook(() =>
      usePuntoCriticoEditForm({
        puntoInicial: mockPunto,
        usuarioActivoId: '00000000-0000-4000-8000-000000000001',
        onGuardadoExitoso,
        onCerrar,
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.serverError).toContain('No es posible modificar este punto crítico porque se encuentra inactivo.');
    expect(onGuardadoExitoso).not.toHaveBeenCalled();
  });
});
