import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNuevaPatrullaForm } from '../useNuevaPatrullaForm';
import * as patrullasServiceModule from '@/services/patrullasService';
import * as catalogosServiceModule from '@/services/catalogosService';
import * as recursosServiceModule from '@/services/recursosService';
import * as empleadosServiceModule from '@/services/empleadosService';

vi.mock('@/context/SimulatedSessionContext', () => ({
  useSimulatedSession: () => ({
    usuarioActivo: {
      id: '00000000-0000-4000-8000-000000000001',
      nombre: 'Administrador Municipal',
      rol: 'Administrador',
    },
    hasPermission: () => true,
    isMounted: true,
  }),
}));

vi.mock('@/services/catalogosService', async (importOriginal) => {
  const actual = await importOriginal<typeof catalogosServiceModule>();
  return {
    ...actual,
    catalogosService: {
      ...actual.catalogosService,
      getCatalogos: vi.fn().mockResolvedValue({
        roles: [],
        delegaciones: [
          { id: '30000000-0000-4000-8000-000000000001', nombre: 'Norte', codigo: 'DEL_NORTE' },
        ],
        especialidades: [],
        cargos: [],
      }),
    },
  };
});

vi.mock('@/services/recursosService', () => ({
  getRecursos: vi.fn().mockResolvedValue({
    data: [
      {
        id: 'e1000000-0000-4000-8000-000000000002',
        nombre: 'Camioneta 4x4',
        esIndividual: true,
        estado: 'DISPONIBLE',
        detalles: { patente: 'CD-FG-23' },
      },
    ],
    meta: { total: 1, page: 1, limit: 100, totalPages: 1 },
  }),
}));

vi.mock('@/services/empleadosService', () => ({
  empleadosService: {
    getEmpleadosPaginado: vi.fn().mockResolvedValue({
      data: [
        {
          usuario_id: 'c1000000-0000-4000-8000-000000000001',
          personal_id: 'b1000000-0000-4000-8000-000000000001',
          nombres: 'Juan',
          apellidos: 'Pérez',
          rol_codigo: 'PATRULLA_VERIFICADORA',
          usuario_activo: true,
        },
        {
          usuario_id: 'c1000000-0000-4000-8000-000000000002',
          personal_id: 'b1000000-0000-4000-8000-000000000002',
          nombres: 'María',
          apellidos: 'González',
          rol_codigo: 'PATRULLA_VERIFICADORA',
          usuario_activo: true,
        },
      ],
      meta: { total: 2, page: 1, limit: 100, totalPages: 1 },
    }),
  },
}));

vi.mock('@/services/patrullasService', () => ({
  DEFAULT_ENCARGADO_ID: '00000000-0000-4000-8000-000000000003',
  patrullasService: {
    crear: vi.fn(),
  },
}));

