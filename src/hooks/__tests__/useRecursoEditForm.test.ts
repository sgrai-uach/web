import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRecursoEditForm, inferSubtipo, populateDetallesFormFields } from '../useRecursoEditForm';
import * as recursosService from '@/services/recursosService';
import type { RecursoItem } from '@/types/recurso';

vi.mock('@/services/recursosService', () => ({
  getRecursoById: vi.fn(),
  actualizarRecurso: vi.fn(),
  RecursoServiceError: class extends Error {
    public apiError: unknown;
    constructor(apiError: unknown) {
      super((apiError as any)?.message || 'Error');
      this.apiError = apiError;
    }
  },
}));

describe('useRecursoEditForm', () => {
  const mockRecurso: RecursoItem = {
    id: '11111111-1111-4000-8000-111111111111',
    nombre: 'Sacos de arena',
    tipo: 'Material o Insumo',
    esIndividual: false,
    estado: 'DISPONIBLE',
    cantidadInventario: 50,
    cantidadEnUso: 10,
    cantidadDisponible: 40,
    cantidadMinima: 5,
    latitud: -39.8142,
    longitud: -73.2459,
    descripcion: 'Sacos para contención de aguas',
    detalles: {},
    delegacion: null,
    creadoPorId: '00000000-0000-4000-8000-000000000001',
    creadoEn: '2026-09-29T10:00:00.000Z',
    actualizadoEn: '2026-09-29T10:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(recursosService.getRecursoById).mockResolvedValue(mockRecurso);
  });

  it('debe inferir subtipos correctamente según características de los detalles', () => {
    expect(inferSubtipo(false)).toBe('NINGUNO');
    expect(inferSubtipo(true, { kilometraje: 15000 })).toBe('VEHICULO');
    expect(inferSubtipo(true, { tipoGrua: 'Pluma', horometro: 200 })).toBe('MAQUINARIA');
    expect(inferSubtipo(true, { caudalMaximoLpm: 500 })).toBe('MOTOBOMBA');
    expect(inferSubtipo(true, { numeroSerie: 'SN-9988' })).toBe('SERIALIZADO');
  });

  it('debe poblar los campos de detalles correctamente desde objeto plano', () => {
    const populated = populateDetallesFormFields({
      patente: 'ABCD-12',
      kilometraje: 54000,
      tipoCombustible: 'DIESEL',
    });

    expect(populated.patente).toBe('ABCD-12');
    expect(populated.kilometraje).toBe('54000');
    expect(populated.tipoCombustible).toBe('DIESEL');
  });

  it('debe detectar error si la cantidad de inventario es menor a las unidades en uso', async () => {
    const onGuardado = vi.fn();
    const onCerrar = vi.fn();

    const { result } = renderHook(() =>
      useRecursoEditForm({
        recursoInicial: mockRecurso,
        usuarioActivoId: '00000000-0000-4000-8000-000000000001',
        onGuardadoExitoso: onGuardado,
        onCerrar,
      })
    );

    // Esperar inicialización
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.formData?.nombre).toBe('Sacos de arena');

    // Cambiar cantidadInventario a 5 (menor a cantidadEnUso: 10)
    act(() => {
      result.current.handleFieldChange('cantidadInventario', 5);
    });

    expect(result.current.clientErrors.cantidadInventario).toContain('No puedes reducir el inventario a menos de 10 unidades');
    expect(result.current.isValid).toBe(false);
  });

  it('debe permitir guardar cuando los datos son válidos y llamar a onGuardadoExitoso', async () => {
    const onGuardado = vi.fn();
    const onCerrar = vi.fn();
    const mockActualizado = { ...mockRecurso, nombre: 'Sacos de arena reforzados' };
    vi.mocked(recursosService.actualizarRecurso).mockResolvedValue(mockActualizado);

    const { result } = renderHook(() =>
      useRecursoEditForm({
        recursoInicial: mockRecurso,
        usuarioActivoId: '00000000-0000-4000-8000-000000000001',
        onGuardadoExitoso: onGuardado,
        onCerrar,
      })
    );

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.handleFieldChange('nombre', 'Sacos de arena reforzados');
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
    });

    expect(recursosService.actualizarRecurso).toHaveBeenCalledWith(
      mockRecurso.id,
      expect.objectContaining({
        nombre: 'Sacos de arena reforzados',
      }),
      '00000000-0000-4000-8000-000000000001'
    );
    expect(onGuardado).toHaveBeenCalledWith(mockActualizado);
    expect(onCerrar).toHaveBeenCalled();
  });
});
