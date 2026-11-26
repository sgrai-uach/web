/**
 * Resuelve de forma segura la URL de una evidencia multimedia proveniente de sgrai-api.
 *
 * - Permite URLs absolutas únicamente con protocolo http:// o https://.
 * - Preserva rutas relativas (/uploads/...) cuando NEXT_PUBLIC_API_URL no está configurada,
 *   garantizando compatibilidad con Caddy en producción y rewrites en desarrollo.
 * - Bloquea esquemas no permitidos (javascript:, data:, vbscript:, etc.).
 */
export function resolverUrlEvidencia(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  const limpia = url.trim();
  if (!limpia) return '';

  if (/^https?:\/\//i.test(limpia)) {
    return limpia;
  }

  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/i.test(limpia)) {
    return '';
  }

  const rutaNormalizada = limpia.startsWith('/') ? limpia : `/${limpia}`;
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || '').trim().replace(/\/+$/, '');

  return apiBase ? `${apiBase}${rutaNormalizada}` : rutaNormalizada;
}

