import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEditarPatrullaForm } from '../useEditarPatrullaForm';
import { patrullasService } from '@/services/patrullasService';
import type { PatrullaVerificadoraDTO } from '@/types/patrullas';

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

vi.mock('@/services/catalogosService', () => ({
  catalogosService: {
    getCatalogos: vi.fn().mockResolvedValue({
      roles: [],
      delegaciones: [
        { id: '30000000-0000-4000-8000-000000000001', nombre: 'Norte', codigo: 'DEL_NORTE' },
        { id: '30000000-0000-4000-8000-000000000003', nombre: 'Costa', codigo: 'DEL_COSTA' },
      ],
      especialidades: [],
      cargos: [],
    }),
  },
}));

vi.mock('@/services/recursosService', () => ({
  getRecursos: vi.fn().mockResolvedValue({
    data: [
      {
        id: 'e1000000-0000-4000-8000-000000000002',
        nombre: 'Camioneta 4x4 Navara',
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
          estado_operativo: 'disponible',
        },
        {
          usuario_id: 'c1000000-0000-4000-8000-000000000002',
          personal_id: 'b1000000-0000-4000-8000-000000000002',
          nombres: 'María',
          apellidos: 'González',
          rol_codigo: 'PATRULLA_VERIFICADORA',
          usuario_activo: true,
          estado_operativo: 'disponible',
        },
        {
          usuario_id: 'c1000000-0000-4000-8000-000000000003',
          personal_id: 'b1000000-0000-4000-8000-000000000003',
          nombres: 'Roberto',
          apellidos: 'Soto',
          rol_codigo: 'PATRULLA_VERIFICADORA',
          usuario_activo: true,
          estado_operativo: 'en_patrulla',
        },
        {
          usuario_id: 'c1000000-0000-4000-8000-000000000004',
          personal_id: 'b1000000-0000-4000-8000-000000000004',
          nombres: 'Carlos',
          apellidos: 'Reyes',
          rol_codigo: 'PATRULLA_VERIFICADORA',
          usuario_activo: true,
          estado_operativo: 'licencia',
        },
      ],
      meta: { total: 4, page: 1, limit: 100, totalPages: 1 },
    }),
  },
}));

vi.mock('@/services/patrullasService', () => ({
  DEFAULT_ENCARGADO_ID: '00000000-0000-4000-8000-000000000003',
  patrullasService: {
    editar: vi.fn(),
  },
}));

