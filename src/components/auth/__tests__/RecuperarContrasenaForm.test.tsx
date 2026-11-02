import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RecuperarContrasenaForm from '../RecuperarContrasenaForm';
import * as seguridadService from '@/services/seguridadService';

vi.mock('@/services/seguridadService', () => ({
  solicitarRecuperacionContrasena: vi.fn(),
}));

describe('RecuperarContrasenaForm (HU-65)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar los elementos básicos del formulario', () => {
    render(<RecuperarContrasenaForm />);

    expect(
      screen.getByRole('heading', { name: /Recuperación de Contraseña/i })
    ).toBeDefined();
    expect(screen.getByLabelText(/Identificador|Correo institucional o RUT/i)).toBeDefined();
    expect(
      screen.getByRole('button', { name: /Enviar Enlace de Recuperación/i })
    ).toBeDefined();
    expect(
      screen.getByRole('link', { name: /Volver al Inicio de Sesión/i })
    ).toBeDefined();
  });

  it('debe validar que el identificador sea obligatorio', async () => {
    render(<RecuperarContrasenaForm />);

    const submitBtn = screen.getByRole('button', {
      name: /Enviar Enlace de Recuperación/i,
    });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText('Ingrese su correo institucional o RUT.')
    ).toBeDefined();
    expect(seguridadService.solicitarRecuperacionContrasena).not.toHaveBeenCalled();
  });

  it('debe rechazar correos no institucionales (no @valdivia.cl)', async () => {
    render(<RecuperarContrasenaForm />);

    const input = screen.getByLabelText(/Identificador/i);
    fireEvent.change(input, { target: { value: 'usuario@gmail.com' } });

    const submitBtn = screen.getByRole('button', {
      name: /Enviar Enlace de Recuperación/i,
    });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText('Debe ingresar un correo institucional (@valdivia.cl).')
    ).toBeDefined();
    expect(seguridadService.solicitarRecuperacionContrasena).not.toHaveBeenCalled();
  });

  it('debe rechazar formatos inválidos de correo', async () => {
    render(<RecuperarContrasenaForm />);

    const input = screen.getByLabelText(/Identificador/i);
    fireEvent.change(input, { target: { value: 'correo-invalido@' } });

    const submitBtn = screen.getByRole('button', {
      name: /Enviar Enlace de Recuperación/i,
    });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText('Formato de correo electrónico inválido.')
    ).toBeDefined();
    expect(seguridadService.solicitarRecuperacionContrasena).not.toHaveBeenCalled();
  });

  it('debe rechazar RUT chileno con dígito verificador inválido', async () => {
    render(<RecuperarContrasenaForm />);

    const input = screen.getByLabelText(/Identificador/i);
    fireEvent.change(input, { target: { value: '11111111-9' } });

    const submitBtn = screen.getByRole('button', {
      name: /Enviar Enlace de Recuperación/i,
    });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText(/RUT inválido\. Ingrese un RUT chileno con dígito verificador/i)
    ).toBeDefined();
    expect(seguridadService.solicitarRecuperacionContrasena).not.toHaveBeenCalled();
  });

  it('debe enviar solicitud exitosamente con correo @valdivia.cl y mostrar mensaje anti-enumeración', async () => {
    vi.mocked(seguridadService.solicitarRecuperacionContrasena).mockResolvedValueOnce({
      message: 'Si el identificador corresponde a una cuenta registrada, se enviará un enlace de recuperación.',
    });

    render(<RecuperarContrasenaForm />);

    const input = screen.getByLabelText(/Identificador/i);
    fireEvent.change(input, { target: { value: 'carlos.miranda@valdivia.cl' } });

    const submitBtn = screen.getByRole('button', {
      name: /Enviar Enlace de Recuperación/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(seguridadService.solicitarRecuperacionContrasena).toHaveBeenCalledWith(
        'carlos.miranda@valdivia.cl'
      );
    });

    expect(
      await screen.findByText(/Si los datos ingresados corresponden a un funcionario registrado/i)
    ).toBeDefined();
    expect(
      screen.getByRole('link', { name: /Volver al Inicio de Sesión/i })
    ).toBeDefined();
  });

  it('debe enviar solicitud exitosamente con RUT chileno válido', async () => {
    vi.mocked(seguridadService.solicitarRecuperacionContrasena).mockResolvedValueOnce({
      message: 'Si el identificador corresponde a una cuenta registrada, se enviará un enlace de recuperación.',
    });

    render(<RecuperarContrasenaForm />);

    const input = screen.getByLabelText(/Identificador/i);
    fireEvent.change(input, { target: { value: '11111111-1' } });

    const submitBtn = screen.getByRole('button', {
      name: /Enviar Enlace de Recuperación/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(seguridadService.solicitarRecuperacionContrasena).toHaveBeenCalledWith(
        '11111111-1'
      );
    });

    expect(
      await screen.findByText(/Si los datos ingresados corresponden a un funcionario registrado/i)
    ).toBeDefined();
  });

  it('debe mostrar error de servidor si el servicio falla', async () => {
    vi.mocked(seguridadService.solicitarRecuperacionContrasena).mockRejectedValueOnce(
      new Error('Error de conexión con el servidor')
    );

    render(<RecuperarContrasenaForm />);

    const input = screen.getByLabelText(/Identificador/i);
    fireEvent.change(input, { target: { value: 'carlos.miranda@valdivia.cl' } });

    const submitBtn = screen.getByRole('button', {
      name: /Enviar Enlace de Recuperación/i,
    });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText('Error de conexión con el servidor')
    ).toBeDefined();
  });
});
