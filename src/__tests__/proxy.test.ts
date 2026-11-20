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

  it('debe permitir acceso público sin sesión a las rutas de infraestructura PWA (/terreno/manifest.webmanifest, /terreno/sw.js)', () => {
    const reqManifest = new NextRequest('http://localhost:3000/terreno/manifest.webmanifest');
    const resManifest = proxy(reqManifest);
    expect(resManifest.status).toBe(200);

    const reqSw = new NextRequest('http://localhost:3000/terreno/sw.js');
    const resSw = proxy(reqSw);
    expect(resSw.status).toBe(200);
  });

  it('debe redirigir a /terreno cuando un rol exclusivo de terreno intenta ingresar a /eventos-atp/prevencion/[id]', () => {
    const tokenPatrulla = crearJwtMock({ sub: 'u-pat', rolCodigo: 'PATRULLA_VERIFICADORA' });
    const reqPat = new NextRequest(
      'http://localhost:3000/eventos-atp/prevencion/80000000-0000-4000-8000-000000000001',
      { headers: { cookie: `${AUTH_COOKIE_NAME}=${tokenPatrulla}` } }
    );
    const resPat = proxy(reqPat);
    expect(resPat.status).toBe(307);
    expect(resPat.headers.get('location')).toBe('http://localhost:3000/terreno');

    const tokenCuadrilla = crearJwtMock({ sub: 'u-cuad', rolCodigo: 'DELEGADO_CUADRILLA' });
    const reqCuad = new NextRequest(
      'http://localhost:3000/eventos-atp/prevencion/80000000-0000-4000-8000-000000000001',
      { headers: { cookie: `${AUTH_COOKIE_NAME}=${tokenCuadrilla}` } }
    );
    const resCuad = proxy(reqCuad);
    expect(resCuad.status).toBe(307);
    expect(resCuad.headers.get('location')).toBe('http://localhost:3000/terreno');
  });
});
