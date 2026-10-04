import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SeguimientoBuscador } from '../SeguimientoBuscador';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('SeguimientoBuscador', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe filtrar caracteres no numéricos y limitar a 8 caracteres', () => {
    render(<SeguimientoBuscador />);

    const input = screen.getByRole('textbox') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'abc58291045extra' } });

    expect(input.value).toBe('58291045');
  });

  it('debe mantener deshabilitado el botón hasta ingresar exactamente 8 dígitos', () => {
    render(<SeguimientoBuscador />);

    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button', { name: /consultar estado/i }) as HTMLButtonElement;

    expect(button.disabled).toBe(true);

    fireEvent.change(input, { target: { value: '1234' } });
    expect(button.disabled).toBe(true);

    fireEvent.change(input, { target: { value: '12345678' } });
    expect(button.disabled).toBe(false);
  });

  it('debe invocar la función onBuscar con el código limpio al enviar el formulario', () => {
    const onBuscarMock = vi.fn();
    render(<SeguimientoBuscador onBuscar={onBuscarMock} />);

    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button', { name: /consultar estado/i });

    fireEvent.change(input, { target: { value: '58291045' } });
    fireEvent.click(button);

    expect(onBuscarMock).toHaveBeenCalledWith('58291045');
  });

  it('debe redirigir con router.push cuando no se pasa la función onBuscar', () => {
    render(<SeguimientoBuscador />);

    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button', { name: /consultar estado/i });

    fireEvent.change(input, { target: { value: '58291045' } });
    fireEvent.click(button);

    expect(mockPush).toHaveBeenCalledWith('/ciudadania/seguimiento/58291045');
  });
});