describe('useNuevaPatrullaForm (HU-83: Alta de Patrullas Verificadoras)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function renderNuevaPatrullaHook() {
    let hookResult: any;
    await act(async () => {
      hookResult = renderHook(() => useNuevaPatrullaForm());
    });
    return hookResult;
  }

  it('1. inicia con valores iniciales limpios y formulario no válido (isValid: false)', async () => {
    const { result } = await renderNuevaPatrullaHook();

    expect(result.current.formData.codigo).toBe('');
    expect(result.current.formData.delegacionId).toBe('');
    expect(result.current.formData.personalIds).toEqual([]);
    expect(result.current.isValid).toBe(false);
    expect(result.current.showConfirmModal).toBe(false);
    expect(result.current.createdPatrulla).toBeNull();
  });

  it('2. sanitiza automáticamente el código a mayúsculas y reemplaza espacios por guiones', async () => {
    const { result } = await renderNuevaPatrullaHook();

    act(() => {
      result.current.handleCodigoChange('pv norte 01');
    });

    expect(result.current.formData.codigo).toBe('PV-NORTE-01');
  });

  it('3. valida reactivamente campos obligatorios (código, delegación, al menos un integrante)', async () => {
    const { result } = await renderNuevaPatrullaHook();

    expect(result.current.isValid).toBe(false);

    act(() => {
      result.current.handleCodigoChange('PV-NORTE-01');
      result.current.handleDelegacionChange('30000000-0000-4000-8000-000000000001');
    });

    // Aún falta el personal
    expect(result.current.isValid).toBe(false);
    expect(result.current.clientErrors.personalIds).toBeDefined();

    act(() => {
      result.current.handleTogglePersonal(
        'b1000000-0000-4000-8000-000000000001',
        'c1000000-0000-4000-8000-000000000001'
      );
    });

    // Con código, delegación y un integrante, el formulario es válido
    expect(result.current.isValid).toBe(true);
    expect(result.current.formData.usuarioLiderId).toBe('c1000000-0000-4000-8000-000000000001');
  });

  it('4. gestiona la dotación y asigna al primer integrante como líder por defecto', async () => {
    const { result } = await renderNuevaPatrullaHook();

    act(() => {
      // Agregar integrante 1
      result.current.handleTogglePersonal(
        'b1000000-0000-4000-8000-000000000001',
        'c1000000-0000-4000-8000-000000000001'
      );
      // Agregar integrante 2
      result.current.handleTogglePersonal(
        'b1000000-0000-4000-8000-000000000002',
        'c1000000-0000-4000-8000-000000000002'
      );
    });

    expect(result.current.formData.personalIds).toHaveLength(2);
    expect(result.current.formData.usuarioLiderId).toBe('c1000000-0000-4000-8000-000000000001');

    // Cambiar líder explícitamente
    act(() => {
      result.current.handleLiderChange('c1000000-0000-4000-8000-000000000002');
    });

    expect(result.current.formData.usuarioLiderId).toBe('c1000000-0000-4000-8000-000000000002');
  });

  it('5. abre el modal de confirmación solo si el formulario es válido', async () => {
    const { result } = await renderNuevaPatrullaHook();

    // Intento con formulario inválido
    act(() => {
      result.current.handleOpenConfirmModal();
    });

    expect(result.current.showConfirmModal).toBe(false);
    expect(result.current.touched.codigo).toBe(true);

    // Completar datos válidos
    act(() => {
      result.current.handleCodigoChange('PV-NORTE-01');
      result.current.handleDelegacionChange('30000000-0000-4000-8000-000000000001');
      result.current.handleTogglePersonal(
        'b1000000-0000-4000-8000-000000000001',
        'c1000000-0000-4000-8000-000000000001'
      );
    });

    act(() => {
      result.current.handleOpenConfirmModal();
    });

    expect(result.current.showConfirmModal).toBe(true);
  });

  it('6. persiste exitosamente la patrulla a través de patrullasService.crear', async () => {
    vi.mocked(patrullasServiceModule.patrullasService.crear).mockResolvedValue({
      exito: true,
      mensaje: 'Patrulla verificadora registrada exitosamente.',
      data: {
        id: 'f1000000-0000-4000-8000-000000000099',
        codigo: 'PV-NORTE-01',
        nombre: 'Patrulla Rápida Norte 1',
        estado: 'DISPONIBLE',
      },
    });

    const { result } = await renderNuevaPatrullaHook();

    act(() => {
      result.current.handleCodigoChange('PV-NORTE-01');
      result.current.handleNombreChange('Patrulla Rápida Norte 1');
      result.current.handleDelegacionChange('30000000-0000-4000-8000-000000000001');
      result.current.handleVehiculoChange('e1000000-0000-4000-8000-000000000002');
      result.current.handleTogglePersonal(
        'b1000000-0000-4000-8000-000000000001',
        'c1000000-0000-4000-8000-000000000001'
      );
    });

    await act(async () => {
      await result.current.handleConfirmSave();
    });

    expect(patrullasServiceModule.patrullasService.crear).toHaveBeenCalledWith(
      expect.objectContaining({
        codigo: 'PV-NORTE-01',
        nombre: 'Patrulla Rápida Norte 1',
        delegacionId: '30000000-0000-4000-8000-000000000001',
        vehiculoId: 'e1000000-0000-4000-8000-000000000002',
        personalIds: ['b1000000-0000-4000-8000-000000000001'],
      }),
      '00000000-0000-4000-8000-000000000001'
    );

    expect(result.current.createdPatrulla?.id).toBe('f1000000-0000-4000-8000-000000000099');
    expect(result.current.showConfirmModal).toBe(false);
  });

  it('7. maneja error 409 de código duplicado resaltando el campo y mensaje', async () => {
    vi.mocked(patrullasServiceModule.patrullasService.crear).mockResolvedValue({
      exito: false,
      esConflicto: true,
      codigoError: 409,
      mensaje: 'Ya existe una patrulla registrada con ese código identificador.',
    });

    const { result } = await renderNuevaPatrullaHook();

    act(() => {
      result.current.handleCodigoChange('PV-NORTE-01');
      result.current.handleDelegacionChange('30000000-0000-4000-8000-000000000001');
      result.current.handleTogglePersonal(
        'b1000000-0000-4000-8000-000000000001',
        'c1000000-0000-4000-8000-000000000001'
      );
    });

    await act(async () => {
      await result.current.handleConfirmSave();
    });

    expect(result.current.serverError).toContain('Ya existe una patrulla');
    expect(result.current.serverFieldErrors).toEqual([
      { campo: 'codigo', mensaje: 'Ya existe una patrulla registrada con este código.' },
    ]);
  });
});
