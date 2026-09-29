import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KanbanFiltros } from '../KanbanFiltros';

describe('KanbanFiltros', () => {
  it('debe renderizar los inputs de búsqueda y selects de prioridad y tipo', () => {
    const onFiltrosChange = vi.fn();
    const onRecargar = vi.fn();

    render(
      <KanbanFiltros
        filtros={{ busqueda: '', prioridad: '', tipoAfectacion: '' }}
        onFiltrosChange={onFiltrosChange}
        onRecargar={onRecargar}
        cargando={false}
      />
    );

    expect(screen.getByPlaceholderText(/Buscar por código/i)).toBeDefined();
    expect(screen.getByRole('combobox', { name: /Filtrar por nivel de prioridad/i })).toBeDefined();
    expect(screen.getByRole('combobox', { name: /Filtrar por tipo de afectación/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Actualizar tablero/i })).toBeDefined();
  });

  it('debe emitir cambios al escribir en el campo de búsqueda', () => {
    const onFiltrosChange = vi.fn();
    const onRecargar = vi.fn();

    render(
      <KanbanFiltros
        filtros={{ busqueda: '', prioridad: '', tipoAfectacion: '' }}
        onFiltrosChange={onFiltrosChange}
        onRecargar={onRecargar}
        cargando={false}
      />
    );

    const input = screen.getByPlaceholderText(/Buscar por código/i);
    fireEvent.change(input, { target: { value: 'Picarte' } });

    expect(onFiltrosChange).toHaveBeenCalledWith({
      busqueda: 'Picarte',
      prioridad: '',
      tipoAfectacion: '',
    });
  });

  it('debe mostrar el botón limpiar y vaciar los filtros al hacer clic', () => {
    const onFiltrosChange = vi.fn();
    const onRecargar = vi.fn();

    render(
      <KanbanFiltros
        filtros={{ busqueda: 'Picarte', prioridad: 'ALTA', tipoAfectacion: 'Inundación' }}
        onFiltrosChange={onFiltrosChange}
        onRecargar={onRecargar}
        cargando={false}
      />
    );

    const btnLimpiar = screen.getByRole('button', { name: /Limpiar filtros/i });
    expect(btnLimpiar).toBeDefined();

    fireEvent.click(btnLimpiar);

    expect(onFiltrosChange).toHaveBeenCalledWith({
      busqueda: '',
      prioridad: '',
      tipoAfectacion: '',
    });
  });
});
