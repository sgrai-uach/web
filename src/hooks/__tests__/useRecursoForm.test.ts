import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRecursoForm } from '../useRecursoForm';
import * as recursosService from '@/services/recursosService';
import { RecursoServiceError } from '@/services/recursosService';

vi.mock('@/context/SimulatedSessionContext', () => ({
  useSimulatedSession: () => ({
    usuarioActivo: {
      id: '00000000-0000-4000-8000-000000000001',
      nombre: 'Administrador Municipal',
      rol: 'Administrador',
    },
    hasPermission: () => true,
  }),
}));

vi.mock('@/services/recursosService', async (importOriginal) => {
  const actual = await importOriginal<typeof recursosService>();
  return {
    ...actual,
    crearRecurso: vi.fn(),
  };
});

describe('useRecursoForm (HU-6: Crear Recurso Frontend)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. inicia con valores vacíos y formulario no válido (isValid: false)', () => {
    const { result } = renderHook(() => useRecursoForm());

    expect(result.current.formData.nombre).toBe('');
    expect(result.current.formData.esIndividual).toBe(false);
    expect(result.current.isValid).toBe(false);
    expect(result.current.showConfirmModal).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.serverError).toBeNull();
  });

  it('2. valida reactivamente en tiempo real el nombre mínimo de 3 caracteres', () => {
    const { result } = renderHook(() => useRecursoForm());

    act(() => {
      result.current.handleFieldChange('nombre', 'AB');
      result.current.handleBlur('nombre');
    });

    expect(result.current.isValid).toBe(false);
    expect(result.current.clientErrors.nombre).toBe('El nombre debe tener al menos 3 caracteres');

    act(() => {
      result.current.handleFieldChange('nombre', 'Sacos de Arena');
    });

    expect(result.current.clientErrors.nombre).toBeUndefined();
  });

  it('3. fija cantidadInventario en 1 cuando se marca esIndividual: true', () => {
    const { result } = renderHook(() => useRecursoForm());

    act(() => {
      result.current.handleEsIndividualChange(true);
    });

    expect(result.current.formData.esIndividual).toBe(true);
    expect(result.current.formData.cantidadInventario).toBe(1);
  });

  it('4. valida coordenadas geográficas y permite centrar en Valdivia', () => {
    const { result } = renderHook(() => useRecursoForm());

    act(() => {
      result.current.handleCenterValdivia();
    });

    expect(result.current.formData.latitud).toBe(-39.8142);
    expect(result.current.formData.longitud).toBe(-73.2459);
    expect(result.current.touched.latitud).toBe(true);
    expect(result.current.touched.longitud).toBe(true);
  });

  it('5. pasa a isValid: true cuando todos los campos requeridos son válidos', () => {
    const { result } = renderHook(() => useRecursoForm());

    act(() => {
      result.current.handleFieldChange('nombre', 'Sacos de Arena');
      result.current.handleFieldChange('cantidadInventario', 50);
      result.current.handleFieldChange('cantidadMinima', 10);
      result.current.handleCoordsChange({ latitud: -39.8142, longitud: -73.2459 });
    });

    expect(result.current.isValid).toBe(true);
    expect(Object.keys(result.current.clientErrors)).toHaveLength(0);
  });

  it('6. previene apertura de modal de confirmación si el formulario es inválido', () => {
    const { result } = renderHook(() => useRecursoForm());

    act(() => {
      result.current.handleOpenConfirmModal();
    });

    expect(result.current.showConfirmModal).toBe(false);
    expect(result.current.touched.nombre).toBe(true);
  });

  it('7. abre y cierra modal de confirmación si el formulario es válido', () => {
    const { result } = renderHook(() => useRecursoForm());

    act(() => {
      result.current.handleFieldChange('nombre', 'Sacos de Arena');
      result.current.handleFieldChange('cantidadInventario', 50);
      result.current.handleCoordsChange({ latitud: -39.8142, longitud: -73.2459 });
    });

    act(() => {
      result.current.handleOpenConfirmModal();
    });

    expect(result.current.showConfirmModal).toBe(true);

    act(() => {
      result.current.handleCloseConfirmModal();
    });

    expect(result.current.showConfirmModal).toBe(false);
  });

  it('8. guarda exitosamente el recurso, invoca crearRecurso y setea createdResourceName', async () => {
    const { result } = renderHook(() => useRecursoForm());

    vi.mocked(recursosService.crearRecurso).mockResolvedValueOnce({
      id: 'mock-recurso-uuid',
      nombre: 'Sacos de Arena',
      estado: 'DISPONIBLE',
      cantidadInventario: 50,
      cantidadMinima: 10,
      esIndividual: false,
      latitud: -39.8142,
      longitud: -73.2459,
      creadoEn: '2026-10-07T00:00:00Z',
      actualizadoEn: '2026-10-07T00:00:00Z',
    });

    act(() => {
      result.current.handleFieldChange('nombre', 'Sacos de Arena');
      result.current.handleFieldChange('cantidadInventario', 50);
      result.current.handleCoordsChange({ latitud: -39.8142, longitud: -73.2459 });
    });

    await act(async () => {
      await result.current.handleConfirmSave();
    });

    expect(recursosService.crearRecurso).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Sacos de Arena',
        cantidadInventario: 50,
        latitud: -39.8142,
        longitud: -73.2459,
      }),
      '00000000-0000-4000-8000-000000000001'
    );
    expect(result.current.createdResourceName).toBe('Sacos de Arena');
    expect(result.current.showConfirmModal).toBe(false);
  });

  it('9. Criterio CA-5: conserva íntegramente los datos en formData ante error de red o servidor', async () => {
    const { result } = renderHook(() => useRecursoForm());

    vi.mocked(recursosService.crearRecurso).mockRejectedValueOnce(
      new RecursoServiceError({
        message: 'Error de red: no fue posible conectar con el servidor',
        statusCode: 500,
      })
    );

    act(() => {
      result.current.handleFieldChange('nombre', 'Camioneta Rescate');
      result.current.handleFieldChange('descripcion', 'Vehículo 4x4 asignado a bodega sur');
      result.current.handleFieldChange('cantidadInventario', 1);
      result.current.handleCoordsChange({ latitud: -39.8142, longitud: -73.2459 });
    });

    await act(async () => {
      await result.current.handleConfirmSave();
    });

    // Error reflejado en la alerta
    expect(result.current.serverError).toBe('Error de red: no fue posible conectar con el servidor');
    expect(result.current.isSubmitting).toBe(false);

    // CRÍTICO: Los datos ingresados NO fueron borrados
    expect(result.current.formData.nombre).toBe('Camioneta Rescate');
    expect(result.current.formData.descripcion).toBe('Vehículo 4x4 asignado a bodega sur');
    expect(result.current.formData.cantidadInventario).toBe(1);
    expect(result.current.formData.latitud).toBe(-39.8142);
    expect(result.current.formData.longitud).toBe(-73.2459);
  });

  it('10. restablece el formulario al invocar handleReset', () => {
    const { result } = renderHook(() => useRecursoForm());

    act(() => {
      result.current.handleFieldChange('nombre', 'Generador Eléctrico');
      result.current.handleFieldChange('cantidadInventario', 5);
      result.current.handleReset();
    });

    expect(result.current.formData.nombre).toBe('');
    expect(result.current.formData.cantidadInventario).toBe('');
    expect(result.current.createdResourceName).toBeNull();
    expect(result.current.serverError).toBeNull();
  });
});
