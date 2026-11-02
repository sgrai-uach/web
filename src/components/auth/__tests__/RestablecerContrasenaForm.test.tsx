import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RestablecerContrasenaForm from '../RestablecerContrasenaForm';
import * as seguridadService from '@/services/seguridadService';

const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

vi.mock('@/services/seguridadService', () => ({
  restablecerContrasena: vi.fn(),
}));

describe('RestablecerContrasenaForm (HU-65)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  describe('Cuando NO se provee token en la URL', () => {
    it('debe mostrar una advertencia inmediata indicando enlace no válido', () => {
      render(<RestablecerContrasenaForm />);

      expect(
        screen.getByText(/El enlace para restablecer contraseña no contiene un token válido o está incompleto/i)
      ).toBeDefined();
      expect(
        screen.getByRole('link', { name: /Solicitar nuevo enlace/i })
      ).toBeDefined();
      expect(
        screen.getByRole('link', { name: /Volver al Inicio de Sesión/i })
      ).toBeDefined();
      expect(screen.queryByLabelText(/Nueva Contraseña/i)).toBeNull();
    });
  });

  describe('Cuando se provee token en la URL', () => {
    beforeEach(() => {
      mockSearchParams = new URLSearchParams('token=token-cripto-valido');
    });

    it('debe renderizar el formulario con los campos de contraseña', () => {
      render(<RestablecerContrasenaForm />);

      expect(
        screen.getByRole('heading', { name: /Restablecer Contraseña/i })
      ).toBeDefined();
      expect(screen.getByLabelText(/^Nueva Contraseña/i)).toBeDefined();
      expect(screen.getByLabelText(/^Confirmar Nueva Contraseña/i)).toBeDefined();
      expect(
        screen.getByRole('button', { name: /Restablecer Contraseña/i })
      ).toBeDefined();
    });

    it('debe alternar la visibilidad de las contraseñas al hacer clic en los toggles', () => {
      render(<RestablecerContrasenaForm />);

      const nuevaPassInput = screen.getByLabelText(/^Nueva Contraseña/i) as HTMLInputElement;
      const confirmInput = screen.getByLabelText(/^Confirmar Nueva Contraseña/i) as HTMLInputElement;

      expect(nuevaPassInput.type).toBe('password');
      expect(confirmInput.type).toBe('password');

      const toggleButtons = screen.getAllByRole('button', { name: /Ver contraseña/i });
      expect(toggleButtons).toHaveLength(2);

      // Alternar visibilidad de nueva contraseña
      fireEvent.click(toggleButtons[0]);
      expect(nuevaPassInput.type).toBe('text');

      // Alternar visibilidad de confirmación
      fireEvent.click(toggleButtons[1]);
      expect(confirmInput.type).toBe('text');
    });

    it('debe validar que la nueva contraseña sea obligatoria', async () => {
      render(<RestablecerContrasenaForm />);

      const submitBtn = screen.getByRole('button', { name: /Restablecer Contraseña/i });
      fireEvent.click(submitBtn);

      expect(await screen.findByText('Ingrese su nueva contraseña.')).toBeDefined();
      expect(seguridadService.restablecerContrasena).not.toHaveBeenCalled();
    });

    it('debe validar que la contraseña tenga al menos 8 caracteres', async () => {
      render(<RestablecerContrasenaForm />);

      const nuevaPassInput = screen.getByLabelText(/^Nueva Contraseña/i);
      fireEvent.change(nuevaPassInput, { target: { value: 'Ab1!' } });

      const submitBtn = screen.getByRole('button', { name: /Restablecer Contraseña/i });
      fireEvent.click(submitBtn);

      expect(
        await screen.findByText('La contraseña debe tener al menos 8 caracteres.')
      ).toBeDefined();
      expect(seguridadService.restablecerContrasena).not.toHaveBeenCalled();
    });

    it('debe validar que la contraseña contenga al menos una mayúscula', async () => {
      render(<RestablecerContrasenaForm />);

      const nuevaPassInput = screen.getByLabelText(/^Nueva Contraseña/i);
      fireEvent.change(nuevaPassInput, { target: { value: 'password123' } });

      const submitBtn = screen.getByRole('button', { name: /Restablecer Contraseña/i });
      fireEvent.click(submitBtn);

      expect(
        await screen.findByText('La contraseña debe contener al menos una letra mayúscula.')
      ).toBeDefined();
    });

    it('debe validar que la contraseña contenga al menos una minúscula', async () => {
      render(<RestablecerContrasenaForm />);

      const nuevaPassInput = screen.getByLabelText(/^Nueva Contraseña/i);
      fireEvent.change(nuevaPassInput, { target: { value: 'PASSWORD123' } });

      const submitBtn = screen.getByRole('button', { name: /Restablecer Contraseña/i });
      fireEvent.click(submitBtn);

      expect(
        await screen.findByText('La contraseña debe contener al menos una letra minúscula.')
      ).toBeDefined();
    });

    it('debe validar que la contraseña contenga al menos un dígito numérico', async () => {
      render(<RestablecerContrasenaForm />);

      const nuevaPassInput = screen.getByLabelText(/^Nueva Contraseña/i);
      fireEvent.change(nuevaPassInput, { target: { value: 'PasswordSegura' } });

      const submitBtn = screen.getByRole('button', { name: /Restablecer Contraseña/i });
      fireEvent.click(submitBtn);

      expect(
        await screen.findByText('La contraseña debe contener al menos un dígito numérico.')
      ).toBeDefined();
    });

    it('debe validar que la confirmación de contraseña sea obligatoria', async () => {
      render(<RestablecerContrasenaForm />);

      const nuevaPassInput = screen.getByLabelText(/^Nueva Contraseña/i);
      fireEvent.change(nuevaPassInput, { target: { value: 'Valdivia2026!' } });

      const submitBtn = screen.getByRole('button', { name: /Restablecer Contraseña/i });
      fireEvent.click(submitBtn);

      expect(await screen.findByText('Confirme su nueva contraseña.')).toBeDefined();
    });

    it('debe validar que ambas contraseñas coincidan exactamente', async () => {
      render(<RestablecerContrasenaForm />);

      const nuevaPassInput = screen.getByLabelText(/^Nueva Contraseña/i);
      const confirmInput = screen.getByLabelText(/^Confirmar Nueva Contraseña/i);

      fireEvent.change(nuevaPassInput, { target: { value: 'Valdivia2026!' } });
      fireEvent.change(confirmInput, { target: { value: 'Valdivia2026Diferente' } });

      const submitBtn = screen.getByRole('button', { name: /Restablecer Contraseña/i });
      fireEvent.click(submitBtn);

      expect(await screen.findByText('Las contraseñas no coinciden.')).toBeDefined();
      expect(seguridadService.restablecerContrasena).not.toHaveBeenCalled();
    });

    it('debe despachar la petición al servicio y redirigir a /login?motivo=password_restablecida en caso de éxito', async () => {
      vi.mocked(seguridadService.restablecerContrasena).mockResolvedValueOnce({
        message: 'Contraseña restablecida correctamente. Ya puede iniciar sesión.',
      });

      render(<RestablecerContrasenaForm />);

      const nuevaPassInput = screen.getByLabelText(/^Nueva Contraseña/i);
      const confirmInput = screen.getByLabelText(/^Confirmar Nueva Contraseña/i);

      fireEvent.change(nuevaPassInput, { target: { value: 'Valdivia2026!' } });
      fireEvent.change(confirmInput, { target: { value: 'Valdivia2026!' } });

      const submitBtn = screen.getByRole('button', { name: /Restablecer Contraseña/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(seguridadService.restablecerContrasena).toHaveBeenCalledWith({
          token: 'token-cripto-valido',
          nuevaPassword: 'Valdivia2026!',
          confirmacionPassword: 'Valdivia2026!',
        });
      });

      expect(mockPush).toHaveBeenCalledWith('/login?motivo=password_restablecida');
    });

    it('debe mostrar alerta de error si el servidor rechaza el restablecimiento (ej. token expirado o contraseña repetida)', async () => {
      vi.mocked(seguridadService.restablecerContrasena).mockRejectedValueOnce(
        new Error('El enlace de recuperación es inválido o ha expirado.')
      );

      render(<RestablecerContrasenaForm />);

      const nuevaPassInput = screen.getByLabelText(/^Nueva Contraseña/i);
      const confirmInput = screen.getByLabelText(/^Confirmar Nueva Contraseña/i);

      fireEvent.change(nuevaPassInput, { target: { value: 'Valdivia2026!' } });
      fireEvent.change(confirmInput, { target: { value: 'Valdivia2026!' } });

      const submitBtn = screen.getByRole('button', { name: /Restablecer Contraseña/i });
      fireEvent.click(submitBtn);

      expect(
        await screen.findByText('El enlace de recuperación es inválido o ha expirado.')
      ).toBeDefined();
      expect(mockPush).not.toHaveBeenCalled();
    });

    describe('Lista dinámica de requisitos de seguridad en tiempo real', () => {
      it('debe mostrar todos los requisitos como pendientes inicialmente (0 de 4 cumplidos)', () => {
        render(<RestablecerContrasenaForm />);

        const counter = screen.getByTestId('requirements-counter');
        expect(counter.textContent).toBe('0 de 4 cumplidos');

        const reqLongitud = screen.getByTestId('req-longitud');
        const reqMayuscula = screen.getByTestId('req-mayuscula');
        const reqMinuscula = screen.getByTestId('req-minuscula');
        const reqNumero = screen.getByTestId('req-numero');

        expect(reqLongitud.getAttribute('data-cumplido')).toBe('false');
        expect(reqMayuscula.getAttribute('data-cumplido')).toBe('false');
        expect(reqMinuscula.getAttribute('data-cumplido')).toBe('false');
        expect(reqNumero.getAttribute('data-cumplido')).toBe('false');
      });

      it('debe marcar dinámicamente cada requisito conforme el usuario escribe', () => {
        render(<RestablecerContrasenaForm />);

        const nuevaPassInput = screen.getByLabelText(/^Nueva Contraseña/i);
        const counter = screen.getByTestId('requirements-counter');
        const reqLongitud = screen.getByTestId('req-longitud');
        const reqMayuscula = screen.getByTestId('req-mayuscula');
        const reqMinuscula = screen.getByTestId('req-minuscula');
        const reqNumero = screen.getByTestId('req-numero');

        // 1. Escribir sólo minúscula
        fireEvent.change(nuevaPassInput, { target: { value: 'pass' } });
        expect(reqMinuscula.getAttribute('data-cumplido')).toBe('true');
        expect(reqMayuscula.getAttribute('data-cumplido')).toBe('false');
        expect(reqNumero.getAttribute('data-cumplido')).toBe('false');
        expect(reqLongitud.getAttribute('data-cumplido')).toBe('false');
        expect(counter.textContent).toBe('1 de 4 cumplidos');

        // 2. Agregar mayúscula
        fireEvent.change(nuevaPassInput, { target: { value: 'passW' } });
        expect(reqMinuscula.getAttribute('data-cumplido')).toBe('true');
        expect(reqMayuscula.getAttribute('data-cumplido')).toBe('true');
        expect(reqNumero.getAttribute('data-cumplido')).toBe('false');
        expect(reqLongitud.getAttribute('data-cumplido')).toBe('false');
        expect(counter.textContent).toBe('2 de 4 cumplidos');

        // 3. Agregar dígito
        fireEvent.change(nuevaPassInput, { target: { value: 'passW1' } });
        expect(reqNumero.getAttribute('data-cumplido')).toBe('true');
        expect(reqLongitud.getAttribute('data-cumplido')).toBe('false');
        expect(counter.textContent).toBe('3 de 4 cumplidos');

        // 4. Cumplir mínimo 8 caracteres
        fireEvent.change(nuevaPassInput, { target: { value: 'passWord1' } });
        expect(reqLongitud.getAttribute('data-cumplido')).toBe('true');
        expect(reqMayuscula.getAttribute('data-cumplido')).toBe('true');
        expect(reqMinuscula.getAttribute('data-cumplido')).toBe('true');
        expect(reqNumero.getAttribute('data-cumplido')).toBe('true');
        expect(counter.textContent).toBe('4 de 4 cumplidos');

        // 5. Si borra caracteres, vuelve a desmarcarse dinámicamente
        fireEvent.change(nuevaPassInput, { target: { value: '' } });
        expect(reqLongitud.getAttribute('data-cumplido')).toBe('false');
        expect(reqMayuscula.getAttribute('data-cumplido')).toBe('false');
        expect(reqMinuscula.getAttribute('data-cumplido')).toBe('false');
        expect(reqNumero.getAttribute('data-cumplido')).toBe('false');
        expect(counter.textContent).toBe('0 de 4 cumplidos');
      });
    });
  });
});
