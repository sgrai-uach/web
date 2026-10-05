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

    expect(screen.getByLabelText(/Buscar incidente/i)).toBeDefined();
    expect(screen.getByLabelText(/Delegación Territorial/i)).toBeDefined();
    expect(screen.getByLabelText(/Nivel de Prioridad/i)).toBeDefined();
    expect(screen.getByLabelText(/Tipo de Afectación/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /En Atención/i })).toBeDefined();
    expect(screen.getByLabelText(/Filtrar incidentes solo de hoy/i)).toBeDefined();
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

    const input = screen.getByLabelText(/Buscar incidente/i);
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

  it('debe emitir soloHoy al alternar el checkbox de jornada de hoy', () => {
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
          soloHoy: false,
        }}
        onFiltrosChange={onFiltrosChange}
        onRecargar={vi.fn()}
        cargando={false}
      />
    );

    const checkbox = screen.getByLabelText(/Filtrar incidentes solo de hoy/i);
    fireEvent.click(checkbox);

    expect(onFiltrosChange).toHaveBeenCalledWith(
      expect.objectContaining({
        soloHoy: true,
      })
    );
  });

  it('debe mostrar chips de filtros activos con nombres y permitir restablecer todos los filtros con onLimpiarFiltros', () => {
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
          soloHoy: true,
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
    expect(screen.getAllByText('Solo hoy').length).toBeGreaterThanOrEqual(1);

    const btnLimpiar = screen.getByRole('button', { name: /Limpiar todos los filtros/i });
    fireEvent.click(btnLimpiar);

    expect(onLimpiarFiltros).toHaveBeenCalled();
  });

  it('debe restablecer filtros a los valores por defecto cuando no se provee onLimpiarFiltros', () => {
    const onFiltrosChange = vi.fn();

    render(
      <KanbanFiltros
        filtros={{
          busqueda: 'Picarte',
          delegacion: 'Costa',
          estado: 'EN_ATENCION',
          prioridad: 'ALTA',
          tipoAfectacion: 'Inundación',
          fuenteOrigen: 'WEB',
          soloHoy: true,
        }}
        onFiltrosChange={onFiltrosChange}
        onRecargar={vi.fn()}
        cargando={false}
      />
    );

    const btnLimpiar = screen.getByRole('button', { name: /Limpiar todos los filtros/i });
    fireEvent.click(btnLimpiar);

    expect(onFiltrosChange).toHaveBeenCalledWith({
      busqueda: '',
      delegacion: 'TODAS',
      estado: 'TODOS',
      prioridad: '',
      tipoAfectacion: '',
      fuenteOrigen: '',
      delegacionId: undefined,
      soloHoy: false,
    });
  });

  it('debe mostrar los números de elementos en las opciones segmentadas cuando se provee contadoresPorEstado (F-06)', () => {
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
        onFiltrosChange={vi.fn()}
        contadoresPorEstado={{
          TODOS: 15,
          REPORTADO: 4,
          VERIFICANDO: 3,
          EN_ATENCION: 5,
          RESUELTO: 2,
          NO_ABORDABLE: 1,
        }}
      />
    );

    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('debe mostrar chip de "Solo hoy" y permitir desmarcarlo desde el chip (F-04)', () => {
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
          soloHoy: true,
        }}
        onFiltrosChange={onFiltrosChange}
      />
    );

    expect(screen.getByText(/Jornada: Solo hoy/i)).toBeInTheDocument();
    const btnQuitar = screen.getByTitle(/Quitar filtro de jornada/i);
    fireEvent.click(btnQuitar);

    expect(onFiltrosChange).toHaveBeenCalledWith(
      expect.objectContaining({ soloHoy: false })
    );
  });
});
