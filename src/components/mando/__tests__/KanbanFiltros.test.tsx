import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { KanbanFiltros } from '../KanbanFiltros';

vi.mock('@/hooks/useCatalogos', () => ({
  useCatalogos: () => ({
    nombresDelegaciones: ['Norte', 'Sur', 'Costa', 'Calle Calle'],
    cargando: false,
  }),
}));

describe('KanbanFiltros', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe renderizar búsqueda, delegación territorial por nombre, prioridad, tipo y botonera de estados', () => {
    const onFiltrosChange = vi.fn();
    const onRecargar = vi.fn();

    render(
      <KanbanFiltros
        filtros={{
          busqueda: '',
          delegacion: 'TODAS',
          estado: 'TODOS',
          prioridad: '',
          tipoAfectacion: '',
          fuenteOrigen: '',
        }}
        onFiltrosChange={onFiltrosChange}
        onRecargar={onRecargar}
        cargando={false}
      />
    );

    expect(screen.getByLabelText(/Buscar por código, calle o descripción/i)).toBeDefined();
    expect(screen.getByLabelText(/Delegación Territorial/i)).toBeDefined();
    expect(screen.getByLabelText(/Nivel de Prioridad/i)).toBeDefined();
    expect(screen.getByLabelText(/Tipo de Afectación/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Actualizar tablero/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /En Atención/i })).toBeDefined();
  });

  it('debe emitir cambios de búsqueda con debounce de 300ms', () => {
    const onFiltrosChange = vi.fn();
    const onRecargar = vi.fn();

    render(
      <KanbanFiltros
        filtros={{
          busqueda: '',
          delegacion: 'TODAS',
          estado: 'TODOS',
          prioridad: '',
          tipoAfectacion: '',
          fuenteOrigen: '',
        }}
        onFiltrosChange={onFiltrosChange}
        onRecargar={onRecargar}
        cargando={false}
      />
    );

    const input = screen.getByLabelText(/Buscar por código, calle o descripción/i);
    fireEvent.change(input, { target: { value: 'Picarte' } });

    expect(onFiltrosChange).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onFiltrosChange).toHaveBeenCalledWith(
      expect.objectContaining({
        busqueda: 'Picarte',
      })
    );
  });

  it('debe emitir delegación por nombre humano al seleccionar una opción', () => {
    const onFiltrosChange = vi.fn();

    render(
      <KanbanFiltros
        filtros={{
          busqueda: '',
          delegacion: 'TODAS',
          estado: 'TODOS',
          prioridad: '',
          tipoAfectacion: '',
          fuenteOrigen: '',
        }}
        onFiltrosChange={onFiltrosChange}
        onRecargar={vi.fn()}
        cargando={false}
      />
    );

    const selectDelegacion = screen.getByLabelText(/Delegación Territorial/i);
    fireEvent.change(selectDelegacion, { target: { value: 'Norte' } });

    expect(onFiltrosChange).toHaveBeenCalledWith(
      expect.objectContaining({
        delegacion: 'Norte',
      })
    );
  });

  it('debe emitir estado al presionar un botón segmentado para aislar u ocultar columnas', () => {
    const onFiltrosChange = vi.fn();

    render(
      <KanbanFiltros
        filtros={{
          busqueda: '',
          delegacion: 'TODAS',
          estado: 'TODOS',
          prioridad: '',
          tipoAfectacion: '',
          fuenteOrigen: '',
        }}
        onFiltrosChange={onFiltrosChange}
        onRecargar={vi.fn()}
        cargando={false}
      />
    );

    const btnEnAtencion = screen.getByRole('button', { name: 'En Atención' });
    fireEvent.click(btnEnAtencion);

    expect(onFiltrosChange).toHaveBeenCalledWith(
      expect.objectContaining({
        estado: 'EN_ATENCION',
      })
    );
  });

  it('debe mostrar chips de filtros activos con nombres y permitir restablecer todos los filtros', () => {
    const onFiltrosChange = vi.fn();
    const onLimpiarFiltros = vi.fn();

    render(
      <KanbanFiltros
        filtros={{
          busqueda: 'Picarte',
          delegacion: 'Costa',
          estado: 'EN_ATENCION',
          prioridad: 'ALTA',
          tipoAfectacion: 'Inundación',
          fuenteOrigen: 'WEB',
        }}
        onFiltrosChange={onFiltrosChange}
        onLimpiarFiltros={onLimpiarFiltros}
        onRecargar={vi.fn()}
        cargando={false}
      />
    );

    // Debe mostrar chips con nombres
    expect(screen.getAllByText('Costa').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('En Atención').length).toBeGreaterThanOrEqual(1);

    const btnLimpiar = screen.getByRole('button', { name: /Limpiar todos los filtros/i });
    fireEvent.click(btnLimpiar);

    expect(onLimpiarFiltros).toHaveBeenCalled();
  });
});
