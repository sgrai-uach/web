import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy, obtenerRolDesdeToken, esRolDeTerreno } from '../proxy';
import { AUTH_COOKIE_NAME } from '@/lib/utils/cookieUtils';

function crearJwtMock(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `${header}.${body}.signature`;
}

describe('proxy middleware (sgrai-web)', () => {
  it('debe extraer el rolCodigo desde un token JWT válido', () => {
    const token = crearJwtMock({ sub: 'u-1', rolCodigo: 'PATRULLA_VERIFICADORA' });
    expect(obtenerRolDesdeToken(token)).toBe('PATRULLA_VERIFICADORA');
    expect(esRolDeTerreno(obtenerRolDesdeToken(token))).toBe(true);
  });

  it('debe redirigir a /terreno cuando un usuario con rol PATRULLA_VERIFICADORA accede a /login sin returnUrl', () => {
    const token = crearJwtMock({ sub: 'u-pat', rolCodigo: 'PATRULLA_VERIFICADORA' });
    const req = new NextRequest('http://localhost:3000/login', {
      headers: {
        cookie: `${AUTH_COOKIE_NAME}=${token}`,
      },
    });

    const res = proxy(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/terreno');
  });

  it('debe redirigir a /terreno cuando un usuario con rol DELEGADO_CUADRILLA accede a /gestion', () => {
    const token = crearJwtMock({ sub: 'u-cuad', rolCodigo: 'DELEGADO_CUADRILLA' });
    const req = new NextRequest('http://localhost:3000/gestion', {
      headers: {
        cookie: `${AUTH_COOKIE_NAME}=${token}`,
      },
    });

    const res = proxy(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/terreno');
  });

  it('debe redirigir a /gestion cuando un usuario con rol ADMIN accede a /login sin returnUrl', () => {
    const token = crearJwtMock({ sub: 'u-adm', rolCodigo: 'ADMIN' });
    const req = new NextRequest('http://localhost:3000/login', {
      headers: {
        cookie: `${AUTH_COOKIE_NAME}=${token}`,
      },
    });

    const res = proxy(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/gestion');
  });
});
