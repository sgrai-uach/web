import { describe, it, expect, beforeEach } from 'vitest';
import {
  AUTH_COOKIE_NAME,
  setAuthCookie,
  getAuthCookie,
  removeAuthCookie,
} from '../cookieUtils';

describe('cookieUtils', () => {
  beforeEach(() => {
    // Limpiar cookies simuladas en jsdom
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0`;
  });

  it('debe retornar null cuando la cookie no existe', () => {
    expect(getAuthCookie()).toBeNull();
  });

  it('debe guardar y recuperar el token JWT en document.cookie', () => {
    const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tokenTest';
    setAuthCookie(fakeToken);

    expect(getAuthCookie()).toBe(fakeToken);
  });

  it('debe soportar fecha de expiracion opcional', () => {
    const fakeToken = 'test-token-with-expiry';
    const futureDate = new Date(Date.now() + 3600 * 1000).toISOString();
    setAuthCookie(fakeToken, futureDate);

    expect(getAuthCookie()).toBe(fakeToken);
  });

  it('debe eliminar la cookie correctamente al llamar a removeAuthCookie', () => {
    setAuthCookie('token-a-eliminar');
    expect(getAuthCookie()).toBe('token-a-eliminar');

    removeAuthCookie();
    expect(getAuthCookie()).toBeNull();
  });
});
