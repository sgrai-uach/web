/**
 * Cliente tipado para consumir sgrai-api.
 *
 * Usa openapi-fetch con los tipos generados desde el spec OpenAPI.
 * Ver GEMINI.md § 4 para la guía de consumo de la API.
 */

import createClient from 'openapi-fetch';
import type { paths } from '@/types/api-generated';

/**
  * En el navegador usamos rutas relativas ("") para pasar por el proxy rewrites de Next.js.
  * Esto elimina las restricciones de CORS al ser peticiones same-origin (puerto 3000).
  * En el servidor (SSR / SSG) usamos la URL absoluta hacia sgrai-api.
  */
const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return '';
  }
  return (
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3001'
  );
};

const apiClient = createClient<paths>({
  baseUrl: getBaseUrl(),
});

export default apiClient;

