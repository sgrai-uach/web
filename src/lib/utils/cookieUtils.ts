/**
 * Utilidades para la gestión segura de cookies de autenticación de sgrai-web.
 * Almacena el token JWT de sesión con SameSite=Lax y path=/.
 */

export const AUTH_COOKIE_NAME = 'sgrai_auth_token';

/**
 * Guarda el token de sesión en document.cookie.
 * @param token Token JWT retornado por la API
 * @param expiraEn Fecha de expiración en formato ISO string (opcional)
 */
export function setAuthCookie(token: string, expiraEn?: string): void {
  if (typeof document === 'undefined') return;

  let cookieString = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; SameSite=Lax`;

  if (expiraEn) {
    const expireDate = new Date(expiraEn);
    if (!isNaN(expireDate.getTime())) {
      cookieString += `; expires=${expireDate.toUTCString()}`;
    }
  }

  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    cookieString += '; Secure';
  }

  document.cookie = cookieString;
}

/**
 * Obtiene el token de autenticación desde document.cookie.
 * @returns El token JWT o null si no existe
 */
export function getAuthCookie(): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith(`${AUTH_COOKIE_NAME}=`)) {
      const value = trimmed.slice(AUTH_COOKIE_NAME.length + 1);
      return decodeURIComponent(value);
    }
  }

  return null;
}

/**
 * Elimina la cookie de autenticación fijando max-age=0.
 */
export function removeAuthCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}
