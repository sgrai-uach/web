import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm, { obtenerRutaPorRol } from '../LoginForm';
import { AuthContext, type AuthContextValue } from '@/context/AuthContext';

const mockPush = vi.fn();
const mockRefresh = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
  useSearchParams: () => mockSearchParams,
}));

function renderLoginForm(authOverrides?: Partial<AuthContextValue>) {
  const defaultAuth: AuthContextValue = {
    usuario: null,
    token: null,
    estaAutenticado: false,
    cargando: false,
    login: vi.fn(),
    logout: vi.fn(),
    tienePermiso: vi.fn(),
    tieneAlgunPermiso: vi.fn(),
    refrescarPerfil: vi.fn(),
    ...authOverrides,
  };

  return render(
    <AuthContext.Provider value={defaultAuth}>
      <LoginForm />
    </AuthContext.Provider>
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  describe('obtenerRutaPorRol', () => {
    it('debe mapear cualquier rol de oficina a la pantalla de Inicio de Gestión (/gestion)', () => {
      expect(obtenerRutaPorRol('ADMIN')).toBe('/gestion');
      expect(obtenerRutaPorRol('admin')).toBe('/gestion');
      expect(obtenerRutaPorRol('ENCARGADO')).toBe('/gestion');
      expect(obtenerRutaPorRol('OPERACIONES')).toBe('/gestion');
      expect(obtenerRutaPorRol('CALL_CENTER')).toBe('/gestion');
      expect(obtenerRutaPorRol('ASISTENTE_SOCIAL')).toBe('/gestion');
      expect(obtenerRutaPorRol('SUPERVISOR')).toBe('/gestion');
      expect(obtenerRutaPorRol('OTRO')).toBe('/gestion');
    });

    it('debe mapear los roles de terreno hacia sus módulos correspondientes en /terreno (PWA)', () => {
      expect(obtenerRutaPorRol('PATRULLA_VERIFICADORA')).toBe('/terreno/patrulla/misiones');
      expect(obtenerRutaPorRol('patrulla_verificadora')).toBe('/terreno/patrulla/misiones');
      expect(obtenerRutaPorRol('DELEGADO_CUADRILLA')).toBe('/terreno/cuadrilla/misiones');
      expect(obtenerRutaPorRol('delegado_cuadrilla')).toBe('/terreno/cuadrilla/misiones');
    });

    it('debe respetar returnUrl cuando pertenece a /terreno para roles de terreno', () => {
      expect(obtenerRutaPorRol('PATRULLA_VERIFICADORA', '/terreno/patrulla/misiones/m-1')).toBe(
        '/terreno/patrulla/misiones/m-1'
      );
      expect(obtenerRutaPorRol('DELEGADO_CUADRILLA', '/terreno/cuadrilla/misiones/m-2')).toBe(
        '/terreno/cuadrilla/misiones/m-2'
      );
    });
  });

  it('debe renderizar los campos de identificador, contraseña y botón de ingreso', () => {
    renderLoginForm();

    expect(screen.getByLabelText(/Identificador/i)).toBeDefined();
    expect(screen.getByLabelText(/^Contraseña/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Ingresar al Sistema/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /Volver al Inicio de SGRAI/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /Volver al Inicio de SGRAI/i }).getAttribute('href')).toBe('/');
  });

  it('debe mostrar errores de validación si se envía el formulario vacío', async () => {
    renderLoginForm();

    fireEvent.click(screen.getByRole('button', { name: /Ingresar al Sistema/i }));

    expect(await screen.findByText('Ingrese su RUT o correo.')).toBeDefined();
    expect(await screen.findByText('Ingrese su contraseña.')).toBeDefined();
  });

  it('debe validar algoritmo de RUT chileno (Módulo 11) si no contiene arroba', async () => {
    renderLoginForm();

    const idInput = screen.getByLabelText(/Identificador/i);
    const passInput = screen.getByLabelText(/^Contraseña/i);

    // RUT con DV inválido: 11.111.111-9 (el correcto es 11.111.111-1)
    fireEvent.change(idInput, { target: { value: '11111111-9' } });
    fireEvent.change(passInput, { target: { value: 'Valdivia2026!' } });

    fireEvent.click(screen.getByRole('button', { name: /Ingresar al Sistema/i }));

    expect(
      await screen.findByText(/RUT inválido\. Ingrese un RUT chileno con dígito verificador/i)
    ).toBeDefined();
  });

  it('debe validar formato de correo electrónico si contiene arroba', async () => {
    renderLoginForm();

    const idInput = screen.getByLabelText(/Identificador/i);
    const passInput = screen.getByLabelText(/^Contraseña/i);

    fireEvent.change(idInput, { target: { value: 'correo-sin-dominio@' } });
    fireEvent.change(passInput, { target: { value: 'Valdivia2026!' } });

    fireEvent.click(screen.getByRole('button', { name: /Ingresar al Sistema/i }));

    expect(
      await screen.findByText('Formato de correo electrónico inválido.')
    ).toBeDefined();
  });

  it('debe alternar la visibilidad de la contraseña con el botón de ojo', () => {
    renderLoginForm();

    const passInput = screen.getByLabelText(/^Contraseña/i) as HTMLInputElement;
    const toggleBtn = screen.getByLabelText('Ver contraseña');

    expect(passInput.type).toBe('password');

    fireEvent.click(toggleBtn);
    expect(passInput.type).toBe('text');

    fireEvent.click(toggleBtn);
    expect(passInput.type).toBe('password');
  });

  it('debe llamar a login con credenciales válidas y redirigir a /gestion para cualquier rol', async () => {
    const mockLogin = vi.fn().mockResolvedValue({
      id: 'usr-1',
      rolCodigo: 'ADMIN',
      nombre: 'Administrador',
    });

    renderLoginForm({ login: mockLogin });

    const idInput = screen.getByLabelText(/Identificador/i);
    const passInput = screen.getByLabelText(/^Contraseña/i);

    fireEvent.change(idInput, { target: { value: 'admin@valdivia.cl' } });
    fireEvent.change(passInput, { target: { value: 'Valdivia2026!' } });

    fireEvent.click(screen.getByRole('button', { name: /Ingresar al Sistema/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        identificador: 'admin@valdivia.cl',
        password: 'Valdivia2026!',
      });
      expect(mockPush).toHaveBeenCalledWith('/gestion');
    });
  });

  it('debe redirigir siempre a la pantalla de Inicio de Gestión (/gestion) post-login', async () => {
    mockSearchParams = new URLSearchParams('returnUrl=/callcenter/manual');

    const mockLogin = vi.fn().mockResolvedValue({
      id: 'usr-2',
      rolCodigo: 'CALL_CENTER',
      nombre: 'Operador',
    });

    renderLoginForm({ login: mockLogin });

    const idInput = screen.getByLabelText(/Identificador/i);
    const passInput = screen.getByLabelText(/^Contraseña/i);

    fireEvent.change(idInput, { target: { value: 'callcenter@valdivia.cl' } });
    fireEvent.change(passInput, { target: { value: 'Valdivia2026!' } });

    fireEvent.click(screen.getByRole('button', { name: /Ingresar al Sistema/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/gestion');
    });
  });

  it('debe desplegar mensaje de error ante fallo de autenticación', async () => {
    const mockLogin = vi
      .fn()
      .mockRejectedValue(new Error('Credenciales inválidas. Verifique su identificador o contraseña.'));

    renderLoginForm({ login: mockLogin });

    const idInput = screen.getByLabelText(/Identificador/i);
    const passInput = screen.getByLabelText(/^Contraseña/i);

    fireEvent.change(idInput, { target: { value: 'admin@valdivia.cl' } });
    fireEvent.change(passInput, { target: { value: 'err' } });

    fireEvent.click(screen.getByRole('button', { name: /Ingresar al Sistema/i }));

    const errorBox = await screen.findByTestId('error-servidor');
    expect(errorBox.textContent).toContain('Credenciales inválidas');
  });

  it('debe mostrar mensaje informativo si el motivo es sesion_expirada', () => {
    mockSearchParams = new URLSearchParams('motivo=sesion_expirada');

    renderLoginForm();

    expect(
      screen.getByText(/Su sesión ha expirado o no es válida\. Por favor, ingrese sus credenciales nuevamente\./i)
    ).toBeDefined();
  });

  it('debe redirigir automáticamente a /gestion si el usuario ya está autenticado al montar el componente', async () => {
    renderLoginForm({
      estaAutenticado: true,
      usuario: {
        id: 'usr-admin',
        rolCodigo: 'ADMIN',
        nombre: 'Administrador',
      },
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/gestion');
    });
  });

  it('debe redirigir siempre a /gestion aun cuando existan parámetros al estar ya autenticado', async () => {
    mockSearchParams = new URLSearchParams('returnUrl=/gestion/callcenter');

    renderLoginForm({
      estaAutenticado: true,
      usuario: {
        id: 'usr-operador',
        rolCodigo: 'CALL_CENTER',
        nombre: 'Operador',
      },
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/gestion');
    });
  });

  describe('Recuperación de contraseña (HU-65)', () => {
    it('debe renderizar el enlace "¿Olvidaste tu contraseña?" apuntando a /recuperar-contrasena', () => {
      renderLoginForm();

      const recoveryLink = screen.getByRole('link', { name: /¿Olvidaste tu contraseña\?/i });
      expect(recoveryLink).toBeDefined();
      expect(recoveryLink.getAttribute('href')).toBe('/recuperar-contrasena');
    });

    it('debe mostrar el banner de éxito cuando el query param es motivo=password_restablecida', () => {
      mockSearchParams = new URLSearchParams('motivo=password_restablecida');

      renderLoginForm();

      expect(
        screen.getByText(/Su contraseña ha sido restablecida exitosamente\. Inicie sesión con su nueva credencial\./i)
      ).toBeDefined();
    });
  });

  describe('Enrutamiento unificado para roles de terreno (PWA /terreno)', () => {
    it('debe redirigir a /terreno/patrulla/misiones al iniciar sesión con rol PATRULLA_VERIFICADORA', async () => {
      const mockLogin = vi.fn().mockResolvedValue({
        id: 'usr-pat-1',
        rolCodigo: 'PATRULLA_VERIFICADORA',
        nombre: 'Patrulla Norte',
      });

      renderLoginForm({ login: mockLogin });

      fireEvent.change(screen.getByLabelText(/Identificador/i), {
        target: { value: 'patrulla@valdivia.cl' },
      });
      fireEvent.change(screen.getByLabelText(/^Contraseña/i), {
        target: { value: 'Valdivia2026!' },
      });

      fireEvent.click(screen.getByRole('button', { name: /Ingresar al Sistema/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/terreno/patrulla/misiones');
      });
    });

    it('debe redirigir a /terreno/cuadrilla/misiones al iniciar sesión con rol DELEGADO_CUADRILLA', async () => {
      const mockLogin = vi.fn().mockResolvedValue({
        id: 'usr-cuad-1',
        rolCodigo: 'DELEGADO_CUADRILLA',
        nombre: 'Delegado Cuadrilla 1',
      });

      renderLoginForm({ login: mockLogin });

      fireEvent.change(screen.getByLabelText(/Identificador/i), {
        target: { value: 'cuadrilla@valdivia.cl' },
      });
      fireEvent.change(screen.getByLabelText(/^Contraseña/i), {
        target: { value: 'Valdivia2026!' },
      });

      fireEvent.click(screen.getByRole('button', { name: /Ingresar al Sistema/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/terreno/cuadrilla/misiones');
      });
    });
  });
});
