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
      especialidades: [],
      cargos: [],
    },
    cargando: false,
    error: null,
  }),
}));

const crearEmpleado = (overrides: Partial<EmpleadoUsuario> = {}): EmpleadoUsuario => ({
  usuario_id: 'usr-1',
  personal_id: 'per-1',
  rut: '11.111.111-1',
  nombres: 'Juan',
  apellidos: 'Pérez',
  email: 'juan@valdivia.cl',
  telefono: '+56911111111',
  rol_id: 'rol-1',
  rol_codigo: 'OPERADOR',
  rol_nombre: 'Operador',
  delegacion_id: 'del-1',
  delegacion_codigo: 'DEL_CENTRO',
  delegacion_nombre: 'Centro',
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

const metaEstandar = {
  total: 2,
  page: 1,
  limit: 10,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
};

describe('useEmpleados hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe inicializar con valores por defecto y cargar empleados con meta estandarizado', async () => {
    vi.spyOn(empleadosService, 'getEmpleadosPaginado').mockResolvedValue({
      data: [crearEmpleado(), crearEmpleado({ usuario_id: 'usr-2', nombres: 'María' })],
      meta: metaEstandar,
    });

    const { result } = renderHook(() => useEmpleados());

    expect(result.current.paginaActual).toBe(1);
    expect(result.current.limite).toBe(10);
    expect(result.current.incluirInactivos).toBe(false);

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

  it('H11: debe delegar la paginación al servidor (page y limit)', async () => {
    const spy = vi
      .spyOn(empleadosService, 'getEmpleadosPaginado')
      .mockResolvedValue({ data: [crearEmpleado()], meta: metaEstandar });

    renderHook(() => useEmpleados());

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });

    const parametros = spy.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(parametros.page).toBe(1);
    expect(parametros.limit).toBe(10);
    expect(parametros.incluirInactivos).toBe(false);
  });

  it('H11: debe enviar el estado operativo y la delegación como filtros del servidor', async () => {
    const spy = vi
      .spyOn(empleadosService, 'getEmpleadosPaginado')
      .mockResolvedValue({ data: [crearEmpleado()], meta: metaEstandar });

    const { result } = renderHook(() => useEmpleados());

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });

    act(() => {
      result.current.setEstadoOperativoFiltro('en_mision');
      result.current.setDelegacionFiltro('del-1');
    });

    await waitFor(() => {
      const ultimo = spy.mock.calls.at(-1)?.[0] as Record<string, unknown>;
      expect(ultimo.estadoOperativo).toBe('en_mision');
      expect(ultimo.delegacion_id).toBe('del-1');
    });
  });

  it('H11: debe incluir funcionarios inactivos sólo cuando el toggle está activo', async () => {
    const spy = vi
      .spyOn(empleadosService, 'getEmpleadosPaginado')
      .mockResolvedValue({ data: [crearEmpleado()], meta: metaEstandar });

    const { result } = renderHook(() => useEmpleados());

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });

    act(() => {
      result.current.setIncluirInactivos(true);
    });

    await waitFor(() => {
      const ultimo = spy.mock.calls.at(-1)?.[0] as Record<string, unknown>;
      expect(ultimo.incluirInactivos).toBe(true);
    });
  });

  it('H11: debe resetear la página a 1 al cambiar un filtro', async () => {
    const spy = vi
      .spyOn(empleadosService, 'getEmpleadosPaginado')
      .mockResolvedValue({ data: [crearEmpleado()], meta: metaEstandar });

    const { result } = renderHook(() => useEmpleados());

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });

    act(() => {
      result.current.setPaginaActual(3);
    });

    expect(result.current.paginaActual).toBe(3);

    act(() => {
      result.current.setEstadoOperativoFiltro('descanso');
    });

    expect(result.current.paginaActual).toBe(1);
  });

  it('H11: debe limpiar todos los filtros con limpiarFiltros', async () => {
    vi.spyOn(empleadosService, 'getEmpleadosPaginado').mockResolvedValue({
      data: [crearEmpleado()],
      meta: metaEstandar,
    });

    const { result } = renderHook(() => useEmpleados());

    act(() => {
      result.current.setEstadoOperativoFiltro('licencia');
      result.current.setCargoFiltro('Conductor');
      result.current.setIncluirInactivos(true);
    });

    act(() => {
      result.current.limpiarFiltros();
    });

    expect(result.current.estadoOperativoFiltro).toBe('');
    expect(result.current.cargoFiltro).toBe('');
    expect(result.current.incluirInactivos).toBe(false);
    expect(result.current.paginaActual).toBe(1);
  });

  it('H11: debe sincronizar los filtros con la URL', async () => {
    vi.spyOn(empleadosService, 'getEmpleadosPaginado').mockResolvedValue({
      data: [crearEmpleado()],
      meta: metaEstandar,
    });

    const { result } = renderHook(() => useEmpleados());

    act(() => {
      result.current.setEstadoOperativoFiltro('descanso');
      result.current.setIncluirInactivos(true);
    });

    await waitFor(() => {
      expect(window.location.search).toContain('estadoOperativo=descanso');
    });

    expect(window.location.search).toContain('incluirInactivos=true');
  });

  it('debe actualizar meta cuando cambia la paginación', async () => {
    vi.spyOn(empleadosService, 'getEmpleadosPaginado').mockResolvedValue({
      data: [crearEmpleado()],
      meta: { ...metaEstandar, total: 2, limit: 1, totalPages: 2, hasNext: true },
    });

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
  });
});
