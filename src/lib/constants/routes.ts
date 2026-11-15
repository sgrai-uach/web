/**
 * Rutas canónicas del sistema SGRAI.
 *
 * Centraliza los destinos de navegación institutional para evitar rutas
 * inexistentes (HTTP 404) y duplicación de literales en los módulos.
 */

/** Panel de gestión (oficina). Destino por defecto tras autenticarse. */
export const RUTA_INICIO_GESTION = '/gestion';

/** Portal de terreno (PWA móvil). */
export const RUTA_INICIO_TERRENO = '/terreno';

/** Listado de misiones de patrulla en terreno. */
export const RUTA_TERRENO_PATRULLA = '/terreno/patrulla/misiones';

/** Listado de misiones de cuadrilla en terreno. */
export const RUTA_TERRENO_CUADRILLA = '/terreno/cuadrilla/misiones';
