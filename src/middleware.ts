import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/utils/cookieUtils';

/**
 * Rutas públicas del sistema.
 * 
 * Regla Perimetral Estricta:
 * Ni la página principal de acceso (/) ni el portal de atención ciudadana (/ciudadania/*)
 * ni el formulario de autenticación (/login) requieren inicio de sesión bajo ninguna circunstancia.
 * 
 * Todo el resto del sistema (/gestion/* y herramientas operativas) requiere sesión obligatoria.
 */
function esRutaPublica(pathname: string): boolean {
  if (pathname === '/' || pathname === '/login' || pathname === '/ciudadania') {
    return true;
  }
  if (pathname.startsWith('/ciudadania/')) {
    return true;
  }
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // 1. Redirecciones de compatibilidad para rutas heredadas del informante hacia el portal ciudadano
  if (pathname === '/reportar') {
    return NextResponse.redirect(new URL('/ciudadania/reportar', request.url));
  }
  if (pathname === '/seguimiento') {
    return NextResponse.redirect(new URL('/ciudadania', request.url));
  }
  if (pathname.startsWith('/seguimiento/')) {
    const codigo = pathname.replace('/seguimiento/', '');
    return NextResponse.redirect(new URL(`/ciudadania/seguimiento/${codigo}${search}`, request.url));
  }

  // 2. Si ya está autenticado e intenta ingresar a /login: redirigir al portal de gestión
  if (pathname === '/login' && token) {
    const defaultUrl = new URL('/gestion', request.url);
    return NextResponse.redirect(defaultUrl);
  }

  // 3. Si es ruta pública, permitir el paso sin importar el estado de sesión
  if (esRutaPublica(pathname)) {
    return NextResponse.next();
  }

  // 4. Todo el resto del sistema exige sesión: Si no hay token de autenticación, redirigir a login
  if (!token) {
    const returnUrl = encodeURIComponent(pathname + search);
    const loginUrl = new URL(`/login?returnUrl=${returnUrl}`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 5. Si está autenticado pero accede a una ruta operativa heredada sin prefijo /gestion, redirigir al canónico
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/centro-incidentes') ||
    pathname.startsWith('/callcenter') ||
    pathname.startsWith('/asistente-social') ||
    pathname.startsWith('/dashboard')
  ) {
    const canonicalUrl = new URL(`/gestion${pathname}${search}`, request.url);
    return NextResponse.redirect(canonicalUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Interceptar todas las rutas excepto:
     * - API routes (/api/*)
     * - Archivos internos de Next.js (_next/static, _next/image)
     * - Archivos estáticos con extensión (favicon.ico, imágenes, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
