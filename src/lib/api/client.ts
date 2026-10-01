/**
 * Cliente tipado para consumir sgrai-api.
 *
 * Usa openapi-fetch con los tipos generados desde el spec OpenAPI.
 * Inyecta dinámicamente el token JWT de sesión desde la cookie segura 'sgrai_auth_token'.
 */

import createClient from 'openapi-fetch';
import type { paths } from '@/types/api-generated';
import { getAuthCookie, removeAuthCookie } from '@/lib/utils/cookieUtils';

export const DEFAULT_ADMIN_USER_ID =
  process.env.NEXT_PUBLIC_DEFAULT_ADMIN_USER_ID || '00000000-0000-4000-8000-000000000001';

export function handleUnauthorizedSession() {
  if (typeof window === 'undefined') return;
  removeAuthCookie();
  if (!window.location.pathname.startsWith('/login')) {
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    try {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`/login?motivo=sesion_expirada&returnUrl=${returnUrl}`);
    } catch {
      // Ignorar excepciones en entornos de prueba jsdom
    }
  }
}

const apiClient = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
});

apiClient.use({
  async onRequest({ request }) {
    const token = getAuthCookie();
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }
    return request;
  },
  async onResponse({ response }) {
    if (response.status === 401) {
      handleUnauthorizedSession();
    }
    return response;
  },
});

export default apiClient;
