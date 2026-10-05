import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import SuccessActions from '../SuccessActions';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('SuccessActions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockPush.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('renderiza el nombre del recurso y el botón con la cuenta regresiva', () => {
    render(
      <SuccessActions
        recursoNombre="Motosierra Stihl MS 250"
        onReset={vi.fn()}
      />
    );

    expect(screen.getByText('Recurso creado exitosamente')).toBeInTheDocument();
    expect(screen.getByText(/Motosierra Stihl MS 250/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Volver al listado/i })).toBeInTheDocument();
  });

  it('cancela la redirección automática al interactuar con el botón (hover)', () => {
    render(
      <SuccessActions
        recursoNombre="Motosierra Stihl MS 250"
        onReset={vi.fn()}
      />
    );

    const button = screen.getByRole('button', { name: /Volver al listado/i });
    fireEvent.mouseEnter(button);

    expect(screen.getByText('Volver al listado')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('llama a onReset cuando se hace clic en Crear otro recurso', () => {
    const handleReset = vi.fn();
    render(
      <SuccessActions
        recursoNombre="Motosierra Stihl MS 250"
        onReset={handleReset}
      />
    );

    const resetButton = screen.getByRole('button', { name: /\+ Crear otro recurso/i });
    fireEvent.click(resetButton);

    expect(handleReset).toHaveBeenCalledTimes(1);
  });

  it('redirige automáticamente al listado configurado cuando el temporizador expira sin intervención', () => {
    render(
      <SuccessActions
        recursoNombre="Camión Tolva 10m3"
        onReset={vi.fn()}
        listPath="/admin/recursos"
      />
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/admin/recursos');
  });
});
