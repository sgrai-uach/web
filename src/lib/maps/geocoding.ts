export interface Coordenadas {
  latitud: number;
  longitud: number;
}

// Coordenadas base de sectores y avenidas representativas de Valdivia para resolución instantánea
const REFERENCIAS_VALDIVIA: Record<string, Coordenadas> = {
  centro: { latitud: -39.81422, longitud: -73.24589 },
  picarte: { latitud: -39.8256, longitud: -73.2321 },
  alemania: { latitud: -39.8175, longitud: -73.2412 },
  teja: { latitud: -39.8089, longitud: -73.2534 },
  niebla: { latitud: -39.8667, longitud: -73.3986 },
  collico: { latitud: -39.8055, longitud: -73.2189 },
  animas: { latitud: -39.7995, longitud: -73.2356 },
  corvi: { latitud: -39.8312, longitud: -73.2285 },
  angachilla: { latitud: -39.8456, longitud: -73.2398 },
  costanera: { latitud: -39.8122, longitud: -73.2485 },
  ercilla: { latitud: -39.8221, longitud: -73.2388 },
  arauco: { latitud: -39.8164, longitud: -73.2443 },
  bueras: { latitud: -39.8198, longitud: -73.2435 },
  francia: { latitud: -39.8335, longitud: -73.2302 },
};

function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Resuelve una dirección escrita a coordenadas geográficas en Valdivia.
 * 1. Primero busca coincidencias con avenidas/sectores clave (resolución instantánea y offline).
 * 2. Si no coincide, consulta OpenStreetMap Nominatim con timeout de 2.5s acotado a Valdivia, Chile.
 */
export async function geocodificarDireccionEnValdivia(
  direccion: string
): Promise<Coordenadas | null> {
  const direccionLimpia = normalizarTexto(direccion);
  if (direccionLimpia.length < 3) return null;

  // 1. Detección rápida por sectores de Valdivia
  for (const [clave, coord] of Object.entries(REFERENCIAS_VALDIVIA)) {
    if (direccionLimpia.includes(clave)) {
      return coord;
    }
  }

  // 2. Consulta a OpenStreetMap Nominatim
  try {
    const query = `${direccion}, Valdivia, Region de Los Rios, Chile`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&limit=1&countrycodes=cl`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'es',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = (await res.json()) as Array<{ lat: string; lon: string }>;
      if (data && data.length > 0 && data[0].lat && data[0].lon) {
        return {
          latitud: parseFloat(parseFloat(data[0].lat).toFixed(5)),
          longitud: parseFloat(parseFloat(data[0].lon).toFixed(5)),
        };
      }
    }
  } catch {
    // Si falla la red o timeout, retorna centro de Valdivia como fallback
  }

  return REFERENCIAS_VALDIVIA.centro;
}
