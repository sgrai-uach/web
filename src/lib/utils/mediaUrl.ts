/**
 * Resuelve la URL pública de un adjunto multimedia contra `NEXT_PUBLIC_API_URL`
 * cuando está configurada, o conserva rutas relativas `/uploads/...` para mismo origen
 * / rewrite de Next.js sin forzar `http://localhost:3000` (BUG-H43-WEB-02).
 */
export function resolverUrlEvidencia(url: string): string {
  if (!url) return '';
  const limpia = url.trim();
  if (!limpia) return '';

  if (
    limpia.startsWith('http://') ||
    limpia.startsWith('https://') ||
    limpia.startsWith('blob:') ||
    limpia.startsWith('data:')
  ) {
    return limpia;
  }

  const rel = limpia.startsWith('/') ? limpia : `/${limpia}`;
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || '').trim().replace(/\/+$/, '');
  if (!apiBase) {
    return rel;
  }
  return `${apiBase}${rel}`;
}
