import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/utils/cookieUtils';

/**
 * Rutas operativas que requieren autenticación formal.
 * 
 * Nota: Las rutas públicas de atención ciudadana (/reportar, /seguimiento, /)
 * no requieren sesión ni permisos y son accesibles por cualquier usuario anónimo.
 */
const RUTAS_PROTEGIDAS = [
  '/admin',
  '/centro-incidentes',
  '/callcenter',
  '/asistente-social',
  '/dashboard',
];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  const esRutaProtegida = RUTAS_PROTEGIDAS.some(
    (ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`)
  );

  // 1. Si es ruta protegida y no tiene token de sesión: redirigir al login
  if (esRutaProtegida && !token) {
    const returnUrl = encodeURIComponent(pathname + search);
    const loginUrl = new URL(`/login?returnUrl=${returnUrl}`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Si ya está autenticado e intenta ingresar a /login: redirigir al panel operativo
  if (pathname === '/login' && token) {
    const defaultUrl = new URL('/admin/recursos', request.url);
    return NextResponse.redirect(defaultUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/centro-incidentes/:path*',
    '/callcenter/:path*',
    '/asistente-social/:path*',
    '/dashboard/:path*',
    '/login',
  ],
};
