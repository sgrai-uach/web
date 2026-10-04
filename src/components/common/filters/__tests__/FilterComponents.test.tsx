import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  FilterBar,
  FilterSearchInput,
  SegmentedButtonGroup,
  FilterSelect,
  ActiveFilterChips,
} from '../index';

describe('Componentes de Filtrado Híbridos Reutilizables', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('FilterSearchInput', () => {
    it('debe aplicar debounce antes de emitir onChange', () => {
      const handleChange = vi.fn();
      render(
        <FilterSearchInput
          label="Buscar por texto"
          value=""
          onChange={handleChange}
          debounceMs={300}
        />
      );

      const input = screen.getByLabelText('Buscar por texto');
      fireEvent.change(input, { target: { value: 'Inundación' } });

      // No se debe llamar inmediatamente
      expect(handleChange).not.toHaveBeenCalled();

      // Avanzar el reloj 290ms (aún no debería llamarse)
      act(() => {
        vi.advanceTimersByTime(290);
      });
      expect(handleChange).not.toHaveBeenCalled();

      // Completar los 300ms
      act(() => {
        vi.advanceTimersByTime(20);
      });
      expect(handleChange).toHaveBeenCalledWith('Inundación');
    });

    it('debe limpiar el texto inmediatamente al presionar el botón X', () => {
      const handleChange = vi.fn();
      render(
        <FilterSearchInput
          label="Buscar aviso"
          value="Picarte"
          onChange={handleChange}
        />
      );

      const clearBtn = screen.getByLabelText('Borrar búsqueda');
      fireEvent.click(clearBtn);

      expect(handleChange).toHaveBeenCalledWith('');
    });
  });

  describe('SegmentedButtonGroup', () => {
    it('debe renderizar las opciones y marcar la activa con aria-pressed=true', () => {
      const handleChange = vi.fn();
      const options = [
        { valor: 'TODOS', etiqueta: 'Todos' },
        { valor: 'DISPONIBLE', etiqueta: 'Disponible' },
        { valor: 'EN_MISION', etiqueta: 'En Misión' },
      ];

      render(
        <SegmentedButtonGroup
          label="Estado Operativo"
          options={options}
          value="DISPONIBLE"
          onChange={handleChange}
        />
      );

      const btnDisponible = screen.getByRole('button', { name: 'Disponible' });
      const btnTodos = screen.getByRole('button', { name: 'Todos' });

      expect(btnDisponible.getAttribute('aria-pressed')).toBe('true');
      expect(btnTodos.getAttribute('aria-pressed')).toBe('false');

      fireEvent.click(btnTodos);
      expect(handleChange).toHaveBeenCalledWith('TODOS');
    });
  });

  describe('FilterSelect', () => {
    it('debe emitir el valor seleccionado y trabajar con nombres legibles', () => {
      const handleChange = vi.fn();
      const options = [
        { valor: 'TODAS', etiqueta: 'Todas las delegaciones' },
        { valor: 'Norte', etiqueta: 'Norte' },
        { valor: 'Sur', etiqueta: 'Sur' },
      ];

      render(
        <FilterSelect
          id="select-delegacion"
          label="Delegación Territorial"
          value="Norte"
          options={options}
          onChange={handleChange}
        />
      );

      const select = screen.getByLabelText('Delegación Territorial');
      expect((select as HTMLSelectElement).value).toBe('Norte');

      fireEvent.change(select, { target: { value: 'Sur' } });
      expect(handleChange).toHaveBeenCalledWith('Sur');
    });
  });

  describe('ActiveFilterChips', () => {
    it('debe mostrar los chips con nombres visibles y permitir removerlos o limpiar todos', () => {
      const handleRemove = vi.fn();
      const handleClearAll = vi.fn();

      const chips = [
        {
          id: 'delegacion',
          etiqueta: 'Delegación',
          valorVisible: 'Norte',
          onRemove: handleRemove,
          esDelegacion: true,
        },
      ];

      render(
        <ActiveFilterChips chips={chips} onClearAll={handleClearAll} />
      );

      expect(screen.getByText(/Norte/)).toBeDefined();

      const removeBtn = screen.getByLabelText(/quitar filtro.*delegación/i);
      fireEvent.click(removeBtn);
      expect(handleRemove).toHaveBeenCalled();

      const clearAllBtn = screen.getByRole('button', { name: /Limpiar todos los filtros/i });
      fireEvent.click(clearAllBtn);
      expect(handleClearAll).toHaveBeenCalled();
    });
  });

  describe('FilterBar', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('debe alternar entre colapsado y expandido al hacer clic en el botón toggle', () => {
      render(
        <FilterBar titulo="Filtros del Sistema" totalFiltrosActivos={2}>
          <div data-testid="contenido-filtros">Contenido de Filtros</div>
        </FilterBar>
      );

      // Inicialmente está expandido
      expect(screen.getByTestId('contenido-filtros')).toBeDefined();
      expect(screen.getByText('Filtros del Sistema')).toBeDefined();
      expect(screen.getByTestId('badge-filtros-activos').textContent).toContain('2 activos');

      const toggleBtn = screen.getByTestId('btn-toggle-filtros');
      expect(toggleBtn.textContent).toContain('Minimizar filtros');

      // Hacer clic para minimizar
      fireEvent.click(toggleBtn);
      expect(screen.queryByTestId('contenido-filtros')).toBeNull();
      expect(toggleBtn.textContent).toContain('Expandir filtros');

      // Hacer clic para expandir nuevamente
      fireEvent.click(toggleBtn);
      expect(screen.getByTestId('contenido-filtros')).toBeDefined();
      expect(toggleBtn.textContent).toContain('Minimizar filtros');
    });

    it('debe persistir el estado de colapsado en localStorage con storageKey', () => {
      const storageKey = 'test:filtros:collapsed';

      // Primera instancia: usuario minimiza
      const { unmount } = render(
        <FilterBar storageKey={storageKey}>
          <div data-testid="contenido-persistente">Contenido</div>
        </FilterBar>
      );

      const toggleBtn = screen.getByTestId('btn-toggle-filtros');
      fireEvent.click(toggleBtn); // Minimizar

      expect(localStorage.getItem(storageKey)).toBe('true');
      expect(screen.queryByTestId('contenido-persistente')).toBeNull();

      unmount();

      // Segunda instancia (simula recarga de página): debe montar minimizado automáticamente
      render(
        <FilterBar storageKey={storageKey}>
          <div data-testid="contenido-persistente-2">Contenido</div>
        </FilterBar>
      );

      expect(screen.queryByTestId('contenido-persistente-2')).toBeNull();
      expect(screen.getByTestId('btn-toggle-filtros').textContent).toContain('Expandir filtros');
    });
  });
});
