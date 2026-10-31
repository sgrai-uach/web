import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEmpleadoForm } from '@/hooks/useEmpleadoForm';
import { useRegistrarEmpleado } from '@/hooks/useRegistrarEmpleado';
import { empleadosService } from '@/services/empleadosService';
import type { EmpleadoUsuario } from '@/types/empleados';

vi.mock('@/hooks/useCatalogos', () => ({
  useCatalogos: () => ({
    catalogos: {
      roles: [
        { id: 'rol-admin', codigo: 'ADMIN', nombre: 'Administrador' },
        { id: 'rol-terreno', codigo: 'BRIGADISTA', nombre: 'Brigadista' },
      ],
      delegaciones: [{ id: 'del-1', codigo: 'DEL_NORTE', nombre: 'Norte' }],
      especialidades: ['Motosierrista'],
      cargos: ['Brigadista'],
    },
    cargando: false,
    error: null,
  }),
}));

const crearEmpleado = (overrides: Partial<EmpleadoUsuario> = {}): EmpleadoUsuario => ({
  usuario_id: 'usr-1',
  personal_id: null,
  rut: '11.111.111-1',
  nombres: 'Juan',
  apellidos: 'Pérez',
  email: 'juan@valdivia.cl',
  telefono: '+56911111111',
  rol_id: 'rol-admin',
  rol_codigo: 'ADMIN',
  rol_nombre: 'Administrador',
  delegacion_id: 'del-1',
  delegacion_codigo: 'DEL_NORTE',
  delegacion_nombre: 'Norte',
  especialidad: null,
  cargo: null,
  estado_operativo: 'disponible',
  disponible_terreno: null,
  observaciones: null,
  usuario_activo: true,
  fecha_ingreso: '2026-01-01',
  fecha_salida: null,
  es_personal: false,
  ...overrides,
});

describe('Formularios de personal (H11 - disponibilidad)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(empleadosService, 'getCatalogos').mockResolvedValue({
      roles: [
        { id: 'rol-admin', codigo: 'ADMIN', nombre: 'Administrador' },
        { id: 'rol-terreno', codigo: 'BRIGADISTA', nombre: 'Brigadista' },
      ],
      delegaciones: [{ id: 'del-1', codigo: 'DEL_NORTE', nombre: 'Norte' }],
      especialidades: ['Motosierrista'],
      cargos: ['Brigadista'],
    });
  });

  it('debe enviar el estado operativo siempre y la capacidad de terreno sólo en roles de terreno', async () => {
    const updateSpy = vi
      .spyOn(empleadosService, 'updateEmpleado')
      .mockResolvedValue(crearEmpleado({ estado_operativo: 'descanso' }));

    const usuario = crearEmpleado();
    const { result } = renderHook(() =>
      useEmpleadoForm({
        usuario,
        onEmpleadoActualizado: vi.fn(),
      })
    );

    act(() => {
      result.current.setEstadoOperativo('descanso');
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
    });

    const payload = updateSpy.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(payload.estado_operativo).toBe('descanso');
    expect(payload).not.toHaveProperty('disponible_terreno');
  });

  it('debe enviar disponible_terreno cuando el funcionario tiene perfil de terreno', async () => {
    const updateSpy = vi
      .spyOn(empleadosService, 'updateEmpleado')
      .mockResolvedValue(crearEmpleado({ es_personal: true, disponible_terreno: true }));

    const usuario = crearEmpleado({ rol_id: 'rol-terreno', rol_codigo: 'BRIGADISTA' });
    const { result } = renderHook(() =>
      useEmpleadoForm({
        usuario,
        onEmpleadoActualizado: vi.fn(),
      })
    );

    expect(result.current.esRolTerreno).toBe(true);

    act(() => {
      result.current.setDisponibleTerreno(false);
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
    });

    const payload = updateSpy.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(payload.estado_operativo).toBe('disponible');
    expect(payload.disponible_terreno).toBe(false);
  });

  it('debe forzar el estado "inactivo" cuando la cuenta se desactiva', async () => {
    const updateSpy = vi
      .spyOn(empleadosService, 'updateEmpleado')
      .mockResolvedValue(crearEmpleado({ usuario_activo: false, estado_operativo: 'inactivo' }));

    const usuario = crearEmpleado();
    const { result } = renderHook(() =>
      useEmpleadoForm({
        usuario,
        onEmpleadoActualizado: vi.fn(),
      })
    );

    act(() => {
      result.current.setActivo(false);
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
    });

    const payload = updateSpy.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(payload.estado_operativo).toBe('inactivo');
  });

  it('debe enviar el estado operativo en el registro de un funcionario administrativo', async () => {
    const createSpy = vi
      .spyOn(empleadosService, 'createEmpleado')
      .mockResolvedValue(crearEmpleado());

    const { result } = renderHook(() => useRegistrarEmpleado({}));

    act(() => {
      result.current.setRut('11.111.111-1');
      result.current.setNombres('Juan');
      result.current.setApellidos('Pérez');
      result.current.setEmail('juan@valdivia.cl');
      result.current.setTelefono('+56911111111');
      result.current.setPassword('Password2026');
      result.current.setRolId('rol-admin');
      result.current.setDelegacionId('del-1');
      result.current.setEstadoOperativo('licencia');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    const payload = createSpy.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload.estado_operativo).toBe('licencia');
    expect(payload).not.toHaveProperty('disponible_terreno');
  });
});
