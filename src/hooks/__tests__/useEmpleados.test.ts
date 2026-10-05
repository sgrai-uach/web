import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEmpleados } from '@/hooks/useEmpleados';
import { empleadosService } from '@/services/empleadosService';
import type { EmpleadoUsuario } from '@/types/empleados';

// Mock del servicio de catálogos
vi.mock('@/hooks/useCatalogos', () => ({
  useCatalogos: () => ({
    catalogos: {
      roles: [{ id: 'rol-1', nombre: 'Operador' }],
      delegaciones: [{ id: 'del-1', nombre: 'Centro' }],
    },
    cargando: false,
    error: null,
  }),
}));

const mockEmpleados: EmpleadoUsuario[] = [
  {
    usuario_id: 'usr-1',
    personal_id: 'per-1',
    rut: '11.111.111-1',
    nombres: 'Juan',
    apellidos: 'Pérez',
    email: 'juan@valdivia.cl',
    telefono: '+56911111111',
    direccion: 'Valdivia Centro',
    rol_id: 'rol-1',
    rol_nombre: 'Operador',
    delegacion_id: 'del-1',
    delegacion_nombre: 'Centro',
    especialidad: 'Operador',
    usuario_activo: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    usuario_id: 'usr-2',
    personal_id: 'per-2',
    rut: '22.222.222-2',
    nombres: 'María',
    apellidos: 'González',
    email: 'maria@valdivia.cl',
    telefono: '+56922222222',
    direccion: 'Las Ánimas',
    rol_id: 'rol-1',
    rol_nombre: 'Operador',
    delegacion_id: 'del-1',
    delegacion_nombre: 'Centro',
    especialidad: 'Operador',
    usuario_activo: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

describe('useEmpleados hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe inicializar con valores por defecto y cargar empleados con meta estandarizado', async () => {
    const listWithMeta = [...mockEmpleados] as EmpleadoUsuario[] & { meta: unknown };
    listWithMeta.meta = {
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    };

    vi.spyOn(empleadosService, 'getEmpleados').mockResolvedValueOnce(listWithMeta);

    const { result } = renderHook(() => useEmpleados());

    expect(result.current.paginaActual).toBe(1);
    expect(result.current.limite).toBe(10);

    await waitFor(() => {
      expect(result.current.totalItems).toBe(2);
    });

    expect(result.current.meta).toBeDefined();
    expect(result.current.meta.total).toBe(2);
    expect(result.current.meta.page).toBe(1);
    expect(result.current.meta.limit).toBe(10);
    expect(result.current.meta.totalPages).toBe(1);
    expect(result.current.meta.hasNext).toBe(false);
    expect(result.current.meta.hasPrev).toBe(false);
  });

  it('debe actualizar meta cuando cambia la paginación', async () => {
    const listWithMeta = [...mockEmpleados] as EmpleadoUsuario[] & { meta: unknown };
    listWithMeta.meta = {
      total: 2,
      page: 1,
      limit: 1,
      totalPages: 2,
      hasNext: true,
      hasPrev: false,
    };

    vi.spyOn(empleadosService, 'getEmpleados').mockResolvedValue(listWithMeta);

    const { result } = renderHook(() => useEmpleados());

    await waitFor(() => {
      expect(result.current.totalItems).toBe(2);
    });

    act(() => {
      result.current.setLimite(1);
    });

    expect(result.current.meta.limit).toBe(1);
    expect(result.current.meta.totalPages).toBe(2);
    expect(result.current.meta.hasNext).toBe(true);

    act(() => {
      result.current.setPaginaActual(2);
    });

    expect(result.current.meta.page).toBe(2);
    expect(result.current.meta.hasPrev).toBe(true);
    expect(result.current.meta.hasNext).toBe(false);
  });

  it('debe filtrar por estado (activo) recalculando meta', async () => {
    const listWithMeta = [...mockEmpleados] as EmpleadoUsuario[] & { meta: unknown };
    listWithMeta.meta = {
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    };

    vi.spyOn(empleadosService, 'getEmpleados').mockResolvedValue(listWithMeta);

    const { result } = renderHook(() => useEmpleados());

    await waitFor(() => {
      expect(result.current.totalItems).toBe(2);
    });

    act(() => {
      result.current.setEstadoFiltro('activo');
    });

    // Sólo 1 de los 2 es activo
    expect(result.current.totalItems).toBe(1);
    expect(result.current.meta.total).toBe(1);
    expect(result.current.empleadosPaginados).toHaveLength(1);
    expect(result.current.empleadosPaginados[0].nombres).toBe('Juan');
  });
});
