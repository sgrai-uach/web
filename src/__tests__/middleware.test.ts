import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy as middleware } from '../proxy';
import { AUTH_COOKIE_NAME } from '@/lib/utils/cookieUtils';

function createMockRequest(url: string, cookies: Record<string, string> = {}): NextRequest {
  const req = new NextRequest(new URL(url, 'http://localhost:3000'));
  for (const [key, value] of Object.entries(cookies)) {
    req.cookies.set(key, value);
  }
  return req;
}

describe('Middleware de Autenticación y Perímetro de Portales', () => {
  it('debe permitir acceso libre a la página principal (/) sin cookie de sesión', () => {
    const req = createMockRequest('http://localhost:3000/');
    const res = middleware(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('debe permitir acceso libre al Portal de Atención Ciudadana (/ciudadania/*) sin cookie de sesión', () => {
    const reqHub = createMockRequest('http://localhost:3000/ciudadania');
    expect(middleware(reqHub).status).toBe(200);

    const reqReportar = createMockRequest('http://localhost:3000/ciudadania/reportar');
    expect(middleware(reqReportar).status).toBe(200);

    const reqSeguimiento = createMockRequest('http://localhost:3000/ciudadania/seguimiento/58291045');
    expect(middleware(reqSeguimiento).status).toBe(200);
  });

  it('debe permitir acceso libre a rutas públicas de recuperación de contrasena sin cookie de sesión', () => {
    const reqRecuperar = createMockRequest('http://localhost:3000/recuperar-contrasena');
    expect(middleware(reqRecuperar).status).toBe(200);

    const reqRestablecer = createMockRequest('http://localhost:3000/restablecer-contrasena?token=test123');
    expect(middleware(reqRestablecer).status).toBe(200);
  });

  it('debe redirigir al portal ciudadano ante solicitudes a rutas informantes heredadas', () => {
    const reqReportar = createMockRequest('http://localhost:3000/reportar');
    const resReportar = middleware(reqReportar);
    expect(resReportar.status).toBe(307);
    expect(resReportar.headers.get('location')).toContain('/ciudadania/reportar');

    const reqSeg = createMockRequest('http://localhost:3000/seguimiento/58291045');
    const resSeg = middleware(reqSeg);
    expect(resSeg.status).toBe(307);
    expect(resSeg.headers.get('location')).toContain('/ciudadania/seguimiento/58291045');
  });

  it('debe redirigir a /login cuando se intenta acceder al Portal de Gestión (/gestion/*) sin sesión', () => {
    const req = createMockRequest('http://localhost:3000/gestion');
    const res = middleware(req);

    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toContain('/login?returnUrl=%2Fgestion');
  });

  it('debe redirigir a /login cuando se intenta acceder a un submódulo de gestión sin sesión', () => {
    const req = createMockRequest('http://localhost:3000/gestion/callcenter?filtro=urgente');
    const res = middleware(req);

    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toContain('/login?returnUrl=%2Fgestion%2Fcallcenter%3Ffiltro%3Durgente');
  });

  it('debe permitir acceso a rutas del portal de gestión si el usuario posee cookie de sesión válida', () => {
    const req = createMockRequest('http://localhost:3000/gestion/centro-incidentes', {
      [AUTH_COOKIE_NAME]: 'fake-jwt-token',
    });
    const res = middleware(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('debe redirigir a /gestion si un usuario ya autenticado intenta acceder a /login', () => {
    const req = createMockRequest('http://localhost:3000/login', {
      [AUTH_COOKIE_NAME]: 'fake-jwt-token',
    });
    const res = middleware(req);

    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toContain('/gestion');
  });

  it('debe redirigir siempre a /gestion aun cuando se acceda a /login con parámetros si ya está autenticado', () => {
    const req = createMockRequest('http://localhost:3000/login?returnUrl=%2Fgestion%2Fcallcenter', {
      [AUTH_COOKIE_NAME]: 'fake-jwt-token',
    });
    const res = middleware(req);

    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toBe('http://localhost:3000/gestion');
  });

  it('debe redirigir rutas operativas heredadas hacia su versión canónica con prefijo /gestion/ si hay sesión', () => {
    const req = createMockRequest('http://localhost:3000/admin/recursos', {
      [AUTH_COOKIE_NAME]: 'fake-jwt-token',
    });
    const res = middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/gestion/admin/recursos');
  });
});
