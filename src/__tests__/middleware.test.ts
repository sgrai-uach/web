import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '../middleware';
import { AUTH_COOKIE_NAME } from '@/lib/utils/cookieUtils';

function createMockRequest(url: string, cookies: Record<string, string> = {}): NextRequest {
  const req = new NextRequest(new URL(url, 'http://localhost:3000'));
  for (const [key, value] of Object.entries(cookies)) {
    req.cookies.set(key, value);
  }
  return req;
}

describe('Middleware de Autenticación (Edge Routing Guard)', () => {
  it('debe permitir el acceso libre a rutas públicas sin cookie', () => {
    const req = createMockRequest('http://localhost:3000/');
    const res = middleware(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('debe redirigir a /login con returnUrl cuando se intenta acceder a una ruta protegida sin token', () => {
    const req = createMockRequest('http://localhost:3000/admin/recursos');
    const res = middleware(req);

    expect(res.status).toBe(307); // NextResponse.redirect status
    const location = res.headers.get('location');
    expect(location).toContain('/login?returnUrl=%2Fadmin%2Frecursos');
  });

  it('debe preservar parámetros de query en el returnUrl al redirigir al login', () => {
    const req = createMockRequest('http://localhost:3000/callcenter?estado=pendiente');
    const res = middleware(req);

    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toContain('/login?returnUrl=%2Fcallcenter%3Festado%3Dpendiente');
  });

  it('debe permitir el acceso a rutas protegidas si el usuario posee cookie de sesión válida', () => {
    const req = createMockRequest('http://localhost:3000/centro-incidentes', {
      [AUTH_COOKIE_NAME]: 'fake-jwt-token',
    });
    const res = middleware(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('debe redirigir al panel operativo si un usuario ya autenticado intenta acceder a /login', () => {
    const req = createMockRequest('http://localhost:3000/login', {
      [AUTH_COOKIE_NAME]: 'fake-jwt-token',
    });
    const res = middleware(req);

    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toContain('/admin/recursos');
  });
});