describe('useEditarPatrullaForm (HU-84: Edición de Patrulla Verificadora)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPatrullaDisponible: PatrullaVerificadoraDTO = {
    id: 'f1000000-0000-4000-8000-000000000001',
    codigo: 'PV-COSTA-01',
    nombre: 'Patrulla Rápida Costa-1',
    estado: 'DISPONIBLE',
    delegacion: {
      id: '30000000-0000-4000-8000-000000000003',
      nombre: 'Costa',
      codigo: 'DEL_COSTA',
    },
    vehiculo: {
      id: 'e1000000-0000-4000-8000-000000000005',
      nombre: 'Camioneta Toyota Hilux',
      estado: 'ASIGNADO',
      detalles: { patente: 'AB-CD-12' },
    },
    lider: {
      id: 'c1000000-0000-4000-8000-000000000001',
      nombre: 'Juan Pérez',
      email: 'juan@valdivia.cl',
    },
    integrantes: [
      {
        id: 'b1000000-0000-4000-8000-000000000001',
        usuarioId: 'c1000000-0000-4000-8000-000000000001',
        nombre: 'Juan Pérez',
        cargo: 'Evaluador',
        rolEnPatrulla: 'LIDER',
      },
    ],
    misionActiva: null,
  };

  const mockPatrullaEnVerificacion: PatrullaVerificadoraDTO = {
    ...mockPatrullaDisponible,
    estado: 'EN_VERIFICACION',
    misionActiva: {
      id: 'mis-1',
      codigo: 'MIS-001',
      titulo: 'Verificar anegamiento',
      tipoMision: 'VERIFICACION',
      estado: 'EN_CURSO',
      prioridad: 'ALTA',
    },
  };

  type HookResultType = ReturnType<typeof renderHook<ReturnType<typeof useEditarPatrullaForm>, unknown>>;

  it('1. precarga los valores actuales de la patrulla disponible y valida como válida (isValid: true)', async () => {
    let hookResult!: HookResultType;
    await act(async () => {
      hookResult = renderHook(() => useEditarPatrullaForm(mockPatrullaDisponible));
    });

    const { result } = hookResult;
    expect(result.current.formData.nombre).toBe('Patrulla Rápida Costa-1');
    expect(result.current.formData.delegacionId).toBe('30000000-0000-4000-8000-000000000003');
    expect(result.current.formData.vehiculoId).toBe('e1000000-0000-4000-8000-000000000005');
    expect(result.current.formData.personalIds).toContain('b1000000-0000-4000-8000-000000000001');
    expect(result.current.estaBloqueada).toBe(false);
    expect(result.current.isValid).toBe(true);
    expect(result.current.mensajeBloqueo).toBeNull();
  });

  it('2. bloquea la edición si la patrulla se encuentra en verificación o misión activa', async () => {
    let hookResult!: HookResultType;
    await act(async () => {
      hookResult = renderHook(() => useEditarPatrullaForm(mockPatrullaEnVerificacion));
    });

    const { result } = hookResult;
    expect(result.current.estaBloqueada).toBe(true);
    expect(result.current.isValid).toBe(false);
    expect(result.current.mensajeBloqueo).toContain('No es posible editar la patrulla');
  });

  it('3. permite actualizar campos y enviar edición exitosamente (200 OK)', async () => {
    const onGuardadoExitoso = vi.fn();
    vi.mocked(patrullasService.editar).mockResolvedValueOnce({
      exito: true,
      mensaje: 'Patrulla modificada',
      data: { ...mockPatrullaDisponible, nombre: 'Patrulla Costa Modificada' },
    });

    let hookResult!: HookResultType;
    await act(async () => {
      hookResult = renderHook(() => useEditarPatrullaForm(mockPatrullaDisponible, onGuardadoExitoso));
    });

    const { result } = hookResult;

    act(() => {
      result.current.handleNombreChange('Patrulla Costa Modificada');
      result.current.handleDelegacionChange('30000000-0000-4000-8000-000000000001');
      result.current.handleVehiculoChange('');
    });

    expect(result.current.formData.nombre).toBe('Patrulla Costa Modificada');
    expect(result.current.formData.delegacionId).toBe('30000000-0000-4000-8000-000000000001');
    expect(result.current.formData.vehiculoId).toBe('');

    await act(async () => {
      await result.current.handleConfirmSave();
    });

    expect(patrullasService.editar).toHaveBeenCalledWith(
      mockPatrullaDisponible.id,
      expect.objectContaining({
        nombre: 'Patrulla Costa Modificada',
        delegacionId: '30000000-0000-4000-8000-000000000001',
        vehiculoId: null,
      }),
      expect.any(String)
    );
    expect(onGuardadoExitoso).toHaveBeenCalledTimes(1);
  });

  it('4. maneja respuesta 409 Conflict registrando esConflicto y exponiendo el mensaje', async () => {
    vi.mocked(patrullasService.editar).mockResolvedValueOnce({
      exito: false,
      esConflicto: true,
      codigoError: 409,
      mensaje: 'La patrulla verificadora tiene una misión táctica activa en curso.',
    });

    let hookResult!: HookResultType;
    await act(async () => {
      hookResult = renderHook(() => useEditarPatrullaForm(mockPatrullaDisponible));
    });

    const { result } = hookResult;

    await act(async () => {
      await result.current.handleConfirmSave();
    });

    expect(result.current.esConflicto).toBe(true);
    expect(result.current.serverError).toContain('misión táctica activa');
  });

  it('5. BUG-H84-WEB-01: invalida nombres de menos de 3 caracteres con mensaje de Zod', async () => {
    let hookResult!: HookResultType;
    await act(async () => {
      hookResult = renderHook(() => useEditarPatrullaForm(mockPatrullaDisponible));
    });

    const { result } = hookResult;

    act(() => {
      result.current.handleNombreChange('PV');
    });

    expect(result.current.isValid).toBe(false);
    expect(result.current.clientErrors.nombre).toBe(
      'El nombre de la patrulla debe tener al menos 3 caracteres.'
    );
  });

  it('6. BUG-H84-WEB-02: reasigna automáticamente el líder al primer integrante restante al desmarcar al líder', async () => {
    const patrullaConDosIntegrantes: PatrullaVerificadoraDTO = {
      ...mockPatrullaDisponible,
      integrantes: [
        {
          id: 'b1000000-0000-4000-8000-000000000001',
          usuarioId: 'c1000000-0000-4000-8000-000000000001',
          nombre: 'Juan Pérez',
          rolEnPatrulla: 'LIDER',
        },
        {
          id: 'b1000000-0000-4000-8000-000000000002',
          usuarioId: 'c1000000-0000-4000-8000-000000000002',
          nombre: 'María González',
          rolEnPatrulla: 'INTEGRANTE',
        },
      ],
      lider: {
        id: 'c1000000-0000-4000-8000-000000000001',
        nombre: 'Juan Pérez',
        email: 'juan@valdivia.cl',
      },
    };

    let hookResult!: HookResultType;
    await act(async () => {
      hookResult = renderHook(() => useEditarPatrullaForm(patrullaConDosIntegrantes));
    });

    const { result } = hookResult;
    expect(result.current.formData.usuarioLiderId).toBe('c1000000-0000-4000-8000-000000000001');

    // Desmarcar al líder actual (Juan Pérez)
    act(() => {
      result.current.handleTogglePersonal(
        'b1000000-0000-4000-8000-000000000001',
        'c1000000-0000-4000-8000-000000000001'
      );
    });

    // Ahora el líder debe haberse transferido automáticamente al usuario_id de María González
    expect(result.current.formData.personalIds).toEqual(['b1000000-0000-4000-8000-000000000002']);
    expect(result.current.formData.usuarioLiderId).toBe('c1000000-0000-4000-8000-000000000002');
  });

  it('7. BUG-H84-WEB-03: bloquea la edición ante cualquier estado operativo activo (EN_MISION, EN_PREVENCION, EN_RECUPERACION)', async () => {
    const estadosActivos = ['EN_MISION', 'EN_PREVENCION', 'EN_RECUPERACION'] as const;

    for (const estado of estadosActivos) {
      const patrullaActiva: PatrullaVerificadoraDTO = {
        ...mockPatrullaDisponible,
        estado,
        misionActiva: null,
      };

      let hookResult!: HookResultType;
      await act(async () => {
        hookResult = renderHook(() => useEditarPatrullaForm(patrullaActiva));
      });

      const { result } = hookResult;
      expect(result.current.estaBloqueada).toBe(true);
      expect(result.current.isValid).toBe(false);
      expect(result.current.mensajeBloqueo).toContain('No es posible editar la patrulla');
    }
  });

  it('8. permite seleccionar a un funcionario en_patrulla (duplicación controlada) y bloquea funcionarios inoperativos (licencia/descanso/inactivo)', async () => {
    let hookResult!: HookResultType;
    await act(async () => {
      hookResult = renderHook(() => useEditarPatrullaForm(mockPatrullaDisponible));
    });

    const { result } = hookResult;

    // Intentar agregar a Roberto Soto (personal_id: b1000000-...-0003), quien está en estado 'en_patrulla'
    act(() => {
      result.current.handleTogglePersonal(
        'b1000000-0000-4000-8000-000000000003',
        'c1000000-0000-4000-8000-000000000003'
      );
    });

    // SÍ debe haberse agregado a personalIds (duplicación permitida con advertencia)
    expect(result.current.formData.personalIds).toContain('b1000000-0000-4000-8000-000000000003');

    // Intentar agregar a Carlos Reyes (personal_id: b1000000-...-0004), quien está con licencia médica
    act(() => {
      result.current.handleTogglePersonal(
        'b1000000-0000-4000-8000-000000000004',
        'c1000000-0000-4000-8000-000000000004'
      );
    });

    // NO debe haberse agregado a personalIds por encontrarse inoperativo
    expect(result.current.formData.personalIds).not.toContain('b1000000-0000-4000-8000-000000000004');
  });
});
