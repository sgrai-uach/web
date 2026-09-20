/**
 * Cliente tipado para consumir sgrai-api.
 *
 * Usa openapi-fetch con los tipos generados desde el spec OpenAPI.
 * Ver GEMINI.md § 4 para la guía de consumo de la API.
 */

import createClient from 'openapi-fetch';
import type { paths } from '@/types/api-generated';

export const DEFAULT_ADMIN_USER_ID =
  process.env.NEXT_PUBLIC_DEFAULT_ADMIN_USER_ID || '00000000-0000-4000-8000-000000000001';

const apiClient = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'X-User-Id': DEFAULT_ADMIN_USER_ID,
  },
});

export default apiClient;
