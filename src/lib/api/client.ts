/**
 * Cliente tipado para consumir sgrai-api.
 *
 * Usa openapi-fetch con los tipos generados desde el spec OpenAPI.
 * Ver GEMINI.md § 4 para la guía de consumo de la API.
 */

import createClient from 'openapi-fetch';
import type { paths } from '@/types/api-generated';

const apiClient = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
});

export default apiClient;
