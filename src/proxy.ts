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
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/recuperar-contrasena' ||
    pathname === '/restablecer-contrasena' ||
    pathname === '/ciudadania'
  ) {
    return true;
  }
  if (pathname.startsWith('/ciudadania/')) {
    return true;
  }
  // Rutas de infraestructura pública de la PWA de terreno
  if (
    pathname === '/terreno/manifest.webmanifest' ||
    pathname === '/terreno/site.webmanifest' ||
    pathname === '/terreno/sw.js' ||
    pathname === '/terreno/favicon.ico' ||
    pathname.endsWith('.webmanifest') ||
    (pathname.startsWith('/terreno/') && (
      pathname.endsWith('.png') ||
      pathname.endsWith('.ico') ||
      pathname.endsWith('.json')
    ))
  ) {
    return true;
  }
  return false;
}

export function obtenerRolDesdeToken(token?: string): string | null {
  if (!token) return null;
  try {
    const partes = token.split('.');
    if (partes.length < 2) return null;
    const base64Url = partes[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const jsonPayload = atob(padded);
    const parsed = JSON.parse(jsonPayload) as { rolCodigo?: unknown };
    return typeof parsed.rolCodigo === 'string' ? parsed.rolCodigo.trim().toUpperCase() : null;
  } catch {
    return null;
  }
}

export function esRolDeTerreno(rolCodigo: string | null): boolean {
  if (!rolCodigo) return false;
  return (
    rolCodigo === 'PATRULLA_VERIFICADORA' ||
    rolCodigo === 'PATRULLA' ||
    rolCodigo === 'DELEGADO_CUADRILLA' ||
    rolCodigo === 'CUADRILLA'
  );
}

export function proxy(request: NextRequest) {
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

  // 2. Si ya está autenticado e intenta ingresar a /login:
  // Si su rol pertenece a Terreno (Patrulla o Cuadrilla) o viene con returnUrl=/terreno,
  // redirigir al entorno de terreno (/terreno); en caso contrario, redirigir a /gestion.
  if (pathname === '/login' && token) {
    const returnUrl = request.nextUrl.searchParams.get('returnUrl');
    const rolCodigo = obtenerRolDesdeToken(token);

    if (esRolDeTerreno(rolCodigo)) {
      if (returnUrl && returnUrl.startsWith('/terreno')) {
        return NextResponse.redirect(new URL(returnUrl, request.url));
      }
      return NextResponse.redirect(new URL('/terreno', request.url));
    }

    if (returnUrl && returnUrl.startsWith('/terreno')) {
      return NextResponse.redirect(new URL(returnUrl, request.url));
    }
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

  // 5. Si el usuario autenticado tiene un rol exclusivo de terreno e intenta ingresar a /gestion, redirigir a /terreno
  if (pathname === '/gestion' || pathname.startsWith('/gestion/')) {
    const rolCodigo = obtenerRolDesdeToken(token);
    if (esRolDeTerreno(rolCodigo)) {
      return NextResponse.redirect(new URL('/terreno', request.url));
    }
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
